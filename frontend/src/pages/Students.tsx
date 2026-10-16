import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, ClassGrade } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  CreditCard,
  CalendarCheck,
  Receipt,
  Award,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '2012-05-15',
    bFormNo: '',
    bloodGroup: 'B+',
    religion: 'Islam',
    address: '',
    phone: '',
    email: '',
    classGradeId: '',
    sectionId: '',
    rollNo: '',
    previousSchool: '',
    fatherName: '',
    fatherCnic: '',
    fatherPhone: '',
    occupation: '',
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, [selectedClassId, selectedStatus]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedClassId) params.classGradeId = selectedClassId;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const data = await api.getStudents(params);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await api.getClassesAndSections();
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const handleViewStudent = async (id: number) => {
    try {
      const detail = await api.getStudentById(id);
      setCurrentStudent(detail);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewIdCard = async (id: number) => {
    try {
      const detail = await api.getStudentById(id);
      setCurrentStudent(detail);
      setIsIdCardModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bFormNo: formData.bFormNo,
        bloodGroup: formData.bloodGroup,
        religion: formData.religion,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        classGradeId: Number(formData.classGradeId),
        sectionId: formData.sectionId ? Number(formData.sectionId) : undefined,
        rollNo: formData.rollNo,
        previousSchool: formData.previousSchool,
        parentData: {
          fatherName: formData.fatherName,
          cnic: formData.fatherCnic,
          phone: formData.fatherPhone || formData.phone,
          occupation: formData.occupation,
          address: formData.address,
          relationship: 'Father',
        },
      };

      if (editingStudent) {
        await api.updateStudent(editingStudent.id, payload);
      } else {
        await api.createStudent(payload);
      }

      setIsAddModalOpen(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '2012-05-15',
      bFormNo: '',
      bloodGroup: 'B+',
      religion: 'Islam',
      address: '',
      phone: '',
      email: '',
      classGradeId: '',
      sectionId: '',
      rollNo: '',
      previousSchool: '',
      fatherName: '',
      fatherCnic: '',
      fatherPhone: '',
      occupation: '',
    });
  };

  const handleExportExcel = () => {
    const rows = students.map((s) => ({
      'Admission No': s.admissionNo,
      'Roll No': s.rollNo || '-',
      'Full Name': `${s.firstName} ${s.lastName}`,
      Gender: s.gender,
      'Date of Birth': new Date(s.dateOfBirth).toLocaleDateString(),
      'B-Form / CNIC': s.bFormNo || '-',
      Class: s.classGrade?.name || '-',
      Section: s.section?.name || '-',
      Status: s.status,
      'Father Name': s.parentMappings?.[0]?.parent.fatherName || '-',
      Phone: s.phone || s.parentMappings?.[0]?.parent.phone || '-',
      Address: s.address || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ActiveStudents');
    XLSX.writeFile(wb, `Students_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Information System</h2>
          <p className="text-xs text-slate-500">Manage student enrollments, B-Forms, records, and profiles</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setEditingStudent(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission #, roll #, or B-Form..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="GRADUATED">Graduated</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">B-Form / CNIC</th>
                <th className="py-3 px-4">Father / Guardian</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">{s.admissionNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {s.firstName} {s.lastName}
                      </div>
                      <span className="text-[10px] text-slate-400">{s.gender} • {s.bloodGroup || 'O+'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{s.classGrade?.name}</span>
                      {s.section && (
                        <span className="ml-1 text-[11px] text-slate-500">({s.section.name})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{s.rollNo || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.bFormNo || 'N/A'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {s.parentMappings?.[0]?.parent?.fatherName || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.phone || s.parentMappings?.[0]?.parent?.phone || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewIdCard(s.id)}
                          title="Print Student ID Card"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewStudent(s.id)}
                          title="View Complete Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setFormData({
                              firstName: s.firstName,
                              lastName: s.lastName,
                              gender: s.gender,
                              dateOfBirth: s.dateOfBirth.split('T')[0],
                              bFormNo: s.bFormNo || '',
                              bloodGroup: s.bloodGroup || 'B+',
                              religion: s.religion || 'Islam',
                              address: s.address || '',
                              phone: s.phone || '',
                              email: s.email || '',
                              classGradeId: String(s.classGradeId),
                              sectionId: s.sectionId ? String(s.sectionId) : '',
                              rollNo: s.rollNo || '',
                              previousSchool: '',
                              fatherName: s.parentMappings?.[0]?.parent.fatherName || '',
                              fatherCnic: s.parentMappings?.[0]?.parent.cnic || '',
                              fatherPhone: s.parentMappings?.[0]?.parent.phone || '',
                              occupation: s.parentMappings?.[0]?.parent.occupation || '',
                            });
                            setIsAddModalOpen(true);
                          }}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Enroll / Edit Student Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Edit Student Record' : 'Enroll New Student (Pakistani Format)'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                  </input>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">B-Form / CNIC</label>
                  <input
                    type="text"
                    placeholder="42101-XXXXXXX-X"
                    value={formData.bFormNo}
                    onChange={(e) => setFormData({ ...formData, bFormNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Grade *</label>
                  <select
                    required
                    value={formData.classGradeId}
                    onChange={(e) => setFormData({ ...formData, classGradeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. A or Rose"
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9A-12"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Guardian Info Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Guardian / Father Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Father / Guardian Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Father CNIC</label>
                    <input
                      type="text"
                      placeholder="42101-XXXXXXX-X"
                      value={formData.fatherCnic}
                      onChange={(e) => setFormData({ ...formData, fatherCnic: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      placeholder="0300-XXXXXXX"
                      value={formData.fatherPhone}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Business / Service"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  placeholder="Street address, Area, City, Pakistan..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm"
                >
                  {editingStudent ? 'Update Student' : 'Save & Generate Admission #'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Student Profile Full Record */}
      {isViewModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center">
                  {currentStudent.firstName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {currentStudent.firstName} {currentStudent.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentStudent.admissionNo} • {currentStudent.classGrade?.name} (Roll: {currentStudent.rollNo || '-'})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">B-Form:</span>
                <span className="font-mono font-semibold text-slate-800">{currentStudent.bFormNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth:</span>
                <span className="font-semibold text-slate-800">{new Date(currentStudent.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group:</span>
                <span className="font-semibold text-slate-800">{currentStudent.bloodGroup || 'O+'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status:</span>
                <span className="font-bold text-emerald-700">{currentStudent.status}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Father / Guardian:</span>
                <span className="font-semibold text-slate-800">
                  {currentStudent.parentMappings?.[0]?.parent?.fatherName || '-'} (Ph: {currentStudent.parentMappings?.[0]?.parent?.phone || '-'})
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Address:</span>
                <span className="font-semibold text-slate-800">{currentStudent.address || '-'}</span>
              </div>
            </div>

            {/* Attendance & Fee ledger preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-3">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-indigo-600" />
                  <span>Recent Attendance</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {currentStudent.attendances?.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                      <span className="font-bold text-emerald-600">{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Fee Invoices & Dues</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {currentStudent.invoices?.slice(0, 5).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span>{inv.invoiceNo} (M: {inv.month})</span>
                      <span className="font-bold text-slate-900">₨ {Number(inv.balance).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Printable Student ID Card */}
      {isIdCardModalOpen && currentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 no-print">
              <span className="font-bold text-slate-900 text-sm">Student ID Card (Front & Back)</span>
              <button onClick={() => setIsIdCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card Design */}
            <div className="print-page w-full border-2 border-indigo-700 rounded-2xl overflow-hidden shadow-md bg-white">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-900 to-indigo-700 text-white p-3 text-center flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center shadow-xs">
                  <img src="/kiva-logo.png" alt="Kiva School" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Kiva School</h4>
                  <p className="text-[10px] text-[#fac217] font-bold">PECHS Campus, Karachi • Student Identity Card</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-20 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] shrink-0 font-bold">
                  <span>PHOTO</span>
                  <span>PASSPORT</span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900 text-sm">{currentStudent.firstName} {currentStudent.lastName}</p>
                  <p className="text-[11px] text-indigo-700 font-bold">
                    Class: {currentStudent.classGrade?.name} ({currentStudent.section?.name || 'A'})
                  </p>
                  <p className="text-slate-600">
                    Roll No: <strong>{currentStudent.rollNo || '-'}</strong>
                  </p>
                  <p className="text-slate-600">
                    Adm #: <strong>{currentStudent.admissionNo}</strong>
                  </p>
                  <p className="text-slate-600">
                    B-Form: <span className="font-mono">{currentStudent.bFormNo || 'N/A'}</span>
                  </p>
                  <p className="text-slate-600">
                    Blood Group: <strong>{currentStudent.bloodGroup || 'B+'}</strong>
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] text-slate-500">
                <span>Emergency: {currentStudent.phone || '0300-1234567'}</span>
                <span className="font-bold text-slate-700">Principal Signature</span>
              </div>
            </div>

            {/* Print action button */}
            <div className="flex items-center justify-end gap-2 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
