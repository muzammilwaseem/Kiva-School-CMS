import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  Clock,
  BookOpen,
  Receipt,
  FileText,
  CheckCircle,
  Printer,
} from 'lucide-react';

export const StudentPortalView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'timetable' | 'homework' | 'exams' | 'fees'>('timetable');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentPortal();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const student = data?.student;
  const attendances = data?.attendances || [];
  const examResults = data?.examResults || [];
  const timetable = data?.timetable || [];
  const homework = data?.homework || [];
  const invoices = data?.invoices || [];

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl">
              {student?.firstName[0]}
              {student?.lastName[0]}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <span>Student Portal</span>
              </div>
              <h2 className="text-2xl font-bold">
                {student?.firstName} {student?.lastName}
              </h2>
              <p className="text-xs text-cyan-200 mt-1">
                Class: <strong>{student?.classGrade?.name}</strong> • Roll No: <strong>{student?.rollNo || '01'}</strong> • Admission No: <strong>{student?.admissionNo}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              Academic Session 2025-2026
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'timetable', label: 'My Timetable', icon: Clock },
          { id: 'homework', label: 'Homework & Tasks', icon: BookOpen },
          { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
          { id: 'exams', label: 'Exam Results', icon: Award },
          { id: 'fees', label: 'Fee Invoices', icon: Receipt },
          { id: 'profile', label: 'My Bio Profile', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Weekly Class Timetable</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timetable.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{t.dayOfWeek}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{t.period?.periodName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.period?.startTime} - {t.period?.endTime}</td>
                    <td className="py-2.5 px-3 font-medium text-brand-700">{t.subject?.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.teacher?.firstName} {t.teacher?.lastName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.roomNo || 'Classroom'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Homework Tab */}
      {activeTab === 'homework' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Active Homework & Assignments</h3>
          <div className="space-y-3">
            {homework.map((hw: any) => (
              <div key={hw.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{hw.title}</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 mt-1">
                  <span>Subject: <strong className="text-slate-700">{hw.subject?.name}</strong></span>
                  <span>Teacher: <strong className="text-slate-700">{hw.teacher?.firstName} {hw.teacher?.lastName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Daily Attendance Record</h3>
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
                {attendances.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{new Date(att.date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{att.remarks || 'Present in morning assembly'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Results Tab */}
      {activeTab === 'exams' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Assessment & Examination Grades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Exam</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Marks</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examResults.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.exam?.name}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.schedule?.subject?.name}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">
                      {Number(r.marksObtained)} / {Number(r.schedule?.maxMarks)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{Number(r.percentage)}%</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-100 text-indigo-800">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 italic">{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Fee Invoices & Dues</h3>
          {invoices.map((inv: any) => (
            <div key={inv.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">{inv.invoiceNo} (Month {inv.month}/{inv.year})</p>
                <p className="text-[11px] text-slate-500">
                  Net: ₨ {Number(inv.netAmount).toLocaleString()} • Paid: ₨ {Number(inv.paidAmount).toLocaleString()} • Balance: ₨ {Number(inv.balance).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Full Name:</span>
            <span className="font-bold text-slate-900 text-sm">{student?.firstName} {student?.lastName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">B-Form Number:</span>
            <span className="font-bold text-slate-900 text-sm">{student?.bFormNo || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Date of Birth:</span>
            <span className="font-semibold text-slate-800">{new Date(student?.dateOfBirth).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Blood Group:</span>
            <span className="font-semibold text-slate-800">{student?.bloodGroup || 'O+'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Class & Section:</span>
            <span className="font-semibold text-brand-700">{student?.classGrade?.name} ({student?.section?.name})</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Residential Address:</span>
            <span className="font-semibold text-slate-800">{student?.address || 'Karachi, Pakistan'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortalView;
