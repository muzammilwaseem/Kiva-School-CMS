import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassGrade } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  BookMarked,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  X,
  FileText,
  User,
} from 'lucide-react';

export const HomeworkManagement: React.FC = () => {
  const { role, user } = useAuth();
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-18');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const isTeacherOrAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(role || '');

  useEffect(() => {
    loadClasses();
    loadHomework();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClassesAndSections();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(String(data[0].id));
        loadSubjects(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubjects = async (cId: number) => {
    try {
      const subs = await api.getSubjects({ classGradeId: cId });
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(String(subs[0].id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadHomework = async () => {
    setLoading(true);
    try {
      const list = await api.getHomework();
      setHomeworkList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createHomework({
        classGradeId: Number(selectedClassId),
        subjectId: Number(selectedSubjectId),
        title,
        description,
        dueDate,
      });
      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
      loadHomework();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Homework & Assignments</h2>
          <p className="text-xs text-slate-500">
            Publish daily homework tasks, review submission status, and track deadlines
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Homework Assignment</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading homework assignments...</div>
        ) : homeworkList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No homework tasks assigned.</div>
        ) : (
          homeworkList.map((hw) => (
            <div
              key={hw.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                    {hw.classGrade?.name} • {hw.subject?.name}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{hw.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hw.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Teacher: <strong>{hw.teacher?.firstName} {hw.teacher?.lastName}</strong></span>
                <span className="font-semibold text-emerald-700">{hw._count?.submissions || 0} Submissions</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Homework */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assign New Homework Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      if (e.target.value) loadSubjects(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Chapter 2 Exercise 2.4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed homework problem numbers or assignment instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm">
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
