/**
 * 个人资料页面
 * 包含：基础信息编辑 + KYC 身份认证模块 + 钱包绑定
 */

import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar,
  Shield, CheckCircle2, Clock, AlertCircle, Camera,
  ChevronRight, Edit2, Save, X, Lock, Bell, Eye, EyeOff,
  Globe, Wallet, Plus, Trash2, Star, Copy, ExternalLink
} from "lucide-react";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type KycStatus = "unverified" | "pending" | "verified" | "rejected";

// ─── 静态模拟数据 ────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: "Alex Chen",
  email: "alex@rwalpha.ai",
  phone: "+86 138 0000 0000",
  country: "China",
  city: "Shanghai",
  birthday: "1990-05-15",
  avatar: "AC",
  joinDate: "2025-06-15",
  kycStatus: "pending" as KycStatus,
  emailVerified: true,
  phoneVerified: false,
};

// KYC 状态配置
const KYC_CONFIG: Record<KycStatus, { label: string; labelEn: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  unverified: {
    label: "未认证", labelEn: "Unverified",
    color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200",
    icon: <AlertCircle size={16} className="text-slate-400" />,
  },
  pending: {
    label: "审核中", labelEn: "Under Review",
    color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    icon: <Clock size={16} className="text-amber-500" />,
  },
  verified: {
    label: "已认证", labelEn: "Verified",
    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    icon: <CheckCircle2 size={16} className="text-emerald-500" />,
  },
  rejected: {
    label: "认证失败", labelEn: "Rejected",
    color: "text-red-500", bg: "bg-red-50", border: "border-red-200",
    icon: <X size={16} className="text-red-500" />,
  },
};

// Sumsub KYC 入口 URL（实际对接时替换为真实 Sumsub applicant URL）
const SUMSUB_KYC_URL = "https://sumsub.com";

// ─── 头像上传占位组件 ─────────────────────────────────────────────────────────

function AvatarUpload({ initials, zh }: { initials: string; zh: boolean }) {
  return (
    <div className="relative group cursor-pointer">
      <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
        {initials}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera size={18} className="text-white" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center">
        <Edit2 size={10} className="text-white" />
      </div>
    </div>
  );
}

// ─── KYC 状态徽章 ────────────────────────────────────────────────────────────

function KycBadge({ status, zh }: { status: KycStatus; zh: boolean }) {
  const cfg = KYC_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {cfg.icon}
      {zh ? cfg.label : cfg.labelEn}
    </span>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function Profile() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const zh = lang === "zh";
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // 基础信息编辑状态
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    country: MOCK_USER.country,
    city: MOCK_USER.city,
    birthday: MOCK_USER.birthday,
  });
  const [savedForm, setSavedForm] = useState({ ...form });

  // 密码修改
  const [showPwdSection, setShowPwdSection] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // KYC 真实数据
  const { data: kycData } = trpc.profile.getKyc.useQuery();

  // 钱包绑定真实数据
  const { data: wallets = [], isLoading: walletsLoading } = trpc.profile.getWallets.useQuery();
  const [walletForm, setWalletForm] = useState({ address: "", chain: "Ethereum" as "Ethereum" | "BSC" | "Polygon" | "Arbitrum" | "Optimism", label: "" });
  const [showWalletForm, setShowWalletForm] = useState(false);

  const addWallet = trpc.profile.addWallet.useMutation({
    onSuccess: () => {
      utils.profile.getWallets.invalidate();
      setShowWalletForm(false);
      setWalletForm({ address: "", chain: "Ethereum", label: "" });
      toast.success(zh ? "钱包已绑定" : "Wallet bound");
    },
    onError: (e) => toast.error(e.message),
  });

  const removeWallet = trpc.profile.removeWallet.useMutation({
    onSuccess: () => { utils.profile.getWallets.invalidate(); toast.success(zh ? "钱包已移除" : "Wallet removed"); },
  });

  const setPrimaryWallet = trpc.profile.setPrimaryWallet.useMutation({
    onSuccess: () => { utils.profile.getWallets.invalidate(); toast.success(zh ? "已设为主钱包" : "Set as primary"); },
  });

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success(zh ? "地址已复制" : "Address copied");
  };

  const truncateAddr = (addr: string) =>
    addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  // KYC 状态
  const realKycStatus: KycStatus = kycData?.status as KycStatus ?? "unverified";

  const handleSave = () => {
    setSavedForm({ ...form });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...savedForm });
    setEditing(false);
  };

  const kycCfg = KYC_CONFIG[realKycStatus];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── 顶部导航 ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vault")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              {zh ? "返回金库" : "Back to Vault"}
            </button>
            <span className="text-slate-200">|</span>
            {/* 文字链接导航 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-800 border-b-2 border-indigo-500 pb-0.5">
                {zh ? "个人资料" : "Profile"}
              </span>
              <Link href="/my-assets">
                <span className="text-sm text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                  {zh ? "我的资产" : "My Assets"}
                </span>
              </Link>
            </div>
          </div>
          <button
            onClick={() => setLang(zh ? "en" : "zh")}
            className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2 py-1 transition-colors"
          >
            🌐 {zh ? "EN" : "中文"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── 用户头部卡 ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <AvatarUpload initials={MOCK_USER.avatar} zh={zh} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{savedForm.name}</h2>
                <KycBadge status={realKycStatus} zh={zh} />
              </div>
              <p className="text-sm text-slate-400 mb-2">{MOCK_USER.email}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {zh ? `加入于 ${MOCK_USER.joinDate}` : `Joined ${MOCK_USER.joinDate}`}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  {savedForm.country}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                editing
                  ? "border-slate-200 text-slate-500 hover:bg-slate-50"
                  : "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              }`}
            >
              <Edit2 size={14} />
              {editing ? (zh ? "取消" : "Cancel") : (zh ? "编辑资料" : "Edit Profile")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── 左列：基础信息 + 安全设置 ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* 基础信息 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-800">{zh ? "基础信息" : "Basic Information"}</h3>
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {zh ? "取消" : "Cancel"}
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 text-xs text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Save size={12} />
                      {zh ? "保存" : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* 姓名 */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "姓名" : "Full Name"}</label>
                  {editing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">{savedForm.name}</div>
                  )}
                </div>

                {/* 邮箱（只读） */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "邮箱" : "Email"}</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 flex-1">{MOCK_USER.email}</span>
                    {MOCK_USER.emailVerified ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-600 rounded-full px-1.5 py-0.5 font-semibold">{zh ? "已验证" : "Verified"}</span>
                    ) : (
                      <button className="text-[10px] text-indigo-500 hover:underline">{zh ? "去验证" : "Verify"}</button>
                    )}
                  </div>
                </div>

                {/* 手机号 */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "手机号" : "Phone"}</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 flex-1">{savedForm.phone}</span>
                      {!MOCK_USER.phoneVerified && (
                        <button className="text-[10px] text-indigo-500 hover:underline">{zh ? "去验证" : "Verify"}</button>
                      )}
                    </div>
                  )}
                </div>

                {/* 国家 + 城市 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "国家/地区" : "Country"}</label>
                    {editing ? (
                      <select
                        value={form.country}
                        onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                      >
                        {["China", "Singapore", "Hong Kong", "United States", "United Kingdom", "Japan", "South Korea", "Other"].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">
                        <MapPin size={13} className="text-slate-400" />
                        {savedForm.country}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "城市" : "City"}</label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                      />
                    ) : (
                      <div className="px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">{savedForm.city}</div>
                    )}
                  </div>
                </div>

                {/* 生日 */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">{zh ? "出生日期" : "Birthday"}</label>
                  {editing ? (
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">
                      <Calendar size={13} className="text-slate-400" />
                      {savedForm.birthday}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 安全设置 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Lock size={15} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">{zh ? "安全设置" : "Security"}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {/* 修改密码 */}
                <div>
                  <button
                    onClick={() => setShowPwdSection(!showPwdSection)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Lock size={14} className="text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">{zh ? "修改密码" : "Change Password"}</p>
                        <p className="text-xs text-slate-400">{zh ? "定期更换密码以保护账户安全" : "Update your password regularly"}</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className={`text-slate-300 transition-transform ${showPwdSection ? "rotate-90" : ""}`} />
                  </button>
                  {showPwdSection && (
                    <div className="px-5 pb-4 space-y-3">
                      <div className="relative">
                        <input
                          type={showOldPwd ? "text" : "password"}
                          placeholder={zh ? "当前密码" : "Current password"}
                          className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => setShowOldPwd(!showOldPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showOldPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          placeholder={zh ? "新密码（至少 8 位）" : "New password (min 8 chars)"}
                          className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                        {zh ? "更新密码" : "Update Password"}
                      </button>
                    </div>
                  )}
                </div>
                {/* 两步验证 */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Shield size={14} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{zh ? "两步验证（2FA）" : "Two-Factor Auth (2FA)"}</p>
                      <p className="text-xs text-slate-400">{zh ? "使用 Google Authenticator 保护账户" : "Protect with Google Authenticator"}</p>
                    </div>
                  </div>
                  <button className="text-xs text-indigo-500 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors font-medium">
                    {zh ? "开启" : "Enable"}
                  </button>
                </div>
                {/* 通知设置 */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Bell size={14} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{zh ? "派息通知" : "Dividend Notifications"}</p>
                      <p className="text-xs text-slate-400">{zh ? "每次派息到账时邮件提醒" : "Email alerts on dividend payouts"}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── 右列：KYC 认证 + 钱包绑定 ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* KYC 状态卡（简化版，对接 Sumsub） */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${kycCfg.bg} ${kycCfg.border}`}>
              <div className="px-5 py-4 border-b border-white/60">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={15} className={kycCfg.color} />
                  <h3 className="text-sm font-bold text-slate-800">{zh ? "KYC 身份认证" : "KYC Verification"}</h3>
                </div>
                <p className="text-xs text-slate-500">{zh ? "完成认证后可解锁更高交易限额" : "Complete KYC to unlock higher limits"}</p>
              </div>
              <div className="p-5">
                {/* 当前状态行 */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs text-slate-500">{zh ? "认证状态" : "Status"}</span>
                  <KycBadge status={realKycStatus} zh={zh} />
                </div>

                {/* 状态说明 */}
                {realKycStatus === "unverified" && (
                  <div className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-600 mb-4 leading-relaxed">
                    {zh
                      ? "您尚未完成身份认证。点击下方按钮前往 Sumsub 完成 KYC 流程，认证后即可解锁完整交易权限。"
                      : "You haven't completed identity verification. Click below to start KYC via Sumsub and unlock full trading access."}
                  </div>
                )}
                {realKycStatus === "pending" && (
                  <div className="p-3 bg-amber-100/60 rounded-xl text-xs text-amber-700 mb-4 leading-relaxed">
                    {zh
                      ? "您的资料已提交，预计 1–3 个工作日完成审核。审核结果将通过邮件通知您。"
                      : "Your documents are under review. Expect 1–3 business days. You'll be notified by email."}
                  </div>
                )}
                {realKycStatus === "verified" && (
                  <div className="p-3 bg-emerald-100/60 rounded-xl text-xs text-emerald-700 mb-4 leading-relaxed">
                    {zh ? "🎉 恭喜！您的身份已通过认证，可享受完整交易权限。" : "🎉 Congratulations! Your identity is verified. Full trading access unlocked."}
                  </div>
                )}
                {realKycStatus === "rejected" && (
                  <div className="p-3 bg-red-100/60 rounded-xl text-xs text-red-600 mb-4 leading-relaxed">
                    {zh ? "认证未通过，请重新发起认证流程。如有疑问请联系客服。" : "Verification failed. Please restart the KYC process. Contact support if needed."}
                  </div>
                )}

                {/* 操作按钮 */}
                {realKycStatus === "unverified" && (
                  <a
                    href={SUMSUB_KYC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {zh ? "开始认证" : "Start KYC"}
                    <ExternalLink size={13} />
                  </a>
                )}
                {realKycStatus === "rejected" && (
                  <a
                    href={SUMSUB_KYC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {zh ? "重新认证" : "Re-verify"}
                    <ExternalLink size={13} />
                  </a>
                )}
                {realKycStatus === "pending" && (
                  <div className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-600 text-sm font-medium rounded-xl flex items-center justify-center gap-2">
                    <Clock size={14} />
                    {zh ? "审核中，请耐心等待" : "Under review, please wait"}
                  </div>
                )}
                {realKycStatus === "verified" && (
                  <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-medium rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} />
                    {zh ? "认证已完成" : "Verification Complete"}
                  </div>
                )}
              </div>
            </div>

            {/* 钱包绑定模块 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wallet size={15} className="text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-800">{zh ? "钱包绑定" : "Linked Wallets"}</h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{wallets.length}</span>
                </div>
                <button
                  onClick={() => setShowWalletForm(!showWalletForm)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors font-medium"
                >
                  <Plus size={12} />
                  {zh ? "添加钱包" : "Add Wallet"}
                </button>
              </div>
              <div className="p-5 space-y-3">
                {walletsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : wallets.length === 0 && !showWalletForm ? (
                  <div className="text-center py-6">
                    <Wallet size={28} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{zh ? "还没有绑定的钱包" : "No wallets linked yet"}</p>
                    <button onClick={() => setShowWalletForm(true)} className="mt-2 text-xs text-indigo-500 hover:underline">
                      {zh ? "立即绑定" : "Link now"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(wallets as Array<{id: number; address: string; chain: string; label: string | null; isPrimary: number; userId: number; createdAt: Date}>).map((w) => (
                      <div key={w.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        w.isPrimary === 1 ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            w.isPrimary === 1 ? "bg-indigo-100" : "bg-slate-200"
                          }`}>
                            <Wallet size={14} className={w.isPrimary === 1 ? "text-indigo-600" : "text-slate-500"} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono text-slate-700 truncate">{truncateAddr(w.address)}</span>
                              {w.isPrimary === 1 && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full shrink-0">{zh ? "主" : "Primary"}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400">{w.chain}</span>
                              {w.label && <span className="text-[10px] text-slate-400">· {w.label}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => copyAddress(w.address)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-white">
                            <Copy size={12} />
                          </button>
                          {w.isPrimary !== 1 && (
                            <button onClick={() => setPrimaryWallet.mutate({ id: w.id })} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-white">
                              <Star size={12} />
                            </button>
                          )}
                          <button onClick={() => removeWallet.mutate({ id: w.id })} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加钱包表单 */}
                {showWalletForm && (
                  <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-indigo-700">{zh ? "绑定新钱包" : "Link New Wallet"}</p>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{zh ? "钱包地址" : "Wallet Address"}</label>
                      <input
                        type="text"
                        value={walletForm.address}
                        onChange={(e) => setWalletForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="0x..."
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">{zh ? "公链" : "Chain"}</label>
                        <select
                          value={walletForm.chain}
                          onChange={(e) => setWalletForm(f => ({ ...f, chain: e.target.value as typeof walletForm.chain }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                        >
                          {["Ethereum","BSC","Polygon","Arbitrum","Optimism"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">{zh ? "备注（可选）" : "Label (optional)"}</label>
                        <input
                          type="text"
                          value={walletForm.label}
                          onChange={(e) => setWalletForm(f => ({ ...f, label: e.target.value }))}
                          placeholder={zh ? "如：主钱包" : "e.g. Main"}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addWallet.mutate(walletForm)}
                        disabled={addWallet.isPending || !walletForm.address}
                        className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
                      >
                        {addWallet.isPending ? (zh ? "绑定中..." : "Binding...") : (zh ? "确认绑定" : "Confirm")}
                      </button>
                      <button
                        onClick={() => { setShowWalletForm(false); setWalletForm({ address: "", chain: "Ethereum", label: "" }); }}
                        className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {zh ? "取消" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 认证权益卡 */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-indigo-700 mb-3">{zh ? "认证后解锁权益" : "Benefits After Verification"}</h4>
              <div className="space-y-2">
                {[
                  { zh: "单笔认购上限提升至 $500,000", en: "Single purchase limit up to $500,000" },
                  { zh: "优先参与新产品白名单", en: "Priority whitelist for new products" },
                  { zh: "专属客户经理服务", en: "Dedicated account manager" },
                  { zh: "更低的赎回手续费", en: "Lower redemption fees" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-indigo-600">
                    <CheckCircle2 size={12} className="text-indigo-400 shrink-0" />
                    {zh ? item.zh : item.en}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
