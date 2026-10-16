import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassGrade } from '../types';
import {
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  X,
  GraduationCap,
} from 'lucide-react';

export const AcademicsManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Class Promotion Wizard State
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteSourceClassId, setPromoteSourceClassId] = useState('');
  const [promoteTargetClassId, setPromoteTargetClassId] = useState('');
  const [promoteTargetYearId, setPromoteTargetYearId] = useState('');
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Add Class Modal
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState(1);
  const [newClassDesc, setNewClassDesc] = useState('');

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    setLoading(true);
    try {
      const [cRes, yRes] = await Promise.all([
        api.getClassesAndSections(),
        api.getAcademicYears(),
      ]);
      setClasses(cRes);
      setYears(yRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPromote = async (classId: number) => {
    setPromoteSourceClassId(String(classId));
    try {
      const st = await api.getStudents({ classGradeId: classId, status: 'ACTIVE' });
      setClassStudents(st);
      setSelectedStudentIds(st.map((s: any) => s.id));
      setIsPromoteModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteTargetClassId || !promoteTargetYearId) {
      alert('Please select target class and target academic year.');
      return;
    }
    try {
      await api.promoteStudents({
        studentIds: selectedStudentIds,
        targetClassGradeId: Number(promoteTargetClassId),
        targetAcademicYearId: Number(promoteTargetYearId),
      });
      alert(`Successfully promoted ${selectedStudentIds.length} students!`);
      setIsPromoteModalOpen(false);
      loadAcademics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClassGrade({
        name: newClassName,
        numericLevel: Number(newClassLevel),
        description: newClassDesc,
      });
      setIsAddClassModalOpen(false);
      setNewClassName('');
      loadAcademics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Structure & Promotion</h2>
          <p className="text-xs text-slate-500">
            Classes, sections, enrolled subjects, academic calendar years, and batch promotion wizard
          </p>
        </div>

        <button
          onClick={() => setIsAddClassModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class Grade</span>
        </button>
      </div>

      {/* Academic Years Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Academic Years:</span>
          {years.map((y) => (
            <span
              key={y.id}
              className={`px-3 py-1 rounded-lg font-bold ${
                y.isCurrent
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {y.name} {y.isCurrent && '• Active Session'}
            </span>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                  Level {cls.numericLevel}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {cls._count?.students || 0} Students Enrolled
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cls.description || 'Standard Curriculum'}</p>

              {/* Sections */}
              <div className="mt-3 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Sections:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(cls.sections || []).map((sec) => (
                    <span
                      key={sec.id}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold"
                    >
                      Sec {sec.name} ({sec.roomNumber || 'Classroom'})
                    </span>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-3 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Taught Subjects:</span>
                <div className="flex flex-wrap gap-1">
                  {(cls.subjects || []).slice(0, 5).map((sub) => (
                    <span key={sub.id} className="text-[11px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                      {sub.name}
                    </span>
                  ))}
                  {(cls.subjects || []).length > 5 && (
                    <span className="text-[11px] text-slate-400">+{cls.subjects!.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleOpenPromote(cls.id)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Promote Class</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Class Promotion Wizard */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Class Promotion Wizard</h3>
              </div>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePromotion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                  <select
                    required
                    value={promoteTargetClassId}
                    onChange={(e) => setPromoteTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Target Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Academic Year *</label>
                  <select
                    required
                    value={promoteTargetYearId}
                    onChange={(e) => setPromoteTargetYearId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Academic Year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Students to Promote ({selectedStudentIds.length} / {classStudents.length})
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                  {classStudents.map((st) => (
                    <label key={st.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds([...selectedStudentIds, st.id]);
                          } else {
                            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== st.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">
                        {st.firstName} {st.lastName} ({st.admissionNo})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Add New Class Grade</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 11 (Pre-Engineering)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numeric Level (1-12) *</label>
                <input
                  type="number"
                  required
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Secondary Certificate"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
