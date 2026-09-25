import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut, PiggyBank, Receipt, Wallet } from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: Wallet },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30">
                <Wallet size={18} strokeWidth={2.4} />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-slate-900">Expense Tracker</span>
            </div>
            <nav className="hidden gap-1 sm:flex">
              {links.map((link) => {
                const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 shadow-sm shadow-brand-600/30"
                      />
                    )}
                    <link.icon size={15} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {link.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white shadow-sm">
                {user ? initials(user.name) : ''}
              </div>
              <span className="text-sm font-medium text-slate-600">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1.5 sm:hidden">
          {links.map((link) => {
            const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <link.icon size={15} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
