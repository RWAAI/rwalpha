// AuthModal.tsx
// Dark-theme login/register modal matching the reference design:
// Deep navy background, dark input fields, white text, teal CTA button

import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

type Mode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  initialMode?: Mode;
  onClose: () => void;
  zh?: boolean;
}

const COPY = {
  zh: {
    loginTitle: '登 录 您 的 账 户',
    registerTitle: '创 建 您 的 账 户',
    googleLogin: '使用 Google 登录',
    googleRegister: '使用 Google 注册',
    or: '或',
    email: '邮箱',
    emailPlaceholder: '输入您的邮箱',
    password: '密码',
    passwordPlaceholder: '输入密码',
    passwordHint: '至少 8 位字符',
    confirmPassword: '确认密码',
    confirmPlaceholder: '再次输入密码',
    forgotPassword: '忘记密码？',
    terms: '我已阅读并同意',
    termsLink: '服务条款',
    and: '和',
    privacyLink: '隐私政策',
    loginBtn: '登录',
    registerBtn: '创建账户',
    noAccount: '还没有账户？',
    registerNow: '立即注册',
    hasAccount: '已有账户？',
    loginNow: '立即登录',
  },
  en: {
    loginTitle: 'Sign In To Your Account',
    registerTitle: 'Create Your Account',
    googleLogin: 'Continue with Google',
    googleRegister: 'Sign up with Google',
    or: 'or',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    passwordHint: 'At least 8 characters',
    confirmPassword: 'Confirm Password',
    confirmPlaceholder: 'Re-enter password',
    forgotPassword: 'Forgot password?',
    terms: 'I have read and agree to the',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    registerNow: 'Sign up',
    hasAccount: 'Already have an account?',
    loginNow: 'Sign in',
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

export default function AuthModal({ open, initialMode = 'login', onClose, zh = true }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  // Sync mode when parent changes initialMode (e.g. clicking Login vs Register button)
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreed(false);
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [open, initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const T = zh ? COPY.zh : COPY.en;

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(zh ? '功能即将上线，敬请期待！' : 'Feature coming soon!');
    }, 800);
  };

  const handleGoogleAuth = () => {
    alert(zh ? 'Google 登录即将上线！' : 'Google login coming soon!');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreed(false);
    setShowPassword(false);
    setShowConfirm(false);
  };

  // Dark navy color palette matching the reference design
  const bg = '#0f172a';          // outer overlay / page bg
  const cardBg = '#1e293b';      // card background
  const inputBg = '#162032';     // input field background
  const inputBorder = '#2d3f55'; // input border
  const labelColor = '#94a3b8';  // label text
  const placeholderColor = '#4a6080'; // placeholder

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(10, 15, 30, 0.80)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: bg }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 transition-colors"
          style={{ color: '#4a6080' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a6080')}
        >
          <X size={18} />
        </button>

        {/* Title — spaced letters, small, muted */}
        <div className="pt-8 pb-2 px-8 text-center">
          <p className="text-sm tracking-[0.25em] font-light" style={{ color: '#64748b' }}>
            {mode === 'login' ? T.loginTitle : T.registerTitle}
          </p>
        </div>

        {/* Card inner */}
        <div className="mx-6 mb-6 mt-4 rounded-xl p-6" style={{ background: cardBg }}>

          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 mb-5"
            style={{
              background: '#1e2d42',
              border: '1px solid #2d3f55',
              color: '#e2e8f0',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#253348')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1e2d42')}
          >
            <GoogleIcon />
            {mode === 'login' ? T.googleLogin : T.googleRegister}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#2d3f55' }} />
            <span className="text-xs" style={{ color: '#4a6080' }}>{T.or}</span>
            <div className="flex-1 h-px" style={{ background: '#2d3f55' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm mb-1.5 font-normal" style={{ color: labelColor }}>
                {T.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={T.emailPlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                  color: '#e2e8f0',
                  caretColor: '#2dd4bf',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2dd4bf')}
                onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1.5 font-normal" style={{ color: labelColor }}>
                {T.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? T.passwordHint : T.passwordPlaceholder}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: '#e2e8f0',
                    caretColor: '#2dd4bf',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#2dd4bf')}
                  onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#4a6080' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4a6080')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm mb-1.5 font-normal" style={{ color: labelColor }}>
                  {T.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={T.confirmPlaceholder}
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: '#e2e8f0',
                      caretColor: '#2dd4bf',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2dd4bf')}
                    onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#4a6080' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4a6080')}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password (login only) */}
            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => alert(zh ? '密码重置功能即将上线' : 'Password reset coming soon')}
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#2dd4bf' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#5eead4')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#2dd4bf')}
                >
                  {T.forgotPassword}
                </button>
              </div>
            )}

            {/* Terms checkbox (register only) */}
            {mode === 'register' && (
              <div className="flex items-start gap-3 pt-1">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className="w-5 h-5 rounded cursor-pointer flex items-center justify-center transition-all"
                    style={{
                      background: agreed ? '#2dd4bf' : 'transparent',
                      border: `2px solid ${agreed ? '#2dd4bf' : '#4a6080'}`,
                    }}
                  >
                    {agreed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                  style={{ color: '#64748b' }}
                  onClick={() => setAgreed(!agreed)}
                >
                  {T.terms}{' '}
                  <button
                    type="button"
                    className="font-semibold transition-colors"
                    style={{ color: '#2dd4bf' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {T.termsLink}
                  </button>
                  {' '}{T.and}{' '}
                  <button
                    type="button"
                    className="font-semibold transition-colors"
                    style={{ color: '#2dd4bf' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {T.privacyLink}
                  </button>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !agreed)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] mt-2"
              style={{
                background: loading || (mode === 'register' && !agreed) ? '#1a3a38' : '#2dd4bf',
                color: loading || (mode === 'register' && !agreed) ? '#4a7a76' : '#0f172a',
                cursor: loading || (mode === 'register' && !agreed) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!loading && !(mode === 'register' && !agreed)) {
                  e.currentTarget.style.background = '#5eead4';
                }
              }}
              onMouseLeave={e => {
                if (!loading && !(mode === 'register' && !agreed)) {
                  e.currentTarget.style.background = '#2dd4bf';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {zh ? '处理中...' : 'Processing...'}
                </span>
              ) : (
                mode === 'login' ? T.loginBtn : T.registerBtn
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm mt-5" style={{ color: '#64748b' }}>
            {mode === 'login' ? T.noAccount : T.hasAccount}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold transition-colors"
              style={{ color: '#2dd4bf' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#5eead4')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2dd4bf')}
            >
              {mode === 'login' ? T.registerNow : T.loginNow}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
