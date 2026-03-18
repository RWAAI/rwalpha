/**
 * GoldVault.tsx — rGLD 黄金 Staking 金库
 * 底层 100% GLD · 年化 9% · 无派息 · 自动复利
 */
import React, { useState, useMemo, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import AuthModal from '@/components/AuthModal';
import { HelpCircle, X, TrendingUp, Shield, Zap, Lock, ArrowUpRight, ChevronDown, RefreshCw } from 'lucide-react';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const i18n = {
  zh: {
    vaultTitle: 'RWAlpha 黄金 Staking 金库',
    vaultSub: '底层 100% GLD · 年化 9% · 自动复利 · 无派息',
    stakingBadge: 'Staking',
    liveData: '实时数据',
    connectWallet: '连接钱包',
    login: '登录',
    register: '注册',
    logout: '退出',
    profile: '个人资料',
    myAssets: '我的资产',
    viewDetail: '查看产品详情',

    // 核心指标
    navLabel: 'rGLD NAV',
    navDate: '截至 2026-03-18',
    change24h: '24H 变动',
    annualStaking: '年化 Staking 收益',
    totalStaked: '全网质押量',
    stakersCount: '质押人数',

    // 持仓卡片
    stakingVault: 'Staking 金库',
    fullyBacked: '100% GLD 支撑',
    holdingsLabel: 'rGLD 持仓',
    stakedValue: '质押市值',
    accruedYield: '累计收益',
    stakingDays: '质押天数',

    // 操作
    stakeTab: '质押',
    unstakeTab: '赎回',
    payWith: '支付',
    balance: '余额',
    maxBtn: 'Max',
    minReceive: '最少获得',
    stakingRate: '质押汇率',
    annualRate: '年化收益率',
    autoCompound: '自动复利',
    connectFirst: '请先连接钱包',
    stakeBtn: '立即质押',
    unstakeBtn: '立即赎回',

    // 收益模拟
    simTitle: '收益模拟器',
    simSub: '基于年化 9% 自动复利测算',
    principal: '本金',
    after1y: '1 年后',
    after3y: '3 年后',
    after5y: '5 年后',
    simNote: '* 收益率随市场行情动态调整，不作固定承诺。',

    // 底层资产
    assetTitle: '底层资产',
    assetName: 'SPDR Gold Shares',
    assetDesc: '全球最大黄金 ETF，100% 实物黄金支撑，纽交所上市，流动性极强。',
    assetAum: 'AUM',
    assetExpense: '费率',
    assetExchange: '交易所',
    viewChain: '查看链上储备证明',

    // 工作原理
    howTitle: '如何运作',
    steps: [
      { n: '01', title: '存入 USDC', desc: '用 USDC 认购 rGLD，系统自动将资金映射至底层 GLD ETF 份额。' },
      { n: '02', title: '自动复利', desc: '每日将 9% 年化收益自动复利至持仓，rGLD NAV 持续增长，无需手动操作。' },
      { n: '03', title: '随时赎回', desc: '按当日 NAV 赎回 rGLD，获得 USDC，全程链上透明可查。' },
    ],

    // 特性
    features: [
      { title: '实物黄金背书', desc: '每枚 rGLD 对应等值 GLD ETF 份额，链上实时可查' },
      { title: '年化 9% 复利', desc: '收益自动滚入本金，无需手动操作，复利加速增长' },
      { title: '随时进出', desc: '无锁仓期，随时按 NAV 认购或赎回，灵活高效' },
      { title: 'AI 风控', desc: 'AI 实时监控底层资产风险，异常时自动触发保护机制' },
    ],

    // 弹层
    backedModalTitle: '底层资产说明',
    backedModalDesc: '每 1 枚 rGLD token 对应 1 单位 GLD ETF 份额的价值。底层资产持仓数据链上实时可查，确保 1:1 实物黄金支撑。',
    viewReserve: '查看链上储备证明',
  },
  en: {
    vaultTitle: 'RWAlpha Gold Staking Vault',
    vaultSub: '100% GLD Backed · 9% APY · Auto-Compound · No Dividend',
    stakingBadge: 'Staking',
    liveData: 'Live Data',
    connectWallet: 'Connect Wallet',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myAssets: 'My Assets',
    viewDetail: 'View Product Details',

    navLabel: 'rGLD NAV',
    navDate: 'As of 2026-03-18',
    change24h: '24H Change',
    annualStaking: 'Annual Staking Yield',
    totalStaked: 'Total Staked',
    stakersCount: 'Stakers',

    stakingVault: 'Staking Vault',
    fullyBacked: '100% GLD Backed',
    holdingsLabel: 'rGLD Holdings',
    stakedValue: 'Staked Value',
    accruedYield: 'Accrued Yield',
    stakingDays: 'Days Staked',

    stakeTab: 'Stake',
    unstakeTab: 'Unstake',
    payWith: 'Pay',
    balance: 'Balance',
    maxBtn: 'Max',
    minReceive: 'Min. Receive',
    stakingRate: 'Staking Rate',
    annualRate: 'Annual Rate',
    autoCompound: 'Auto-Compound',
    connectFirst: 'Please connect wallet first',
    stakeBtn: 'Stake Now',
    unstakeBtn: 'Unstake Now',

    simTitle: 'Yield Simulator',
    simSub: 'Based on 9% APY auto-compound',
    principal: 'Principal',
    after1y: 'After 1 Year',
    after3y: 'After 3 Years',
    after5y: 'After 5 Years',
    simNote: '* Yield rates are subject to market conditions and are not guaranteed.',

    assetTitle: 'Underlying Asset',
    assetName: 'SPDR Gold Shares',
    assetDesc: "World's largest gold ETF, 100% physically backed, NYSE-listed with exceptional liquidity.",
    assetAum: 'AUM',
    assetExpense: 'Expense Ratio',
    assetExchange: 'Exchange',
    viewChain: 'View On-chain Reserve Proof',

    howTitle: 'How It Works',
    steps: [
      { n: '01', title: 'Deposit USDC', desc: 'Buy rGLD with USDC. The system automatically maps funds to underlying GLD ETF shares.' },
      { n: '02', title: 'Auto-Compound', desc: '9% APY is compounded daily into your holdings. rGLD NAV grows continuously — no manual action needed.' },
      { n: '03', title: 'Redeem Anytime', desc: 'Redeem rGLD at current NAV for USDC. Fully transparent on-chain.' },
    ],

    features: [
      { title: 'Physical Gold Backed', desc: 'Each rGLD maps to equivalent GLD ETF value, verifiable on-chain' },
      { title: '9% APY Compound', desc: 'Yield auto-reinvested daily — no manual action, exponential growth' },
      { title: 'No Lock-up', desc: 'Stake or unstake anytime at NAV, fully flexible' },
      { title: 'AI Risk Control', desc: 'AI monitors underlying asset risks in real-time with auto-protection' },
    ],

    backedModalTitle: 'Underlying Asset',
    backedModalDesc: 'Each rGLD token represents the value of 1 GLD ETF share. On-chain reserve data is publicly verifiable in real time, ensuring 1:1 physical gold backing.',
    viewReserve: 'View On-chain Reserve Proof',
  },
} as const;

type Lang = 'zh' | 'en';

// ─── GLD 数据 ─────────────────────────────────────────────────────────────────
const GLD_NAV = 261.85;          // rGLD NAV (USD) — 跟踪 GLD 价格
const STAKING_APY = 9.0;         // 年化 %
const DAILY_RATE = STAKING_APY / 100 / 365;

export default function GoldVault() {
  const getLang = (): Lang => (localStorage.getItem('rwa-lang') === 'en' ? 'en' : 'zh');
  const [lang, setLang] = useState<Lang>(getLang);
  const T = i18n[lang];

  // 模拟登录状态
  const [mockLoggedIn, setMockLoggedIn] = useState(() => localStorage.getItem('mock-logged-in') === '1');
  const [authModal, setAuthModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [backedModal, setBackedModal] = useState(false);

  // 操作 tab
  const [opTab, setOpTab] = useState<'stake' | 'unstake'>('stake');
  const [spendAmt, setSpendAmt] = useState('');
  const [chainOpen, setChainOpen] = useState(false);

  // 收益模拟
  const [simPrincipal, setSimPrincipal] = useState('10000');

  useEffect(() => {
    const handler = () => {
      setLang(getLang());
      setMockLoggedIn(localStorage.getItem('mock-logged-in') === '1');
    };
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const isLoggedIn = mockLoggedIn;
  const displayUser = isLoggedIn ? { name: 'Demo User', email: 'demo@rwalpha.ai' } : null;

  // 模拟持仓数据
  const holdings = { amount: 38.24, days: 47 };
  const stakedValue = holdings.amount * GLD_NAV;
  const accruedYield = stakedValue * (Math.pow(1 + DAILY_RATE, holdings.days) - 1);

  // 收益模拟计算
  const simResult = useMemo(() => {
    const p = parseFloat(simPrincipal.replace(/,/g, '')) || 0;
    const r = STAKING_APY / 100;
    return {
      y1: (p * Math.pow(1 + r, 1)).toFixed(2),
      y3: (p * Math.pow(1 + r, 3)).toFixed(2),
      y5: (p * Math.pow(1 + r, 5)).toFixed(2),
      gain1: (p * (Math.pow(1 + r, 1) - 1)).toFixed(2),
      gain3: (p * (Math.pow(1 + r, 3) - 1)).toFixed(2),
      gain5: (p * (Math.pow(1 + r, 5) - 1)).toFixed(2),
    };
  }, [simPrincipal]);

  // 认购计算
  const rGLDReceive = spendAmt ? (parseFloat(spendAmt) / GLD_NAV).toFixed(4) : '0';
  const usdcReceive = spendAmt ? (parseFloat(spendAmt) * GLD_NAV).toFixed(2) : '0';

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar activeTab="vault" />

      {/* ── 顶部 Header ── */}
      <div className="bg-white border-b border-slate-100 sticky top-[56px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* 金库标题 */}
            <div className="flex items-center gap-2">
              {/* 黄金图标 */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">Au</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">{T.vaultTitle}</h1>
            </div>
            <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-[11px] font-bold rounded-full border border-yellow-200">
              {T.stakingBadge}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-semibold rounded-full border border-emerald-100">
              {T.liveData}
            </span>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {displayUser?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-slate-700 font-medium">{displayUser?.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <a href="/my-assets" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{T.myAssets}</a>
                    <a href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{T.profile}</a>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => { localStorage.removeItem('mock-logged-in'); setMockLoggedIn(false); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >{T.logout}</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal(true)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors">{T.login}</button>
                <button onClick={() => setAuthModal(true)} className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-full transition-colors">{T.register}</button>
              </>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => setAuthModal(true)}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              {T.connectWallet}
            </button>
          </div>
        </div>
        {/* 副标题 */}
        <div className="max-w-6xl mx-auto px-4 pb-2.5 flex items-center gap-2 text-xs text-slate-400">
          <span>{T.vaultSub}</span>
          <span className="text-slate-300">·</span>
          <a href="#" className="text-yellow-600 hover:text-yellow-700 flex items-center gap-0.5 transition-colors">
            {T.viewDetail} <ArrowUpRight size={11} />
          </a>
        </div>
      </div>

      {/* ── 核心指标横幅 ── */}
      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{T.navLabel}</p>
            <p className="text-xl font-bold text-slate-900">${GLD_NAV.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400">{T.navDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{T.change24h}</p>
            <p className="text-xl font-bold text-emerald-600">+0.42%</p>
            <p className="text-[11px] text-slate-400">↑ +$1.10</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{T.annualStaking}</p>
            <p className="text-xl font-bold text-yellow-600">~{STAKING_APY.toFixed(2)}%</p>
            <p className="text-[11px] text-slate-400">{lang === 'zh' ? '自动复利' : 'Auto-Compound'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{T.totalStaked}</p>
            <p className="text-xl font-bold text-slate-900">$12.4M</p>
            <p className="text-[11px] text-slate-400">4,820 {T.stakersCount}</p>
          </div>
        </div>
      </div>

      {/* ── 主内容区 ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── 左侧：持仓 / Staking 操作 ── */}
        <div className="flex flex-col gap-4">

          {/* 持仓卡片（登录后） */}
          {isLoggedIn && (
            <div className="rounded-3xl border border-yellow-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="font-bold text-slate-800 text-base">{T.stakingVault}</span>
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-[11px] font-semibold rounded-full">
                    {lang === 'zh' ? '质押中' : 'Staking'}
                  </span>
                </div>
                <button
                  onClick={() => setBackedModal(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-yellow-600 transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>{T.fullyBacked}</span>
                </button>
              </div>

              {/* 持仓数据色块 */}
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-2xl bg-yellow-50 px-4 py-3 col-span-2">
                  <p className="text-xs text-slate-400 mb-1">{T.holdingsLabel}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {holdings.amount.toFixed(2)} <span className="text-yellow-600 text-lg">rGLD</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{lang === 'zh' ? '本金价值' : 'Principal Value'} <span className="text-slate-600 font-medium">${stakedValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span></p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{T.accruedYield}</p>
                  <p className="text-lg font-bold text-emerald-600">+${accruedYield.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'zh' ? '自动复利中' : 'Auto-compounding'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-1">{T.stakingDays}</p>
                  <p className="text-lg font-bold text-slate-800">{holdings.days} {lang === 'zh' ? '天' : 'days'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'zh' ? '年化 9% 复利' : '9% APY compound'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 操作卡片 */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Tab */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setOpTab('stake')}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${opTab === 'stake' ? 'bg-yellow-500 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >{T.stakeTab}</button>
              <button
                onClick={() => setOpTab('unstake')}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${opTab === 'unstake' ? 'bg-yellow-500 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >{T.unstakeTab}</button>
              {/* 链选择 */}
              <button
                onClick={() => setChainOpen(v => !v)}
                className="flex items-center gap-1.5 px-4 text-sm text-slate-500 border-l border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">E</span>
                <span>Ethereum</span>
                <ChevronDown size={12} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 支付输入 */}
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{opTab === 'stake' ? T.payWith : T.unstakeTab}</span>
                  <span className="text-xs text-slate-400">{T.balance}: 0 {opTab === 'stake' ? 'USDC' : 'rGLD'} <button className="text-yellow-600 font-semibold ml-1">{T.maxBtn}</button></span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={spendAmt}
                    onChange={e => setSpendAmt(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-2xl font-bold text-slate-800 outline-none placeholder-slate-300"
                  />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 shrink-0">
                    {opTab === 'stake'
                      ? <><span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">$</span> USDC</>
                      : <><span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-white text-[8px] font-bold">Au</span> rGLD</>
                    }
                  </div>
                </div>
              </div>

              {/* 箭头 */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>

              {/* 获得 */}
              <div className="rounded-2xl bg-yellow-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{T.minReceive}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-2xl font-bold text-slate-800">
                    {opTab === 'stake' ? rGLDReceive : usdcReceive}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-yellow-200 text-sm font-semibold text-slate-700 shrink-0">
                    {opTab === 'stake'
                      ? <><span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-white text-[8px] font-bold">Au</span> rGLD</>
                      : <><span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">$</span> USDC</>
                    }
                  </div>
                </div>
              </div>

              {/* 汇率信息 */}
              <div className="rounded-xl bg-slate-50 px-4 py-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{T.stakingRate}</span>
                  <span className="font-medium text-slate-700">1 rGLD = ${GLD_NAV.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{T.annualRate}</span>
                  <span className="font-medium text-emerald-600">~{STAKING_APY}%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{T.autoCompound}</span>
                  <span className="font-medium text-yellow-600">{lang === 'zh' ? '每日复利' : 'Daily'}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              {isLoggedIn ? (
                <button className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-2xl text-base transition-all shadow-md hover:shadow-lg">
                  ⚡ {opTab === 'stake' ? T.stakeBtn : T.unstakeBtn}
                </button>
              ) : (
                <button
                  onClick={() => setAuthModal(true)}
                  className="w-full py-4 bg-slate-100 text-slate-400 font-semibold rounded-2xl text-sm cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  {T.connectFirst}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 右侧：收益模拟 + 底层资产 + 特性 ── */}
        <div className="flex flex-col gap-4">

          {/* 收益模拟器 */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-yellow-500" />
              <h3 className="font-bold text-slate-800">{T.simTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">{T.simSub}</p>

            {/* 本金输入 */}
            <div className="rounded-xl bg-slate-50 px-4 py-3 mb-4">
              <p className="text-xs text-slate-400 mb-1">{T.principal} (USDC)</p>
              <input
                type="number"
                value={simPrincipal}
                onChange={e => setSimPrincipal(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-slate-800 outline-none"
                placeholder="10000"
              />
            </div>

            {/* 结果 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: T.after1y, value: simResult.y1, gain: simResult.gain1 },
                { label: T.after3y, value: simResult.y3, gain: simResult.gain3 },
                { label: T.after5y, value: simResult.y5, gain: simResult.gain5 },
              ].map(({ label, value, gain }) => (
                <div key={label} className="rounded-2xl bg-gradient-to-b from-yellow-50 to-amber-50 border border-yellow-100 px-3 py-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                  <p className="text-base font-bold text-slate-900">${parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+${parseFloat(gain).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">{T.simNote}</p>
          </div>

          {/* 底层资产 */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-yellow-500" />
                <h3 className="font-bold text-slate-800">{T.assetTitle}</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-[11px] font-semibold rounded-full">100% GLD</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-white font-bold text-sm">GLD</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">{T.assetName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{T.assetDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: T.assetAum, value: '$73.2B' },
                { label: T.assetExpense, value: '0.40%' },
                { label: T.assetExchange, value: 'NYSE' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
                  <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBackedModal(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              {T.viewChain} <ArrowUpRight size={14} />
            </button>
          </div>

          {/* 四大特性 */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-yellow-500" />
              <h3 className="font-bold text-slate-800">{lang === 'zh' ? '产品特性' : 'Features'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {T.features.map((f, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800 mb-1">{f.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 如何运作 ── */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <RefreshCw size={16} className="text-yellow-500" />
            <h3 className="font-bold text-slate-800 text-base">{T.howTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {T.steps.map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">{s.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底层资产弹层 ── */}
      {backedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBackedModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">{T.backedModalTitle}</h3>
              <button onClick={() => setBackedModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{T.backedModalDesc}</p>
            <a href="#" className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors" onClick={e => e.preventDefault()}>
              {T.viewReserve} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ── AuthModal ── */}
      {authModal && (
        <AuthModal
          open={authModal}
          onClose={() => setAuthModal(false)}
          onLoginSuccess={() => {
            localStorage.setItem('mock-logged-in', '1');
            setMockLoggedIn(true);
            setAuthModal(false);
          }}
          zh={lang === 'zh'}
        />
      )}
    </div>
  );
}
