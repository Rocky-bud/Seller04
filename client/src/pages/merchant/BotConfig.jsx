import { useState, useEffect, useRef } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { authHeaders } from '../../hooks/useApi'; // Bug-fix #10: attach auth to inline shop mutations
import {
  Bot, Eye, EyeOff, Save, Zap, ZapOff, RefreshCw,
  AlertCircle, CheckCircle2, Link, Copy, Check, Loader2, Info,
  AtSign, Shuffle, ExternalLink,
} from 'lucide-react';

// ─── Central Instagram webhook URL ───────────────────────────────────────────
const INSTAGRAM_WEBHOOK_URL =
  `${window.location.protocol}//${window.location.hostname}/api/webhooks/instagram`;

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ hasToken, maskedToken, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="space-y-1.5">
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-2.5 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    );
  }

  if (hasToken) {
    return (
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.15)' }}>
            <Zap className="w-5 h-5" style={{ color: '#34d399' }} />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
            style={{ background: '#10b981', borderColor: '#080e1f' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>🟢 ربات فعال و متصل است</p>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#065f46' }}>{maskedToken}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
          روشن
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)' }}>
          <ZapOff className="w-5 h-5" style={{ color: '#f87171' }} />
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
          style={{ background: '#ef4444', borderColor: '#080e1f' }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>🔴 ربات تلگرام متصل نیست</p>
        <p className="text-xs mt-0.5" style={{ color: '#7f1d1d' }}>برای فعال‌سازی، توکن ربات را در فرم زیر وارد کنید</p>
      </div>
      <span className="text-xs px-3 py-1.5 rounded-full font-medium"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
        قطع شده
      </span>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ type, message, onClose }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm"
      style={{
        background: isSuccess ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${isSuccess ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
        color: isSuccess ? '#6ee7b7' : '#fca5a5'
      }}>
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
      )}
    </div>
  );
}

// ─── Instagram Status Badge ───────────────────────────────────────────────────
function InstagramBadge({ hasPageId, hasToken, loading }) {
  if (loading) return null;
  const active = hasPageId && hasToken;
  return (
    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
      style={{
        background: active ? 'rgba(232,121,249,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#e879f9' : '#475569',
      }}>
      {active ? '🟣 فعال' : '⚪ پیکربندی نشده'}
    </span>
  );
}

// ─── Shared input style helpers ───────────────────────────────────────────────
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  transition: 'border-color 0.15s, background 0.15s',
};
const onFocus = (e) => {
  e.target.style.border = '1px solid rgba(59,130,246,0.5)';
  e.target.style.background = 'rgba(255,255,255,0.07)';
};
const onBlur = (e) => {
  e.target.style.border = '1px solid rgba(255,255,255,0.09)';
  e.target.style.background = 'rgba(255,255,255,0.05)';
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MerchantBotConfig() {
  const { shopId } = useShop();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registeringWebhook, setRegisteringWebhook] = useState(false);

  // Telegram token form
  const [newToken, setNewToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const savedTokenRef = useRef('');
  const [tokenSavedThisSession, setTokenSavedThisSession] = useState(false);

  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef(null);

  // ── Instagram form state ────────────────────────────────────────────────────
  const [igPageId, setIgPageId]               = useState('');
  const [igVerifyToken, setIgVerifyToken]      = useState('');
  const [newIgToken, setNewIgToken]            = useState('');
  const [showIgToken, setShowIgToken]          = useState(false);
  const [igTokenChanged, setIgTokenChanged]    = useState(false);
  const [igSaving, setIgSaving]               = useState(false);
  const [igAlert, setIgAlert]                 = useState({ type: '', msg: '' });
  const [igWebhookCopied, setIgWebhookCopied] = useState(false);
  const [verifyTokenCopied, setVerifyTokenCopied] = useState(false);

  // ── Load shop data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    authHeaders().then(h => fetch(`/api/shops/${encodeURIComponent(shopId)}`, { headers: h })) // Bug-fix #11: viewer-guarded read 401s without auth
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setShop(data.data);
          setSystemPrompt(data.data.system_prompt || '');
          setIgPageId(data.data.instagram_page_id || '');
          setIgVerifyToken(data.data.instagram_verify_token || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [systemPrompt]);

  // ── Save Telegram settings ──────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ type: '', msg: '' });

    const tokenToSave = tokenChanged ? newToken.trim() : '';
    const body = { system_prompt: systemPrompt };
    if (tokenToSave) body.telegram_token = tokenToSave;

    try {
      const res = await fetch(`/api/shops/${encodeURIComponent(shopId)}`, {
        method: 'PATCH',
        headers: await authHeaders(), // Bug-fix #10: owner-only route 401s without auth
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در ذخیره‌سازی');

      if (tokenToSave) {
        savedTokenRef.current = tokenToSave;
        setTokenSavedThisSession(true);
      }

      const r2 = await fetch(`/api/shops/${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const d2 = await r2.json();
      if (d2.success) {
        setShop(d2.data);
      } else {
        setShop(data.data);
      }

      setNewToken('');
      setTokenChanged(false);
      setAlert({ type: 'success', msg: 'تنظیمات با موفقیت ذخیره شد ✓' });
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Register Telegram webhook ────────────────────────────────────────────────
  const handleRegisterWebhook = async () => {
    const hasToken = shop?.has_token || !!savedTokenRef.current;
    if (!hasToken) {
      setAlert({ type: 'error', msg: 'ابتدا توکن ربات را ذخیره کنید، سپس دکمه اتصال را بزنید.' });
      return;
    }
    setRegisteringWebhook(true);
    setAlert({ type: '', msg: '' });
    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`/api/shops/${encodeURIComponent(shopId)}/webhook`, {
        method: 'POST',
        headers: await authHeaders(), // Bug-fix #10: owner-only route 401s without auth
        body: JSON.stringify({ baseUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در برقراری اتصال');
      setAlert({ type: 'success', msg: 'اتصال تلگرام با موفقیت برقرار شد — ربات آماده دریافت پیام است ✓' });
      const r2 = await fetch(`/api/shops/${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const d2 = await r2.json();
      if (d2.success) setShop(d2.data);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setRegisteringWebhook(false);
    }
  };

  const copyWebhook = () => {
    if (!shop?.webhook_url) return;
    navigator.clipboard.writeText(shop.webhook_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // ── Save Instagram settings ──────────────────────────────────────────────────
  const handleIgSave = async (e) => {
    e.preventDefault();
    setIgSaving(true);
    setIgAlert({ type: '', msg: '' });

    const body = {
      instagram_page_id:      igPageId.trim() || null,
      instagram_verify_token: igVerifyToken.trim() || null,
    };
    if (igTokenChanged && newIgToken.trim()) {
      body.instagram_access_token = newIgToken.trim();
    }

    try {
      const res = await fetch(`/api/shops/${encodeURIComponent(shopId)}`, {
        method: 'PATCH',
        headers: await authHeaders(), // Bug-fix #10: owner-only route 401s without auth
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در ذخیره‌سازی');

      const r2 = await fetch(`/api/shops/${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const d2 = await r2.json();
      if (d2.success) {
        setShop(d2.data);
        setIgPageId(d2.data.instagram_page_id || '');
        setIgVerifyToken(d2.data.instagram_verify_token || '');
      }

      setNewIgToken('');
      setIgTokenChanged(false);
      setIgAlert({ type: 'success', msg: 'تنظیمات اینستاگرام با موفقیت ذخیره شد ✓' });
    } catch (err) {
      setIgAlert({ type: 'error', msg: err.message });
    } finally {
      setIgSaving(false);
    }
  };

  const generateVerifyToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const token = Array.from({ length: 32 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setIgVerifyToken(token);
  };

  const copyIgWebhook = () => {
    navigator.clipboard.writeText(INSTAGRAM_WEBHOOK_URL).then(() => {
      setIgWebhookCopied(true);
      setTimeout(() => setIgWebhookCopied(false), 1800);
    });
  };

  const copyVerifyToken = () => {
    if (!igVerifyToken) return;
    navigator.clipboard.writeText(igVerifyToken).then(() => {
      setVerifyTokenCopied(true);
      setTimeout(() => setVerifyTokenCopied(false), 1800);
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl" dir="rtl">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-white">تنظیمات ربات تلگرام</h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            Step 3
          </span>
        </div>
        <p className="text-sm" style={{ color: '#64748b' }}>توکن ربات و دستورالعمل‌های هوش مصنوعی فروشگاه خود را پیکربندی کنید</p>
      </div>

      {/* ── Status banner ─────────────────────────────────────────── */}
      <StatusBanner hasToken={shop?.has_token} maskedToken={shop?.telegram_token} loading={loading} />

      {/* ── Alert ────────────────────────────────��────────────────── */}
      <Alert type={alert.type} message={alert.msg} onClose={() => setAlert({ type: '', msg: '' })} />

      {/* ── Telegram form card ───────────────────────────���────────── */}
      <form onSubmit={handleSave}>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Section: Telegram Token */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.12)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
              </div>
              <h2 className="text-sm font-semibold text-white">توکن ربات تلگرام</h2>
            </div>

            {shop?.has_token && !tokenChanged && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <span className="text-xs font-mono flex-1" style={{ color: '#34d399' }}>{shop.telegram_token}</span>
                <button type="button" onClick={() => setTokenChanged(true)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                  تغییر توکن
                </button>
              </div>
            )}

            {(!shop?.has_token || tokenChanged) && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                  {shop?.has_token ? 'توکن جدید' : 'توکن ربات'}
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={newToken}
                    onChange={e => { setNewToken(e.target.value); setTokenChanged(true); }}
                    placeholder="1234567890:ABCDefghIJKlmNoPQRsTUVwxyZ"
                    dir="ltr"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                    style={{ ...inputStyle, paddingLeft: '44px' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button type="button" onClick={() => setShowToken(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#475569' }}>
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {tokenChanged && shop?.has_token && (
                  <button type="button" onClick={() => { setTokenChanged(false); setNewToken(''); }}
                    className="text-xs mt-1" style={{ color: '#475569' }}>
                    ← نگه داشتن توکن فعلی
                  </button>
                )}
                <div className="flex items-start gap-1.5 mt-2">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#475569' }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
                    توکن خود را از طریق{' '}
                    <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer"
                      className="underline" style={{ color: '#60a5fa' }}>@BotFather</a>
                    {' '}در تلگرام دریافت کنید
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section: System Prompt */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />
              </div>
              <h2 className="text-sm font-semibold text-white">دستورالعمل هوش مصنوعی</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                شخصیت و قوانین دستیار هوشمند فروشگاه
              </label>
              <textarea
                ref={textareaRef}
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder={`مثال:\n\nشما دستیار فروشگاه «احمدی» هستید.\nلحن: صمیمی اما حرفه‌ای\nهزینه ارسال: رایگان برای سفارش بالای ۵۰۰ هزار تومان\nسیاست مرجوعی: ۷ روز پس از تحویل\nساعات پاسخگویی: شنبه تا پنجشنبه ۹ تا ۱۸`}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none leading-7 min-h-[180px]"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: '#334155' }}>
                  این متن مستقیماً به عنوان دستورالعمل به هوش مصنوعی ارسال می‌شود
                </p>
                <span className="text-[11px] font-mono"
                  style={{ color: systemPrompt.length > 1800 ? '#f87171' : '#334155' }}>
                  {systemPrompt.length.toLocaleString('fa-IR')} کاراکتر
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Save */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...</>
                : <><Save className="w-4 h-4" /> ذخیره تنظیمات</>}
            </button>
            <p className="text-xs" style={{ color: '#334155' }}>تغییرات بلافاصله اعمال می‌شود</p>
          </div>
        </div>
      </form>

      {/* ── Telegram Webhook Section ──────────────────────────────── */}
      <div className="rounded-2xl px-6 py-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Link className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-sm font-semibold text-white">فعال‌سازی اتصال تلگرام</h2>
        </div>

        <p className="text-xs mb-4 leading-relaxed" style={{ color: '#475569' }}>
          پس از ذخیره توکن، این دکمه را بزنید تا تلگرام پیام‌های ربات شما را به سرور ما ارسال کند.
          این مرحله یک‌بار کافی است.
        </p>

        {shop?.webhook_url && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-[11px] font-mono flex-1 truncate" style={{ color: '#475569' }} dir="ltr">
              {shop.webhook_url}
            </span>
            <button onClick={copyWebhook} className="shrink-0 p-1 rounded-md transition-all"
              style={{ color: copied ? '#34d399' : '#475569' }}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {(() => {
          const canRegister = shop?.has_token || tokenSavedThisSession;
          return (
            <button
              type="button"
              onClick={handleRegisterWebhook}
              disabled={registeringWebhook || loading || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: canRegister ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${canRegister ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}`,
                color: canRegister ? '#34d399' : '#475569'
              }}>
              {registeringWebhook
                ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال فعال‌سازی...</>
                : <><RefreshCw className="w-4 h-4" /> {shop?.webhook_url ? 'به‌روزرسانی اتصال' : 'فعال‌سازی اتصال'}</>}
            </button>
          );
        })()}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          INSTAGRAM INTEGRATION SECTION
      ══════════════════════════════════════════════════════════════ */}
      <div>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(232,121,249,0.2),rgba(168,85,247,0.2))', border: '1px solid rgba(232,121,249,0.2)' }}>
            <AtSign className="w-4 h-4" style={{ color: '#e879f9' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">اتصال اینستاگرام</h2>
            <p className="text-[11px]" style={{ color: '#64748b' }}>
              دریافت DM‌های اینستاگرام و پاسخ خودکار از طریق هوش مصنوعی
            </p>
          </div>
          <InstagramBadge
            hasPageId={!!shop?.instagram_page_id}
            hasToken={shop?.has_instagram_token}
            loading={loading}
          />
        </div>

        {/* Instagram alert */}
        <div className="mb-4">
          <Alert type={igAlert.type} message={igAlert.msg} onClose={() => setIgAlert({ type: '', msg: '' })} />
        </div>

        {/* ── Step 1: Webhook URL display ── */}
        <div className="rounded-2xl mb-4"
          style={{ background: 'rgba(232,121,249,0.04)', border: '1px solid rgba(232,121,249,0.12)' }}>

          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(232,121,249,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'rgba(232,121,249,0.1)' }}>
                <Link className="w-3 h-3" style={{ color: '#e879f9' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: '#e879f9' }}>
                مرحله ۱ — آدرس Webhook مرکزی
              </p>
            </div>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: '#64748b' }}>
              این آدرس را در پنل Meta Developer Console ثبت کنید (بخش Instagram → Webhooks)
            </p>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[11px] font-mono flex-1 break-all" style={{ color: '#a78bfa' }} dir="ltr">
                {INSTAGRAM_WEBHOOK_URL}
              </span>
              <button type="button" onClick={copyIgWebhook}
                className="shrink-0 p-1.5 rounded-lg transition-all"
                style={{ color: igWebhookCopied ? '#e879f9' : '#475569' }}
                title="کپی آدرس">
                {igWebhookCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
                className="shrink-0 p-1.5 rounded-lg transition-all"
                style={{ color: '#475569' }}
                title="باز کردن Meta Developer Console">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Steps 2 & 3: Instagram credentials form ── */}
        <form onSubmit={handleIgSave}>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Instagram Page ID */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(232,121,249,0.1)', color: '#e879f9' }}>مرحله ۲</span>
                <label className="text-xs font-semibold text-white">Instagram Page ID</label>
              </div>
              <input
                type="text"
                value={igPageId}
                onChange={e => setIgPageId(e.target.value)}
                placeholder="مثال: 123456789012345"
                dir="ltr"
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <div className="flex items-start gap-1.5 mt-2">
                <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#334155' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: '#334155' }}>
                  از{' '}
                  <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: '#a78bfa' }}>
                    Meta Developer Console
                  </a>
                  {' '}→ My Apps → App Dashboard → Instagram ID قابل دریافت است
                </p>
              </div>
            </div>

            {/* Meta Page Access Token */}
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(232,121,249,0.1)', color: '#e879f9' }}>مرحله ۳</span>
                <label className="text-xs font-semibold text-white">Meta Page Access Token</label>
              </div>

              {/* Show masked token if already saved */}
              {shop?.has_instagram_token && !igTokenChanged && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(232,121,249,0.06)', border: '1px solid rgba(232,121,249,0.15)' }}>
                  <span className="text-xs font-mono flex-1" style={{ color: '#e879f9' }}>
                    {shop.instagram_access_token}
                  </span>
                  <button type="button" onClick={() => setIgTokenChanged(true)}
                    className="text-xs px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#a78bfa' }}>
                    تغییر توکن
                  </button>
                </div>
              )}

              {(!shop?.has_instagram_token || igTokenChanged) && (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type={showIgToken ? 'text' : 'password'}
                      value={newIgToken}
                      onChange={e => { setNewIgToken(e.target.value); setIgTokenChanged(true); }}
                      placeholder="EAABwzLixnjYBO..."
                      dir="ltr"
                      autoComplete="off"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                      style={{ ...inputStyle, paddingLeft: '44px' }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button type="button" onClick={() => setShowIgToken(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#475569' }}>
                      {showIgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {igTokenChanged && shop?.has_instagram_token && (
                    <button type="button"
                      onClick={() => { setIgTokenChanged(false); setNewIgToken(''); }}
                      className="text-xs mt-1" style={{ color: '#475569' }}>
                      ← نگه داشتن توکن فعلی
                    </button>
                  )}
                  <div className="flex items-start gap-1.5 mt-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#334155' }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: '#334155' }}>
                      از Meta Business Suite → Settings → Instagram → Access Token دریافت کنید
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Verify Token */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(232,121,249,0.1)', color: '#e879f9' }}>مرحله ۴</span>
                <label className="text-xs font-semibold text-white">Verify Token</label>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={igVerifyToken}
                    onChange={e => setIgVerifyToken(e.target.value)}
                    placeholder="یک رشته تصادفی امن وارد یا تولید کنید"
                    dir="ltr"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                    style={{ ...inputStyle, paddingLeft: igVerifyToken ? '36px' : undefined }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  {igVerifyToken && (
                    <button type="button" onClick={copyVerifyToken}
                      className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: verifyTokenCopied ? '#e879f9' : '#475569' }}>
                      {verifyTokenCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateVerifyToken}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.2)',
                    color: '#a78bfa'
                  }}>
                  <Shuffle className="w-3.5 h-3.5" />
                  تولید خودکار
                </button>
              </div>

              <div className="flex items-start gap-1.5 mt-2">
                <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#334155' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: '#334155' }}>
                  همین مقدار را در فیلد «Verify Token» پنل Meta Developer Console وارد کنید تا تایید شود
                </p>
              </div>
            </div>

            {/* Footer: Save Instagram */}
            <div className="px-6 py-4 flex items-center gap-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <button
                type="submit"
                disabled={igSaving || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg,#a855f7,#ec4899)',
                  boxShadow: '0 4px 16px rgba(168,85,247,0.25)'
                }}>
                {igSaving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...</>
                  : <><Save className="w-4 h-4" /> ذخیره تنظیمات اینستاگرام</>}
              </button>
              <p className="text-xs" style={{ color: '#334155' }}>تغییرات بلافاصله اعمال می‌شود</p>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
