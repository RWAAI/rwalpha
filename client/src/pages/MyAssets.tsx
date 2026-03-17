import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function MyAssets() {
  const zh = localStorage.getItem("rwa-lang") !== "en";

  const { data: holdings = [], isLoading: holdingsLoading } = trpc.assets.getHoldings.useQuery();
  const { data: dividends = [], isLoading: dividendsLoading } = trpc.assets.getDividendHistory.useQuery();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* 本金金库 */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            {zh ? "本金金库" : "Principal Vault"}
          </h2>
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
        </div>

        {/* 派息记录 */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            {zh ? "派息记录" : "Dividend History"}
          </h2>
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
        </div>

      </div>

      <Footer />
    </div>
  );
}
