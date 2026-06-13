import { useState, useEffect, useCallback } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { authHeaders } from '../../hooks/useApi'; // Bug-fix #10: attach auth to inline order mutations
import {
  ShoppingBag, RefreshCw, Search, X, AlertCircle, CheckCircle2,
  Loader2, Eye, CheckCheck, XCircle, Clock, Package, User,
  MapPin, Phone, ImageOff, ExternalLink
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n) {
  return Number(n || 0).toLocaleString('fa-IR');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id) {
  return id ? `#${id.slice(-6).toUpperCase()}` : '—';
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending_receipt:   { label: 'در انتظار پرداخت', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', dot: 'bg-yellow-400'  },
  awaiting_approval: { label: 'در انتظار تأیید',   color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)',  dot: 'bg-blue-400'   },
  approved:          { label: 'تأیید شده',          color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)', dot: 'bg-emerald-400' },
  rejected:          { label: 'لغو شده',            color: '#f87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.22)',  dot: 'bg-red-400'    },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending_receipt;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function ReceiptModal({ order, onClose }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden z-10"
        style={{ background: '#0f1929', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-base font-bold text-white">فیش واریزی</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              سفارش {shortId(order.id)} · {order.customer_name || order.user_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {order.receipt_url && !imgError && (
              <a href={order.receipt_url} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl transition-colors"
                style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)' }}
                title="باز کردن در تب جدید">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button onClick={onClose} className="p-2 rounded-xl"
              style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt image */}
        <div className="p-6">
          {!order.receipt_url ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <ImageOff className="w-10 h-10" style={{ color: '#334155' }} />
              <p className="text-sm" style={{ color: '#475569' }}>هنوز فیشی ارسال نشده</p>
              <p className="text-xs" style={{ color: '#334155' }}>مشتری هنوز رسید پرداخت آپلود نکرده است</p>
            </div>
          ) : imgError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.2)' }}>
              <ImageOff className="w-10 h-10" style={{ color: '#f87171' }} />
              <p className="text-sm" style={{ color: '#f87171' }}>خطا در بارگذاری تصویر</p>
              <a href={order.receipt_url} target="_blank" rel="noopener noreferrer"
                className="text-xs underline" style={{ color: '#60a5fa' }}>
                باز کردن لینک مستقیم
              </a>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', minHeight: '200px' }}>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
                </div>
              )}
              <img
                src={order.receipt_url}
                alt="فیش واریزی"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className="w-full rounded-2xl object-contain max-h-[60vh]"
                style={{ display: imgLoaded ? 'block' : 'none' }}
              />
            </div>
          )}

          {/* Order summary */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'مشتری', value: order.customer_name || '—', icon: User },
              { label: 'شماره تماس', value: order.phone || '—', icon: Phone },
              { label: 'آدرس', value: order.shipping_address || '—', icon: MapPin },
              { label: 'مبلغ', value: `${formatPrice(order.total_price)} تومان`, icon: ShoppingBag },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3" style={{ color: '#475569' }} />
                  <span className="text-[10px]" style={{ color: '#475569' }}>{label}</span>
                </div>
                <p className="text-xs font-medium text-white truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Alert Bar ────────────────────────────────────────────────────────────────

function AlertBar({ type, msg, onClose }) {
  if (!msg) return null;
  const ok = type === 'success';
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: ok ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${ok ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
        color: ok ? '#6ee7b7' : '#fca5a5',
      }}>
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MerchantOrders({ onPendingCountChange }) {
  const { shopId } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { orderId: 'confirm'|'reject' }
  const [refreshKey, setRefreshKey] = useState(0);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 5000);
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/shop?shopId=${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrders(data.data || []);
      const pending = (data.data || []).filter(o => o.status === 'awaiting_approval').length;
      onPendingCountChange?.(pending);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [shopId, onPendingCountChange]);

  useEffect(() => { fetchOrders(); }, [fetchOrders, refreshKey]);

  // ── Confirm payment ─────────────────────────────────────────────────────────
  const handleConfirm = async (order) => {
    setActionLoading(p => ({ ...p, [order.id]: 'confirm' }));
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm`, {
        method: 'PATCH',
        headers: await authHeaders(), // Bug-fix #10: 401 under RBAC enforcement without auth
        body: JSON.stringify({ shopId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در تأیید سفارش');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'approved' } : o));
      const newPending = orders.filter(o => o.status === 'awaiting_approval' && o.id !== order.id).length;
      onPendingCountChange?.(newPending);
      showAlert('success', `سفارش ${shortId(order.id)} تأیید شد و موجودی کاهش یافت ✓`);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[order.id]; return n; });
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = async (order) => {
    setActionLoading(p => ({ ...p, [order.id]: 'reject' }));
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: await authHeaders(), // Bug-fix #10: 401 under RBAC enforcement without auth
        // Bug-fix #9: Bug #7 made shopId mandatory on the status route; without it
        // this inline reject button returns 400. handleConfirm already sends shopId.
        body: JSON.stringify({ status: 'rejected', shopId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در رد سفارش');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'rejected' } : o));
      const newPending = orders.filter(o => o.status === 'awaiting_approval' && o.id !== order.id).length;
      onPendingCountChange?.(newPending);
      showAlert('success', `سفارش ${shortId(order.id)} رد شد و موجودی بازگردانده شد`);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[order.id]; return n; });
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchSearch = !search
      || o.customer_name?.includes(search)
      || o.user_id?.includes(search)
      || o.id?.includes(search)
      || o.products?.name?.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const counts = {
    all: orders.length,
    awaiting_approval: orders.filter(o => o.status === 'awaiting_approval').length,
    pending_receipt:   orders.filter(o => o.status === 'pending_receipt').length,
    approved:          orders.filter(o => o.status === 'approved').length,
    rejected:          orders.filter(o => o.status === 'rejected').length,
  };
  const totalRevenue = orders.filter(o => o.status === 'approved')
    .reduce((s, o) => s + Number(o.total_price || 0), 0);

  const FILTERS = [
    { key: 'all',              label: 'همه' },
    { key: 'awaiting_approval',label: 'در انتظار تأیید' },
    { key: 'pending_receipt',  label: 'در انتظار پرداخت' },
    { key: 'approved',         label: 'تأیید شده' },
    { key: 'rejected',         label: 'لغو شده' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-white">مدیریت سفارشات</h1>
            {counts.awaiting_approval > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                {counts.awaiting_approval} در انتظار تأیید
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            بررسی فیش‌ها، تأیید پرداخت و مدیریت وضعیت سفارشات
          </p>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
          className="p-2.5 rounded-xl transition-all disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'کل سفارشات',    value: counts.all.toLocaleString('fa-IR'),           color: '#94a3b8' },
          { label: 'در انتظار تأیید', value: counts.awaiting_approval.toLocaleString('fa-IR'), color: '#60a5fa' },
          { label: 'تأیید شده',     value: counts.approved.toLocaleString('fa-IR'),        color: '#34d399' },
          { label: 'درآمد تأیید‌شده', value: `${formatPrice(totalRevenue)} ت`,            color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs mb-1" style={{ color: '#475569' }}>{label}</p>
            <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      <AlertBar type={alert.type} msg={alert.msg} onClose={() => setAlert({ type: '', msg: '' })} />

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام مشتری، شماره سفارش..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.4)'}
            onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'} />
          {search && <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}><X className="w-4 h-4" /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className="px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
              style={statusFilter === f.key
                ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569' }}>
              {f.label}
              {counts[f.key] > 0 && <span className="mr-1.5 opacity-60">{counts[f.key].toLocaleString('fa-IR')}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['شماره سفارش', 'مشتری', 'محصول', 'تعداد', 'مبلغ (تومان)', 'وضعیت', 'تاریخ', 'عملیات'].map(col => (
                  <th key={col} className="text-right px-4 py-4 text-xs font-medium whitespace-nowrap"
                    style={{ color: '#475569' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded-lg animate-pulse"
                          style={{ background: 'rgba(255,255,255,0.06)', width: j === 1 ? '100px' : j === 5 ? '90px' : j === 7 ? '130px' : '70px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(59,130,246,0.08)' }}>
                        <ShoppingBag className="w-7 h-7" style={{ color: '#1d4ed8' }} />
                      </div>
                      <p className="text-sm" style={{ color: '#475569' }}>
                        {search || statusFilter !== 'all' ? 'سفارشی با این مشخصات یافت نشد' : 'هنوز سفارشی ثبت نشده'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => {
                  const isLoadingConfirm = actionLoading[order.id] === 'confirm';
                  const isLoadingReject  = actionLoading[order.id] === 'reject';
                  const canAct = order.status === 'awaiting_approval';

                  return (
                    <tr key={order.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Order ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold" style={{ color: '#94a3b8' }}>
                          {shortId(order.id)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-xs font-medium text-white leading-tight">
                            {order.customer_name || '—'}
                          </p>
                          <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#334155' }}>
                            {order.user_id}
                          </p>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 shrink-0" style={{ color: '#475569' }} />
                          <span className="text-xs text-white">
                            {order.products?.name || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                          {Number(order.quantity || 1).toLocaleString('fa-IR')}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono font-semibold" style={{ color: '#34d399' }}>
                          {formatPrice(order.total_price)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] whitespace-nowrap" style={{ color: '#475569' }}>
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View Receipt */}
                          <button onClick={() => setReceiptOrder(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                            style={{
                              background: order.receipt_url ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${order.receipt_url ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)'}`,
                              color: order.receipt_url ? '#a78bfa' : '#334155',
                            }}
                            onMouseEnter={e => order.receipt_url && (e.currentTarget.style.background = 'rgba(167,139,250,0.18)')}
                            onMouseLeave={e => order.receipt_url && (e.currentTarget.style.background = 'rgba(167,139,250,0.1)')}>
                            <Eye className="w-3 h-3" /> فیش
                          </button>

                          {/* Confirm */}
                          {canAct && (
                            <button onClick={() => handleConfirm(order)} disabled={!!actionLoading[order.id]}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
                              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
                              onMouseEnter={e => !actionLoading[order.id] && (e.currentTarget.style.background = 'rgba(52,211,153,0.18)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}>
                              {isLoadingConfirm
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCheck className="w-3 h-3" />}
                              تأیید
                            </button>
                          )}

                          {/* Reject */}
                          {canAct && (
                            <button onClick={() => handleReject(order)} disabled={!!actionLoading[order.id]}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
                              onMouseEnter={e => !actionLoading[order.id] && (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}>
                              {isLoadingReject
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <XCircle className="w-3 h-3" />}
                              رد
                            </button>
                          )}

                          {/* Status label when not actionable */}
                          {!canAct && order.status === 'pending_receipt' && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: '#334155' }}>
                              <Clock className="w-3 h-3" /> انتظار فیش
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs" style={{ color: '#334155' }}>
              نمایش {filtered.length.toLocaleString('fa-IR')} از {orders.length.toLocaleString('fa-IR')} سفارش
            </span>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
}
