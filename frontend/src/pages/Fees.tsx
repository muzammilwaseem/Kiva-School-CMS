import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FeeInvoice, ClassGrade } from '../types';
import {
  Receipt,
  Search,
  Plus,
  Filter,
  DollarSign,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  X,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const FeesManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');

  // Bulk Generator Form
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkDueDate, setBulkDueDate] = useState('2026-10-15');
  const [bulkClassId, setBulkClassId] = useState('');

  useEffect(() => {
    loadInvoices();
    loadClasses();
  }, [selectedClassId, selectedStatus]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedClassId) params.classGradeId = selectedClassId;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      const data = await api.getInvoices(params);
      setInvoices(data);
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

  const handleOpenPayment = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.balance));
    setIsPaymentModalOpen(true);
  };

  const handleOpenChallan = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setIsChallanModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.collectPayment({
        invoiceId: selectedInvoice.id,
        amountPaid: Number(paymentAmount),
        paymentMethod,
        transactionRef,
        remarks,
      });
      setIsPaymentModalOpen(false);
      loadInvoices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.generateBulkInvoices({
        month: bulkMonth,
        year: bulkYear,
        dueDate: bulkDueDate,
        classGradeId: bulkClassId || undefined,
      });
      alert(res.message);
      setIsBulkModalOpen(false);
      loadInvoices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fee & Accounts Management</h2>
          <p className="text-xs text-slate-500">
            Monthly fee voucher generation, 3-copy bank challans, payments, and defaulters (PKR)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Monthly Invoices</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, student name, admission #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadInvoices()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

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
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Month/Year</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading fee invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {inv.student?.firstName} {inv.student?.lastName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Adm: {inv.student?.admissionNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{inv.student?.classGrade?.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.month}/{inv.year}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₨ {Number(inv.netAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      ₨ {Number(inv.paidAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      ₨ {Number(inv.balance).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenChallan(inv)}
                          title="Print 3-Copy Bank Challan"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {Number(inv.balance) > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                          >
                            Collect Fee
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Payment Collection */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Record Fee Payment</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedInvoice.invoiceNo} • {selectedInvoice.student?.firstName} {selectedInvoice.student?.lastName}
                </p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                <span className="font-extrabold text-rose-600 text-base">
                  ₨ {Number(selectedInvoice.balance).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Paying Now (PKR) *</label>
                <input
                  type="number"
                  required
                  max={Number(selectedInvoice.balance)}
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="CASH">Cash Counter</option>
                  <option value="BANK_TRANSFER">Bank Deposit / Transfer (HBL / Meezan)</option>
                  <option value="CHEQUE">Bank Cheque</option>
                  <option value="ONLINE">Online Portal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Deposit Slip #</label>
                <input
                  type="text"
                  placeholder="e.g. HBL-DEP-102948"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Optional cashier remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Generate Invoices */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Generate Monthly Fee Vouchers</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBulk} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select
                  value={bulkClassId}
                  onChange={(e) => setBulkClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="">All Classes (Whole School)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Month</label>
                  <select
                    value={bulkMonth}
                    onChange={(e) => setBulkMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        Month {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Year</label>
                  <input
                    type="number"
                    value={bulkYear}
                    onChange={(e) => setBulkYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                Fee heads configured in the fee structure (Tuition, Lab, Exam) will be computed with any student-specific sibling/scholarship concessions automatically applied.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Start Generation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Printable 3-Part Pakistani School Fee Challan */}
      {isChallanModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 no-print">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Standard 3-Part Fee Challan</h3>
                <p className="text-xs text-slate-500">Habib Bank Limited (HBL) / Allied Bank / School Counter Format</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print 3 Copies</span>
                </button>
                <button onClick={() => setIsChallanModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3-Part Challan Layout (Bank Copy, School Copy, Student Copy) */}
            <div className="print-page grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-white">
              {['BANK COPY', 'SCHOOL ACCOUNTS COPY', 'STUDENT / PARENT COPY'].map((copyTitle, idx) => (
                <div key={idx} className="border-2 border-slate-800 p-3 rounded-lg flex flex-col justify-between text-[11px] leading-tight space-y-2">
                  {/* Header */}
                  <div className="text-center border-b pb-2 border-slate-300">
                    <img
                      src="/kiva-logo.png"
                      alt="Kiva School"
                      className="h-8 w-auto mx-auto mb-1 object-contain"
                    />
                    <span className="font-black text-slate-900 block text-xs tracking-tight uppercase">
                      Kiva School
                    </span>
                    <span className="text-[10px] text-slate-600 block">32/E, PECHS, Block 6, Karachi • 0300 0605482</span>
                    <span className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded inline-block mt-1">
                      {copyTitle}
                    </span>
                  </div>

                  {/* Challan Info */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Challan #:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-bold text-rose-600">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student:</span>
                      <span className="font-bold text-slate-900">{selectedInvoice.student?.firstName} {selectedInvoice.student?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class & Roll:</span>
                      <span>{selectedInvoice.student?.classGrade?.name} (Roll: {selectedInvoice.student?.rollNo || '-'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adm #:</span>
                      <span className="font-mono">{selectedInvoice.student?.admissionNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Billing Month:</span>
                      <span className="font-bold">{selectedInvoice.month}/{selectedInvoice.year}</span>
                    </div>
                  </div>

                  {/* Fee Items Breakdown */}
                  <table className="w-full text-[10px] border-t border-b border-slate-300 my-1">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600">
                        <th className="py-1 text-left">Fee Head</th>
                        <th className="py-1 text-right">PKR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedInvoice.items || []).map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-0.5 text-slate-800">{item.feeHeadName}</td>
                          <td className="py-0.5 text-right font-medium">₨ {Number(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                      {Number(selectedInvoice.discountTotal) > 0 && (
                        <tr className="text-emerald-700">
                          <td className="py-0.5">Concession / Discount:</td>
                          <td className="py-0.5 text-right">-₨ {Number(selectedInvoice.discountTotal).toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="font-extrabold border-t border-slate-800 text-slate-900">
                        <td className="py-1">Total Payable:</td>
                        <td className="py-1 text-right">₨ {Number(selectedInvoice.netAmount).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Bank Instructions */}
                  <div className="text-[9px] text-slate-500 space-y-0.5">
                    <p>• Accepted at all HBL & Meezan branches across Pakistan.</p>
                    <p>• Late fee fine of ₨ 500 applies after due date.</p>
                  </div>

                  {/* Signatures */}
                  <div className="pt-4 flex items-center justify-between text-[9px] text-slate-600 border-t border-dashed border-slate-300">
                    <span>Officer / Cashier</span>
                    <span>Authorized Signature</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
