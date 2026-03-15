import React, { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import {
  PlusCircle, Trash2, RefreshCw, BrainCircuit, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar, Layers,
  X, Edit2, Check, AlertTriangle, Loader2, Zap, Info, Pencil
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

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

const freqBadge: Record<string, { label: string; color: string }> = {
  Weekly: { label: '每周', color: 'bg-amber-100 text-amber-700' },
  Monthly: { label: '每月', color: 'bg-blue-100 text-blue-700' },
  Quarterly: { label: '每季', color: 'bg-purple-100 text-purple-700' },
  Annual: { label: '每年', color: 'bg-slate-100 text-slate-600' },
  None: { label: '无派息', color: 'bg-slate-100 text-slate-400' },
};

// ─── Create Portfolio Modal ───────────────────────────────────────────────────
function CreatePortfolioModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
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
    if (!name.trim()) { setError('请输入组合名称'); return; }
    const validTickers = tickers.filter(t => t.ticker.trim());
    if (validTickers.length === 0) { setError('请至少添加一个 Ticker'); return; }
    const tw = validTickers.reduce((a, b) => a + b.weight, 0);
    if (Math.abs(tw - 1) > 0.01) { setError(`权重合计 ${(tw * 100).toFixed(1)}%，需等于 100%`); return; }
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
          <h2 className="text-xl font-bold text-slate-900">创建新组合</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">组合名称 *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：高收益派息组合"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">备注（可选）</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简短描述这个组合的策略"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Tickers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">持仓 Ticker 与权重</label>
              <button
                onClick={autoBalance}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                均等分配
              </button>
            </div>

            <div className="space-y-2">
              {tickers.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={t.ticker}
                    onChange={e => updateTicker(i, 'ticker', e.target.value.toUpperCase())}
                    placeholder="NVDY"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <input
                      type="number"
                      value={(t.weight * 100).toFixed(0)}
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
              权重合计：{(totalWeight * 100).toFixed(1)}% {Math.abs(totalWeight - 1) < 0.01 ? '✓' : '（需等于 100%）'}
            </div>

            {tickers.length < 10 && (
              <button
                onClick={addTicker}
                className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <PlusCircle size={14} /> 添加 Ticker
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
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            创建组合
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
      setPortfolioData(null); // clear cached data
      // Pass the new tickers directly to avoid DB read race condition
      setExpanded(true);
      fetchDataMutation.mutate({
        id: portfolio.id,
        forceRefresh: true,
        tickers: variables.tickers,
      });
    },
    onError: (e) => setEditError(e.message),
  });

  const autoAllocateMutation = trpc.aiAdvisor.autoAllocate.useMutation({
    onSuccess: (data) => {
      // Apply AI-suggested weights to editTickers
      const alloc = data.allocations;
      setEditTickers(prev => prev.map(t => {
        const found = alloc.find((a: { ticker: string; weight: number }) => a.ticker === t.ticker.toUpperCase());
        return found ? { ...t, weight: found.weight } : t;
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
    setEditTickers(portfolio.tickers.map((t: TickerInput) => ({ ...t })));
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
    const newWeight = parseFloat((1 / (editTickers.length + 1)).toFixed(4));
    const equalWeight = parseFloat((1 / (editTickers.length + 1)).toFixed(4));
    setEditTickers(prev => [
      ...prev.map(t => ({ ...t, weight: equalWeight })),
      { ticker: '', weight: equalWeight },
    ]);
  };

  const removeEditTicker = (idx: number) => {
    if (editTickers.length <= 1) return;
    const remaining = editTickers.filter((_, i) => i !== idx);
    const equalWeight = parseFloat((1 / remaining.length).toFixed(4));
    setEditTickers(remaining.map(t => ({ ...t, weight: equalWeight })));
  };

  const updateEditTicker = (idx: number, field: 'ticker' | 'weight', value: string | number) => {
    setEditTickers(prev => prev.map((t, i) =>
      i === idx ? { ...t, [field]: field === 'weight' ? parseFloat(value as string) || 0 : (value as string).toUpperCase() } : t
    ));
  };

  const rebalanceWeights = () => {
    const equal = parseFloat((1 / editTickers.length).toFixed(4));
    setEditTickers(prev => prev.map(t => ({ ...t, weight: equal })));
  };

  const saveEdit = () => {
    const totalWeight = editTickers.reduce((s, t) => s + t.weight, 0);
    const hasEmpty = editTickers.some(t => !t.ticker.trim());
    if (hasEmpty) { setEditError('请填写所有 Ticker 代码'); return; }
    if (Math.abs(totalWeight - 1) > 0.01) { setEditError(`权重合计必须为 100%（当前 ${(totalWeight * 100).toFixed(1)}%）`); return; }
    updateMutation.mutate({ id: portfolio.id, tickers: editTickers });
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
    aiMutation.mutate({ portfolioId: portfolio.id, lang: 'zh' });
  };

  const isLoading = fetchDataMutation.isPending;
  const pd = portfolioData;

  // Pie chart data
  const pieData = portfolio.tickers.map((t: TickerInput, i: number) => ({
    name: t.ticker,
    value: parseFloat((t.weight * 100).toFixed(1)),
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
                title="点击修改名称"
              >
                {portfolio.name}
                <Pencil size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </h3>
            )}
            {portfolio.description && (
              <p className="text-xs text-slate-500 mt-0.5">{portfolio.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              {portfolio.tickers.map((t: TickerInput, i: number) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                  style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                  {t.ticker}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pd && (
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-center">
                <div className="text-xs text-slate-400">派息率</div>
                <div className="text-sm font-bold text-amber-600">{fmtPct(pd.weightedYield)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">1年回报</div>
                <div className={`text-sm font-bold ${pd.weightedReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {fmtPct(pd.weightedReturn)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">波动率</div>
                <div className="text-sm font-bold text-slate-600">{fmtNum(pd.weightedVolatility)}%</div>
              </div>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="刷新数据"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={startEdit}
            className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            title="编辑组合"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm(`确认删除组合「${portfolio.name}」？`)) deleteMutation.mutate({ id: portfolio.id }); }}
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
              <h2 className="text-lg font-bold text-slate-900">编辑组合「{portfolio.name}」</h2>
              <button onClick={cancelEdit} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Ticker List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-3">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 font-medium px-1">
                <div className="col-span-5">Ticker 代码</div>
                <div className="col-span-5">权重 (%)</div>
                <div className="col-span-2"></div>
              </div>

              {editTickers.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={t.ticker}
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
                      value={(t.weight * 100).toFixed(2)}
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
                  权重合计: <span className={`font-semibold ${
                    Math.abs(editTickers.reduce((s, t) => s + t.weight, 0) - 1) <= 0.01
                      ? 'text-emerald-600' : 'text-red-500'
                  }`}>{(editTickers.reduce((s, t) => s + t.weight, 0) * 100).toFixed(2)}%</span>
                </span>
                <button
                  onClick={rebalanceWeights}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  平均分配
                </button>
              </div>

              {/* Add Ticker Button */}
              {editTickers.length < 10 && (
                <button
                  onClick={addEditTicker}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm"
                >
                  <PlusCircle size={14} /> 添加 Ticker
                </button>
              )}

              {/* AI 目标分配 */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                  <BrainCircuit size={13} />
                  AI 自动分配
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">目标派息率 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.5"
                      placeholder="如 20"
                      value={targetYield}
                      onChange={e => setTargetYield(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">目标年化回报 (%)</label>
                    <input
                      type="number"
                      min="-100"
                      max="500"
                      step="0.5"
                      placeholder="如 25"
                      value={targetReturn}
                      onChange={e => setTargetReturn(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        const validTickers = editTickers.map(t => t.ticker.trim().toUpperCase()).filter(t => t.length > 0);
                        if (validTickers.length === 0) return;
                        setAiAllocLoading(true);
                        setEditError('');
                        autoAllocateMutation.mutate({
                          tickers: validTickers,
                          targetYield: targetYield ? parseFloat(targetYield) : undefined,
                          targetReturn: targetReturn ? parseFloat(targetReturn) : undefined,
                        });
                      }}
                      disabled={aiAllocLoading || editTickers.filter(t => t.ticker.trim()).length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {aiAllocLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {aiAllocLoading ? '分配中...' : 'AI 分配'}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-500 leading-relaxed">
                  以派息率 <span className="font-semibold">{targetYield || '___'}%</span>、年化回报 <span className="font-semibold">{targetReturn || '___'}%</span> 为目标，AI 自动分配权重
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
                取消
              </button>
              <button
                onClick={saveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                保存更改
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
              <span className="text-sm">正在拉取市场数据...</span>
            </div>
          ) : pd ? (
            <div className="p-5 space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-600 mb-0.5">
                      <DollarSign size={12} />
                      <span className="text-xs font-medium">加权派息率</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">{fmtPct(pd.weightedYield)}</div>
                    <div className="text-xs text-amber-500">TTM 年化</div>
                  </div>
                </div>
                <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${pd.weightedReturn >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div>
                    <div className={`flex items-center gap-1 mb-0.5 ${pd.weightedReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {pd.weightedReturn >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span className="text-xs font-medium">1年总回报</span>
                    </div>
                    <div className={`text-2xl font-bold ${pd.weightedReturn >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {fmtPct(pd.weightedReturn)}
                    </div>
                    <div className={`text-xs ${pd.weightedReturn >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>加权平均</div>
                  </div>
                </div>
                {/* Weekly Income Card - fixed $100k principal */}
                <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">每周到账 (10万本金)</div>
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
                          <div className="text-xs text-slate-400">年收息 ${Math.round(annualIncome).toLocaleString()}</div>
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
                      <h4 className="text-sm font-semibold text-slate-700">现金流周历 (月度模拟)</h4>
                    </div>
                    {/* Legend: weekly ETFs */}
                    <div className="flex items-center gap-3">
                      {pd.holdings.filter(h => h.marketData?.frequency === 'Weekly' || h.marketData?.frequency === 'Monthly').map((h, i) => (
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
                      // 基于本金计算实际到账金额
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
                      // 按 ticker 拆分，用于 tooltip
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
                      return { week: `第 ${w} 周`, amount: Math.round(amount), breakdown };
                    });
                    const maxAmt = Math.max(...weeks.map(w => w.amount), 1);
                    return (
                      <>
                        {/* 柱状图区域：固定高度，柱子从底部对齐 */}
                        <div className="flex items-end gap-3 px-2" style={{ height: '100px' }}>
                          {weeks.map((w, wi) => (
                            <div key={wi} className="flex-1 flex flex-col items-end justify-end group relative h-full">
                              <div
                                className="w-full rounded-t-md transition-all duration-300"
                                style={{
                                  height: `${Math.max((w.amount / maxAmt) * 100, w.amount > 0 ? 6 : 0)}%`,
                                  backgroundColor: wi === 3 ? '#4F46E5' : '#A5B4FC',
                                }}
                              />
                              {/* Hover tooltip: per-ticker breakdown */}
                              {w.breakdown.length > 0 && (
                                <div className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-36 bg-slate-800 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                                  <p className="text-[10px] text-slate-300 font-semibold mb-1">{w.week} 到账明细</p>
                                  {w.breakdown.map(b => (
                                    <div key={b.ticker} className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-mono font-bold" style={{ color: b.color }}>{b.ticker}</span>
                                      <span className="text-[10px] text-white">${Math.round(b.amount).toLocaleString()}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-slate-600 mt-1 pt-1 flex justify-between">
                                    <span className="text-[10px] text-slate-400">合计</span>
                                    <span className="text-[10px] text-white font-semibold">${w.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
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
                            本金 <span className="font-semibold text-slate-600">${principal.toLocaleString()}</span>，
                            {weeklyHoldings.length > 0 ? `前三周仅 ${weeklyHoldings.map(h => h.ticker).join('/')}` : ''}
                            {weeklyHoldings.length > 0 && monthlyHoldings.length > 0 ? '，' : ''}
                            {monthlyHoldings.length > 0 ? `第四周叠加 ${monthlyHoldings.map(h => h.ticker).join('/')}` : ''}
                            {weeklyHoldings.length === 0 && monthlyHoldings.length === 0 ? '暂无周期派息持仓' : ''}。
                          </p>
                          <button className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                            波动率: 低 →
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
                      <h4 className="text-sm font-semibold text-slate-700">资产配比 (NAV)</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">AI 调仓后</span>
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
                          <Tooltip formatter={(v: number) => [`${v}%`, '权重']} />
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
                    <h4 className="text-sm font-semibold text-slate-700">资产清单与派息频率</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>数据最后更新: {pd.fetchedAt ? new Date(pd.fetchedAt).toLocaleDateString('zh-CN') : '—'}</span>
                    <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 font-medium">数据来源: TradingView</a>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">代码</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">AUM（美元）</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">派息率</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">
                          <span className="inline-flex items-center justify-end gap-1">
                            总回报
                            <span className="relative group cursor-help">
                              <Info size={11} className="text-slate-400 hover:text-indigo-500 transition-colors" />
                              <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 w-52 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                                含股息，基于前复权价格计算
                              </span>
                            </span>
                          </span>
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400">频率</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">周到账 (预计)</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">本周 AI 调仓</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pd.holdings.map((h, i) => {
                        const md = h.marketData;
                        const freq = md?.frequency ?? 'None';
                        const badge = freqBadge[freq] ?? freqBadge.None;
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
                        // AI 调仓幅度（从 portfolio.aiAdjust 获取，如没有则显示—）
                        const aiAdj = (portfolio.aiAdjust as Record<string, number> | undefined)?.[h.ticker];
                        // tagline 来自 marketData.description
                        const tagline = md?.description ?? null;
                        return (
                          <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-baseline gap-2">
                                <span className="font-mono font-bold text-base"
                                  style={{ color: COLORS[i % COLORS.length] }}>
                                  {h.ticker}
                                </span>
                                <span className="text-xs text-slate-400">占比 {(h.weight * 100).toFixed(2)}%</span>
                              </div>

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
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>
                                {badge.label}
                              </span>
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
                    <h4 className="text-sm font-semibold text-indigo-900">AI 调仓建议</h4>
                  </div>
                  <button
                    onClick={handleAiAdvice}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                    {aiLoading ? '分析中...' : '生成建议'}
                  </button>
                </div>

                {showAi && (
                  <div className="p-4">
                    {aiLoading && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                        <Loader2 size={16} className="animate-spin" />
                        AI 正在分析您的组合，请稍候...
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
                      <div className="text-slate-400 text-sm py-2">点击「生成建议」获取 AI 调仓分析</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : fetchDataMutation.isError ? (
            <div className="flex items-center justify-center py-8 gap-2 text-red-500 text-sm">
              <AlertTriangle size={16} /> 数据加载失败，请重试
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
  const tickers: string[] = (portfolio.tickers ?? []).map((t: any) => t.ticker);
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
        {portfolio.name}
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
  const utils = trpc.useUtils();

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

  const activePortfolio = portfolios?.find((p: any) => p.id === activePortfolioId);

  return (
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
            <span className="hidden sm:block text-slate-500 text-sm">AI × RWA · 下一代资产管理</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a href="/landing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
              官网
            </a>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={15} />
              <span>新建组合</span>
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
              <h1 className="text-2xl font-bold text-slate-900 mb-1">我的 ETF 组合</h1>
              <p className="text-slate-500 text-sm">
                输入 Ticker 创建自定义组合，实时计算派息率、总回报与 AI 调仓建议
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
            <span>加载中...</span>
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
            <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有组合</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              点击「新建组合」，输入 ETF 或股票的 Ticker，即可创建您的第一个自定义组合
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={16} />
              新建第一个组合
            </button>

            {/* Example tickers hint */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100 text-left max-w-sm">
              <p className="text-xs font-semibold text-slate-500 mb-2">💡 示例组合 Ticker</p>
              <div className="flex flex-wrap gap-1.5">
                {['NVDY', 'QQQI', 'QQQM', 'VGT', 'MSFO', 'CONY', 'AMZY', 'TSLY', 'JEPI', 'SCHD'].map(t => (
                  <span key={t} className="text-xs px-2 py-1 bg-slate-50 rounded-lg font-mono text-slate-600 border border-slate-100">
                    {t}
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
  );
}
