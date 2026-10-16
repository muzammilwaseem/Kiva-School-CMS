import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AttendanceStatus } from '@prisma/client';
import { logAudit } from '../middleware/audit';

// Get Attendance for a class, section, and date
export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, date } = req.query;

    if (!classGradeId || !date) {
      return res.status(400).json({ error: 'Class ID and date are required.' });
    }

    const targetDate = new Date(String(date));
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all active students in this class/section
    const studentWhere: any = {
      classGradeId: Number(classGradeId),
      status: 'ACTIVE',
    };
    if (sectionId) studentWhere.sectionId = Number(sectionId);

    const students = await prisma.student.findMany({
      where: studentWhere,
      orderBy: { rollNo: 'asc' },
    });

    // Get recorded attendances for this date
    const attendances = await prisma.studentAttendance.findMany({
      where: {
        classGradeId: Number(classGradeId),
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    const attendanceMap = new Map();
    attendances.forEach((a) => attendanceMap.set(a.studentId, a));

    const result = students.map((s) => {
      const rec = attendanceMap.get(s.id);
      return {
        studentId: s.id,
        rollNo: s.rollNo,
        admissionNo: s.admissionNo,
        fullName: `${s.firstName} ${s.lastName}`,
        status: rec ? rec.status : 'PRESENT', // default to PRESENT
        remarks: rec ? rec.remarks : '',
        attendanceId: rec ? rec.id : null,
      };
    });

    return res.json({
      date: targetDate.toISOString().split('T')[0],
      classGradeId: Number(classGradeId),
      sectionId: sectionId ? Number(sectionId) : null,
      records: result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Bulk Mark Attendance
export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, date, records } = req.body;

    if (!classGradeId || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Class, date, and attendance records are required.' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      for (const item of records) {
        await tx.studentAttendance.upsert({
          where: {
            studentId_date: {
              studentId: Number(item.studentId),
              date: targetDate,
            },
          },
          create: {
            studentId: Number(item.studentId),
            classGradeId: Number(classGradeId),
            sectionId: Number(sectionId || item.sectionId || 1),
            date: targetDate,
            status: item.status as AttendanceStatus,
            remarks: item.remarks || null,
            markedById: req.user?.id || null,
          },
          update: {
            status: item.status as AttendanceStatus,
            remarks: item.remarks || null,
            markedById: req.user?.id || null,
          },
        });
      }
    });

    await logAudit({
      userId: req.user?.id,
      action: 'MARK_ATTENDANCE',
      module: 'Attendance',
      details: `Marked attendance for ${records.length} students in Class ID ${classGradeId} for date ${date}`,
    });

    return res.json({ message: 'Attendance marked successfully.' });
  } catch (error: any) {
    console.error('Attendance mark error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Staff Attendance
export const getStaffAttendance = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(String(date)) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const staffMembers = await prisma.staff.findMany({
      where: { employmentStatus: 'ACTIVE' },
      orderBy: { id: 'asc' },
    });

    const attendances = await prisma.staffAttendance.findMany({
      where: {
        date: { gte: targetDate, lt: nextDay },
      },
    });

    const map = new Map();
    attendances.forEach((a) => map.set(a.staffId, a));

    const records = staffMembers.map((s) => {
      const rec = map.get(s.id);
      return {
        staffId: s.id,
        staffCode: s.staffId,
        fullName: `${s.firstName} ${s.lastName}`,
        designation: s.designation,
        department: s.department,
        status: rec ? rec.status : 'PRESENT',
        timeIn: rec ? rec.timeIn : '08:00 AM',
        timeOut: rec ? rec.timeOut : '02:30 PM',
        remarks: rec ? rec.remarks : '',
      };
    });

    return res.json({
      date: targetDate.toISOString().split('T')[0],
      records,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markStaffAttendance = async (req: Request, res: Response) => {
  try {
    const { date, records } = req.body;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      for (const item of records) {
        await tx.staffAttendance.upsert({
          where: {
            staffId_date: {
              staffId: Number(item.staffId),
              date: targetDate,
            },
          },
          create: {
            staffId: Number(item.staffId),
            date: targetDate,
            status: item.status as AttendanceStatus,
            timeIn: item.timeIn || null,
            timeOut: item.timeOut || null,
            remarks: item.remarks || null,
          },
          update: {
            status: item.status as AttendanceStatus,
            timeIn: item.timeIn || null,
            timeOut: item.timeOut || null,
            remarks: item.remarks || null,
          },
        });
      }
    });

    return res.json({ message: 'Staff attendance recorded successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
