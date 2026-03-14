// HowItWorks.tsx
// Design: White bg, indigo/violet accent, clean sans-serif
// Sections: AI How It Works (3-step) + AI Market Signals + AI Rebalancing Log

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Eye, BrainCircuit, CheckCircle2, Activity, Cpu, Zap } from 'lucide-react';

type Lang = 'zh' | 'en';

function getLang(): Lang {
  try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
}

// ── i18n ─────────────────────────────────────────────────────────
const COPY = {
  zh: {
    pageTitle: '如何运作',
    pageSub: '从认购到每周收益，全程 AI 驱动，链上透明，无需信任中间人。',
    aiHowTitle: 'AI 如何工作',
    aiSteps: [
      {
        step: '01', title: '实时监控',
        desc: '持续追踪 NVDY/QQQI 隐含波动率与期权溢价，同步监控 QQQM/VGT 动量信号及全组合相关性变化',
        items: ['NVDY & QQQI IV 波动率', 'QQQM/VGT 动量指数', '全组合相关性矩阵'],
      },
      {
        step: '02', title: '智能判断',
        desc: '当任一持仓指标偏离阈值时触发调仓信号，综合四个资产的历史数据评估最优配比',
        items: ['NVDY 波动率超阈值触发', 'QQQI 溢价偏离均值', 'QQQM/VGT 动量反转检测'],
      },
      {
        step: '03', title: '自动执行',
        desc: '在风控框架内自动调整 NVDY/QQQI/QQQM/VGT 四个资产权重，并将派息收益按策略再分配',
        items: ['四资产仓位自动再平衡', '派息智能再投资', '风控边界强制执行'],
      },
    ],
    aiSignalTitle: 'AI 市场信号',
    liveMonitor: '实时监控中',
    signalUpdated: '信号更新于 2026-03-14 22:00 · 下次更新 23:00',
    signals: [
      { label: '市场情绪', value: '谨慎偏多' },
      { label: 'NVDY 波动风险', value: '中等' },
      { label: 'QQQI 期权溢价', value: '偏高' },
      { label: 'QQQM/VGT 动量', value: '偏强' },
      { label: '建议调仓方向', value: '维持当前配比' },
    ],
    aiLogTitle: 'AI 调仓日志',
    logs: [
      { date: '2026-03-10', icon: '⚖️', action: 'NVDY 波动率上升，权重从 25% 临时降至 22%，差额补入 QQQM', tag: '调仓' },
      { date: '2026-03-07', icon: '💰', action: '本周派息 $283，AI 自动将 60% 再投入 QQQI', tag: '再投资' },
      { date: '2026-03-03', icon: '📊', action: '期权溢价回升至历史均值 +1σ，NVDY 权重恢复至目标位 22%', tag: '调仓' },
      { date: '2026-02-24', icon: '🛡️', action: '市场波动加剧，临时将 VGT 权重上调 2%，增强防御', tag: '风控' },
    ],
    ctaBtn: '查看金库数据',
  },
  en: {
    pageTitle: 'How It Works',
    pageSub: 'From subscription to weekly income — fully AI-driven, on-chain transparent, no intermediaries needed.',
    aiHowTitle: 'How AI Works',
    aiSteps: [
      {
        step: '01', title: 'Real-Time Monitoring',
        desc: 'Continuously tracks implied volatility and options premium for NVDY/QQQI, while monitoring QQQM/VGT momentum signals and portfolio correlations.',
        items: ['NVDY & QQQI IV Volatility', 'QQQM/VGT Momentum Index', 'Full Portfolio Correlation Matrix'],
      },
      {
        step: '02', title: 'Intelligent Judgment',
        desc: 'Triggers rebalancing signals when any position metric deviates from threshold; evaluates optimal allocation using historical data across all four assets.',
        items: ['NVDY Vol. Threshold Trigger', 'QQQI Premium Mean Deviation', 'QQQM/VGT Momentum Reversal'],
      },
      {
        step: '03', title: 'Auto Execution',
        desc: 'Automatically adjusts NVDY/QQQI/QQQM/VGT weights within risk control framework and redistributes dividend income per strategy.',
        items: ['4-Asset Auto Rebalancing', 'Smart Dividend Reinvestment', 'Risk Boundary Enforcement'],
      },
    ],
    aiSignalTitle: 'AI Market Signals',
    liveMonitor: 'Live Monitoring',
    signalUpdated: 'Updated 2026-03-14 22:00 · Next update 23:00',
    signals: [
      { label: 'Market Sentiment', value: 'Cautiously Bullish' },
      { label: 'NVDY Vol. Risk', value: 'Moderate' },
      { label: 'QQQI Options Premium', value: 'Elevated' },
      { label: 'QQQM/VGT Momentum', value: 'Strong' },
      { label: 'Suggested Direction', value: 'Hold Current Allocation' },
    ],
    aiLogTitle: 'AI Rebalancing Log',
    logs: [
      { date: '2026-03-10', icon: '⚖️', action: 'NVDY vol. rose; weight trimmed from 25% to 22%, diff. added to QQQM', tag: 'Rebalance' },
      { date: '2026-03-07', icon: '💰', action: 'Weekly dist. $283 received; AI auto-reinvested 60% into QQQI', tag: 'Reinvest' },
      { date: '2026-03-03', icon: '📊', action: 'Options premium rebounded to hist. mean +1σ; NVDY weight restored to 22%', tag: 'Rebalance' },
      { date: '2026-02-24', icon: '🛡️', action: 'Market volatility surged; VGT weight raised 2% for defensive positioning', tag: 'Risk Ctrl' },
    ],
    ctaBtn: 'View Vault Data',
  },
};

const signalBars = [72, 55, 68, 78, 50];
const signalDots = ['bg-amber-400', 'bg-orange-400', 'bg-violet-400', 'bg-sky-400', 'bg-slate-400'];
const signalColors = ['text-amber-600', 'text-orange-500', 'text-violet-600', 'text-sky-600', 'text-slate-700'];
const logTagColors: Record<string, string> = {
  '调仓': 'bg-amber-100 text-amber-700',
  '再投资': 'bg-green-100 text-green-700',
  '风控': 'bg-red-100 text-red-700',
  'Rebalance': 'bg-amber-100 text-amber-700',
  'Reinvest': 'bg-green-100 text-green-700',
  'Risk Ctrl': 'bg-red-100 text-red-700',
};

export default function HowItWorks() {
  const [lang, setLang] = useState<Lang>(getLang);

  useEffect(() => {
    const handler = () => setLang(getLang());
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const T = COPY[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <NavBar activeTab="home" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-16 pb-10 px-6 border-b border-slate-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-violet-100 blur-3xl opacity-40" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold tracking-wide mb-6">
            <Zap size={12} />
            AI × RWA
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            {T.pageTitle}
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {T.pageSub}
          </p>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-8">

        {/* AI 如何工作 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-violet-100">
              <Eye size={16} className="text-violet-500" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">{T.aiHowTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {T.aiSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 h-px bg-violet-200 z-0"
                    style={{ left: 'calc(100% - 0.5rem)', width: 'calc(100% - 2rem)' }}
                  />
                )}
                <div className="relative z-10 p-4 rounded-2xl border bg-violet-50 border-violet-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-100">
                      {i === 0
                        ? <Eye size={20} className="text-violet-400" />
                        : i === 1
                          ? <BrainCircuit size={20} className="text-violet-400" />
                          : <CheckCircle2 size={20} className="text-violet-400" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-violet-400">STEP {step.step}</div>
                      <div className="text-sm font-bold text-slate-900">{step.title}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{step.desc}</p>
                  <div className="space-y-1">
                    {step.items.map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                        <span className="text-[11px] text-slate-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 市场信号 + AI 调仓日志 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI 市场信号 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-violet-100">
                <Activity size={16} className="text-violet-500" />
              </div>
              <h2 className="font-bold text-slate-900">{T.aiSignalTitle}</h2>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">
                {T.liveMonitor}
              </span>
            </div>
            <div className="space-y-3">
              {T.signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${signalDots[i]}`} />
                  <span className="text-xs text-slate-500 w-36 shrink-0">{sig.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${signalDots[i]}`} style={{ width: `${signalBars[i]}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${signalColors[i]} w-28 text-right`}>{sig.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-4">{T.signalUpdated}</p>
          </div>

          {/* AI 调仓日志 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-violet-100">
                <Cpu size={16} className="text-violet-500" />
              </div>
              <h2 className="font-bold text-slate-900">{T.aiLogTitle}</h2>
            </div>
            <div className="space-y-3">
              {T.logs.map((log, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                  <span className="text-base shrink-0 mt-0.5">{log.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-slate-400">{log.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${logTagColors[log.tag] || 'bg-slate-100 text-slate-600'}`}>
                        {log.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{log.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200 active:scale-95"
          >
            <Zap size={15} />
            {T.ctaBtn}
          </a>
        </div>

      </main>
    </div>
  );
}
