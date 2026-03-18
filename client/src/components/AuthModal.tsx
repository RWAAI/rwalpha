// AuthModal.tsx
// White-theme login/register modal matching the reference design.
// All auth actions redirect to the real Manus OAuth flow.

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { getLoginUrl } from '@/const';

type Mode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
  onLoginSuccess?: () => void;
  zh?: boolean;
}

const COPY = {
  zh: {
    loginTitle: '登 录 您 的 账 户',
    registerTitle: '创 建 您 的 账 户',
    googleLogin: '使用 Google 登录',
    googleRegister: '使用 Google 注册',
    or: '或',
    emailLogin: '邮箱 / 账号登录',
    emailRegister: '邮箱注册',
    loginDesc: '点击下方按钮，通过安全的 OAuth 页面完成登录',
    registerDesc: '点击下方按钮，通过安全的 OAuth 页面完成注册',
    loginBtn: '前往登录',
    registerBtn: '前往注册',
    noAccount: '还没有账户？',
    registerNow: '立即注册',
    hasAccount: '已有账户？',
    loginNow: '立即登录',
    secureNote: '通过安全加密的 OAuth 2.0 协议保护您的账户',
  },
  en: {
    loginTitle: 'Sign In To Your Account',
    registerTitle: 'Create Your Account',
    googleLogin: 'Continue with Google',
    googleRegister: 'Sign up with Google',
    or: 'or',
    emailLogin: 'Sign in with Email',
    emailRegister: 'Sign up with Email',
    loginDesc: 'Click below to sign in securely via OAuth',
    registerDesc: 'Click below to create your account securely via OAuth',
    loginBtn: 'Go to Sign In',
    registerBtn: 'Go to Sign Up',
    noAccount: "Don't have an account?",
    registerNow: 'Sign up',
    hasAccount: 'Already have an account?',
    loginNow: 'Sign in',
    secureNote: 'Protected by OAuth 2.0 secure authentication',
  },
};

// Google G logo SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.132-3.272-.396-4.908H24.48v9.288h12.996c-.54 2.988-2.196 5.544-4.68 7.236v5.988h7.548c4.428-4.068 6.972-10.08 6.972-17.604z" fill="#4285F4"/>
    <path d="M24.48 48c6.48 0 11.952-2.124 15.936-5.844l-7.548-5.988c-2.124 1.44-4.86 2.268-8.388 2.268-6.444 0-11.916-4.356-13.872-10.188H2.784v6.192C6.744 42.948 15.12 48 24.48 48z" fill="#34A853"/>
    <path d="M10.608 28.248A14.52 14.52 0 0 1 9.84 24c0-1.476.252-2.916.768-4.248v-6.192H2.784A23.952 23.952 0 0 0 .48 24c0 3.888.936 7.56 2.304 10.44l7.824-6.192z" fill="#FBBC05"/>
    <path d="M24.48 9.564c3.636 0 6.876 1.26 9.444 3.708l7.02-7.02C36.432 2.376 30.96 0 24.48 0 15.12 0 6.744 5.052 2.784 13.56l7.824 6.192c1.956-5.832 7.428-10.188 13.872-10.188z" fill="#EA4335"/>
  </svg>
);

// Lock icon
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function AuthModal({ open, initialMode = 'login', onClose, zh = true }: AuthModalProps) {
  const T = zh ? COPY.zh : COPY.en;
  const mode = initialMode;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleAuth = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden bg-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="pt-8 pb-2 px-8 text-center">
          <p className="text-sm tracking-[0.22em] font-light text-slate-400">
            {mode === 'login' ? T.loginTitle : T.registerTitle}
          </p>
        </div>

        {/* Card inner */}
        <div className="mx-6 mb-6 mt-4 rounded-xl p-6 bg-white border border-slate-100 shadow-sm">

          {/* Google / OAuth Button — primary CTA */}
          <button
            onClick={handleAuth}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium text-sm mb-4 shadow-sm"
          >
            <GoogleIcon />
            {mode === 'login' ? T.googleLogin : T.googleRegister}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">{T.or}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email / Password OAuth button */}
          <button
            onClick={handleAuth}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] mb-5"
            style={{ background: '#2dd4bf', color: 'white' }}
          >
            {mode === 'login' ? T.loginBtn : T.registerBtn}
          </button>

          {/* Secure note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <LockIcon />
            <span>{T.secureNote}</span>
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-400 mt-5">
            {mode === 'login' ? T.noAccount : T.hasAccount}{' '}
            <button
              onClick={handleAuth}
              className="font-semibold text-teal-500 hover:text-teal-600 transition-colors"
            >
              {mode === 'login' ? T.registerNow : T.loginNow}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
