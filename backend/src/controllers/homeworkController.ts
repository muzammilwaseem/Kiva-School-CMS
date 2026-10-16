import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getHomeworkList = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, subjectId } = req.query;
    const where: any = {};
    if (classGradeId) where.classGradeId = Number(classGradeId);
    if (sectionId) where.sectionId = Number(sectionId);
    if (subjectId) where.subjectId = Number(subjectId);

    const homework = await prisma.homework.findMany({
      where,
      include: {
        classGrade: true,
        section: true,
        subject: true,
        teacher: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'desc' },
    });

    return res.json(homework);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createHomework = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, subjectId, teacherId, title, description, dueDate } = req.body;

    if (!classGradeId || !subjectId || !title || !dueDate) {
      return res.status(400).json({ error: 'Class, subject, title, and due date are required.' });
    }

    // Default teacher if not provided
    let tId = teacherId ? Number(teacherId) : req.user?.staffId;
    if (!tId) {
      const firstStaff = await prisma.staff.findFirst();
      tId = firstStaff ? firstStaff.id : 1;
    }

    const homework = await prisma.homework.create({
      data: {
        classGradeId: Number(classGradeId),
        sectionId: Number(sectionId || 1),
        subjectId: Number(subjectId),
        teacherId: tId,
        title,
        description,
        dueDate: new Date(dueDate),
      },
    });

    return res.status(201).json(homework);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const submitHomework = async (req: Request, res: Response) => {
  try {
    const { homeworkId, studentId, submissionText } = req.body;

    let sId = studentId ? Number(studentId) : req.user?.studentId;
    if (!sId) {
      const firstStudent = await prisma.student.findFirst();
      sId = firstStudent ? firstStudent.id : 1;
    }

    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId: Number(homeworkId),
          studentId: sId,
        },
      },
      create: {
        homeworkId: Number(homeworkId),
        studentId: sId,
        submissionText,
        status: 'SUBMITTED',
      },
      update: {
        submissionText,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return res.json(submission);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
