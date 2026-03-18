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
    badge: 'AI × RWA = RWA 2.0',
    heroTitle1: '当 AI 遇上',
    heroTitle2: '真实世界资产',
    heroSub1: 'AI 驱动管理 · 每周现金派息 · 指数底仓增值',
    cta1: '查看金库',
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
    ctaTitle: '准备好进入这个世界了吗？',
    ctaTitleLine2: 'AI × RWA',
    ctaSub: '机构级策略，链上透明，每周派息。现在就开始。',
    ctaBtn1: '查看金库',
    ctaBtn2: '进入应用',
    chips: [
      { label: '年化派息率', value: '~19.93%', color: 'emerald' },
      { label: '年化总回报', value: '+29.72%', color: 'indigo' },
      { label: 'AI 状态', value: '● 运行中', color: 'cyan' },
      { label: '本周派息', value: '$0.502 / rNDX', color: 'amber' },
    ],
  },
  en: {
    badge: 'AI × RWA = RWA 2.0',
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
      { title: 'Core Index Position', desc: 'Index ETFs as core holding (50% core assets). Principal grows with the market over the long term.' },
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
    ctaTitle: 'Ready to Enter the World of',
    ctaTitleLine2: 'AI × RWA?',
    ctaSub: 'Institutional strategy. On-chain transparency. Weekly dividends. Start now.',
    ctaBtn1: 'View Vault',
    ctaBtn2: 'Launch App',
    chips: [
      { label: 'Annual Yield', value: '~19.93%', color: 'emerald' },
      { label: 'Total Return', value: '+29.72%', color: 'indigo' },
      { label: 'AI Status', value: '● Active', color: 'cyan' },
      { label: 'Weekly Dist.', value: '$0.502 / rNDX', color: 'amber' },
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
  const items = ['科技期权收益 ETF +73.84%', '纳指期权增强 ETF +14.49%', '纳指100指数 ETF +25.17%', '科技板块指数 ETF +28.97%', 'rNDX NAV $130.99', 'AI Signal: HOLD', 'Weekly Dist: $0.502 USDT'];
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
      <section className="relative overflow-hidden pt-24 pb-20 px-6" style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #eef2ff 35%, #f0fdfa 70%, #f8faff 100%)' }}>

        {/* Fine grid lines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Diagonal accent lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-[15%] w-px h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.12) 30%, rgba(99,102,241,0.12) 70%, transparent)' }} />
          <div className="absolute top-0 right-[15%] w-px h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(6,182,212,0.10) 30%, rgba(6,182,212,0.10) 70%, transparent)' }} />
        </div>

        {/* Large central glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)' }} />

        {/* Side glows */}
        <div className="pointer-events-none absolute top-1/3 -left-20 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 65%)' }} />
        <div className="pointer-events-none absolute top-1/4 -right-20 w-[350px] h-[350px]"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 65%)' }} />

        {/* Top accent line */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #818cf8 30%, #38bdf8 60%, transparent 100%)' }} />
        {/* Bottom accent line */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15) 50%, transparent)' }} />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center text-indigo-600 text-base font-bold tracking-[0.25em] mb-8 uppercase">
            {T.badge}
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



          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
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
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-700 border border-slate-200 bg-white/80 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm backdrop-blur-sm">
                {T.cta2} <ChevronRight size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Four Features ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 flex items-center justify-center gap-3 flex-wrap">
              {lang === 'zh' ? 'RWAlpha 指数旗舰金库 1' : 'RWAlpha Index Prime Vault 1'}
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
                  {i < 2 && <sup className="text-base font-normal ml-0.5">*</sup>}
                </span>
                <span className="text-xs text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-8">
            {lang === 'zh'
              ? '* 以上数据基于历史表现测算，业绩随市场行情波动。'
              : '* Figures based on historical performance. Returns fluctuate with market conditions and are not guaranteed. Not investment advice.'}
          </p>
        </div>
      </section>

      {/* ── Dual Vault ────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full mb-3">{T.dualVaultLabel}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{T.dualVaultTitle}</h2>
            <p className="text-slate-500 text-base">{T.dualVaultSub}</p>
          </div>
          <div className="max-w-4xl mx-auto mb-4 flex items-center justify-center gap-3">
            <h3 className="font-bold text-slate-800 text-base">
              {lang === 'zh' ? 'RWAlpha 指数旗舰金库 1' : 'RWAlpha Index Prime Vault 1'}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold tracking-wide">
              {lang === 'zh' ? 'AI 赋能' : 'AI Powered'}
            </span>
          </div>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-100 hover:scale-[1.01] transition-transform duration-300">
            <img
              key={lang}
              src={lang === 'zh'
                ? 'https://d2xsxph8kpxj0f.cloudfront.net/310519663279457379/asxYnytTefdYpzwe5Qg6qu/vault-app-zh_0567da0d.webp'
                : 'https://d2xsxph8kpxj0f.cloudfront.net/310519663279457379/asxYnytTefdYpzwe5Qg6qu/vault-app-en_9a14127b.png'
              }
              alt="RWAlpha Product Preview"
              className="w-full h-auto object-cover"
              style={{ animation: 'fadeIn 0.4s ease' }}
            />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {T.ctaTitle}<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)' }}>{T.ctaTitleLine2}</span>
          </h2>
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
