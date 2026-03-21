/**
 * GoldToken — rGLD 黄金代币页面
 * 头部：VaultApp 风格（返回产品页 + 产品名 + 语言/用户/钱包按钮）
 * 左侧：GLD 走势信息 + rGLD 交易框（填满）
 * 右侧：rGLD Staking（Stake/Unstake Tab + 我的质押仓位）+ Yield Vault（收益历史）
 */

import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight, Zap, Lock, TrendingUp, Shield, Coins,
  ChevronLeft, ChevronDown, Wallet, RefreshCw, TrendingDown,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── 静态数据 ────────────────────────────────────────────────────────────────

const GLD_PRICE = 413.38;      // GLD ETF 当前价格（USD）2026-03-21
const GLD_CHANGE = -13.03;     // 24h 涨跌（USD）
const GLD_CHANGE_PCT = -3.06;  // 24h 涨跌幅（%）
const GLD_HIGH = 428.59;
const GLD_LOW  = 411.23;
const GLD_OPEN = 428.09;
const GLD_AUM  = "1571亿";
const GLD_AUM_EN = "$157.1B";
const RGLD_NAV = 413.38;       // rGLD 1:1 挂钩 GLD
const STAKING_APY_FLEXIBLE = 5.0;  // 活期年化
// 锁仓三档年化
const LOCK_APY: Record<number, number> = { 30: 7.8, 90: 8.0, 180: 8.2 };
const STAKING_APY_LOCKED = 8.0; // 保留兼容
const STAKING_APY = 8.0; // 保留兼容

// GLD 多时间维度走势数据（来源：TwelveData / WSJ / Digrin 2026-03-21）
const GLD_DATA: Record<string, { date: string; value: number }[]> = {
  "7D": [
    { date: "03-14", value: 463.50 },
    { date: "03-17", value: 459.27 },
    { date: "03-18", value: 444.74 },
    { date: "03-19", value: 438.20 },
    { date: "03-20", value: 426.41 },
    { date: "03-21", value: 413.38 },
  ],
  "1M": [
    { date: "02-20", value: 441.20 },
    { date: "02-24", value: 452.80 },
    { date: "02-27", value: 465.50 },
    { date: "03-03", value: 470.20 },
    { date: "03-06", value: 469.04 },
    { date: "03-09", value: 468.09 },
    { date: "03-10", value: 479.74 },
    { date: "03-13", value: 460.84 },
    { date: "03-17", value: 459.27 },
    { date: "03-18", value: 444.74 },
    { date: "03-20", value: 426.41 },
    { date: "03-21", value: 413.38 },
  ],
  "6M": [
    { date: "09-21", value: 240.80 },
    { date: "10-01", value: 252.40 },
    { date: "10-15", value: 265.10 },
    { date: "11-01", value: 271.55 },
    { date: "11-15", value: 278.30 },
    { date: "12-01", value: 285.60 },
    { date: "12-15", value: 296.20 },
    { date: "12-31", value: 396.31 },
    { date: "01-15", value: 420.80 },
    { date: "01-29", value: 509.70 },
    { date: "02-15", value: 483.75 },
    { date: "03-01", value: 476.13 },
    { date: "03-21", value: 413.38 },
  ],
  "1Y": [
    { date: "Mar'25", value: 280.50 },
    { date: "Apr'25", value: 295.80 },
    { date: "May'25", value: 310.20 },
    { date: "Jun'25", value: 305.40 },
    { date: "Jul'25", value: 318.60 },
    { date: "Aug'25", value: 325.90 },
    { date: "Sep'25", value: 340.80 },
    { date: "Oct'25", value: 355.20 },
    { date: "Nov'25", value: 371.55 },
    { date: "Dec'25", value: 396.31 },
    { date: "Jan'26", value: 444.95 },
    { date: "Feb'26", value: 483.75 },
    { date: "Mar'26", value: 413.38 },
  ],
};
const GLD_TREND = GLD_DATA["1M"];

// 模拟活期质押仓位
const MOCK_FLEXIBLE_STAKE = { amount: 3.2000, accrued: 2.18, since: "2026-03-01" };

// 模拟锁仓质押仓位
const MOCK_LOCKED_STAKES = [
  { id: 1, amount: 2.5000, lockDays: 60, startDate: "2026-01-20", endDate: "2026-03-20", accrued: 9.72, status: "expired" },
  { id: 2, amount: 5.0000, lockDays: 90, startDate: "2026-02-01", endDate: "2026-05-02", accrued: 14.58, status: "active" },
];

// 模拟收益历史
const MOCK_YIELD_HISTORY = [
  { date: "2026-03-20", amount: 9.72, source: "rGLD Staking · 60D" },
  { date: "2026-02-28", amount: 6.44, source: "rGLD Staking · 30D" },
  { date: "2026-01-31", amount: 5.89, source: "rGLD Staking · 30D" },
];

// ─── 迷你折线图 ──────────────────────────────────────────────────────────────

function GldSparkLine({ data }: { data: { date: string; value: number }[] }) {
  const W = 480, H = 96;
  const pad = { top: 10, bottom: 22, left: 40, right: 12 };
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const px = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const py = (v: number) => pad.top + (1 - (v - minV) / range) * (H - pad.top - pad.bottom);
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(d.value)}`).join(" ");
  const areaD = pathD + ` L ${px(data.length - 1)} ${H - pad.bottom} L ${px(0)} ${H - pad.bottom} Z`;
  const lx = px(data.length - 1);
  const ly = py(data[data.length - 1].value);
  const isUp = data[data.length - 1].value >= data[0].value;
  const color = isUp ? "#f59e0b" : "#ef4444";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 96 }}>
      <defs>
        <linearGradient id="gldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(t => {
        const y = pad.top + t * (H - pad.top - pad.bottom);
        const v = maxV - t * range;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={pad.left - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#94a3b8">${v.toFixed(0)}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#gldGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d, _, arr) => {
        const origIdx = data.indexOf(d);
        return (
          <text key={origIdx} x={px(origIdx)} y={H - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">
            {d.date}
          </text>
        );
      })}
      <circle cx={lx} cy={ly} r="3.5" fill={color} />
      <circle cx={lx} cy={ly} r="6" fill={color} fillOpacity="0.18" />
    </svg>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function GoldToken() {
  const [lang, setLang] = useState<"zh" | "en">(() =>
    localStorage.getItem("rwa-lang") === "en" ? "en" : "zh"
  );
  const zh = lang === "zh";

  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [spendAmt, setSpendAmt] = useState("");
  const [payToken, setPayToken] = useState<"USDC" | "USDT">("USDC");
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [stakingAmt, setStakingAmt] = useState("");
  const [stakingDays, setStakingDays] = useState(90);
  const [connected, setConnected] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  // 双档 Tab：flexible（活期）| locked（锁仓）
  const [stakingMode, setStakingMode] = useState<"flexible" | "locked">("flexible");
  // 每档各自的 stake/unstake 子 Tab
  const [flexTab, setFlexTab] = useState<"stake" | "unstake">("stake");
  const [lockTab, setLockTab] = useState<"stake" | "unstake">("stake");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [flexUnstakeAmt, setFlexUnstakeAmt] = useState("");
  const [showApyTooltip, setShowApyTooltip] = useState(false);
  const [earlyUnstakeConfirm, setEarlyUnstakeConfirm] = useState(false);
  const [yieldHistoryOpen, setYieldHistoryOpen] = useState(false);
  const [trendRange, setTrendRange] = useState<"7D" | "1M" | "6M" | "1Y">("1M");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { user, isAuthenticated, logout: oauthLogout } = useAuth();
  const isLoggedIn = isAuthenticated;
  const displayUser = user;
  const logout = async () => { if (isAuthenticated) await oauthLogout(); };

  useEffect(() => {
    const handler = () => setLang(localStorage.getItem("rwa-lang") === "en" ? "en" : "zh");
    window.addEventListener("rwa-lang-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("rwa-lang-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleLang = () => {
    const next = zh ? "en" : "zh";
    localStorage.setItem("rwa-lang", next);
    window.dispatchEvent(new Event("rwa-lang-change"));
    setLang(next);
  };

  const receiveAmt = spendAmt && RGLD_NAV > 0
    ? tradeMode === "buy"
      ? (parseFloat(spendAmt) / RGLD_NAV).toFixed(4)
      : (parseFloat(spendAmt) * RGLD_NAV).toFixed(2)
    : "0";

  const currentLockApy = LOCK_APY[stakingDays] ?? 8.0;
  const stakingEstLocked = stakingAmt && parseFloat(stakingAmt) > 0
    ? ((parseFloat(stakingAmt) * RGLD_NAV * currentLockApy / 100) * (stakingDays / 365)).toFixed(2)
    : "0.00";
  const stakingEstFlex = stakingAmt && parseFloat(stakingAmt) > 0
    ? ((parseFloat(stakingAmt) * RGLD_NAV * STAKING_APY_FLEXIBLE / 100) * (30 / 365)).toFixed(2)
    : "0.00";
  // 兼容旧引用
  const stakingEst = stakingMode === "flexible" ? stakingEstFlex : stakingEstLocked;

  const isUp = GLD_CHANGE_PCT >= 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* ── 钱包连接弹层 ── */}
      {walletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setWalletModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{zh ? "连接钱包" : "Connect Wallet"}</h2>
              <button onClick={() => setWalletModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { name: zh ? "币安 Web3 钱包" : "Binance Web3 Wallet", icon: "🟡" },
                { name: "OKX Wallet", icon: "⬤" },
                { name: "Trust Wallet", icon: "🛡️" },
                { name: "MetaMask", icon: "🦊" },
                { name: "WalletConnect", icon: "🔗" },
              ].map(w => (
                <button key={w.name} onClick={() => { setConnected(true); setWalletModal(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all text-left">
                  <span className="text-2xl">{w.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">{w.name}</span>
                  <ArrowUpRight size={14} className="ml-auto text-slate-300" />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 pb-4 px-6">{zh ? "连接即表示同意服务条款与隐私政策" : "By connecting you agree to our Terms & Privacy Policy"}</p>
          </div>
        </div>
      )}

      {/* ── 页面标题栏（VaultApp 风格）── */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-8 pb-4">
        {/* 返回产品页 */}
        <div className="mb-2">
          <Link href="/">
            <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronLeft size={14} />
              {zh ? "返回首页" : "Back to Home"}
            </button>
          </Link>
        </div>

        {/* 标题行 */}
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">
            {zh ? "rGLD 黄金代币" : "rGLD Gold Token"}
          </h1>
          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded font-bold uppercase tracking-wider">
            {zh ? "黄金代币" : "Gold Token"}
          </span>


          {/* 右侧操作区 */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
            >
              🌐 {zh ? "EN" : "中文"}
            </button>

            {/* 用户菜单 */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {displayUser?.name ? displayUser.name.slice(0, 2).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">{displayUser?.name ?? "User"}</span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 z-50 overflow-hidden py-2">
                    <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                      className="w-full text-center px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors">
                      {zh ? "个人资料" : "Profile"}
                    </button>
                    <button onClick={() => { setUserMenuOpen(false); navigate('/my-assets'); }}
                      className="w-full text-center px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors">
                      {zh ? "我的资产" : "My Assets"}
                    </button>
                    <button onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-center px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors">
                      {zh ? "退出" : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* 连接钱包 */}
            <button
              onClick={() => connected ? setConnected(false) : setWalletModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all active:scale-95 ${
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

        {/* 副标题 */}
        <p className="text-slate-500 text-sm">
          {zh
            ? "挂钩 SPDR Gold Shares（GLD）ETF 底层资产 · 链上可验证 · Staking 年化 ~8%"
            : "Pegged to SPDR Gold Shares (GLD) ETF underlying assets · On-chain verifiable · ~8% Staking APY"}
        </p>
      </div>

      {/* ── 主体：左侧 + 右侧 ──────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* ════════════════════════════════════════
              左侧：GLD 走势 + rGLD 交易框
          ════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

            {/* ── GLD 价格走势区域 ── */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-50">
              {/* 标题行 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-sm shadow-sm shadow-amber-200">🥇</div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm">GLD ETF</span>
                    <span className="ml-1.5 text-[10px] text-slate-400">SPDR Gold Shares</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  {zh ? "实时行情" : "Live"}
                </div>
              </div>

              {/* 价格大数字 */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">${GLD_PRICE.toFixed(2)}</span>
                <div className={`flex items-center gap-0.5 text-sm font-bold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isUp ? "+" : ""}{GLD_CHANGE.toFixed(2)} ({isUp ? "+" : ""}{GLD_CHANGE_PCT.toFixed(2)}%)
                </div>
                <span className="text-[10px] text-slate-400 ml-auto">{zh ? "24h 涨跌" : "24h Change"}</span>
              </div>

              {/* 走势迷你图 */}
              <div className="mt-2 mb-1">
                <div className="flex gap-1 mb-2">
                  {(["7D", "1M", "6M", "1Y"] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setTrendRange(r)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        trendRange === r
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <GldSparkLine data={GLD_DATA[trendRange]} />
              </div>

              {/* 关键指标四格 */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { label: zh ? "今开" : "Open",  value: `$${GLD_OPEN.toFixed(2)}` },
                  { label: zh ? "最高" : "High",   value: `$${GLD_HIGH.toFixed(2)}`, color: "text-emerald-600" },
                  { label: zh ? "最低" : "Low",    value: `$${GLD_LOW.toFixed(2)}`,  color: "text-red-500" },
                  { label: zh ? "AUM" : "AUM",     value: zh ? GLD_AUM : GLD_AUM_EN },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl px-2.5 py-2 text-center">
                    <p className="text-[9px] text-slate-400 mb-0.5">{item.label}</p>
                    <p className={`text-xs font-bold font-mono ${item.color ?? "text-slate-800"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── rGLD 交易框 ── */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "rGLD 交易" : "rGLD Trade"}</span>
              </div>

            </div>

            <div className="px-6 py-4 space-y-4 flex-1 flex flex-col">
              {/* 持仓 */}
              {/* 汇率和手续费 */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span>{zh ? "汇率：1 rGLD = $" + RGLD_NAV.toFixed(2) : "Rate: 1 rGLD = $" + RGLD_NAV.toFixed(2)}</span>
                <span>{zh ? "手续费：0.25%" : "Fee: 0.25%"}</span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{zh ? "rGLD 持仓" : "rGLD Holdings"}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">0.0000</span>
                    <span className="text-amber-500 font-semibold text-base">rGLD</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{zh ? "持仓价值" : "Holdings Value"}</p>
                  <p className="text-sm font-bold font-mono text-slate-800">$0.00</p>
                </div>
              </div>

              {/* 交易框 */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex-1 flex flex-col">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex gap-1 bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm">
                    <button onClick={() => setTradeMode("buy")}
                      className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${tradeMode === "buy" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>
                      {zh ? "认购" : "Buy"}
                    </button>
                    <button onClick={() => setTradeMode("sell")}
                      className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${tradeMode === "sell" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>
                      {zh ? "赎回" : "Sell"}
                    </button>
                  </div>
                  <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" defaultValue="eth">
                    <option value="eth">🔵 Ethereum</option>
                    <option value="bnb">🟡 BNB Chain</option>
                  </select>
                </div>

                {/* 支付框 */}
                <div className="mx-3 mb-0 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "支付" : "Spend"}</p>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" placeholder="0" value={spendAmt}
                      onChange={e => setSpendAmt(e.target.value)}
                      className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0" />
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {tradeMode === "buy" ? (
                        <div className="relative">
                          <button onClick={() => setShowPayDrop(p => !p)}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl px-2.5 py-1 transition-colors">
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
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                          <span className="text-sm font-bold text-amber-700">rGLD</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}<span>0</span>
                        <button className="text-amber-500 font-bold hover:underline ml-1">Max</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 箭头 */}
                <div className="flex justify-center -my-1 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* 获得框 */}
                <div className="mx-3 mt-0 mb-3 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{zh ? "最少获得" : "Receive at least"}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-2xl font-semibold text-slate-400">{receiveAmt}</span>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {tradeMode === "buy" ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                          <span className="text-sm font-bold text-amber-700">rGLD</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">$</div>
                          <span className="text-sm font-bold text-slate-700">{payToken}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">{zh ? "余额：" : "Balance: "}<span>0</span></div>
                    </div>
                  </div>
                </div>

                {/* 确认按钮 */}
                <div className="px-3 pb-3">
                  <button
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                      spendAmt && parseFloat(spendAmt) > 0
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                    disabled={!spendAmt || parseFloat(spendAmt) <= 0}
                  >
                    {!connected
                      ? (zh ? "请先连接钱包" : "Connect Wallet First")
                      : !spendAmt || parseFloat(spendAmt) <= 0
                        ? (zh ? "输入金额" : "Enter Amount")
                        : tradeMode === "buy"
                          ? (zh ? `认购 ${receiveAmt} rGLD` : `Buy ${receiveAmt} rGLD`)
                          : (zh ? `赎回 获得 ${receiveAmt} ${payToken}` : `Redeem → ${receiveAmt} ${payToken}`)}
                  </button>
                </div>
              </div>


            </div>
          </div>

          {/* ════════════════════════════════════════
              右侧：Staking 金库（双档）+ Yield Vault
          ════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

            {/* ── 提前解押确认弹层 ── */}
            {earlyUnstakeConfirm && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEarlyUnstakeConfirm(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base text-center mb-2">{zh ? "确认提前解押？" : "Confirm Early Unstake?"}</h3>
                  <p className="text-slate-500 text-sm text-center leading-relaxed mb-5">
                    {zh
                      ? `提前解锁将按活期年化（${STAKING_APY_FLEXIBLE}%）重新结算已累计收益，本金完整返还。预计实得 $9.72 USDT。`
                      : `Early unlock recalculates yield at flexible rate (${STAKING_APY_FLEXIBLE}%). Principal returned in full. Est. receive $9.72 USDT.`}
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setEarlyUnstakeConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      {zh ? "取消" : "Cancel"}
                    </button>
                    <button onClick={() => setEarlyUnstakeConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
                      {zh ? "确认解押" : "Confirm Unstake"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 上半：双档 Staking ── */}
            <div className="flex flex-col border-b border-slate-100">
              {/* 标题 + 双档切换 */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="font-bold text-slate-800 text-base">{zh ? "rGLD 质押" : "rGLD Staking"}</span>
                </div>
                {/* 活期 / 锁仓 主 Tab */}
                <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                  <button onClick={() => setStakingMode("flexible")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      stakingMode === "flexible" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {zh ? "活期" : "Flexible"}
                  </button>
                  <button onClick={() => setStakingMode("locked")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      stakingMode === "locked" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {zh ? "锁仓" : "Locked"}
                  </button>
                </div>
              </div>

              {/* ── 活期档 ── */}
              {stakingMode === "flexible" && (
                <div className="px-6 py-4 space-y-3">
                  {/* 活期说明 */}
                  <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-2.5 border border-blue-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold text-emerald-600 font-mono">~{STAKING_APY_FLEXIBLE}%</span>
                      <span className="text-xs text-slate-500">{zh ? "年化 · 随时进出" : "APY · Anytime"}</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      {zh ? "无锁仓" : "No Lock"}
                    </span>
                  </div>

                  {/* 活期 Stake / Unstake 子 Tab */}
                  <div className="flex gap-1 bg-slate-100 rounded-xl p-0.5 w-fit">
                    {(["stake", "unstake"] as const).map(t => (
                      <button key={t} onClick={() => setFlexTab(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          flexTab === t ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
                        }`}>
                        {t === "stake" ? (zh ? "质押" : "Stake") : (zh ? "解押" : "Unstake")}
                      </button>
                    ))}
                  </div>

                  {flexTab === "stake" && (
                    <>
                      {/* 当前活期仓位 */}
                      <div className="bg-blue-50 rounded-2xl border border-blue-100 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 mb-0.5">{zh ? "活期质押中" : "Flexible Staked"}</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-slate-900 font-mono">{MOCK_FLEXIBLE_STAKE.amount.toFixed(4)}</span>
                              <span className="text-amber-500 text-xs font-bold">rGLD</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 mb-0.5">{zh ? "累计收益" : "Accrued"}</p>
                            <p className="text-sm font-extrabold text-emerald-600 font-mono">+${MOCK_FLEXIBLE_STAKE.accrued}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">{zh ? `质押自 ${MOCK_FLEXIBLE_STAKE.since} · 按日累积` : `Since ${MOCK_FLEXIBLE_STAKE.since} · Accrues daily`}</p>
                      </div>

                      {/* 追加质押 */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400">{zh ? "追加质押数量" : "Add Stake"}</p>
                          <p className="text-[10px] text-slate-400">{zh ? "余额：0 rGLD" : "Balance: 0 rGLD"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" placeholder="0" value={stakingAmt}
                            onChange={e => setStakingAmt(e.target.value)}
                            className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0" />
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                            <span className="text-sm font-bold text-amber-700">rGLD</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                          !connected || !stakingAmt || parseFloat(stakingAmt) <= 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200"
                        }`}
                        disabled={!connected || !stakingAmt || parseFloat(stakingAmt) <= 0}
                      >
                        {!connected ? (zh ? "请先连接钱包" : "Connect Wallet First")
                          : !stakingAmt || parseFloat(stakingAmt) <= 0 ? (zh ? "输入质押数量" : "Enter Amount")
                          : (zh ? `活期质押 ${stakingAmt} rGLD` : `Flexible Stake ${stakingAmt} rGLD`)}
                      </button>
                    </>
                  )}

                  {flexTab === "unstake" && (
                    <>
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400">{zh ? "解押数量" : "Unstake Amount"}</p>
                          <p className="text-[10px] text-slate-400">{zh ? `活期仓位：${MOCK_FLEXIBLE_STAKE.amount} rGLD` : `Staked: ${MOCK_FLEXIBLE_STAKE.amount} rGLD`}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" placeholder="0" value={flexUnstakeAmt}
                            onChange={e => setFlexUnstakeAmt(e.target.value)}
                            className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0" />
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                            <span className="text-sm font-bold text-amber-700">rGLD</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                          !connected || !flexUnstakeAmt || parseFloat(flexUnstakeAmt) <= 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-800 hover:bg-slate-900 text-white shadow-md"
                        }`}
                        disabled={!connected || !flexUnstakeAmt || parseFloat(flexUnstakeAmt) <= 0}
                      >
                        {!connected ? (zh ? "请先连接钱包" : "Connect Wallet First")
                          : !flexUnstakeAmt || parseFloat(flexUnstakeAmt) <= 0 ? (zh ? "输入解押数量" : "Enter Amount")
                          : (zh ? `解押 ${flexUnstakeAmt} rGLD` : `Unstake ${flexUnstakeAmt} rGLD`)}
                      </button>
                      <p className="text-[10px] text-emerald-600 text-center font-medium">
                        ✓ {zh ? "活期随时解押，收益实时到账 Yield Vault" : "Flexible: unstake anytime, yield credited instantly"}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ── 锁仓档 ── */}
              {stakingMode === "locked" && (
                <div className="px-6 py-4 space-y-3">
                  {/* 锁仓说明 */}
                  <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-2.5 border border-amber-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold text-emerald-600 font-mono">~{currentLockApy}%</span>
                      <span className="text-xs text-slate-500">{zh ? "年化 · 锁仓增强" : "APY · Lock Boost"}</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      {zh ? "提前解锁按活期结算" : "Early exit at flexible rate"}
                    </span>
                  </div>

                  {/* 锁仓 Stake / Unstake 子 Tab */}
                  <div className="flex gap-1 bg-slate-100 rounded-xl p-0.5 w-fit">
                    {(["stake", "unstake"] as const).map(t => (
                      <button key={t} onClick={() => setLockTab(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          lockTab === t ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
                        }`}>
                        {t === "stake" ? (zh ? "质押" : "Stake") : (zh ? "解押" : "Unstake")}
                      </button>
                    ))}
                  </div>

                  {lockTab === "stake" && (
                    <>
                      {/* 质押数量 */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400">{zh ? "质押数量" : "Stake Amount"}</p>
                          <p className="text-[10px] text-slate-400">{zh ? "余额：0 rGLD" : "Balance: 0 rGLD"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" placeholder="0" value={stakingAmt}
                            onChange={e => setStakingAmt(e.target.value)}
                            className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0" />
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 shrink-0">
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                            <span className="text-sm font-bold text-amber-700">rGLD</span>
                          </div>
                        </div>
                      </div>

                      {/* 锁仓周期 */}
                      <div>
                        <p className="text-xs text-slate-400 mb-2">{zh ? "锁仓周期" : "Lock Period"}</p>
                        <div className="flex gap-2">
                          {[30, 90, 180].map(d => (
                            <button key={d} onClick={() => setStakingDays(d)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                stakingDays === d ? "bg-amber-500 text-white shadow-sm shadow-amber-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}>
                              {d}{zh ? " 天" : "D"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* APY + 预估收益 */}
                      <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-emerald-600 font-mono">~{currentLockApy}%</span>
                            <span className="text-xs text-slate-500">{zh ? "年化" : "APY"}</span>
                            <div className="relative">
                              <button onClick={() => setShowApyTooltip(v => !v)}
                                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-[10px] font-bold transition-colors">?</button>
                              {showApyTooltip && (
                                <div className="absolute left-0 top-6 z-30 w-64 bg-slate-900 text-white text-xs rounded-2xl p-4 shadow-xl">
                                  <p className="font-bold mb-1.5">{zh ? "锁仓收益机制" : "Locked Yield"}</p>
                              <p className="text-slate-300 leading-relaxed">
                                  {zh
                                      ? `锁仓期间 RWAlpha 将 GLD ETF 出借收益按 ~${currentLockApy}% 年化分配。到期自动解锁，收益进入 Yield Vault。提前解锁将按活期年化（${STAKING_APY_FLEXIBLE}%）重新结算已累计收益。`
                                      : `During lock period, RWAlpha distributes GLD ETF securities lending income at ~${currentLockApy}% APY. Auto-unlocks at maturity. Early exit recalculates yield at flexible rate (${STAKING_APY_FLEXIBLE}%).`
                                  }
                              </p>
                                  <button onClick={() => setShowApyTooltip(false)} className="mt-2 text-slate-400 hover:text-white text-[10px]">✕ {zh ? "关闭" : "Close"}</button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 mb-0.5">{zh ? `预计收益 (${stakingDays}天)` : `Est. Yield (${stakingDays}D)`}</p>
                            <p className="text-lg font-extrabold text-slate-900 font-mono">${stakingEstLocked}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                          !connected || !stakingAmt || parseFloat(stakingAmt) <= 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200"
                        }`}
                        disabled={!connected || !stakingAmt || parseFloat(stakingAmt) <= 0}
                      >
                        <Lock size={14} />
                        {!connected ? (zh ? "请先连接钱包" : "Connect Wallet First")
                          : !stakingAmt || parseFloat(stakingAmt) <= 0 ? (zh ? "输入质押数量" : "Enter Stake Amount")
                          : (zh ? `锁仓质押 ${stakingAmt} rGLD · ${stakingDays} 天` : `Lock Stake ${stakingAmt} rGLD · ${stakingDays}D`)}
                      </button>
                    </>
                  )}

                  {lockTab === "unstake" && (
                    <>
                      {/* 锁仓仓位列表 */}
                      <div className="space-y-2">
                        {MOCK_LOCKED_STAKES.map(s => {
                          // 提前解锁按活期利率重算已累计收益
                          const lockApy = LOCK_APY[s.lockDays] ?? 8.0;
                          const daysHeld = Math.floor((new Date().getTime() - new Date(s.startDate).getTime()) / 86400000);
                          const earlyYield = parseFloat((s.amount * RGLD_NAV * STAKING_APY_FLEXIBLE / 100 * daysHeld / 365).toFixed(2));
                          const diff = parseFloat((s.accrued - earlyYield).toFixed(2));
                          return (
                          <div key={s.id} className={`rounded-2xl border px-4 py-3 ${
                            s.status === "expired" ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-100"
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-extrabold text-slate-900 font-mono">{s.amount.toFixed(4)}</span>
                                <span className="text-amber-500 text-xs font-bold">rGLD</span>
                                <span className="text-[10px] text-slate-400">@{lockApy}% APY</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  s.status === "expired" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  {s.status === "expired" ? (zh ? "✓ 可解锁" : "✓ Unlocked") : (zh ? "锁仓中" : "Locked")}
                                </span>
                                <button
                                  onClick={() => s.status === "active" ? setEarlyUnstakeConfirm(true) : undefined}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-all ${
                                    s.status === "expired"
                                      ? "bg-slate-800 text-white hover:bg-slate-900"
                                      : "bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-100"
                                  }`}>
                                  {s.status === "expired" ? (zh ? "解锁提取" : "Unlock") : (zh ? "提前解锁" : "Early Unlock")}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{zh ? `锁仓 ${s.lockDays} 天 · 到期 ${s.endDate}` : `${s.lockDays}D Lock · Expires ${s.endDate}`}</span>
                              <span className="text-emerald-600 font-semibold">{zh ? `累计 +$${s.accrued}` : `+$${s.accrued} accrued`}</span>
                            </div>
                            {s.status === "active" && (
                              <div className="mt-1.5 bg-orange-50 rounded-xl px-3 py-1.5 text-[10px] text-orange-600">
                                {zh
                                  ? `提前解锁将按活期利率结算：实得 $${earlyYield}${diff > 0 ? `（少得 $${diff}` : ""}）`
                                  : `Early unlock recalculates at flexible rate: receive $${earlyYield}${diff > 0 ? ` (lose $${diff})` : ""}`}
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        {zh ? "到期可直接解锁提取；提前解锁按活期年化（5%）重新结算已累计收益" : "Expired: unlock freely. Early unlock: yield recalculated at flexible rate (5%)."}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── 下半：Yield Vault（固定展示）── */}
            <div className="flex-1 flex flex-col px-6 py-4 space-y-3">
              {/* Vault 标题 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="font-bold text-slate-800 text-base">{zh ? "收益金库" : "Yield Vault"}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                  {zh ? "可领收益" : "Claimable"}
                </span>
              </div>
              {/* 说明文字 */}
              <p className="text-[11px] text-slate-400 leading-relaxed -mt-1">
                {zh
                  ? "Staking 解押后收益 T+3 自动进入此处，可随时提取至钱包"
                  : "Staking yield credited T+3 after unstaking · Withdraw to wallet anytime"}
              </p>

              {/* 可领收益大数字 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">{zh ? "可领收益（USDT）" : "Claimable Yield (USDT)"}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">$9.72</span>
                  <span className="text-emerald-600 font-semibold text-sm">USDT</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{zh ? "来源：rGLD Staking 收益 · T+3 到账" : "Source: rGLD Staking Yield · Credited T+3"}</p>
              </div>

              {/* 收益历史记录（可折叠） */}
              <div>
                <button
                  onClick={() => setYieldHistoryOpen(v => !v)}
                  className="w-full flex items-center justify-between py-2 group"
                >
                  <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                    {zh ? "收益记录" : "Yield History"}
                    <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{MOCK_YIELD_HISTORY.length}</span>
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${yieldHistoryOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {yieldHistoryOpen && (
                  <div className="rounded-2xl border border-slate-100 overflow-hidden mt-1">
                    <div className="grid grid-cols-3 px-4 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span>{zh ? "日期" : "Date"}</span>
                      <span className="text-right">{zh ? "金额" : "Amount"}</span>
                      <span className="text-right">{zh ? "来源" : "Source"}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {MOCK_YIELD_HISTORY.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 px-4 py-2.5 text-xs hover:bg-slate-50 transition-colors">
                          <span className="text-slate-500 font-mono">{row.date.slice(5)}</span>
                          <span className="text-right font-semibold text-emerald-600">+${row.amount.toFixed(2)}</span>
                          <span className="text-right text-slate-400 truncate">{row.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 领取按钮 */}
              <button
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  !connected
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200"
                }`}
                disabled={!connected}
              >
                <Zap size={15} />
                {!connected
                  ? (zh ? "请先连接钱包" : "Connect Wallet First")
                  : (zh ? "领取 $9.72 USDT" : "Claim $9.72 USDT")}
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                {zh ? "Staking 解押后收益自动进入此处，可随时提取至钱包" : "Staking yield flows here on unstake. Withdraw to wallet anytime."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {zh ? '常见问题' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {zh ? '关于 rGLD 黄金代币的一切，您想知道的都在这里' : 'Everything you need to know about rGLD Gold Token'}
            </p>
          </div>
          <GoldFAQ zh={zh} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

// ─── FAQ Data & Component ────────────────────────────────────────────────────────
const GOLD_FAQS: { q: { zh: string; en: string }; a: { zh: string; en: string } }[] = [
  {
    q: {
      zh: 'rGLD 代币价格挂钩 GLD ETF，为什么实际价格会有差异？',
      en: 'rGLD is pegged to GLD ETF — why is there a price difference?',
    },
    a: {
      zh: 'rGLD 采用 1:1 锚定 GLD ETF 净值（NAV）的机制，但市场交易价格可能因以下原因出现短暂偏差：\n\n① Oracle 报价延迟：GLD ETF 收盘后更新，链上 Oracle 最长 15 分钟刷新一次；\n② 买卖价差：链上流动性池存在正常的 Spread，通常在 0.1%–0.3% 以内；\n③ 综合运营成本：包含券商交易手续费、OTC 换汇磨损、平台运营及审计费用等，已在管理费中统一计提，不会额外向用户收取；\n④ 汇率微波动：GLD 以美元计价，稳定币兑换时存在微小汇差。\n\n长期来看，套利机制会将价格拉回锚定值；若偏差超过 1%，系统将自动触发再平衡。',
      en: 'rGLD is pegged 1:1 to GLD ETF NAV, but short-term price deviations can occur due to:\n\n① Oracle latency: GLD ETF price updates after market close; on-chain Oracle refreshes within 15 minutes;\n② Bid-ask spread: On-chain liquidity pools have a normal Spread of 0.1%–0.3%;\n③ Operational costs: Broker commissions, OTC conversion slippage, platform operations and audit fees are all included in the management fee — no extra charges to users;\n④ FX micro-fluctuation: GLD is USD-denominated; minor variance occurs during stablecoin conversion.\n\nArbitrage mechanisms keep the price anchored long-term. If deviation exceeds 1%, the system triggers automatic rebalancing.',
    },
  },
  {
    q: {
      zh: 'rGLD Staking 为什么能获得收益？这安全吗？',
      en: 'Why does rGLD Staking generate yield? Is it safe?',
    },
    a: {
      zh: 'rGLD Staking 的收益来源于真实的资产运作，而非增发代币：\n\n① 收益来源：您质押的 rGLD 背后对应 GLD ETF 份额，合作銀行以非常有竞争力的固定利率为这部分资产提供杠杆，资金由 AI 智能路由，投入一篮子指数级 ETF 组合并动态调仓，在稳健风控框架下创造丰厚收益，扣除平台费后分配给 Staker；\n② 安全保障：采用机构级风控体系，严格控制 LTV（贷款价值比）系数，确保 Staking 整体处于极低风险水位；底层资产由持牌券商托管，合约经第三方独立审计；\n③ 风险提示：活期随时可赎回，锁仓期内资产不可动用，请根据自身流动性需求选择档位。',
      en: 'rGLD Staking yield comes from real asset operations, not token inflation:\n\n① Yield source: Your staked rGLD corresponds to GLD ETF shares. Partner banks provide highly competitive fixed-rate leverage against these assets. The capital is AI-routed into a basket of index ETFs with dynamic rebalancing, generating strong returns within a robust risk framework — distributed to Stakers after platform fees;\n② Safety: Institutional-grade risk controls strictly manage LTV (Loan-to-Value) ratios, keeping the overall Staking risk at a very low level; underlying assets are held by licensed brokers in custody; contracts are independently audited by third parties;\n③ Risk note: Flexible staking is redeemable anytime; locked positions are illiquid during the term. Choose based on your liquidity needs.',
    },
  },
  {
    q: {
      zh: 'rGLD 与直接持有实物黄金或 GLD ETF 有什么区别？',
      en: 'How is rGLD different from holding physical gold or GLD ETF directly?',
    },
    a: {
      zh: '| 对比维度 | 实物黄金 | GLD ETF | rGLD |\n|---|---|---|---|\n| 持有方式 | 实物存储 | 券商账户 | 链上钱包 |\n| 流动性 | 低 | 交易时段 | 24/7 |\n| 额外收益 | 无 | 无 | Staking 5–8% |\n| 最低门槛 | 较高 | 约 $400/股 | 约 $100 |\n| 链上可组合 | 否 | 否 | 是（DeFi）|\n\nrGLD 最大的差异化优势：在完整保留黄金价格敞口的同时，通过 Staking 获得额外年化收益，并可在 DeFi 生态中自由组合使用。',
      en: '| Dimension | Physical Gold | GLD ETF | rGLD |\n|---|---|---|---|\n| Custody | Physical storage | Brokerage account | On-chain wallet |\n| Liquidity | Low | Trading hours | 24/7 |\n| Extra Yield | None | None | Staking 5–8% |\n| Min. Entry | High | ~$400/share | ~$100 |\n| DeFi Composable | No | No | Yes |\n\nrGLD\'s key differentiator: full gold price exposure + Staking yield + DeFi composability — all in one token.',
    },
  },
  {
    q: {
      zh: '如何铸造（Mint）和赎回（Redeem）rGLD？需要多长时间？',
      en: 'How do I mint and redeem rGLD? How long does it take?',
    },
    a: {
      zh: '铸造流程：用户存入 USDC/USDT → RWAlpha 通过持牌 OTC 通道换汇 → 通过持牌券商购入 GLD ETF 份额 → 链上铸造等额 rGLD，全程约 T+1 个工作日。\n\n赎回流程：用户提出赎回请求，合约锁定 rGLD → 券商出售对应 GLD ETF 份额 → OTC 换汇为稳定币 → 到账钱包，同时销毁 rGLD，全程约 T+3 个工作日。\n\n注意：Staking 锁仓期间的 rGLD 需先解押（Unstake）后方可发起赎回，解押后收益 T+3 自动结算。',
      en: 'Minting: User deposits USDC/USDT → RWAlpha converts via licensed OTC channel → Licensed broker purchases GLD ETF shares → Mints equivalent rGLD on-chain. Total time: ~T+1 business day.\n\nRedemption: User submits redemption request, contract locks rGLD → Broker sells corresponding GLD ETF shares → OTC converts to stablecoin → Credited to wallet, rGLD burned simultaneously. Total time: ~T+3 business days.\n\nNote: rGLD in a locked Staking position must be unstaked first. Yield is auto-settled T+3 after unstaking.',
    },
  },
  {
    q: {
      zh: '底层资产 GLD ETF 真实存在吗？如何验证？',
      en: 'Do the underlying GLD ETF assets actually exist? How can I verify?',
    },
    a: {
      zh: '是的，每一枚 rGLD 均由真实的 GLD ETF 份额 1:1 支撑。验证方式：\n\n① 链上储备证明：RWAlpha 定期将持牌券商对账单哈希上链，任何人可公开核查；\n② 券商托管报告：底层资产存放于持牌券商独立托管账户，定期第三方审计。\n\n我们承诺：储备率始终 ≥ 100%，任何时候赎回均有足额资产支撑。',
      en: 'Yes, every rGLD is backed 1:1 by real GLD ETF shares. Verification methods:\n\n① On-chain Proof of Reserves: RWAlpha regularly publishes licensed broker statement hashes on-chain, publicly verifiable by anyone;\n② Broker Custody Report: Underlying assets are held in segregated licensed broker accounts, subject to regular third-party audits.\n\nOur commitment: Reserve ratio always ≥ 100%. Every redemption is fully backed.',
    },
  },
  {
    q: {
      zh: 'Staking 的收益是固定的吗？',
      en: 'Is the Staking yield fixed?',
    },
    a: {
      zh: '不固定。我们提供的是基于历史数据和模型测算的目标收益区间（5–8% 年化），实际收益会随市场表现有所波动。\n\n但有一点可以确定：RWAlpha 通过机构级风控体系严格控制 LTV 系数，使整体风险敎口（PMR）始终处于安全水位。我们的首要原则是确保资产安全，在此基础上再追求可观的 Staking 收益——这与高风险高收益的 DeFi 协议有本质区别。',
      en: 'Not fixed. We provide a target yield range (5–8% annualized) based on historical data and model projections; actual returns will fluctuate with market performance.\n\nWhat is certain: RWAlpha strictly controls LTV ratios through institutional-grade risk management, keeping the overall risk exposure (PMR) at a safe level at all times. Our primary principle is to ensure asset safety first, then pursue meaningful Staking returns — fundamentally different from high-risk DeFi protocols.',
    },
  },
  {
    q: {
      zh: '锁仓 Staking 到期后会自动续期吗？',
      en: 'Does locked Staking auto-renew after the term ends?',
    },
    a: {
      zh: '不会自动续期。锁仓到期后，您的 rGLD 将自动转入活期状态（享受活期 5% 年化），收益继续累积，直到您主动操作解押或再次选择锁仓档位。\n\n我们不会在未经您确认的情况下自动锁定资产，您随时保有对资产的完全控制权。',
      en: 'No auto-renewal. After the lock period ends, your rGLD automatically converts to flexible staking (5% APY), and yield continues to accrue until you manually unstake or choose a new lock tier.\n\nWe will never lock your assets without your confirmation. You retain full control of your assets at all times.',
    },
  },
  {
    q: {
      zh: '如果 RWAlpha 平台出现问题，我的资产还能取回吗？',
      en: 'If RWAlpha has operational issues, can I still recover my assets?',
    },
    a: {
      zh: '可以。RWAlpha 采用资产隔离架构，您的底层 GLD ETF 份额存放于持牌券商的独立托管账户，与 RWAlpha 运营资金完全隔离。\n\n即使 RWAlpha 平台停止运营，托管方仍会按照协议将底层 ETF 资产对应的价值返还给代币持有人。这是 RWA 产品区别于中心化交易所的核心安全优势——您的资产不在平台资产负债表上。',
      en: 'Yes. RWAlpha uses an asset-segregation architecture. Your underlying GLD ETF shares are held in a segregated account at a licensed broker, fully isolated from RWAlpha\'s operational funds.\n\nEven if RWAlpha ceases operations, the custodian will return the value corresponding to the underlying ETF assets to token holders per the protocol. This is the core safety advantage of RWA products over centralized exchanges — your assets are off our balance sheet.',
    },
  },
  {
    q: {
      zh: 'rGLD 目前支持哪些区块链网络？',
      en: 'Which blockchains does rGLD currently support?',
    },
    a: {
      zh: '目前 rGLD 支持 Ethereum 主网和 BNB Chain，更多网络（如 Solana、Arbitrum）正在规划中。\n\n跨链转账通过官方桥接合约完成，合约经过多轮安全审计。请务必通过 RWAlpha 官方渠道进行跨链操作，切勿使用第三方非官方桥接，以避免资产损失风险。',
      en: 'rGLD currently supports Ethereum Mainnet and BNB Chain. More networks (Solana, Arbitrum, etc.) are in the roadmap.\n\nCross-chain transfers are handled through official bridge contracts, which have undergone multiple security audits. Always use official RWAlpha channels for cross-chain operations — never use unofficial third-party bridges to avoid asset loss.',
    },
  },
];

function GoldFAQ({ zh }: { zh: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {GOLD_FAQS.map((faq, i) => (
        <div
          key={i}
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            open === i ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white hover:border-amber-100'
          }`}
        >
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className={`font-semibold text-sm leading-snug ${
              open === i ? 'text-amber-700' : 'text-slate-800'
            }`}>
              <span className="text-amber-400 font-bold mr-2">Q{i + 1}.</span>
              {zh ? faq.q.zh : faq.q.en}
            </span>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              open === i ? 'bg-amber-400 text-white rotate-180' : 'bg-slate-100 text-slate-400'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <div className="border-t border-amber-100 pt-4">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {zh ? faq.a.zh : faq.a.en}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
