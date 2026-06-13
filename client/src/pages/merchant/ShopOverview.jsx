import { useState, useEffect, useCallback } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { fetchDashboardStats } from '../../hooks/useApi';
import { formatToman } from '../../utils/helpers';
import RecoveryInsight from '../../components/RecoveryInsight';
import {
  TrendingUp, Clock, Package, AlertTriangle,
  RefreshCw, ShoppingBag, User, ArrowUpRight
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortId(id) {
  return id ? `#${id.slice(-6).toUpperCase()}` : '—';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fa-IR', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending_receipt:   { label: 'در انتظار پرداخت', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.22)' },
  awaiting_approval: { label: 'در انتظار تأیید',   color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)' },
  approved:          { label: 'تأیید شده',          color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  rejected:          { label: 'لغو شده',            color: '#f87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.22)'  },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending_receipt;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, gradient, glowColor, loading }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: '#0f1929',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: `0 4px 32px ${glowColor}18`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: glowColor }}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: gradient, boxShadow: `0 4px 16px ${glowColor}40` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Arrow indicator */}
        <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 opacity-20" style={{ color: glowColor }} />
      </div>

      <div className="relative mt-4">
        {loading ? (
          <div className="h-7 w-24 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
        ) : (
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
        )}
        <p className="text-xs mt-2 font-medium" style={{ color: '#64748b' }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 72, 56, 52, 44].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3.5 rounded-md animate-pulse"
            style={{ background: 'rgba(255,255,255,0.06)', width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MerchantShopOverview() {
  const { shopId } = useShop();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async (isManual = false) => {
    if (!shopId) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats(shopId);
      setStats(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  const statCards = stats
    ? [
        {
          label: 'درآمد تأییدشده',
          value: formatToman(stats.totalRevenue),
          icon: TrendingUp,
          gradient: 'linear-gradient(135deg,#10b981,#059669)',
          glowColor: '#10b981',
        },
        {
          label: 'سفارشات در انتظار',
          value: stats.pendingCount.toLocaleString('fa-IR'),
          icon: Clock,
          gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
          glowColor: '#3b82f6',
        },
        {
          label: 'محصولات فعال',
          value: stats.totalProducts.toLocaleString('fa-IR'),
          icon: Package,
          gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
          glowColor: '#8b5cf6',
        },
        {
          label: 'هشدارهای انبار',
          value: stats.stockAlertCount.toLocaleString('fa-IR'),
          icon: AlertTriangle,
          gradient: stats.stockAlertCount > 0
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'linear-gradient(135deg,#475569,#334155)',
          glowColor: stats.stockAlertCount > 0 ? '#f59e0b' : '#475569',
        },
      ]
    : Array(4).fill(null);

  return (
    <div className="space-y-7" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">��روری کلی فروشگاه</h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            نمای لحظه‌ای وضعیت فروش، سفارشات و انبار
          </p>
        </div>

        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: '#60a5fa',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          بروزرسانی
        </button>
      </div>

      {/* Last updated */}
      {lastUpdated && !loading && (
        <p className="text-[11px] -mt-4" style={{ color: '#334155' }}>
          آخرین بروزرسانی:{' '}
          {lastUpdated.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) =>
          card ? (
            <StatCard key={card.label} {...card} loading={false} />
          ) : (
            <div
              key={i}
              className="rounded-2xl p-5 animate-pulse"
              style={{ background: '#0f1929', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-11 h-11 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-6 w-20 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3 w-28 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          )
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0f1929', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Table header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
          >
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">آخرین سفارشات</h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>۵ سفارش اخیر فروشگاه</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['شناسه سفارش', 'نام مشتری', 'مبلغ', 'وضعیت', 'تاریخ'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-[11px] font-semibold"
                    style={{ color: '#334155' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(null).map((_, i) => <SkeletonRow key={i} />)
                : !stats?.recentOrders?.length
                ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: '#334155' }}>
                      هنوز هیچ سفارشی ثبت نشده است
                    </td>
                  </tr>
                )
                : stats.recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{
                      borderBottom: idx < stats.recentOrders.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold" style={{ color: '#60a5fa' }}>
                        {shortId(order.id)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <User className="w-3 h-3" style={{ color: '#475569' }} />
                        </div>
                        <span className="text-xs text-white truncate max-w-[120px]">
                          {order.customer_name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: '#34d399' }}>
                        {Number(order.total_price || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: '#475569' }}>
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Stock Alerts Panel (shown only when there are alerts) ── */}
      {stats && stats.stockAlertCount > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0f1929', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid rgba(245,158,11,0.1)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">هشدارهای انبار</h2>
              <p className="text-[11px] mt-0.5" style={{ color: '#92400e' }}>
                {stats.outOfStockAlerts.length > 0 && `${stats.outOfStockAlerts.length.toLocaleString('fa-IR')} محصول ناموجود`}
                {stats.outOfStockAlerts.length > 0 && stats.lowStockAlerts.length > 0 && ' · '}
                {stats.lowStockAlerts.length > 0 && `${stats.lowStockAlerts.length.toLocaleString('fa-IR')} محصول کم‌موجود`}
              </p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Out of stock items */}
            {stats.outOfStockAlerts.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <span className="text-xs text-white truncate max-w-[140px]">{p.name}</span>
                <span
                  className="text-[11px] font-bold shrink-0 mr-2 px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                >
                  ناموجود
                </span>
              </div>
            ))}

            {/* Low stock items */}
            {stats.lowStockAlerts.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <span className="text-xs text-white truncate max-w-[140px]">{p.name}</span>
                <span
                  className="text-[11px] font-bold shrink-0 mr-2 px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
                >
                  فقط {p.stock.toLocaleString('fa-IR')} عدد
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Abandoned-cart recovery insight (PHASE 3 · STEP 2) ── */}
      <RecoveryInsight />
    </div>
  );
}
