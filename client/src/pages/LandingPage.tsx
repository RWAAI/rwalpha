// Design: Clean white background, AI × RWA theme
// Typography: Bold display for hero, clean sans for body
// Colors: Slate/white base, indigo accent, green for yield numbers
// Layout: Asymmetric hero, full-width feature strip, stats row, CTA

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import { Zap, Layers, Brain, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react';

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
  return (
    <span ref={ref}>
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── Feature card ─────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${accent}`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-1.5">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <NavBar activeTab="home" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-16 px-6">
        {/* subtle grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* indigo glow blob */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-100 blur-3xl opacity-50" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI × RWA · 下一代资产管理
          </div>

          {/* main headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
            当 AI 遇上
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              真实世界资产
            </span>
          </h1>

          {/* sub */}
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
            不是算法预测，是 AI 实时管理的 ETF 底仓 + 每周稳定派息。
            <br className="hidden sm:block" />
            RWAlpha，机构策略，链上透明。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95">
                查看金库数据 <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/vault">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all duration-200">
                进入应用 <ChevronRight size={15} />
              </button>
            </Link>
          </div>

          {/* trust strip */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
            {['链上可验证', '机构级托管', 'T+3 赎回保障', '每周自动派息'].map((t) => (
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
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-10">四大核心优势</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<Zap size={18} className="text-amber-600" />}
              accent="bg-amber-50"
              title="每周派息"
              desc="期权收益机制化分配，稳定现金流按周到账。"
            />
            <FeatureCard
              icon={<Layers size={18} className="text-indigo-600" />}
              accent="bg-indigo-50"
              title="指数底仓"
              desc="纳指 ETF 完全支撑，本金随市场长期增值。"
            />
            <FeatureCard
              icon={<Brain size={18} className="text-violet-600" />}
              accent="bg-violet-50"
              title="AI 驱动调仓"
              desc="AI 实时监测，驱动优化仓位。"
            />
            <FeatureCard
              icon={<TrendingUp size={18} className="text-green-600" />}
              accent="bg-green-50"
              title="稳健增长"
              desc="派息与净值双轨驱动，复利持续滚动增值。"
            />
          </div>
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-10">实时数据</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: '年化派息率', value: 19.88, suffix: '%', decimals: 2, color: 'text-indigo-600' },
              { label: '年化总回报', value: 29.72, suffix: '%', decimals: 2, color: 'text-green-600' },
              { label: '底层 ETF 规模', value: 10, prefix: '$', suffix: '亿+', decimals: 0, color: 'text-slate-900' },
              { label: '链上持仓验证', value: 100, suffix: '%', decimals: 0, color: 'text-sky-600' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className={`text-4xl font-extrabold tracking-tight ${s.color}`}>
                  <Counter to={s.value} prefix={s.prefix ?? ''} suffix={s.suffix} decimals={s.decimals} />
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
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">运作机制</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">三步，让资产替你工作</h2>
          <p className="text-slate-500 text-sm mb-12">从认购到每周收息，全程链上透明，无需信任中间人。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { step: '01', title: '认购 rINDEX', desc: '以 USDT 认购，1:1 映射底层 ETF 净值，链上即时确认。' },
              { step: '02', title: 'AI 实时管理', desc: 'AI 引擎持续监测市场信号，自动调整仓位比例与期权策略。' },
              { step: '03', title: '每周收益到账', desc: '期权收益每周自动分配至你的钱包，或选择自动复利再投入。' },
            ].map((item) => (
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
            准备好让 AI 替你管仓了吗？
          </h2>
          <p className="text-slate-500 text-base mb-8">
            机构级策略，链上透明，每周派息。现在就开始。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vault">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95">
                <Zap size={15} />
                立即进入金库
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-all duration-200">
                查看数据 Dashboard
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
          <span>© 2026 RWAlpha. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
