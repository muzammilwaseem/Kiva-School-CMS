import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  DollarSign,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsManagement: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'financial' | 'defaulters' | 'enrollment'>('financial');
  const [finSummary, setFinSummary] = useState<any>(null);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, [activeReport]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      if (activeReport === 'financial') {
        const res = await api.getFinancialSummary();
        setFinSummary(res);
      } else if (activeReport === 'defaulters') {
        const res = await api.getFeeDefaulters();
        setDefaulters(res);
      } else if (activeReport === 'enrollment') {
        const res = await api.getStudents();
        setStudents(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (activeReport === 'defaulters') {
      const rows = defaulters.map((d) => ({
        'Invoice #': d.invoiceNo,
        'Student Name': `${d.student?.firstName} ${d.student?.lastName}`,
        'Admission #': d.student?.admissionNo,
        Class: d.student?.classGrade?.name,
        Month: `${d.month}/${d.year}`,
        'Total Amount': Number(d.netAmount),
        'Paid Amount': Number(d.paidAmount),
        'Outstanding Balance (PKR)': Number(d.balance),
        Status: d.status,
        'Parent Phone': d.student?.parentMappings?.[0]?.parent?.phone || '-',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Defaulters');
      XLSX.writeFile(wb, `Fee_Defaulters_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (activeReport === 'enrollment') {
      const rows = students.map((s) => ({
        'Admission #': s.admissionNo,
        Roll: s.rollNo || '-',
        Name: `${s.firstName} ${s.lastName}`,
        Class: s.classGrade?.name,
        Section: s.section?.name || 'A',
        Gender: s.gender,
        'B-Form': s.bFormNo || '-',
        'Father Name': s.parentMappings?.[0]?.parent?.fatherName || '-',
        Phone: s.phone || '-',
        Status: s.status,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Enrollment');
      XLSX.writeFile(wb, `Enrollment_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Export financial collection sheets, fee defaulters list, student demographics, and grade statistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        {[
          { id: 'financial', label: 'Financial Revenue Report', icon: DollarSign },
          { id: 'defaulters', label: 'Outstanding Fee Defaulters', icon: BarChart3 },
          { id: 'enrollment', label: 'Student Enrollment Roster', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeReport === tab.id
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

      {/* Financial Summary */}
      {activeReport === 'financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Today's Collections</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₨ {(finSummary?.todayCollection || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Daily Verified Cash Log</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">This Month's Collections</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₨ {(finSummary?.monthlyCollection || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500">{finSummary?.paymentsCountThisMonth || 0} Receipts Issued</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Outstanding Receivables</span>
              <p className="text-2xl font-bold text-rose-600 mt-2">
                ₨ {(finSummary?.totalOutstanding || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-rose-600 font-medium">Unpaid & Overdue Vouchers</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Collection by Payment Gateway / Channel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(finSummary?.collectionByMethod || {}).map(([method, amount]: any) => (
                <div key={method} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block">{method.replace('_', ' ')}</span>
                  <span className="font-extrabold text-slate-900 text-base mt-1 block">
                    ₨ {Number(amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Defaulters Report Table */}
      {activeReport === 'defaulters' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaulters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No fee defaulters recorded. All accounts in good standing!
                    </td>
                  </tr>
                ) : (
                  defaulters.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.invoiceNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {d.student?.firstName} {d.student?.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{d.student?.classGrade?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{d.month}/{d.year}</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">{new Date(d.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium">₨ {Number(d.netAmount).toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-rose-600 text-sm">
                        ₨ {Number(d.balance).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrollment Roster */}
      {activeReport === 'enrollment' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Admission #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">B-Form</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">{s.admissionNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.firstName} {s.lastName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.classGrade?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.rollNo || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.bFormNo || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-700">{s.parentMappings?.[0]?.parent?.fatherName || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{s.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
