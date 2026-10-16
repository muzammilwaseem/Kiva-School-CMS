import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  Receipt,
  Award,
  Clock,
  BookMarked,
  FileText,
  Megaphone,
  Library,
  Bus,
  Boxes,
  BarChart3,
  Shield,
  Settings,
  History,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'TEACHER',
      'ACCOUNTANT',
      'RECEPTIONIST',
      'PARENT',
      'STUDENT',
    ],
  },
  {
    name: 'Admissions',
    path: '/admissions',
    icon: UserPlus,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'RECEPTIONIST'],
  },
  {
    name: 'Students',
    path: '/students',
    icon: GraduationCap,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'RECEPTIONIST', 'ACCOUNTANT'],
  },
  {
    name: 'Teachers & Staff',
    path: '/staff',
    icon: Briefcase,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'],
  },
  {
    name: 'Academics',
    path: '/academics',
    icon: BookOpen,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'],
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: CalendarCheck,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    name: 'Fees & Finance',
    path: '/fees',
    icon: Receipt,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'PARENT', 'STUDENT'],
  },
  {
    name: 'Examinations',
    path: '/examinations',
    icon: Award,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    name: 'Timetable',
    path: '/timetable',
    icon: Clock,
    roles: [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'TEACHER',
      'ACCOUNTANT',
      'RECEPTIONIST',
      'PARENT',
      'STUDENT',
    ],
  },
  {
    name: 'Homework',
    path: '/homework',
    icon: BookMarked,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'],
  },
  {
    name: 'Leave Management',
    path: '/leaves',
    icon: FileText,
    roles: [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'TEACHER',
      'ACCOUNTANT',
      'RECEPTIONIST',
      'PARENT',
      'STUDENT',
    ],
  },
  {
    name: 'Announcements',
    path: '/announcements',
    icon: Megaphone,
    roles: [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'PRINCIPAL',
      'TEACHER',
      'ACCOUNTANT',
      'RECEPTIONIST',
      'PARENT',
      'STUDENT',
    ],
  },
  {
    name: 'Library',
    path: '/library',
    icon: Library,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
  },
  {
    name: 'Transport',
    path: '/transport',
    icon: Bus,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'RECEPTIONIST', 'PARENT', 'STUDENT'],
  },
  {
    name: 'Inventory',
    path: '/inventory',
    icon: Boxes,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'],
  },
  {
    name: 'Users & Roles',
    path: '/users',
    icon: Shield,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  },
  {
    name: 'School Settings',
    path: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  },
  {
    name: 'Audit Logs',
    path: '/audit-logs',
    icon: History,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user, schoolSettings } = useAuth();
  const location = useLocation();

  // Filter items by role
  const filteredNavItems = navItems.filter((item) => {
    if (!role) return false;
    if (role === 'SUPER_ADMIN') return true;
    return item.roles.includes(role);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md ring-1 ring-white/10 shrink-0">
              <img
                src={schoolSettings?.logoUrl || '/kiva-logo.png'}
                alt="Kiva School Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-white text-base tracking-tight block truncate">
                {schoolSettings?.schoolName || 'Kiva School'}
              </span>
              <span className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span>School CMS</span>
                <span className="text-amber-400 font-bold">•</span>
                <span className="text-slate-400">PK</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Card */}
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
            {user?.username?.substring(0, 2).toUpperCase() || 'SA'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.username || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 uppercase font-medium">{role?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0db29b] text-white shadow-sm font-extrabold translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#48bdab]'}`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          <span>Kiva School Management System v1.0</span>
        </div>
      </aside>
    </>
  );
};
