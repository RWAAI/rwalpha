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

// ─── 数据 ───────────────────────────────────────────────────────────────────

const VAULT_DATA = {
  product: "rINDEX",
  nav: 52.74,
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
    { date: "Jan 20", value: 52.10 },
    { date: "Jan 27", value: 51.40 },
    { date: "Feb 03", value: 51.80 },
    { date: "Feb 10", value: 52.20 },
    { date: "Feb 17", value: 52.60 },
    { date: "Feb 24", value: 50.30 },
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
  const zh = lang === "zh";

  const v = VAULT_DATA;
  const principalValue = v.holdings * v.nav;

  const handleClaim = () => {
    setClaimSuccess(true);
    setTimeout(() => setClaimSuccess(false), 3000);
  };

  const navTabs = zh
    ? ["首页", "金库", "如何运作", "洞察", "积分", "文档"]
    : ["Home", "Vault", "How It Works", "Insights", "Points", "Docs"];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── 顶部导航 ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="text-xl font-extrabold tracking-tight cursor-pointer" style={{ color: "#38bdf8" }}>
                RWAlpha.io
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navTabs.map((tab, i) => {
                const isVault = i === 1;
                const isHome = i === 0;
                const cls = `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isVault
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`;
                if (isHome) return <Link key={tab} href="/"><button className={cls}>{tab}</button></Link>;
                if (isVault) return <Link key={tab} href="/vault"><button className={cls}>{tab}</button></Link>;
                // 「金库」Tab 高亮，首页 Tab 链接到 /
                return <button key={tab} className={cls} onClick={() => alert(zh ? "即将上线" : "Coming soon")}>{tab}</button>;
              })}
            </nav>
          </div>

          {/* Right: Lang + Connect Wallet */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              🌐 {zh ? "EN" : "中文"}
            </button>
            <button
              onClick={() => setConnected(!connected)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm ${
                connected
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-slate-900 hover:bg-slate-700 text-white"
              }`}
            >
              <Wallet size={15} />
              {connected ? "0x3f...a8c2" : (zh ? "连接钱包" : "Connect Wallet")}
            </button>
          </div>
        </div>
      </header>

      {/* ── 页面标题 ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <BarChart2 size={22} className="text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">
            {zh ? "rINDEX Vault" : "rINDEX Vault"}
          </h1>
          <Link href="/vault">
            <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors ml-1">
              {zh ? "查看产品详情" : "View product details"}
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
        <p className="text-slate-500 text-sm">
          {zh
            ? "纳指100指数底仓 · AI 驱动调仓 · 每周现金派息"
            : "Nasdaq 100 core · AI-driven rebalancing · Weekly cash dividend"}
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

              {/* 走势图 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {zh ? "NAV 走势" : "NAV Trend"}

                  </p>
                  <div className="flex gap-1">
                    {(["7D", "1M", "6M", "1Y"] as ChartPeriod[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          period === p
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <SparkLine data={v.navTrend} period={period} />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
                  {zh ? "− 赎回（T+3）" : "− Redeem (T+3)"}
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 transition-all active:scale-95">
                  <Zap size={15} />
                  {zh ? "+ 认购" : "+ Subscribe"}
                </button>
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
                  <span>
                    {zh ? "累计已领" : "Total Claimed"}{" "}
                    <span className="text-slate-700 font-semibold">
                      ${v.totalClaimed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </span>
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

              {/* 自动复利 */}
              <div className="flex items-start justify-between gap-3 py-3 border-t border-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">
                    {zh ? "自动复利" : "Auto-Compound"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {zh ? "自动将收益再投入本金金库，" : "Reinvest yield into principal vault, "}
                    <span className="text-emerald-600 cursor-pointer underline">
                      {zh ? "实现复利增长" : "compound growth"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setAutoCompound(!autoCompound)}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                    autoCompound ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      autoCompound ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

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
