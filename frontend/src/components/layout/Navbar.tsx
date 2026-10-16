import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  School,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, role, schoolSettings, switchRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const availableRoles: { role: Role; label: string; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-600' },
    { role: 'SCHOOL_ADMIN', label: 'School Admin', color: 'bg-indigo-600' },
    { role: 'PRINCIPAL', label: 'Principal', color: 'bg-blue-600' },
    { role: 'TEACHER', label: 'Teacher', color: 'bg-emerald-600' },
    { role: 'ACCOUNTANT', label: 'Accountant', color: 'bg-amber-600' },
    { role: 'RECEPTIONIST', label: 'Receptionist', color: 'bg-teal-600' },
    { role: 'PARENT', label: 'Parent Portal', color: 'bg-rose-600' },
    { role: 'STUDENT', label: 'Student Portal', color: 'bg-cyan-600' },
  ];

  const currentRoleInfo = availableRoles.find((r) => r.role === role) || availableRoles[1];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-[3px] border-[#fac217] shadow-xs backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Mobile Toggle & School Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src={schoolSettings?.logoUrl || '/kiva-logo.png'}
                alt="Kiva School Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-[#082c4b] text-base leading-tight tracking-tight">
                {schoolSettings?.schoolName || 'Kiva School'}
              </h1>
              <p className="text-xs text-[#5f7576] flex items-center gap-1.5 font-medium">
                <span>{schoolSettings?.campusName || 'PECHS Campus, Karachi'}</span>
                <span className="text-amber-400 font-bold">•</span>
                <span className="text-[#05897a] font-bold bg-[#eefcf9] px-2 py-0.5 rounded-full text-[11px] border border-[#d4f8ef]">
                  Academic Year 2025-2026
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-xs"
              title="Click to switch demo role view"
            >
              <span className={`w-2 h-2 rounded-full ${currentRoleInfo.color}`} />
              <span className="hidden md:inline text-slate-500 font-normal">Role:</span>
              <span className="font-semibold text-slate-800">{currentRoleInfo.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/80 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Switch Role View</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="py-1">
                  {availableRoles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => switchRole(item.role)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left font-medium transition-colors ${
                        role === item.role ? 'bg-indigo-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      {role === item.role && <Check className="w-3.5 h-3.5 text-brand-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Currency Pill */}
          <span className="hidden lg:flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
            <span>PKR (₨)</span>
          </span>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/20">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200/80 py-2 z-50 text-xs"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{user?.username}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {user?.role}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
