import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  Check,
  X,
  Clock,
  User,
  Calendar,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { role } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [applicantType, setApplicantType] = useState('STUDENT');
  const [leaveType, setLeaveType] = useState('Medical Leave');
  const [startDate, setStartDate] = useState('2026-10-18');
  const [endDate, setEndDate] = useState('2026-10-19');
  const [reason, setReason] = useState('');

  const isReviewer = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role || '');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaves();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLeave({
        applicantType,
        leaveType,
        startDate,
        endDate,
        reason,
        studentId: 1, // linked current user or demo student
      });
      setIsSubmitModalOpen(false);
      setReason('');
      loadLeaves();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateLeaveStatus(id, { status });
      loadLeaves();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management System</h2>
          <p className="text-xs text-slate-500">
            Submit leave applications for students & faculty with administrative approval workflow
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Application</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                {isReviewer && <th className="py-3 px-4 text-right">Review Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leave requests on file.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {l.student
                        ? `${l.student.firstName} ${l.student.lastName} (${l.student.admissionNo})`
                        : `${l.staff?.firstName} ${l.staff?.lastName} (${l.staff?.staffId})`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 uppercase font-semibold text-[10px]">
                      {l.applicantType}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{l.leaveType}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    {isReviewer && (
                      <td className="py-3 px-4 text-right">
                        {l.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] border border-rose-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Submit Leave */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Submit Leave Request</h3>
            <form onSubmit={handleSubmitLeave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Applicant Category</label>
                <select
                  value={applicantType}
                  onChange={(e) => setApplicantType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="STUDENT">Student Leave</option>
                  <option value="STAFF">Faculty / Staff Leave</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason / Explanation *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain valid medical or personal reasons..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
