#!/usr/bin/env python3
"""
获取 ETF/股票数据，优先使用 TradingView Scanner API
- 派息率、1年价格表现、波动率 → TradingView Scanner
- AUM → yfinance (fallback to N/A)
- 描述 → yfinance (fallback to empty)

用法: python3 get_ticker_info.py NVDY QQQI QQQM VGT GLDI MLPI GLD
输出: JSON 格式 { TICKER: { aum, aumDisplay, description, oneYearReturn, annualVolatility } }
"""
import sys
import json
import math
import requests

TV_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Origin": "https://www.tradingview.com",
    "Referer": "https://www.tradingview.com/",
    "Content-Type": "application/json",
}
TV_SCAN_URL = "https://scanner.tradingview.com/america/scan"


def format_aum(aum):
    if not aum:
        return "N/A"
    if aum >= 1e12:
        return f"${aum/1e12:.2f}T"
    elif aum >= 1e9:
        return f"${aum/1e9:.2f}B"
    elif aum >= 1e6:
        return f"${aum/1e6:.0f}M"
    return f"${aum:,.0f}"


def first_sentence(text):
    if not text:
        return ""
    idx = text.find(".")
    return text[: idx + 1] if idx > 0 else text[:150]


def fetch_tradingview_data(tickers):
    """
    从 TradingView Scanner 批量获取：
    - dividends_yield: TTM 派息率 (%)
    - Perf.Y: 1年价格表现 (%)
    - Volatility.D: 日波动率 (%)
    返回 { TICKER: { dividendYield, perfY, volatilityD } }
    """
    try:
        payload = {
            "filter": [{"left": "name", "operation": "in_range", "right": [t.upper() for t in tickers]}],
            "columns": ["name", "close", "dividends_yield", "Perf.Y", "Volatility.D"],
            "sort": {"sortBy": "name", "sortOrder": "asc"},
            "range": [0, len(tickers) + 5],
        }
        r = requests.post(TV_SCAN_URL, json=payload, headers=TV_HEADERS, timeout=20)
        if r.status_code != 200:
            return {}
        data = r.json()
        result = {}
        for item in data.get("data", []):
            d = item["d"]
            name = d[0]
            # Volatility.D is daily %, annualize: daily_vol * sqrt(252)
            daily_vol = d[4]
            annual_vol = (daily_vol * math.sqrt(252)) if daily_vol is not None else None
            result[name.upper()] = {
                "dividendYield": d[2],   # TTM yield %
                "perfY": d[3],           # 1-year price performance %
                "volatilityD": annual_vol,  # annualized volatility %
            }
        return result
    except Exception as e:
        return {}


def fetch_yfinance_aum_desc(tickers):
    """
    从 yfinance 获取 AUM 和描述（作为 TradingView 的补充）
    返回 { TICKER: { aum, aumDisplay, description } }
    """
    try:
        import yfinance as yf
        result = {}
        for ticker in tickers:
            key = ticker.upper()
            try:
                info = yf.Ticker(ticker).info
                aum_raw = info.get("totalAssets") or info.get("netAssets")
                desc = info.get("longBusinessSummary") or info.get("shortBusinessSummary") or ""
                result[key] = {
                    "aum": aum_raw,
                    "aumDisplay": format_aum(aum_raw),
                    "description": first_sentence(desc),
                }
            except Exception:
                result[key] = {"aum": None, "aumDisplay": "N/A", "description": ""}
        return result
    except Exception:
        return {}


tickers = sys.argv[1:]
if not tickers:
    print("{}")
    sys.exit(0)

# Step 1: TradingView data (primary source)
tv_data = fetch_tradingview_data(tickers)

# Step 2: yfinance AUM + description (supplementary)
yf_data = fetch_yfinance_aum_desc(tickers)

result = {}
for ticker in tickers:
    key = ticker.upper()
    tv = tv_data.get(key, {})
    yf = yf_data.get(key, {})

    # 1-year total return = price performance + dividend yield (approximate)
    perf_y = tv.get("perfY")
    div_yield = tv.get("dividendYield") or 0
    if perf_y is not None:
        # Total return approximation: price return + dividend yield
        one_year_return = round(perf_y + div_yield, 2)
    else:
        one_year_return = None

    annual_vol = tv.get("volatilityD")

    result[key] = {
        "aum": yf.get("aum"),
        "aumDisplay": yf.get("aumDisplay", "N/A"),
        "description": yf.get("description", ""),
        "oneYearReturn": round(one_year_return, 2) if one_year_return is not None else None,
        "annualVolatility": round(annual_vol, 2) if annual_vol is not None else None,
        # Extra TV data for reference
        "_tvDividendYield": tv.get("dividendYield"),
        "_tvPerfY": perf_y,
    }

print(json.dumps(result))
