import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Staff } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  DollarSign,
  Calendar,
  X,
  Edit,
  Trash2,
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { role } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    cnic: '',
    phone: '',
    email: '',
    address: '',
    qualification: '',
    designation: 'Senior Teacher',
    department: 'Academic',
    basicSalary: '85000',
  });

  const isSalaryAuthorized = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(role || '');

  useEffect(() => {
    loadStaff();
  }, [department]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (department) params.department = department;
      if (search) params.search = search;
      const data = await api.getStaff(params);
      setStaffList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStaff();
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, formData);
      } else {
        await api.createStaff(formData);
      }
      setIsAddModalOpen(false);
      setEditingStaff(null);
      loadStaff();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Faculty Directory</h2>
          <p className="text-xs text-slate-500">Manage teachers, designations, qualifications, and employment records</p>
        </div>

        {['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role || '') && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setFormData({
                firstName: '',
                lastName: '',
                gender: 'Male',
                cnic: '',
                phone: '',
                email: '',
                address: '',
                qualification: '',
                designation: 'Senior Teacher',
                department: 'Academic',
                basicSalary: '75000',
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Staff Member</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name, ID, CNIC, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
        >
          <option value="">All Departments</option>
          <option value="Academic">Academic</option>
          <option value="Administration">Administration</option>
          <option value="Finance">Finance</option>
          <option value="Science & Mathematics">Science & Mathematics</option>
          <option value="Languages">Languages</option>
        </select>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading faculty and staff...</div>
        ) : staffList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No staff members found.</div>
        ) : (
          staffList.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {s.staffId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    {s.employmentStatus}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {s.firstName} {s.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 mt-0.5">{s.designation}</p>
                  <p className="text-[11px] text-slate-500">{s.department} Department</p>
                </div>

                <div className="space-y-1.5 mt-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.qualification || 'Master Degree'}</span>
                  </div>
                  {s.cnic && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      CNIC: {s.cnic}
                    </div>
                  )}
                </div>
              </div>

              {isSalaryAuthorized && s.basicSalary !== undefined && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Basic Salary:</span>
                  <span className="text-xs font-extrabold text-slate-900">
                    ₨ {Number(s.basicSalary).toLocaleString()} /mo
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingStaff ? 'Edit Staff Member' : 'Register New Faculty / Staff'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Finance">Finance</option>
                    <option value="Science & Mathematics">Science & Mathematics</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNIC (Pakistani)</label>
                  <input
                    type="text"
                    placeholder="42101-XXXXXXX-X"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="03XX-XXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Basic Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc Mathematics, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Save Staff Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
