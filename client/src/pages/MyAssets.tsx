import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function MyAssets() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<"zh" | "en">(localStorage.getItem("rwa-lang") === "en" ? "en" : "zh");
  const zh = lang === "zh";
  const [tab, setTab] = useState<"holdings" | "dividends">("holdings");

  const { data: holdings = [], isLoading: holdingsLoading } = trpc.assets.getHoldings.useQuery();
  const { data: dividends = [], isLoading: dividendsLoading } = trpc.assets.getDividendHistory.useQuery();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── 顶部导航 ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vault")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              {zh ? "返回金库" : "Back to Vault"}
            </button>
            <span className="text-slate-200">|</span>
            <h1 className="text-sm font-semibold text-slate-800">{zh ? "我的资产" : "My Assets"}</h1>
          </div>
          <button
            onClick={() => {
              const next = zh ? "en" : "zh";
              setLang(next);
              localStorage.setItem("rwa-lang", next);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2 py-1 transition-colors"
          >
            🌐 {zh ? "EN" : "中文"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Tab 切换 ── */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
          <button
            onClick={() => setTab("holdings")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              tab === "holdings"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {zh ? "本金金库" : "Principal Vault"}
          </button>
          <button
            onClick={() => setTab("dividends")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              tab === "dividends"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {zh ? "派息记录" : "Dividend History"}
          </button>
        </div>

        {/* ── 本金金库表格 ── */}
        {tab === "holdings" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">{zh ? "代币" : "Token"}</th>
                  <th className="text-right px-4 py-3 font-medium">{zh ? "数量" : "Amount"}</th>
                  <th className="text-right px-4 py-3 font-medium">NAV</th>
                  <th className="text-right px-4 py-3 font-medium">{zh ? "市值" : "Value"}</th>
                </tr>
              </thead>
              <tbody>
                {holdingsLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      {zh ? "加载中..." : "Loading..."}
                    </td>
                  </tr>
                ) : holdings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      {zh ? "暂无持仓记录" : "No holdings yet"}
                    </td>
                  </tr>
                ) : (
                  (holdings as unknown as Array<{ id: number; tokenSymbol: string; quantity: string; navPerToken: string | null }>).map((h) => (
                    <tr key={h.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800">{h.tokenSymbol}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{parseFloat(h.quantity).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{h.navPerToken ? `$${parseFloat(h.navPerToken).toFixed(2)}` : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {h.navPerToken ? `$${(parseFloat(h.quantity) * parseFloat(h.navPerToken)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 派息记录表格 ── */}
        {tab === "dividends" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">{zh ? "日期" : "Date"}</th>
                  <th className="text-left px-4 py-3 font-medium">{zh ? "代币" : "Token"}</th>
                  <th className="text-right px-4 py-3 font-medium">{zh ? "金额 (USDT)" : "Amount (USDT)"}</th>
                  <th className="text-right px-4 py-3 font-medium">{zh ? "状态" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {dividendsLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      {zh ? "加载中..." : "Loading..."}
                    </td>
                  </tr>
                ) : dividends.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      {zh ? "暂无派息记录" : "No dividend records yet"}
                    </td>
                  </tr>
                ) : (
                  (dividends as unknown as Array<{ id: number; tokenSymbol: string; amount: string; status: string; date: string; claimedAt: Date | null }>).map((d) => (
                    <tr key={d.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {d.date || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{d.tokenSymbol}</td>
                      <td className="px-4 py-3 text-right text-slate-700">${parseFloat(d.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          d.status === "claimed"
                            ? "bg-emerald-100 text-emerald-600"
                            : d.status === "claimable"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {d.status === "claimed"
                            ? (zh ? "已领取" : "Claimed")
                            : d.status === "claimable"
                            ? (zh ? "可领取" : "Claimable")
                            : (zh ? "待发放" : "Pending")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
