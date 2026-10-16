import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { logAudit } from '../middleware/audit';

// Generate unique receipt number
async function generateReceiptNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.feePayment.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  let candidate = `REC-${currentYear}-${nextNum}`;

  let existing = await prisma.feePayment.findUnique({ where: { receiptNo: candidate } });
  let counter = count + 1;
  while (existing) {
    counter++;
    candidate = `REC-${currentYear}-${counter.toString().padStart(4, '0')}`;
    existing = await prisma.feePayment.findUnique({ where: { receiptNo: candidate } });
  }
  return candidate;
}

// Generate unique invoice number
async function generateInvoiceNumber(month: number, year: number): Promise<string> {
  const count = await prisma.feeInvoice.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  let candidate = `INV-${year}${month.toString().padStart(2, '0')}-${nextNum}`;

  let existing = await prisma.feeInvoice.findUnique({ where: { invoiceNo: candidate } });
  let counter = count + 1;
  while (existing) {
    counter++;
    candidate = `INV-${year}${month.toString().padStart(2, '0')}-${counter.toString().padStart(4, '0')}`;
    existing = await prisma.feeInvoice.findUnique({ where: { invoiceNo: candidate } });
  }
  return candidate;
}

// 1. Fee Categories & Structure
export const getFeeCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.feeCategory.findMany({
      include: {
        feeStructures: {
          include: { classGrade: true },
        },
      },
    });
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createFeeCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, isRecurring } = req.body;
    const cat = await prisma.feeCategory.create({
      data: {
        name,
        description,
        isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : true,
      },
    });
    return res.status(201).json(cat);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const { classGradeId, academicYearId } = req.query;
    const where: any = {};
    if (classGradeId) where.classGradeId = Number(classGradeId);
    if (academicYearId) where.academicYearId = Number(academicYearId);

    const structures = await prisma.feeStructure.findMany({
      where,
      include: {
        feeCategory: true,
        classGrade: true,
        academicYear: true,
      },
    });
    return res.json(structures);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const upsertFeeStructure = async (req: Request, res: Response) => {
  try {
    const { academicYearId, classGradeId, feeCategoryId, amount, dueDateDay } = req.body;

    const structure = await prisma.feeStructure.upsert({
      where: {
        academicYearId_classGradeId_feeCategoryId: {
          academicYearId: Number(academicYearId),
          classGradeId: Number(classGradeId),
          feeCategoryId: Number(feeCategoryId),
        },
      },
      create: {
        academicYearId: Number(academicYearId),
        classGradeId: Number(classGradeId),
        feeCategoryId: Number(feeCategoryId),
        amount: Number(amount),
        dueDateDay: dueDateDay ? Number(dueDateDay) : 10,
      },
      update: {
        amount: Number(amount),
        dueDateDay: dueDateDay ? Number(dueDateDay) : 10,
      },
    });

    return res.json(structure);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. Invoices List with filters
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { classGradeId, status, month, year, search } = req.query;

    const where: any = {};
    if (status) where.status = status as InvoiceStatus;
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);

    if (classGradeId) {
      where.student = { classGradeId: Number(classGradeId) };
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: String(search) } },
        { student: { firstName: { contains: String(search) } } },
        { student: { lastName: { contains: String(search) } } },
        { student: { admissionNo: { contains: String(search) } } },
      ];
    }

    const invoices = await prisma.feeInvoice.findMany({
      where,
      include: {
        student: {
          include: {
            classGrade: true,
            section: true,
            parentMappings: {
              include: { parent: true },
            },
          },
        },
        items: true,
        payments: true,
      },
      orderBy: { id: 'desc' },
    });

    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const invoice = await prisma.feeInvoice.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            classGrade: true,
            section: true,
            parentMappings: {
              include: { parent: true },
            },
          },
        },
        items: {
          include: { feeCategory: true },
        },
        payments: true,
        academicYear: true,
      },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const settings = await prisma.schoolSetting.findFirst();

    return res.json({ invoice, settings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Bulk Monthly Invoice Generator
export const generateBulkMonthlyInvoices = async (req: Request, res: Response) => {
  try {
    const { classGradeId, month, year, dueDate } = req.body;

    if (!month || !year || !dueDate) {
      return res.status(400).json({ error: 'Month, year, and due date are required.' });
    }

    const m = Number(month);
    const y = Number(year);
    const targetDueDate = new Date(dueDate);

    // Current Academic Year
    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!currentYear) return res.status(400).json({ error: 'No active academic year found.' });

    const studentWhere: any = {
      status: 'ACTIVE',
      academicYearId: currentYear.id,
    };
    if (classGradeId) studentWhere.classGradeId = Number(classGradeId);

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        feeConcessions: true,
      },
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const student of students) {
      // Check if already invoiced for this month/year
      const existing = await prisma.feeInvoice.findFirst({
        where: {
          studentId: student.id,
          month: m,
          year: y,
        },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Find applicable fee structures for student's class
      const structures = await prisma.feeStructure.findMany({
        where: {
          classGradeId: student.classGradeId,
          academicYearId: currentYear.id,
        },
        include: { feeCategory: true },
      });

      if (structures.length === 0) {
        skippedCount++;
        continue;
      }

      let subtotal = 0;
      let discountTotal = 0;

      const itemsData = structures.map((st) => {
        const itemAmount = Number(st.amount);
        subtotal += itemAmount;

        // Check if student has concession for this fee category
        const concession = student.feeConcessions.find(
          (c) => c.feeCategoryId === st.feeCategoryId && c.isApproved
        );

        let itemDiscount = 0;
        if (concession) {
          if (concession.discountType === 'PERCENTAGE') {
            itemDiscount = (itemAmount * Number(concession.discountValue)) / 100;
          } else {
            itemDiscount = Number(concession.discountValue);
          }
        }
        discountTotal += itemDiscount;

        return {
          feeCategoryId: st.feeCategoryId,
          feeHeadName: st.feeCategory.name,
          amount: itemAmount,
          discountAmount: itemDiscount,
        };
      });

      const netAmount = Math.max(0, subtotal - discountTotal);
      const invoiceNo = await generateInvoiceNumber(m, y);

      await prisma.feeInvoice.create({
        data: {
          invoiceNo,
          studentId: student.id,
          academicYearId: currentYear.id,
          month: m,
          year: y,
          dueDate: targetDueDate,
          subtotal,
          discountTotal,
          fineTotal: 0,
          netAmount,
          paidAmount: 0,
          balance: netAmount,
          status: InvoiceStatus.UNPAID,
          items: {
            create: itemsData,
          },
        },
      });

      createdCount++;
    }

    await logAudit({
      userId: req.user?.id,
      action: 'BULK_INVOICE_GENERATION',
      module: 'Finance',
      details: `Generated ${createdCount} invoices for Month ${m}/${y} (Skipped: ${skippedCount})`,
    });

    return res.json({
      message: `Bulk invoice generation complete. ${createdCount} invoices created, ${skippedCount} skipped (already existed or no fee structure).`,
      createdCount,
      skippedCount,
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 4. Record Payment / Collect Fee
export const collectPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amountPaid, paymentMethod, transactionRef, remarks } = req.body;

    if (!invoiceId || !amountPaid || Number(amountPaid) <= 0) {
      return res.status(400).json({ error: 'Valid invoice and payment amount are required.' });
    }

    const numAmount = Number(amountPaid);

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: Number(invoiceId) },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const currentBalance = Number(invoice.balance);
    if (numAmount > currentBalance) {
      return res.status(400).json({
        error: `Amount paid (₨ ${numAmount}) exceeds outstanding balance (₨ ${currentBalance}).`,
      });
    }

    const receiptNo = await generateReceiptNumber();

    const paymentResult = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.feePayment.create({
        data: {
          receiptNo,
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          amountPaid: numAmount,
          paymentDate: new Date(),
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          transactionRef: transactionRef || null,
          remarks: remarks || null,
          receivedBy: req.user?.username || 'Accountant',
        },
      });

      // 2. Update Invoice
      const newPaidTotal = Number(invoice.paidAmount) + numAmount;
      const newBalance = Math.max(0, currentBalance - numAmount);
      const newStatus = newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidTotal,
          balance: newBalance,
          status: newStatus,
        },
      });

      return { payment, updatedInvoice };
    });

    await logAudit({
      userId: req.user?.id,
      action: 'COLLECT_FEE',
      module: 'Finance',
      details: `Collected ₨ ${numAmount} for Invoice ${invoice.invoiceNo} (Receipt No: ${receiptNo})`,
    });

    return res.json({
      message: 'Payment recorded successfully.',
      receiptNo,
      ...paymentResult,
    });
  } catch (error: any) {
    console.error('Payment collection error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 5. Fee Defaulters List
export const getFeeDefaulters = async (req: Request, res: Response) => {
  try {
    const { classGradeId } = req.query;

    const where: any = {
      status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
    };

    if (classGradeId) {
      where.student = { classGradeId: Number(classGradeId) };
    }

    const defaulters = await prisma.feeInvoice.findMany({
      where,
      include: {
        student: {
          include: {
            classGrade: true,
            section: true,
            parentMappings: {
              include: { parent: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return res.json(defaulters);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 6. Financial Summary Reports
export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's collections
    const todayPayments = await prisma.feePayment.findMany({
      where: { paymentDate: { gte: today } },
    });
    const todayCollection = todayPayments.reduce((s, p) => s + Number(p.amountPaid), 0);

    // This month's collections
    const monthPayments = await prisma.feePayment.findMany({
      where: { paymentDate: { gte: startOfMonth } },
    });
    const monthlyCollection = monthPayments.reduce((s, p) => s + Number(p.amountPaid), 0);

    // Outstanding dues
    const outstandingInvoices = await prisma.feeInvoice.findMany({
      where: { status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] } },
    });
    const totalOutstanding = outstandingInvoices.reduce((s, inv) => s + Number(inv.balance), 0);

    // Breakdown by payment method
    const byMethod: Record<string, number> = {};
    monthPayments.forEach((p) => {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + Number(p.amountPaid);
    });

    return res.json({
      todayCollection,
      monthlyCollection,
      totalOutstanding,
      paymentsCountThisMonth: monthPayments.length,
      collectionByMethod: byMethod,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
