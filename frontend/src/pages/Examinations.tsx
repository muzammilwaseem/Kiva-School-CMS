import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exam, ClassGrade } from '../types';
import {
  Award,
  Search,
  Plus,
  Printer,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export const ExaminationsManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'exams' | 'marks' | 'merit'>('exams');

  // Selected filters for marks entry
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Marks Entry Sheet State
  const [marksSheet, setMarksSheet] = useState<any>(null);
  const [marksEntries, setMarksEntries] = useState<any[]>([]);

  // Merit List State
  const [meritList, setMeritList] = useState<any[]>([]);

  // Report Card Modal
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState<any>(null);

  // New Exam Modal
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [examName, setExamName] = useState('');
  const [examStartDate, setExamStartDate] = useState('2026-11-10');
  const [examEndDate, setExamEndDate] = useState('2026-11-25');

  useEffect(() => {
    loadExamsAndClasses();
  }, []);

  const loadExamsAndClasses = async () => {
    setLoading(true);
    try {
      const [examsRes, classesRes] = await Promise.all([
        api.getExams(),
        api.getClassesAndSections(),
      ]);
      setExams(examsRes);
      setClasses(classesRes);
      if (examsRes.length > 0) setSelectedExamId(String(examsRes[0].id));
      if (classesRes.length > 0) {
        setSelectedClassId(String(classesRes[0].id));
        loadSubjectsForClass(classesRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsForClass = async (classId: number) => {
    try {
      const subs = await api.getSubjects({ classGradeId: classId });
      setSubjectsList(subs);
      if (subs.length > 0) setSelectedSubjectId(String(subs[0].id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    if (cId) loadSubjectsForClass(Number(cId));
  };

  // Load Marks Entry Grid
  const handleLoadMarksSheet = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) {
      alert('Please select Exam, Class, and Subject.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.getMarksSheet({
        examId: selectedExamId,
        classGradeId: selectedClassId,
        subjectId: selectedSubjectId,
      });
      setMarksSheet(res.schedule);
      setMarksEntries(res.records || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Marks
  const handleSaveMarks = async () => {
    if (!marksSheet) return;
    try {
      await api.saveMarks({
        examScheduleId: marksSheet.id,
        entries: marksEntries,
      });
      alert('Marks and calculated grades saved successfully!');
      handleLoadMarksSheet();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Load Merit List
  const handleLoadMeritList = async () => {
    if (!selectedExamId || !selectedClassId) return;
    setLoading(true);
    try {
      const res = await api.getClassMeritList({
        examId: selectedExamId,
        classGradeId: selectedClassId,
      });
      setMeritList(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // View Report Card
  const handleViewReportCard = async (studentId: number) => {
    try {
      const res = await api.getStudentReportCard(studentId, Number(selectedExamId));
      setReportCardData(res);
      setIsReportCardOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExam({
        name: examName,
        startDate: examStartDate,
        endDate: examEndDate,
        isPublished: true,
      });
      setIsNewExamModalOpen(false);
      loadExamsAndClasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Examinations & Result Cards</h2>
          <p className="text-xs text-slate-500">
            Terms assessment, marks entry with validation, merit positions, and printable report cards
          </p>
        </div>

        <button
          onClick={() => setIsNewExamModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Examination Term</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        {[
          { id: 'exams', label: 'Examination Terms', icon: Calendar },
          { id: 'marks', label: 'Marks Entry Sheet', icon: FileText },
          { id: 'merit', label: 'Class Merit List & Ranking', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'merit') handleLoadMeritList();
              }}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Examination Terms List */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <div key={ex.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                    Session 2025-2026
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    ex.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ex.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-2">{ex.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(ex.startDate).toLocaleDateString()} — {new Date(ex.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{ex.schedules?.length || 0} Scheduled Papers</span>
                <button
                  onClick={() => {
                    setSelectedExamId(String(ex.id));
                    setActiveTab('marks');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Enter Marks →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Marks Entry Sheet */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Exam:</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Class:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
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
                <label className="block text-slate-500 font-semibold mb-1">Subject:</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {subjectsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-5">
                <button
                  onClick={handleLoadMarksSheet}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Fetch Student Sheet
                </button>
              </div>
            </div>

            {marksSheet && (
              <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg text-indigo-900 font-medium">
                Max Marks: <strong>{Number(marksSheet.maxMarks)}</strong> • Passing:{' '}
                <strong>{Number(marksSheet.passingMarks)}</strong>
              </div>
            )}
          </div>

          {/* Marks Entry Grid */}
          {marksEntries.length > 0 && marksSheet && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {marksSheet.subject?.name} Marks Register
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Grading automatically calculated: 80%+ A+ (Outstanding), 70%+ A (Excellent), etc.
                  </p>
                </div>

                <button
                  onClick={handleSaveMarks}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Save Marks & Compute Grades
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Roll #</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Absent?</th>
                      <th className="py-2.5 px-4">Marks Obtained (Max: {Number(marksSheet.maxMarks)})</th>
                      <th className="py-2.5 px-4">Percentage</th>
                      <th className="py-2.5 px-4">Calculated Grade</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marksEntries.map((entry, idx) => {
                      const max = Number(marksSheet.maxMarks);
                      const currentMarks = Number(entry.marksObtained || 0);
                      const pct = entry.isAbsent ? 0 : Number(((currentMarks / max) * 100).toFixed(1));
                      let grade = 'F';
                      if (!entry.isAbsent) {
                        if (pct >= 80) grade = 'A+';
                        else if (pct >= 70) grade = 'A';
                        else if (pct >= 60) grade = 'B';
                        else if (pct >= 50) grade = 'C';
                        else if (pct >= 40) grade = 'D';
                      }

                      return (
                        <tr key={entry.studentId} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-4 font-semibold text-slate-700">{entry.rollNo || '-'}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">{entry.studentName}</td>
                          <td className="py-2.5 px-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entry.isAbsent}
                                onChange={(e) => {
                                  const updated = [...marksEntries];
                                  updated[idx].isAbsent = e.target.checked;
                                  if (e.target.checked) updated[idx].marksObtained = 0;
                                  setMarksEntries(updated);
                                }}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-0"
                              />
                              <span className="text-[11px] font-semibold text-rose-600">Absent</span>
                            </label>
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              disabled={entry.isAbsent}
                              max={max}
                              min={0}
                              value={entry.marksObtained}
                              onChange={(e) => {
                                const updated = [...marksEntries];
                                updated[idx].marksObtained = e.target.value;
                                setMarksEntries(updated);
                              }}
                              className="w-24 px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-semibold">{pct}%</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-800">
                              {entry.isAbsent ? 'ABS' : grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              placeholder="Remarks..."
                              value={entry.remarks || ''}
                              onChange={(e) => {
                                const updated = [...marksEntries];
                                updated[idx].remarks = e.target.value;
                                setMarksEntries(updated);
                              }}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-slate-700 focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Class Merit List & Positions */}
      {activeTab === 'merit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Filter Merit List:</span>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLoadMeritList}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Calculate Positions
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Roll #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Total Marks</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Overall Grade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meritList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Click "Calculate Positions" to view class merit ranking.
                      </td>
                    </tr>
                  ) : (
                    meritList.map((item) => (
                      <tr key={item.studentId} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              item.position === 1
                                ? 'bg-amber-400 text-slate-900 shadow-sm'
                                : item.position === 2
                                ? 'bg-slate-300 text-slate-800'
                                : item.position === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.position}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{item.rollNo || '-'}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                        <td className="py-3 px-4 text-slate-600">{item.classGradeName}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.totalObtained} / {item.totalMax}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-indigo-700">{item.overallPercentage}%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-black bg-indigo-100 text-indigo-800">
                            {item.overallGrade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleViewReportCard(item.studentId)}
                            className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Result Card</span>
                          </button>
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

      {/* Modal: Printable Student Report Card */}
      {isReportCardOpen && reportCardData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 no-print">
              <h3 className="font-bold text-slate-900 text-base">Student Official Report Card</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report Card</span>
                </button>
                <button onClick={() => setIsReportCardOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Sheet */}
            <div className="print-page border-2 border-slate-900 p-6 rounded-xl bg-white space-y-4">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <img
                  src={reportCardData.settings?.logoUrl || '/kiva-logo.png'}
                  alt="Kiva School"
                  className="h-16 w-auto mx-auto mb-2 object-contain"
                />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  {reportCardData.settings?.schoolName || 'Kiva School'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {reportCardData.settings?.campusName || 'PECHS Campus, Karachi'} • {reportCardData.settings?.address || '32/E, PECHS, Block 6, Karachi'} • Phone: {reportCardData.settings?.phone || '0300 0605482'}
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-wider">
                  Academic Progress Report • {reportCardData.exam?.name}
                </div>
              </div>

              {/* Student Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Student Name:</span>
                  <strong className="text-slate-900 font-bold">{reportCardData.student?.firstName} {reportCardData.student?.lastName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Admission #:</span>
                  <strong className="font-mono">{reportCardData.student?.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Class & Section:</span>
                  <strong>{reportCardData.student?.classGrade?.name} ({reportCardData.student?.section?.name || 'A'})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll Number:</span>
                  <strong>{reportCardData.student?.rollNo || '-'}</strong>
                </div>
              </div>

              {/* Marks Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3 border-r">Subject</th>
                    <th className="py-2 px-3 border-r text-center">Max Marks</th>
                    <th className="py-2 px-3 border-r text-center">Pass Marks</th>
                    <th className="py-2 px-3 border-r text-center">Marks Obtained</th>
                    <th className="py-2 px-3 border-r text-center">Percentage</th>
                    <th className="py-2 px-3 border-r text-center">Grade</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportCardData.subjects?.map((sub: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 border-r font-semibold text-slate-900">{sub.subjectName}</td>
                      <td className="py-2 px-3 border-r text-center">{sub.maxMarks}</td>
                      <td className="py-2 px-3 border-r text-center">{sub.passingMarks}</td>
                      <td className="py-2 px-3 border-r text-center font-bold text-indigo-700">{sub.marksObtained}</td>
                      <td className="py-2 px-3 border-r text-center font-medium">{sub.percentage}%</td>
                      <td className="py-2 px-3 border-r text-center font-black">{sub.grade}</td>
                      <td className="py-2 px-3 text-slate-600 italic">{sub.remarks || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900">
                    <td className="py-2 px-3 border-r">Total Summary</td>
                    <td className="py-2 px-3 border-r text-center">{reportCardData.summary?.totalMax}</td>
                    <td className="py-2 px-3 border-r text-center">-</td>
                    <td className="py-2 px-3 border-r text-center font-black text-indigo-900">
                      {reportCardData.summary?.totalObtained}
                    </td>
                    <td className="py-2 px-3 border-r text-center">{reportCardData.summary?.overallPercentage}%</td>
                    <td className="py-2 px-3 border-r text-center font-black text-sm">
                      {reportCardData.summary?.overallGrade}
                    </td>
                    <td className="py-2 px-3 font-bold text-emerald-800">
                      {reportCardData.summary?.status}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Grading Key */}
              <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-wrap items-center justify-between">
                <span>Grading Scale: A+ (80-100%) • A (70-79%) • B (60-69%) • C (50-59%) • D (40-49%) • F (Below 40%)</span>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-semibold text-slate-700">
                <div className="border-t border-slate-400 pt-1">Class Teacher</div>
                <div className="border-t border-slate-400 pt-1">Parent Signature</div>
                <div className="border-t border-slate-400 pt-1">Principal / Headmaster</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Exam */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Create Examination Session</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final Term Examination 2026"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={examStartDate}
                    onChange={(e) => setExamStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={examEndDate}
                    onChange={(e) => setExamEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
