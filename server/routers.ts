import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getNavHistory,
  insertNavHistory,
  deleteNavHistory,
  bulkInsertNavHistory,
  getDividendRecords,
  insertDividendRecord,
  deleteDividendRecord,
  bulkInsertDividendRecords,
  getLatestAiSignal,
  insertAiSignal,
  getRebalanceLogs,
  insertRebalanceLog,
  deleteRebalanceLog,
  getAllPortfolios,
  getPortfolioById,
  insertPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "./db";
import { callDataApi } from "./_core/dataApi";
import { invokeLLM } from "./_core/llm";
import { execSync } from "child_process";
import path from "path";

// ─── yfinance AUM + Description + Returns Helper ────────────────────────────
function fetchYfinanceInfo(tickers: string[]): Record<string, { aum: number | null; aumDisplay: string; description: string; oneYearReturn: number | null; annualVolatility: number | null }> {
  try {
    const scriptPath = path.join(process.cwd(), "server", "get_ticker_info.py");
    // Clear PYTHONPATH/PYTHONHOME to avoid Python 3.13 vs 3.11 version conflicts
    const cleanEnv = { ...process.env };
    delete cleanEnv.PYTHONPATH;
    delete cleanEnv.PYTHONHOME;
    delete cleanEnv.NUITKA_PYTHONPATH;
    // Use Python 3.13 venv to match PYTHONHOME set by the Manus sandbox runtime
    const python3Bin = "/opt/.manus/.sandbox-runtime/.venv/bin/python3";
    const output = execSync(`${python3Bin} ${scriptPath} ${tickers.join(" ")}`, { timeout: 30000, env: cleanEnv }).toString().trim();
    const parsed = JSON.parse(output);
    return parsed;
  } catch (e) {
    console.error("[fetchYfinanceInfo] Error:", e);
    return {};
  }
}

// ─── ETF Market Data Helper ───────────────────────────────────────────────────
async function fetchTickerData(ticker: string) {
  try {
    const result = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: ticker,
        region: "US",
        interval: "1d",
        range: "1y",
        events: "div,split",
      },
    }) as any;

    const chartResult = result?.chart?.result?.[0];
    if (!chartResult) return null;

    const meta = chartResult.meta;
    const price = meta.regularMarketPrice ?? 0;
    const longName = meta.longName || meta.shortName || ticker;

    // TTM dividend yield
    const events = chartResult.events ?? {};
    const divs = events.dividends ?? {};
    const nowTs = Date.now() / 1000;
    const oneYearAgo = nowTs - 365 * 86400;
    const ttmDivs = Object.values(divs as Record<string, { amount: number; date: number }>)
      .filter((d) => d.date > oneYearAgo)
      .map((d) => d.amount);
    const ttmTotal = ttmDivs.reduce((a, b) => a + b, 0);
    const dividendYield = price > 0 ? (ttmTotal / price) * 100 : 0;

    // Determine dividend frequency from number of dividends
    let frequency = "None";
    if (ttmDivs.length >= 48) frequency = "Weekly";
    else if (ttmDivs.length >= 11) frequency = "Monthly";
    else if (ttmDivs.length >= 3) frequency = "Quarterly";
    else if (ttmDivs.length >= 1) frequency = "Annual";

    // Always call yfinance for: AUM, description, AND dividend-adjusted 1-year total return
    // This is critical for high-yield ETFs like NVDY/QQQI where raw price return is misleading
    // (e.g. NVDY price -22% but total return +45% after including 73% dividend yield)
    let aumDisplay = "N/A";
    let description = "";
    let oneYearReturn = 0;
    let annualVolatility = 0;
    try {
      const yInfo = fetchYfinanceInfo([ticker]);
      const info = yInfo[ticker.toUpperCase()] || yInfo[ticker];
      if (info) {
        aumDisplay = info.aumDisplay || "N/A";
        description = info.description || "";
        // Use dividend-adjusted total return from yfinance (auto_adjust=True)
        if (info.oneYearReturn != null) oneYearReturn = info.oneYearReturn;
        if (info.annualVolatility != null) annualVolatility = info.annualVolatility;
      }
    } catch (_) {
      // Fallback to raw price return from chart data if yfinance fails
      const quotes = chartResult.indicators?.quote?.[0] ?? {};
      const closes = (quotes.close ?? []).filter((c: number | null) => c !== null) as number[];
      oneYearReturn = closes.length >= 2
        ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100
        : 0;
      if (closes.length > 20) {
        const dailyReturns = closes.slice(1).map((c: number, i: number) => (c - closes[i]) / closes[i]);
        const mean = dailyReturns.reduce((a: number, b: number) => a + b, 0) / dailyReturns.length;
        const variance = dailyReturns.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / dailyReturns.length;
        annualVolatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
      }
    }

    // Recent dividends for monthly schedule
    const recentDivs = Object.values(divs as Record<string, { amount: number; date: number }>)
      .sort((a, b) => b.date - a.date)
      .slice(0, 12)
      .map((d) => ({
        date: new Date(d.date * 1000).toISOString().slice(0, 10),
        amount: d.amount,
      }));

    return {
      ticker: ticker.toUpperCase(),
      name: longName,
      price,
      dividendYield: parseFloat(dividendYield.toFixed(2)),
      ttmDividendPerShare: parseFloat(ttmTotal.toFixed(4)),
      frequency,
      oneYearReturn: parseFloat(oneYearReturn.toFixed(2)),
      annualVolatility: parseFloat(annualVolatility.toFixed(2)),
      aumDisplay,
      description,
      recentDivs,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    };
  } catch (err) {
    console.error(`[fetchTickerData] Error for ${ticker}:`, err);
    return null;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  vault: router({
    // ── NAV History ──────────────────────────────────────────────
    getNavHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(365).optional() }).optional())
      .query(async ({ input }) => getNavHistory(input?.limit ?? 90)),

    addNavHistory: protectedProcedure
      .input(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        navValue: z.string(),
        totalReturn: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertNavHistory(input);
        return { success: true };
      }),

    deleteNavHistory: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNavHistory(input.id);
        return { success: true };
      }),

    bulkImportNavHistory: protectedProcedure
      .input(z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        navValue: z.string(),
        totalReturn: z.string().optional(),
      })).min(1).max(1000))
      .mutation(async ({ input }) => {
        const count = await bulkInsertNavHistory(input);
        return { success: true, count };
      }),

    getDividendRecords: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(200).optional() }).optional())
      .query(async ({ input }) => getDividendRecords(input?.limit ?? 52)),

    addDividendRecord: protectedProcedure
      .input(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ticker: z.string().max(16),
        amountPerUnit: z.string(),
        totalAmount: z.string().optional(),
        frequency: z.string().max(16),
      }))
      .mutation(async ({ input }) => {
        await insertDividendRecord(input);
        return { success: true };
      }),

    deleteDividendRecord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDividendRecord(input.id);
        return { success: true };
      }),

    bulkImportDividendRecords: protectedProcedure
      .input(z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ticker: z.string().max(16),
        amountPerUnit: z.string(),
        totalAmount: z.string().optional(),
        frequency: z.string().max(16),
      })).min(1).max(1000))
      .mutation(async ({ input }) => {
        const count = await bulkInsertDividendRecords(input);
        return { success: true, count };
      }),

    getLatestAiSignal: publicProcedure.query(async () => getLatestAiSignal()),

    addAiSignal: protectedProcedure
      .input(z.object({
        signalDate: z.date(),
        marketSentiment: z.string().optional(),
        nvdyVolRisk: z.string().optional(),
        qqqiPremium: z.string().optional(),
        qqqmVgtMomentum: z.string().optional(),
        rebalanceSignal: z.string().optional(),
        rawJson: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertAiSignal(input);
        return { success: true };
      }),

    getRebalanceLogs: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
      .query(async ({ input }) => getRebalanceLogs(input?.limit ?? 20)),

    addRebalanceLog: protectedProcedure
      .input(z.object({
        actionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        icon: z.string().optional(),
        action: z.string(),
        tag: z.string().max(32),
        tagEn: z.string().max(32).optional(),
        actionEn: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertRebalanceLog(input);
        return { success: true };
      }),

    deleteRebalanceLog: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteRebalanceLog(input.id);
        return { success: true };
      }),

    getSummary: publicProcedure.query(async () => {
      const [navRecords, divRecords, aiSignal, rebalanceLogRecords] = await Promise.all([
        getNavHistory(90),
        getDividendRecords(52),
        getLatestAiSignal(),
        getRebalanceLogs(10),
      ]);

      const latestNav = navRecords.length > 0 ? navRecords[0] : null;
      const prevNav = navRecords.length > 1 ? navRecords[1] : null;

      const nav24hChange = latestNav && prevNav
        ? (((parseFloat(latestNav.navValue) - parseFloat(prevNav.navValue)) / parseFloat(prevNav.navValue)) * 100)
        : 0;

      const nvdyDividends = divRecords.filter(d => d.ticker === 'NVDY');
      const latestNvdyDiv = nvdyDividends.length > 0 ? nvdyDividends[0] : null;

      const qqqiDividends = divRecords.filter(d => d.ticker === 'QQQI');
      const latestQqqiDiv = qqqiDividends.length > 0 ? qqqiDividends[0] : null;

      const navTrend = [...navRecords].reverse().slice(-30).map(r => ({
        date: r.date,
        value: parseFloat(r.navValue),
      }));

      const annualTotalReturn = latestNav?.totalReturn
        ? parseFloat(latestNav.totalReturn)
        : latestNav
          ? ((parseFloat(latestNav.navValue) - 100) / 100) * 100
          : 0;

      return {
        nav: latestNav ? parseFloat(latestNav.navValue) : null,
        navDate: latestNav?.date ?? null,
        nav24hChange: parseFloat(nav24hChange.toFixed(2)),
        annualTotalReturn: parseFloat(annualTotalReturn.toFixed(2)),
        navTrend,
        latestNvdyDiv: latestNvdyDiv ? {
          date: latestNvdyDiv.date,
          amountPerUnit: parseFloat(latestNvdyDiv.amountPerUnit),
          totalAmount: latestNvdyDiv.totalAmount ? parseFloat(latestNvdyDiv.totalAmount) : null,
        } : null,
        latestQqqiDiv: latestQqqiDiv ? {
          date: latestQqqiDiv.date,
          amountPerUnit: parseFloat(latestQqqiDiv.amountPerUnit),
          totalAmount: latestQqqiDiv.totalAmount ? parseFloat(latestQqqiDiv.totalAmount) : null,
        } : null,
        aiSignal: aiSignal ? {
          signalDate: aiSignal.signalDate,
          marketSentiment: aiSignal.marketSentiment,
          nvdyVolRisk: aiSignal.nvdyVolRisk,
          qqqiPremium: aiSignal.qqqiPremium,
          qqqmVgtMomentum: aiSignal.qqqmVgtMomentum,
          rebalanceSignal: aiSignal.rebalanceSignal,
        } : null,
        rebalanceLogs: rebalanceLogRecords.map(l => ({
          id: l.id,
          actionDate: l.actionDate,
          icon: l.icon,
          action: l.action,
          actionEn: l.actionEn,
          tag: l.tag,
          tagEn: l.tagEn,
        })),
        hasData: navRecords.length > 0,
      };
    }),
  }),

  // ─── Portfolio Router ────────────────────────────────────────────────────────
  portfolio: router({
    // 获取所有组合
    list: publicProcedure.query(async () => {
      const rows = await getAllPortfolios();
      return rows.map(r => ({
        ...r,
        tickers: JSON.parse(r.tickers || '[]'),
        cachedData: r.cachedData ? JSON.parse(r.cachedData) : null,
      }));
    }),

    // 获取单个组合
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const row = await getPortfolioById(input.id);
        if (!row) return null;
        return {
          ...row,
          tickers: JSON.parse(row.tickers || '[]'),
          cachedData: row.cachedData ? JSON.parse(row.cachedData) : null,
        };
      }),

    // 创建组合
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(64),
        description: z.string().optional(),
        tickers: z.array(z.object({
          ticker: z.string().min(1).max(16),
          weight: z.number().min(0).max(1),
        })).min(1).max(10),
      }))
      .mutation(async ({ input }) => {
        await insertPortfolio({
          name: input.name,
          description: input.description ?? null,
          tickers: JSON.stringify(input.tickers),
        });
        return { success: true };
      }),

    // 更新组合
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(64).optional(),
        description: z.string().optional(),
        tickers: z.array(z.object({
          ticker: z.string().min(1).max(16),
          weight: z.number().min(0).max(1),
        })).min(1).max(10).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, tickers, ...rest } = input;
        await updatePortfolio(id, {
          ...rest,
          ...(tickers ? {
            tickers: JSON.stringify(tickers),
            // Clear stale cache whenever tickers change
            cachedData: null,
            cachedAt: null,
          } : {}),
        });
        return { success: true };
      }),

    // 删除组合
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePortfolio(input.id);
        return { success: true };
      }),

    // 获取组合的实时市场数据（并缓存）
    fetchMarketData: publicProcedure
      .input(z.object({
        id: z.number(),
        forceRefresh: z.boolean().optional(),
        // Optional: pass tickers directly to avoid race condition after update
        tickers: z.array(z.object({
          ticker: z.string().min(1).max(16),
          weight: z.number().min(0).max(1),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const row = await getPortfolioById(input.id);
        if (!row) throw new Error("Portfolio not found");

        // Check cache (1 hour) — skip if tickers are explicitly passed (post-edit refresh)
        const cacheAge = row.cachedAt
          ? Date.now() - new Date(row.cachedAt).getTime()
          : Infinity;
        const ONE_HOUR = 60 * 60 * 1000;

        if (!input.forceRefresh && !input.tickers && cacheAge < ONE_HOUR && row.cachedData) {
          return JSON.parse(row.cachedData);
        }

        // Use explicitly passed tickers (post-edit) or fall back to DB value
        const tickers: { ticker: string; weight: number }[] =
          input.tickers ?? JSON.parse(row.tickers || '[]');

        // Fetch data for all tickers in parallel
        const results = await Promise.all(
          tickers.map(async (t) => {
            const data = await fetchTickerData(t.ticker);
            return { ...t, marketData: data };
          })
        );

        // Calculate portfolio-level metrics
        const validResults = results.filter(r => r.marketData !== null);
        const totalWeight = validResults.reduce((a, b) => a + b.weight, 0);

        let weightedYield = 0;
        let weightedReturn = 0;
        let weightedVolatility = 0;

        for (const r of validResults) {
          const w = totalWeight > 0 ? r.weight / totalWeight : 1 / validResults.length;
          weightedYield += w * (r.marketData!.dividendYield ?? 0);
          weightedReturn += w * (r.marketData!.oneYearReturn ?? 0);
          weightedVolatility += w * (r.marketData!.annualVolatility ?? 0);
        }

        // Monthly dividend schedule: aggregate by month
        const monthlyMap: Record<string, number> = {};
        for (const r of validResults) {
          const w = totalWeight > 0 ? r.weight / totalWeight : 1 / validResults.length;
          for (const div of (r.marketData?.recentDivs ?? [])) {
            const month = div.date.slice(0, 7);
            monthlyMap[month] = (monthlyMap[month] ?? 0) + div.amount * w;
          }
        }
        const monthlySchedule = Object.entries(monthlyMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(4)) }));

        const portfolioData = {
          portfolioId: input.id,
          fetchedAt: new Date().toISOString(),
          weightedYield: parseFloat(weightedYield.toFixed(2)),
          weightedReturn: parseFloat(weightedReturn.toFixed(2)),
          weightedVolatility: parseFloat(weightedVolatility.toFixed(2)),
          monthlySchedule,
          holdings: results.map(r => ({
            ticker: r.ticker,
            weight: r.weight,
            marketData: r.marketData,
          })),
        };

        // Cache the result
        await updatePortfolio(input.id, {
          cachedData: JSON.stringify(portfolioData),
          cachedAt: new Date(),
        });

        return portfolioData;
      }),
  }),

  // ─── AI Advisor Router ───────────────────────────────────────────────────────
  aiAdvisor: router({
    // 生成 AI 调仓建议
    getRebalanceSuggestion: publicProcedure
      .input(z.object({
        portfolioId: z.number(),
        lang: z.enum(['zh', 'en']).optional().default('zh'),
      }))
      .mutation(async ({ input }) => {
        const row = await getPortfolioById(input.portfolioId);
        if (!row) throw new Error("Portfolio not found");

        const tickers: { ticker: string; weight: number }[] = JSON.parse(row.tickers || '[]');
        const cachedData = row.cachedData ? JSON.parse(row.cachedData) : null;

        // Build context for LLM
        const holdingsContext = tickers.map(t => {
          const holding = cachedData?.holdings?.find((h: any) => h.ticker === t.ticker);
          const md = holding?.marketData;
          return md
            ? `${t.ticker} (weight: ${(t.weight * 100).toFixed(0)}%): yield=${md.dividendYield}%, 1y-return=${md.oneYearReturn}%, volatility=${md.annualVolatility}%, freq=${md.frequency}`
            : `${t.ticker} (weight: ${(t.weight * 100).toFixed(0)}%): no market data`;
        }).join('\n');

        const isZh = input.lang === 'zh';
        const systemPrompt = isZh
          ? `你是一位专业的 ETF 投资组合顾问，专注于高收益 ETF 和指数 ETF 的组合优化。请根据用户提供的持仓数据，给出简洁、专业的调仓建议。回复格式：1) 整体评估（2-3句），2) 具体调仓建议（每个持仓一条），3) 风险提示（1-2句）。`
          : `You are a professional ETF portfolio advisor specializing in high-yield ETF and index ETF optimization. Based on the portfolio data provided, give concise, professional rebalancing suggestions. Format: 1) Overall assessment (2-3 sentences), 2) Specific suggestions per holding, 3) Risk note (1-2 sentences).`;

        const userPrompt = isZh
          ? `请分析以下 ETF 组合并给出调仓建议：\n\n组合名称：${row.name}\n\n持仓明细：\n${holdingsContext}\n\n加权派息率：${cachedData?.weightedYield ?? 'N/A'}%\n加权1年回报：${cachedData?.weightedReturn ?? 'N/A'}%\n加权波动率：${cachedData?.weightedVolatility ?? 'N/A'}%`
          : `Please analyze the following ETF portfolio and provide rebalancing suggestions:\n\nPortfolio: ${row.name}\n\nHoldings:\n${holdingsContext}\n\nWeighted Yield: ${cachedData?.weightedYield ?? 'N/A'}%\nWeighted 1Y Return: ${cachedData?.weightedReturn ?? 'N/A'}%\nWeighted Volatility: ${cachedData?.weightedVolatility ?? 'N/A'}%`;

        const llmResult = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          maxTokens: 1024,
        });

        const suggestion = llmResult.choices?.[0]?.message?.content ?? '';
        return {
          suggestion: typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion),
          generatedAt: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
