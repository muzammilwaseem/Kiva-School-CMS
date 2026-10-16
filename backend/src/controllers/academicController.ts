import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { logAudit } from '../middleware/audit';

// Academic Years
export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });
    return res.json(years);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createAcademicYear = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Name, start date, and end date are required.' });
    }

    if (isCurrent) {
      // Unset previous current years
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }

    const year = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: Boolean(isCurrent),
      },
    });

    if (isCurrent) {
      await prisma.schoolSetting.updateMany({
        data: { activeAcademicYearId: year.id },
      });
    }

    return res.status(201).json(year);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Classes and Sections
export const getClassesAndSections = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.classGrade.findMany({
      include: {
        sections: {
          include: {
            classTeacher: true,
            _count: { select: { students: true } },
          },
        },
        subjects: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: { numericLevel: 'asc' },
    });
    return res.json(classes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createClassGrade = async (req: Request, res: Response) => {
  try {
    const { name, numericLevel, description } = req.body;
    if (!name || numericLevel === undefined) {
      return res.status(400).json({ error: 'Class name and numeric level are required.' });
    }

    const newClass = await prisma.classGrade.create({
      data: {
        name,
        numericLevel: Number(numericLevel),
        description,
      },
    });

    return res.status(201).json(newClass);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, classGradeId, classTeacherId, roomNumber, capacity } = req.body;
    if (!name || !classGradeId) {
      return res.status(400).json({ error: 'Section name and Class Grade ID are required.' });
    }

    const section = await prisma.section.create({
      data: {
        name,
        classGradeId: Number(classGradeId),
        classTeacherId: classTeacherId ? Number(classTeacherId) : null,
        roomNumber: roomNumber || null,
        capacity: capacity ? Number(capacity) : 40,
      },
    });

    return res.status(201).json(section);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Subjects
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { classGradeId } = req.query;
    const where: any = {};
    if (classGradeId) where.classGradeId = Number(classGradeId);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        classGrade: true,
        allocations: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(subjects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, classGradeId, type } = req.body;
    if (!name || !code || !classGradeId) {
      return res.status(400).json({ error: 'Subject name, code, and class are required.' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classGradeId: Number(classGradeId),
        type: type || 'COMPULSORY',
      },
    });

    return res.status(201).json(subject);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const assignTeacherToSubject = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, subjectId, teacherId } = req.body;

    const allocation = await prisma.classSubjectTeacher.upsert({
      where: {
        subjectId_teacherId_sectionId: {
          subjectId: Number(subjectId),
          teacherId: Number(teacherId),
          sectionId: sectionId ? Number(sectionId) : 0,
        },
      },
      create: {
        classGradeId: Number(classGradeId),
        sectionId: sectionId ? Number(sectionId) : null,
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
      },
      update: {
        classGradeId: Number(classGradeId),
        sectionId: sectionId ? Number(sectionId) : null,
      },
    });

    return res.json(allocation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Class Promotion Wizard
export const promoteStudents = async (req: Request, res: Response) => {
  try {
    const { studentIds, targetClassGradeId, targetSectionId, targetAcademicYearId } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0 || !targetClassGradeId || !targetAcademicYearId) {
      return res.status(400).json({ error: 'Please select students, target class, and target academic year.' });
    }

    await prisma.student.updateMany({
      where: {
        id: { in: studentIds.map(Number) },
      },
      data: {
        classGradeId: Number(targetClassGradeId),
        sectionId: targetSectionId ? Number(targetSectionId) : null,
        academicYearId: Number(targetAcademicYearId),
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CLASS_PROMOTION',
      module: 'Academics',
      details: `Promoted ${studentIds.length} students to Class ID ${targetClassGradeId} for Academic Year ID ${targetAcademicYearId}`,
    });

    return res.json({
      message: `Successfully promoted ${studentIds.length} students to the next class level.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
