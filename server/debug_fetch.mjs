import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tickers = ['NVDY', 'QQQI', 'QQQM', 'VGT', 'AMZY'];
const scriptPath = path.join(__dirname, 'get_ticker_info.py');
const cleanEnv = { ...process.env };
delete cleanEnv.PYTHONPATH;
delete cleanEnv.PYTHONHOME;
delete cleanEnv.NUITKA_PYTHONPATH;
const python3Bin = '/opt/.manus/.sandbox-runtime/.venv/bin/python3';
const output = execSync(`${python3Bin} ${scriptPath} ${tickers.join(' ')}`, { timeout: 30000, env: cleanEnv }).toString().trim();
const parsed = JSON.parse(output);
for (const [k, v] of Object.entries(parsed)) {
  console.log(k, '-> oneYearReturn:', v.oneYearReturn, 'annualVolatility:', v.annualVolatility, 'aum:', v.aumDisplay);
}
