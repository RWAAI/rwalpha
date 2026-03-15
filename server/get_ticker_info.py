#!/usr/bin/env python3
"""
获取 ETF/股票的 AUM 和描述信息（via yfinance）
用法: python3 get_ticker_info.py NVDY QQQI QQQM VGT
输出: JSON 格式 { TICKER: { aum, aumDisplay, description } }
"""
import sys
import json
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


tickers = sys.argv[1:]
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
    except Exception as e:
        result[key] = {"aum": None, "aumDisplay": "N/A", "description": "", "error": str(e)}

print(json.dumps(result))
