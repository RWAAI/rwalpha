/**
 * VaultApp — Launch App 双金库页面
 * 设计风格：白色底色、简洁卡片、绿色/金色强调色
 * 布局：顶部导航（Logo + Connect Wallet）+ 双金库左右分栏
 *   左侧：本金金库（rQQQI 持仓、NAV、走势图、赎回/认购）
 *   右侧：收益金库（年度派息率、可领收益、立即领取、自动复利、派息明细）
 */

import { useState, useEffect, useRef } from "react";
import { Zap, Wallet, TrendingUp, Clock, RefreshCw, ChevronRight, ArrowUpRight, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";

// ─── 数据 ───────────────────────────────────────────────────────────────────

// 派息历史数据
const YIELD_HISTORY = [
  { date: '2026-02-21', amount: 784.50, perToken: 0.627, status: 'paid' },
  { date: '2026-02-14', amount: 752.20, perToken: 0.602, status: 'paid' },
  { date: '2026-02-07', amount: 718.40, perToken: 0.575, status: 'paid' },
  { date: '2026-01-31', amount: 695.80, perToken: 0.557, status: 'paid' },
  { date: '2026-01-24', amount: 731.60, perToken: 0.585, status: 'paid' },
  { date: '2026-01-17', amount: 688.30, perToken: 0.551, status: 'paid' },
  { date: '2026-01-10', amount: 712.50, perToken: 0.570, status: 'paid' },
  { date: '2026-01-03', amount: 656.70, perToken: 0.525, status: 'paid' },
  { date: '2025-12-27', amount: 700.00, perToken: 0.560, status: 'paid' },
  { date: '2025-12-20', amount: 680.50, perToken: 0.544, status: 'paid' },
  { date: '2025-12-13', amount: 719.50, perToken: 0.576, status: 'paid' },
  { date: '2025-12-06', amount: 560.00, perToken: 0.448, status: 'paid' },
];

const VAULT_DATA = {
  product: "rINDEX",
  nav: 129.72,
  nav24hChange: 0.38,
  holdings: 1250.0,
  annualYield: 14.30,
  pendingYield: 784.50,
  totalClaimed: 8240.00,
  lastYield: 752.20,
  lastYieldDate: "2026-02-21",
  lastYieldPerToken: 0.602,
  nextDistDays: 2,
  nextDistHours: 14,
  navTrend: [
    { date: "Jan 20", value: 126.50 },
    { date: "Jan 27", value: 125.80 },
    { date: "Feb 03", value: 127.20 },
    { date: "Feb 10", value: 128.40 },
    { date: "Feb 17", value: 129.10 },
    { date: "Feb 24", value: 129.72 },
  ],
};

type ChartPeriod = "7D" | "1M" | "6M" | "1Y";

// ─── 迷你折线图 ──────────────────────────────────────────────────────────────

function SparkLine({ data, period }: { data: { date: string; value: number }[]; period: ChartPeriod }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 480, H = 120;
  const pad = { top: 16, bottom: 28, left: 48, right: 16 };

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
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
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
      {/* Area fill */}
      <path d={areaD} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* X axis labels */}
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.date}</text>
      ))}
      {/* Last point dot */}
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
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span className="font-mono text-amber-500 font-bold text-sm">
      {d}d {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </span>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

export default function VaultApp() {
  const [connected, setConnected] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [period, setPeriod] = useState<ChartPeriod>("7D");
  const [autoCompound, setAutoCompound] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [spendAmt, setSpendAmt] = useState("");
  const zh = lang === "zh";

  const v = VAULT_DATA;
  const principalValue = v.holdings * v.nav;

  const handleClaim = () => {
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 3000);
  };

  const handleConnectWallet = (walletName: string) => {
    setConnected(true);
    setWalletModal(false);
  };

  // 钱包按鈕插入 NavBar 右侧
  const walletButton = (
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
  );

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
            {/* 弹层头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{zh ? "连接钱包" : "Connect Wallet"}</h2>
              <button
                onClick={() => setWalletModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >×</button>
            </div>

            {/* 钱包列表 */}
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
            {/* 弹层头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{zh ? '派息历史' : 'Yield History'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{zh ? '累计已领 USDT' : 'Total Claimed USDT'} &nbsp;<span className="font-semibold text-slate-700">${v.totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
              </div>
              <button onClick={() => setHistoryModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            {/* 表头 */}
            <div className="grid grid-cols-3 px-6 py-2 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>{zh ? '派息日期' : 'Date'}</span>
              <span className="text-right">{zh ? '金额 (USDT)' : 'Amount (USDT)'}</span>
              <span className="text-right">{zh ? '每份派息' : 'Per Token'}</span>
            </div>

            {/* 列表 */}
            <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
              {YIELD_HISTORY.map((row, i) => (
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

      {/* ── 页面标题 ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">
            {zh ? "RWAlpha 指数旗舰金库" : "RWAlpha Index Prime Vault"}
          </h1>
          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">
            {zh ? "AI 赋能" : "AI Powered"}
          </span>
          <Link href="/dashboard">
            <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              {zh ? "查看产品详情" : "View product details"}
              <ChevronRight size={14} />
            </button>
          </Link>
          {/* 语言切换 + 钱包按鈕—与查看产品详情同行 */}
          <div className="ml-auto flex items-center gap-2">
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
        <p className="text-slate-500 text-sm">
          {zh
            ? "AI 驱动调仓 · 每周现金派息 · 指数底仓增值"
            : "AI-driven rebalancing · Weekly cash dividend · Index core appreciation"}
        </p>
      </div>

      {/* ── 双金库主体 ── */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 左侧：本金金库 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* 卡片头部 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "本金金库" : "Principal Vault"}</span>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                {zh ? "底层资产完全支撑" : "Fully Asset Backed"}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 持仓 */}
              <div>
                <p className="text-xs text-slate-400 mb-1">{zh ? "rINDEX 持仓" : "rINDEX Holdings"}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {v.holdings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-400 font-semibold text-lg">rINDEX</span>
                </div>
              </div>

              {/* 三指标 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: zh ? "rINDEX NAV" : "rINDEX NAV", value: `$${v.nav.toFixed(2)}`, sub: null },
                  {
                    label: zh ? "24H 变动" : "24H Change",
                    value: `+${v.nav24hChange}%`,
                    sub: null,
                    green: true,
                  },
                  {
                    label: zh ? "本金价值" : "Principal Value",
                    value: `$${principalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                    sub: null,
                  },
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

              {/* ── 交易框 ── */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                {/* Buy / Sell + 网络选择 */}
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
                  <select
                    className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm outline-none cursor-pointer hover:border-slate-300 transition-colors"
                    defaultValue="eth"
                  >
                    <option value="eth">🔵 Ethereum</option>
                    <option value="bnb">🟡 BNB Chain</option>
                  </select>
                </div>

                {/* Spend 输入框 */}
                <div className="mx-3 mb-0 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "支付" : "Spend"}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={spendAmt}
                      onChange={e => setSpendAmt(e.target.value)}
                      className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0"
                    />
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">$</div>
                        <span className="text-sm font-bold text-slate-700">USDC</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}<span>0</span>
                        <button className="text-emerald-600 font-bold hover:underline ml-1">Max</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 箭头分隔 */}
                <div className="flex justify-center -my-1 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Receive 输入框 */}
                <div className="mx-3 mt-0 mb-3 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "最少获得" : "Receive at least"}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-2xl font-semibold text-slate-400">
                      {spendAmt && v.nav > 0 ? (parseFloat(spendAmt) / v.nav).toFixed(4) : "0"}
                    </span>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">R</div>
                        <span className="text-sm font-bold text-emerald-700">rINDEX</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{zh ? "余额：" : "Balance: "}<span>{connected ? "1,250.00" : "0"}</span></div>
                    </div>
                  </div>
                </div>

                {/* 确认按钮 */}
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
                          ? (zh ? `认购 ${(parseFloat(spendAmt)/v.nav).toFixed(4)} rINDEX` : `Buy ${(parseFloat(spendAmt)/v.nav).toFixed(4)} rINDEX`)
                          : (zh ? `赎回 ${(parseFloat(spendAmt)/v.nav).toFixed(4)} rINDEX` : `Redeem ${(parseFloat(spendAmt)/v.nav).toFixed(4)} rINDEX`)
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── 右侧：收益金库 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* 卡片头部 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "收益金库" : "Yield Vault"}</span>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100">
                {zh ? "每周派息" : "Weekly Dividend"}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 年度派息率 */}
              <div className="text-center py-2">
                <p className="text-xs text-slate-400 mb-1">{zh ? "年度股息收益率" : "Annual Dividend Yield"}</p>
                <p className="text-5xl font-extrabold text-amber-500 tracking-tight font-mono">
                  ~{v.annualYield.toFixed(2)}%
                </p>
              </div>

              {/* 可领收益 */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-xs text-slate-500 mb-1">{zh ? "可领收益（USDT）" : "Claimable Yield (USDT)"}</p>
                <p className="text-3xl font-extrabold text-slate-900 font-mono mb-2">
                  ${v.pendingYield.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <button
                    onClick={() => setHistoryModal(true)}
                    className="flex items-center gap-1 hover:text-sky-600 transition-colors group"
                  >
                    {zh ? "累计已领" : "Total Claimed"}{" "}
                    <span className="text-slate-700 font-semibold group-hover:text-sky-600 underline underline-offset-2 decoration-dashed">
                      ${v.totalClaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                  <span>
                    {zh ? "本周已派" : "This Week"}{" "}
                    <span className="text-emerald-600 font-semibold">+${v.pendingYield.toFixed(2)}</span>
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
                    value: `+$${v.lastYield.toFixed(2)}`,
                    sub: v.lastYieldDate,
                    valueClass: "text-emerald-600 font-mono font-bold",
                  },
                  {
                    label: zh ? `每 rINDEX 派息（周度）` : "rINDEX Weekly Yield",
                    value: `$${v.lastYieldPerToken.toFixed(3)} USDT`,
                    sub: `+${((v.lastYieldPerToken / v.nav) * 100).toFixed(2)}%`,
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
                          <Countdown days={v.nextDistDays} hours={v.nextDistHours} />
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

        {/* ── 底部说明 ── */}
        <p className="text-center text-xs text-slate-400 mt-8">
          {zh
            ? "* 收益数据基于历史派息水平，不构成投资承诺。管理费 0.80%/年已在 rINDEX NAV 中扣除。"
            : "* Yield data is based on historical dividend levels and does not constitute an investment guarantee. 0.80% annual management fee is deducted from rINDEX NAV."}
        </p>
      </div>
    </div>
  );
}
