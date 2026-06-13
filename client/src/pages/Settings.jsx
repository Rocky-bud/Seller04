import { useShop } from '../contexts/ShopContext';
import { fetchShop, updateShop } from '../hooks/useApi';
import CartRecovery from '../components/CartRecovery';
import {
  Settings as SettingsIcon,
  MessageSquare,
  Globe,
  Smartphone,
  Copy,
  Store,
  CreditCard,
  Bot,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const channels = [
  { id: 'web', label: 'وب‌سایت', icon: Globe, status: 'فعال', color: 'text-success-600 bg-success-50' },
  { id: 'telegram', label: 'تلگرام', icon: Smartphone, status: 'غیرفعال', color: 'text-slate-500 bg-slate-100' },
  { id: 'whatsapp', label: 'واتساپ', icon: MessageSquare, status: 'غیرفعال', color: 'text-slate-500 bg-slate-100' },
];

export default function Settings() {
  const { shopId } = useShop();
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({ name: '', card_number: '', system_prompt: '', loyalty_enabled: true, loyalty_earn_per_1000: 1, loyalty_redeem_value: 1000 });
  const [initial, setInitial] = useState({ name: '', card_number: '', system_prompt: '', loyalty_enabled: true, loyalty_earn_per_1000: 1, loyalty_redeem_value: 1000 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadShop = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setLoadError('');
    try {
      const shop = await fetchShop(shopId);
      const next = {
        name: shop?.name || '',
        card_number: shop?.card_number || '',
        system_prompt: shop?.system_prompt || '',
        loyalty_enabled: shop?.loyalty_enabled ?? true,
        loyalty_earn_per_1000: shop?.loyalty_earn_per_1000 ?? 1,
        loyalty_redeem_value: shop?.loyalty_redeem_value ?? 1000,
      };
      setForm(next);
      setInitial(next);
    } catch (err) {
      setLoadError(err.message || 'خطا در دریافت اطلاعات فروشگاه');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const dirty =
    form.name !== initial.name ||
    form.card_number !== initial.card_number ||
    form.system_prompt !== initial.system_prompt ||
    form.loyalty_enabled !== initial.loyalty_enabled ||
    Number(form.loyalty_earn_per_1000) !== Number(initial.loyalty_earn_per_1000) ||
    Number(form.loyalty_redeem_value) !== Number(initial.loyalty_redeem_value);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError('');
  };

  const handleToggleLoyalty = () => {
    setForm((prev) => ({ ...prev, loyalty_enabled: !prev.loyalty_enabled }));
    setSaved(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!shopId || saving || !dirty) return;
    setSaving(true);
    setSaveError('');
    setSaved(false);
    // STAGE 36: block an obviously invalid/fake card before it ever reaches the
    // bot. Iranian bank cards are exactly 16 digits (empty is allowed = unset).
    const cardDigits = (form.card_number || '').replace(/\D/g, '');
    if (cardDigits && cardDigits.length !== 16) {
      setSaveError('شماره کارت باید دقیقاً ۱۶ رقم باشد (یا خالی بماند).');
      setSaving(false);
      return;
    }
    const earn = Number(form.loyalty_earn_per_1000);
    const redeem = Number(form.loyalty_redeem_value);
    if (form.loyalty_enabled && (!Number.isFinite(earn) || earn < 0 || !Number.isFinite(redeem) || redeem < 1)) {
      setSaveError('مقادیر امتیاز نامعتبر است: نرخ کسب باید ۰ یا بیشتر و ارزش هر امتیاز باید حداقل ۱ باشد.');
      setSaving(false);
      return;
    }
    try {
      await updateShop(shopId, {
        name: form.name,
        card_number: form.card_number,
        system_prompt: form.system_prompt,
        loyalty_enabled: form.loyalty_enabled,
        loyalty_earn_per_1000: earn,
        loyalty_redeem_value: redeem,
      });
      setInitial({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'خطا در ذخیره تغییرات');
    } finally {
      setSaving(false);
    }
  };

  const copyShopId = () => {
    navigator.clipboard.writeText(shopId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">تنظیمات ربات</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت فروشگاه، شماره کارت و هوش مصنوعی</p>
        </div>
        <button
          onClick={loadShop}
          disabled={loading || saving}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          بازخوانی
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">اطلاعات فروشگاه</h3>
            <p className="text-xs text-slate-400">این اطلاعات در فروشگاه شما ذخیره می‌شوند</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 p-4 bg-danger-50 text-danger-600 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">نام فروشگاه</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="نام فروشگاه شما"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  شماره کارت بانکی (برای واریز مشتریان)
                </span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={form.card_number}
                onChange={handleChange('card_number')}
                placeholder="6037-XXXX-XXXX-XXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono text-left focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-primary-500 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1.5">این شماره کارت در گفتگو برای واریز وجه به مشتری نمایش داده می‌شود</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-slate-400" />
                  متن پرامپت سیستم هوش مصنوعی
                </span>
              </label>
              <textarea
                value={form.system_prompt}
                onChange={handleChange('system_prompt')}
                rows={8}
                placeholder="مثلاً: تو دستیار فروش یک فروشگاه پوشاک هستی. مودب، صمیمی و کوتاه پاسخ بده..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-7 resize-y focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-primary-500 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1.5">لحن و رفتار ربات را تعیین می‌کند؛ این متن به‌عنوان دستور سیستمی به مدل هوش مصنوعی ارسال می‌شود.</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-sm">
                {saveError ? (
                  <span className="inline-flex items-center gap-1.5 text-danger-600">
                    <AlertCircle className="w-4 h-4" />
                    {saveError}
                  </span>
                ) : saved ? (
                  <span className="inline-flex items-center gap-1.5 text-success-600">
                    <CheckCircle2 className="w-4 h-4" />
                    تغییرات با موفقیت ذخیره شد
                  </span>
                ) : dirty ? (
                  <span className="text-warning-600">تغییرات ذخیره‌نشده دارید</span>
                ) : (
                  <span className="text-slate-400">همه‌چیز ذخیره شده است</span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={!dirty || saving}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  !dirty || saving
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && !loadError && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">امتیاز وفاداری</h3>
              <p className="text-xs text-slate-400">مشتریان با هر خرید امتیاز می‌گیرند و می‌توانند در پرداخت بعدی خرج کنند</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">فعال‌سازی برنامهٔ امتیاز</p>
                <p className="text-xs text-slate-400 mt-0.5">با خاموش‌کردن، کسب و خرج امتیاز برای این فروشگاه غیرفعال می‌شود</p>
              </div>
              <button
                type="button"
                onClick={handleToggleLoyalty}
                className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${form.loyalty_enabled ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${form.loyalty_enabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className={form.loyalty_enabled ? 'space-y-5' : 'space-y-5 opacity-50 pointer-events-none'}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">امتیاز به‌ازای هر ۱۰۰۰ تومان خرید</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  dir="ltr"
                  value={form.loyalty_earn_per_1000}
                  onChange={handleChange('loyalty_earn_per_1000')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-primary-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">مثلاً ۱ یعنی هر ۱۰۰۰ تومان خرید = ۱ امتیاز</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ارزش هر امتیاز هنگام خرج‌کردن (تومان)</label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  dir="ltr"
                  value={form.loyalty_redeem_value}
                  onChange={handleChange('loyalty_redeem_value')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-primary-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">مثلاً ۱۰۰۰ یعنی هر امتیاز هنگام پرداخت ۱۰۰۰ تومان تخفیف می‌دهد</p>
              </div>
            </div>

            <p className="text-xs text-slate-400">این تنظیمات با دکمهٔ «ذخیره تغییرات» در کادر بالا ذخیره می‌شود.</p>
          </div>
        </div>
      )}

      <CartRecovery />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">کد اختصاصی فروشگاه</h3>
            <p className="text-xs text-slate-400">برای اتصال ربات به فروشگاه از این کد استفاده کنید</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono" dir="ltr">
            {shopId}
          </code>
          <button
            onClick={copyShopId}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              copied
                ? 'bg-success-50 text-success-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">کانال‌های ورودی</h3>
        <div className="space-y-3">
          {channels.map(({ id, label, icon: Icon, status, color }) => (
            <div key={id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-lg ${color}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">کانال‌های بیشتر به زودی اضافه خواهند شد</p>
      </div>
    </div>
  );
}
