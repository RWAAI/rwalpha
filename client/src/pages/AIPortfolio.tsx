import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { trpc } from '@/lib/trpc';
import {
  PlusCircle, Trash2, RefreshCw, BrainCircuit, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar, Layers,
  X, Edit2, Check, AlertTriangle, Loader2, Zap, Info, Pencil, Globe
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── i18n ─────────────────────────────────────────────────────────────────────
type Lang = 'zh' | 'en';

const T = {
  zh: {
    // Nav
    tagline: 'AI × RWA · 下一代资产管理',
    officialSite: '官网',
    newPortfolio: '新建组合',
    // Page header
    pageTitle: '我的 ETF 组合',
    pageDesc: '输入 Ticker 创建自定义组合，实时计算派息率、总回报与 AI 调仓建议',
    // Loading / empty
    loading: '加载中...',
    loadingData: '正在拉取市场数据...',
    loadFailed: '数据加载失败，请重试',
    noPortfolio: '还没有组合',
    noPortfolioDesc: '点击「新建组合」，输入 ETF 或股票的 Ticker，即可创建您的第一个自定义组合',
    createFirst: '新建第一个组合',
    exampleTickers: '💡 示例组合 Ticker',
    // Metrics
    weightedYield: '加权派息率',
    ttmAnnualized: 'TTM 年化',
    oneYearReturn: '1年总回报',
    weightedAvg: '加权平均',
    weeklyIncome: '每周到账 (10万本金)',
    annualIncome: '年收息',
    // Card header
    dividendRate: '派息率',
    oneYearReturnShort: '1年回报',
    volatility: '波动率',
    refreshData: '刷新数据',
    editPortfolio: '编辑组合',
    // Cash flow
    cashFlowTitle: '现金流周历 (月度模拟)',
    principal: '本金',
    weeksOnly: (tickers: string) => `前三周仅 ${tickers}`,
    week4Overlap: (tickers: string) => `第四周叠加 ${tickers}`,
    noPeriodicHoldings: '暂无周期派息持仓',
    volatilityLow: '波动率: 低 →',
    // Allocation
    allocationTitle: '资产配比 (NAV)',
    aiAdjustedLabel: 'AI 调仓后',
    // Holdings table
    holdingsTitle: '资产清单与派息频率',
    dataUpdated: '数据最后更新:',
    dataSource: '数据来源: TradingView',
    colCode: '代码',
    colAllocation: '金库占比',
    colAum: 'AUM（美元）',
    colYield: '派息率',
    colReturn: '总回报',
    colReturnTooltip: '含股息，基于前复权价格计算',
    colFreq: '频率',
    colWeekly: '周到账 (预计)',
    colAiAdj: '本周 AI 调仓',
    // Freq badges
    freqWeekly: '每周',
    freqMonthly: '每月',
    freqQuarterly: '每季',
    freqAnnual: '每年',
    freqNone: '无派息',
    // AI section
    aiTitle: 'AI 调仓建议',
    aiGenerate: '生成建议',
    aiAnalyzing: '分析中...',
    aiWaiting: '点击「生成建议」获取 AI 调仓分析',
    aiThinking: 'AI 正在分析您的组合，请稍候...',
    // Edit modal
    editTitle: (name: string) => `编辑组合「${name}」`,
    colTickerCode: 'Ticker 代码',
    colWeight: '权重 (%)',
    weightTotal: '权重合计:',
    weightNeed100: '（需等于 100%）',
    equalDistribute: '平均分配',
    addTicker: '添加 Ticker',
    aiAutoAlloc: 'AI 自动分配',
    targetYield: '目标派息率 (%)',
    targetReturn: '目标年化回报 (%)',
    aiAllocating: '分配中...',
    aiAllocate: 'AI 分配',
    aiAllocDesc: (y: string, r: string) => `以派息率 ${y}%、年化回报 ${r}% 为目标，AI 自动分配权重`,
    cancel: '取消',
    saveChanges: '保存更改',
    // Create modal
    createTitle: '创建新组合',
    portfolioName: '组合名称 *',
    portfolioNamePlaceholder: '例：高收益派息组合',
    notes: '备注（可选）',
    notesPlaceholder: '简短描述这个组合的策略',
    holdingsTickers: '持仓 Ticker 与权重',
    equalAlloc: '均等分配',
    weightSummary: (pct: string) => `权重合计：${pct}%`,
    weightNeed: '（需等于 100%）',
    createPortfolio: '创建组合',
    // Errors
    errNoName: '请输入组合名称',
    errNoTicker: '请至少添加一个 Ticker',
    errWeight: (pct: string) => `权重合计 ${pct}%，需等于 100%`,
    errFillTicker: '请填写所有 Ticker 代码',
    errWeightTotal: (pct: string) => `权重合计必须为 100%（当前 ${pct}%）`,
    confirmDelete: (name: string) => `确认删除组合「${name}」？`,
    editNameHint: '点击修改名称',
    // Pie tooltip
    weight: '权重',
  },
  en: {
    tagline: 'AI × RWA · Next-Gen Asset Management',
    officialSite: 'Website',
    newPortfolio: 'New Portfolio',
    pageTitle: 'My ETF Portfolios',
    pageDesc: 'Enter tickers to create custom portfolios with real-time yield, return & AI rebalancing',
    loading: 'Loading...',
    loadingData: 'Fetching market data...',
    loadFailed: 'Failed to load data, please retry',
    noPortfolio: 'No portfolios yet',
    noPortfolioDesc: 'Click "New Portfolio", enter ETF or stock tickers to create your first custom portfolio',
    createFirst: 'Create First Portfolio',
    exampleTickers: '💡 Example Tickers',
    weightedYield: 'Weighted Yield',
    ttmAnnualized: 'TTM Annualized',
    oneYearReturn: '1Y Total Return',
    weightedAvg: 'Weighted Avg',
    weeklyIncome: 'Weekly Income ($100K)',
    annualIncome: 'Annual Income',
    dividendRate: 'Yield',
    oneYearReturnShort: '1Y Return',
    volatility: 'Volatility',
    refreshData: 'Refresh Data',
    editPortfolio: 'Edit Portfolio',
    cashFlowTitle: 'Cash Flow Calendar (Monthly)',
    principal: 'Principal',
    weeksOnly: (tickers: string) => `Weeks 1–3: ${tickers} only`,
    week4Overlap: (tickers: string) => `Week 4 adds ${tickers}`,
    noPeriodicHoldings: 'No periodic dividend holdings',
    volatilityLow: 'Volatility: Low →',
    allocationTitle: 'Asset Allocation (NAV)',
    aiAdjustedLabel: 'Post AI Rebalance',
    holdingsTitle: 'Holdings & Dividend Frequency',
    dataUpdated: 'Last Updated:',
    dataSource: 'Source: TradingView',
    colCode: 'Ticker',
    colAllocation: 'Allocation',
    colAum: 'AUM (USD)',
    colYield: 'Yield',
    colReturn: 'Total Return',
    colReturnTooltip: 'Includes dividends, based on adjusted price',
    colFreq: 'Frequency',
    colWeekly: 'Est. Weekly',
    colAiAdj: 'AI Adj. (This Week)',
    freqWeekly: 'Weekly',
    freqMonthly: 'Monthly',
    freqQuarterly: 'Quarterly',
    freqAnnual: 'Annual',
    freqNone: 'No Div.',
    aiTitle: 'AI Rebalancing Advice',
    aiGenerate: 'Generate',
    aiAnalyzing: 'Analyzing...',
    aiWaiting: 'Click "Generate" to get AI rebalancing analysis',
    aiThinking: 'AI is analyzing your portfolio, please wait...',
    editTitle: (name: string) => `Edit Portfolio "${name}"`,
    colTickerCode: 'Ticker',
    colWeight: 'Weight (%)',
    weightTotal: 'Total Weight:',
    weightNeed100: '(must equal 100%)',
    equalDistribute: 'Equal Weight',
    addTicker: 'Add Ticker',
    aiAutoAlloc: 'AI Auto Allocate',
    targetYield: 'Target Yield (%)',
    targetReturn: 'Target Annual Return (%)',
    aiAllocating: 'Allocating...',
    aiAllocate: 'AI Allocate',
    aiAllocDesc: (y: string, r: string) => `AI allocates weights targeting ${y}% yield and ${r}% annual return`,
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    createTitle: 'Create New Portfolio',
    portfolioName: 'Portfolio Name *',
    portfolioNamePlaceholder: 'e.g. High Yield Income',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Brief strategy description',
    holdingsTickers: 'Holdings & Weights',
    equalAlloc: 'Equal Weight',
    weightSummary: (pct: string) => `Total Weight: ${pct}%`,
    weightNeed: '(must equal 100%)',
    createPortfolio: 'Create Portfolio',
    errNoName: 'Please enter a portfolio name',
    errNoTicker: 'Please add at least one ticker',
    errWeight: (pct: string) => `Total weight ${pct}%, must equal 100%`,
    errFillTicker: 'Please fill in all ticker codes',
    errWeightTotal: (pct: string) => `Total weight must be 100% (currently ${pct}%)`,
    confirmDelete: (name: string) => `Delete portfolio "${name}"?`,
    editNameHint: 'Click to rename',
    weight: 'Weight',
  },
} as const;

// ─── Language Context ─────────────────────────────────────────────────────────
const LangContext = createContext<Lang>('zh');
const useLang = () => useContext(LangContext);
const useT = () => T[useLang()];

// ─── Types ────────────────────────────────────────────────────────────────────
interface TickerInput {
  ticker: string;
  weight: number;
}

interface MarketData {
  ticker: string;
  name: string;
  price: number;
  dividendYield: number;
  ttmDividendPerShare: number;
  frequency: string;
  oneYearReturn: number;
  annualVolatility: number;
  aumDisplay: string;
  description?: string | null;
  recentDivs: { date: string; amount: number }[];
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

interface PortfolioData {
  portfolioId: number;
  fetchedAt: string;
  weightedYield: number;
  weightedReturn: number;
  weightedVolatility: number;
  monthlySchedule: { month: string; amount: number }[];
  holdings: { ticker: string; weight: number; marketData: MarketData | null }[];
}

// ─── Color Palette ────────────────────────────────────────────────────────────
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPct = (v: number | null | undefined) =>
  v == null ? 'N/A' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const fmtNum = (v: number | null | undefined, dec = 2) =>
  v == null ? 'N/A' : v.toFixed(dec);

const freqBadgeColors: Record<string, string> = {
  Weekly: 'bg-amber-100 text-amber-700',
  Monthly: 'bg-blue-100 text-blue-700',
  Quarterly: 'bg-purple-100 text-purple-700',
  Annual: 'bg-slate-100 text-slate-600',
  None: 'bg-slate-100 text-slate-400',
};

function FreqBadge({ freq }: { freq: string }) {
  const t = useT();
  const labelMap: Record<string, string> = {
    Weekly: t.freqWeekly,
    Monthly: t.freqMonthly,
    Quarterly: t.freqQuarterly,
    Annual: t.freqAnnual,
    None: t.freqNone,
  };
  const color = freqBadgeColors[freq] ?? freqBadgeColors.None;
  const label = labelMap[freq] ?? freq;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

// ─── Create Portfolio Modal ───────────────────────────────────────────────────
function CreatePortfolioModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tickers, setTickers] = useState<TickerInput[]>([
    { ticker: '', weight: 0.5 },
    { ticker: '', weight: 0.5 },
  ]);
  const [error, setError] = useState('');

  const createMutation = trpc.portfolio.create.useMutation({
    onSuccess: () => { onCreated(); onClose(); },
    onError: (e) => setError(e.message),
  });

  const addTicker = () => {
    if (tickers.length >= 10) return;
    setTickers([...tickers, { ticker: '', weight: 0 }]);
  };

  const removeTicker = (i: number) => {
    setTickers(tickers.filter((_, idx) => idx !== i));
  };

  const updateTicker = (i: number, field: keyof TickerInput, value: string | number) => {
    setTickers(tickers.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const totalWeight = tickers.reduce((a, b) => a + (b.weight || 0), 0);

  const autoBalance = () => {
    const n = tickers.length;
    if (n === 0) return;
    const w = parseFloat((1 / n).toFixed(4));
    setTickers(tickers.map((t, i) => ({ ...t, weight: i === n - 1 ? parseFloat((1 - w * (n - 1)).toFixed(4)) : w })));
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) { setError(t.errNoName); return; }
    const validTickers = tickers.filter(t => t.ticker.trim());
    if (validTickers.length === 0) { setError(t.errNoTicker); return; }
    const tw = validTickers.reduce((a, b) => a + b.weight, 0);
    if (Math.abs(tw - 1) > 0.01) { setError(t.errWeight((tw * 100).toFixed(1))); return; }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      tickers: validTickers.map(t => ({ ticker: t.ticker.trim().toUpperCase(), weight: t.weight })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{t.createTitle}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.portfolioName}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.portfolioNamePlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.notes}</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Tickers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">{t.holdingsTickers}</label>
              <button
                onClick={autoBalance}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {t.equalAlloc}
              </button>
            </div>

            <div className="space-y-2">
              {tickers.map((tk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={tk.ticker}
                    onChange={e => updateTicker(i, 'ticker', e.target.value.toUpperCase())}
                    placeholder="NVDY"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <input
                      type="number"
                      value={(tk.weight * 100).toFixed(0)}
                      onChange={e => updateTicker(i, 'weight', parseFloat(e.target.value) / 100 || 0)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-right"
                    />
                    <span className="text-slate-500 text-sm">%</span>
                  </div>
                  <button
                    onClick={() => removeTicker(i)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Weight total indicator */}
            <div className={`mt-2 text-xs font-medium ${Math.abs(totalWeight - 1) < 0.01 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {t.weightSummary((totalWeight * 100).toFixed(1))} {Math.abs(totalWeight - 1) < 0.01 ? '✓' : t.weightNeed}
            </div>

            {tickers.length < 10 && (
              <button
                onClick={addTicker}
                className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <PlusCircle size={14} /> {t.addTicker}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {t.createPortfolio}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────
function PortfolioCard({ portfolio, onDeleted, defaultExpanded = false }: {
  portfolio: any;
  onDeleted: () => void;
  defaultExpanded?: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);

  // ── Principal Calculator State ──
  const principal = 100000;

  // ── Inline Name Edit State ──
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(portfolio.name);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const renameMutation = trpc.portfolio.update.useMutation({
    onSuccess: () => utils.portfolio.list.invalidate(),
    onError: () => setNameInput(portfolio.name),
  });

  const startNameEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameInput(portfolio.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const commitNameEdit = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameInput(portfolio.name); setEditingName(false); return; }
    setEditingName(false);
    if (trimmed !== portfolio.name) {
      renameMutation.mutate({ id: portfolio.id, name: trimmed, tickers: portfolio.tickers });
    }
  };

  const cancelNameEdit = () => {
    setNameInput(portfolio.name);
    setEditingName(false);
  };

  // ── Edit Mode State ──
  const [editing, setEditing] = useState(false);
  const [editTickers, setEditTickers] = useState<TickerInput[]>([]);
  const [editError, setEditError] = useState('');
  // AI 自动分配目标
  const [targetYield, setTargetYield] = useState('');
  const [targetReturn, setTargetReturn] = useState('');
  const [aiAllocLoading, setAiAllocLoading] = useState(false);
  const [aiAllocReason, setAiAllocReason] = useState('');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const fetchDataMutation = trpc.portfolio.fetchMarketData.useMutation({
    onSuccess: (data) => setPortfolioData(data as PortfolioData),
  });

  const deleteMutation = trpc.portfolio.delete.useMutation({
    onSuccess: () => { utils.portfolio.list.invalidate(); onDeleted(); },
  });

  const updateMutation = trpc.portfolio.update.useMutation({
    onSuccess: (_data, variables) => {
      utils.portfolio.list.invalidate();
      setEditing(false);
      setPortfolioData(null);
      setExpanded(true);
      // Do NOT pass tickers here — let the server read the freshly-saved tickers from DB.
      // Passing variables.tickers caused a race condition where stale tickers were used.
      // forceRefresh: true ensures the cleared cache is not reused.
      fetchDataMutation.mutate({
        id: portfolio.id,
        forceRefresh: true,
      });
    },
    onError: (e) => setEditError(e.message),
  });

  const autoAllocateMutation = trpc.aiAdvisor.autoAllocate.useMutation({
    onSuccess: (data) => {
      const alloc = data.allocations;
      setEditTickers(prev => prev.map(tk => {
        const found = alloc.find((a: { ticker: string; weight: number }) => a.ticker === tk.ticker.toUpperCase());
        return found ? { ...tk, weight: found.weight } : tk;
      }));
      setAiAllocReason(data.reason ?? '');
      setAiAllocLoading(false);
    },
    onError: (e) => {
      setEditError(e.message);
      setAiAllocLoading(false);
    },
  });

  const aiMutation = trpc.aiAdvisor.getRebalanceSuggestion.useMutation({
    onSuccess: (data) => {
      setAiSuggestion(data.suggestion);
      setAiLoading(false);
    },
    onError: (e) => {
      setAiError(e.message);
      setAiLoading(false);
    },
  });

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTickers(portfolio.tickers.map((tk: TickerInput) => ({ ...tk })));
    setEditError('');
    setAiAllocReason('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError('');
  };

  const addEditTicker = () => {
    if (editTickers.length >= 10) return;
    const equalWeight = parseFloat((1 / (editTickers.length + 1)).toFixed(4));
    setEditTickers(prev => [
      ...prev.map(tk => ({ ...tk, weight: equalWeight })),
      { ticker: '', weight: equalWeight },
    ]);
  };

  const removeEditTicker = (idx: number) => {
    if (editTickers.length <= 1) return;
    const remaining = editTickers.filter((_, i) => i !== idx);
    const equalWeight = parseFloat((1 / remaining.length).toFixed(4));
    setEditTickers(remaining.map(tk => ({ ...tk, weight: equalWeight })));
  };

  const updateEditTicker = (idx: number, field: 'ticker' | 'weight', value: string | number) => {
    setEditTickers(prev => prev.map((tk, i) =>
      i === idx ? { ...tk, [field]: field === 'weight' ? parseFloat(value as string) || 0 : (value as string).toUpperCase() } : tk
    ));
  };

  const rebalanceWeights = () => {
    const equal = parseFloat((1 / editTickers.length).toFixed(4));
    setEditTickers(prev => prev.map(tk => ({ ...tk, weight: equal })));
  };

  const saveEdit = () => {
    const totalWeight = editTickers.reduce((s, tk) => s + tk.weight, 0);
    const hasEmpty = editTickers.some(tk => !tk.ticker.trim());
    if (hasEmpty) { setEditError(t.errFillTicker); return; }
    if (Math.abs(totalWeight - 1) > 0.01) { setEditError(t.errWeightTotal((totalWeight * 100).toFixed(1))); return; }
    // Normalize tickers to uppercase before saving
    const normalizedTickers = editTickers.map(tk => ({ ...tk, ticker: tk.ticker.trim().toUpperCase() }));
    updateMutation.mutate({ id: portfolio.id, tickers: normalizedTickers });
  };

  // Auto-load data when defaultExpanded is true
  React.useEffect(() => {
    if (defaultExpanded && !portfolioData && !fetchDataMutation.isPending) {
      fetchDataMutation.mutate({ id: portfolio.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpanded, portfolio.id]);

  const handleExpand = () => {
    if (!expanded && !portfolioData) {
      fetchDataMutation.mutate({ id: portfolio.id });
    }
    setExpanded(!expanded);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchDataMutation.mutate({ id: portfolio.id, forceRefresh: true });
  };

  const handleAiAdvice = () => {
    setShowAi(true);
    setAiSuggestion(null);
    setAiError('');
    setAiLoading(true);
    aiMutation.mutate({ portfolioId: portfolio.id, lang });
  };

  const isLoading = fetchDataMutation.isPending;
  const pd = portfolioData;

  // Pie chart data
  const pieData = portfolio.tickers.map((tk: TickerInput, i: number) => ({
    name: tk.ticker,
    value: parseFloat((tk.weight * 100).toFixed(1)),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between p-5">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
          onClick={(e) => { if (editingName) return; handleExpand(); }}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={commitNameEdit}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitNameEdit(); } if (e.key === 'Escape') cancelNameEdit(); }}
                onClick={e => e.stopPropagation()}
                className="font-semibold text-slate-900 text-base bg-transparent border-b-2 border-indigo-500 outline-none w-full max-w-[220px]"
                maxLength={64}
                autoFocus
              />
            ) : (
              <h3
                className="font-semibold text-slate-900 text-base cursor-text hover:text-indigo-600 transition-colors group flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); startNameEdit(e); }}
                title={t.editNameHint}
              >
                {lang === 'en' && portfolio.nameEn ? portfolio.nameEn : portfolio.name}
                {lang === 'en' && !portfolio.nameEn && (
                  <Loader2 size={10} className="animate-spin text-slate-300 ml-1" />
                )}
                <Pencil size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </h3>
            )}
            {(lang === 'en' ? (portfolio.descriptionEn || portfolio.description) : portfolio.description) && (
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en' ? (portfolio.descriptionEn || portfolio.description) : portfolio.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              {portfolio.tickers.map((tk: TickerInput, i: number) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                  style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                  {tk.ticker}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pd && (
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-center">
                <div className="text-xs text-slate-400">{t.dividendRate}</div>
                <div className="text-sm font-bold text-amber-600">{fmtPct(pd.weightedYield)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">{t.oneYearReturnShort}</div>
                <div className={`text-sm font-bold ${pd.weightedReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {fmtPct(pd.weightedReturn)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">{t.volatility}</div>
                <div className="text-sm font-bold text-slate-600">{fmtNum(pd.weightedVolatility)}%</div>
              </div>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title={t.refreshData}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={startEdit}
            className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title={t.editPortfolio}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(t.confirmDelete(portfolio.name))) deleteMutation.mutate({ id: portfolio.id }); }}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleExpand}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Edit Mode Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-bold text-slate-900">{t.editTitle(portfolio.name)}</h2>
              <button onClick={cancelEdit} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Ticker List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-3">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 font-medium px-1">
                <div className="col-span-5">{t.colTickerCode}</div>
                <div className="col-span-5">{t.colWeight}</div>
                <div className="col-span-2"></div>
              </div>

              {editTickers.map((tk, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={tk.ticker}
                    onChange={(e) => updateEditTicker(idx, 'ticker', e.target.value)}
                    placeholder="e.g. NVDY"
                    className="col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-medium uppercase bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                  />
                  <div className="col-span-5 flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={(tk.weight * 100).toFixed(2)}
                      onChange={(e) => updateEditTicker(idx, 'weight', parseFloat(e.target.value) / 100)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                  <button
                    onClick={() => removeEditTicker(idx)}
                    disabled={editTickers.length <= 1}
                    className="col-span-2 flex items-center justify-center p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Weight Summary */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-xs text-slate-400">
                  {t.weightTotal} <span className={`font-semibold ${
                    Math.abs(editTickers.reduce((s, tk) => s + tk.weight, 0) - 1) <= 0.01
                      ? 'text-emerald-600' : 'text-red-500'
                  }`}>{(editTickers.reduce((s, tk) => s + tk.weight, 0) * 100).toFixed(2)}%</span>
                </span>
                <button
                  onClick={rebalanceWeights}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {t.equalDistribute}
                </button>
              </div>

              {/* Add Ticker Button */}
              {editTickers.length < 10 && (
                <button
                  onClick={addEditTicker}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm"
                >
                  <PlusCircle size={14} /> {t.addTicker}
                </button>
              )}

              {/* AI 目标分配 */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                  <BrainCircuit size={13} />
                  {t.aiAutoAlloc}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">{t.targetYield}</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.5"
                      placeholder="20"
                      value={targetYield}
                      onChange={e => setTargetYield(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">{t.targetReturn}</label>
                    <input
                      type="number"
                      min="-100"
                      max="500"
                      step="0.5"
                      placeholder="25"
                      value={targetReturn}
                      onChange={e => setTargetReturn(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        const validTickers = editTickers.map(tk => tk.ticker.trim().toUpperCase()).filter(tk => tk.length > 0);
                        if (validTickers.length === 0) return;
                        setAiAllocLoading(true);
                        setEditError('');
                        autoAllocateMutation.mutate({
                          tickers: validTickers,
                          targetYield: targetYield ? parseFloat(targetYield) : undefined,
                          targetReturn: targetReturn ? parseFloat(targetReturn) : undefined,
                        });
                      }}
                      disabled={aiAllocLoading || editTickers.filter(tk => tk.ticker.trim()).length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {aiAllocLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {aiAllocLoading ? t.aiAllocating : t.aiAllocate}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-500 leading-relaxed">
                  {t.aiAllocDesc(targetYield || '___', targetReturn || '___')}
                </p>
                {aiAllocReason && (
                  <div className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-indigo-100">
                    <BrainCircuit size={11} className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-600 leading-relaxed">{aiAllocReason}</p>
                  </div>
                )}
              </div>

              {editError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                  <AlertTriangle size={14} /> {editError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-4">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={saveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">{t.loadingData}</span>
            </div>
          ) : pd ? (
            <div className="p-5 space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-600 mb-0.5">
                      <DollarSign size={12} />
                      <span className="text-xs font-medium">{t.weightedYield}</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">{fmtPct(pd.weightedYield)}</div>
                    <div className="text-xs text-amber-500">{t.ttmAnnualized}</div>
                  </div>
                </div>
                <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${pd.weightedReturn >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div>
                    <div className={`flex items-center gap-1 mb-0.5 ${pd.weightedReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {pd.weightedReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span className="text-xs font-medium">{t.oneYearReturn}</span>
                    </div>
                    <div className={`text-2xl font-bold ${pd.weightedReturn >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {fmtPct(pd.weightedReturn)}
                    </div>
                    <div className={`text-xs ${pd.weightedReturn >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>{t.weightedAvg}</div>
                  </div>
                </div>
                {/* Weekly Income Card - fixed $100k principal */}
                <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">{t.weeklyIncome}</div>
                    {(() => {
                      const weeklyIncome = pd.holdings.reduce((sum: number, h: any) => {
                        if (!h.marketData) return sum;
                        const annualYield = h.marketData.dividendYield / 100;
                        return sum + principal * h.weight * annualYield / 52;
                      }, 0);
                      const annualIncome = pd.holdings.reduce((sum: number, h: any) => {
                        if (!h.marketData) return sum;
                        return sum + principal * h.weight * (h.marketData.dividendYield / 100);
                      }, 0);
                      return (
                        <>
                          <div className="text-2xl font-bold text-slate-900">${Math.round(weeklyIncome).toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{t.annualIncome} ${Math.round(annualIncome).toLocaleString()}</div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Cash Flow Weekly Calendar */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-500" />
                      <h4 className="text-sm font-semibold text-slate-700">{t.cashFlowTitle}</h4>
                    </div>
                    {/* Legend: weekly ETFs */}
                    <div className="flex items-center gap-3">
                      {pd.holdings.filter(h => h.marketData?.frequency === 'Weekly' || h.marketData?.frequency === 'Monthly').map((h) => (
                        <div key={h.ticker} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[pd.holdings.indexOf(h) % COLORS.length] }} />
                          <span className="text-xs text-slate-500">{h.ticker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Weekly bars: 4 weeks — linked to principal */}
                  {(() => {
                    const weeklyHoldings = pd.holdings.filter(h => h.marketData?.frequency === 'Weekly');
                    const monthlyHoldings = pd.holdings.filter(h => h.marketData?.frequency === 'Monthly');
                    const weeks = [1, 2, 3, 4].map(w => {
                      let amount = 0;
                      weeklyHoldings.forEach(h => {
                        if (h.marketData) {
                          amount += principal * h.weight * (h.marketData.dividendYield / 100) / 52;
                        }
                      });
                      if (w === 4) {
                        monthlyHoldings.forEach(h => {
                          if (h.marketData) {
                            amount += principal * h.weight * (h.marketData.dividendYield / 100) / 12;
                          }
                        });
                      }
                      const breakdown: { ticker: string; amount: number; color: string }[] = [];
                      weeklyHoldings.forEach(h => {
                        if (h.marketData) {
                          const idx = pd.holdings.indexOf(h);
                          breakdown.push({
                            ticker: h.ticker,
                            amount: principal * h.weight * (h.marketData.dividendYield / 100) / 52,
                            color: COLORS[idx % COLORS.length],
                          });
                        }
                      });
                      if (w === 4) {
                        monthlyHoldings.forEach(h => {
                          if (h.marketData) {
                            const idx = pd.holdings.indexOf(h);
                            breakdown.push({
                              ticker: h.ticker,
                              amount: principal * h.weight * (h.marketData.dividendYield / 100) / 12,
                              color: COLORS[idx % COLORS.length],
                            });
                          }
                        });
                      }
                      const weekLabel = lang === 'zh' ? `第 ${w} 周` : `Week ${w}`;
                      return { week: weekLabel, amount: Math.round(amount), breakdown };
                    });

                    const maxAmount = Math.max(...weeks.map(w => w.amount), 1);

                    return (
                      <>
                        <div className="flex gap-3 px-2">
                          {weeks.map((w, wi) => (
                            <div
                              key={wi}
                              className="flex-1 flex flex-col items-center relative"
                              onMouseEnter={() => setHoveredWeek(wi)}
                              onMouseLeave={() => setHoveredWeek(null)}
                            >
                              {/* Tooltip */}
                              {hoveredWeek === wi && w.breakdown.length > 0 && (
                                <div className="absolute bottom-full mb-2 z-10 bg-slate-800 rounded-lg px-3 py-2 shadow-lg min-w-[120px]">
                                  {w.breakdown.map((b) => (
                                    <div key={b.ticker} className="flex justify-between gap-3 text-[11px]">
                                      <span style={{ color: b.color }} className="font-mono font-semibold">{b.ticker}</span>
                                      <span className="text-white">${Math.round(b.amount).toLocaleString()}</span>
                                    </div>
                                  ))}
                                  {w.breakdown.length > 1 && (
                                    <div className="border-t border-slate-600 mt-1 pt-1 flex justify-between">
                                      <span className="text-[10px] text-slate-400">{lang === 'zh' ? '合计' : 'Total'}</span>
                                      <span className="text-[10px] text-white font-semibold">${w.amount.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Bar area */}
                              <div className="w-full flex items-end" style={{ height: '100px' }}>
                                <div
                                  className="w-full rounded-t-lg transition-all duration-300 cursor-pointer"
                                  style={{
                                    height: `${Math.max((w.amount / maxAmount) * 100, 4)}%`,
                                    backgroundColor: wi === 3 ? '#6366F1' : '#818CF8',
                                    opacity: hoveredWeek === wi ? 1 : 0.85,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* 金额标签行 */}
                        <div className="flex gap-3 px-2 mt-1">
                          {weeks.map((w, wi) => (
                            <div key={wi} className="flex-1 text-center">
                              <span className="text-[11px] font-semibold text-slate-700">
                                {w.amount > 0 ? `$${w.amount.toLocaleString()}` : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* 周标签行 */}
                        <div className="flex gap-3 px-2 mt-0.5">
                          {weeks.map((w, wi) => (
                            <div key={wi} className="flex-1 text-center">
                              <span className="text-[10px] text-slate-400">{w.week}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          <p className="text-[11px] text-slate-400">
                            {t.principal} <span className="font-semibold text-slate-600">${principal.toLocaleString()}</span>，
                            {weeklyHoldings.length > 0 ? t.weeksOnly(weeklyHoldings.map(h => h.ticker).join('/')) : ''}
                            {weeklyHoldings.length > 0 && monthlyHoldings.length > 0 ? '，' : ''}
                            {monthlyHoldings.length > 0 ? t.week4Overlap(monthlyHoldings.map(h => h.ticker).join('/')) : ''}
                            {weeklyHoldings.length === 0 && monthlyHoldings.length === 0 ? t.noPeriodicHoldings : ''}。
                          </p>
                          <button className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                            {t.volatilityLow}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Allocation Pie with legend list */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-indigo-500" />
                      <h4 className="text-sm font-semibold text-slate-700">{t.allocationTitle}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">{t.aiAdjustedLabel}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Donut chart */}
                    <div className="shrink-0">
                      <ResponsiveContainer width={120} height={120}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={55}
                            dataKey="value" nameKey="name" paddingAngle={2} startAngle={90} endAngle={-270}>
                            {pieData.map((entry: any, index: number) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v}%`, t.weight]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend list */}
                    <div className="flex-1 space-y-2">
                      {pd.holdings.map((h, i) => {
                        const aiAdj = (portfolio.aiAdjust as Record<string, number> | undefined)?.[h.ticker];
                        return (
                          <div key={h.ticker} className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold w-10" style={{ color: COLORS[i % COLORS.length] }}>{h.ticker}</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] + '30' }}>
                              <div className="h-full rounded-full" style={{ width: `${(h.weight * 100).toFixed(1)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                            </div>
                            <span className="text-xs text-slate-500 w-14 text-right">{(h.weight * 100).toFixed(2)}%</span>
                            {aiAdj != null ? (
                              <span className={`text-xs font-semibold w-14 text-right ${
                                aiAdj > 0 ? 'text-emerald-600' : aiAdj < 0 ? 'text-red-500' : 'text-slate-300'
                              }`}>
                                {aiAdj > 0 ? '▲' : aiAdj < 0 ? '▼' : '— '}{aiAdj !== 0 ? `${Math.abs(aiAdj).toFixed(2)}%` : '0.00%'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 w-14 text-right">— 0.00%</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Holdings Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} className="text-indigo-500" />
                    <h4 className="text-sm font-semibold text-slate-700">{t.holdingsTitle}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{t.dataUpdated} {pd.fetchedAt ? new Date(pd.fetchedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US') : '—'}</span>
                    <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 font-medium">{t.dataSource}</a>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">{t.colCode}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">{t.colAllocation}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">{t.colAum}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">{t.colYield}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">
                          <span className="inline-flex items-center justify-end gap-1">
                            {t.colReturn}
                            <span className="relative group cursor-help">
                              <Info size={11} className="text-slate-400 hover:text-indigo-500 transition-colors" />
                              <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 w-52 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                                {t.colReturnTooltip}
                              </span>
                            </span>
                          </span>
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">{t.colFreq}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">{t.colWeekly}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">{t.colAiAdj}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pd.holdings.map((h, i) => {
                        const md = h.marketData;
                        const freq = md?.frequency ?? 'None';
                        // 计算周到账（仅 Weekly/Monthly ETF）
                        const weeklyIncome = (() => {
                          if (!md) return null;
                          if (md.frequency === 'Weekly') {
                            return md.ttmDividendPerShare / 52;
                          } else if (md.frequency === 'Monthly') {
                            return md.ttmDividendPerShare / 12;
                          }
                          return null;
                        })();
                        const aiAdj = (portfolio.aiAdjust as Record<string, number> | undefined)?.[h.ticker];
                        return (
                          <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-base"
                                style={{ color: COLORS[i % COLORS.length] }}>
                                {h.ticker}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-semibold text-slate-600">{(h.weight * 100).toFixed(2)}%</span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 text-sm">
                              {md?.aumDisplay ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                              {md ? `${md.dividendYield.toFixed(2)}%` : '—'}
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold ${md && md.oneYearReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {md ? fmtPct(md.oneYearReturn) : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <FreqBadge freq={freq} />
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                              {weeklyIncome != null ? `$${Math.round(weeklyIncome * 1000)}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {aiAdj != null ? (
                                <span className={`font-semibold text-sm ${
                                  aiAdj > 0 ? 'text-emerald-600' : aiAdj < 0 ? 'text-red-500' : 'text-slate-400'
                                }`}>
                                  {aiAdj > 0 ? '▲' : aiAdj < 0 ? '▼' : '— '}{aiAdj !== 0 ? `${Math.abs(aiAdj).toFixed(2)}%` : '0.00%'}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-sm">— 0.00%</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Rebalancing Section */}
              <div className="border border-indigo-100 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-indigo-50">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-indigo-600" />
                    <h4 className="text-sm font-semibold text-indigo-900">{t.aiTitle}</h4>
                  </div>
                  <button
                    onClick={handleAiAdvice}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                    {aiLoading ? t.aiAnalyzing : t.aiGenerate}
                  </button>
                </div>

                {showAi && (
                  <div className="p-4">
                    {aiLoading && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                        <Loader2 size={16} className="animate-spin" />
                        {t.aiThinking}
                      </div>
                    )}
                    {aiError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertTriangle size={14} /> {aiError}
                      </div>
                    )}
                    {aiSuggestion && !aiLoading && (
                      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                        {aiSuggestion}
                      </div>
                    )}
                    {!aiLoading && !aiSuggestion && !aiError && (
                      <div className="text-slate-400 text-sm py-2">{t.aiWaiting}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : fetchDataMutation.isError ? (
            <div className="flex items-center justify-center py-8 gap-2 text-red-500 text-sm">
              <AlertTriangle size={16} /> {t.loadFailed}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Switcher Card ─────────────────────────────────────────────────
function PortfolioSwitcherCard({ portfolio, isActive, onClick }: {
  portfolio: any;
  isActive: boolean;
  onClick: () => void;
}) {
  const lang = useLang();
  const tickers: string[] = (portfolio.tickers ?? []).map((t: any) => t.ticker);
  const displayName = lang === 'en' && portfolio.nameEn ? portfolio.nameEn : portfolio.name;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start px-3 py-2.5 rounded-xl border transition-all text-left w-[140px] h-[72px] ${
        isActive
          ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      <span className={`text-xs font-semibold truncate w-full ${
        isActive ? 'text-white' : 'text-slate-800'
      }`}>
        {displayName}
        {lang === 'en' && !portfolio.nameEn && (
          <Loader2 size={8} className="inline animate-spin ml-1 opacity-50" />
        )}
      </span>
      <div className="flex flex-wrap gap-0.5 mt-1.5">
        {tickers.slice(0, 4).map((t: string) => (
          <span
            key={t}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {t}
          </span>
        ))}
        {tickers.length > 4 && (
          <span className={`text-[9px] px-1 py-0.5 rounded-md ${
            isActive ? 'text-white/70' : 'text-slate-400'
          }`}>+{tickers.length - 4}</span>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIPortfolio() {
  const [showCreate, setShowCreate] = useState(false);
  const [activePortfolioId, setActivePortfolioId] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
  });
  const utils = trpc.useUtils();

  const t = T[lang];

  const { data: portfolios, isLoading } = trpc.portfolio.list.useQuery();

  // Auto-select first portfolio when loaded
  React.useEffect(() => {
    if (portfolios && portfolios.length > 0 && activePortfolioId === null) {
      setActivePortfolioId(portfolios[0].id);
    }
  }, [portfolios, activePortfolioId]);

  const handleCreated = useCallback(() => {
    utils.portfolio.list.invalidate();
  }, [utils]);

  const translateNameMutation = trpc.portfolio.translateName.useMutation({
    onSuccess: () => utils.portfolio.list.invalidate(),
  });

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    try { localStorage.setItem('rwa-lang', next); } catch {}
    // When switching to English, auto-translate portfolios that don't have an English name yet
    if (next === 'en' && portfolios) {
      portfolios.forEach((p: any) => {
        if (!p.nameEn) {
          translateNameMutation.mutate({
            id: p.id,
            name: p.name,
            description: p.description ?? undefined,
          });
        }
      });
    }
  };

  const activePortfolio = portfolios?.find((p: any) => p.id === activePortfolioId);

  return (
    <LangContext.Provider value={lang}>
      <div className="min-h-screen bg-slate-50">
        {/* Top Nav */}
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <span className="font-bold text-slate-900 text-base">RWAlpha.io</span>
              <span className="hidden sm:block text-slate-300 mx-1">|</span>
              <span className="hidden sm:block text-slate-500 text-sm">{t.tagline}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
                title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
              >
                <Globe size={14} />
                <span>{lang === 'zh' ? 'EN' : '中文'}</span>
              </button>
              <a href="/landing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
                {t.officialSite}
              </a>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle size={15} />
                <span>{t.newPortfolio}</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Page Header with Portfolio Switcher */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{t.pageTitle}</h1>
                <p className="text-slate-500 text-sm">
                  {t.pageDesc}
                </p>
              </div>
              {/* Portfolio Switcher Cards */}
              {portfolios && portfolios.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {portfolios.map((p: any) => (
                    <PortfolioSwitcherCard
                      key={p.id}
                      portfolio={p}
                      isActive={p.id === activePortfolioId}
                      onClick={() => setActivePortfolioId(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Portfolio Card */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
              <span>{t.loading}</span>
            </div>
          ) : portfolios && portfolios.length > 0 ? (
            activePortfolio ? (
              <PortfolioCard
                key={activePortfolio.id}
                portfolio={activePortfolio}
                defaultExpanded={true}
                onDeleted={() => {
                  utils.portfolio.list.invalidate();
                  setActivePortfolioId(null);
                }}
              />
            ) : null
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <Layers size={32} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.noPortfolio}</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-6">
                {t.noPortfolioDesc}
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle size={16} />
                {t.createFirst}
              </button>

              {/* Example tickers hint */}
              <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100 text-left max-w-sm">
                <p className="text-xs font-semibold text-slate-500 mb-2">{t.exampleTickers}</p>
                <div className="flex flex-wrap gap-1.5">
                  {['NVDY', 'QQQI', 'QQQM', 'VGT', 'MSFO', 'CONY', 'AMZY', 'TSLY', 'JEPI', 'SCHD'].map(tk => (
                    <span key={tk} className="text-xs px-2 py-1 bg-slate-50 rounded-lg font-mono text-slate-600 border border-slate-100">
                      {tk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <CreatePortfolioModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
      </div>
    </LangContext.Provider>
  );
}
