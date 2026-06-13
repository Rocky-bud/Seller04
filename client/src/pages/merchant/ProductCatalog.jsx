import { useState, useEffect, useCallback } from 'react';
import { useShop } from '../../contexts/ShopContext';
import { authHeaders } from '../../hooks/useApi'; // Bug-fix #11: attach auth to product reads + inline delete
import {
  Package, Plus, Search, X, Edit2, Trash2, AlertCircle,
  CheckCircle2, Loader2, RefreshCw, Tag, Layers, DollarSign,
  FileText, Image
} from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatPrice(n) {
  return Number(n || 0).toLocaleString('fa-IR');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StockBadge({ stock }) {
  const n = Number(stock || 0);
  if (n === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> ناموجود
    </span>
  );
  if (n <= 3) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
      {n.toLocaleString('fa-IR')} عدد
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      {n.toLocaleString('fa-IR')} عدد
    </span>
  );
}

// ─── Shared field styles ──────────────────────────────────────────────────────
const fieldBase = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
};
const onFocus = e => { e.target.style.border = '1px solid rgba(59,130,246,0.55)'; e.target.style.background = 'rgba(255,255,255,0.08)'; };
const onBlur  = e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; };

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductModal({ product, shopId, onClose, onSaved }) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [stock, setStock] = useState(product?.stock ?? '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return 'نام محصول الزامی است';
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) return 'قیمت معتبر وارد کنید';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) return 'موجودی معتبر وارد کنید';
    if (imageUrl.trim() && !/^https?:\/\/.+/.test(imageUrl.trim())) return 'لینک تصویر باید با http یا https شروع شود';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const url = isEdit ? `/api/products/${product.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          name: name.trim(),
          price: Number(price),
          stock: Number(stock),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در ذخیره‌سازی');
      onSaved(data.data, isEdit);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl p-7 z-10 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0f1929', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEdit ? 'ویرایش محصول' : 'افزودن محصول جدید'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              {isEdit ? `ویرایش: ${product.name}` : 'اطلاعات محصول را وارد کنید'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cbd5e1' }}>
              <Tag className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} /> نام محصول <span style={{ color: '#3b82f6' }}>*</span>
            </label>
            <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="مثال: تی‌شرت پنبه‌ای سایز L"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={fieldBase} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Price + Stock in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                <DollarSign className="w-3.5 h-3.5" style={{ color: '#34d399' }} /> قیمت (تومان) <span style={{ color: '#3b82f6' }}>*</span>
              </label>
              <input
                type="number" min="0" value={price}
                onChange={e => { setPrice(e.target.value); setError(''); }}
                placeholder="۰"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                style={fieldBase} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cbd5e1' }}>
                <Layers className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} /> موجودی انبار <span style={{ color: '#3b82f6' }}>*</span>
              </label>
              <input
                type="number" min="0" step="1" value={stock}
                onChange={e => { setStock(e.target.value); setError(''); }}
                placeholder="۰"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
                style={fieldBase} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cbd5e1' }}>
              <FileText className="w-3.5 h-3.5" style={{ color: '#fb923c' }} /> توضیحات
              <span className="text-xs font-normal" style={{ color: '#334155' }}>(اختیاری)</span>
            </label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setError(''); }}
              placeholder="توضیح کوتاهی درباره محصول..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
              style={fieldBase} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cbd5e1' }}>
              <Image className="w-3.5 h-3.5" style={{ color: '#34d399' }} /> لینک تصویر
              <span className="text-xs font-normal" style={{ color: '#334155' }}>(اختیاری)</span>
            </label>
            <input
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setError(''); }}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none font-mono"
              style={fieldBase} onFocus={onFocus} onBlur={onBlur}
            />
            {imageUrl.trim() && /^https?:\/\/.+/.test(imageUrl.trim()) && (
              <div className="mt-2 rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)', height: '100px' }}>
                <img
                  src={imageUrl.trim()}
                  alt="پیش‌نمایش"
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <p className="text-xs" style={{ color: '#334155' }}>
              اگر لینک وارد کنید، تصویر در ربات تلگرام نمایش داده می‌شود
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
              انصراف
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.28)' }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...</>
                : isEdit
                  ? <><Edit2 className="w-4 h-4" /> ذخیره تغییرات</>
                  : <><Plus className="w-4 h-4" /> افزودن محصول</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ product, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-3xl p-7 z-10 text-center"
        style={{ background: '#0f1929', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <Trash2 className="w-6 h-6" style={{ color: '#f87171' }} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">حذف محصول</h2>
        <p className="text-sm mb-1" style={{ color: '#64748b' }}>
          آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
        <p className="text-sm font-medium mb-6 px-4 py-2 rounded-xl"
          style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          {product.name}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
            انصراف
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> حذف...</> : <><Trash2 className="w-4 h-4" /> بله، حذف شود</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Alert bar ────────────────────────────────────────────────────────────────

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

export default function MerchantProductCatalog() {
  const { shopId } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [modal, setModal] = useState(null); // null | 'create' | product-object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?shopId=${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProducts(data.data || []);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts, refreshKey]);

  // ── Modal saved callback ────────────────────────────────────────────────────
  const handleSaved = (savedProduct, isEdit) => {
    if (isEdit) {
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
      showAlert('success', `محصول "${savedProduct.name}" با موفقیت ویرایش شد ✓`);
    } else {
      setProducts(prev => [...prev, savedProduct]);
      showAlert('success', `محصول "${savedProduct.name}" با موفقیت افزوده شد ✓`);
    }
    setModal(null);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}?shopId=${encodeURIComponent(shopId)}`, {
        method: 'DELETE',
        headers: await authHeaders(), // Bug-fix #11: owner-only delete 401s without auth
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'خطا در حذف محصول');
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      showAlert('success', `محصول "${deleteTarget.name}" حذف شد`);
      setDeleteTarget(null);
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter(p => Number(p.stock) <= 3 && Number(p.stock) > 0).length;
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;

  return (
    <div className="flex flex-col gap-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-white">کاتالوگ محصولات</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-medium"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
              {products.length} محصول
            </span>
            {lowStock > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                {lowStock} کم‌موجود
              </span>
            )}
            {outOfStock > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {outOfStock} ناموجود
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>محصولات فروشگاه شما — فقط این فروشگاه دیده می‌شود</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
            className="p-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
            <Plus className="w-4 h-4" /> افزودن محصول جدید
          </button>
        </div>
      </div>

      {/* Alert */}
      <AlertBar type={alert.type} msg={alert.msg} onClose={() => setAlert({ type: '', msg: '' })} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام یا توضیحات..."
          className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => { e.target.style.border = '1px solid rgba(59,130,246,0.4)'; }}
          onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }} />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'نام محصول' },
                  { label: 'قیمت (تومان)' },
                  { label: 'موجودی' },
                  { label: 'تاریخ ثبت' },
                  { label: 'عملیات' },
                ].map(({ label }) => (
                  <th key={label} className="text-right px-5 py-4 text-xs font-medium whitespace-nowrap"
                    style={{ color: '#475569' }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg animate-pulse"
                          style={{ background: 'rgba(255,255,255,0.06)', width: j === 0 ? '120px' : j === 3 ? '160px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(59,130,246,0.08)' }}>
                        <Package className="w-7 h-7" style={{ color: '#1d4ed8' }} />
                      </div>
                      <p className="font-medium" style={{ color: '#475569' }}>
                        {search ? 'محصولی با این مشخصات یافت نشد' : 'هنوز محصولی اضافه نشده'}
                      </p>
                      {!search && (
                        <button onClick={() => setModal('create')}
                          className="text-xs px-4 py-2 rounded-lg"
                          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                          اولین محصول را اضافه کنید
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <tr key={product.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Name */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-white">{product.name}</span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm" style={{ color: '#34d399' }}>
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs mr-1" style={{ color: '#334155' }}>ت</span>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: '#475569' }}>{formatDate(product.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}>
                          <Edit2 className="w-3 h-3" /> ویرایش
                        </button>
                        <button onClick={() => setDeleteTarget(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}>
                          <Trash2 className="w-3 h-3" /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs" style={{ color: '#334155' }}>
              نمایش {filtered.length.toLocaleString('fa-IR')} از {products.length.toLocaleString('fa-IR')} محصول
            </span>
            {products.length > 0 && (
              <span className="text-xs" style={{ color: '#334155' }}>
                · مجموع موجودی: {products.reduce((s, p) => s + Number(p.stock || 0), 0).toLocaleString('fa-IR')} عدد
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          shopId={shopId}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
