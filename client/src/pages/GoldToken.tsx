/**
 * GoldToken — rGLD 黄金代币页面
 * 布局：头部说明 + 左侧买卖框 + 右侧年化8%说明 + Staking框
 */

import { useState, useEffect } from "react";
import { HelpCircle, ArrowUpRight, Zap, Lock, TrendingUp, Shield, Coins } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// ─── 静态数据 ────────────────────────────────────────────────────────────────

const GLD_NAV = 459.00; // GLD ETF 价格（USD）
const RGLD_NAV = 459.00; // rGLD 1:1 挂钩 GLD
const STAKING_APY = 8.0; // 年化 8%
const STAKING_LOCK_DAYS = 30;

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function GoldToken() {
  const [zh, setZh] = useState(() => localStorage.getItem("rwa-lang") !== "en");
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [spendAmt, setSpendAmt] = useState("");
  const [payToken, setPayToken] = useState<"USDC" | "USDT">("USDC");
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [stakingAmt, setStakingAmt] = useState("");
  const [stakingDays, setStakingDays] = useState(30);
  const [connected] = useState(false);
  const [stakingTab, setStakingTab] = useState<"stake" | "unstake">("stake");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [showApyTooltip, setShowApyTooltip] = useState(false);

  useEffect(() => {
    const handler = () => setZh(localStorage.getItem("rwa-lang") !== "en");
    window.addEventListener("rwa-lang-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("rwa-lang-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const receiveAmt = spendAmt && RGLD_NAV > 0
    ? tradeMode === "buy"
      ? (parseFloat(spendAmt) / RGLD_NAV).toFixed(4)
      : (parseFloat(spendAmt) * RGLD_NAV).toFixed(2)
    : "0";

  const stakingEst = stakingAmt && parseFloat(stakingAmt) > 0
    ? ((parseFloat(stakingAmt) * RGLD_NAV * STAKING_APY / 100) * (stakingDays / 365)).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar activeTab="gold-token" />

      {/* ── 头部说明 ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5 flex-1">
              {/* 黄金图标 */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
                <span className="text-3xl">🥇</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">rGLD</h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold tracking-wide">
                    {zh ? "黄金代币" : "Gold Token"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    {zh ? "100% 挂钩 GLD ETF" : "100% Pegged to GLD ETF"}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  {zh
                    ? "rGLD 是 RWAlpha 发行的黄金代币，100% 由 SPDR Gold Shares（GLD）ETF 底层资产支撑，1 rGLD = 1 GLD ETF 份额。链上可验证，随时可赎回。"
                    : "rGLD is RWAlpha's gold token, 100% backed by SPDR Gold Shares (GLD) ETF. 1 rGLD = 1 GLD ETF share. On-chain verifiable, redeemable at any time."
                  }
                </p>
              </div>
          </div>

          {/* 右上角：Staking 计算器小按鈕 */}
          <a
            href="https://rgld.manus.space"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors group border border-slate-300 hover:border-slate-400 rounded-full px-2.5 py-1"
          >
            <Coins size={12} className="text-slate-400" />
            {zh ? "Staking 计算器" : "Staking Calculator"}
            <ArrowUpRight size={11} className="text-slate-400" />
          </a>

          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap gap-2 mt-5 pl-[84px]">
            {[
              { icon: <Shield size={12} />, label: zh ? "底层资产完全支撑" : "Fully Asset Backed" },
              { icon: <TrendingUp size={12} />, label: zh ? "跟随黄金价格增值" : "Gold Price Appreciation" },
              { icon: <Coins size={12} />, label: zh ? "Staking 年化 ~8%" : "~8% Staking APY" },
              { icon: <ArrowUpRight size={12} />, label: zh ? "随时赎回" : "Redeem Anytime" },
            ].map(f => (
              <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-100 text-slate-600 text-xs font-medium shadow-sm">
                <span className="text-amber-500">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 主体：左买卖 + 右Staking ──────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* ── 左侧：买卖框 ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-bold text-slate-800 text-base">{zh ? "rGLD 交易" : "rGLD Trade"}</span>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100">
                {zh ? "底层资产完全支撑" : "Fully Asset Backed"}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 持仓 */}
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{zh ? "rGLD 持仓" : "rGLD Holdings"}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">0.0000</span>
                    <span className="text-amber-500 font-semibold text-lg">rGLD</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{zh ? "持仓价值" : "Holdings Value"}</p>
                  <p className="text-sm font-bold font-mono text-slate-800">$0.00</p>
                </div>
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
                  <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" defaultValue="eth">
                    <option value="eth">🔵 Ethereum</option>
                    <option value="bnb">🟡 BNB Chain</option>
                  </select>
                </div>

                {/* 支付框 */}
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
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                          <span className="text-sm font-bold text-amber-700">rGLD</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}
                        <span>0</span>
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
                      <div className="text-[10px] text-slate-400">
                        {zh ? "余额：" : "Balance: "}<span>0</span>
                      </div>
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
                          : (zh ? `赎回 获得 ${receiveAmt} ${payToken}` : `Redeem → ${receiveAmt} ${payToken}`)
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── 右侧：Staking 金库（上半操作 + 下半 Yield Vault）── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">

            {/* ── 上半：Stake / Unstake Tab ── */}
            <div className="flex-1 flex flex-col border-b border-slate-100">
              {/* Tab 头部 */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="font-bold text-slate-800 text-base">{zh ? "rGLD Staking" : "rGLD Staking"}</span>
                </div>
                <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                  {(["stake", "unstake"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStakingTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        stakingTab === tab ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >{tab === "stake" ? (zh ? "质押" : "Stake") : (zh ? "解押" : "Unstake")}</button>
                  ))}
                </div>
              </div>

              {/* Tab: 质押 */}
              {stakingTab === "stake" && (
                <div className="px-6 py-5 space-y-4">
                  {/* 质押数量输入 */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-400">{zh ? "质押数量" : "Stake Amount"}</p>
                      <p className="text-[10px] text-slate-400">{zh ? "余额：0 rGLD" : "Balance: 0 rGLD"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" placeholder="0"
                        value={stakingAmt}
                        onChange={e => setStakingAmt(e.target.value)}
                        className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0"
                      />
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
                      {[30, 60, 90].map(d => (
                        <button
                          key={d}
                          onClick={() => setStakingDays(d)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                            stakingDays === d
                              ? "bg-amber-500 text-white shadow-sm shadow-amber-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >{d}{zh ? " 天" : "D"}</button>
                      ))}
                    </div>
                  </div>

                  {/* APY + 预估收益 */}
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-emerald-600 font-mono">~{STAKING_APY}%</span>
                        <span className="text-xs text-slate-500">{zh ? "年化" : "APY"}</span>
                        <div className="relative">
                          <button
                            onClick={() => setShowApyTooltip(v => !v)}
                            className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-[10px] font-bold transition-colors"
                          >?</button>
                          {showApyTooltip && (
                            <div className="absolute left-0 top-6 z-30 w-64 bg-slate-900 text-white text-xs rounded-2xl p-4 shadow-xl">
                              <p className="font-bold mb-1.5">{zh ? "收益机制" : "How Yield Works"}</p>
                              <p className="text-slate-300 leading-relaxed">
                                {zh
                                  ? "质押 rGLD 后，RWAlpha 将底层 GLD ETF 的出借收益（Securities Lending）按 ~8% 年化分配给质押者。解押时，累计收益自动进入您的 Yield Vault，可随时提取至钱包。"
                                  : "When you stake rGLD, RWAlpha distributes securities lending income from the underlying GLD ETF at ~8% APY. Upon unstaking, accrued yield is automatically credited to your Yield Vault for withdrawal anytime."}
                              </p>
                              <button onClick={() => setShowApyTooltip(false)} className="mt-2 text-slate-400 hover:text-white text-[10px]">✕ {zh ? "关闭" : "Close"}</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5">{zh ? "预计收益" : "Est. Yield"}</p>
                        <p className="text-lg font-extrabold text-slate-900 font-mono">${stakingEst}</p>
                      </div>
                    </div>
                  </div>

                  {/* 质押按钮 */}
                  <button
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                      !connected || !stakingAmt || parseFloat(stakingAmt) <= 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200"
                    }`}
                    disabled={!connected || !stakingAmt || parseFloat(stakingAmt) <= 0}
                  >
                    <Lock size={14} />
                    {!connected
                      ? (zh ? "请先连接钱包" : "Connect Wallet First")
                      : !stakingAmt || parseFloat(stakingAmt) <= 0
                        ? (zh ? "输入质押数量" : "Enter Stake Amount")
                        : (zh ? `质押 ${stakingAmt} rGLD · ${stakingDays} 天` : `Stake ${stakingAmt} rGLD · ${stakingDays}D`)}
                  </button>
                </div>
              )}

              {/* Tab: 解押 */}
              {stakingTab === "unstake" && (
                <div className="px-6 py-5 space-y-4">
                  {/* 当前质押仓位 */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-400 mb-2">{zh ? "当前质押仓位" : "Staked Position"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">0.0000 <span className="text-amber-500 text-base">rGLD</span></span>
                      <span className="text-xs text-slate-400">{zh ? "到期：—" : "Expires: —"}</span>
                    </div>
                  </div>

                  {/* 解押数量 */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-400">{zh ? "解押数量" : "Unstake Amount"}</p>
                      <p className="text-[10px] text-slate-400">{zh ? "已质押：0 rGLD" : "Staked: 0 rGLD"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" placeholder="0"
                        value={unstakeAmt}
                        onChange={e => setUnstakeAmt(e.target.value)}
                        className="flex-1 text-2xl font-semibold text-slate-400 bg-transparent outline-none w-0 min-w-0"
                      />
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                        <span className="text-sm font-bold text-amber-700">rGLD</span>
                      </div>
                    </div>
                  </div>

                  {/* 解押按钮 */}
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
                    disabled
                  >
                    {zh ? "暂无可解押仓位" : "No Staked Position"}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    {zh ? "提前解押将损失全部 Staking 收益" : "Early unstaking forfeits all accrued yield."}
                  </p>
                </div>
              )}
            </div>

            {/* ── 下半：Yield Vault（固定展示）── */}
            <div className="px-6 py-5 space-y-4">
              {/* Vault 标题 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="font-bold text-slate-800 text-base">Yield Vault</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                  {zh ? "可领收益" : "Claimable"}
                </span>
              </div>

              {/* 可领收益大数字 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 px-5 py-4">
                <p className="text-xs text-slate-400 mb-1">{zh ? "可领收益（USDT）" : "Claimable Yield (USDT)"}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono">$0.00</span>
                  <span className="text-emerald-600 font-semibold text-sm">USDT</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">{zh ? "来源：rGLD Staking 收益 · 解押后自动入账" : "Source: rGLD Staking Yield · Auto-credited on unstake"}</p>
              </div>

              {/* 领取按钮 */}
              <button
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-400 cursor-not-allowed"
                disabled
              >
                <Zap size={15} />
                {zh ? "暂无可提取收益" : "No Yield to Withdraw"}
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                {zh ? "Staking 解押后收益自动进入此处，可随时提取至钱包" : "Staking yield flows here on unstake. Withdraw to wallet anytime."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
