// Design: Dark tech hero with animated grid, glowing orbs, floating data cards
// Typography: Bold display for hero, clean sans for body
// Colors: Deep dark bg, indigo/cyan/violet neon accents, white text
// Layout: Full-screen dark hero, then light content sections below
// i18n: zh/en toggle via localStorage + state

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Zap, Layers, Brain, TrendingUp, ArrowRight, ChevronRight, Shield, Activity } from 'lucide-react';

// ── i18n copy ─────────────────────────────────────────────────────
const COPY = {
  zh: {
    badge: 'AI × RWA · 下一代资产管理',
    heroTitle1: '当 AI 遇上',
    heroTitle2: '真实世界资产',
    heroSub1: 'AI 驱动管理 · 每周现金派息 · 指数底仓增值',
    heroSub2: '',
    cta1: '立即查看金库',
    cta2: '进入应用',
    trust: ['链上可验证', '机构级托管', 'T+3 赎回保障', '每周自动派息'],
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
    liveYield: '年化派息率',
    liveReturn: '年化总回报',
    liveStatus: 'AI 运行中',
    liveWeekly: '本周派息',
  },
  en: {
    badge: 'AI × RWA · Next-Gen Asset Management',
    heroTitle1: 'When AI Meets',
    heroTitle2: 'Real World Assets',
    heroSub1: 'AI-Driven Management · Weekly Cash Dividend · Core Index Growth',
    heroSub2: '',
    cta1: 'View Vault',
    cta2: 'Launch App',
    trust: ['On-chain Verifiable', 'Institutional Custody', 'T+3 Redemption', 'Weekly Auto-Dividend'],
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
    liveYield: 'Annual Yield',
    liveReturn: 'Total Return',
    liveStatus: 'AI Active',
    liveWeekly: 'Weekly Dist.',
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

// ── Animated ticker (scrolling data stream) ───────────────────────
function DataTicker() {
  const items = ['NVDY +73.84%', 'QQQI +14.49%', 'QQQM +25.17%', 'VGT +28.97%', 'rINDEX NAV $130.99', 'AI Signal: HOLD', 'Weekly Dist: $0.502'];
  return (
    <div className="overflow-hidden w-full">
      <div className="flex gap-8 animate-[ticker_18s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-mono text-cyan-400/60 shrink-0">
            <span className="text-cyan-400/30 mr-2">▸</span>{item}
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

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
  });

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
    <Brain size={18} className="text-violet-600" />,
    <Layers size={18} className="text-indigo-600" />,
    <Zap size={18} className="text-amber-600" />,
    <TrendingUp size={18} className="text-green-600" />,
  ];
  const featureAccents = ['bg-violet-50', 'bg-indigo-50', 'bg-amber-50', 'bg-green-50'];
  const statColors = ['text-indigo-600', 'text-green-600', 'text-slate-900', 'text-sky-600'];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* NavBar with transparent overlay on dark hero */}
      <div className="relative z-50">
        <NavBar
          activeTab="home"
          rightSlot={
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-sm font-medium text-white/80 hover:bg-white/10 transition-all duration-200"
              >
                🌐 {lang === 'zh' ? 'EN' : '中文'}
              </button>
              <Link href="/vault">
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-95">
                  <Zap size={14} />
                  {lang === 'zh' ? '进入应用' : 'Launch App'}
                </button>
              </Link>
            </div>
          }
        />
      </div>

      {/* ── HERO — Dark Tech ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080c14] min-h-[92vh] flex flex-col" style={{ marginTop: '-64px' }}>

        {/* Animated grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial glow orbs */}
        <div className="pointer-events-none absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[5%] left-[5%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[90px]" />

        {/* Scanning line animation */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
            style={{ animation: 'scanline 6s linear infinite' }}
          />
        </div>

        {/* Corner decorations */}
        <div className="pointer-events-none absolute top-20 left-6 w-16 h-16 border-l-2 border-t-2 border-indigo-500/30" />
        <div className="pointer-events-none absolute top-20 right-6 w-16 h-16 border-r-2 border-t-2 border-indigo-500/30" />
        <div className="pointer-events-none absolute bottom-8 left-6 w-16 h-16 border-l-2 border-b-2 border-cyan-500/20" />
        <div className="pointer-events-none absolute bottom-8 right-6 w-16 h-16 border-r-2 border-b-2 border-cyan-500/20" />

        {/* Main content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono tracking-widest mb-10 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {T.badge}
          </div>

          {/* Hero title */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 text-center max-w-4xl">
            {T.heroTitle1}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #34d399 100%)' }}
            >
              {T.heroTitle2}
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto text-center leading-relaxed mb-12 font-mono tracking-wide">
            {T.heroSub1}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/vault">
              <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap size={15} />
                {T.cta1}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                {T.cta2} <ChevronRight size={15} />
              </button>
            </Link>
          </div>

          {/* Live metrics strip */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: <Activity size={12} />, label: T.liveYield, value: '~19.93%', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
              { icon: <TrendingUp size={12} />, label: T.liveReturn, value: '+29.72%', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' },
              { icon: <Shield size={12} />, label: T.liveStatus, value: '● LIVE', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
              { icon: <Zap size={12} />, label: T.liveWeekly, value: '$0.502 / rINDEX', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
            ].map((m, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${m.border} ${m.bg} backdrop-blur-sm`}>
                <span className={`${m.color} opacity-70`}>{m.icon}</span>
                <span className="text-slate-500 text-xs font-mono">{m.label}</span>
                <span className={`${m.color} text-xs font-bold font-mono`}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Data ticker */}
          <div className="w-full max-w-3xl border-t border-b border-white/5 py-2.5 overflow-hidden">
            <DataTicker />
          </div>
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

      <Footer />

      {/* Global keyframes */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scanline {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
