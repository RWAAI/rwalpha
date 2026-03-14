/**
 * VaultApp — Launch App 双金库页面
 * 设计风格：白色底色、简洁卡片、绿色/金色强调色
 * 布局：顶部导航（Logo + Connect Wallet）+ 双金库左右分栏
 *   左侧：本金金库（rINDEX 持仓、NAV、走势图、赎回/认购）
 *   右侧：收益金库（年度派息率、可领收益、立即领取、自动复利、派息明细）
 */

import { useState, useEffect, useRef } from "react";
import { Zap, Wallet, Clock, ChevronRight, ArrowUpRight, HelpCircle, X, Loader2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

// ─── 静态 fallback 数据 ─────────────────────────────────────────────────────

const STATIC_YIELD_HISTORY = [
  { date: '2026-02-21', amount: 784.50, perToken: 0.627 },
  { date: '2026-02-14', amount: 752.20, perToken: 0.602 },
  { date: '2026-02-07', amount: 718.40, perToken: 0.575 },
  { date: '2026-01-31', amount: 695.80, perToken: 0.557 },
  { date: '2026-01-24', amount: 731.60, perToken: 0.585 },
  { date: '2026-01-17', amount: 688.30, perToken: 0.551 },
  { date: '2026-01-10', amount: 712.50, perToken: 0.570 },
  { date: '2026-01-03', amount: 656.70, perToken: 0.525 },
];

const STATIC_VAULT = {
  nav: 129.72,
  nav24hChange: 0.38,
  annualYield: 19.18,
  annualTotalReturn: 29.02,
  navTrend: [
    { date: "Jan 20", value: 126.50 },
    { date: "Jan 27", value: 125.80 },
    { date: "Feb 03", value: 127.20 },
    { date: "Feb 10", value: 128.40 },
    { date: "Feb 17", value: 129.10 },
    { date: "Feb 24", value: 129.72 },
  ],
  lastYieldPerToken: 0.502,
  lastYieldDate: "2026-03-07",
};

type ChartPeriod = "7D" | "1M" | "6M" | "1Y";

// ─── 迷你折线图 ──────────────────────────────────────────────────────────────

function SparkLine({ data }: { data: { date: string; value: number }[] }) {
  const W = 480, H = 120;
  const pad = { top: 16, bottom: 28, left: 48, right: 16 };

  if (!data || data.length < 2) {
    return (
      <div className="w-full flex items-center justify-center text-slate-300 text-sm" style={{ height: 120 }}>
        暂无走势数据
      </div>
    );
  }

  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const px = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const py = (v: number) => pad.top + (1 - (v - minV) / range) * (H - pad.top - pad.bottom);

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(d.value)}`).join(" ");
  const areaD = pathD + ` L ${px(data.length - 1)} ${H - pad.bottom} L ${px(0)} ${H - pad.bottom} Z`;

  const lastPoint = data[data.length - 1];
  const lx = px(data.length - 1);
  const ly = py(lastPoint.value);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(t => {
        const y = pad.top + t * (H - pad.top - pad.bottom);
        const v = maxV - t * range;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">${v.toFixed(1)}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {d.date.slice(5)}
        </text>
      ))}
      <circle cx={lx} cy={ly} r="4" fill="#10b981" />
      <circle cx={lx} cy={ly} r="7" fill="#10b981" fillOpacity="0.2" />
    </svg>
  );
}

// ─── 倒计时组件 ──────────────────────────────────────────────────────────────

function Countdown({ days, hours }: { days: number; hours: number }) {
  const [secs, setSecs] = useState(days * 86400 + hours * 3600);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  return (
    <span className="font-mono text-amber-500 font-bold text-sm">
      {d}d {String(h).padStart(2, "0")}h
    </span>
  );
}

// ─── AI 信号区块 ─────────────────────────────────────────────────────────────

function AiSignalSection({ zh, signal }: {
  zh: boolean;
  signal: {
    signalDate: Date;
    marketSentiment: string | null;
    nvdyVolRisk: string | null;
    qqqiPremium: string | null;
    qqqmVgtMomentum: string | null;
    rebalanceSignal: string | null;
  } | null;
}) {
  const staticSignals = zh ? [
    { label: '市场情绪', value: '谨慎偏多' },
    { label: 'NVDY 波动风险', value: '中等' },
    { label: 'QQQI 期权溢价', value: '偏高' },
    { label: 'QQQM/VGT 动量', value: '偏强' },
    { label: '建议调仓方向', value: '维持当前配比' },
  ] : [
    { label: 'Market Sentiment', value: 'Cautiously Bullish' },
    { label: 'NVDY Vol. Risk', value: 'Moderate' },
    { label: 'QQQI Options Premium', value: 'Elevated' },
    { label: 'QQQM/VGT Momentum', value: 'Positive' },
    { label: 'Rebalance Signal', value: 'Hold Current' },
  ];

  const dbSignals = signal ? (zh ? [
    { label: '市场情绪', value: signal.marketSentiment || '—' },
    { label: 'NVDY 波动风险', value: signal.nvdyVolRisk || '—' },
    { label: 'QQQI 期权溢价', value: signal.qqqiPremium || '—' },
    { label: 'QQQM/VGT 动量', value: signal.qqqmVgtMomentum || '—' },
    { label: '建议调仓方向', value: signal.rebalanceSignal || '—' },
  ] : [
    { label: 'Market Sentiment', value: signal.marketSentiment || '—' },
    { label: 'NVDY Vol. Risk', value: signal.nvdyVolRisk || '—' },
    { label: 'QQQI Options Premium', value: signal.qqqiPremium || '—' },
    { label: 'QQQM/VGT Momentum', value: signal.qqqmVgtMomentum || '—' },
    { label: 'Rebalance Signal', value: signal.rebalanceSignal || '—' },
  ]) : null;

  const signals = dbSignals || staticSignals;
  const signalDate = signal
    ? new Date(signal.signalDate).toLocaleDateString(zh ? 'zh-CN' : 'en-US')
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-base">
          {zh ? 'AI 市场信号' : 'AI Market Signals'}
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-emerald-600 font-medium">
            {zh ? '实时监控中' : 'Live Monitoring'}
          </span>
        </div>
      </div>
      {signalDate && (
        <p className="text-xs text-slate-400 mb-3">
          {zh ? `信号更新于 ${signalDate}` : `Updated ${signalDate}`}
        </p>
      )}
      <div className="space-y-2">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-500">{s.label}</span>
            <span className="text-sm font-semibold text-slate-800">{s.value}</span>
          </div>
        ))}
      </div>
      {!signal && (
        <p className="text-xs text-slate-400 mt-3 text-center">
          {zh ? '（示例数据，请在管理后台更新）' : '(Sample data, update via admin)'}
        </p>
      )}
    </div>
  );
}

// ─── 调仓日志区块 ─────────────────────────────────────────────────────────────

function RebalanceLogSection({ zh, logs }: {
  zh: boolean;
  logs: Array<{
    id: number;
    actionDate: string;
    icon: string | null;
    action: string;
    actionEn: string | null;
    tag: string;
    tagEn: string | null;
  }>;
}) {
  const staticLogs = zh ? [
    { date: '2026-03-10', icon: '⚖️', action: 'NVDY 波动率上升，权重从 25% 临时降至 22%，差额补入 QQQM', tag: '调仓' },
    { date: '2026-03-07', icon: '💰', action: '本周派息 $283，AI 自动将 60% 再投入 QQQI', tag: '再投资' },
    { date: '2026-03-03', icon: '📊', action: '期权溢价回升至历史均值 +1σ，NVDY 权重恢复至目标位 22%', tag: '调仓' },
    { date: '2026-02-24', icon: '🛡️', action: '市场波动加剧，临时将 VGT 权重上调 2%，增强防御', tag: '风控' },
  ] : [
    { date: '2026-03-10', icon: '⚖️', action: 'NVDY vol. spiked; weight trimmed 25% → 22%, proceeds added to QQQM', tag: 'Rebalance' },
    { date: '2026-03-07', icon: '💰', action: 'Weekly dist. $283 received; AI auto-reinvested 60% into QQQI', tag: 'Reinvest' },
    { date: '2026-03-03', icon: '📊', action: 'Options premium rebounded to +1σ; NVDY weight restored to target 22%', tag: 'Rebalance' },
    { date: '2026-02-24', icon: '🛡️', action: 'Market turbulence; VGT weight raised +2% temporarily for defense', tag: 'Risk Ctrl' },
  ];

  const tagColors: Record<string, string> = {
    '调仓': 'bg-amber-100 text-amber-700',
    '再投资': 'bg-blue-100 text-blue-700',
    '风控': 'bg-green-100 text-green-700',
    'Rebalance': 'bg-amber-100 text-amber-700',
    'Reinvest': 'bg-blue-100 text-blue-700',
    'Risk Ctrl': 'bg-green-100 text-green-700',
  };

  const displayLogs = logs.length > 0
    ? logs.map(l => ({
        date: l.actionDate,
        icon: l.icon || '📋',
        action: zh ? l.action : (l.actionEn || l.action),
        tag: zh ? l.tag : (l.tagEn || l.tag),
      }))
    : staticLogs;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-base">
          {zh ? 'AI 调仓日志' : 'AI Rebalancing Log'}
        </h3>
        {logs.length === 0 && (
          <span className="text-xs text-slate-400">
            {zh ? '（示例数据）' : '(Sample data)'}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {displayLogs.map((log, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-base shrink-0 mt-0.5">
              {log.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs text-slate-400 font-mono">{log.date}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagColors[log.tag] || 'bg-slate-100 text-slate-600'}`}>
                  {log.tag}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{log.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

export default function VaultApp() {
  const [connected, setConnected] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [period, setPeriod] = useState<ChartPeriod>("1M");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [spendAmt, setSpendAmt] = useState("");
  const [payToken, setPayToken] = useState<"USDC" | "USDT">("USDC");
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [backedModal, setBackedModal] = useState(false);
  const [weeklyDivModal, setWeeklyDivModal] = useState(false);
  const zh = lang === "zh";

  // ── 从数据库获取数据 ──
  const { data: summary, isLoading: summaryLoading, refetch } = trpc.vault.getSummary.useQuery();
  const { data: divRecords = [] } = trpc.vault.getDividendRecords.useQuery({ limit: 52 });

  // ── 计算展示数据（优先使用数据库数据，否则用静态 fallback）──
  const hasDbData = summary?.hasData ?? false;
  const nav = hasDbData && summary?.nav ? summary.nav : STATIC_VAULT.nav;
  const nav24hChange = hasDbData ? summary!.nav24hChange : STATIC_VAULT.nav24hChange;
  const annualTotalReturn = hasDbData ? summary!.annualTotalReturn : STATIC_VAULT.annualTotalReturn;
  const navTrend = hasDbData && summary!.navTrend.length > 0 ? summary!.navTrend : STATIC_VAULT.navTrend;

  // 年化派息率：基于最新 NVDY 每周派息 × 52 / NAV
  const latestNvdyPerToken = hasDbData && summary?.latestNvdyDiv
    ? summary.latestNvdyDiv.amountPerUnit
    : STATIC_VAULT.lastYieldPerToken;
  const annualYield = nav > 0 ? (latestNvdyPerToken * 52 / nav) * 100 : STATIC_VAULT.annualYield;

  // 模拟用户持仓（实际项目中应从链上/用户账户获取）
  const holdings = 1250.0;
  const principalValue = holdings * nav;
  const pendingYield = holdings * latestNvdyPerToken;
  const totalClaimed = 8240.00; // 示例值

  // 派息历史（优先使用数据库数据）
  const yieldHistory = divRecords.length > 0
    ? divRecords.filter(d => d.ticker === 'NVDY').slice(0, 12).map(d => ({
        date: d.date,
        amount: d.totalAmount ? parseFloat(d.totalAmount) : holdings * parseFloat(d.amountPerUnit),
        perToken: parseFloat(d.amountPerUnit),
      }))
    : STATIC_YIELD_HISTORY;

  const lastYieldDate = hasDbData && summary?.latestNvdyDiv
    ? summary.latestNvdyDiv.date
    : STATIC_VAULT.lastYieldDate;

  const handleClaim = () => {
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 3000);
  };

  const handleConnectWallet = (_walletName: string) => {
    setConnected(true);
    setWalletModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── 钱包连接模拟弹层 ── */}
      {walletModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setWalletModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{zh ? "连接钱包" : "Connect Wallet"}</h2>
              <button onClick={() => setWalletModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { name: 'MetaMask', icon: '🦊', desc: zh ? '浏览器扩展钱包' : 'Browser Extension' },
                { name: 'WalletConnect', icon: '🔗', desc: zh ? '扫码连接移动钱包' : 'Scan with mobile wallet' },
                { name: 'Coinbase Wallet', icon: '🟦', desc: zh ? 'Coinbase 官方钱包' : 'Coinbase official wallet' },
                { name: 'OKX Wallet', icon: '⬤', desc: zh ? 'OKX 钱包扩展' : 'OKX Wallet Extension' },
              ].map(w => (
                <button
                  key={w.name}
                  onClick={() => handleConnectWallet(w.name)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all text-left"
                >
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{w.name}</div>
                    <div className="text-xs text-slate-400">{w.desc}</div>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 pb-4 px-6">
              {zh ? '连接即表示同意服务条款与隐私政策' : 'By connecting you agree to our Terms of Service and Privacy Policy'}
            </p>
          </div>
        </div>
      )}

      {/* ── 派息历史弹层 ── */}
      {historyModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setHistoryModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{zh ? '派息历史' : 'Yield History'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {zh ? '累计已领 USDT' : 'Total Claimed USDT'}&nbsp;
                  <span className="font-semibold text-slate-700">${totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
              <button onClick={() => setHistoryModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-3 px-6 py-2 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>{zh ? '派息日期' : 'Date'}</span>
              <span className="text-right">{zh ? '金额 (USDT)' : 'Amount (USDT)'}</span>
              <span className="text-right">{zh ? '每份派息' : 'Per Token'}</span>
            </div>
            <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
              {yieldHistory.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-6 py-3 text-sm hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500">{row.date}</span>
                  <span className="text-right font-semibold text-slate-800">+${row.amount.toFixed(2)}</span>
                  <span className="text-right text-slate-500">${row.perToken.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-slate-50 text-xs text-slate-400 text-center">
              {zh ? '每周五派息，历史数据仅供参考' : 'Distributed every Friday. Historical data for reference only.'}
            </div>
          </div>
        </div>
      )}

      {/* ── 底层资产支撑说明弹层 ── */}
      {backedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBackedModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">{zh ? "底层资产支撑说明" : "Asset Backing"}</h3>
              <button onClick={() => setBackedModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {zh
                ? "每 1 枚 rINDEX token 对应 1 单位底层一篮子ETF的份额，底层资产持仓数据链上实时可查。"
                : "Each rINDEX token corresponds to 1 unit of the underlying ETF basket. On-chain reserve data is publicly verifiable in real time."}
            </p>
            <a href="#" className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors" onClick={e => e.preventDefault()}>
              {zh ? "查看链上储备证明" : "View On-chain Reserve Proof"}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ── 每周派息说明弹层 ── */}
      {weeklyDivModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setWeeklyDivModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">{zh ? "每周派息说明" : "Weekly Dividend"}</h3>
              <button onClick={() => setWeeklyDivModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              {zh
                ? "平台每周将收益自动分配至收益金库，派息金额 = 持仓 rToken 数量 × 当月每 Token 派息额（以 USDT 结算），到账后可随时领取至錢包（T+0到账）。"
                : "The platform distributes yield to the Yield Vault every week. Dividend = rToken holdings × monthly per-token dividend (settled in USDT). Claimable to wallet anytime after crediting (T+0)."}
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
              <p className="text-amber-700 text-xs font-semibold mb-1">{zh ? "特别提示" : "Important Notice"}</p>
              <p className="text-amber-600 text-xs leading-relaxed">
                {zh
                  ? "根据平台合规要求，领取收益前需要完成 KYC 认证。"
                  : "Per platform compliance requirements, KYC verification is required before claiming yield."}
              </p>
            </div>
            <a href="#" className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors" onClick={e => e.preventDefault()}>
              {zh ? "前往 KYC" : "Go to KYC"}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ── 页面标题 ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">
            {zh ? "RWAlpha 指数旗舰金库" : "RWAlpha Index Prime Vault"}
          </h1>
          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">
            {zh ? "AI 赋能" : "AI Powered"}
          </span>
          {summaryLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
          {hasDbData && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium border border-blue-100">
              {zh ? "实时数据" : "Live Data"}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              title={zh ? "刷新数据" : "Refresh data"}
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={() => setLang(zh ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              🌐 {zh ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => connected ? setConnected(false) : setWalletModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 active:scale-95 ${
                connected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              }`}
            >
              <Wallet size={14} />
              {connected ? "0x3f...a8c2" : (zh ? "连接钱包" : "Connect Wallet")}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-slate-500 text-sm">
            {zh
              ? "AI 驱动调仓 · 每周现金派息 · 指数底仓增值"
              : "AI-driven rebalancing · Weekly cash dividend · Index core appreciation"}
          </p>
          <Link href="/dashboard">
            <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              {zh ? "查看产品详情" : "View product details"}
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* ── 双金库主体 ── */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 左侧：本金金库 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "本金金库" : "Principal Vault"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                  {zh ? "底层资产完全支撑" : "Fully Asset Backed"}
                </span>
                <button onClick={() => setBackedModal(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <HelpCircle size={14} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 持仓 + 本金价值 */}
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{zh ? "rINDEX 持仓" : "rINDEX Holdings"}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {holdings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 font-semibold text-lg">rINDEX</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{zh ? "本金价值" : "Principal Value"}</p>
                  <p className="text-sm font-bold font-mono text-slate-800">${principalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* 三指标 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "rINDEX NAV", value: `$${nav.toFixed(2)}`, green: false },
                  { label: zh ? "24H 变动" : "24H Change", value: `${nav24hChange >= 0 ? '+' : ''}${nav24hChange.toFixed(2)}%`, green: nav24hChange >= 0 },
                  { label: zh ? "年化总回报（含股息）" : "Total Return (incl. Div)", value: `+${annualTotalReturn.toFixed(2)}%`, green: true },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`text-sm font-bold font-mono ${item.green ? "text-emerald-600" : "text-slate-800"}`}>
                      {item.green && <ArrowUpRight size={12} className="inline mr-0.5" />}
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* 交易框 */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex gap-1 bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                    <button
                      onClick={() => setTradeMode("buy")}
                      className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${
                        tradeMode === "buy" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >{zh ? "认购" : "Buy"}</button>
                    <button
                      onClick={() => setTradeMode("sell")}
                      className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${
                        tradeMode === "sell" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >{zh ? "赎回" : "Sell"}</button>
                  </div>
                  <select className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" defaultValue="eth">
                    <option value="eth">🔵 Ethereum</option>
                    <option value="bnb">🟡 BNB Chain</option>
                  </select>
                </div>

                <div className="mx-3 mb-0 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "支付" : "Spend"}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" placeholder="0" value={spendAmt}
                      onChange={e => setSpendAmt(e.target.value)}
                      className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0"
                    />
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {tradeMode === "buy" ? (
                        <div className="relative">
                          <button
                            onClick={() => setShowPayDrop(p => !p)}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl px-2.5 py-1 transition-colors"
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">$</div>
                            <span className="text-sm font-bold text-slate-700">{payToken}</span>
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {showPayDrop && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[90px]">
                              {(["USDC", "USDT"] as const).map(tok => (
                                <button key={tok} onClick={() => { setPayToken(tok); setShowPayDrop(false); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors ${payToken === tok ? "text-blue-600" : "text-slate-700"}`}>
                                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">$</div>
                                  {tok}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">R</div>
                          <span className="text-sm font-bold text-emerald-700">rINDEX</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}
                        <span>{tradeMode === "sell" && connected ? "1,250.00" : "0"}</span>
                        <button className="text-emerald-600 font-bold hover:underline ml-1">Max</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-1 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="mx-3 mt-0 mb-3 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "最少获得" : "Receive at least"}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-2xl font-semibold text-slate-400">
                      {spendAmt && nav > 0
                        ? tradeMode === "buy"
                          ? (parseFloat(spendAmt) / nav).toFixed(4)
                          : (parseFloat(spendAmt) * nav).toFixed(2)
                        : "0"}
                    </span>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {tradeMode === "buy" ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">R</div>
                          <span className="text-sm font-bold text-emerald-700">rINDEX</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">$</div>
                          <span className="text-sm font-bold text-slate-700">{payToken}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}
                        <span>{tradeMode === "buy" && connected ? "1,250.00" : "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3">
                  <button
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                      spendAmt && parseFloat(spendAmt) > 0
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                    disabled={!spendAmt || parseFloat(spendAmt) <= 0}
                  >
                    {!connected
                      ? (zh ? "请先连接钱包" : "Connect Wallet First")
                      : !spendAmt || parseFloat(spendAmt) <= 0
                        ? (zh ? "输入金额" : "Enter Amount")
                        : tradeMode === "buy"
                          ? (zh ? `认购 ${(parseFloat(spendAmt)/nav).toFixed(4)} rINDEX` : `Buy ${(parseFloat(spendAmt)/nav).toFixed(4)} rINDEX`)
                          : (zh ? `赎回 获得 ${(parseFloat(spendAmt)*nav).toFixed(2)} USDC` : `Redeem → ${(parseFloat(spendAmt)*nav).toFixed(2)} USDC`)
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── 右侧：收益金库 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "收益金库" : "Yield Vault"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100">
                  {zh ? "每周派息" : "Weekly Dividend"}
                </span>
                <button onClick={() => setWeeklyDivModal(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <HelpCircle size={14} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 年度派息率 */}
              <div className="text-center py-2">
                <p className="text-xs text-slate-400 mb-1">{zh ? "年度股息收益率" : "Annual Dividend Yield"}</p>
                <p className="text-5xl font-extrabold text-amber-500 tracking-tight font-mono">
                  ~{annualYield.toFixed(2)}%
                </p>
              </div>

              {/* 可领收益 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-xs text-slate-500 mb-1">{zh ? "可领收益（USDT）" : "Claimable Yield (USDT)"}</p>
                <p className="text-3xl font-extrabold text-slate-900 font-mono mb-2">
                  ${pendingYield.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <button
                    onClick={() => setHistoryModal(true)}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors group"
                  >
                    {zh ? "累计已领" : "Total Claimed"}{" "}
                    <span className="text-slate-700 font-semibold group-hover:text-sky-600 underline underline-offset-2 decoration-dashed">
                      ${totalClaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                  <span>
                    {zh ? "本周已派" : "This Week"}{" "}
                    <span className="text-emerald-600 font-semibold">+${pendingYield.toFixed(2)}</span>
                  </span>
                </div>
              </div>

              {/* 立即领取 */}
              <button
                onClick={handleClaim}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md ${
                  claimSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-100"
                    : "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-100"
                }`}
              >
                <Zap size={16} />
                {claimSuccess
                  ? (zh ? "✓ 领取成功" : "✓ Claimed!")
                  : (zh ? "立即领取" : "Claim Now")}
              </button>

              {/* 派息明细 */}
              <div className="space-y-0 border-t border-slate-50 pt-2">
                {[
                  {
                    label: zh ? "上周派息" : "Last Week Dividend",
                    value: `+$${(holdings * latestNvdyPerToken).toFixed(2)}`,
                    sub: lastYieldDate,
                    valueClass: "text-emerald-600 font-mono font-bold",
                  },
                  {
                    label: zh ? `每 rINDEX 派息（周度）` : "rINDEX Weekly Yield",
                    value: `$${latestNvdyPerToken.toFixed(3)} USDT`,
                    sub: `+${((latestNvdyPerToken / nav) * 100).toFixed(2)}%`,
                    valueClass: "text-amber-500 font-mono font-bold",
                  },
                  {
                    label: zh ? "下周分配" : "Next Week Distribution",
                    value: null,
                    countdown: true,
                    valueClass: "",
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className="flex items-center gap-2">
                      {row.countdown ? (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-bold font-mono">
                          <Clock size={12} />
                          <Countdown days={2} hours={14} />
                        </span>
                      ) : (
                        <>
                          <span className={`text-xs ${row.valueClass}`}>{row.value}</span>
                          {row.sub && <span className="text-[10px] text-slate-400">{row.sub}</span>}
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>


      </div>
      <Footer />
    </div>
  );
}
