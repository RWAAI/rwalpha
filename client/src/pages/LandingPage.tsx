// Design: White background with tech-forward hero — subtle grid, neon accent glows, floating metric chips
// Typography: Bold display for hero, mono for data, clean sans for body
// Colors: White base, indigo/cyan/emerald accents, dark text
// i18n: zh/en toggle via localStorage + state

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Zap, Layers, Brain, TrendingUp, ArrowRight, ChevronRight, Shield, Activity, Cpu } from 'lucide-react';

// ── i18n copy ─────────────────────────────────────────────────────
const COPY = {
  zh: {
    badge: 'AI × RWA · 下一代资产管理',
    heroTitle1: '当 AI 遇上',
    heroTitle2: '真实世界资产',
    heroSub1: 'AI 驱动管理 · 每周现金派息 · 指数底仓增值',
    cta1: '立即查看金库',
    cta2: '进入应用',
    dualVaultLabel: '行业首创',
    dualVaultTitle: '行业首个创新双金库设计',
    dualVaultSub: '本金稳健成长，收益每周到账',
    featuresLabel: '四大核心优势',
    features: [
      { title: 'AI 驱动管理', desc: 'AI 引擎持续监测，驱动调整仓位与复投策略。' },
      { title: '指数底仓', desc: '纳指 ETF 完全支撑，本金随市场长期增值。' },
      { title: '每周派息', desc: '期权收益机制化分配，稳定现金流按周到账。' },
      { title: '稳健增长', desc: '派息与净值双轨驱动，复利持续滚动增值。' },
    ],
    statsLabel: '底层表现数据',
    stats: [
      { label: '年化派息率', suffix: '%' },
      { label: '年化总回报', suffix: '%' },
      { label: '底层 ETF 规模', prefix: '$', suffix: '亿+' },
      { label: '链上持仓验证', suffix: '%' },
    ],
    ctaTitle: '准备好进入 AI × RWA 的世界了吗？',
    ctaSub: '机构级策略，链上透明，每周派息。现在就开始。',
    ctaBtn1: '立即查看金库',
    ctaBtn2: '进入应用',
    chips: [
      { label: '年化派息率', value: '~19.93%', color: 'emerald' },
      { label: '年化总回报', value: '+29.72%', color: 'indigo' },
      { label: 'AI 状态', value: '● 运行中', color: 'cyan' },
      { label: '本周派息', value: '$0.502 / rINDEX', color: 'amber' },
    ],
  },
  en: {
    badge: 'AI × RWA · Next-Gen Asset Management',
    heroTitle1: 'When AI Meets',
    heroTitle2: 'Real World Assets',
    heroSub1: 'AI-Driven Management · Weekly Cash Dividend · Core Index Growth',
    cta1: 'View Vault',
    cta2: 'Launch App',
    dualVaultLabel: 'Industry First',
    dualVaultTitle: 'Innovative Dual-Vault Design',
    dualVaultSub: 'Principal grows steadily, Yield paid weekly.',
    featuresLabel: 'Four Core Advantages',
    features: [
      { title: 'AI-Driven Management', desc: 'AI engine continuously monitors and drives position adjustment and reinvestment strategy.' },
      { title: 'Core Index Position', desc: 'Nasdaq ETFs as core holding (QQQM + VGT). Principal grows with the market over the long term.' },
      { title: 'Weekly Dividend', desc: 'Options income distributed mechanically every week — stable cash flow, not market-dependent.' },
      { title: 'Steady Growth', desc: 'Dividend + NAV appreciation on dual tracks. Compounding drives continuous asset growth.' },
    ],
    statsLabel: 'Underlying Performance',
    stats: [
      { label: 'Annual Dividend Rate', suffix: '%' },
      { label: 'Annual Total Return', suffix: '%' },
      { label: 'Underlying ETF AUM', prefix: '$', suffix: 'B+' },
      { label: 'On-chain Verification', suffix: '%' },
    ],
    ctaTitle: 'Ready to Enter the World of AI × RWA?',
    ctaSub: 'Institutional strategy. On-chain transparency. Weekly dividends. Start now.',
    ctaBtn1: 'View Vault',
    ctaBtn2: 'Launch App',
    chips: [
      { label: 'Annual Yield', value: '~19.93%', color: 'emerald' },
      { label: 'Total Return', value: '+29.72%', color: 'indigo' },
      { label: 'AI Status', value: '● Active', color: 'cyan' },
      { label: 'Weekly Dist.', value: '$0.502 / rINDEX', color: 'amber' },
    ],
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

// ── Scrolling data ticker ─────────────────────────────────────────
function DataTicker() {
  const items = ['NVDY +73.84%', 'QQQI +14.49%', 'QQQM +25.17%', 'VGT +28.97%', 'rINDEX NAV $130.99', 'AI Signal: HOLD', 'Weekly Dist: $0.502 USDT'];
  return (
    <div className="overflow-hidden w-full">
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'ticker 20s linear infinite' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-mono text-slate-400 shrink-0">
            <span className="text-indigo-300 mr-2">▸</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
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

const chipStyles: Record<string, { chip: string; value: string; dot: string }> = {
  emerald: { chip: 'bg-emerald-50 border-emerald-100', value: 'text-emerald-600', dot: 'bg-emerald-400' },
  indigo:  { chip: 'bg-indigo-50 border-indigo-100',   value: 'text-indigo-600',  dot: 'bg-indigo-400' },
  cyan:    { chip: 'bg-cyan-50 border-cyan-100',        value: 'text-cyan-600',    dot: 'bg-cyan-400' },
  amber:   { chip: 'bg-amber-50 border-amber-100',      value: 'text-amber-600',   dot: 'bg-amber-400' },
};

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
  });

  useEffect(() => {
    const handler = () => {
      try { setLang((localStorage.getItem('rwa-lang') as Lang) || 'zh'); } catch { /* noop */ }
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
    <Brain size={18} className="text-violet-600" />,
    <Layers size={18} className="text-indigo-600" />,
    <Zap size={18} className="text-amber-600" />,
    <TrendingUp size={18} className="text-green-600" />,
  ];
  const featureAccents = ['bg-violet-50', 'bg-indigo-50', 'bg-amber-50', 'bg-green-50'];
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

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-0 px-6">

        {/* Subtle dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.45,
          }}
        />

        {/* Soft glow blobs */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-10 right-0 w-[320px] h-[320px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-20 left-0 w-[280px] h-[280px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />

        {/* Thin horizontal accent line */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent" />

        {/* Corner brackets */}
        <div className="pointer-events-none absolute top-16 left-8 w-10 h-10 border-l border-t border-indigo-200/70" />
        <div className="pointer-events-none absolute top-16 right-8 w-10 h-10 border-r border-t border-indigo-200/70" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 text-indigo-600 text-xs font-mono tracking-widest mb-8 uppercase backdrop-blur-sm">
            <Cpu size={11} className="opacity-70" />
            {T.badge}
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
            {T.heroTitle1}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 55%, #059669 100%)' }}
            >
              {T.heroTitle2}
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10 font-mono tracking-wide">
            {T.heroSub1}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/vault">
              <button
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', boxShadow: '0 4px 24px rgba(79,70,229,0.25)' }}
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap size={15} />
                {T.cta1}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
                {T.cta2} <ChevronRight size={15} />
              </button>
            </Link>
          </div>

          {/* Live metric chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {T.chips.map((chip, i) => {
              const s = chipStyles[chip.color];
              return (
                <div key={i} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border ${s.chip} backdrop-blur-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${chip.color === 'cyan' ? 'animate-pulse' : ''}`} />
                  <span className="text-slate-400 text-xs font-mono">{chip.label}</span>
                  <span className={`${s.value} text-xs font-bold font-mono`}>{chip.value}</span>
                </div>
              );
            })}
          </div>

          {/* Scrolling ticker strip */}
          <div className="border-t border-b border-slate-100 py-2.5 -mx-6 px-6 bg-slate-50/60 backdrop-blur-sm overflow-hidden">
            <DataTicker />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── Dual Vault ────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full mb-3">{T.dualVaultLabel}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{T.dualVaultTitle}</h2>
            <p className="text-slate-500 text-base">{T.dualVaultSub}</p>
          </div>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-100 hover:scale-[1.01] transition-transform duration-300">
            <img
              key={lang}
              src={lang === 'zh'
                ? 'https://d2xsxph8kpxj0f.cloudfront.net/310519663279457379/asxYnytTefdYpzwe5Qg6qu/product-screenshot-v2_600f9ad8.png'
                : 'https://d2xsxph8kpxj0f.cloudfront.net/310519663279457379/asxYnytTefdYpzwe5Qg6qu/product-screenshot-en_f0605357.png'
              }
              alt="RWAlpha Product Preview"
              className="w-full h-auto object-cover"
              style={{ animation: 'fadeIn 0.4s ease' }}
            />
          </div>
        </div>
      </section>

      {/* ── Four Features ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 flex items-center justify-center gap-3 flex-wrap">
              {lang === 'zh' ? 'RWAlpha 指数旗舰金库' : 'RWAlpha Index Prime Vault'}
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-600 text-white text-sm font-bold tracking-wide">{lang === 'zh' ? 'AI 赋能' : 'AI Powered'}</span>
            </h2>
            <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mt-3">{T.featuresLabel}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {T.features.map((f, i) => (
              <FeatureCard key={f.title} icon={featureIcons[i]} accent={featureAccents[i]} title={f.title} desc={f.desc} />
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
                  <Counter to={statsValues[i]} prefix={'prefix' in s ? s.prefix : ''} suffix={s.suffix} decimals={statsDecimals[i]} />
                </span>
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{T.ctaTitle}</h2>
          <p className="text-slate-500 text-base mb-8">{T.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vault">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95">
                <Zap size={15} />{T.ctaBtn1}
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

      <Footer />

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
