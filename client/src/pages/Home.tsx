import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, Calendar, AlertTriangle, ShieldCheck, DollarSign, ArrowRight, Zap, Layers, Sun, Moon, BrainCircuit, Activity, Eye, Cpu, CheckCircle2, BarChart2 } from 'lucide-react';

// ─── i18n ────────────────────────────────────────────────────────────────────
const i18n = {
  zh: {
    vaultTitle: 'RWAlpha 指数旗舰金库',
    vaultSub: 'AI 驱动调仓 · 每周现金派息 · 指数底仓增值',
    aiEnabled: 'AI 赋能',
    principal: '本金计算器',
    annualYield: '年度净派息率',
    yieldTarget: (excess: string) => `目标: 18.00% | 超额: +${excess}%`,
    mgmtFeeNote: '已扣除 0.80% 管理费',
    navTitle: '金库 NAV',
    navSince: '成立以来 · 基准 $100',
    navReturn: (r: string) => `净回报 +${r}%`,
    navFeeNote: '已扣除 0.80%/年管理费',
    navDate: '截至 2026-03-14',
    navExpenseLabel: '管理费率',
    navExpenseValue: '0.80% / 年',
    navEtfFeeLabel: '底层 ETF 加权费率',
    navEtfFeeValue: '0.51% / 年（内含）',
    weeklyIncome: '平均每周到账',
    annualEst: (v: string) => `预计年收息: $${v}`,
    totalReturn: '年化总回报',
    navNote: '包含 NAV 增长 + 现金派息',
    cashflowTitle: '现金流周历 (月度模拟)',
    week: (n: number) => `第 ${n} 周`,
    nvdyDist: 'NVDY 派息',
    nvdyQqqiDist: 'NVDY + QQQI 派息',
    cashflowNote: '前三周仅 NVDY，第四周叠加 QQQI。',
    volatility: '波动率: 低',
    allocationTitle: '资产配比 (NAV)',
    aiAdjustedLabel: 'AI 调仓后',
    tableTitle: '资产清单与派息频率',
    dataUpdated: '数据最后更新: 2026-03-14',
    aumSource: 'AUM 来源: TradingView',
    colTicker: '代码',
    colAum: 'AUM（美元）',
    colYield: '派息率',
    colReturn: '总回报',
    colFreq: '频率',
    colWeekly: '周到账 (预计)',
    colAiAdj: '本周 AI 调仓',
    weightLabel: '占比',
    aiSignalTitle: 'AI 市场信号',
    liveMonitor: '实时监控中',
    signalUpdated: '信号更新于 2026-03-14 22:00 · 下次更新 23:00',
    signals: [
      { label: '市场情绪', value: '谨慎偏多' },
      { label: 'NVDY 波动风险', value: '中等' },
      { label: 'QQQI 期权溢价', value: '偏高' },
      { label: 'QQQM/VGT 动量', value: '偏强' },
      { label: '建议调仓方向', value: '维持当前配比' },
    ],
    aiLogTitle: 'AI 调仓日志',
    logs: [
      { date: '2026-03-10', icon: '⚖️', action: 'NVDY 波动率上升，权重 22% → 18%，差额补入 QQQM', tag: '调仓' },
      { date: '2026-03-07', icon: '💰', action: '本周派息 $283，AI 自动将 60% 再投入 QQQI', tag: '再投资' },
      { date: '2026-03-03', icon: '📊', action: '期权溢价回升至历史均值 +1σ，NVDY 权重恢复至 20%', tag: '调仓' },
      { date: '2026-02-24', icon: '🛡️', action: '市场波动加剧，临时将 VGT 权重上调 2%，增强防御', tag: '风控' },
    ],
    logTags: { '调仓': '调仓', '再投资': '再投资', '风控': '风控' },
    aiHowTitle: 'AI 如何工作',
    aiSteps: [
      { step: '01', title: '实时监控', desc: '持续追踪 NVDY/QQQI 隐含波动率与期权溢价，同步监控 QQQM/VGT 动量信号及全组合相关性变化', items: ['NVDY & QQQI IV 波动率', 'QQQM/VGT 动量指数', '全组合相关性矩阵'] },
      { step: '02', title: '智能判断', desc: '当任一持仓指标偏离阈值时触发调仓信号，综合四个资产的历史数据评估最优配比', items: ['NVDY 波动率超阈值触发', 'QQQI 溢价偏离均值', 'QQQM/VGT 动量反转检测'] },
      { step: '03', title: '自动执行', desc: '在风控框架内自动调整 NVDY/QQQI/QQQM/VGT 四个资产权重，并将派息收益按策略再分配', items: ['四资产仓位自动再平衡', '派息智能再投资', '风控边界强制执行'] },
    ],
    fn1: { strong: '提示：', text: '本测算基于历史派息水平。NVDY 属于备兑期权 ETF，其分红受英伟达股价波动影响较大，金额并非固定。建议将多出的现金流用于再投资以抵御潜在净值侵蚀。' },
    fn2: { strong: '风控：', text: '50% 底仓（QQQM+VGT）不参与期权卖出，保留了核心资产的上涨潜力，使组合更具韧性。' },
    sellingPoints: [
      { title: '每周派息',     desc: 'NVDY 每周到账，现金流稳定不间断' },
      { title: '指数底仓',     desc: '50% QQQM+VGT 底仓保留核心资产上涨潜力' },
      { title: 'AI 驱动调仓', desc: 'AI 实时监控市场，自动优化仓位与再分配' },
      { title: '稳健增长',     desc: '派息 + NAV 双轨驱动，复利加速资产增长' },
    ],
    portfolio: [
      { aiReason: 'NVDY 隐含波动率上升至历史高位，AI 触发减仓以降低尾部风险', tagline: '年化 73% 派息率，NVDA 期权收益每周直接落袋' },
      { aiReason: 'QQQI 期权溢价扩大，AI 增配以捕获更高的权利金收益', tagline: '纳指底仓 + 月度派息，91.8 亿 AUM 背书稳健增收' },
      { aiReason: '纳指动量信号转强，AI 小幅增配底仓以跟踪上涨弹性', tagline: '低费率纳指 ETF，712 亿规模底仓，25% 年化稳健增长' },
      { aiReason: '科技板块走势平稳，AI 维持当前配比不作调整', tagline: '全美科技一键持有，1100 亿规模穿越周期的压舱底仓' },
    ],
    darkBtn: '深色模式',
    lightBtn: '浅色模式',
    langBtn: 'EN',
    presets: (v: number) => `${v / 10000}万`,
  },
  en: {
    vaultTitle: 'RWAlpha Index Prime Vault',
    vaultSub: 'AI-Driven Rebalancing · Weekly Dividend · Index Core Position',
    aiEnabled: 'AI Powered',
    principal: 'Principal Calculator',
    annualYield: 'Net Annual Yield',
    yieldTarget: (excess: string) => `Target: 18.00% | Excess: +${excess}%`,
    mgmtFeeNote: 'After 0.80% mgmt. fee',
    navTitle: 'Vault NAV',
    navSince: 'Since Inception · Base $100',
    navReturn: (r: string) => `Net Return +${r}%`,
    navFeeNote: '0.80%/yr mgmt. fee deducted',
    navDate: 'As of 2026-03-14',
    navExpenseLabel: 'Mgmt. Fee',
    navExpenseValue: '0.80% / yr',
    navEtfFeeLabel: 'Underlying ETF Wt. Fee',
    navEtfFeeValue: '0.51% / yr (embedded)',
    weeklyIncome: 'Avg. Weekly Income',
    annualEst: (v: string) => `Est. Annual Income: $${v}`,
    totalReturn: 'Annualized Total Return',
    navNote: 'Includes NAV Growth + Dividend',
    cashflowTitle: 'Cash Flow Calendar (Monthly)',
    week: (n: number) => `Week ${n}`,
    nvdyDist: 'NVDY Dividend',
    nvdyQqqiDist: 'NVDY + QQQI Dividend',
    cashflowNote: 'Weeks 1–3: NVDY only. Week 4: NVDY + QQQI combined.',
    volatility: 'Volatility: Low',
    allocationTitle: 'Asset Allocation (NAV)',
    aiAdjustedLabel: 'Post AI Rebalance',
    tableTitle: 'Holdings & Dividend Frequency',
    dataUpdated: 'Last Updated: 2026-03-14',
    aumSource: 'AUM Source: TradingView',
    colTicker: 'Ticker',
    colAum: 'AUM (USD)',
    colYield: 'Yield',
    colReturn: 'Total Return',
    colFreq: 'Frequency',
    colWeekly: 'Est. Weekly',
    colAiAdj: 'AI Adj. (This Week)',
    weightLabel: 'Wt.',
    aiSignalTitle: 'AI Market Signals',
    liveMonitor: 'Live Monitoring',
    signalUpdated: 'Updated 2026-03-14 22:00 · Next update 23:00',
    signals: [
      { label: 'Market Sentiment', value: 'Cautiously Bullish' },
      { label: 'NVDY Vol. Risk', value: 'Moderate' },
      { label: 'QQQI Options Premium', value: 'Elevated' },
      { label: 'QQQM/VGT Momentum', value: 'Positive' },
      { label: 'Rebalance Signal', value: 'Hold Current' },
    ],
    aiLogTitle: 'AI Rebalancing Log',
    logs: [
      { date: '2026-03-10', icon: '⚖️', action: 'NVDY vol. spiked; weight trimmed 22% → 18%, proceeds added to QQQM', tag: 'Rebalance' },
      { date: '2026-03-07', icon: '💰', action: 'Weekly dist. $283 received; AI auto-reinvested 60% into QQQI', tag: 'Reinvest' },
      { date: '2026-03-03', icon: '📊', action: 'Options premium rebounded to +1σ; NVDY weight restored to 20%', tag: 'Rebalance' },
      { date: '2026-02-24', icon: '🛡️', action: 'Market turbulence; VGT weight raised +2% temporarily for defense', tag: 'Risk Ctrl' },
    ],
    logTags: { 'Rebalance': 'Rebalance', 'Reinvest': 'Reinvest', 'Risk Ctrl': 'Risk Ctrl' },
    aiHowTitle: 'How AI Works',
    aiSteps: [
      { step: '01', title: 'Monitor', desc: 'Continuously tracks NVDY/QQQI implied volatility & options premium, plus QQQM/VGT momentum signals and full-portfolio correlation matrix', items: ['NVDY & QQQI IV Volatility', 'QQQM/VGT Momentum Index', 'Portfolio Correlation Matrix'] },
      { step: '02', title: 'Analyze', desc: 'Triggers rebalancing signals when any holding deviates from thresholds, evaluating optimal allocation across all four assets', items: ['NVDY Vol. Threshold Trigger', 'QQQI Premium Deviation Alert', 'QQQM/VGT Momentum Reversal'] },
      { step: '03', title: 'Execute', desc: 'Automatically adjusts weights across NVDY/QQQI/QQQM/VGT within risk boundaries and redistributes dividend income per strategy', items: ['4-Asset Auto Rebalance', 'Smart Dividend Reinvest', 'Risk Boundary Enforcement'] },
    ],
    fn1: { strong: 'Disclaimer: ', text: 'Projections are based on historical dividend levels. NVDY is a covered-call ETF; dividends are subject to NVDA price volatility and are not guaranteed. Consider reinvesting excess cash flow to offset potential NAV erosion.' },
    fn2: { strong: 'Risk Control: ', text: 'The 50% core position (QQQM+VGT) does not participate in options writing, preserving upside potential and making the portfolio more resilient.' },
    sellingPoints: [
      { title: 'Weekly Income',     desc: 'NVDY distributes every week — consistent, predictable cash flow' },
      { title: 'Index Core',        desc: '50% QQQM+VGT core preserves long-term capital appreciation' },
      { title: 'AI Rebalancing',    desc: 'AI monitors markets in real-time and auto-optimizes allocations' },
      { title: 'Steady Growth',     desc: 'Dual-engine: dividends + NAV growth compound over time' },
    ],
    portfolio: [
      { aiReason: 'NVDY implied vol. hit historical high; AI triggered trim to reduce tail risk', tagline: '73% annualized yield — NVDA options premium paid weekly' },
      { aiReason: 'QQQI options premium widened; AI added exposure to capture higher premium income', tagline: 'Nasdaq core + monthly div. — $9.18B AUM backs steady returns' },
      { aiReason: 'Nasdaq momentum signal strengthened; AI slightly increased core position for upside capture', tagline: 'Low-cost Nasdaq ETF — $71.25B core, 25% annualized growth' },
      { aiReason: 'Tech sector stable; AI maintains current allocation without adjustment', tagline: 'All-in US tech giants — $110.52B anchor position across cycles' },
    ],
    darkBtn: 'Dark Mode',
    lightBtn: 'Light Mode',
    langBtn: '中文',
    presets: (v: number) => `$${(v / 1000).toFixed(0)}K`,
  },
} as const;

type Lang = 'zh' | 'en';

// ─── Component ────────────────────────────────────────────────────────────────
const App = () => {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>('zh');
  const T = i18n[lang];

  // 数据来源: StockAnalysis.com 2026-03-13 收盘
  // ETF 自身费率已内含于净值，管理费 0.80%/年由金库额外收取
  const MGMT_FEE = 0.80; // RWAlpha 管理费 %
  const portfolioBase = [
    { name: 'NVDY', weight: 0.22,   aum: '13.9亿', aumEn: '$1.39B',   price: 13.52, expenseRatio: 1.27, yield: 73.84, totalReturn: 50.38, freq: 'Weekly',    aiAdjust: +3.2 },
    { name: 'QQQI', weight: 0.29,   aum: '91.8亿', aumEn: '$9.18B',   price: 51.47, expenseRatio: 0.68, yield: 14.49, totalReturn: 21.86, freq: 'Monthly',   aiAdjust: +1.5 },
    { name: 'QQQM', weight: 0.29,  aum: '712.5亿', aumEn: '$71.25B', price: 244.45, expenseRatio: 0.15, yield: 0.52,  totalReturn: 25.17, freq: 'Quarterly', aiAdjust: +0.8 },
    { name: 'VGT',  weight: 0.2000, aum: '1105.2亿', aumEn: '$110.52B', price: 714.44, expenseRatio: 0.09, yield: 0.43,  totalReturn: 28.97, freq: 'Quarterly', aiAdjust: 0.0  },
  ];

  const portfolioData = portfolioBase.map((p, i) => ({
    ...p,
    aum: lang === 'zh' ? p.aum : p.aumEn,
    aiReason: T.portfolio[i].aiReason,
    tagline: T.portfolio[i].tagline,
  }));

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1'];

  const [principalInput, setPrincipalInput] = useState('100000');
  const principal = parseFloat(principalInput.replace(/,/g, '')) || 0;

  const metrics = useMemo(() => {
    const grossYield = portfolioBase.reduce((acc, curr) => acc + (curr.weight * curr.yield), 0);
    const grossReturn = portfolioBase.reduce((acc, curr) => acc + (curr.weight * curr.totalReturn), 0);
    const netYield = grossYield - MGMT_FEE;
    const netReturn = grossReturn - MGMT_FEE;
    // NAV: 假设成立于1年前，基准$100，按净总回报计算
    const navValue = (100 * (1 + netReturn / 100)).toFixed(2);
    // 加权ETF费率
    const weightedEtfFee = portfolioBase.reduce((acc, curr) => acc + (curr.weight * curr.expenseRatio), 0);
    // 收入计算基于净派息率
    const nvdyWeekly = (principal * portfolioBase[0].weight * (portfolioBase[0].yield / 100)) / 52;
    const qqqiMonthly = (principal * portfolioBase[1].weight * (portfolioBase[1].yield / 100)) / 12;
    const grossAnnualIncome = nvdyWeekly * 52 + qqqiMonthly * 12;
    const netAnnualIncome = grossAnnualIncome * (1 - MGMT_FEE / 100);
    const netWeekly = netAnnualIncome / 52;
    return {
      grossYield: grossYield.toFixed(2),
      yield: netYield.toFixed(2),
      grossReturn: grossReturn.toFixed(2),
      return: netReturn.toFixed(2),
      navValue,
      navReturn: netReturn.toFixed(2),
      weightedEtfFee: weightedEtfFee.toFixed(2),
      nvdyWeekly: nvdyWeekly.toFixed(0),
      qqqiMonthly: qqqiMonthly.toFixed(0),
      totalWeekly: netWeekly.toFixed(0),
      annualIncome: netAnnualIncome.toFixed(0),
    };
  }, [principal]);

  const weeklySchedule = [
    { week: T.week(1), amount: parseInt(metrics.nvdyWeekly), desc: T.nvdyDist },
    { week: T.week(2), amount: parseInt(metrics.nvdyWeekly), desc: T.nvdyDist },
    { week: T.week(3), amount: parseInt(metrics.nvdyWeekly), desc: T.nvdyDist },
    { week: T.week(4), amount: parseInt(metrics.nvdyWeekly) + parseInt(metrics.qqqiMonthly), desc: T.nvdyQqqiDist },
  ];

  const t = {
    page:       dark ? 'bg-[#0a0a0f]'          : 'bg-slate-50',
    card:       dark ? 'bg-[#13131a] border-white/20' : 'bg-white border-slate-200',
    cardHover:  dark ? 'hover:bg-white/5'        : 'hover:bg-slate-50/50',
    title:      dark ? 'text-white'              : 'text-slate-900',
    sub:        dark ? 'text-slate-400'          : 'text-slate-500',
    muted:      dark ? 'text-slate-500'          : 'text-slate-400',
    divider:    dark ? 'border-white/15'         : 'border-slate-100',
    infoRow:    dark ? 'bg-white/5'              : 'bg-slate-50',
    gridStroke: dark ? '#1e1e2e'                 : '#f1f5f9',
    axisColor:  dark ? '#555'                    : '#94a3b8',
    tooltipBg:  dark ? 'bg-[#1e1e2e] border-white/10' : 'bg-slate-900 border-slate-700',
    sp: [
      { bg: dark ? 'bg-amber-950/40 border-amber-800/30'   : 'bg-amber-50 border-amber-100' },
      { bg: dark ? 'bg-indigo-950/40 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100' },
      { bg: dark ? 'bg-green-950/40 border-green-800/30'   : 'bg-green-50 border-green-100' },
      { bg: dark ? 'bg-violet-950/40 border-violet-800/30' : 'bg-violet-50 border-violet-100' },
    ],
    fn1: dark ? 'bg-amber-950/40 border-amber-800/30'   : 'bg-amber-50 border-amber-100',
    fn2: dark ? 'bg-indigo-950/40 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100',
    fn1text: dark ? 'text-amber-300'   : 'text-amber-800',
    fn2text: dark ? 'text-indigo-300'  : 'text-indigo-800',
    thead: dark ? 'text-slate-500' : 'text-slate-400',
  };

  const sellingIcons = [
    <Zap size={18} className="text-amber-500" />,
    <Layers size={18} className="text-indigo-500" />,
    <BrainCircuit size={18} className="text-violet-500" />,
    <TrendingUp size={18} className="text-green-500" />,
  ];

  const logTagColors: Record<string, string> = {
    '调仓': dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700',
    '再投资': dark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700',
    '风控': dark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700',
    'Rebalance': dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700',
    'Reinvest': dark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700',
    'Risk Ctrl': dark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700',
  };

  const signalDots = ['bg-amber-400', 'bg-orange-400', 'bg-violet-400', 'bg-blue-400'];
  const signalColors = ['text-amber-500', 'text-orange-500', 'text-violet-500', 'text-blue-400'];
  const signalBars = [65, 48, 72, 100];

  return (
    <div className={`min-h-screen ${t.page} p-4 md:p-8 font-sans transition-colors duration-300`}>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header 外层：按钮组 + 卡片 */}
        <div>
          {/* 顶部导航栏：左侧语言/深色，右侧 Launch App */}
          <div className="flex justify-between items-center gap-2 mb-2">
            {/* 左侧：语言切换 + 深色模式 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-bold transition-all duration-200 active:scale-95 ${
                  dark
                    ? 'bg-[#1e1e2e] border-white/15 text-slate-200 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🌐 {T.langBtn}
              </button>
              <button
                onClick={() => setDark(!dark)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all duration-200 active:scale-95 ${
                  dark
                    ? 'bg-[#1e1e2e] border-white/15 text-slate-200 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
                {dark ? T.lightBtn : T.darkBtn}
              </button>
            </div>
            {/* 右侧：Launch App */}
            <button className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95">
              <Zap size={15} />
              Launch App
            </button>
          </div>

        {/* Header */}
        <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-2xl font-bold ${t.title}`}>{T.vaultTitle}</h1>
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">{T.aiEnabled}</span>
            </div>
            <p className={`${t.sub} mt-1 tracking-wide`}>{T.vaultSub}</p>
          </div>
          {/* NAV 数值 */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2.5 rounded-2xl ${dark ? 'bg-emerald-900/40' : 'bg-emerald-50'}`}>
              <BarChart2 size={20} className="text-emerald-500" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className={`text-xs font-bold uppercase tracking-wider ${t.muted}`}>{T.navTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${dark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{T.navDate}</span>
              </div>
              <div className="flex items-baseline gap-2 justify-end mt-0.5">
                <span className={`text-2xl font-bold font-mono ${t.title}`}>${metrics.navValue}</span>
                <span className="text-emerald-500 text-sm font-bold">▲ {T.navReturn(metrics.navReturn)}</span>
              </div>
              <p className={`text-[10px] ${t.muted} mt-0.5`}>{T.navFeeNote}</p>
            </div>
          </div>
        </div>
        </div>{/* end Header outer div */}

        {/* Selling Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {T.sellingPoints.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${t.sp[i].bg} transition-colors duration-300`}>
              <div className="mt-0.5 shrink-0">{sellingIcons[i]}</div>
              <div>
                <p className={`text-sm font-bold ${t.title}`}>{item.title}</p>
                <p className={`text-[11px] ${t.sub} mt-0.5 leading-relaxed`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>


        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20} /></div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">{T.annualYield}</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.yield}%</p>
              <p className="text-blue-100 text-xs mt-1">{T.yieldTarget((parseFloat(metrics.yield)-18).toFixed(2))}</p>
              <p className="text-blue-200/70 text-[10px] mt-1">{T.mgmtFeeNote}</p>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex justify-between items-start">
              <div className={`p-2 ${dark ? 'bg-violet-900/40 text-violet-400' : 'bg-violet-50 text-violet-600'} rounded-lg`}><TrendingUp size={20} /></div>
              <span className={`text-xs font-medium ${t.muted}`}>{T.totalReturn}</span>
            </div>
            <div className="mt-4">
              <p className={`text-3xl font-bold ${t.title}`}>{metrics.return}%</p>
              <p className="text-green-500 text-sm font-bold mt-0.5">+${(principal * parseFloat(metrics.return) / 100).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className={`${t.sub} text-xs mt-1`}>{T.navNote}</p>
              <p className={`${t.muted} text-[10px] mt-0.5`}>{T.mgmtFeeNote}</p>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex justify-between items-start">
              <div className={`p-2 ${dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600'} rounded-lg`}><DollarSign size={20} /></div>
              <span className={`text-xs font-medium ${t.muted}`}>{T.weeklyIncome}</span>
            </div>
            <div className="mt-3">
              <p className={`text-3xl font-bold ${t.title}`}>${parseInt(metrics.totalWeekly).toLocaleString()}</p>
              <p className={`${t.sub} text-xs mt-1`}>{T.annualEst(parseInt(metrics.annualIncome).toLocaleString())}</p>
            </div>
            {/* 本金输入区 */}
            <div className={`mt-4 pt-4 border-t ${t.divider}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${t.muted}`}>{T.principal}</span>
                <div className="flex items-center gap-1.5">
                  {[50000, 100000, 500000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPrincipalInput(preset.toLocaleString())}
                      className={`px-2 py-0.5 rounded-md text-xs font-bold border transition-colors duration-150 ${
                        principal === preset
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : dark
                            ? 'bg-white/5 text-slate-400 border-white/10 hover:border-indigo-400 hover:text-indigo-400'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {T.presets(preset)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-mono font-bold ${t.muted}`}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={principalInput}
                  onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setPrincipalInput(raw); }}
                  onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')); if (!isNaN(num) && num > 0) setPrincipalInput(num.toLocaleString()); else setPrincipalInput('0'); }}
                  onFocus={(e) => { setPrincipalInput(e.target.value.replace(/,/g, '')); setTimeout(() => e.target.select(), 0); }}
                  className={`flex-1 text-lg font-mono font-bold bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 outline-none text-right transition-colors duration-150 ${t.title}`}
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Cash Flow + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold ${t.title} flex items-center gap-2`}>
                <Calendar size={18} className="text-indigo-500" />
                {T.cashflowTitle}
              </h3>
              <div className="flex gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><span className={t.sub}>NVDY</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded-full"></div><span className={t.sub}>QQQI</span></div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySchedule}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridStroke} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip
                    cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`${t.tooltipBg} text-white p-3 rounded-xl shadow-xl border`}>
                            <p className="text-xs opacity-70">{payload[0].payload.week}</p>
                            <p className="text-lg font-bold">${Number(payload[0].value).toLocaleString()}</p>
                            <p className="text-[10px] text-indigo-300 mt-1">{payload[0].payload.desc}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {weeklySchedule.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`mt-4 p-4 ${t.infoRow} rounded-2xl flex justify-between items-center transition-colors duration-300`}>
              <span className={`text-sm ${t.sub}`}>{T.cashflowNote}</span>
              <div className="flex items-center text-indigo-500 font-bold text-sm">
                {T.volatility} <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${t.title}`}>{T.allocationTitle}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-violet-900/50 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>{T.aiAdjustedLabel}</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="weight">
                    {portfolioData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={dark ? { backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' } : undefined} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {portfolioData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className={`text-xs font-bold ${t.title} w-10`}>{item.name}</span>
                  <div className={`flex-1 h-1 rounded-full ${dark ? 'bg-white/8' : 'bg-slate-100'}`}>
                    <div className="h-full rounded-full" style={{ width: `${item.weight * 100}%`, backgroundColor: COLORS[index] }}></div>
                  </div>
                  <span className={`text-xs ${t.muted} w-10 text-right`}>{(item.weight * 100).toFixed(2)}%</span>
                  {item.aiAdjust === 0 ? (
                    <span className={`text-[11px] font-mono w-14 text-right ${t.muted}`}>— 0.00%</span>
                  ) : (
                    <span className={`text-[11px] font-bold font-mono w-14 text-right ${item.aiAdjust > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {item.aiAdjust > 0 ? '▲' : '▼'} {Math.abs(item.aiAdjust).toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className={`${t.card} rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300`}>
          <div className={`px-6 py-4 border-b ${t.divider} flex justify-between items-center`}>
            <h2 className={`font-bold ${t.title}`}>{T.tableTitle}</h2>
            <span className={`text-xs ${t.muted}`}>
              {T.dataUpdated}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                {T.aumSource}
              </span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] ${t.thead} font-bold uppercase tracking-wider border-b ${t.divider}`}>
                  <th className="px-6 py-4">{T.colTicker}</th>
                  <th className="px-6 py-4">{T.colAum}</th>
                  <th className="px-6 py-4">{T.colYield}</th>
                  <th className="px-6 py-4">{T.colReturn}</th>
                  <th className="px-6 py-4">{T.colFreq}</th>
                  <th className="px-6 py-4">{T.colWeekly}</th>
                  <th className="px-6 py-4">{T.colAiAdj}</th>
                </tr>
              </thead>
              <tbody className={`text-sm divide-y ${t.divider}`}>
                {portfolioData.map((item) => (
                  <tr key={item.name} className={`${t.cardHover} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`font-bold ${t.title}`}>{item.name}</div>
                        <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${t.muted} ${dark ? 'bg-white/5' : 'bg-slate-100'}`}>{T.weightLabel} {(item.weight * 100).toFixed(2)}%</div>
                      </div>
                      <div className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.name === 'NVDY' ? (dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-700') :
                        item.name === 'QQQI' ? (dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') :
                        item.name === 'QQQM' ? (dark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700') :
                        (dark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                      }`}>{item.tagline}</div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-mono ${t.sub}`}>{item.aum}</td>
                    <td className="px-6 py-4 text-indigo-400 font-bold">{item.yield}%</td>
                    <td className="px-6 py-4 text-green-500 font-medium">+{item.totalReturn}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.freq === 'Weekly'    ? (dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700') :
                        item.freq === 'Monthly'   ? (dark ? 'bg-blue-900/50 text-blue-400'   : 'bg-blue-100 text-blue-700') :
                        (dark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500')
                      }`}>{item.freq}</span>
                    </td>
                    <td className={`px-6 py-4 font-mono ${t.sub}`}>
                      {item.freq === 'Weekly' ? `$${parseInt(metrics.nvdyWeekly).toLocaleString()}` :
                       item.freq === 'Monthly' ? `$${parseInt(metrics.qqqiMonthly).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group inline-block">
                        {item.aiAdjust === 0 ? (
                          <span className={`text-xs font-mono cursor-help ${t.muted}`}>— 0.00%</span>
                        ) : (
                          <span className={`text-xs font-bold font-mono flex items-center gap-0.5 cursor-help ${item.aiAdjust > 0 ? 'text-green-500' : 'text-red-400'}`}>
                            {item.aiAdjust > 0 ? '▲' : '▼'}{Math.abs(item.aiAdjust).toFixed(2)}%
                          </span>
                        )}
                        <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg text-[11px] leading-relaxed shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${dark ? 'bg-[#1e1e2e] text-slate-200 border border-white/10' : 'bg-slate-900 text-white'}`}>
                          {item.aiReason}
                          <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${dark ? 'border-t-[#1e1e2e]' : 'border-t-slate-900'}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI 强化区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI 市场信号 */}
          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-5">
              <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}><Activity size={16} className="text-violet-500" /></div>
              <h3 className={`font-bold ${t.title}`}>{T.aiSignalTitle}</h3>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>{T.liveMonitor}</span>
            </div>
            <div className="space-y-3">
              {T.signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${signalDots[i]}`}></div>
                  <span className={`text-xs ${t.sub} w-36 shrink-0`}>{sig.label}</span>
                  <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-white/8' : 'bg-slate-100'}`}>
                    <div className={`h-full rounded-full ${signalDots[i]}`} style={{ width: `${signalBars[i]}%` }}></div>
                  </div>
                  <span className={`text-xs font-bold ${signalColors[i]} w-28 text-right`}>{sig.value}</span>
                </div>
              ))}
            </div>
            <p className={`text-[10px] ${t.muted} mt-4`}>{T.signalUpdated}</p>
          </div>

          {/* AI 调仓日志 */}
          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-5">
              <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}><Cpu size={16} className="text-violet-500" /></div>
              <h3 className={`font-bold ${t.title}`}>{T.aiLogTitle}</h3>
            </div>
            <div className="space-y-3">
              {T.logs.map((log, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl ${dark ? 'bg-white/4' : 'bg-slate-50'}`}>
                  <span className="text-base shrink-0 mt-0.5">{log.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] ${t.muted}`}>{log.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${logTagColors[log.tag] || ''}`}>{log.tag}</span>
                    </div>
                    <p className={`text-xs ${t.sub} leading-relaxed`}>{log.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 工作流程 */}
        <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}><Eye size={16} className="text-violet-500" /></div>
            <h3 className={`font-bold ${t.title}`}>{T.aiHowTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {T.aiSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div className={`hidden md:block absolute top-8 left-full w-full h-px ${dark ? 'bg-violet-800/40' : 'bg-violet-200'} z-0`} style={{width:'calc(100% - 2rem)', left:'calc(100% - 0.5rem)'}}></div>
                )}
                <div className={`relative z-10 p-4 rounded-2xl border ${dark ? 'bg-violet-950/30 border-violet-800/30' : 'bg-violet-50 border-violet-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? 'bg-violet-900/60' : 'bg-violet-100'}`}>
                      {i === 0 ? <Eye size={20} className="text-violet-400" /> : i === 1 ? <BrainCircuit size={20} className="text-violet-400" /> : <CheckCircle2 size={20} className="text-violet-400" />}
                    </div>
                    <div>
                      <div className={`text-[10px] font-bold ${dark ? 'text-violet-500' : 'text-violet-400'}`}>STEP {step.step}</div>
                      <div className={`text-sm font-bold ${t.title}`}>{step.title}</div>
                    </div>
                  </div>
                  <p className={`text-xs ${t.sub} leading-relaxed mb-3`}>{step.desc}</p>
                  <div className="space-y-1">
                    {step.items.map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-violet-400 shrink-0"></div>
                        <span className={`text-[11px] ${t.muted}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="flex gap-4">
          <div className={`flex-1 ${t.fn1} p-4 rounded-2xl border flex items-start gap-3 transition-colors duration-300`}>
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className={`text-xs ${t.fn1text} leading-relaxed`}>
              <strong>{T.fn1.strong}</strong>{T.fn1.text}
            </p>
          </div>
          <div className={`flex-1 ${t.fn2} p-4 rounded-2xl border flex items-start gap-3 transition-colors duration-300`}>
            <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={18} />
            <p className={`text-xs ${t.fn2text} leading-relaxed`}>
              <strong>{T.fn2.strong}</strong>{T.fn2.text}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
