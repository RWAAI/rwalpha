import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Zap, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

// ── Language helpers ──────────────────────────────────────────────
function getLang(): boolean {
  try { return localStorage.getItem('rwa-lang') !== 'en'; } catch { return true; }
}
function setLangStorage(zh: boolean) {
  try { localStorage.setItem('rwa-lang', zh ? 'zh' : 'en'); } catch { /* noop */ }
}

// activeTab: 'home' | 'dashboard' | 'vault'
interface NavBarProps {
  activeTab?: 'home' | 'dashboard' | 'vault';
  /** 替换右侧默认「进入应用」按钮区域；不传则显示默认 Launch App */
  rightSlot?: ReactNode;
}

// ── About dropdown ────────────────────────────────────────────────
function AboutDropdown({ zh }: { zh: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = zh
    ? [
        { label: '文档', href: '#' },
        { label: '安全与审计', href: '#' },
        { label: '团队', href: '#' },
      ]
    : [
        { label: 'Docs', href: '#' },
        { label: 'Security & Audit', href: '#' },
        { label: 'Team', href: '#' },
      ];

  const trigger = zh ? '关于' : 'About';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 ${open ? 'bg-slate-100 text-slate-800' : ''}`}
      >
        {trigger}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-50">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-100"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavBar({ activeTab = 'home', rightSlot }: NavBarProps) {
  const [zh, setZhState] = useState(getLang);

  // 监听 localStorage 变化（同页面内其他组件触发）
  useEffect(() => {
    const handler = () => setZhState(getLang());
    window.addEventListener('storage', handler);
    // 同页面内用自定义事件同步
    window.addEventListener('rwa-lang-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('rwa-lang-change', handler);
    };
  }, []);

  const toggleZh = () => {
    const next = !zh;
    setZhState(next);
    setLangStorage(next);
    // 通知同页面其他组件
    window.dispatchEvent(new Event('rwa-lang-change'));
  };

  // tabs（不含「积分」）
  const tabsZh = ['首页', '金库', '如何运作', '洞察'];
  const tabsEn = ['Home', 'Vault', 'How It Works', 'Insights'];
  const tabs = zh ? tabsZh : tabsEn;

  const activeIdx = activeTab === 'home' ? 0 : 1;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* 左侧：Logo + Nav Tabs */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <span
              className="text-xl font-extrabold tracking-tight cursor-pointer bg-gradient-to-r from-indigo-600 to-sky-400 bg-clip-text text-transparent"
              style={{ letterSpacing: '-0.02em' }}
            >
              RWAlpha.ai
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
              if (i === 2) return <Link key={tab} href="/how-it-works"><button className={cls}>{tab}</button></Link>;
              return (
                <button key={tab} className={cls} onClick={() => alert(zh ? '即将上线' : 'Coming soon')}>
                  {tab}
                </button>
              );
            })}

            {/* 关于 下拉 */}
            <AboutDropdown zh={zh} />
          </nav>
        </div>

        {/* 右侧：语言切换 + 自定义插槽或默认 Launch App */}
        <div className="flex items-center gap-2">
          {rightSlot !== undefined ? (
            // 首页传入 rightSlot 时，仍保留语言切换按钮（由首页自己控制），NavBar 不重复渲染
            rightSlot
          ) : (
            <>
              <button
                onClick={toggleZh}
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
