import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AttendanceStatus, InvoiceStatus, StudentStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Core Counts
    const totalStudents = await prisma.student.count({
      where: { status: StudentStatus.ACTIVE },
    });

    const totalStaff = await prisma.staff.count({
      where: { employmentStatus: 'ACTIVE' },
    });

    const totalClasses = await prisma.classGrade.count();
    const totalSections = await prisma.section.count();

    // 2. Today's Attendance
    const todayAttendances = await prisma.studentAttendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const presentCount = todayAttendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
    ).length;
    const absentCount = todayAttendances.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const leaveCount = todayAttendances.filter((a) => a.status === AttendanceStatus.LEAVE).length;

    const totalMarkedToday = todayAttendances.length;
    const attendancePercentage = totalMarkedToday > 0 ? ((presentCount / totalMarkedToday) * 100).toFixed(1) : '100.0';

    // 3. Fee Finances
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Payments collected this month
    const monthlyPayments = await prisma.feePayment.findMany({
      where: {
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const feesCollectedThisMonth = monthlyPayments.reduce(
      (acc, payment) => acc + Number(payment.amountPaid),
      0
    );

    // Total outstanding balance across all unpaid/partial/overdue invoices
    const outstandingInvoices = await prisma.feeInvoice.findMany({
      where: {
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      },
    });

    const outstandingFeeBalance = outstandingInvoices.reduce(
      (acc, inv) => acc + Number(inv.balance),
      0
    );

    // 4. Upcoming exams & events
    const upcomingExams = await prisma.exam.findMany({
      where: {
        startDate: { gte: today },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    // 5. Recent admissions
    const recentAdmissions = await prisma.student.findMany({
      take: 5,
      orderBy: { admissionDate: 'desc' },
      include: {
        classGrade: true,
        section: true,
      },
    });

    // 6. Recent fee payments
    const recentPayments = await prisma.feePayment.findMany({
      take: 6,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          include: {
            student: true,
          },
        },
      },
    });

    // 7. Announcements
    const announcements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { publishedAt: 'desc' },
    });

    // 8. Monthly Fee Collection Trend (past 6 months)
    const monthlyCollectionTrend = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const mStart = new Date(y, m - 1, 1);
      const mEnd = new Date(y, m, 0, 23, 59, 59);

      const payments = await prisma.feePayment.findMany({
        where: { paymentDate: { gte: mStart, lte: mEnd } },
      });
      const collected = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

      const invoices = await prisma.feeInvoice.findMany({
        where: { month: m, year: y },
      });
      const invoiced = invoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);

      monthlyCollectionTrend.push({
        month: monthNames[m - 1],
        invoiced,
        collected,
      });
    }

    // 9. Class-wise Enrollment Breakdown
    const classes = await prisma.classGrade.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    const enrollmentDistribution = classes.map((c) => ({
      className: c.name,
      students: c._count.students,
    }));

    // 10. Attendance Trends (last 7 days)
    const attendanceTrends = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      const nextD = new Date(targetDate);
      nextD.setDate(nextD.getDate() + 1);

      const dayRecords = await prisma.studentAttendance.findMany({
        where: {
          date: { gte: targetDate, lt: nextD },
        },
      });

      const pres = dayRecords.filter(
        (r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
      ).length;
      const abs = dayRecords.filter((r) => r.status === AttendanceStatus.ABSENT).length;

      attendanceTrends.push({
        day: dayNames[targetDate.getDay()],
        date: targetDate.toISOString().split('T')[0],
        present: pres,
        absent: abs,
      });
    }

    return res.json({
      summary: {
        totalStudents,
        totalStaff,
        totalClasses,
        totalSections,
        studentsPresentToday: presentCount,
        studentsAbsentToday: absentCount,
        studentsOnLeaveToday: leaveCount,
        attendancePercentage,
        feesCollectedThisMonth,
        outstandingFeeBalance,
      },
      upcomingExams,
      recentAdmissions,
      recentPayments,
      announcements,
      charts: {
        monthlyCollectionTrend,
        enrollmentDistribution,
        attendanceTrends,
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: error.message });
  }
};
