import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sidebarItems } from '../data/mockData';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';
  const userEmail = user?.email || '';
  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-gradient-to-r from-[#1d293d] to-[#0f172b] flex flex-col z-50">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3">
        <img
          src="/assets/logo.png"
          alt="MedEffects"
          className="h-[30px] w-[137px] object-cover"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#2c3850] mx-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0089ff] to-[#00d4ff] text-white shadow-[0px_1px_12px_0px_rgba(0,141,255,0.2)]'
                  : 'text-[#aeb0b6] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-[#de524c] text-white text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[23px] text-center leading-none">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2c3850] flex items-center justify-center text-white text-sm font-semibold">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{userName}</p>
          <p className="text-[#aeb0b6] text-xs truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#aeb0b6] hover:text-white transition-colors"
          title="Logout"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </aside>
  );
}
