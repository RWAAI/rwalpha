import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, Calendar, AlertTriangle, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';

const App = () => {
  // 模拟数据源 (截至2026年3月14日市场参考)
  const portfolioData = [
    { name: 'NVDY', weight: 0.20, aum: '14.2亿', yield: 73.1, totalReturn: 35.4, volume: '7,800万', type: 'High Yield', freq: 'Weekly' },
    { name: 'QQQI', weight: 0.30, aum: '9.5亿', yield: 14.3, totalReturn: 17.8, volume: '1,200万', type: 'Balanced', freq: 'Monthly' },
    { name: 'QQQM', weight: 0.30, aum: '710亿', yield: 0.5, totalReturn: 25.2, volume: '12.7亿', type: 'Growth', freq: 'Quarterly' },
    { name: 'VGT', weight: 0.20, aum: '1300亿', yield: 0.4, totalReturn: 22.0, volume: '3.7亿', type: 'Growth', freq: 'Quarterly' },
  ];

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1'];

  // 计算组合指标 (基于 $100,000 本金)
  const principal = 100000;
  const metrics = useMemo(() => {
    const totalYield = portfolioData.reduce((acc, curr) => acc + (curr.weight * curr.yield), 0);
    const totalReturn = portfolioData.reduce((acc, curr) => acc + (curr.weight * curr.totalReturn), 0);
    
    // 每周 NVDY 收益
    const nvdyWeekly = (principal * 0.20 * (73.1 / 100)) / 52;
    // 每月 QQQI 收益
    const qqqiMonthly = (principal * 0.30 * (14.3 / 100)) / 12;

    return {
      yield: totalYield.toFixed(2),
      return: totalReturn.toFixed(2),
      nvdyWeekly: nvdyWeekly.toFixed(0),
      qqqiMonthly: qqqiMonthly.toFixed(0),
      totalMonthly: (nvdyWeekly * 4 + qqqiMonthly * 1).toFixed(0)
    };
  }, []);

  const weeklySchedule = [
    { week: '第 1 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 2 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 3 周', amount: parseInt(metrics.nvdyWeekly), desc: 'NVDY 派息' },
    { week: '第 4 周', amount: parseInt(metrics.nvdyWeekly) + parseInt(metrics.qqqiMonthly), desc: 'NVDY + QQQI 派息' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">RA 指数+卫星周盈计划</h1>
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded font-bold uppercase tracking-wider">Active</span>
            </div>
            <p className="text-slate-500 mt-1">20% NVDY + 30% QQQI + 50% 指数增强底仓</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <span className="text-sm text-slate-400 font-medium">模拟本金 (Principal)</span>
            <span className="text-xl font-mono font-bold text-slate-900">$100,000.00</span>
          </div>
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
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
              <span className="text-xs font-medium text-slate-400">平均月到账</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">${metrics.totalMonthly}</p>
              <p className="text-slate-500 text-xs mt-1">预计年收息: ${(parseInt(metrics.totalMonthly) * 12).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={20} /></div>
              <span className="text-xs font-medium text-slate-400">年化总回报</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{metrics.return}%</p>
              <p className="text-slate-500 text-xs mt-1">包含 NAV 增长 + 现金派息</p>
            </div>
          </div>
        </div>

        {/* Weekly Cash Flow Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                现金流周历 (月度模拟)
              </h3>
              <div className="flex gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> NVDY</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded-full"></div> QQQI</div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySchedule}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700">
                            <p className="text-xs opacity-70">{payload[0].payload.week}</p>
                            <p className="text-lg font-bold">${payload[0].value}</p>
                            <p className="text-[10px] text-indigo-300 mt-1">{payload[0].payload.desc}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {weeklySchedule.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
              <span className="text-sm text-slate-500">前三周仅 NVDY，第四周叠加 QQQI。</span>
              <div className="flex items-center text-indigo-600 font-bold text-sm">
                波动率: 低 <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">资产配比 (NAV)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="weight"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">资产清单与派息频率</h2>
            <span className="text-xs text-slate-400">数据最后更新: 2026-03-14</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">代码</th>
                  <th className="px-6 py-4">派息率</th>
                  <th className="px-6 py-4">总回报</th>
                  <th className="px-6 py-4">频率</th>
                  <th className="px-6 py-4">周到账 (预计)</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {portfolioData.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{(item.weight * 100)}% 权重</div>
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-bold">{item.yield}%</td>
                    <td className="px-6 py-4 text-green-600 font-medium">+{item.totalReturn}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.freq === 'Weekly' ? 'bg-amber-100 text-amber-700' : 
                        item.freq === 'Monthly' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.freq}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {item.freq === 'Weekly' ? `$${metrics.nvdyWeekly}` : 
                       item.freq === 'Monthly' ? `$${metrics.qqqiMonthly}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footnote */}
        <div className="flex gap-4">
          <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>提示：</strong> 本测算基于历史派息水平。NVDY 属于备兑期权 ETF，其分红受英伟达股价波动影响较大，金额并非固定。建议将多出的现金流用于再投资以抵御潜在净值侵蚀。
            </p>
          </div>
          <div className="flex-1 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>风控：</strong> 50% 底仓（QQQM+VGT）不参与期权卖出，保留了核心资产的上涨潜力，使组合更具韧性。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
