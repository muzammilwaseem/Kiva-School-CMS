import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { DayOfWeek } from '@prisma/client';

export const getPeriods = async (req: Request, res: Response) => {
  try {
    const periods = await prisma.timetablePeriod.findMany({
      orderBy: { periodNumber: 'asc' },
    });
    return res.json(periods);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPeriod = async (req: Request, res: Response) => {
  try {
    const { periodNumber, periodName, startTime, endTime, isBreak } = req.body;
    const period = await prisma.timetablePeriod.create({
      data: {
        periodNumber: Number(periodNumber),
        periodName,
        startTime,
        endTime,
        isBreak: Boolean(isBreak),
      },
    });
    return res.status(201).json(period);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getClassTimetable = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, academicYearId } = req.query;

    if (!classGradeId || !sectionId) {
      return res.status(400).json({ error: 'Class and section are required.' });
    }

    const entries = await prisma.timetableEntry.findMany({
      where: {
        classGradeId: Number(classGradeId),
        sectionId: Number(sectionId),
        ...(academicYearId ? { academicYearId: Number(academicYearId) } : {}),
      },
      include: {
        period: true,
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
    });

    const periods = await prisma.timetablePeriod.findMany({ orderBy: { periodNumber: 'asc' } });

    return res.json({ entries, periods });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
    const teacherId = Number(req.params.teacherId);

    const entries = await prisma.timetableEntry.findMany({
      where: { teacherId },
      include: {
        period: true,
        subject: true,
        classGrade: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
    });

    const periods = await prisma.timetablePeriod.findMany({ orderBy: { periodNumber: 'asc' } });

    return res.json({ entries, periods });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const upsertTimetableEntry = async (req: Request, res: Response) => {
  try {
    const {
      academicYearId,
      classGradeId,
      sectionId,
      dayOfWeek,
      periodId,
      subjectId,
      teacherId,
      roomNo,
    } = req.body;

    let yearId = academicYearId ? Number(academicYearId) : null;
    if (!yearId) {
      const cur = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      yearId = cur ? cur.id : 1;
    }

    // 1. Conflict Check: Is teacher already teaching another class in this period & day?
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        academicYearId: yearId,
        teacherId: Number(teacherId),
        dayOfWeek: dayOfWeek as DayOfWeek,
        periodId: Number(periodId),
        NOT: {
          sectionId: Number(sectionId),
        },
      },
      include: {
        classGrade: true,
        section: true,
        teacher: true,
      },
    });

    if (teacherConflict) {
      return res.status(409).json({
        error: `Teacher Conflict: ${teacherConflict.teacher.firstName} ${teacherConflict.teacher.lastName} is already assigned to ${teacherConflict.classGrade.name} (${teacherConflict.section.name}) during this period on ${dayOfWeek}.`,
      });
    }

    // Upsert timetable entry
    const entry = await prisma.timetableEntry.upsert({
      where: {
        academicYearId_sectionId_dayOfWeek_periodId: {
          academicYearId: yearId,
          sectionId: Number(sectionId),
          dayOfWeek: dayOfWeek as DayOfWeek,
          periodId: Number(periodId),
        },
      },
      create: {
        academicYearId: yearId,
        classGradeId: Number(classGradeId),
        sectionId: Number(sectionId),
        dayOfWeek: dayOfWeek as DayOfWeek,
        periodId: Number(periodId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        roomNo: roomNo || null,
      },
      update: {
        classGradeId: Number(classGradeId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        roomNo: roomNo || null,
      },
    });

    return res.json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
