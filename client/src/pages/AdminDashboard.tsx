import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Home,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Upload,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "nav" | "dividend" | "signal" | "rebalance";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-indigo-50 rounded-lg">
        <Icon size={16} className="text-indigo-600" />
      </div>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {count !== undefined && (
        <span className="ml-auto text-xs text-slate-400">{count} 条记录</span>
      )}
    </div>
  );
}

// ─── CSV 解析工具 ─────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const result: string[] = [];
    let inQuote = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  });
}

// ─── CSV 导入面板组件 ─────────────────────────────────────────────────────────
interface CsvImportResult {
  success: boolean;
  count?: number;
  errors: string[];
  preview: Array<Record<string, string>>;
}

function NavCsvImport({ onSuccess }: { onSuccess: () => void }) {
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<Array<{ date: string; navValue: string; totalReturn?: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkMutation = trpc.vault.bulkImportNavHistory.useMutation({
    onSuccess: (data) => {
      setResult({ success: true, count: data.count, errors: [], preview: [] });
      setParsedRows([]);
      setImporting(false);
      onSuccess();
    },
    onError: (err) => {
      setResult({ success: false, errors: [err.message], preview: [] });
      setImporting(false);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setResult({ success: false, errors: ['CSV 至少需要标题行和一行数据'], preview: [] });
        return;
      }
      const header = rows[0].map(h => h.toLowerCase().replace(/\s+/g, ''));
      const dateIdx = header.findIndex(h => h.includes('date') || h === '日期');
      const navIdx = header.findIndex(h => h.includes('nav') || h.includes('navvalue') || h === 'nav值');
      const retIdx = header.findIndex(h => h.includes('return') || h.includes('totalreturn') || h === '总回报');

      if (dateIdx === -1 || navIdx === -1) {
        setResult({ success: false, errors: ['CSV 必须包含 date 和 navValue 列'], preview: [] });
        return;
      }

      const errors: string[] = [];
      const parsed = rows.slice(1).filter(r => r.some(c => c)).map((row, i) => {
        const date = row[dateIdx]?.trim();
        const navValue = row[navIdx]?.trim();
        const totalReturn = retIdx >= 0 ? row[retIdx]?.trim() : undefined;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push(`第 ${i + 2} 行：日期格式错误（需为 YYYY-MM-DD），当前值: "${date}"`);
          return null;
        }
        if (!navValue || isNaN(parseFloat(navValue))) {
          errors.push(`第 ${i + 2} 行：NAV 值无效，当前值: "${navValue}"`);
          return null;
        }
        return { date, navValue, totalReturn: totalReturn && !isNaN(parseFloat(totalReturn)) ? totalReturn : undefined };
      }).filter(Boolean) as Array<{ date: string; navValue: string; totalReturn?: string }>;

      if (errors.length > 0) {
        setResult({ success: false, errors, preview: [] });
        return;
      }
      setParsedRows(parsed);
      setResult({ success: false, errors: [], preview: parsed.slice(0, 5).map(r => ({ date: r.date, navValue: r.navValue, totalReturn: r.totalReturn || '' })) });
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    bulkMutation.mutate(parsedRows);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Upload size={14} className="text-indigo-600" />
        <span className="text-sm font-semibold text-indigo-800">CSV 批量导入 NAV 历史</span>
      </div>

      <div className="text-xs text-slate-500 mb-3 bg-white rounded-lg p-3 border border-slate-100">
        <p className="font-medium text-slate-600 mb-1">CSV 格式要求：</p>
        <p>必须包含列：<code className="bg-slate-100 px-1 rounded">date</code>（YYYY-MM-DD）、<code className="bg-slate-100 px-1 rounded">navValue</code></p>
        <p className="mt-0.5">可选列：<code className="bg-slate-100 px-1 rounded">totalReturn</code>（年化总回报 %）</p>
        <p className="mt-1 text-slate-400">示例：<code className="bg-slate-100 px-1 rounded">date,navValue,totalReturn</code></p>
        <p className="text-slate-400"><code className="bg-slate-100 px-1 rounded">2026-03-14,129.72,29.02</code></p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg bg-white border border-indigo-200 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
          <FileText size={14} />
          选择 CSV 文件
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </label>
        {parsedRows.length > 0 && (
          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {importing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Upload size={14} className="mr-1" />}
            导入 {parsedRows.length} 条记录
          </Button>
        )}
      </div>

      {result && (
        <div className={`mt-3 rounded-lg p-3 text-xs ${result.success ? 'bg-emerald-50 border border-emerald-100' : result.errors.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-100'}`}>
          {result.success ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 size={14} />
              成功导入 {result.count} 条 NAV 记录
            </div>
          ) : result.errors.length > 0 ? (
            <div>
              <div className="flex items-center gap-1.5 text-red-600 font-semibold mb-1">
                <AlertTriangle size={14} />
                解析错误
              </div>
              {result.errors.slice(0, 5).map((e, i) => <p key={i} className="text-red-500">{e}</p>)}
            </div>
          ) : result.preview.length > 0 ? (
            <div>
              <p className="text-slate-600 font-medium mb-1.5">预览（前 {result.preview.length} 条，共 {parsedRows.length} 条）：</p>
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400"><th className="text-left pb-1">日期</th><th className="text-right pb-1">NAV</th><th className="text-right pb-1">总回报</th></tr></thead>
                <tbody>{result.preview.map((r, i) => (
                  <tr key={i}><td className="font-mono">{r.date}</td><td className="text-right">${r.navValue}</td><td className="text-right">{r.totalReturn ? `+${r.totalReturn}%` : '—'}</td></tr>
                ))}</tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DividendCsvImport({ onSuccess }: { onSuccess: () => void }) {
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<Array<{ date: string; ticker: string; amountPerUnit: string; totalAmount?: string; frequency: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkMutation = trpc.vault.bulkImportDividendRecords.useMutation({
    onSuccess: (data) => {
      setResult({ success: true, count: data.count, errors: [], preview: [] });
      setParsedRows([]);
      setImporting(false);
      onSuccess();
    },
    onError: (err) => {
      setResult({ success: false, errors: [err.message], preview: [] });
      setImporting(false);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setResult({ success: false, errors: ['CSV 至少需要标题行和一行数据'], preview: [] });
        return;
      }
      const header = rows[0].map(h => h.toLowerCase().replace(/\s+/g, ''));
      const dateIdx = header.findIndex(h => h.includes('date') || h === '日期');
      const tickerIdx = header.findIndex(h => h.includes('ticker') || h === '代码');
      const amtIdx = header.findIndex(h => h.includes('amountperunit') || h.includes('perunit') || h === '每单位派息');
      const totalIdx = header.findIndex(h => h.includes('totalamount') || h === '总金额');
      const freqIdx = header.findIndex(h => h.includes('frequency') || h === '频率');

      if (dateIdx === -1 || tickerIdx === -1 || amtIdx === -1) {
        setResult({ success: false, errors: ['CSV 必须包含 date、ticker、amountPerUnit 列'], preview: [] });
        return;
      }

      const errors: string[] = [];
      const validTickers = ['NVDY', 'QQQI', 'QQQM', 'VGT'];
      const validFreqs = ['Weekly', 'Monthly', 'Quarterly'];

      const parsed = rows.slice(1).filter(r => r.some(c => c)).map((row, i) => {
        const date = row[dateIdx]?.trim();
        const ticker = row[tickerIdx]?.trim().toUpperCase();
        const amountPerUnit = row[amtIdx]?.trim();
        const totalAmount = totalIdx >= 0 ? row[totalIdx]?.trim() : undefined;
        const frequency = freqIdx >= 0 ? row[freqIdx]?.trim() : 'Weekly';

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push(`第 ${i + 2} 行：日期格式错误（需为 YYYY-MM-DD），当前值: "${date}"`);
          return null;
        }
        if (!ticker || !validTickers.includes(ticker)) {
          errors.push(`第 ${i + 2} 行：代码无效（需为 NVDY/QQQI/QQQM/VGT），当前值: "${ticker}"`);
          return null;
        }
        if (!amountPerUnit || isNaN(parseFloat(amountPerUnit))) {
          errors.push(`第 ${i + 2} 行：每单位派息无效，当前值: "${amountPerUnit}"`);
          return null;
        }
        const freq = frequency && validFreqs.includes(frequency) ? frequency : 'Weekly';
        return {
          date, ticker, amountPerUnit,
          totalAmount: totalAmount && !isNaN(parseFloat(totalAmount)) ? totalAmount : undefined,
          frequency: freq,
        };
      }).filter(Boolean) as Array<{ date: string; ticker: string; amountPerUnit: string; totalAmount?: string; frequency: string }>;

      if (errors.length > 0) {
        setResult({ success: false, errors, preview: [] });
        return;
      }
      setParsedRows(parsed);
      setResult({ success: false, errors: [], preview: parsed.slice(0, 5).map(r => ({ date: r.date, ticker: r.ticker, amountPerUnit: r.amountPerUnit, frequency: r.frequency })) });
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    bulkMutation.mutate(parsedRows);
  };

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Upload size={14} className="text-amber-600" />
        <span className="text-sm font-semibold text-amber-800">CSV 批量导入派息记录</span>
      </div>

      <div className="text-xs text-slate-500 mb-3 bg-white rounded-lg p-3 border border-slate-100">
        <p className="font-medium text-slate-600 mb-1">CSV 格式要求：</p>
        <p>必须包含列：<code className="bg-slate-100 px-1 rounded">date</code>（YYYY-MM-DD）、<code className="bg-slate-100 px-1 rounded">ticker</code>（NVDY/QQQI/QQQM/VGT）、<code className="bg-slate-100 px-1 rounded">amountPerUnit</code></p>
        <p className="mt-0.5">可选列：<code className="bg-slate-100 px-1 rounded">totalAmount</code>、<code className="bg-slate-100 px-1 rounded">frequency</code>（Weekly/Monthly/Quarterly，默认 Weekly）</p>
        <p className="mt-1 text-slate-400">示例：<code className="bg-slate-100 px-1 rounded">date,ticker,amountPerUnit,frequency</code></p>
        <p className="text-slate-400"><code className="bg-slate-100 px-1 rounded">2026-03-14,NVDY,0.502,Weekly</code></p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
          <FileText size={14} />
          选择 CSV 文件
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </label>
        {parsedRows.length > 0 && (
          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {importing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Upload size={14} className="mr-1" />}
            导入 {parsedRows.length} 条记录
          </Button>
        )}
      </div>

      {result && (
        <div className={`mt-3 rounded-lg p-3 text-xs ${result.success ? 'bg-emerald-50 border border-emerald-100' : result.errors.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-100'}`}>
          {result.success ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 size={14} />
              成功导入 {result.count} 条派息记录
            </div>
          ) : result.errors.length > 0 ? (
            <div>
              <div className="flex items-center gap-1.5 text-red-600 font-semibold mb-1">
                <AlertTriangle size={14} />
                解析错误
              </div>
              {result.errors.slice(0, 5).map((e, i) => <p key={i} className="text-red-500">{e}</p>)}
            </div>
          ) : result.preview.length > 0 ? (
            <div>
              <p className="text-slate-600 font-medium mb-1.5">预览（前 {result.preview.length} 条，共 {parsedRows.length} 条）：</p>
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400"><th className="text-left pb-1">日期</th><th className="text-left pb-1">代码</th><th className="text-right pb-1">每单位</th><th className="text-left pb-1">频率</th></tr></thead>
                <tbody>{result.preview.map((r, i) => (
                  <tr key={i}><td className="font-mono">{r.date}</td><td className="font-bold">{r.ticker}</td><td className="text-right">${r.amountPerUnit}</td><td className="pl-2">{r.frequency}</td></tr>
                ))}</tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── NAV History Panel ────────────────────────────────────────────────────────
function NavHistoryPanel() {
  const utils = trpc.useUtils();
  const { data: records = [], isLoading } = trpc.vault.getNavHistory.useQuery({ limit: 30 });
  const addMutation = trpc.vault.addNavHistory.useMutation({
    onSuccess: () => { utils.vault.getNavHistory.invalidate(); setForm({ date: "", navValue: "", totalReturn: "" }); },
  });
  const deleteMutation = trpc.vault.deleteNavHistory.useMutation({
    onSuccess: () => utils.vault.getNavHistory.invalidate(),
  });

  const [form, setForm] = useState({ date: "", navValue: "", totalReturn: "" });
  const [showForm, setShowForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.navValue) return;
    addMutation.mutate({ date: form.date, navValue: form.navValue, totalReturn: form.totalReturn || undefined });
  };

  return (
    <Card>
      <div className="p-5">
        <SectionTitle icon={TrendingUp} title="NAV 历史记录" count={records.length} />

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            <Plus size={14} />
            添加新记录
            {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="flex items-center gap-1.5 text-sm text-indigo-500 font-medium hover:text-indigo-700 transition-colors"
          >
            <Upload size={14} />
            CSV 批量导入
            {showCsvImport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">日期 *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">NAV 值 *</label>
                <input type="number" step="0.0001" placeholder="129.72" value={form.navValue} onChange={e => setForm({ ...form, navValue: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">总回报 % (可选)</label>
                <input type="number" step="0.0001" placeholder="29.02" value={form.totalReturn} onChange={e => setForm({ ...form, totalReturn: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {addMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                保存
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
            {addMutation.isError && <p className="text-xs text-red-500">{addMutation.error.message}</p>}
          </form>
        )}

        {showCsvImport && (
          <NavCsvImport onSuccess={() => {
            utils.vault.getNavHistory.invalidate();
            utils.vault.getSummary.invalidate();
          }} />
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">暂无数据，点击上方添加第一条记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                  <th className="text-left pb-2 pr-4">日期</th>
                  <th className="text-right pb-2 pr-4">NAV 值</th>
                  <th className="text-right pb-2 pr-4">总回报</th>
                  <th className="text-right pb-2">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-slate-600">{r.date}</td>
                    <td className="py-2.5 pr-4 text-right font-bold text-slate-800">${r.navValue}</td>
                    <td className="py-2.5 pr-4 text-right">
                      {r.totalReturn ? <span className="text-emerald-600 font-medium">+{r.totalReturn}%</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => deleteMutation.mutate({ id: r.id })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        disabled={deleteMutation.isPending}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Dividend Records Panel ───────────────────────────────────────────────────
function DividendPanel() {
  const utils = trpc.useUtils();
  const { data: records = [], isLoading } = trpc.vault.getDividendRecords.useQuery({ limit: 30 });
  const addMutation = trpc.vault.addDividendRecord.useMutation({
    onSuccess: () => { utils.vault.getDividendRecords.invalidate(); setForm({ date: "", ticker: "NVDY", amountPerUnit: "", totalAmount: "", frequency: "Weekly" }); },
  });
  const deleteMutation = trpc.vault.deleteDividendRecord.useMutation({
    onSuccess: () => utils.vault.getDividendRecords.invalidate(),
  });

  const [form, setForm] = useState({ date: "", ticker: "NVDY", amountPerUnit: "", totalAmount: "", frequency: "Weekly" });
  const [showForm, setShowForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.amountPerUnit) return;
    addMutation.mutate({ ...form, totalAmount: form.totalAmount || undefined });
  };

  const freqColor = (f: string) =>
    f === "Weekly" ? "bg-amber-100 text-amber-700" :
    f === "Monthly" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600";

  return (
    <Card>
      <div className="p-5">
        <SectionTitle icon={DollarSign} title="派息记录" count={records.length} />

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            <Plus size={14} />添加新记录
            {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <span className="text-slate-200">|</span>
          <button onClick={() => setShowCsvImport(!showCsvImport)}
            className="flex items-center gap-1.5 text-sm text-amber-600 font-medium hover:text-amber-800 transition-colors">
            <Upload size={14} />CSV 批量导入
            {showCsvImport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">日期 *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">代码 *</label>
                <select value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option>NVDY</option><option>QQQI</option><option>QQQM</option><option>VGT</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">每单位派息 *</label>
                <input type="number" step="0.000001" placeholder="0.502" value={form.amountPerUnit} onChange={e => setForm({ ...form, amountPerUnit: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">频率 *</label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option>Weekly</option><option>Monthly</option><option>Quarterly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">总派息金额（可选）</label>
              <input type="number" step="0.01" placeholder="628.03" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full md:w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {addMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}保存
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
            {addMutation.isError && <p className="text-xs text-red-500">{addMutation.error.message}</p>}
          </form>
        )}

        {showCsvImport && (
          <DividendCsvImport onSuccess={() => {
            utils.vault.getDividendRecords.invalidate();
            utils.vault.getSummary.invalidate();
          }} />
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">暂无数据</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-medium border-b border-slate-100">
                  <th className="text-left pb-2 pr-4">日期</th>
                  <th className="text-left pb-2 pr-4">代码</th>
                  <th className="text-right pb-2 pr-4">每单位派息</th>
                  <th className="text-right pb-2 pr-4">总金额</th>
                  <th className="text-left pb-2 pr-4">频率</th>
                  <th className="text-right pb-2">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-slate-600">{r.date}</td>
                    <td className="py-2.5 pr-4 font-bold text-slate-800">{r.ticker}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-indigo-600">${r.amountPerUnit}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-600">{r.totalAmount ? `$${r.totalAmount}` : "—"}</td>
                    <td className="py-2.5 pr-4"><Badge color={freqColor(r.frequency)}>{r.frequency}</Badge></td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => deleteMutation.mutate({ id: r.id })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── AI Signal Panel ──────────────────────────────────────────────────────────
function AiSignalPanel() {
  const utils = trpc.useUtils();
  const { data: signal, isLoading } = trpc.vault.getLatestAiSignal.useQuery();
  const addMutation = trpc.vault.addAiSignal.useMutation({
    onSuccess: () => { utils.vault.getLatestAiSignal.invalidate(); utils.vault.getSummary.invalidate(); setShowForm(false); },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    marketSentiment: "", nvdyVolRisk: "", qqqiPremium: "",
    qqqmVgtMomentum: "", rebalanceSignal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({ signalDate: new Date(), ...form });
  };

  return (
    <Card>
      <div className="p-5">
        <SectionTitle icon={Activity} title="AI 市场信号" />

        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium mb-4 hover:text-indigo-800 transition-colors">
          <RefreshCw size={14} />更新信号
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "marketSentiment", label: "市场情绪", placeholder: "谨慎偏多" },
                { key: "nvdyVolRisk", label: "NVDY 波动风险", placeholder: "中等" },
                { key: "qqqiPremium", label: "QQQI 期权溢价", placeholder: "偏高" },
                { key: "qqqmVgtMomentum", label: "QQQM/VGT 动量", placeholder: "偏强" },
                { key: "rebalanceSignal", label: "建议调仓方向", placeholder: "维持当前配比" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
                  <input value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {addMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}保存信号
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : !signal ? (
          <p className="text-sm text-slate-400 text-center py-6">暂无信号数据，点击上方更新</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-3">
              最后更新：{new Date(signal.signalDate).toLocaleString("zh-CN")}
            </p>
            {[
              { label: "市场情绪", value: signal.marketSentiment },
              { label: "NVDY 波动风险", value: signal.nvdyVolRisk },
              { label: "QQQI 期权溢价", value: signal.qqqiPremium },
              { label: "QQQM/VGT 动量", value: signal.qqqmVgtMomentum },
              { label: "建议调仓方向", value: signal.rebalanceSignal },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Rebalance Log Panel ──────────────────────────────────────────────────────
function RebalanceLogPanel() {
  const utils = trpc.useUtils();
  const { data: logs = [], isLoading } = trpc.vault.getRebalanceLogs.useQuery({ limit: 20 });
  const addMutation = trpc.vault.addRebalanceLog.useMutation({
    onSuccess: () => { utils.vault.getRebalanceLogs.invalidate(); utils.vault.getSummary.invalidate(); setForm({ actionDate: "", icon: "⚖️", action: "", tag: "调仓", tagEn: "Rebalance", actionEn: "" }); },
  });
  const deleteMutation = trpc.vault.deleteRebalanceLog.useMutation({
    onSuccess: () => { utils.vault.getRebalanceLogs.invalidate(); utils.vault.getSummary.invalidate(); },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ actionDate: "", icon: "⚖️", action: "", tag: "调仓", tagEn: "Rebalance", actionEn: "" });

  const tagOptions = [
    { zh: "调仓", en: "Rebalance", icon: "⚖️" },
    { zh: "再投资", en: "Reinvest", icon: "💰" },
    { zh: "风控", en: "Risk Ctrl", icon: "🛡️" },
  ];

  const tagColor = (tag: string) =>
    tag === "调仓" || tag === "Rebalance" ? "bg-amber-100 text-amber-700" :
    tag === "再投资" || tag === "Reinvest" ? "bg-blue-100 text-blue-700" :
    "bg-green-100 text-green-700";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.actionDate || !form.action) return;
    addMutation.mutate({ ...form, actionEn: form.actionEn || undefined });
  };

  return (
    <Card>
      <div className="p-5">
        <SectionTitle icon={BookOpen} title="AI 调仓日志" count={logs.length} />

        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium mb-4 hover:text-indigo-800 transition-colors">
          <Plus size={14} />添加日志
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">日期 *</label>
                <input type="date" value={form.actionDate} onChange={e => setForm({ ...form, actionDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">类型 *</label>
                <select value={form.tag} onChange={e => {
                  const opt = tagOptions.find(o => o.zh === e.target.value);
                  setForm({ ...form, tag: e.target.value, tagEn: opt?.en || "", icon: opt?.icon || "⚖️" });
                }} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  {tagOptions.map(o => <option key={o.zh} value={o.zh}>{o.icon} {o.zh}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">操作描述（中文）*</label>
              <textarea value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}
                placeholder="NVDY 波动率上升，权重从 25% 临时降至 22%..."
                rows={2} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">操作描述（英文，可选）</label>
              <textarea value={form.actionEn} onChange={e => setForm({ ...form, actionEn: e.target.value })}
                placeholder="NVDY vol. spiked; weight trimmed 25% → 22%..."
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {addMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}保存
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">暂无日志</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-lg shrink-0 mt-0.5">{log.icon || "📋"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-slate-400">{log.actionDate}</span>
                    <Badge color={tagColor(log.tag)}>{log.tag}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{log.action}</p>
                </div>
                <button onClick={() => deleteMutation.mutate({ id: log.id })}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("nav");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
            <Zap size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">管理后台</h1>
          <p className="text-sm text-slate-500">请先登录以访问管理后台</p>
          <Button onClick={() => { window.location.href = getLoginUrl(); }} className="bg-indigo-600 hover:bg-indigo-700">
            登录
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "nav", label: "NAV 历史", icon: TrendingUp },
    { id: "dividend", label: "派息记录", icon: DollarSign },
    { id: "signal", label: "AI 信号", icon: Activity },
    { id: "rebalance", label: "调仓日志", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <Home size={16} className="text-slate-500" />
            </button>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-600" />
              <span className="font-semibold text-slate-800 text-sm">管理后台</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{user.name || user.email}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50">
              <LogOut size={13} />退出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Nav */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "nav" && <NavHistoryPanel />}
        {activeTab === "dividend" && <DividendPanel />}
        {activeTab === "signal" && <AiSignalPanel />}
        {activeTab === "rebalance" && <RebalanceLogPanel />}
      </div>
    </div>
  );
}
