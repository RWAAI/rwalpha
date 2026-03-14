import NavBar from '@/components/NavBar';
import { Link } from 'wouter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 共用导航栏，首页 Tab 高亮 */}
      <NavBar activeTab="home" />

      {/* ── Hero 占位区域 ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* 占位徽标 */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ background: '#e0f2fe', color: '#0369a1' }}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse inline-block" />
            即将上线 / Coming Soon
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            RWAlpha <span style={{ color: '#38bdf8' }}>首页</span>
            <br />
            正在建设中
          </h1>

          {/* 副标题 */}
          <p className="text-lg text-slate-500 mb-10">
            首页内容正在设计中，敬请期待。你可以先前往金库页面体验产品。
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/vault">
              <button
                className="px-6 py-3 rounded-xl text-white font-semibold text-base shadow-sm hover:opacity-90 transition-all"
                style={{ background: '#38bdf8' }}
              >
                前往金库应用 →
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded-xl text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 transition-all">
                查看产品详情
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
