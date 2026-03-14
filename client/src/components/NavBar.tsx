import { useState } from 'react';
import { Link } from 'wouter';
import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

// activeTab: 'home' | 'dashboard' | 'vault'
interface NavBarProps {
  activeTab?: 'home' | 'dashboard' | 'vault';
  /** 替换右侧默认「进入应用」按钮区域；不传则显示默认 Launch App */
  rightSlot?: ReactNode;
}

export default function NavBar({ activeTab = 'home', rightSlot }: NavBarProps) {
  const [zh, setZh] = useState(true);

  const tabsZh = ['首页', '金库', '如何运作', '洞察', '积分', '文档'];
  const tabsEn = ['Home', 'Vault', 'How It Works', 'Insights', 'Points', 'Docs'];
  const tabs = zh ? tabsZh : tabsEn;

  const activeIdx = activeTab === 'home' ? 0 : 1;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* 左侧：Logo + Nav Tabs */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <span
              className="text-xl font-extrabold tracking-tight cursor-pointer"
              style={{ color: '#38bdf8', letterSpacing: '-0.02em' }}
            >
              RWAlpha.io
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx;
              const cls = `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-slate-900/10 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`;
              if (i === 0) return <Link key={tab} href="/"><button className={cls}>{tab}</button></Link>;
              if (i === 1) return <Link key={tab} href="/dashboard"><button className={cls}>{tab}</button></Link>;
              return (
                <button key={tab} className={cls} onClick={() => alert(zh ? '即将上线' : 'Coming soon')}>
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 右侧：语言切换 + 自定义插槽或默认 Launch App */}
        <div className="flex items-center gap-2">
          {rightSlot !== undefined ? (
            rightSlot
          ) : (
            <>
              <button
                onClick={() => setZh(!zh)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                🌐 {zh ? 'EN' : '中文'}
              </button>
              <Link href="/vault">
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0d1117] shadow-md transition-all duration-200 active:scale-95">
                  <Zap size={14} />
                  {zh ? '进入应用' : 'Launch App'}
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
