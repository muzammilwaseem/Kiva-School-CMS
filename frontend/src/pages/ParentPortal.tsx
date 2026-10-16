import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Printer,
} from 'lucide-react';

export const ParentPortalView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childDetails, setChildDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'exams' | 'timetable' | 'homework'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await api.getParentChildren();
      setData(res);
      if (res.children && res.children.length > 0) {
        setSelectedChildId(res.children[0].id);
        loadChildDetails(res.children[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildDetails = async (studentId: number) => {
    try {
      const res = await api.getChildDetails(studentId);
      setChildDetails(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChild = (id: number) => {
    setSelectedChildId(id);
    loadChildDetails(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const children = data?.children || [];
  const parent = data?.parent || {};
  const currentChild = childDetails?.student;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Parent Portal — Guardian Dashboard</span>
            </div>
            <h2 className="text-2xl font-bold">{parent.fatherName || 'Parent / Guardian'}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Contact: {parent.phone} • CNIC: {parent.cnic || '42101-7788990-1'} • Address: {parent.address || 'Karachi, Pakistan'}
            </p>
          </div>

          {/* Child Switcher Pills */}
          <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium px-2">Select Child:</span>
            {children.map((ch: any) => (
              <button
                key={ch.id}
                onClick={() => handleSelectChild(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedChildId === ch.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {ch.firstName} ({ch.classGrade?.name})
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentChild ? (
        <div className="space-y-5">
          {/* Child Quick Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-brand-700 font-black text-lg flex items-center justify-center">
                {currentChild.firstName[0]}
                {currentChild.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {currentChild.firstName} {currentChild.lastName}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Admission No: <strong className="text-slate-800">{currentChild.admissionNo}</strong></span>
                  <span>•</span>
                  <span>Roll No: <strong className="text-slate-800">{currentChild.rollNo || '-'}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-indigo-600">{currentChild.classGrade?.name}</strong></span>
                  <span>•</span>
                  <span>B-Form: <strong className="text-slate-800">{currentChild.bFormNo || 'N/A'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {currentChild.status}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: 'Child Overview', icon: Users },
              { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
              { id: 'fees', label: 'Fee Vouchers & Dues', icon: Receipt },
              { id: 'exams', label: 'Exam Results', icon: Award },
              { id: 'timetable', label: 'Class Timetable', icon: Clock },
              { id: 'homework', label: 'Homework & Tasks', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-rose-600 text-rose-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Attendance Rate</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {(
                      (currentChild.attendances?.filter((a: any) => a.status === 'PRESENT').length /
                        Math.max(1, currentChild.attendances?.length || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-xs text-slate-500">Last 30 school days</span>
                </div>
                <p className="text-xs text-slate-600">
                  Present: {currentChild.attendances?.filter((a: any) => a.status === 'PRESENT').length || 0} days
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fee Account Status</h4>
                {currentChild.invoices?.some((i: any) => i.balance > 0) ? (
                  <div>
                    <span className="text-rose-600 text-2xl font-extrabold">
                      ₨{' '}
                      {currentChild.invoices
                        ?.reduce((acc: number, curr: any) => acc + Number(curr.balance), 0)
                        .toLocaleString()}
                    </span>
                    <p className="text-xs text-rose-600 font-medium mt-1">Pending payment due</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-emerald-600 text-2xl font-extrabold">All Clear</span>
                    <p className="text-xs text-emerald-600 font-medium mt-1">No outstanding dues for this term</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transport & Route</h4>
                {currentChild.transportAllocation ? (
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      {currentChild.transportAllocation.route?.routeName}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Stop: {currentChild.transportAllocation.pickupPoint} • Van:{' '}
                      {currentChild.transportAllocation.route?.vehicle?.vehicleNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Private pickup (Not enrolled in school van route)</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Attendance */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Attendance History (Recent Days)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentChild.attendances?.map((att: any) => (
                      <tr key={att.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {new Date(att.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              att.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : att.status === 'LEAVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{att.remarks || 'Regular Attendance'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Fees & Dues */}
          {activeTab === 'fees' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Fee Invoices & Challan Receipts</h4>
                <span className="text-xs font-semibold text-slate-500">Official Pakistani School Vouchers</span>
              </div>

              <div className="space-y-3">
                {currentChild.invoices?.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{inv.invoiceNo}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Billing Period: Month {inv.month}/{inv.year} • Due Date:{' '}
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                      <div className="text-xs text-slate-600 mt-2 flex items-center gap-3">
                        <span>Total: ₨ {Number(inv.netAmount).toLocaleString()}</span>
                        <span>Paid: ₨ {Number(inv.paidAmount).toLocaleString()}</span>
                        <span className="font-bold text-rose-600">
                          Balance: ₨ {Number(inv.balance).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/fees?invoiceId=${inv.id}`, '_self')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Fee Challan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Exam Results */}
          {activeTab === 'exams' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Published Examination Results</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Exam Session</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Marks Obtained</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentChild.examResults?.map((res: any) => (
                      <tr key={res.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{res.exam?.name}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{res.schedule?.subject?.name}</td>
                        <td className="py-2.5 px-3 font-bold text-indigo-700">
                          {Number(res.marksObtained)} / {Number(res.schedule?.maxMarks)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{Number(res.percentage)}%</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-100 text-indigo-800">
                            {res.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 italic">{res.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Timetable */}
          {activeTab === 'timetable' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Weekly Timetable Schedule</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Timing</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Teacher</th>
                      <th className="py-2.5 px-3">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {childDetails?.timetable?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{t.dayOfWeek}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{t.period?.periodName}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {t.period?.startTime} - {t.period?.endTime}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-brand-700">{t.subject?.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {t.teacher?.firstName} {t.teacher?.lastName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{t.roomNo || 'Main Hall'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 6: Homework */}
          {activeTab === 'homework' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 mb-1">Homework & Class Assignments</h4>
              {childDetails?.homework?.map((hw: any) => (
                <div key={hw.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{hw.title}</span>
                    <span className="text-[11px] font-semibold text-rose-600">
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{hw.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Subject: {hw.subject?.name} • Teacher: {hw.teacher?.firstName} {hw.teacher?.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
          No student record linked to this parent account.
        </div>
      )}
    </div>
  );
};

export default ParentPortalView;
