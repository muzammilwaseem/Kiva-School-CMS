import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassGrade } from '../types';
import {
  UserPlus,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from 'lucide-react';

export const AdmissionsManagement: React.FC = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'Male',
    applyingForClassId: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadClasses();
    loadInquiries();
  }, [statusFilter]);

  const loadClasses = async () => {
    try {
      const data = await api.getClassesAndSections();
      setClasses(data);
      if (data.length > 0) setFormData((prev) => ({ ...prev, applyingForClassId: String(data[0].id) }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const list = await api.getInquiries(params);
      setInquiries(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInquiry(formData);
      setIsAddModalOpen(false);
      setFormData({
        studentName: '',
        gender: 'Male',
        applyingForClassId: classes[0] ? String(classes[0].id) : '1',
        parentName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
      loadInquiries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.updateInquiryStatus(id, { status: newStatus });
      loadInquiries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admission Inquiries & Applications</h2>
          <p className="text-xs text-slate-500">
            Prospect student registration, parent follow-ups, and enrollment admission pipeline
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission Inquiry</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiry #, student name, parent phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadInquiries()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="IN_REVIEW">Under Review</option>
          <option value="APPROVED">Approved for Enrollment</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Inquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No admission inquiries found.</div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {inq.inquiryNo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      inq.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inq.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : inq.status === 'CONTACTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{inq.studentName}</h3>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  Applying for: {inq.applyingClassName}
                </p>

                <div className="space-y-1 mt-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <p>Parent: <strong className="text-slate-800">{inq.parentName}</strong></p>
                  <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inq.phone}</span>
                  </p>
                  {inq.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded">
                      "{inq.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Change Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  {inq.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(inq.id, 'APPROVED')}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200"
                    >
                      Approve
                    </button>
                  )}
                  {inq.status !== 'CONTACTED' && (
                    <button
                      onClick={() => handleUpdateStatus(inq.id, 'CONTACTED')}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] border border-blue-200"
                    >
                      Call Logged
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Inquiry */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">New Student Admission Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applying for Class *</label>
                  <select
                    value={formData.applyingForClassId}
                    onChange={(e) => setFormData({ ...formData, applyingForClassId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="0300-XXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry / Follow-up Notes</label>
                <textarea
                  rows={2}
                  placeholder="Parent requirements, previous school background, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm">
                  Record Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
