import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { logAudit } from '../middleware/audit';

// Helper to calculate grade from percentage
async function calculateGrade(percentage: number): Promise<{ grade: string; remarks: string }> {
  const scale = await prisma.gradingScale.findFirst({
    where: {
      minPercentage: { lte: percentage },
      maxPercentage: { gte: percentage },
    },
  });

  if (scale) {
    return { grade: scale.gradeName, remarks: scale.remarks || '' };
  }
  return percentage >= 40 ? { grade: 'D', remarks: 'Pass' } : { grade: 'F', remarks: 'Fail' };
}

// 1. Exams List & Creation
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        academicYear: true,
        schedules: {
          include: {
            classGrade: true,
            subject: true,
            _count: { select: { results: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
    return res.json(exams);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const { name, academicYearId, startDate, endDate, isPublished } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Exam name, start date, and end date are required.' });
    }

    let yearId = academicYearId ? Number(academicYearId) : null;
    if (!yearId) {
      const cur = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      yearId = cur ? cur.id : 1;
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        academicYearId: yearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isPublished: Boolean(isPublished),
      },
    });

    return res.status(201).json(exam);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. Exam Schedules (Subject exam timetable and max marks)
export const createExamSchedule = async (req: Request, res: Response) => {
  try {
    const { examId, classGradeId, subjectId, examDate, startTime, endTime, maxMarks, passingMarks, roomNo } = req.body;

    const schedule = await prisma.examSchedule.create({
      data: {
        examId: Number(examId),
        classGradeId: Number(classGradeId),
        subjectId: Number(subjectId),
        examDate: new Date(examDate),
        startTime: startTime || '09:00 AM',
        endTime: endTime || '12:00 PM',
        maxMarks: maxMarks ? Number(maxMarks) : 100.0,
        passingMarks: passingMarks ? Number(passingMarks) : 40.0,
        roomNo: roomNo || null,
      },
    });

    return res.status(201).json(schedule);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Get Marks Entry Sheet
export const getMarksEntrySheet = async (req: Request, res: Response) => {
  try {
    const { examId, classGradeId, sectionId, subjectId } = req.query;

    if (!examId || !classGradeId || !subjectId) {
      return res.status(400).json({ error: 'Exam, Class, and Subject are required.' });
    }

    // Find schedule
    const schedule = await prisma.examSchedule.findFirst({
      where: {
        examId: Number(examId),
        classGradeId: Number(classGradeId),
        subjectId: Number(subjectId),
      },
      include: {
        subject: true,
        exam: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'No exam schedule found for this subject and class.' });
    }

    // Students in this class/section
    const studentWhere: any = {
      classGradeId: Number(classGradeId),
      status: 'ACTIVE',
    };
    if (sectionId) studentWhere.sectionId = Number(sectionId);

    const students = await prisma.student.findMany({
      where: studentWhere,
      orderBy: { rollNo: 'asc' },
    });

    // Existing results
    const existingResults = await prisma.examResult.findMany({
      where: { examScheduleId: schedule.id },
    });

    const resultMap = new Map();
    existingResults.forEach((r) => resultMap.set(r.studentId, r));

    const records = students.map((s) => {
      const res = resultMap.get(s.id);
      return {
        studentId: s.id,
        rollNo: s.rollNo,
        admissionNo: s.admissionNo,
        studentName: `${s.firstName} ${s.lastName}`,
        marksObtained: res ? Number(res.marksObtained) : 0,
        isAbsent: res ? res.isAbsent : false,
        grade: res ? res.grade : '',
        percentage: res ? Number(res.percentage) : 0,
        remarks: res ? res.remarks : '',
      };
    });

    return res.json({
      schedule,
      records,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 4. Save/Update Marks
export const saveMarks = async (req: Request, res: Response) => {
  try {
    const { examScheduleId, entries } = req.body;

    if (!examScheduleId || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Exam schedule and marks entries are required.' });
    }

    const schedule = await prisma.examSchedule.findUnique({
      where: { id: Number(examScheduleId) },
    });

    if (!schedule) return res.status(404).json({ error: 'Exam schedule not found.' });

    const maxMarks = Number(schedule.maxMarks);

    await prisma.$transaction(async (tx) => {
      for (const item of entries) {
        const studentId = Number(item.studentId);
        const isAbsent = Boolean(item.isAbsent);
        const marksObtained = isAbsent ? 0 : Math.min(maxMarks, Math.max(0, Number(item.marksObtained || 0)));
        const percentage = isAbsent ? 0 : Number(((marksObtained / maxMarks) * 100).toFixed(2));

        const { grade, remarks } = isAbsent
          ? { grade: 'F', remarks: 'Absent' }
          : await calculateGrade(percentage);

        await tx.examResult.upsert({
          where: {
            examScheduleId_studentId: {
              examScheduleId: schedule.id,
              studentId,
            },
          },
          create: {
            examId: schedule.examId,
            examScheduleId: schedule.id,
            studentId,
            marksObtained,
            isAbsent,
            percentage,
            grade,
            remarks: item.remarks || remarks,
          },
          update: {
            marksObtained,
            isAbsent,
            percentage,
            grade,
            remarks: item.remarks || remarks,
          },
        });
      }
    });

    await logAudit({
      userId: req.user?.id,
      action: 'SUBMIT_MARKS',
      module: 'Examinations',
      details: `Submitted marks for ${entries.length} students in Exam Schedule ID ${schedule.id}`,
    });

    return res.json({ message: 'Marks submitted and grades calculated successfully.' });
  } catch (error: any) {
    console.error('Save marks error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// 5. Class Merit List (Rankings)
export const getClassMeritList = async (req: Request, res: Response) => {
  try {
    const { examId, classGradeId, sectionId } = req.query;

    if (!examId || !classGradeId) {
      return res.status(400).json({ error: 'Exam and Class are required.' });
    }

    const studentWhere: any = {
      classGradeId: Number(classGradeId),
      status: 'ACTIVE',
    };
    if (sectionId) studentWhere.sectionId = Number(sectionId);

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        classGrade: true,
        section: true,
        examResults: {
          where: { examId: Number(examId) },
          include: {
            schedule: {
              include: { subject: true },
            },
          },
        },
      },
    });

    // Calculate aggregated totals for each student
    const meritList = students.map((s) => {
      let totalObtained = 0;
      let totalMax = 0;
      let subjectsCount = s.examResults.length;
      let hasFailed = false;

      s.examResults.forEach((r) => {
        const obt = Number(r.marksObtained);
        const max = Number(r.schedule.maxMarks);
        const pass = Number(r.schedule.passingMarks);

        totalObtained += obt;
        totalMax += max;
        if (obt < pass || r.isAbsent) hasFailed = true;
      });

      const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
      let overallGrade = 'F';
      if (overallPercentage >= 80) overallGrade = 'A+';
      else if (overallPercentage >= 70) overallGrade = 'A';
      else if (overallPercentage >= 60) overallGrade = 'B';
      else if (overallPercentage >= 50) overallGrade = 'C';
      else if (overallPercentage >= 40) overallGrade = 'D';

      return {
        studentId: s.id,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        studentName: `${s.firstName} ${s.lastName}`,
        classGradeName: s.classGrade.name,
        sectionName: s.section?.name || 'General',
        subjectsCount,
        totalObtained,
        totalMax,
        overallPercentage,
        overallGrade,
        status: hasFailed ? 'FAILED' : 'PASSED',
        results: s.examResults,
      };
    });

    // Sort by overallPercentage descending to assign positions
    meritList.sort((a, b) => b.overallPercentage - a.overallPercentage);

    const rankedList = meritList.map((item, index) => ({
      position: index + 1,
      ...item,
    }));

    return res.json(rankedList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 6. Student Report Card
export const getStudentReportCard = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    const examId = Number(req.query.examId);

    if (!studentId || !examId) {
      return res.status(400).json({ error: 'Student ID and Exam ID are required.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classGrade: true,
        section: true,
        parentMappings: {
          include: { parent: true },
        },
      },
    });

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { academicYear: true },
    });

    const results = await prisma.examResult.findMany({
      where: {
        studentId,
        examId,
      },
      include: {
        schedule: {
          include: { subject: true },
        },
      },
    });

    const settings = await prisma.schoolSetting.findFirst();
    const gradingScales = await prisma.gradingScale.findMany({ orderBy: { minPercentage: 'desc' } });

    let totalObtained = 0;
    let totalMax = 0;
    let failCount = 0;

    const subjectsSummary = results.map((r) => {
      const obt = Number(r.marksObtained);
      const max = Number(r.schedule.maxMarks);
      const pass = Number(r.schedule.passingMarks);
      totalObtained += obt;
      totalMax += max;
      if (obt < pass || r.isAbsent) failCount++;

      return {
        subjectName: r.schedule.subject.name,
        subjectCode: r.schedule.subject.code,
        maxMarks: max,
        passingMarks: pass,
        marksObtained: obt,
        isAbsent: r.isAbsent,
        percentage: Number(r.percentage),
        grade: r.grade,
        remarks: r.remarks,
      };
    });

    const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    let overallGrade = 'F';
    if (overallPercentage >= 80) overallGrade = 'A+';
    else if (overallPercentage >= 70) overallGrade = 'A';
    else if (overallPercentage >= 60) overallGrade = 'B';
    else if (overallPercentage >= 50) overallGrade = 'C';
    else if (overallPercentage >= 40) overallGrade = 'D';

    return res.json({
      student,
      exam,
      settings,
      gradingScales,
      subjects: subjectsSummary,
      summary: {
        totalMax,
        totalObtained,
        overallPercentage,
        overallGrade,
        status: failCount === 0 ? 'PASSED' : 'FAILED',
        failCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
