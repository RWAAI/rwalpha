// Footer — shared across all pages
// Mirrors the footer in LandingPage exactly, with zh/en support via localStorage

import { useEffect, useState } from 'react';

export default function Footer() {
  const [zh, setZh] = useState(() => localStorage.getItem('rwa-lang') !== 'en');

  useEffect(() => {
    const handler = () => setZh(localStorage.getItem('rwa-lang') !== 'en');
    window.addEventListener('rwa-lang-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('rwa-lang-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const copyright = zh
    ? '© 2026 RWAlpha. 保留所有权利。'
    : '© 2026 RWAlpha. All rights reserved.';

  return (
    <footer className="bg-white border-t border-slate-100 py-6 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-col gap-0.5">
            <span
              className="font-extrabold text-indigo-600 text-lg tracking-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              RWAlpha.ai
            </span>
            <span className="text-slate-400 text-xs">AI-First Company</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-slate-500 text-xs hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter / X
            </a>
            <a
              href="mailto:contact@rwalpha.ai"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-slate-500 text-xs hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Contact
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 text-slate-500 text-xs hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Docs
            </a>
          </div>
        </div>
        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-slate-500">
          <span>{copyright}</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-800 transition-colors">Terms of Use</a>
            <a href="/risk-disclosure" className="hover:text-slate-800 transition-colors">Risk Disclosure</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
