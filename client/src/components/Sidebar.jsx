import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileCheck, Package, Settings, LogOut, Store, Users, Megaphone } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';

const navItems = [
  { to: '/dashboard', label: 'میز کار', icon: LayoutDashboard },
  { to: '/receipts', label: 'تأیید فیش‌های مالی', icon: FileCheck },
  { to: '/products', label: 'مدیریت محصولات', icon: Package },
  { to: '/customers', label: 'مدیریت مشتریان', icon: Users },
  { to: '/broadcast', label: 'پیام همگانی', icon: Megaphone },
  { to: '/shops', label: 'مدیریت فروشگاه‌ها', icon: Store },
  { to: '/settings', label: 'تنظیمات ربات', icon: Settings },
];

export default function Sidebar() {
  const { shopId, logout } = useShop();

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col h-screen shrink-0 sticky top-0">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">فروشگاه من</h2>
            <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{shopId}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
              ].join(' ')
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          خروج
        </button>
      </div>
    </aside>
  );
}
