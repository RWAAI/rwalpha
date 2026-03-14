import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line, ReferenceLine } from 'recharts';
import { Wallet, TrendingUp, Calendar, AlertTriangle, ShieldCheck, DollarSign, ArrowRight, Zap, Layers, RefreshCw, Sun, Moon, BrainCircuit, SlidersHorizontal, Activity, Eye, Cpu, CheckCircle2 } from 'lucide-react';

const App = () => {
  // 深色主题切换
  const [dark, setDark] = useState(false);

  // 模拟数据源 (截至2026年3月14日市场参考)
  const portfolioData = [
    { name: 'NVDY', weight: 0.1877, aum: '13.9亿', yield: 73.1, totalReturn: 35.4, volume: '7,800万', type: 'High Yield', freq: 'Weekly',    aiAdjust: -2.3 },
    { name: 'QQQI', weight: 0.3015, aum: '91.8亿',  yield: 14.3, totalReturn: 17.8, volume: '1,200万', type: 'Balanced',  freq: 'Monthly',   aiAdjust: +1.5 },
    { name: 'QQQM', weight: 0.3108, aum: '712.5亿',  yield: 0.5,  totalReturn: 25.2, volume: '12.7亿', type: 'Growth',    freq: 'Quarterly', aiAdjust: +0.8 },
    { name: 'VGT',  weight: 0.2000, aum: '1105.2亿', yield: 0.4,  totalReturn: 22.0, volume: '3.7亿',  type: 'Growth',    freq: 'Quarterly', aiAdjust: 0.0 },
  ];

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1'];

  // 模拟本金状态（可编辑）
  const [principalInput, setPrincipalInput] = useState('100000');
  const principal = parseFloat(principalInput.replace(/,/g, '')) || 0;

  // 计算组合指标
  const metrics = useMemo(() => {
    const totalYield = portfolioData.reduce((acc, curr) => acc + (curr.weight * curr.yield), 0);
    const totalReturn = portfolioData.reduce((acc, curr) => acc + (curr.weight * curr.totalReturn), 0);
    const nvdyWeekly = (principal * 0.20 * (73.1 / 100)) / 52;
    const qqqiMonthly = (principal * 0.30 * (14.3 / 100)) / 12;
    return {
      yield: totalYield.toFixed(2),
      return: totalReturn.toFixed(2),
      nvdyWeekly: nvdyWeekly.toFixed(0),
      qqqiMonthly: qqqiMonthly.toFixed(0),
      totalMonthly: (nvdyWeekly * 4 + qqqiMonthly * 1).toFixed(0),
      totalWeekly: ((nvdyWeekly * 4 + qqqiMonthly * 1) / 4).toFixed(0)
    };
  }, [principal]);

  const weeklySchedule = [
    { week: '第 1 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 2 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 3 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 4 周', amount: parseInt(metrics.nvdyWeekly) + parseInt(metrics.qqqiMonthly), desc: 'NVDY + QQQI 派息' },
  ];

  // 主题 token
  const t = {
    page:       dark ? 'bg-[#0a0a0f]'          : 'bg-slate-50',
     card:       dark ? 'bg-[#13131a] border-white/20' : 'bg-white border-slate-200',
    cardHover:  dark ? 'hover:bg-white/5'        : 'hover:bg-slate-50/50',
    title:      dark ? 'text-white'              : 'text-slate-900',
    sub:        dark ? 'text-slate-400'          : 'text-slate-500',
    muted:      dark ? 'text-slate-500'          : 'text-slate-400',
    divider:    dark ? 'border-white/15'         : 'border-slate-100',
    infoRow:    dark ? 'bg-white/5'              : 'bg-slate-50',
    gridStroke: dark ? '#1e1e2e'                 : '#f1f5f9',
    axisColor:  dark ? '#555'                    : '#94a3b8',
    tooltipBg:  dark ? 'bg-[#1e1e2e] border-white/10' : 'bg-slate-900 border-slate-700',
    // selling point cards
    sp: [
      { bg: dark ? 'bg-amber-950/40 border-amber-800/30'   : 'bg-amber-50 border-amber-100' },
      { bg: dark ? 'bg-indigo-950/40 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100' },
      { bg: dark ? 'bg-green-950/40 border-green-800/30'   : 'bg-green-50 border-green-100' },
      { bg: dark ? 'bg-blue-950/40 border-blue-800/30'     : 'bg-blue-50 border-blue-100' },
      { bg: dark ? 'bg-violet-950/40 border-violet-800/30' : 'bg-violet-50 border-violet-100' },
      { bg: dark ? 'bg-rose-950/40 border-rose-800/30'     : 'bg-rose-50 border-rose-100' },
    ],
    // footnote cards
    fn1: dark ? 'bg-amber-950/40 border-amber-800/30'   : 'bg-amber-50 border-amber-100',
    fn2: dark ? 'bg-indigo-950/40 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100',
    fn1text: dark ? 'text-amber-300'   : 'text-amber-800',
    fn2text: dark ? 'text-indigo-300'  : 'text-indigo-800',
    // table head
    thead: dark ? 'text-slate-500' : 'text-slate-400',
    tbody: dark ? 'text-slate-200' : 'text-sm',
  };

  const sellingPoints = [
    { icon: <Zap size={18} className="text-amber-500" />,          bg: t.sp[0].bg, title: '每周派息',     desc: 'NVDY 每周到账，现金流稳定不间断' },
    { icon: <Layers size={18} className="text-indigo-500" />,       bg: t.sp[1].bg, title: '指数底仓',     desc: '50% QQQM+VGT 底仓保留核心资产上涨潜力' },
    { icon: <BrainCircuit size={18} className="text-violet-500" />, bg: t.sp[4].bg, title: 'AI 驱动调仓', desc: 'AI 实时监控市场，自动优化仓位与再分配' },
    { icon: <TrendingUp size={18} className="text-green-500" />,    bg: t.sp[2].bg, title: '稳健增长',     desc: '派息 + NAV 双轨驱动，复利加速资产增长' },
  ];

  return (
    <div className={`min-h-screen ${t.page} p-4 md:p-8 font-sans transition-colors duration-300`}>
      {/* 右下角悬浮主题切换按钮 */}
      <button
        onClick={() => setDark(!dark)}
        title={dark ? '切换到浅色模式' : '切换到深色模式'}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-bold transition-all duration-200 active:scale-95 ${
          dark
            ? 'bg-[#1e1e2e] border-white/15 text-slate-200 hover:bg-white/10 shadow-black/40'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-slate-200'
        }`}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        {dark ? '浅色模式' : '深色模式'}
      </button>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center ${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-bold ${t.title}`}>RA 指数+卫星周盈计划</h1>
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">Active</span>
            </div>
            <p className={`${t.sub} mt-1`}>20% NVDY + 30% QQQI + 50% 指数增强底仓</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              <span className={`text-sm ${t.muted} font-medium`}>模拟本金 (Principal)</span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {[50000, 100000, 500000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPrincipalInput(preset.toLocaleString())}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors duration-150 ${
                      principal === preset
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : dark
                          ? 'bg-white/5 text-slate-400 border-white/10 hover:border-indigo-400 hover:text-indigo-400'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {preset >= 10000 ? `${preset / 10000}万` : preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xl font-mono font-bold ${t.muted}`}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={principalInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPrincipalInput(raw);
                  }}
                  onBlur={(e) => {
                    const num = parseFloat(e.target.value.replace(/,/g, ''));
                    if (!isNaN(num) && num > 0) setPrincipalInput(num.toLocaleString());
                    else setPrincipalInput('0');
                  }}
                  onFocus={(e) => {
                    setPrincipalInput(e.target.value.replace(/,/g, ''));
                    setTimeout(() => e.target.select(), 0);
                  }}
                  className={`text-xl font-mono font-bold bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 outline-none text-right w-36 transition-colors duration-150 ${t.title}`}
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selling Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sellingPoints.map((item) => (
            <div key={item.title} className={`flex items-start gap-3 p-4 rounded-2xl border ${item.bg} transition-colors duration-300`}>
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div>
                <p className={`text-sm font-bold ${t.title}`}>{item.title}</p>
                <p className={`text-[11px] ${t.sub} mt-0.5 leading-relaxed`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20} /></div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">年度派息率</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.yield}%</p>
              <p className="text-blue-100 text-xs mt-1">目标: 18.00% | 超额: +{(parseFloat(metrics.yield)-18).toFixed(2)}%</p>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex justify-between items-start">
              <div className={`p-2 ${dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600'} rounded-lg`}><DollarSign size={20} /></div>
              <span className={`text-xs font-medium ${t.muted}`}>平均每周到账</span>
            </div>
            <div className="mt-4">
              <p className={`text-3xl font-bold ${t.title}`}>${parseInt(metrics.totalWeekly).toLocaleString()}</p>
              <p className={`${t.sub} text-xs mt-1`}>预计年收息: ${(parseInt(metrics.totalWeekly) * 52).toLocaleString()}</p>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex justify-between items-start">
              <div className={`p-2 ${dark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} rounded-lg`}><TrendingUp size={20} /></div>
              <span className={`text-xs font-medium ${t.muted}`}>年化总回报</span>
            </div>
            <div className="mt-4">
              <p className={`text-3xl font-bold ${t.title}`}>{metrics.return}%</p>
              <p className="text-green-500 text-sm font-bold mt-0.5">+${(principal * parseFloat(metrics.return) / 100).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className={`${t.sub} text-xs mt-1`}>包含 NAV 增长 + 现金派息</p>
            </div>
          </div>
        </div>

        {/* Weekly Cash Flow + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold ${t.title} flex items-center gap-2`}>
                <Calendar size={18} className="text-indigo-500" />
                现金流周历 (月度模拟)
              </h3>
              <div className="flex gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> <span className={t.sub}>NVDY</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded-full"></div> <span className={t.sub}>QQQI</span></div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySchedule}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridStroke} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: t.axisColor, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip
                    cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`${t.tooltipBg} text-white p-3 rounded-xl shadow-xl border`}>
                            <p className="text-xs opacity-70">{payload[0].payload.week}</p>
                            <p className="text-lg font-bold">${Number(payload[0].value).toLocaleString()}</p>
                            <p className="text-[10px] text-indigo-300 mt-1">{payload[0].payload.desc}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {weeklySchedule.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`mt-4 p-4 ${t.infoRow} rounded-2xl flex justify-between items-center transition-colors duration-300`}>
              <span className={`text-sm ${t.sub}`}>前三周仅 NVDY，第四周叠加 QQQI。</span>
              <div className="flex items-center text-indigo-500 font-bold text-sm">
                波动率: 低 <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${t.title}`}>资产配比 (NAV)</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-violet-900/50 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>AI 调仓后</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="weight">
                    {portfolioData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={dark ? { backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' } : undefined}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* AI 调仓列表 */}
            <div className="space-y-2 mt-2">
              {portfolioData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className={`text-xs font-bold ${t.title} w-10`}>{item.name}</span>
                  <div className={`flex-1 h-1 rounded-full ${dark ? 'bg-white/8' : 'bg-slate-100'}`}>
                    <div className="h-full rounded-full" style={{ width: `${item.weight * 100}%`, backgroundColor: COLORS[index] }}></div>
                  </div>
                  <span className={`text-xs ${t.muted} w-10 text-right`}>{(item.weight * 100).toFixed(2)}%</span>
                  {item.aiAdjust === 0 ? (
                    <span className={`text-[11px] font-mono w-14 text-right ${t.muted}`}>— 0.00%</span>
                  ) : (
                    <span className={`text-[11px] font-bold font-mono w-14 text-right ${
                      item.aiAdjust > 0 ? 'text-green-500' : 'text-red-400'
                    }`}>
                      {item.aiAdjust > 0 ? '▲' : '▼'} {Math.abs(item.aiAdjust).toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className={`${t.card} rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300`}>
          <div className={`px-6 py-4 border-b ${t.divider} flex justify-between items-center`}>
            <h2 className={`font-bold ${t.title}`}>资产清单与派息频率</h2>
            <span className={`text-xs ${t.muted}`}>数据最后更新: 2026-03-14</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] ${t.thead} font-bold uppercase tracking-wider border-b ${t.divider}`}>
                  <th className="px-6 py-4">代码</th>
                  <th className="px-6 py-4">AUM（美元）</th>
                  <th className="px-6 py-4">派息率</th>
                  <th className="px-6 py-4">总回报</th>
                  <th className="px-6 py-4">频率</th>
                  <th className="px-6 py-4">周到账 (预计)</th>
                  <th className="px-6 py-4">本周 AI 调仓</th>
                </tr>
              </thead>
              <tbody className={`text-sm divide-y ${t.divider}`}>
                {portfolioData.map((item) => (
                  <tr key={item.name} className={`${t.cardHover} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${t.title}`}>{item.name}</div>
                      <div className={`text-[10px] ${t.muted}`}>{(item.weight * 100).toFixed(2)}% 权重</div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-mono ${t.sub}`}>{item.aum}</td>
                    <td className="px-6 py-4 text-indigo-400 font-bold">{item.yield}%</td>
                    <td className="px-6 py-4 text-green-500 font-medium">+{item.totalReturn}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.freq === 'Weekly'
                          ? dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
                          : item.freq === 'Monthly'
                            ? dark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : dark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.freq}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-mono ${t.sub}`}>
                      {item.freq === 'Weekly' ? `$${parseInt(metrics.nvdyWeekly).toLocaleString()}` :
                       item.freq === 'Monthly' ? `$${parseInt(metrics.qqqiMonthly).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {item.aiAdjust === 0 ? (
                        <span className={`text-xs font-mono ${t.muted}`}>— 0.00%</span>
                      ) : (
                        <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                          item.aiAdjust > 0 ? 'text-green-500' : 'text-red-400'
                        }`}>
                          {item.aiAdjust > 0 ? '▲' : '▼'}
                          {Math.abs(item.aiAdjust).toFixed(2)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== AI 强化区域 ===== */}

        {/* Row 1: AI 信号面板 + 调仓日志 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI 市场信号 */}
          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-5">
              <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
                <Activity size={16} className="text-violet-500" />
              </div>
              <h3 className={`font-bold ${t.title}`}>AI 市场信号</h3>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>实时监控中</span>
            </div>
            <div className="space-y-3">
              {[
                { label: '市场情绪', value: '谨慎偏多', color: 'text-amber-500', dot: 'bg-amber-400', bar: 65 },
                { label: 'NVDY 波动风险', value: '中等', color: 'text-orange-500', dot: 'bg-orange-400', bar: 48 },
                { label: '期权溢价水平', value: '偏高', color: 'text-green-500', dot: 'bg-green-400', bar: 72 },
                { label: '建议调仓方向', value: '维持当前配比', color: 'text-blue-400', dot: 'bg-blue-400', bar: 100 },
              ].map((sig) => (
                <div key={sig.label} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sig.dot}`}></div>
                  <span className={`text-xs ${t.sub} w-28 shrink-0`}>{sig.label}</span>
                  <div className={`flex-1 h-1.5 rounded-full ${dark ? 'bg-white/8' : 'bg-slate-100'}`}>
                    <div className={`h-full rounded-full ${sig.dot}`} style={{ width: `${sig.bar}%` }}></div>
                  </div>
                  <span className={`text-xs font-bold ${sig.color} w-20 text-right`}>{sig.value}</span>
                </div>
              ))}
            </div>
            <p className={`text-[10px] ${t.muted} mt-4`}>信号更新于 2026-03-14 22:00 · 下次更新 23:00</p>
          </div>

          {/* AI 调仓日志 */}
          <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-5">
              <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
                <Cpu size={16} className="text-violet-500" />
              </div>
              <h3 className={`font-bold ${t.title}`}>AI 调仓日志</h3>
            </div>
            <div className="space-y-3">
              {[
                { date: '2026-03-10', icon: '⚖️', action: 'NVDY 波动率上升，权重 22% → 18%，差额补入 QQQM', tag: '调仓', tagColor: dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700' },
                { date: '2026-03-07', icon: '💰', action: '本周派息 $283，AI 自动将 60% 再投入 QQQI', tag: '再投资', tagColor: dark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700' },
                { date: '2026-03-03', icon: '📊', action: '期权溢价回升至历史均值 +1σ，NVDY 权重恢复至 20%', tag: '调仓', tagColor: dark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700' },
                { date: '2026-02-24', icon: '🛡️', action: '市场波动加剧，临时将 VGT 权重上调 2%，增强防御', tag: '风控', tagColor: dark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700' },
              ].map((log) => (
                <div key={log.date} className={`flex gap-3 p-3 rounded-xl ${dark ? 'bg-white/4' : 'bg-slate-50'}`}>
                  <span className="text-base shrink-0 mt-0.5">{log.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] ${t.muted}`}>{log.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${log.tagColor}`}>{log.tag}</span>
                    </div>
                    <p className={`text-xs ${t.sub} leading-relaxed`}>{log.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: AI 工作流程 */}
        <div className={`${t.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-1.5 rounded-lg ${dark ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
              <Eye size={16} className="text-violet-500" />
            </div>
            <h3 className={`font-bold ${t.title}`}>AI 如何工作</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                icon: <Eye size={20} className="text-violet-400" />,
                title: '实时监控',
                desc: '持续追踪 NVDY 波动率、期权溢价、市场情绪指数及各资产相关性变化',
                items: ['NVDY IV 波动率', '期权溢价 / 折价', '市场情绪指数'],
              },
              {
                step: '02',
                icon: <BrainCircuit size={20} className="text-violet-400" />,
                title: '智能判断',
                desc: '当关键指标偏离阈值时触发调仓信号，结合历史数据评估最优配比',
                items: ['波动率超阈值触发', '派息率偏离均值', '相关性异常检测'],
              },
              {
                step: '03',
                icon: <CheckCircle2 size={20} className="text-violet-400" />,
                title: '自动执行',
                desc: '在风控框架内自动调整各资产权重，并将派息收益按策略再分配',
                items: ['仓位自动再平衡', '派息智能再投资', '风控边界强制执行'],
              },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div className={`hidden md:block absolute top-8 left-full w-full h-px ${dark ? 'bg-violet-800/40' : 'bg-violet-200'} z-0`} style={{width:'calc(100% - 2rem)', left:'calc(100% - 0.5rem)'}}></div>
                )}
                <div className={`relative z-10 p-4 rounded-2xl border ${dark ? 'bg-violet-950/30 border-violet-800/30' : 'bg-violet-50 border-violet-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? 'bg-violet-900/60' : 'bg-violet-100'}`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className={`text-[10px] font-bold ${dark ? 'text-violet-500' : 'text-violet-400'}`}>STEP {step.step}</div>
                      <div className={`text-sm font-bold ${t.title}`}>{step.title}</div>
                    </div>
                  </div>
                  <p className={`text-xs ${t.sub} leading-relaxed mb-3`}>{step.desc}</p>
                  <div className="space-y-1">
                    {step.items.map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-violet-400 shrink-0"></div>
                        <span className={`text-[11px] ${t.muted}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="flex gap-4">
          <div className={`flex-1 ${t.fn1} p-4 rounded-2xl border flex items-start gap-3 transition-colors duration-300`}>
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className={`text-xs ${t.fn1text} leading-relaxed`}>
              <strong>提示：</strong> 本测算基于历史派息水平。NVDY 属于备兑期权 ETF，其分红受英伟达股价波动影响较大，金额并非固定。建议将多出的现金流用于再投资以抵御潜在净值侵蚀。
            </p>
          </div>
          <div className={`flex-1 ${t.fn2} p-4 rounded-2xl border flex items-start gap-3 transition-colors duration-300`}>
            <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={18} />
            <p className={`text-xs ${t.fn2text} leading-relaxed`}>
              <strong>风控：</strong> 50% 底仓（QQQM+VGT）不参与期权卖出，保留了核心资产的上涨潜力，使组合更具韧性。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
