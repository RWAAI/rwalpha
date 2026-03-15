#!/usr/bin/env python3
"""
获取 ETF/股票的 AUM、描述、总回报（含股息）和波动率（via yfinance）
用法: python3 get_ticker_info.py NVDY QQQI QQQM VGT
输出: JSON 格式 { TICKER: { aum, aumDisplay, description, oneYearReturn, annualVolatility } }

关键：oneYearReturn 使用 auto_adjust=True（股息调整后）的价格计算，
      这样对于高派息 ETF（NVDY、QQQI 等）才能反映真实总回报。
"""
import sys
import json
import math
import yfinance as yf


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


def calc_returns(ticker_str):
    """
    使用 yfinance 计算：
    - oneYearReturn: 基于 adjusted close（含股息再投资）的 1 年总回报
    - annualVolatility: 基于 adjusted close 的年化波动率
    """
    try:
        t = yf.Ticker(ticker_str)
        # auto_adjust=True：收盘价已向前调整（含股息），反映真实总回报
        hist = t.history(period="1y", auto_adjust=True)
        closes = hist["Close"].dropna().tolist()

        if len(closes) < 2:
            return None, None

        one_year_return = (closes[-1] - closes[0]) / closes[0] * 100

        # 年化波动率：日对数收益率标准差 × sqrt(252)
        if len(closes) > 20:
            log_returns = [math.log(closes[i] / closes[i - 1]) for i in range(1, len(closes))]
            mean = sum(log_returns) / len(log_returns)
            variance = sum((r - mean) ** 2 for r in log_returns) / len(log_returns)
            annual_vol = math.sqrt(variance) * math.sqrt(252) * 100
        else:
            annual_vol = None

        return round(one_year_return, 2), round(annual_vol, 2) if annual_vol else None
    except Exception:
        return None, None


tickers = sys.argv[1:]
result = {}

for ticker in tickers:
    key = ticker.upper()
    try:
        info = yf.Ticker(ticker).info
        aum_raw = info.get("totalAssets") or info.get("netAssets")
        desc = info.get("longBusinessSummary") or info.get("shortBusinessSummary") or ""

        one_year_return, annual_vol = calc_returns(ticker)

        result[key] = {
            "aum": aum_raw,
            "aumDisplay": format_aum(aum_raw),
            "description": first_sentence(desc),
            "oneYearReturn": one_year_return,
            "annualVolatility": annual_vol,
        }
    except Exception as e:
        result[key] = {
            "aum": None,
            "aumDisplay": "N/A",
            "description": "",
            "oneYearReturn": None,
            "annualVolatility": None,
            "error": str(e),
        }

print(json.dumps(result))
