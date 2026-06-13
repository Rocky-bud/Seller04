import { useState, useEffect, useCallback } from 'react';
import { useShop } from '../contexts/ShopContext';
import { authHeaders } from '../hooks/useApi'; // Bug-fix #11: attach auth to viewer-guarded reads
import { LayoutDashboard, Bot, Package, ShoppingBag, LogOut, Store, ChevronLeft } from 'lucide-react';
import MerchantShopOverview from '../pages/merchant/ShopOverview';
import MerchantBotConfig from '../pages/merchant/BotConfig';
import MerchantProductCatalog from '../pages/merchant/ProductCatalog';
import MerchantOrders from '../pages/merchant/Orders';

export default function MerchantLayout() {
  const { shopId, logout } = useShop();
  const [active, setActive] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending-approval count independently so the badge updates
  // even when the Orders page hasn't been visited yet
  const refreshPending = useCallback(async () => {
    if (!shopId) return;
    try {
      const res = await fetch(`/api/orders/shop?shopId=${encodeURIComponent(shopId)}`, { headers: await authHeaders() }); // Bug-fix #11
      const data = await res.json();
      if (data.success) {
        setPendingCount((data.data || []).filter(o => o.status === 'awaiting_approval').length);
      }
    } catch {
      // silent — badge is best-effort
    }
  }, [shopId]);

  useEffect(() => {
    refreshPending();
    const id = setInterval(refreshPending, 30_000); // poll every 30s
    return () => clearInterval(id);
  }, [refreshPending]);

  const navItems = [
    { id: 'overview',  label: 'مروری کلی',        icon: LayoutDashboard, desc: 'وضعیت فروشگاه' },
    { id: 'bot',       label: 'تنظیمات ربات',     icon: Bot,             desc: 'تلگرام و وب‌هوک' },
    { id: 'products',  label: 'کاتالوگ محصولات',  icon: Package,         desc: 'موجودی و قیمت‌ها' },
    { id: 'orders',    label: 'سفارشات',           icon: ShoppingBag,     desc: 'مدیریت و تأیید', badge: pendingCount },
  ];

  const pages = { overview: MerchantShopOverview, bot: MerchantBotConfig, products: MerchantProductCatalog };
  const Page = pages[active];

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: '#080e1f' }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col h-screen shrink-0 sticky top-0"
        style={{ background: '#0b1120', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Brand */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">داشبورد فروشگاه</p>
              <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#475569' }} dir="ltr">{shopId}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span className="text-xs font-medium" style={{ color: '#93c5fd' }}>فروشگاه فعال</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, desc, badge }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-right"
                style={isActive
                  ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }
                  : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }
                }
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all relative"
                  style={isActive ? { background: 'rgba(59,130,246,0.2)' } : { background: 'rgba(255,255,255,0.04)' }}>
                  <Icon className="w-4 h-4" style={{ color: isActive ? '#93c5fd' : '#475569' }} />
                  {/* Pending badge dot */}
                  {badge > 0 && (
                    <span className="absolute -top-1 -left-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1"
                      style={{ background: '#3b82f6', boxShadow: '0 0 0 2px #0b1120' }}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <div className="text-right flex-1">
                  <p className="leading-tight">{label}</p>
                  <p className="text-[10px] mt-0.5 font-normal" style={{ color: isActive ? '#3b82f6' : '#334155' }}>{desc}</p>
                </div>
                {isActive && <ChevronLeft className="w-3.5 h-3.5 shrink-0" style={{ color: '#3b82f6' }} />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {active === 'orders'
            ? <MerchantOrders onPendingCountChange={setPendingCount} />
            : Page ? <Page /> : null}
        </div>
      </main>
    </div>
  );
}
