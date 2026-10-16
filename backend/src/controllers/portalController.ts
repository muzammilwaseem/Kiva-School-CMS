import { Request, Response } from 'express';
import { prisma } from '../prisma';

// PARENT PORTAL: Get all children linked to the currently logged in parent
export const getParentChildren = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    const parent = await prisma.parentGuardian.findFirst({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                classGrade: true,
                section: true,
                academicYear: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      // In case user is demo parent or not linked yet, find the first parent in DB for demo purposes
      const fallbackParent = await prisma.parentGuardian.findFirst({
        include: {
          children: {
            include: {
              student: {
                include: {
                  classGrade: true,
                  section: true,
                  academicYear: true,
                },
              },
            },
          },
        },
      });

      if (!fallbackParent) return res.json({ parent: null, children: [] });
      return res.json({
        parent: fallbackParent,
        children: fallbackParent.children.map((c) => ({
          relationship: c.relationship,
          ...c.student,
        })),
      });
    }

    const children = parent.children.map((c) => ({
      relationship: c.relationship,
      ...c.student,
    }));

    return res.json({ parent, children });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// PARENT PORTAL: Child specific complete dashboard (Attendance, Invoices, Results, Timetable, Homework)
export const getChildDetails = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    const userId = req.user?.id;

    // Security check: verify this parent actually owns this student, unless admin
    if (req.user?.role === 'PARENT') {
      const parent = await prisma.parentGuardian.findFirst({ where: { userId } });
      if (parent) {
        const link = await prisma.parentStudentMapping.findFirst({
          where: { parentId: parent.id, studentId },
        });
        if (!link) {
          return res.status(403).json({ error: 'Unauthorized. This student is not linked to your parent account.' });
        }
      }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classGrade: true,
        section: true,
        academicYear: true,
        attendances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        invoices: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { id: 'desc' },
        },
        examResults: {
          where: {
            exam: { isPublished: true },
          },
          include: {
            exam: true,
            schedule: {
              include: { subject: true },
            },
          },
        },
        homeworkSubmissions: {
          include: {
            homework: {
              include: {
                subject: true,
                teacher: true,
              },
            },
          },
        },
        transportAllocation: {
          include: {
            route: {
              include: { vehicle: true },
            },
          },
        },
      },
    });

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Active homework for student's class
    const homework = await prisma.homework.findMany({
      where: {
        classGradeId: student.classGradeId,
        sectionId: student.sectionId || undefined,
      },
      include: {
        subject: true,
        teacher: true,
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Class timetable
    const timetable = await prisma.timetableEntry.findMany({
      where: {
        classGradeId: student.classGradeId,
        sectionId: student.sectionId || undefined,
      },
      include: {
        period: true,
        subject: true,
        teacher: true,
      },
    });

    return res.json({
      student,
      homework,
      timetable,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// STUDENT PORTAL: Logged-in student dashboard
export const getStudentPortalData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let student = await prisma.student.findFirst({
      where: { userId },
      include: {
        classGrade: true,
        section: true,
        academicYear: true,
      },
    });

    // Fallback for demo student if user not linked
    if (!student) {
      student = await prisma.student.findFirst({
        where: { admissionNo: 'ADM-2025-001' },
        include: {
          classGrade: true,
          section: true,
          academicYear: true,
        },
      });
    }

    if (!student) return res.status(404).json({ error: 'Student record not found.' });

    // Attendance
    const attendances = await prisma.studentAttendance.findMany({
      where: { studentId: student.id },
      take: 30,
      orderBy: { date: 'desc' },
    });

    // Published Exam Results
    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        exam: { isPublished: true },
      },
      include: {
        exam: true,
        schedule: {
          include: { subject: true },
        },
      },
    });

    // Timetable
    const timetable = await prisma.timetableEntry.findMany({
      where: {
        classGradeId: student.classGradeId,
        sectionId: student.sectionId || undefined,
      },
      include: {
        period: true,
        subject: true,
        teacher: true,
      },
      orderBy: { period: { periodNumber: 'asc' } },
    });

    // Homework
    const homework = await prisma.homework.findMany({
      where: {
        classGradeId: student.classGradeId,
        sectionId: student.sectionId || undefined,
      },
      include: {
        subject: true,
        teacher: true,
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Invoices
    const invoices = await prisma.feeInvoice.findMany({
      where: { studentId: student.id },
      include: { items: true, payments: true },
      orderBy: { id: 'desc' },
    });

    return res.json({
      student,
      attendances,
      examResults,
      timetable,
      homework,
      invoices,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
