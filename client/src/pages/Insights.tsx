/**
 * 洞察页面 — 占位符
 * 展示即将上线的内容分类，风格与 RWAlpha 保持一致
 */

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { BrainCircuit, BarChart2, Newspaper, BookOpen, Bell, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    icon: <BrainCircuit size={28} className="text-indigo-500" />,
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    titleZh: "AI 市场分析",
    titleEn: "AI Market Analysis",
    descZh: "每周由 AI 引擎生成的市场情绪报告、期权溢价分析与调仓建议，帮助您把握最佳入场时机。",
    descEn: "Weekly AI-generated market sentiment reports, options premium analysis, and rebalancing signals to help you time the market.",
    tagZh: "即将上线",
    tagEn: "Coming Soon",
    tagColor: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: <BarChart2 size={28} className="text-emerald-500" />,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    titleZh: "ETF 深度研究",
    titleEn: "ETF Deep Dives",
    descZh: "对核心持仓（科技期权收益 ETF、纳指期权增强 ETF、指数底仓 ETF）的深度拆解，包括历史派息数据、费率对比与底层资产分析。",
    descEn: "In-depth breakdowns of our core holdings — Tech Option Income ETF, Nasdaq Option Enhanced ETF, Index Core ETFs — historical dividends, fee comparisons, and underlying asset analysis.",
    tagZh: "即将上线",
    tagEn: "Coming Soon",
    tagColor: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: <Newspaper size={28} className="text-amber-500" />,
    bg: "bg-amber-50",
    border: "border-amber-100",
    titleZh: "行业资讯",
    titleEn: "Industry News",
    descZh: "精选 RWA 代币化、链上资产管理与 DeFi 收益领域的最新动态，每日更新，去噪提质。",
    descEn: "Curated updates on RWA tokenization, on-chain asset management, and DeFi yield — daily, signal over noise.",
    tagZh: "即将上线",
    tagEn: "Coming Soon",
    tagColor: "bg-amber-100 text-amber-600",
  },
  {
    icon: <BookOpen size={28} className="text-violet-500" />,
    bg: "bg-violet-50",
    border: "border-violet-100",
    titleZh: "投资者教育",
    titleEn: "Investor Education",
    descZh: "从备兑期权策略到 NAV 计算方法，系统化的知识库帮助您理解 RWAlpha 金库背后的每一个决策逻辑。",
    descEn: "From covered-call strategies to NAV calculation — a structured knowledge base explaining every decision behind RWAlpha vaults.",
    tagZh: "即将上线",
    tagEn: "Coming Soon",
    tagColor: "bg-violet-100 text-violet-600",
  },
];

export default function Insights() {
  const getLang = () => { try { return localStorage.getItem('rwa-lang') !== 'en'; } catch { return true; } };
  const [zh, setZh] = useState(getLang);

  useEffect(() => {
    const handler = () => setZh(getLang());
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar activeTab="insights" />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {zh ? "内容即将上线" : "Content Coming Soon"}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              {zh ? "洞察" : "Insights"}
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
              {zh
                ? "AI 驱动的市场分析、ETF 深度研究与 RWA 行业动态，帮助您做出更明智的投资决策。"
                : "AI-powered market analysis, ETF deep dives, and RWA industry updates to help you invest smarter."}
            </p>

            {/* 订阅表单 */}
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={zh ? "输入邮箱，第一时间获取通知" : "Enter email to get notified first"}
                  className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <Bell size={14} />
                  {zh ? "订阅通知" : "Notify Me"}
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-5 py-3 rounded-xl">
                ✓ {zh ? `已订阅！我们会在上线时通知 ${email}` : `Subscribed! We'll notify ${email} when we launch.`}
              </div>
            )}
          </div>
        </section>

        {/* ── 内容分类卡片 ── */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
            {zh ? "即将推出的内容板块" : "Upcoming Content Sections"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CATEGORIES.map((cat, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-2xl border ${cat.border} shadow-sm p-6 hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                {/* 背景装饰 */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${cat.bg} opacity-60`} />

                <div className={`relative w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}>
                  {cat.icon}
                </div>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-800">
                    {zh ? cat.titleZh : cat.titleEn}
                  </h3>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.tagColor}`}>
                    {zh ? cat.tagZh : cat.tagEn}
                  </span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">
                  {zh ? cat.descZh : cat.descEn}
                </p>

                <div className="mt-4 flex items-center gap-1 text-xs text-slate-300 group-hover:text-indigo-400 transition-colors font-medium">
                  {zh ? "敬请期待" : "Stay tuned"}
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 底部 CTA ── */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-600 mx-6 mb-14 rounded-2xl max-w-4xl md:mx-auto">
          <div className="px-8 py-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {zh ? "在等待期间，先探索我们的金库" : "Explore our vaults while you wait"}
            </h2>
            <p className="text-indigo-200 text-sm mb-6">
              {zh
                ? "rNDX 金库已上线，AI 驱动管理 · 每周现金派息 · 指数底仓增值"
                : "rNDX Vault is live — AI management, weekly dividends, index core growth"}
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              {zh ? "查看金库" : "View Vault"}
              <ArrowRight size={14} />
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
