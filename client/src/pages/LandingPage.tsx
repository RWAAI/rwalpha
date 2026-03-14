import { useState } from 'react';
import { Link } from 'wouter';

const navTabs = ['首页 / Home', '金库 / Vault', '如何运作 / How It Works', '洞察 / Insights', '积分 / Points', '文档 / Docs'];

export default function LandingPage() {
  const [zh, setZh] = useState(true);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── 顶部导航栏 ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="text-xl font-extrabold tracking-tight cursor-pointer" style={{ color: '#38bdf8' }}>
                RWAlpha.io
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navTabs.map((tab, i) => {
                const isHome = i === 0;
                const isVault = i === 1;
                const cls = `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isHome
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`;
                if (isHome) return <Link key={tab} href="/"><button className={cls}>{tab}</button></Link>;
                if (isVault) return <Link key={tab} href="/vault"><button className={cls}>{tab}</button></Link>;
                return (
                  <button
                    key={tab}
                    className={cls}
                    onClick={() => alert(zh ? '即将上线' : 'Coming soon')}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Right: Lang + Launch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZh(!zh)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              {zh ? 'EN' : '中文'}
            </button>
            <Link href="/vault">
              <button className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: '#38bdf8' }}>
                {zh ? '进入应用' : 'Launch App'}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero 占位区域 ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* 占位徽标 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block" />
            {zh ? '即将上线' : 'Coming Soon'}
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            {zh ? (
              <>RWAlpha <span style={{ color: '#38bdf8' }}>首页</span><br />正在建设中</>
            ) : (
              <>RWAlpha <span style={{ color: '#38bdf8' }}>Homepage</span><br />Under Construction</>
            )}
          </h1>

          {/* 副标题 */}
          <p className="text-lg text-slate-500 mb-10">
            {zh
              ? '首页内容正在设计中，敬请期待。你可以先前往金库页面体验产品。'
              : 'Homepage is being designed. You can visit the vault page to explore the product.'}
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vault">
              <button className="px-6 py-3 rounded-xl text-white font-semibold text-base shadow-sm hover:opacity-90 transition-all"
                style={{ background: '#38bdf8' }}>
                {zh ? '前往金库应用 →' : 'Go to Vault App →'}
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded-xl text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 transition-all">
                {zh ? '查看产品详情' : 'View Dashboard'}
              </button>
            </Link>
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="mt-20 flex items-center gap-4 text-slate-300 text-sm">
          <span>rINDEX</span>
          <span>·</span>
          <span>rINDEX-YIELD</span>
          <span>·</span>
          <span>RWAlpha.io</span>
        </div>
      </main>
    </div>
  );
}
