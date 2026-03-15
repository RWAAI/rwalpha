/**
 * 我的资产页面
 * 展示 rINDEX 持仓数量、累计收益统计、历史派息记录
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  TrendingUp, Wallet, Clock, ArrowLeft, ChevronRight,
  ArrowUpRight, Download, RefreshCw, Info
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

// ─── 静态模拟数据 ────────────────────────────────────────────────────────────

const MOCK_USER = { name: 'Alex Chen', avatar: 'AC' };

const MOCK_HOLDINGS = {
  rINDEX: 1250.00,
  nav: 129.72,
  costBasis: 118.50,       // 平均成本价
  purchaseDate: '2025-06-15',
};

// 历史派息记录（模拟 26 周 ≈ 半年）
const MOCK_DIVIDENDS = [
  { date: '2026-03-07', perToken: 0.502, total: 627.50, cumulative: 8240.00 },
  { date: '2026-02-28', perToken: 0.521, total: 651.25, cumulative: 7612.50 },
  { date: '2026-02-21', perToken: 0.627, total: 783.75, cumulative: 6961.25 },
  { date: '2026-02-14', perToken: 0.602, total: 752.50, cumulative: 6177.50 },
  { date: '2026-02-07', perToken: 0.575, total: 718.75, cumulative: 5425.00 },
  { date: '2026-01-31', perToken: 0.557, total: 696.25, cumulative: 4706.25 },
  { date: '2026-01-24', perToken: 0.585, total: 731.25, cumulative: 4010.00 },
  { date: '2026-01-17', perToken: 0.551, total: 688.75, cumulative: 3278.75 },
  { date: '2026-01-10', perToken: 0.570, total: 712.50, cumulative: 2590.00 },
  { date: '2026-01-03', perToken: 0.525, total: 656.25, cumulative: 1877.50 },
  { date: '2025-12-27', perToken: 0.498, total: 622.50, cumulative: 1221.25 },
  { date: '2025-12-20', perToken: 0.479, total: 598.75, cumulative: 598.75 },
];

// NAV 走势（近6个月，每两周一点）
const NAV_TREND = [
  { label: 'Sep', value: 118.50 },
  { label: 'Oct', value: 120.80 },
  { label: 'Nov', value: 122.40 },
  { label: 'Dec', value: 124.10 },
  { label: 'Jan', value: 126.90 },
  { label: 'Feb', value: 128.30 },
  { label: 'Mar', value: 129.72 },
];

// ─── 迷你折线图 ──────────────────────────────────────────────────────────────

function MiniLineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 400, H = 80;
  const pad = { top: 8, bottom: 24, left: 8, right: 8 };
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const px = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const py = (v: number) => pad.top + (1 - (v - minV) / range) * (H - pad.top - pad.bottom);
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.value)}`).join(' ');
  const areaD = pathD + ` L ${px(data.length - 1)} ${H - pad.bottom} L ${px(0)} ${H - pad.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#navGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 最后一个点 */}
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1].value)} r="3.5" fill="#6366f1" />
      {/* X 轴标签 */}
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── 派息柱状图 ──────────────────────────────────────────────────────────────

function DividendBarChart({ data }: { data: { date: string; total: number }[] }) {
  const reversed = [...data].reverse();
  const maxVal = Math.max(...reversed.map(d => d.total));
  return (
    <div className="flex items-end gap-1.5 h-16 w-full">
      {reversed.map((d, i) => {
        const height = Math.max(8, (d.total / maxVal) * 56);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-sm bg-amber-400 group-hover:bg-amber-500 transition-colors cursor-pointer"
              style={{ height }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              ${d.total.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function MyAssets() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [, navigate] = useLocation();
  const zh = lang === 'zh';

  const { rINDEX, nav, costBasis, purchaseDate } = MOCK_HOLDINGS;
  const currentValue = rINDEX * nav;
  const costValue = rINDEX * costBasis;
  const unrealizedGain = currentValue - costValue;
  const unrealizedPct = ((nav - costBasis) / costBasis * 100);
  const totalClaimed = MOCK_DIVIDENDS[0].cumulative;
  const totalReturn = unrealizedGain + totalClaimed;
  const totalReturnPct = (totalReturn / costValue * 100);
  const latestDiv = MOCK_DIVIDENDS[0];
  const annualYield = (latestDiv.perToken * 52 / nav * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── 顶部导航 ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* 左侧：返回 + 标题 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/vault')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              {zh ? '返回金库' : 'Back to Vault'}
            </button>
            <span className="text-slate-200">|</span>
            <h1 className="text-sm font-semibold text-slate-800">
              {zh ? '我的资产' : 'My Assets'}
            </h1>
          </div>
          {/* 右侧：用户 + 语言 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(zh ? 'en' : 'zh')}
              className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2 py-1 transition-colors"
            >
              🌐 {zh ? 'EN' : '中文'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {MOCK_USER.avatar}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{MOCK_USER.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Section 1：持仓概览卡片 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* 主持仓卡 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">R</div>
                  <span className="text-base font-bold text-slate-900">rINDEX</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                    {zh ? '本金金库' : 'Principal Vault'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{zh ? `持仓自 ${purchaseDate}` : `Held since ${purchaseDate}`}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* 持仓数量 + 当前价值 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{zh ? 'rINDEX 持仓' : 'rINDEX Holdings'}</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {rINDEX.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-slate-400 ml-1">rINDEX</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{zh ? '当前市值' : 'Current Value'}</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* 成本 / NAV / 未实现盈亏 */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{zh ? '平均成本' : 'Avg. Cost'}</p>
                <p className="text-sm font-semibold text-slate-700">${costBasis.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">rINDEX NAV</p>
                <p className="text-sm font-semibold text-slate-700">${nav.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">{zh ? '未实现盈亏' : 'Unrealized P&L'}</p>
                <p className={`text-sm font-semibold ${unrealizedGain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {unrealizedGain >= 0 ? '+' : ''}${unrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-xs ml-1">({unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(2)}%)</span>
                </p>
              </div>
            </div>

            {/* NAV 走势迷你图 */}
            <div className="mt-4">
              <p className="text-xs text-slate-400 mb-2">{zh ? 'NAV 走势（近 6 个月）' : 'NAV Trend (6M)'}</p>
              <MiniLineChart data={NAV_TREND} />
            </div>
          </div>

          {/* 右侧收益统计卡 */}
          <div className="flex flex-col gap-4">
            {/* 年化派息率 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex-1">
              <p className="text-xs text-amber-600 font-medium mb-1">{zh ? '年度股息收益率' : 'Annual Dividend Yield'}</p>
              <p className="text-3xl font-bold text-amber-500 tabular-nums">~{annualYield.toFixed(2)}%</p>
              <p className="text-xs text-amber-400 mt-1">{zh ? '基于最新每周派息 × 52' : 'Based on latest weekly div × 52'}</p>
              <div className="mt-3 pt-3 border-t border-amber-100">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-500">{zh ? '每 rINDEX 本周派息' : 'This week per token'}</span>
                  <span className="font-semibold text-amber-700">${latestDiv.perToken.toFixed(3)} USDT</span>
                </div>
              </div>
            </div>

            {/* 总回报 */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 flex-1">
              <p className="text-xs text-indigo-500 font-medium mb-1">{zh ? '总回报（含派息）' : 'Total Return (incl. div)'}</p>
              <p className="text-2xl font-bold text-indigo-600 tabular-nums">
                +{totalReturnPct.toFixed(2)}%
              </p>
              <p className="text-xs text-indigo-400 mt-1">+${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <div className="mt-3 pt-3 border-t border-indigo-100 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-400">{zh ? '资本增值' : 'Capital Gain'}</span>
                  <span className="font-medium text-indigo-600">+${unrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-400">{zh ? '累计已领派息' : 'Total Claimed'}</span>
                  <span className="font-medium text-indigo-600">+${totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2：收益统计概览条 ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">{zh ? '收益统计' : 'Earnings Summary'}</h2>
            <Link href="/vault">
              <button className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors font-medium">
                {zh ? '前往领取' : 'Claim Now'} <ChevronRight size={13} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: zh ? '累计已领' : 'Total Claimed',
                value: `$${totalClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                sub: zh ? '自持仓以来' : 'Since inception',
                color: 'text-emerald-600',
              },
              {
                label: zh ? '本周可领' : 'This Week',
                value: `$${latestDiv.total.toFixed(2)}`,
                sub: zh ? '待领取' : 'Pending',
                color: 'text-amber-500',
              },
              {
                label: zh ? '平均每周' : 'Avg. Weekly',
                value: `$${(totalClaimed / MOCK_DIVIDENDS.length).toFixed(2)}`,
                sub: zh ? '近 12 周均值' : '12-week avg.',
                color: 'text-indigo-500',
              },
              {
                label: zh ? '年化收益估算' : 'Est. Annual',
                value: `$${(latestDiv.perToken * 52 * rINDEX).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                sub: zh ? '按当前派息率' : 'At current rate',
                color: 'text-violet-500',
              },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[11px] text-slate-400 mb-1">{item.label}</p>
                <p className={`text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* 派息柱状图 */}
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">{zh ? '近 12 周派息走势' : 'Last 12 Weeks Dividends'}</p>
            <DividendBarChart data={MOCK_DIVIDENDS.map(d => ({ date: d.date, total: d.total }))} />
          </div>
        </div>

        {/* ── Section 3：历史派息记录表 ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">{zh ? '历史派息记录' : 'Dividend History'}</h2>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
              <Download size={12} />
              {zh ? '导出 CSV' : 'Export CSV'}
            </button>
          </div>

          {/* 表头 */}
          <div className="grid grid-cols-4 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            <span>{zh ? '派息日期' : 'Date'}</span>
            <span className="text-right">{zh ? '每 rINDEX 派息' : 'Per Token'}</span>
            <span className="text-right">{zh ? '本次到账' : 'Amount'}</span>
            <span className="text-right">{zh ? '累计已领' : 'Cumulative'}</span>
          </div>

          {/* 记录列表 */}
          <div className="divide-y divide-slate-50">
            {MOCK_DIVIDENDS.map((d, i) => {
              const isLatest = i === 0;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-4 px-5 py-3 text-sm items-center transition-colors hover:bg-slate-50 ${isLatest ? 'bg-amber-50/40' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-medium tabular-nums">{d.date}</span>
                    {isLatest && (
                      <span className="text-[10px] bg-amber-100 text-amber-600 rounded-full px-1.5 py-0.5 font-semibold">
                        {zh ? '最新' : 'Latest'}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 tabular-nums font-medium">${d.perToken.toFixed(3)}</span>
                    <span className="text-slate-400 text-xs ml-1">USDT</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 font-semibold tabular-nums">+${d.total.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 tabular-nums">${d.cumulative.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <Info size={12} className="text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-400">
              {zh
                ? '显示近 12 周派息记录（NVDY 每周派息）。历史数据仅供参考，实际派息以链上记录为准。'
                : 'Showing last 12 weeks of NVDY weekly dividends. Historical data is for reference only.'}
            </p>
          </div>
        </div>

        {/* ── 快捷操作 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/vault">
            <button className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Wallet size={16} className="text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">{zh ? '认购 / 赎回 rINDEX' : 'Buy / Redeem rINDEX'}</p>
                  <p className="text-xs text-slate-400">{zh ? '前往金库操作' : 'Go to Vault'}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </button>
          </Link>
          <Link href="/vault">
            <button className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp size={16} className="text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">{zh ? '立即领取派息' : 'Claim Dividends'}</p>
                  <p className="text-xs text-slate-400">{zh ? `可领 $${latestDiv.total.toFixed(2)} USDT` : `$${latestDiv.total.toFixed(2)} USDT available`}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
            </button>
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
}
