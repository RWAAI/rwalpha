// HowItWorks.tsx
// Design: White bg, indigo/violet accent, clean sans-serif
// Sections: AI How It Works (3-step) + AI Market Signals + AI Rebalancing Log
//           + Trust Three Pillars + Why Trust RWAlpha + Investment/Dividend Flow

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Eye, BrainCircuit, CheckCircle2, Activity, Cpu, Zap, Diamond, Target, TrendingUp, Link2, Shield, Users, BookOpen, Wallet, Layers, RefreshCw, Building2, BarChart3, ChevronRight } from 'lucide-react';

type Lang = 'zh' | 'en';

function getLang(): Lang {
  try { return (localStorage.getItem('rwa-lang') as Lang) || 'zh'; } catch { return 'zh'; }
}

const COPY = {
  zh: {
    pageTitle: '如何运作',
    pageSub: 'AI × 可信RWA中间层',
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
    // Trust pillars
    trustHeader: 'RWAlpha — 机构级真实收益的可信中间层',
    trustPillars: [
      {
        icon: 'diamond',
        title: '可信团队',
        items: ['丰富的持牌合规经验', '机构级风控体系', '透明链上治理', '专业资产管理背景'],
      },
      {
        icon: 'target',
        title: '可信 Token',
        items: ['1:1 底层资产支撑', 'Fireblocks 机构托管', '链上实时可验证', 'T+3 赎回保障'],
      },
      {
        icon: 'trending',
        title: '可信资产',
        items: ['严选指数级 ETF 标的', '龙头科技股期权策略', '10亿美金+规模保障', '年化总回报 20%+'],
      },
    ],
    // Why trust
    whyTrustHeader: '为何信任 RWALPHA',
    whyTrustItems: [
      {
        icon: 'link',
        title: '链上透明可验证',
        desc: '每一笔代币铸造、销毁和收益分配均记录在链上，实时公开可查。',
        link: '查看储备证明 →',
      },
      {
        icon: 'shield',
        title: 'Fireblocks 机构级托管',
        desc: '底层资产通过 Fireblocks MPC 托管存放于独立账户，与顶级基金采用相同的基础设施。',
        link: null,
      },
      {
        icon: 'users',
        title: '持牌团队 · 传统金融背景',
        desc: 'RWAlpha 团队核心成员均来自头部传统金融机构，有着丰富的监管合规经验，将机构级风控与合规标准带入 RWA 链上产品。',
        link: null,
      },
      {
        icon: 'book',
        title: '定期对账单公示',
        desc: 'RWAlpha 实时将托管行对账单上链公示，确保本金金库里的代币与链下 ETF 份额完全对等，实现真实透明。',
        link: '查看储备证明 →',
      },
    ],
    // Flow
    flowHeader: '资金流程',
    investFlow: '投资流程',
    dividendFlow: '周度 / 月度派息流程',
    flowNodes: {
      user: '用户', userSub: '存入稳定币',
      rwalpha: 'RWAlpha', rwalphaSub: '协议',
      rwalphaDist: 'RWAlpha', rwalphaDist2: '分发',
      fomo: 'FOMO Pay', fomoSub: '法币兑换',
      fomoRev: 'FOMO Pay', fomoRevSub: 'USD → 稳定币',
      broker: 'Broker', brokerSub: '投行',
      asset: '资产', assetSub: 'ETF / 股票 / 黄金',
      wallet: '用户钱包', walletSub: '接收收益',
      masBadge: 'MAS 持牌',
      topBadge: '顶级投行',
    },
    ctaBtn: '查看金库数据',
  },
  en: {
    pageTitle: 'How It Works',
    pageSub: 'AI × Trusted RWA Middle Layer',
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
    trustHeader: 'RWAlpha — The Trusted Intermediary for Institutional-Grade Real Yield',
    trustPillars: [
      {
        icon: 'diamond',
        title: 'Trusted Team',
        items: ['Licensed & compliant expertise', 'Institutional risk framework', 'On-chain governance transparency', 'Professional asset management background'],
      },
      {
        icon: 'target',
        title: 'Trusted Token',
        items: ['1:1 underlying asset backing', 'Fireblocks institutional custody', 'Real-time on-chain verifiable', 'T+3 redemption guarantee'],
      },
      {
        icon: 'trending',
        title: 'Trusted Assets',
        items: ['Curated index-grade ETFs', 'Leading tech options strategy', '$1B+ AUM assurance', '20%+ annualized total return'],
      },
    ],
    whyTrustHeader: 'WHY TRUST RWALPHA',
    whyTrustItems: [
      {
        icon: 'link',
        title: 'On-Chain Transparent & Verifiable',
        desc: 'Every token mint, burn, and yield distribution is recorded on-chain, publicly verifiable in real time.',
        link: 'View Proof of Reserves →',
      },
      {
        icon: 'shield',
        title: 'Fireblocks Institutional Custody',
        desc: 'Underlying assets are held in segregated accounts via Fireblocks MPC custody — the same infrastructure used by top-tier funds.',
        link: null,
      },
      {
        icon: 'users',
        title: 'Licensed Team · TradFi Background',
        desc: 'RWAlpha\'s core team comes from leading traditional financial institutions, bringing institutional-grade risk management and compliance standards to on-chain RWA products.',
        link: null,
      },
      {
        icon: 'book',
        title: 'Regular Statement Publication',
        desc: 'RWAlpha publishes custodian statements on-chain in real time, ensuring the tokens in the vault are fully backed 1:1 by off-chain ETF shares.',
        link: 'View Proof of Reserves →',
      },
    ],
    flowHeader: 'Fund Flow',
    investFlow: 'Investment Flow',
    dividendFlow: 'Weekly / Monthly Dividend Flow',
    flowNodes: {
      user: 'User', userSub: 'Deposit Stablecoin',
      rwalpha: 'RWAlpha', rwalphaSub: 'Protocol',
      rwalphaDist: 'RWAlpha', rwalphaDist2: 'Distribute',
      fomo: 'FOMO Pay', fomoSub: 'Fiat Exchange',
      fomoRev: 'FOMO Pay', fomoRevSub: 'USD → Stablecoin',
      broker: 'Broker', brokerSub: 'Prime Broker',
      asset: 'Asset', assetSub: 'ETF / Stocks / Gold',
      wallet: 'User Wallet', walletSub: 'Receive Yield',
      masBadge: 'MAS Licensed',
      topBadge: 'Top Prime Broker',
    },
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

function PillarIcon({ type }: { type: string }) {
  if (type === 'diamond') return <Diamond size={20} className="text-teal-500" />;
  if (type === 'target') return <Target size={20} className="text-amber-500" />;
  return <TrendingUp size={20} className="text-green-500" />;
}

function TrustIcon({ type }: { type: string }) {
  if (type === 'link') return <Link2 size={18} className="text-indigo-500" />;
  if (type === 'shield') return <Shield size={18} className="text-indigo-500" />;
  if (type === 'users') return <Users size={18} className="text-indigo-500" />;
  return <BookOpen size={18} className="text-indigo-500" />;
}

// Flow diagram node
// Flow node icons map
const nodeIconMap: Record<string, React.ReactNode> = {
  user: <Wallet size={18} className="text-indigo-500" />,
  rwalpha: <Layers size={18} className="text-violet-500" />,
  fomo: <RefreshCw size={18} className="text-teal-500" />,
  broker: <Building2 size={18} className="text-amber-500" />,
  asset: <BarChart3 size={18} className="text-green-500" />,
  wallet: <Wallet size={18} className="text-indigo-500" />,
};

function FlowCard({
  iconKey, label, sub, badge, badgeColor = 'bg-amber-400 text-slate-900', accent = 'border-slate-200'
}: {
  iconKey: string; label: string; sub: string; badge?: string;
  badgeColor?: string; accent?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-[96px] h-[120px] bg-white rounded-2xl border-2 ${accent} shadow-md px-2 flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-0.5`}>
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {nodeIconMap[iconKey]}
        </div>
        <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">{label}</span>
        <span className="text-[9px] text-slate-400 text-center leading-tight">{sub}</span>
        {badge && (
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap ${badgeColor} mt-0.5`}>{badge}</span>
        )}
      </div>
    </div>
  );
}

function FlowConnector({ label, reverse }: { label: string; reverse?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-1 shrink-0">
      <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap bg-white px-1.5 py-0.5 rounded-full border border-slate-100">{label}</span>
      <div className="flex items-center gap-0.5">
        {reverse ? (
          <>
            <div className="w-8 h-px bg-gradient-to-l from-indigo-300 to-slate-200" />
            <ChevronRight size={10} className="text-indigo-300 rotate-180 -ml-1" />
          </>
        ) : (
          <>
            <div className="w-8 h-px bg-gradient-to-r from-slate-200 to-indigo-300" />
            <ChevronRight size={10} className="text-indigo-300 -ml-1" />
          </>
        )}
      </div>
    </div>
  );
}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {T.aiSteps.map((step, i) => (
              <div key={step.step} className="relative flex flex-col">
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 h-px bg-violet-200 z-0"
                    style={{ left: 'calc(100% - 0.5rem)', width: 'calc(100% - 2rem)' }}
                  />
                )}
                <div className="relative z-10 p-4 rounded-2xl border bg-violet-50 border-violet-100 flex flex-col h-full">
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

        {/* ── 可信三列 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 text-center">{T.trustHeader}</h2>
          </div>
          {/* 彩色分隔线 */}
          <div className="flex h-0.5">
            <div className="flex-1 bg-teal-400" />
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-green-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {T.trustPillars.map((pillar) => (
              <div key={pillar.title} className="px-8 py-8">
                <PillarIcon type={pillar.icon} />
                <h3 className="text-base font-bold text-slate-900 mt-4 mb-4">{pillar.title}</h3>
                <ul className="space-y-2">
                  {pillar.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 为何信任 RWAlpha ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-4 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{T.whyTrustHeader}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {T.whyTrustItems.map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                <div className="p-2 rounded-lg bg-indigo-50 shrink-0 h-fit">
                  <TrustIcon type={item.icon} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  {item.link && (
                    <button className="mt-2 text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition-colors">
                      {item.link}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 资金流程图 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-8 text-center">{T.flowHeader}</h2>

          {/* 投资流程 */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6">
              {T.investFlow}
            </div>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between gap-2 min-w-[640px] px-8 py-8 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 border border-indigo-100" style={{alignItems:'center'}}>
                <FlowCard iconKey="user" label={T.flowNodes.user} sub={T.flowNodes.userSub} accent="border-indigo-200" />
                <FlowConnector label="USDT/USDC" />
                <FlowCard iconKey="rwalpha" label={T.flowNodes.rwalpha} sub={T.flowNodes.rwalphaSub} accent="border-violet-200" />
                <FlowConnector label="Transfer" />
                <FlowCard iconKey="fomo" label={T.flowNodes.fomo} sub={T.flowNodes.fomoSub} badge={T.flowNodes.masBadge} accent="border-teal-200" badgeColor="bg-teal-100 text-teal-700" />
                <FlowConnector label="USD Fiat" />
                <FlowCard iconKey="broker" label={T.flowNodes.broker} sub={T.flowNodes.brokerSub} badge={T.flowNodes.topBadge} accent="border-amber-200" badgeColor="bg-amber-100 text-amber-700" />
                <FlowConnector label="Purchase" />
                <FlowCard iconKey="asset" label={T.flowNodes.asset} sub={T.flowNodes.assetSub} accent="border-green-200" />
              </div>
            </div>
          </div>

          {/* 派息流程 */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 text-xs font-bold mb-6">
              {T.dividendFlow}
            </div>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between gap-2 min-w-[640px] px-8 py-8 rounded-2xl bg-gradient-to-br from-teal-50/60 via-white to-green-50/40 border border-teal-100" style={{alignItems:'center'}}>
                <FlowCard iconKey="wallet" label={T.flowNodes.wallet} sub={T.flowNodes.walletSub} accent="border-indigo-200" />
                <FlowConnector label="Stablecoin" reverse />
                <FlowCard iconKey="rwalpha" label={T.flowNodes.rwalphaDist} sub={T.flowNodes.rwalphaDist2} accent="border-violet-200" />
                <FlowConnector label="Transfer" reverse />
                <FlowCard iconKey="fomo" label={T.flowNodes.fomoRev} sub={T.flowNodes.fomoRevSub} badge={T.flowNodes.masBadge} accent="border-teal-200" badgeColor="bg-teal-100 text-teal-700" />
                <FlowConnector label="USD Fiat" reverse />
                <FlowCard iconKey="broker" label={T.flowNodes.broker} sub={T.flowNodes.brokerSub} badge={T.flowNodes.topBadge} accent="border-amber-200" badgeColor="bg-amber-100 text-amber-700" />
                <FlowConnector label="Dividend/Yield" reverse />
                <FlowCard iconKey="asset" label={T.flowNodes.asset} sub={T.flowNodes.assetSub} accent="border-green-200" />
              </div>
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
