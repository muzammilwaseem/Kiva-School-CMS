import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, schoolSettings } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userKey: string) => {
    setError('');
    setLoading(true);
    try {
      await login(userKey, 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { name: 'Super Admin', username: 'superadmin', role: 'Full System Access', color: 'bg-purple-600' },
    { name: 'School Admin', username: 'admin', role: 'Daily School Admin', color: 'bg-indigo-600' },
    { name: 'Principal', username: 'principal', role: 'Executive & Approvals', color: 'bg-blue-600' },
    { name: 'Teacher', username: 'teacher', role: 'Attendance & Marks', color: 'bg-emerald-600' },
    { name: 'Accountant', username: 'accountant', role: 'Fees & Finance', color: 'bg-amber-600' },
    { name: 'Receptionist', username: 'receptionist', role: 'Inquiries & Admissions', color: 'bg-teal-600' },
    { name: 'Parent Portal', username: 'parent', role: 'Children Dues & Marks', color: 'bg-rose-600' },
    { name: 'Student Portal', username: 'student', role: 'Timetable & Results', color: 'bg-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80">
        {/* Left Side: Brand & Visual */}
        <div className="lg:col-span-5 bg-[#082c4b] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-r border-[#fac217]/30">
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl shadow-slate-950/40 border-2 border-[#fac217] flex items-center justify-center mb-6">
              <img
                src={schoolSettings?.logoUrl || '/kiva-logo.png'}
                alt="Kiva School"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0db29b]/20 border border-[#0db29b]/40 text-[#0db29b] font-extrabold text-xs mb-3">
              <span>A PLACE WE CALL HOME</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {schoolSettings?.schoolName || 'Kiva School'}
            </h1>
            <p className="text-[#f6c65b] text-xs mt-1.5 font-bold">
              Rooted in kindness • Nurturing natural curiosity
            </p>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Complete School Management System & Portal for Faculty, Accounts, Parents & Students.
            </p>

            <div className="mt-8 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0db29b] shrink-0" />
                <span>Role-Based Access Control (RBAC) across 8 roles</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#fac217] shrink-0" />
                <span>3-Part Bank Challan fee system (PKR)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#ab75b2] shrink-0" />
                <span>Automated marks grading, merit ranking & report cards</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-8 border-t border-white/10 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">Kiva School • PECHS, Karachi</p>
            <p className="text-[10px] text-slate-400 mt-0.5">32/E, PECHS, Block 6 • 0300 0605482 • info@kivaschool.com</p>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#0db29b]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-0 w-48 h-48 bg-[#fac217]/15 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right Side: Login Form & 1-Click Role Switcher */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials or choose any demo role below for instant evaluation.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                    placeholder="e.g. admin or teacher"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Login Buttons Grid */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Role Demonstration Accounts:</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any role to log in immediately with default demo credentials:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => handleQuickLogin(item.username)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="font-bold text-slate-900 text-[11px] group-hover:text-brand-700 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                    {item.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
