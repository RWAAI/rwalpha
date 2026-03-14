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
} from "./db";

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

    // ── CSV Bulk Import: NAV History ─────────────────────────────
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

    // ── Dividend Records ─────────────────────────────────────────
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

    // ── CSV Bulk Import: Dividend Records ────────────────────────
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

    // ── AI Signals ───────────────────────────────────────────────
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

    // ── Rebalance Logs ───────────────────────────────────────────
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

    // ── Vault Summary (聚合接口，供 VaultApp 页面使用) ────────────
    getSummary: publicProcedure.query(async () => {
      const [navRecords, divRecords, aiSignal, rebalanceLogRecords] = await Promise.all([
        getNavHistory(90),
        getDividendRecords(52),
        getLatestAiSignal(),
        getRebalanceLogs(10),
      ]);

      // 最新 NAV
      const latestNav = navRecords.length > 0 ? navRecords[0] : null;
      const prevNav = navRecords.length > 1 ? navRecords[1] : null;

      // 24H 变动（与前一天对比）
      const nav24hChange = latestNav && prevNav
        ? (((parseFloat(latestNav.navValue) - parseFloat(prevNav.navValue)) / parseFloat(prevNav.navValue)) * 100)
        : 0;

      // 最新 NVDY 派息（Weekly）
      const nvdyDividends = divRecords.filter(d => d.ticker === 'NVDY');
      const latestNvdyDiv = nvdyDividends.length > 0 ? nvdyDividends[0] : null;

      // 最新 QQQI 派息（Monthly）
      const qqqiDividends = divRecords.filter(d => d.ticker === 'QQQI');
      const latestQqqiDiv = qqqiDividends.length > 0 ? qqqiDividends[0] : null;

      // NAV 走势图数据（最近 30 条，倒序 -> 正序）
      const navTrend = [...navRecords].reverse().slice(-30).map(r => ({
        date: r.date,
        value: parseFloat(r.navValue),
      }));

      // 年化总回报（使用最新记录的 totalReturn 字段，或从 NAV 计算）
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
});

export type AppRouter = typeof appRouter;
