import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useApi'; // Bug-fix #10: attach auth to shop-create
import {
  Store, Plus, RefreshCw, Search, X, Copy, Check,
  Bot, CreditCard, Calendar, Key, AlertCircle, Loader2
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateShopId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'SHOP-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy}
      className="ml-1.5 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"
      style={{ color: copied ? '#34d399' : '#475569' }}
      title="کپی">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function BotBadge({ hasToken, maskedToken }) {
  if (hasToken) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono"
        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        {maskedToken}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
      style={{ background: 'rgba(71,85,105,0.3)', border: '1px solid rgba(71,85,105,0.4)', color: '#475569' }}>
      بدون ربات
    </span>
  );
}

// ─── Create Shop Modal ───────────────────────────────────────────────────────

function CreateShopModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [shopId] = useState(generateShopId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('نام فروشگاه الزامی است'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: await authHeaders(), // Bug-fix #10: authenticate the admin shop-create call
        body: JSON.stringify({ id: shopId, name: name.trim(), card_number: cardNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در ایجاد فروشگاه');
      onCreated(data.data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl p-7 z-10"
        style={{ background: '#0f1929', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">افزودن فروشگاه جدید</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>اطلاعات فروشگاه را وارد کنید</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generated ID preview */}
        <div className="mb-5 p-4 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="text-xs mb-2 font-medium" style={{ color: '#818cf8' }}>کد دسترسی تولید شده (قابل کپی)</p>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-lg font-bold font-mono tracking-widest" style={{ color: '#a5b4fc' }}>
              {shopId}
            </span>
            <button onClick={() => navigator.clipboard.writeText(shopId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Copy className="w-3 h-3" /> کپی
            </button>
          </div>
          <p className="text-[11px] mt-2" style={{ color: '#4338ca' }}>
            این کد را به صاحب فروشگاه بدهید — با آن وارد داشبورد می‌شود
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Shop name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
              نام فروشگاه <span style={{ color: '#6366f1' }}>*</span>
            </label>
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="مثال: فروشگاه احمدی"
                autoFocus
                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; }}
              />
            </div>
          </div>

          {/* Card number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
              شماره کارت <span style={{ color: '#475569', fontWeight: 400 }}>(اختیاری)</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                placeholder="6037-XXXX-XXXX-XXXX"
                dir="ltr"
                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm text-white outline-none transition-all font-mono"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              انصراف
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ایجاد...</>
                : <><Plus className="w-4 h-4" /> ایجاد فروشگاه</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminShopManagement() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/shops', { headers: await authHeaders() }); // Bug-fix #11
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'خطا در دریافت اطلاعات');
      setShops(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops, refreshKey]);

  const handleCreated = (newShop) => {
    setShops(prev => [...prev, newShop]);
    setShowModal(false);
  };

  const filtered = shops.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toLowerCase().includes(search.toLowerCase()) ||
    s.card_number?.includes(search)
  );

  return (
    <div className="flex flex-col gap-6" dir="rtl">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">مدیریت فروشگاه‌ها</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-medium"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
              {shops.length} فروشگاه
            </span>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            لیست تمام فروشگاه‌های ثبت‌شده در سیستم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="p-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
            title="بروزرسانی">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <Plus className="w-4 h-4" /> افزودن فروشگاه جدید
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام، کد یا شماره کارت..."
          className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.4)'; }}
          onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#475569' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 px-6 py-4"
            style={{ background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="mr-auto text-xs underline opacity-70 hover:opacity-100">تلاش مجدد</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { icon: Key, label: 'کد دسترسی' },
                  { icon: Store, label: 'نام فروشگاه' },
                  { icon: CreditCard, label: 'شماره کارت' },
                  { icon: Bot, label: 'ربات تلگرام' },
                  { icon: Calendar, label: 'تاریخ ایجاد' },
                ].map(({ icon: Icon, label }) => (
                  <th key={label} className="text-right px-5 py-4 font-medium text-xs whitespace-nowrap"
                    style={{ color: '#475569' }}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg animate-pulse"
                          style={{ background: 'rgba(255,255,255,0.06)', width: j === 1 ? '120px' : j === 0 ? '90px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.08)' }}>
                        <Store className="w-7 h-7" style={{ color: '#4338ca' }} />
                      </div>
                      <p className="font-medium" style={{ color: '#475569' }}>
                        {search ? 'فروشگاهی با این مشخصات یافت نشد' : 'هنوز هیچ فروشگاهی ثبت نشده'}
                      </p>
                      {!search && (
                        <button onClick={() => setShowModal(true)}
                          className="text-xs px-4 py-2 rounded-lg transition-all"
                          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                          اولین فروشگاه را اضافه کنید
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((shop, idx) => (
                  <tr key={shop.id}
                    className="group transition-all"
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* ID / Access Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs font-bold tracking-wider px-2.5 py-1 rounded-lg"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {shop.id}
                        </span>
                        <CopyButton text={shop.id} />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-white">{shop.name}</span>
                    </td>

                    {/* Card number */}
                    <td className="px-5 py-4">
                      {shop.card_number ? (
                        <div className="flex items-center gap-1 group">
                          <span className="font-mono text-sm" style={{ color: '#94a3b8' }} dir="ltr">
                            {shop.card_number}
                          </span>
                          <CopyButton text={shop.card_number} />
                        </div>
                      ) : (
                        <span style={{ color: '#334155' }}>—</span>
                      )}
                    </td>

                    {/* Bot status */}
                    <td className="px-5 py-4">
                      <BotBadge hasToken={shop.has_token} maskedToken={shop.telegram_token} />
                    </td>

                    {/* Created at */}
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: '#475569' }}>{formatDate(shop.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer stats */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs" style={{ color: '#334155' }}>
              نمایش {filtered.length} از {shops.length} فروشگاه
            </span>
            <span className="text-xs" style={{ color: '#334155' }}>
              · {shops.filter(s => s.has_token).length} ربات فعال
            </span>
            <span className="text-xs" style={{ color: '#334155' }}>
              · {shops.filter(s => !s.has_token).length} بدون ربات
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateShopModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
