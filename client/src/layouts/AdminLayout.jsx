import { useState } from 'react';
import { useShop } from '../contexts/ShopContext';
import { LayoutDashboard, Store, Bot, LogOut, Zap, ChevronLeft } from 'lucide-react';
import AdminOverview from '../pages/admin/Overview';
import AdminShopManagement from '../pages/admin/ShopManagement';
import AdminAIUsage from '../pages/admin/AIUsage';

const navItems = [
  { id: 'overview', label: 'مروری کلی', icon: LayoutDashboard, desc: 'آمار جهانی سیستم' },
  { id: 'shops', label: 'مدیریت فروشگاه‌ها', icon: Store, desc: 'فروشگاه‌ها و ربات‌ها' },
  { id: 'ai', label: 'مصرف هوش مصنوعی', icon: Bot, desc: 'گزارش استفاده از AI' },
];

const pages = {
  overview: AdminOverview,
  shops: AdminShopManagement,
  ai: AdminAIUsage,
};

export default function AdminLayout() {
  const { logout } = useShop();
  const [active, setActive] = useState('overview');
  const Page = pages[active] || AdminOverview;

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: '#080e1f' }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col h-screen shrink-0 sticky top-0"
        style={{ background: '#0b1120', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Brand */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">پنل مدیر کل</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>Super Admin Dashboard</p>
            </div>
          </div>

          {/* Admin badge */}
          <div className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
            <span className="text-xs font-medium" style={{ color: '#c4b5fd' }}>دسترسی کامل سیستم</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, desc }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group text-right"
                style={isActive
                  ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }
                  : { background: 'transparent', border: '1px solid transparent', color: '#64748b' }
                }
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={isActive
                    ? { background: 'rgba(99,102,241,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)' }
                  }>
                  <Icon className="w-4 h-4" style={{ color: isActive ? '#a5b4fc' : '#475569' }} />
                </div>
                <div className="text-right flex-1">
                  <p className="leading-tight">{label}</p>
                  <p className="text-[10px] mt-0.5 font-normal" style={{ color: isActive ? '#6366f1' : '#334155' }}>{desc}</p>
                </div>
                {isActive && <ChevronLeft className="w-3.5 h-3.5 shrink-0" style={{ color: '#6366f1' }} />}
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
            خروج از سیستم
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Page />
        </div>
      </main>
    </div>
  );
}
