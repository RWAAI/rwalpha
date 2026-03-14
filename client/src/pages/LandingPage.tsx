// Design: Clean white background, AI × RWA theme
// Typography: Bold display for hero, clean sans for body
// Colors: Slate/white base, indigo accent, green for yield numbers
// Layout: Asymmetric hero, full-width feature strip, stats row, CTA
// i18n: zh/en toggle via localStorage + state

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import { Zap, Layers, Brain, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react';

// ── i18n copy ─────────────────────────────────────────────────────
const COPY = {
  zh: {
    badge: 'AI × RWA · 下一代资产管理',
    heroTitle1: '当 AI 遇上',
    heroTitle2: '真实世界资产',
    heroSub1: '机构级策略严选底层资产 · AI 实时优化仓位 · 收益每周分配到账',
    heroSub2: '链上可查，透明可信。',
    cta1: '立即查看金库',
    cta2: '进入应用',
    trust: ['链上可验证', '机构级托管', 'T+3 赎回保障', '每周自动派息'],
    featuresLabel: '四大核心优势',
    features: [
      { title: '每周派息', desc: '期权收益机制化分配，稳定现金流按周到账。' },
      { title: '指数底仓', desc: '纳指 ETF 完全支撑，本金随市场长期增值。' },
      { title: 'AI 驱动调仓', desc: 'AI 实时监测，驱动优化仓位。' },
      { title: '稳健增长', desc: '派息与净值双轨驱动，复利持续滚动增值。' },
    ],
    statsLabel: '实时数据',
    stats: [
      { label: '年化派息率', suffix: '%' },
      { label: '年化总回报', suffix: '%' },
      { label: '底层 ETF 规模', prefix: '$', suffix: '亿+' },
      { label: '链上持仓验证', suffix: '%' },
    ],
    howLabel: '运作机制',
    howTitle: '三步，让 AI 替你资产增値',
    howSub: '从认购到每周收息，全程链上透明，无需信任中间人。',
    steps: [
      { step: '01', title: '认购 rINDEX', desc: '以 USDT/USDC 认购，1:1 映射底层 Fund（挂钩一篮子 ETF）净值，链上即时确认。' },
      { step: '02', title: 'AI 实时管理', desc: 'AI 引擎持续监测市场信号，驱动调整仓位比例与复投策略。' },
      { step: '03', title: '每周收益到账', desc: '收益每周自动分配至收益金库，T+0 提取到錢包。' },
    ],
    ctaTitle: '准备好进入 AI × RWA 的世界了吗？',
    ctaSub: '机构级策略，链上透明，每周派息。现在就开始。',
    ctaBtn1: '立即查看金库',
    ctaBtn2: '进入应用',
    footerRight: '© 2026 RWAlpha. All rights reserved.',
  },
  en: {
    badge: 'AI × RWA · Next-Gen Asset Management',
    heroTitle1: 'When AI Meets',
    heroTitle2: 'Real World Assets',
    heroSub1: 'Institutional-grade strategy · AI-driven rebalancing · Weekly dividend',
    heroSub2: 'On-chain, transparent, verifiable.',
    cta1: 'View Vault',
    cta2: 'Launch App',
    trust: ['On-chain Verifiable', 'Institutional Custody', 'T+3 Redemption', 'Weekly Auto-Dividend'],
    featuresLabel: 'Four Core Advantages',
    features: [
      { title: 'Weekly Dividend', desc: 'Options income distributed mechanically every week — stable cash flow, not market-dependent.' },
      { title: 'Index Collateral', desc: 'Fully backed by Nasdaq ETFs. Principal grows with the market over the long term.' },
      { title: 'AI-Driven Rebalancing', desc: 'AI monitors signals in real time and automatically optimizes position allocation.' },
      { title: 'Steady Growth', desc: 'Dividend + NAV appreciation on dual tracks. Compounding drives continuous asset growth.' },
    ],
    statsLabel: 'Live Metrics',
    stats: [
      { label: 'Annual Dividend Rate', suffix: '%' },
      { label: 'Annual Total Return', suffix: '%' },
      { label: 'Underlying ETF AUM', prefix: '$', suffix: 'B+' },
      { label: 'On-chain Verification', suffix: '%' },
    ],
    howLabel: 'How It Works',
    howTitle: 'Three Steps to Grow Your Assets with AI',
    howSub: 'From subscription to weekly dividends — fully on-chain, no trust required.',
    steps: [
      { step: '01', title: 'Subscribe rINDEX', desc: 'Deposit USDT. 1:1 mapped to underlying ETF NAV, confirmed on-chain instantly.' },
      { step: '02', title: 'AI Manages Positions', desc: 'AI engine continuously monitors market signals and auto-adjusts allocation and options strategy.' },
      { step: '03', title: 'Receive Weekly Dividend', desc: 'Options income auto-distributed to your wallet weekly, or reinvested for compounding.' },
    ],
    ctaTitle: 'Ready to Enter the World of AI × RWA?',
    ctaSub: 'Institutional strategy. On-chain transparency. Weekly dividends. Start now.',
    ctaBtn1: 'View Vault',
    ctaBtn2: 'Launch App',
    footerRight: '© 2026 RWAlpha. All rights reserved.',
  },
} as const;

type Lang = 'zh' | 'en';

// ── Animated counter ──────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = to / 60;
      const id = setInterval(() => {
        start += step;
        if (start >= to) { setVal(to); clearInterval(id); } else setVal(start);
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

// ── Feature card ─────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${accent}`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-1.5">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
  });

  // 监听 NavBar 或其他组件触发的语言变化
  useEffect(() => {
    const handler = () => {
      try {
        const stored = (localStorage.getItem('rwa-lang') as Lang) || 'zh';
        setLang(stored);
      } catch { /* noop */ }
    };
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    try { localStorage.setItem('rwa-lang', next); } catch { /* noop */ }
    window.dispatchEvent(new Event('rwa-lang-change'));
  };

  const T = COPY[lang];
  const statsValues = [19.88, 29.72, 10, 100];
  const statsDecimals = [2, 2, 0, 0];
  const featureIcons = [
    <Zap size={18} className="text-amber-600" />,
    <Layers size={18} className="text-indigo-600" />,
    <Brain size={18} className="text-violet-600" />,
    <TrendingUp size={18} className="text-green-600" />,
  ];
  const featureAccents = ['bg-amber-50', 'bg-indigo-50', 'bg-violet-50', 'bg-green-50'];
  const statColors = ['text-indigo-600', 'text-green-600', 'text-slate-900', 'text-sky-600'];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <NavBar
        activeTab="home"
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              🌐 {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <Link href="/vault">
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200 active:scale-95">
                <Zap size={14} />
                {lang === 'zh' ? '进入应用' : 'Launch App'}
              </button>
            </Link>
          </div>
        }
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-16 px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-100 blur-3xl opacity-50" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {T.badge}
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
            {T.heroTitle1}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {T.heroTitle2}
            </span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-3">
            {T.heroSub1}
          </p>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
            {T.heroSub2}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95">
                {T.cta1} <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/vault">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all duration-200">
                {T.cta2} <ChevronRight size={15} />
              </button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
            {T.trust.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-400 inline-block" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Four Features ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-10">{T.featuresLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {T.features.map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={featureIcons[i]}
                accent={featureAccents[i]}
                title={f.title}
                desc={f.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-10">{T.statsLabel}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {T.stats.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className={`text-4xl font-extrabold tracking-tight ${statColors[i]}`}>
                  <Counter
                    to={statsValues[i]}
                    prefix={'prefix' in s ? s.prefix : ''}
                    suffix={s.suffix}
                    decimals={statsDecimals[i]}
                  />
                </span>
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">{T.howLabel}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">{T.howTitle}</h2>
          <p className="text-slate-500 text-sm mb-12">{T.howSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {T.steps.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <span className="text-3xl font-black text-slate-100 select-none">{item.step}</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-1.5">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {T.ctaTitle}
          </h2>
          <p className="text-slate-500 text-base mb-8">{T.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vault">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95">
                <Zap size={15} />
                {T.ctaBtn1}
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all duration-200">
                {T.ctaBtn2}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-slate-50 border-t border-slate-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span className="font-extrabold text-slate-700 text-sm tracking-tight">RWAlpha.io</span>
          <div className="flex items-center gap-4">
            <span>rINDEX</span>
            <span>·</span>
            <span>rINDEX-YIELD</span>
            <span>·</span>
            <span>AI × RWA</span>
          </div>
          <span>{T.footerRight}</span>
        </div>
      </footer>
    </div>
  );
}
