import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassGrade } from '../types';
import {
  Clock,
  Printer,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
} from 'lucide-react';

export const TimetableManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // New Entry Modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [entryDay, setEntryDay] = useState('MONDAY');
  const [entryPeriodId, setEntryPeriodId] = useState('');
  const [entrySubjectId, setEntrySubjectId] = useState('');
  const [entryTeacherId, setEntryTeacherId] = useState('');
  const [entryRoom, setEntryRoom] = useState('Room 101');
  const [conflictError, setConflictError] = useState('');

  useEffect(() => {
    loadClasses();
    loadStaff();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClassesAndSections();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(String(data[0].id));
        const secId = data[0].sections?.[0]?.id;
        if (secId) {
          setSelectedSectionId(String(secId));
          loadTimetable(data[0].id, secId);
        }
        loadSubjects(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStaff = async () => {
    try {
      const st = await api.getStaff();
      setStaff(st);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubjects = async (cId: number) => {
    try {
      const subs = await api.getSubjects({ classGradeId: cId });
      setSubjects(subs);
      if (subs.length > 0) setEntrySubjectId(String(subs[0].id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadTimetable = async (cId: number, secId: number) => {
    setLoading(true);
    try {
      const res = await api.getClassTimetable({ classGradeId: cId, sectionId: secId });
      setTimetableData(res);
      if (res.periods?.length > 0) setEntryPeriodId(String(res.periods[0].id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');
    try {
      await api.upsertTimetableEntry({
        classGradeId: Number(selectedClassId),
        sectionId: Number(selectedSectionId),
        dayOfWeek: entryDay,
        periodId: Number(entryPeriodId),
        subjectId: Number(entrySubjectId),
        teacherId: Number(entryTeacherId),
        roomNo: entryRoom,
      });
      setIsEntryModalOpen(false);
      loadTimetable(Number(selectedClassId), Number(selectedSectionId));
    } catch (err: any) {
      setConflictError(err.message);
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const periods = timetableData?.periods || [];
  const entries = timetableData?.entries || [];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Class Timetable & Periods</h2>
          <p className="text-xs text-slate-500">
            Weekly academic class schedule with automated teacher and room conflict detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
          </button>

          <button
            onClick={() => {
              setConflictError('');
              setIsEntryModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Period</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4 text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const cId = e.target.value;
              setSelectedClassId(cId);
              const found = classes.find((c) => String(c.id) === cId);
              const secId = found?.sections?.[0]?.id || 1;
              setSelectedSectionId(String(secId));
              if (cId) {
                loadSubjects(Number(cId));
                loadTimetable(Number(cId), Number(secId));
              }
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
      </div>

      {/* Timetable Weekly Matrix Grid */}
      <div className="print-page bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3 border border-slate-800 text-left w-28">Day / Period</th>
                {periods.map((p: any) => (
                  <th key={p.id} className="py-2.5 px-3 border border-slate-800">
                    <div>{p.periodName}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {p.startTime} - {p.endTime}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 border border-slate-200 font-extrabold text-slate-800 bg-slate-50 text-left">
                    {day}
                  </td>
                  {periods.map((p: any) => {
                    if (p.isBreak) {
                      return (
                        <td
                          key={p.id}
                          className="py-3 px-2 border border-slate-200 bg-amber-50/60 text-amber-800 font-bold text-[11px]"
                        >
                          Recess / Break
                        </td>
                      );
                    }

                    const entry = entries.find(
                      (e: any) => e.dayOfWeek === day && e.periodId === p.id
                    );

                    return (
                      <td key={p.id} className="py-3 px-2 border border-slate-200">
                        {entry ? (
                          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-left space-y-0.5">
                            <span className="font-bold text-brand-800 block text-[11px] truncate">
                              {entry.subject?.name}
                            </span>
                            <span className="text-[10px] text-slate-600 block truncate">
                              {entry.teacher?.firstName} {entry.teacher?.lastName}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium block">
                              {entry.roomNo || 'Hall'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px] italic">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign Timetable Period with Conflict Check */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assign Period to Schedule</h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={entryDay}
                    onChange={(e) => setEntryDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period</label>
                  <select
                    value={entryPeriodId}
                    onChange={(e) => setEntryPeriodId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {periods.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.periodName} ({p.startTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  required
                  value={entrySubjectId}
                  onChange={(e) => setEntrySubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher *</label>
                <select
                  required
                  value={entryTeacherId}
                  onChange={(e) => setEntryTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="">Select Teacher</option>
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room / Hall</label>
                <input
                  type="text"
                  value={entryRoom}
                  onChange={(e) => setEntryRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm">
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
