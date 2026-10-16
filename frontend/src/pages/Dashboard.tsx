import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  FileText,
  School,
  Award,
  Receipt,
  Megaphone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ParentPortalView } from './ParentPortal';
import { StudentPortalView } from './StudentPortal';

export const Dashboard: React.FC = () => {
  const { role, user, schoolSettings } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'PARENT' && role !== 'STUDENT') {
      fetchDashboardData();
    }
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // If user is Parent or Student, render their customized portal dashboard directly!
  if (role === 'PARENT') {
    return <ParentPortalView />;
  }
  if (role === 'STUDENT') {
    return <StudentPortalView />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading live school records...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  // Official kiva.school palette: Teal, Yellow, Purple, Orange, Dark Blue
  const COLORS = ['#0db29b', '#fac217', '#ab75b2', '#f68845', '#082c4b'];

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Hero Banner with Kiva School Signature Yellow Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-[#082c4b] border-b-4 border-[#fac217] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0db29b]/20 backdrop-blur-md text-[#0db29b] text-xs font-black mb-3 border border-[#0db29b]/40">
            <img
              src={schoolSettings?.logoUrl || '/kiva-logo.png'}
              alt="Kiva School"
              className="w-4 h-4 object-contain rounded-full bg-white p-0.5"
            />
            <span className="text-white font-extrabold">{schoolSettings?.schoolName || 'Kiva School'}</span>
            <span className="text-[#fac217] font-black">•</span>
            <span className="text-slate-200">A Place We Call Home</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            School operations management center for academic year 2025-2026. Rooted in kindness, nurturing the natural curiosity of every student.
          </p>
        </div>

        {/* Logo Badge Card on Right of Hero */}
        <div className="relative z-10 hidden sm:flex shrink-0 items-center justify-center bg-white rounded-2xl p-4 shadow-2xl border-2 border-[#fac217]">
          <img
            src={schoolSettings?.logoUrl || '/kiva-logo.png'}
            alt="Kiva School"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Ambient background glow matching Kiva colors */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#0db29b]/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-[#fac217]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Students</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalStudents || 0}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100%
            </span>
            <span>Enrolled in 2025-2026</span>
          </div>
        </div>

        {/* Staff & Faculty */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff & Teachers</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.totalStaff || 0}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{summary.totalClasses || 4} Classes</span>
            <span>• {summary.totalSections || 6} Sections</span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900">{summary.attendancePercentage || 0}%</p>
            <span className="text-xs font-medium text-slate-500">
              ({summary.studentsPresentToday || 0} Present / {summary.studentsAbsentToday || 0} Absent)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Number(summary.attendancePercentage) || 0)}%` }}
            />
          </div>
        </div>

        {/* Monthly Fee Collection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fees Collected (Oct)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₨ {(summary.feesCollectedThisMonth || 0).toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-rose-600 font-semibold">
              ₨ {(summary.outstandingFeeBalance || 0).toLocaleString()} Dues
            </span>
            <span className="text-slate-400">Current Month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Fee Collection Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Invoiced vs Collected (PKR)</h3>
              <p className="text-xs text-slate-500">Past 6 months billing and recovery progress</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Live DB Records
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyCollectionTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₨ ${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="invoiced" name="Invoiced Amount" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Recovered Cash" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Enrollment Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Enrollment by Grade</h3>
            <p className="text-xs text-slate-500">Distribution of students across classes</p>
          </div>

          <div className="h-56 sm:h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.enrollmentDistribution || []}
                  dataKey="students"
                  nameKey="className"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(charts.enrollmentDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Payments & School Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Fee Payments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Recent Fee Collections</span>
            </h3>
            <span className="text-xs text-slate-400">Latest Verified Vouchers</span>
          </div>

          <div className="space-y-3">
            {(data?.recentPayments || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No fee payments recorded yet.</p>
            ) : (
              (data?.recentPayments || []).map((pay: any) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      ₨
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {pay.invoice?.student?.firstName} {pay.invoice?.student?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {pay.receiptNo} • {pay.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">
                      +₨ {Number(pay.amountPaid).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(pay.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* School Announcements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <span>Official Notices & Announcements</span>
            </h3>
            <span className="text-xs font-semibold text-indigo-600">All Audiences</span>
          </div>

          <div className="space-y-3">
            {(data?.announcements || []).map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      item.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-700'
                        : item.priority === 'EVENT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.content}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                  <span>Posted by: {item.createdBy}</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
