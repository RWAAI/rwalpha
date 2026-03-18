/**
 * GoldVault — rGLD 黄金 Staking 金库
 * 底层 100% GLD · 年化 9% · 无派息 · 自动复利
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Zap, HelpCircle, X, TrendingUp, Lock, RefreshCw, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

// ─── 静态数据 ────────────────────────────────────────────────────────────────
const STATIC_GLD = {
  nav: 242.18,
  nav24hChange: 0.62,
  stakingApy: 9.00,
  mgmtFee: 0.50,
  navTrend: [
    { date: "Oct 24", value: 228.40 },
    { date: "Nov 24", value: 234.10 },
    { date: "Dec 24", value: 238.50 },
    { date: "Jan 25", value: 235.80 },
    { date: "Feb 25", value: 240.20 },
    { date: "Mar 25", value: 242.18 },
  ],
};

function getLang(): boolean {
  try { return localStorage.getItem("rwa-lang") !== "en"; } catch { return true; }
}

// ─── 迷你折线图 ──────────────────────────────────────────────────────────────
function SparkLine({ data }: { data: { date: string; value: number }[] }) {
  const W = 480, H = 100;
  const pad = { top: 12, bottom: 24, left: 40, right: 12 };
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const px = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const py = (v: number) => pad.top + (1 - (v - minV) / range) * (H - pad.top - pad.bottom);
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(d.value)}`).join(" ");
  const areaD = pathD + ` L ${px(data.length - 1)} ${H - pad.bottom} L ${px(0)} ${H - pad.bottom} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#goldGrad)" />
      <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.date}</text>
      ))}
    </svg>
  );
}

// ─── 复利计算器 ──────────────────────────────────────────────────────────────
function CompoundCalc({ apy, zh }: { apy: number; zh: boolean }) {
  const [principal, setPrincipal] = useState("100000");
  const [years, setYears] = useState(3);
  const p = parseFloat(principal.replace(/,/g, "")) || 0;
  const result = p * Math.pow(1 + apy / 100, years);
  const gain = result - p;

  return (
    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
      <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wider">
        {zh ? "复利计算器" : "Compound Calculator"}
      </p>
      <div className="flex gap-3 mb-4">
        {[50000, 100000, 500000].map(v => (
          <button
            key={v}
            onClick={() => setPrincipal(String(v))}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              parseFloat(principal.replace(/,/g, "")) === v
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {zh ? `${v / 10000}万` : `$${(v / 1000).toFixed(0)}K`}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <input
            type="text"
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            className="w-full pl-7 pr-3 py-2 rounded-xl border border-amber-200 bg-white text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-amber-200 rounded-xl px-3">
          {[1, 3, 5].map(y => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                years === y ? "bg-amber-500 text-white" : "text-amber-600 hover:bg-amber-100"
              }`}
            >
              {y}{zh ? "年" : "Y"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">{zh ? "预计总资产" : "Est. Total Value"}</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            ${result.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">{zh ? "复利增益" : "Compound Gain"}</p>
          <p className="text-lg font-bold text-emerald-600 font-mono">
            +${gain.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────
export default function GoldVault() {
  const [zh, setZh] = useState(getLang);
  const [stakeInput, setStakeInput] = useState("");
  const [stakeSuccess, setStakeSuccess] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" as "login" | "register" });
  const [mockLoggedIn, setMockLoggedIn] = useState(() => {
    try { return localStorage.getItem("mock-logged-in") === "1"; } catch { return false; }
  });

  useEffect(() => {
    const handler = () => setZh(getLang());
    window.addEventListener("rwa-lang-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("rwa-lang-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const nav = STATIC_GLD.nav;
  const apy = STATIC_GLD.stakingApy;
  const stakeAmount = parseFloat(stakeInput) || 0;
  const estimatedRGLD = stakeAmount / nav;

  const handleStake = () => {
    if (!stakeAmount) return;
    setStakeSuccess(true);
    setTimeout(() => setStakeSuccess(false), 2500);
  };

  const handleLogout = () => {
    try { localStorage.removeItem("mock-logged-in"); } catch { /* noop */ }
    setMockLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar
        activeTab="vault"
        rightSlot={
          <div className="flex items-center gap-2">
            <Link href="/vault">
              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
                <ChevronRight size={14} className="rotate-180" />
                {zh ? "指数金库" : "Index Vault"}
              </button>
            </Link>
            {mockLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
              >
                {zh ? "退出" : "Logout"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal({ open: true, mode: "login" })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                >
                  {zh ? "登录" : "Login"}
                </button>
                <button
                  onClick={() => setAuthModal({ open: true, mode: "register" })}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all active:scale-95"
                >
                  <Zap size={14} />
                  {zh ? "注册" : "Register"}
                </button>
              </>
            )}
          </div>
        }
      />

      {/* ── 页面标题 ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4 w-full">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            Au
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {zh ? "RWAlpha 黄金代币金库" : "RWAlpha Gold Token Vault"}
          </h1>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            Staking
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            {zh ? "实时数据" : "Live Data"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-slate-500 text-sm">
            {zh
              ? "100% GLD 底层资产 · 年化 9% Staking 收益 · 自动复利增值"
              : "100% GLD Underlying · 9% APY Staking · Auto-Compound Growth"}
          </p>
          <button
            onClick={() => setInfoModal(true)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-amber-600 transition-colors"
          >
            <HelpCircle size={14} />
            {zh ? "产品说明" : "Product Info"}
          </button>
        </div>
      </div>

      {/* ── 主体内容 ── */}
      <div className="max-w-5xl mx-auto px-6 pb-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 左：本金金库 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b
 border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "本金金库" : "Principal Vault"}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                  rGLD
                </span>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-xl border border-amber-100">
                {zh ? "底层资产完全支撑" : "100% GLD Backed"}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* rGLD 持仓 */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {zh ? "rGLD 持仓" : "rGLD Holdings"}
                </p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {mockLoggedIn ? "413.00" : "0.00"}
                    <span className="text-lg font-bold text-amber-500 ml-2">rGLD</span>
                  </p>
                  <div className="mb-1 text-right">
                    <p className="text-[10px] text-slate-400">{zh ? "本金价值" : "Principal Value"}</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">
                      ${mockLoggedIn ? (413 * nav).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 指标行 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: zh ? "rGLD NAV" : "rGLD NAV", value: `$${nav.toFixed(2)}` },
                  { label: zh ? "24H 变动" : "24H Change", value: `↑+${STATIC_GLD.nav24hChange}%`, green: true },
                  { label: zh ? "年化 Staking" : "Annual Staking", value: `+${apy.toFixed(2)}%`, green: true },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-bold font-mono ${item.green ? "text-emerald-600" : "text-slate-800"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* NAV 走势图 */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  {zh ? "GLD NAV 走势（近 6 个月）" : "GLD NAV Trend (6M)"}
                </p>
                <SparkLine data={STATIC_GLD.navTrend} />
              </div>

              {/* 认购/赎回 */}
              <div className="border-t border-slate-50 pt-4">
                <div className="flex gap-2 mb-3">
                  <button className="flex-1 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white">
                    {zh ? "认购" : "Stake"}
                  </button>
                  <button className="flex-1 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                    {zh ? "赎回" : "Unstake"}
                  </button>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                    Ethereum
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 mb-2">
                  <p className="text-[10px] text-slate-400 mb-1">{zh ? "支付" : "Pay"}</p>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="0"
                      value={stakeInput}
                      onChange={e => setStakeInput(e.target.value)}
                      className="bg-transparent text-2xl font-bold text-slate-800 w-32 focus:outline-none font-mono"
                    />
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">$</span>
                      <span className="text-sm font-bold text-slate-700">USDC</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{zh ? "余额: 0" : "Balance: 0"} <span className="text-amber-500 font-bold cursor-pointer">Max</span></p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 mb-3">
                  <p className="text-[10px] text-slate-400 mb-1">{zh ? "最少获得" : "Min. Receive"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-800 font-mono">
                      {estimatedRGLD > 0 ? estimatedRGLD.toFixed(4) : "0"}
                    </span>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-[8px] font-bold">Au</span>
                      <span className="text-sm font-bold text-amber-600">rGLD</span>
                    </div>
                  </div>
                </div>
                {mockLoggedIn ? (
                  <button
                    onClick={handleStake}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md ${
                      stakeSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900"
                    }`}
                  >
                    {stakeSuccess ? (zh ? "✓ 认购成功" : "✓ Staked!") : (zh ? "确认认购" : "Confirm Stake")}
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthModal({ open: true, mode: "login" })}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                  >
                    {zh ? "请先连接钱包" : "Connect Wallet First"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── 右：Staking 收益 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "Staking 收益" : "Staking Yield"}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">
                {zh ? "自动复利" : "Auto-Compound"}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 年化 APY */}
              <div className="text-center py-2">
                <p className="text-xs text-slate-400 mb-1">{zh ? "年化 Staking 收益率" : "Annual Staking APY"}</p>
                <p className="text-5xl font-extrabold text-amber-500 tracking-tight font-mono">
                  ~{apy.toFixed(2)}%<sup className="text-xl text-slate-400 font-normal ml-0.5">*</sup>
                </p>
                <p className="text-xs text-slate-400 mt-1">{zh ? "已扣除 0.50% 管理费" : "After 0.50% mgmt. fee"}</p>
              </div>

              {/* 已质押 / 累计收益 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-xs text-slate-500 mb-1">{zh ? "已质押价值" : "Staked Value"}</p>
                  <p className="text-2xl font-extrabold text-slate-900 font-mono">
                    ${mockLoggedIn ? (413 * nav).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-xs text-slate-500 mb-1">{zh ? "累计 Staking 收益" : "Accrued Yield"}</p>
                  <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                    ${mockLoggedIn ? "3,842.10" : "0.00"}
                  </p>
                </div>
              </div>

              {/* 复利说明 */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                {[
                  { icon: <TrendingUp size={14} className="text-amber-500" />, text: zh ? "收益每日自动复利，无需手动操作" : "Yield auto-compounds daily, no manual action needed" },
                  { icon: <Lock size={14} className="text-slate-400" />, text: zh ? "底层 100% GLD，黄金价格上涨额外增值" : "100% GLD backing — gold price appreciation adds extra value" },
                  { icon: <RefreshCw size={14} className="text-emerald-500" />, text: zh ? "随时可赎回，无锁仓期限制" : "Redeem anytime, no lock-up period" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    <p className="text-xs text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* 复利计算器 */}
              <CompoundCalc apy={apy} zh={zh} />

              {/* 底层资产 */}
              <div className="border-t border-slate-50 pt-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">
                  {zh ? "底层资产" : "Underlying Asset"}
                </p>
                <div className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                      GLD
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">SPDR Gold Shares</p>
                      <p className="text-[10px] text-slate-400">NYSE Arca · GLD · 100% 配比</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 font-mono">${nav.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600 font-mono">+{STATIC_GLD.nav24hChange}%</p>
                  </div>
                </div>
              </div>

              {/* 免责声明 */}
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                * {zh
                  ? "以上数据基于历史表现测算，业绩随市场行情波动，不作固定承诺，不构成投资建议。"
                  : "Figures are based on historical performance. Returns fluctuate with market conditions and are not guaranteed. Not investment advice."}
              </p>
            </div>
          </div>

        </div>
      </div>

      <Footer />

      {/* 产品说明弹层 */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">{zh ? "rGLD 产品说明" : "rGLD Product Info"}</h3>
              <button onClick={() => setInfoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {(zh ? [
                "rGLD 是 RWAlpha 发行的黄金代币，底层 100% 挂钩 SPDR Gold Shares（GLD）",
                "持有 rGLD 即可自动享受年化 9% 的 Staking 收益，收益每日复利",
                "不派息，收益以 rGLD 代币形式自动累积，赎回时一并结算",
                "随时可认购或赎回，无锁仓期，T+1 到账",
                "管理费 0.50%/年，已从 APY 中扣除",
                "本产品最终解释权归 RWAlpha 平台所有",
              ] : [
                "rGLD is RWAlpha's gold token, 100% backed by SPDR Gold Shares (GLD)",
                "Holding rGLD automatically earns 9% APY staking yield, compounded daily",
                "No cash dividends — yield accrues as rGLD tokens and is settled upon redemption",
                "Stake or unstake anytime, no lock-up period, T+1 settlement",
                "0.50%/yr management fee already deducted from APY",
                "RWAlpha reserves the right of final interpretation of this product",
              ]).map((text, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        onLoginSuccess={() => {
          localStorage.setItem("mock-logged-in", "1");
          setMockLoggedIn(true);
          setAuthModal(prev => ({ ...prev, open: false }));
        }}
        zh={zh}
      />
    </div>
  );
}
