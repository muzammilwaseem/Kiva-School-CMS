import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassGrade } from '../types';
import {
  CalendarCheck,
  Search,
  Check,
  X,
  Clock,
  Printer,
  Calendar,
  UserCheck,
  AlertCircle,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');

  // Student Attendance State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Staff Attendance State
  const [staffDate, setStaffDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffRecords, setStaffRecords] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClassesAndSections();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(String(data[0].id));
        fetchClassAttendance(data[0].id, selectedDate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassAttendance = async (cId: number, dateStr: string) => {
    setLoading(true);
    try {
      const res = await api.getClassAttendance({ classGradeId: cId, date: dateStr });
      setStudentRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffAttendance = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await api.getStaffAttendance({ date: dateStr });
      setStaffRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (idx: number, newStatus: string) => {
    const updated = [...studentRecords];
    updated[idx].status = newStatus;
    setStudentRecords(updated);
  };

  const handleMarkAll = (status: string) => {
    const updated = studentRecords.map((r) => ({ ...r, status }));
    setStudentRecords(updated);
  };

  const handleSaveStudentAttendance = async () => {
    try {
      await api.markBulkAttendance({
        classGradeId: Number(selectedClassId),
        date: selectedDate,
        records: studentRecords,
      });
      alert('Student attendance marked and saved to database successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveStaffAttendance = async () => {
    try {
      await api.markStaffAttendance({
        date: staffDate,
        records: staffRecords,
      });
      alert('Staff attendance recorded successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Management</h2>
          <p className="text-xs text-slate-500">
            Daily class-wise attendance register, status tracking (Present, Absent, Late, Leave), and staff attendance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Attendance Register</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('staff');
            fetchStaffAttendance(staffDate);
          }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
            activeTab === 'staff'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Staff & Faculty Attendance</span>
        </button>
      </div>

      {/* Tab 1: Students Attendance */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Select Class:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    if (e.target.value) fetchClassAttendance(Number(e.target.value), selectedDate);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Attendance Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (selectedClassId) fetchClassAttendance(Number(selectedClassId), e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Quick Mark:</span>
              <button
                onClick={() => handleMarkAll('PRESENT')}
                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200"
              >
                All Present
              </button>
              <button
                onClick={() => handleMarkAll('ABSENT')}
                className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200"
              >
                All Absent
              </button>
              <button
                onClick={handleSaveStudentAttendance}
                className="ml-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
              >
                Save Attendance Record
              </button>
            </div>
          </div>

          {/* Attendance Sheet Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Roll #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Loading student attendance records...
                      </td>
                    </tr>
                  ) : studentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No active students found in this class.
                      </td>
                    </tr>
                  ) : (
                    studentRecords.map((r, idx) => (
                      <tr key={r.studentId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-800">{r.rollNo || '-'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{r.fullName}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{r.admissionNo}</td>
                        <td className="py-3 px-4">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-1">
                            {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(idx, st)}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                  r.status === st
                                    ? st === 'PRESENT'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : st === 'ABSENT'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : st === 'LATE'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={r.remarks || ''}
                            onChange={(e) => {
                              const updated = [...studentRecords];
                              updated[idx].remarks = e.target.value;
                              setStudentRecords(updated);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-slate-700 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Staff Attendance */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Date:</span>
              <input
                type="date"
                value={staffDate}
                onChange={(e) => {
                  setStaffDate(e.target.value);
                  fetchStaffAttendance(e.target.value);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveStaffAttendance}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Save Staff Attendance
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time In</th>
                    <th className="py-3 px-4">Time Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffRecords.map((s, idx) => (
                    <tr key={s.staffId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-brand-700">{s.staffCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.fullName}</td>
                      <td className="py-3 px-4 text-slate-700">{s.designation}</td>
                      <td className="py-3 px-4 text-slate-500">{s.department}</td>
                      <td className="py-3 px-4">
                        <select
                          value={s.status}
                          onChange={(e) => {
                            const updated = [...staffRecords];
                            updated[idx].status = e.target.value;
                            setStaffRecords(updated);
                          }}
                          className={`px-2 py-1 rounded font-bold text-xs ${
                            s.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="LATE">LATE</option>
                          <option value="LEAVE">LEAVE</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={s.timeIn || '08:00 AM'}
                          onChange={(e) => {
                            const updated = [...staffRecords];
                            updated[idx].timeIn = e.target.value;
                            setStaffRecords(updated);
                          }}
                          className="w-24 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={s.timeOut || '02:30 PM'}
                          onChange={(e) => {
                            const updated = [...staffRecords];
                            updated[idx].timeOut = e.target.value;
                            setStaffRecords(updated);
                          }}
                          className="w-24 px-2 py-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
