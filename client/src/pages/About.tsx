/**
 * About — GitBook 风格文档页面
 * 左侧固定目录 + 右侧内容区，支持中英文切换
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ChevronRight, Menu, X, Globe } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// ─── 目录结构 ────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "overview",
    zh: "概述",
    en: "Overview",
    children: [
      { id: "what-is-rwalpha", zh: "什么是 RWAlpha？", en: "What is RWAlpha?" },
      { id: "rwa-20", zh: "RWA 2.0 愿景", en: "RWA 2.0 Vision" },
      { id: "dual-vault", zh: "双保险库协议", en: "Dual Vault Protocol" },
      { id: "products", zh: "产品矩阵", en: "Product Matrix" },
    ],
  },
  {
    id: "team",
    zh: "团队介绍",
    en: "Team",
    children: [
      { id: "team-intro", zh: "核心团队", en: "Core Team" },
    ],
  },
  {
    id: "how-it-works",
    zh: "运作机制",
    en: "How It Works",
    children: [
      { id: "ai-engine", zh: "AI 引擎", en: "AI Engine" },
      { id: "fund-flow", zh: "资金流转路径", en: "Fund Flow" },
    ],
  },
  {
    id: "security",
    zh: "安全与审计",
    en: "Security & Audit",
    children: [
      { id: "audit", zh: "审计报告", en: "Audit Reports" },
      { id: "key-addresses", zh: "核心合约地址", en: "Key Addresses" },
    ],
  },
  {
    id: "legal",
    zh: "法律与合规",
    en: "Legal & Compliance",
    children: [
      { id: "compliance-arch", zh: "合规架构", en: "Compliance Architecture" },
      { id: "dubai-fund", zh: "迪拜伞型基金", en: "Dubai Umbrella Fund" },
      { id: "cayman-fund", zh: "开曼伞型基金", en: "Cayman Umbrella Fund" },
    ],
  },
  {
    id: "community",
    zh: "社区与支持",
    en: "Community & Support",
    children: [
      { id: "onboarding", zh: "新手指南", en: "Onboarding" },
      { id: "contact", zh: "联系我们", en: "Contact & Support" },
    ],
  },
  {
    id: "faq",
    zh: "常见问题",
    en: "FAQ",
    children: [
      { id: "faq-1", zh: "什么是 RWAlpha？", en: "What is RWAlpha?" },
      { id: "faq-2", zh: "双保险库如何运作？", en: "How does Dual Vault work?" },
      { id: "faq-3", zh: "收益分配频率？", en: "Yield Distribution Frequency?" },
      { id: "faq-4", zh: "提供哪些产品？", en: "What products are available?" },
      { id: "faq-5", zh: "资金安全如何保障？", en: "How is fund safety ensured?" },
      { id: "faq-6", zh: "AI 引擎的作用？", en: "What does the AI Engine do?" },
    ],
  },
];

// ─── 侧边栏 ──────────────────────────────────────────────────────────────────

function Sidebar({
  zh,
  activeId,
  onSelect,
  mobile = false,
  onClose,
}: {
  zh: boolean;
  activeId: string;
  onSelect: (id: string) => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <nav className={`${mobile ? "w-full" : "w-64 shrink-0"}`}>
      {mobile && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <span className="font-bold text-slate-800 text-sm">{zh ? "目录" : "Contents"}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
      )}
      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => { onSelect(section.id); onClose?.(); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                activeId === section.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {zh ? section.zh : section.en}
            </button>
            <div className="ml-3 mt-0.5 space-y-0.5">
              {section.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => { onSelect(child.id); onClose?.(); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 flex items-center gap-1.5 ${
                    activeId === child.id
                      ? "text-indigo-600 font-medium"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ChevronRight size={10} className="shrink-0 opacity-50" />
                  {zh ? child.zh : child.en}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─── 内容区块组件 ─────────────────────────────────────────────────────────────

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      {children}
    </section>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">{children}</h1>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-800 mb-3 mt-8 leading-tight">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-700 mb-2 mt-5">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed mb-3 text-sm">{children}</p>;
}

function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: "bg-indigo-50 border-indigo-200 text-indigo-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    tip: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm mb-4 ${styles[type]}`}>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1.5 mb-1">
      {children}
    </span>
  );
}

function Divider() {
  return <hr className="border-slate-100 my-8" />;
}

// ─── FAQ 条目 ─────────────────────────────────────────────────────────────────
function FaqItem({ id, question, answer }: { id: string; question: string; answer: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 mb-6">
      <h3 className="text-sm font-bold text-slate-800 mb-2">{question}</h3>
      <div className="text-sm text-slate-600 leading-relaxed">
        {answer}
      </div>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

export default function About() {
  const getLang = () => localStorage.getItem("rwa-lang") === "en" ? "en" : "zh";
  const [lang, setLang] = useState<"zh" | "en">(getLang);
  const zh = lang === "zh";
  const [activeId, setActiveId] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 切换语言
  const toggleLang = () => {
    const next = zh ? "en" : "zh";
    setLang(next);
    localStorage.setItem("rwa-lang", next);
    window.dispatchEvent(new Event('rwa-lang-change'));
  };

  // 监听其他页面触发的语言切换
  useEffect(() => {
    const handler = () => {
      try { setLang(localStorage.getItem('rwa-lang') === 'en' ? 'en' : 'zh'); } catch { /* noop */ }
    };
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // 滚动到指定 section
  const scrollTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 页面加载时处理 URL hash，自动滚动到对应锁点
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveId(hash);
      // 等待 DOM 渲染完成再滚动
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  // 监听滚动，更新 activeId
  useEffect(() => {
    const allIds = SECTIONS.flatMap((s) => [s.id, ...s.children.map((c) => c.id)]);
    const handler = () => {
      for (const id of [...allIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />

      {/* 移动端侧边栏遮罩 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 bg-white h-full shadow-xl p-5 overflow-y-auto">
            <Sidebar zh={zh} activeId={activeId} onSelect={scrollTo} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部工具栏（移动端） */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Menu size={15} />
            {zh ? "目录" : "Contents"}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Globe size={13} />
            {zh ? "EN" : "中文"}
          </button>
        </div>

        <div className="flex gap-10">
          {/* 左侧固定目录（桌面端） */}
          <div className="hidden lg:block sticky top-24 self-start h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {zh ? "目录" : "Contents"}
              </span>
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md px-2 py-1 transition-colors"
              >
                <Globe size={11} />
                {zh ? "EN" : "中文"}
              </button>
            </div>
            <Sidebar zh={zh} activeId={activeId} onSelect={scrollTo} />
          </div>

          {/* 右侧内容区 */}
          <div ref={contentRef} className="flex-1 min-w-0 max-w-3xl">

            {/* ── Overview ── */}
            <Section id="overview">
              <div className="flex items-center gap-2 mb-2">
                <Badge>RWA 2.0</Badge>
                <Badge>AI-Powered</Badge>
              </div>
              <H1>{zh ? "RWAlpha 协议文档" : "RWAlpha Protocol Docs"}</H1>
              <P>
                {zh
                  ? "欢迎来到 RWAlpha 官方文档。本文档将带您全面了解 RWAlpha 的核心机制、产品矩阵、合规架构以及如何开始您的 RWA 2.0 收益之旅。"
                  : "Welcome to the official RWAlpha documentation. This guide covers the core mechanics, product matrix, compliance architecture, and how to start your RWA 2.0 yield journey."}
              </P>
              <Callout type="tip">
                {zh
                  ? "RWAlpha 将于 2026 年 Q1 正式发布主网。本文档持续更新中。"
                  : "RWAlpha mainnet launches in Q1 2026. This documentation is continuously updated."}
              </Callout>
            </Section>

            <Section id="what-is-rwalpha">
              <H2>{zh ? "什么是 RWAlpha？" : "What is RWAlpha?"}</H2>
              <P>
                {zh
                  ? "RWAlpha 是一家致力于通过 AI 技术优化真实世界资产（RWA）收益的开创性协议。与仅提供资产 1:1 映射的传统代币化协议（RWA 1.0）不同，RWAlpha 代表了 RWA 2.0 时代——我们不仅将资产上链，更将传统金融市场中优质的期权收益策略转化为链上产品，为 DeFi 用户提供持续的现金流。"
                  : "RWAlpha is a pioneering protocol dedicated to optimizing Real World Asset (RWA) yields through AI technology. Unlike traditional tokenization protocols (RWA 1.0) that simply map assets 1:1 on-chain, RWAlpha represents the RWA 2.0 era — we not only tokenize assets but transform premium options yield strategies from traditional financial markets into on-chain products, providing DeFi users with continuous cash flow."}
              </P>
            </Section>

            <Section id="rwa-20">
              <H2>{zh ? "RWA 2.0 愿景" : "RWA 2.0 Vision"}</H2>
              <P>
                {zh
                  ? "传统 RWA 1.0 协议仅将现实资产（如国债、房地产）映射为链上代币，用户获得的是资产本身的增值或固定利率。RWAlpha 的 RWA 2.0 愿景更进一步：通过 AI 引擎在传统金融市场执行期权策略，将期权费转化为每周 USDT 收益，分发给链上用户。"
                  : "Traditional RWA 1.0 protocols simply map real-world assets (like treasuries, real estate) as on-chain tokens, where users receive asset appreciation or fixed rates. RWAlpha's RWA 2.0 vision goes further: using an AI engine to execute options strategies in traditional financial markets, converting option premiums into weekly USDT yields distributed to on-chain users."}
              </P>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: zh ? "RWA 1.0" : "RWA 1.0", desc: zh ? "资产代币化，1:1 映射" : "Asset tokenization, 1:1 mapping", color: "bg-slate-50 border-slate-200" },
                  { label: zh ? "RWA 2.0" : "RWA 2.0", desc: zh ? "AI 期权策略 + 每周收益" : "AI options strategy + weekly yield", color: "bg-indigo-50 border-indigo-200" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                    <div className="text-sm font-bold text-slate-800 mb-1">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="dual-vault">
              <H2>{zh ? "双保险库协议" : "Dual Vault Protocol"}</H2>
              <P>
                {zh
                  ? "双保险库协议是 RWAlpha 的核心创新，旨在将本金增长与收益分配完全分离，实现两者的独立优化。"
                  : "The Dual Vault Protocol is RWAlpha's core innovation, designed to completely separate principal growth from yield distribution, enabling independent optimization of both."}
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="text-sm font-bold text-emerald-800 mb-2">
                    {zh ? "🏦 本金保险库" : "🏦 Principal Vault"}
                  </div>
                  <P>{zh
                    ? "提供完全的资产支持，持有底层 ETF 资产并精准追踪指数 NAV，保障资产安全。"
                    : "Provides full asset backing, holds underlying ETF assets, and precisely tracks index NAV to ensure asset safety."}</P>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="text-sm font-bold text-amber-800 mb-2">
                    {zh ? "⚡ 收益保险库" : "⚡ Yield Vault"}
                  </div>
                  <P>{zh
                    ? "执行 AI 优化的期权收益策略，通过收取期权费为用户创造额外的每周收益现金流。"
                    : "Executes AI-optimized options yield strategies, generating additional weekly yield cash flow for users by collecting option premiums."}</P>
                </div>
              </div>
            </Section>

            <Section id="products">
              <H2>{zh ? "产品矩阵" : "Product Matrix"}</H2>
              <P>
                {zh
                  ? "RWAlpha 目前提供三大核心生息产品，均采用双保险库协议，每周以 USDT 结算收益："
                  : "RWAlpha currently offers three core yield products, all using the Dual Vault Protocol with weekly USDT yield settlement:"}
              </P>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">{zh ? "代币" : "Token"}</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">{zh ? "挂钩资产" : "Underlying Asset"}</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">{zh ? "收益频率" : "Yield Frequency"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { token: "rNDX", asset: zh ? "指数收益资产" : "Index Yield Asset", freq: zh ? "每周" : "Weekly" },
                      { token: "rSPX", asset: zh ? "大盘指数资产" : "Broad Index Asset", freq: zh ? "每周" : "Weekly" },
                      { token: "rGLD", asset: zh ? "避险资产" : "Safe-Haven Asset", freq: zh ? "每周" : "Weekly" },
                    ].map((row) => (
                      <tr key={row.token} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">{row.token}</td>
                        <td className="py-3 px-3 text-slate-700">{row.asset}</td>
                        <td className="py-3 px-3 text-slate-600">{row.freq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

             <Divider />
            {/* ── Team ── */}
            <Section id="team">
              <H1>{zh ? "团队介绍" : "Team"}</H1>
            </Section>
            <Section id="team-intro">
              <H2>{zh ? "核心团队" : "Core Team"}</H2>
              <P>
                {zh
                  ? "RWAlpha 由汇集了 TradFi、Crypto 与 AI 领域顶尖人才的资深团队打造。"
                  : "RWAlpha is built by a seasoned team bringing together top talent from TradFi, Crypto, and AI."}
              </P>
              <P>
                {zh
                  ? "核心成员来自海通国际、招銀国际（新加坡）等知名传统金融机构，以及加密资产和 AI 领域的一线从业者。团队拥有超过 16 年的传统金融经验，深谙 ETF、结构化产品及大宗经纪业务。此外，团队在新加坡、香港和迪拜拥有丰富的跨境合规架构搞建经验，具备极强的资产筛选、合规基金结构设立以及链上协议设计的综合能力。"
                  : "Core members come from renowned traditional financial institutions including Haitong International and CMB International (Singapore), as well as leading practitioners in crypto assets and AI. The team has over 16 years of traditional finance experience, with deep expertise in ETFs, structured products, and prime brokerage. Additionally, the team has extensive cross-border compliance and fund structuring experience across Singapore, Hong Kong, and Dubai, with strong capabilities in asset selection, compliant fund structure establishment, and on-chain protocol design."}
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                  { icon: "🏦", zh: "传统金融", en: "TradFi", desc_zh: "来自海通国际、招銀国际等顶级金融机构", desc_en: "From Haitong International, CMB International & more" },
                  { icon: "🤖", zh: "AI 与加密", en: "AI & Crypto", desc_zh: "加密资产和 AI 领域一线从业者", desc_en: "Front-line practitioners in crypto & AI" },
                  { icon: "🌏", zh: "跨境合规", en: "Cross-border Compliance", desc_zh: "新加坡、香港、迪拜三地合规经验", desc_en: "Singapore, Hong Kong & Dubai expertise" },
                ].map((item) => (
                  <div key={item.icon} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm font-bold text-slate-800 mb-1">{zh ? item.zh : item.en}</div>
                    <div className="text-xs text-slate-500">{zh ? item.desc_zh : item.desc_en}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <p className="text-sm text-indigo-800">
                  <strong>{zh ? "孵化机构" : "Incubated by"}</strong>
                  {zh
                    ? "：RWAlpha 由 DMZ Finance 孵化，核心团队分布在新加坡、香港和迪拜三地。"
                    : ": RWAlpha is incubated by DMZ Finance, with the core team based across Singapore, Hong Kong, and Dubai."}
                </p>
              </div>
            </Section>
            <Divider />
            {/* ── How It Works ── */}
            <Section id="how-it-works">
              <H1>{zh ? "运作机制" : "How It Works"}</H1>
            </Section>

            <Section id="ai-engine">
              <H2>{zh ? "AI 引擎" : "AI Engine"}</H2>
              <P>
                {zh
                  ? "AI 引擎是驱动 RWAlpha 收益策略的核心大脑。它实时处理市场数据，并执行四大核心任务："
                  : "The AI Engine is the core brain driving RWAlpha's yield strategy. It processes market data in real-time and executes four core tasks:"}
              </P>
              <div className="space-y-3 mt-4">
                {[
                  { num: "01", zh: "波动性分析（Volatility Analysis）", en: "Volatility Analysis", desc_zh: "持续追踪底层资产的隐含波动率与历史波动率，识别最优期权执行时机。", desc_en: "Continuously tracks implied and historical volatility of underlying assets to identify optimal options execution timing." },
                  { num: "02", zh: "期权策略优化（Option Strategy Optimization）", en: "Option Strategy Optimization", desc_zh: "基于波动率模型，动态选择最优的期权策略（如备兑看涨期权），最大化期权费收入。", desc_en: "Based on volatility models, dynamically selects optimal options strategies (e.g., covered calls) to maximize premium income." },
                  { num: "03", zh: "投资组合优化（Portfolio Optimization）", en: "Portfolio Optimization", desc_zh: "综合多个资产的相关性与风险特征，优化整体投资组合的风险收益比。", desc_en: "Optimizes the overall portfolio's risk-return ratio by considering correlations and risk characteristics of multiple assets." },
                  { num: "04", zh: "自动再平衡（Auto Rebalancing）", en: "Auto Rebalancing", desc_zh: "当市场条件发生变化时，自动调整各资产权重，确保策略始终处于最优状态。", desc_en: "Automatically adjusts asset weights when market conditions change, ensuring the strategy remains optimal at all times." },
                ].map((item) => (
                  <div key={item.num} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {item.num}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 mb-1">{zh ? item.zh : item.en}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{zh ? item.desc_zh : item.desc_en}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="fund-flow">
              <H2>{zh ? "资金流转路径" : "Fund Flow"}</H2>
              <P>
                {zh
                  ? "为了打通 DeFi 与 TradFi 的连接闭环，RWAlpha 联合 DMZ Finance、FOMO Group 以及中金公司（CICC）等合作伙伴，设计了严密的资金出入金智能路由。"
                  : "To bridge the DeFi-TradFi gap, RWAlpha has designed a sophisticated fund routing system in partnership with DMZ Finance, FOMO Group, and CICC."}
              </P>
              <div className="mt-4 space-y-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide">
                    {zh ? "入金链路" : "Investment Process"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                    {[
                      zh ? "用户钱包 (USDT/USDC)" : "User Wallet (USDT/USDC)",
                      zh ? "RWAlpha 智能合约" : "RWAlpha Smart Contract",
                      "FOMO Pay",
                      zh ? "传统券商" : "Broker",
                      zh ? "底层资产" : "Underlying Asset",
                    ].map((step, i, arr) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="bg-white border border-indigo-200 rounded-lg px-2 py-1">{step}</span>
                        {i < arr.length - 1 && <span className="text-indigo-400">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">
                    {zh ? "收益结算链路" : "Payout Process"}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                    {[
                      zh ? "底层资产期权收益" : "Asset Options Premium",
                      zh ? "券商结算" : "Broker Settlement",
                      "FOMO Pay",
                      zh ? "收益保险库" : "Yield Vault",
                      zh ? "用户钱包 (USDT)" : "User Wallet (USDT)",
                    ].map((step, i, arr) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="bg-white border border-amber-200 rounded-lg px-2 py-1">{step}</span>
                        {i < arr.length - 1 && <span className="text-amber-400">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Divider />

            {/* ── Security ── */}
            <Section id="security">
              <H1>{zh ? "安全与审计" : "Security & Audit"}</H1>
            </Section>

            <Section id="audit">
              <H2>{zh ? "审计报告" : "Audit Reports"}</H2>
              <Callout type="warning">
                {zh
                  ? "注：该部分将在协议上线前更新。RWAlpha 将在 2026 年 Q1 协议正式发布之前，由业界顶尖的区块链安全机构进行全面的代码审计与形式化验证。"
                  : "Note: This section will be updated before the protocol launch. RWAlpha will undergo comprehensive code audits and formal verification by top blockchain security firms before the Q1 2026 mainnet launch."}
              </Callout>
              <P>
                {zh
                  ? "完整的审计报告（PDF / 在线链接）将在本页面进行公示，确保所有底层代码的透明与开源。"
                  : "Complete audit reports (PDF / online links) will be published on this page to ensure full transparency and open-source availability of all underlying code."}
              </P>
            </Section>

            <Section id="key-addresses">
              <H2>{zh ? "核心合约地址" : "Key Addresses"}</H2>
              <Callout type="info">
                {zh
                  ? "以下地址将在 2026 Q1 主网上线时同步公开。"
                  : "The following addresses will be published when the mainnet launches in Q1 2026."}
              </Callout>
              <div className="mt-3 space-y-2">
                {[
                  { label: "RWAlpha Protocol", addr: "0x... (TBA)" },
                  { label: "rNDX Principal Vault", addr: "0x... (TBA)" },
                  { label: "rNDX Yield Vault", addr: "0x... (TBA)" },
                  { label: "rSPX Principal Vault", addr: "0x... (TBA)" },
                  { label: "rSPX Yield Vault", addr: "0x... (TBA)" },
                  { label: "rGLD Principal Vault", addr: "0x... (TBA)" },
                  { label: "rGLD Yield Vault", addr: "0x... (TBA)" },
                  { label: "Yield Distribution Contract", addr: "0x... (TBA)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5">
                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                    <span className="font-mono text-xs text-slate-400">{item.addr}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Divider />

            {/* ── Legal ── */}
            <Section id="legal">
              <H1>{zh ? "法律与合规" : "Legal & Compliance"}</H1>
              <P>
                {zh
                  ? "RWAlpha 致力于在去中心化金融（DeFi）与传统金融（TradFi）之间构建一座安全、透明且完全合规的桥梁。"
                  : "RWAlpha is committed to building a safe, transparent, and fully compliant bridge between decentralized finance (DeFi) and traditional finance (TradFi)."}
              </P>
            </Section>

            <Section id="compliance-arch">
              <H2>{zh ? "合规架构" : "Compliance Architecture"}</H2>
              <P>
                {zh
                  ? "RWAlpha 的法律合规架构依托于其底层的 DMZ 基础设施（DMZ Infra），精心设计了一套「双伞型基金架构」（Dual-Structure）来确保合规性与运作的灵活性。"
                  : "RWAlpha's legal compliance architecture is built on its underlying DMZ Infrastructure (DMZ Infra), with a carefully designed 'Dual-Structure' umbrella fund framework to ensure compliance and operational flexibility."}
              </P>
            </Section>

            <Section id="dubai-fund">
              <H2>{zh ? "迪拜伞型基金架构" : "Dubai Umbrella Fund Structure"}</H2>
              <P>
                {zh
                  ? "我们在迪拜设立了名为 QCD Open-end PCC 的基金结构，这也是迪拜首个代币化基金（Dubai's first tokenized fund）。"
                  : "We have established a fund structure called QCD Open-end PCC in Dubai, which is also Dubai's first tokenized fund."}
              </P>
              <div className="space-y-2 mt-3">
                {[
                  { role: zh ? "基金管理人" : "Fund Manager", name: zh ? "卡塔尔国家银行（QNB）" : "Qatar National Bank (QNB)" },
                  { role: zh ? "资产托管方" : "Custodian", name: zh ? "渣打银行（Standard Chartered Bank）" : "Standard Chartered Bank" },
                  { role: zh ? "代币化与基金董事" : "Tokenization & Fund Director", name: "DMZ" },
                ].map((item) => (
                  <div key={item.role} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <span className="text-xs text-slate-500 w-32 shrink-0">{item.role}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="cayman-fund">
              <H2>{zh ? "开曼伞型基金架构" : "Cayman Umbrella Fund Structure"}</H2>
              <P>
                {zh
                  ? "为了配合离岸业务与更多样的合规需求，我们同步搭建了名为 RWAlpha Matrix SPC 的开曼架构，配备 BVI 基金管理人，采用完整的开曼基金会结构，由 DMZ 独家拥有。"
                  : "To support offshore operations and diverse compliance needs, we have simultaneously established the RWAlpha Matrix SPC Cayman structure, equipped with a BVI fund manager, using a complete Cayman Foundation structure, exclusively owned by DMZ."}
              </P>
              <Callout type="tip">
                {zh
                  ? "双重架构使 RWAlpha 能够极具弹性地适应不同类型的底层资产、多样化的投资者需求以及复杂的跨国合规监管场景。"
                  : "The dual-structure allows RWAlpha to flexibly adapt to different types of underlying assets, diverse investor needs, and complex cross-border compliance scenarios."}
              </Callout>
            </Section>

            <Divider />

            {/* ── Community ── */}
            <Section id="community">
              <H1>{zh ? "社区与支持" : "Community & Support"}</H1>
            </Section>

            <Section id="onboarding">
              <H2>{zh ? "新手指南" : "Onboarding"}</H2>
              <P>
                {zh
                  ? "只需以下几个步骤，您即可开启 TradFi 到 DeFi 的无缝收益之旅："
                  : "Just a few steps to begin your seamless TradFi-to-DeFi yield journey:"}
              </P>
              <div className="space-y-3 mt-4">
                {[
                  {
                    step: "01",
                    title_zh: "连接 Web3 钱包",
                    title_en: "Connect Web3 Wallet",
                    desc_zh: "访问 RWAlpha.ai，点击「Connect Wallet」，支持 MetaMask、WalletConnect 等主流钱包。",
                    desc_en: "Visit RWAlpha.ai, click 'Connect Wallet'. Supports MetaMask, WalletConnect, and other major wallets.",
                  },
                  {
                    step: "02",
                    title_zh: "准备并存入资金（USDT / USDC）",
                    title_en: "Prepare and Deposit Funds (USDT / USDC)",
                    desc_zh: "确保钱包中有足够的 USDT 或 USDC，并准备少量原生代币用于支付 Gas 费。",
                    desc_en: "Ensure your wallet has sufficient USDT or USDC, plus a small amount of native tokens for Gas fees.",
                  },
                  {
                    step: "03",
                    title_zh: "选择 AI 优化收益产品",
                    title_en: "Select AI-Optimized Yield Product",
                    desc_zh: "在产品矩阵中选择 rNDX、rSPX 或 rGLD，根据您的风险偏好和收益目标做出选择。",
                    desc_en: "Choose rNDX, rSPX, or rGLD from the product matrix based on your risk preference and yield goals.",
                  },
                  {
                    step: "04",
                    title_zh: "自动生息，每周结算",
                    title_en: "Auto Yield, Weekly Settlement",
                    desc_zh: "投资后无需任何操作，协议每周自动将期权费以 USDT 形式结算至您的链上钱包。",
                    desc_en: "No action needed after investing. The protocol automatically settles option premiums as USDT to your on-chain wallet weekly.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 mb-1">{zh ? item.title_zh : item.title_en}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{zh ? item.desc_zh : item.desc_en}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="contact">
              <H2>{zh ? "联系与支持" : "Contact & Support"}</H2>
              <P>
                {zh
                  ? "RWAlpha 由 DMZ 孵化，核心团队分布在新加坡、香港和迪拜。"
                  : "RWAlpha is incubated by DMZ, with a core team distributed across Singapore, Hong Kong, and Dubai."}
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                  {
                    icon: "👥",
                    title_zh: "社区互动",
                    title_en: "Community",
                    desc_zh: "Twitter / X · Discord / Telegram",
                    desc_en: "Twitter / X · Discord / Telegram",
                    link: "#",
                  },
                  {
                    icon: "🛠️",
                    title_zh: "技术支持",
                    title_en: "Technical Support",
                    desc_zh: "support@rwalpha.ai",
                    desc_en: "support@rwalpha.ai",
                    link: "mailto:support@rwalpha.ai",
                  },
                  {
                    icon: "🤝",
                    title_zh: "商务合作",
                    title_en: "Business Partnership",
                    desc_zh: "partners@rwalpha.ai",
                    desc_en: "partners@rwalpha.ai",
                    link: "mailto:partners@rwalpha.ai",
                  },
                ].map((item) => (
                  <a
                    key={item.icon}
                    href={item.link}
                    className="block p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                  >
                    <div className="text-xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">{zh ? item.title_zh : item.title_en}</div>
                    <div className="text-xs text-slate-500">{zh ? item.desc_zh : item.desc_en}</div>
                  </a>
                ))}
              </div>
            </Section>

            <Divider />

            {/* ── FAQ ── */}
            <Section id="faq">
              <H1>{zh ? "常见问题" : "Frequently Asked Questions"}</H1>
              <P>
                {zh
                  ? "这里汇总了关于 RWAlpha 协议最常见的问题与解答，帮助您快速了解我们的 RWA 2.0 收益优化机制。"
                  : "Here are the most frequently asked questions about the RWAlpha protocol to help you quickly understand our RWA 2.0 yield optimization mechanism."}
              </P>
            </Section>

            <FaqItem
              id="faq-1"
              question={zh ? "1. 什么是 RWAlpha？" : "1. What is RWAlpha?"}
              answer={
                <p>
                  {zh
                    ? "RWAlpha 是一家致力于通过 AI 技术优化真实世界资产（RWA）收益的开创性协议。与仅提供资产 1:1 映射的传统代币化协议（RWA 1.0）不同，RWAlpha 代表了 RWA 2.0 时代——我们不仅将资产上链，更将传统金融市场中优质的期权收益策略转化为链上产品，为 DeFi 用户提供持续的现金流。"
                    : "RWAlpha is a pioneering protocol dedicated to optimizing Real World Asset (RWA) yields through AI technology. Unlike traditional tokenization protocols (RWA 1.0) that simply map assets 1:1 on-chain, RWAlpha represents the RWA 2.0 era — we not only tokenize assets but transform premium options yield strategies from traditional financial markets into on-chain products, providing DeFi users with continuous cash flow."}
                </p>
              }
            />
            <FaqItem
              id="faq-2"
              question={zh ? "2. RWAlpha 的「双保险库协议」是如何运作的？" : "2. How does the Dual Vault Protocol work?"}
              answer={
                <div>
                  <p className="mb-2">
                    {zh
                      ? "这是 RWAlpha 的核心创新，旨在将本金增长与收益分配完全分离："
                      : "This is RWAlpha's core innovation, designed to completely separate principal growth from yield distribution:"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>{zh ? "本金保险库" : "Principal Vault"}：</strong>{zh ? "提供完全的资产支持，持有底层 ETF 资产并精准追踪指数 NAV，保障资产安全。" : "Provides full asset backing, holds underlying ETF assets, and precisely tracks index NAV."}</li>
                    <li><strong>{zh ? "收益保险库" : "Yield Vault"}：</strong>{zh ? "执行 AI 优化的期权收益策略，通过收取期权费为用户创造额外的每周收益现金流。" : "Executes AI-optimized options yield strategies, generating additional weekly yield cash flow for users."}</li>
                  </ul>
                </div>
              }
            />
            <FaqItem
              id="faq-3"
              question={zh ? "3. 收益多久分配一次？以什么代币结算？" : "3. How often is yield distributed? In what token?"}
              answer={
                <p>
                  {zh
                    ? "RWAlpha 的所有收益产品均提供每周收益（Weekly Yield）分配。收益保险库在传统金融市场获取期权费后，会通过合规资金通道将其转化为加密资产，并每周以 USDT 的形式在链上结算，直接发放到您的 Web3 钱包中。"
                    : "All RWAlpha yield products offer Weekly Yield distribution. After the Yield Vault collects option premiums in traditional financial markets, it converts them to crypto assets through compliant fund channels and settles weekly as USDT on-chain, directly distributed to your Web3 wallet."}
                </p>
              }
            />
            <FaqItem
              id="faq-4"
              question={zh ? "4. 平台目前提供哪些生息产品？" : "4. What yield products are currently available?"}
              answer={
                <div>
                  <p className="mb-2">{zh ? "目前 RWAlpha 提供三大核心生息产品：" : "RWAlpha currently offers three core yield products:"}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>rNDX：</strong>{zh ? "挂钉指数资产表现的收益产品。" : "Yield product pegged to index asset performance."}</li>
                    <li><strong>rSPX：</strong>{zh ? "挂钉大盘指数资产表现的收益产品。" : "Yield product pegged to broad market index performance."}</li>
                    <li><strong>rGLD：</strong>{zh ? "挂钉避险资产表现的生息产品，让原本不生息的避险资产也能每周产生收益。" : "Yield product pegged to safe-haven asset performance, enabling the traditionally non-yielding asset to generate weekly returns."}</li>
                  </ul>
                </div>
              }
            />
            <FaqItem
              id="faq-5"
              question={zh ? "5. 协议的合规性与资金安全如何保障？" : "5. How is protocol compliance and fund safety ensured?"}
              answer={
                <div>
                  <p className="mb-2">{zh ? "RWAlpha 依托强大的 DMZ 基础设施，构建了业界领先的双重伞型合规基金架构：" : "RWAlpha leverages powerful DMZ infrastructure to build an industry-leading dual umbrella compliance fund structure:"}</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>{zh ? "迪拜架构" : "Dubai Structure"}：</strong>{zh ? "迪拜首个代币化基金（QCD Open-end PCC），由卡塔尔国家银行（QNB）担任基金管理人，渣打银行担任托管方。" : "Dubai's first tokenized fund (QCD Open-end PCC), with QNB as fund manager and Standard Chartered Bank as custodian."}</li>
                    <li><strong>{zh ? "开曼架构" : "Cayman Structure"}：</strong>{zh ? "拥有完整的开曼基金会结构（RWAlpha Matrix SPC），由 DMZ 独家拥有。" : "Complete Cayman Foundation structure (RWAlpha Matrix SPC), exclusively owned by DMZ."}</li>
                  </ul>
                </div>
              }
            />
            <FaqItem
              id="faq-6"
              question={zh ? "6. AI 引擎在协议中具体发挥什么作用？" : "6. What specific role does the AI Engine play?"}
              answer={
                <p>
                  {zh
                    ? "AI 引擎是驱动收益策略的大脑。它实时处理市场数据，并执行四大核心任务：波动性分析（Volatility Analysis）、期权策略优化（Option Strategy Optimization）、投资组合优化（Portfolio Optimization）以及自动再平衡（Auto Rebalancing），确保在不同市场环境下为您提供最优的资金效率与收益率。"
                    : "The AI Engine is the brain driving yield strategies. It processes market data in real-time and executes four core tasks: Volatility Analysis, Option Strategy Optimization, Portfolio Optimization, and Auto Rebalancing — ensuring optimal capital efficiency and yield rates across different market conditions."}
                </p>
              }
            />


          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
