import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { StudentStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import { logAudit } from '../middleware/audit';

// Helper to generate next unique admission number
async function generateAdmissionNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.student.count();
  const nextNum = (count + 1).toString().padStart(3, '0');
  let candidate = `ADM-${currentYear}-${nextNum}`;

  let existing = await prisma.student.findUnique({ where: { admissionNo: candidate } });
  let counter = count + 1;
  while (existing) {
    counter++;
    candidate = `ADM-${currentYear}-${counter.toString().padStart(3, '0')}`;
    existing = await prisma.student.findUnique({ where: { admissionNo: candidate } });
  }
  return candidate;
}

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { classGradeId, sectionId, status, search } = req.query;

    const where: any = {};

    if (classGradeId) where.classGradeId = Number(classGradeId);
    if (sectionId) where.sectionId = Number(sectionId);
    if (status) where.status = status as StudentStatus;

    if (search) {
      where.OR = [
        { firstName: { contains: String(search) } },
        { lastName: { contains: String(search) } },
        { admissionNo: { contains: String(search) } },
        { rollNo: { contains: String(search) } },
        { bFormNo: { contains: String(search) } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        classGrade: true,
        section: true,
        academicYear: true,
        parentMappings: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return res.json(students);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classGrade: true,
        section: true,
        academicYear: true,
        parentMappings: {
          include: {
            parent: true,
          },
        },
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
          include: {
            exam: true,
            schedule: {
              include: {
                subject: true,
              },
            },
          },
        },
        bookBorrows: {
          include: {
            book: true,
          },
        },
        transportAllocation: {
          include: {
            route: {
              include: {
                vehicle: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.json(student);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      bFormNo,
      bloodGroup,
      religion,
      address,
      phone,
      email,
      classGradeId,
      sectionId,
      academicYearId,
      rollNo,
      admissionNo,
      previousSchool,
      parentData,
    } = req.body;

    if (!firstName || !lastName || !classGradeId || !dateOfBirth) {
      return res.status(400).json({ error: 'Please provide all required student details.' });
    }

    const finalAdmissionNo = admissionNo || (await generateAdmissionNumber());

    // Check duplicate admissionNo or bFormNo
    const existing = await prisma.student.findUnique({ where: { admissionNo: finalAdmissionNo } });
    if (existing) {
      return res.status(400).json({ error: `Admission No '${finalAdmissionNo}' is already taken.` });
    }

    // Default academic year if not provided
    let yearId = academicYearId ? Number(academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      yearId = currentYear ? currentYear.id : 1;
    }

    const student = await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          admissionNo: finalAdmissionNo,
          rollNo: rollNo || null,
          firstName,
          lastName,
          gender: gender || 'Male',
          dateOfBirth: new Date(dateOfBirth),
          bFormNo: bFormNo || null,
          bloodGroup: bloodGroup || null,
          religion: religion || 'Islam',
          address: address || null,
          phone: phone || null,
          email: email || null,
          classGradeId: Number(classGradeId),
          sectionId: sectionId ? Number(sectionId) : null,
          academicYearId: yearId,
          previousSchool: previousSchool || null,
          status: StudentStatus.ACTIVE,
        },
      });

      // Handle Parent/Guardian creation or linking
      if (parentData && (parentData.fatherName || parentData.phone)) {
        const parent = await tx.parentGuardian.create({
          data: {
            fatherName: parentData.fatherName || 'Parent / Guardian',
            motherName: parentData.motherName || null,
            guardianName: parentData.guardianName || null,
            cnic: parentData.cnic || null,
            phone: parentData.phone || phone || '0300-0000000',
            email: parentData.email || email || null,
            occupation: parentData.occupation || null,
            address: parentData.address || address || null,
          },
        });

        await tx.parentStudentMapping.create({
          data: {
            parentId: parent.id,
            studentId: createdStudent.id,
            relationship: parentData.relationship || 'Father',
          },
        });
      }

      return createdStudent;
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_STUDENT',
      module: 'Students',
      details: `Enrolled student ${firstName} ${lastName} (Admission No: ${student.admissionNo})`,
    });

    return res.status(201).json(student);
  } catch (error: any) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      bFormNo,
      bloodGroup,
      religion,
      address,
      phone,
      email,
      classGradeId,
      sectionId,
      academicYearId,
      rollNo,
      status,
      previousSchool,
    } = req.body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        bFormNo,
        bloodGroup,
        religion,
        address,
        phone,
        email,
        classGradeId: classGradeId ? Number(classGradeId) : undefined,
        sectionId: sectionId ? Number(sectionId) : null,
        academicYearId: academicYearId ? Number(academicYearId) : undefined,
        rollNo,
        status: status as StudentStatus,
        previousSchool,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_STUDENT',
      module: 'Students',
      details: `Updated record for student ${updated.firstName} ${updated.lastName} (ID: ${id})`,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // Soft delete or status to INACTIVE
    const student = await prisma.student.update({
      where: { id },
      data: { status: StudentStatus.INACTIVE },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'ARCHIVE_STUDENT',
      module: 'Students',
      details: `Archived student ${student.firstName} ${student.lastName} (ID: ${id})`,
    });

    return res.json({ message: 'Student archived successfully.', student });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const exportStudentsExcel = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        classGrade: true,
        section: true,
        academicYear: true,
        parentMappings: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const rows = students.map((s) => ({
      'Admission No': s.admissionNo,
      'Roll No': s.rollNo || '-',
      'First Name': s.firstName,
      'Last Name': s.lastName,
      Gender: s.gender,
      'Date of Birth': s.dateOfBirth.toISOString().split('T')[0],
      'B-Form / CNIC': s.bFormNo || '-',
      'Blood Group': s.bloodGroup || '-',
      Class: s.classGrade?.name || '-',
      Section: s.section?.name || '-',
      Status: s.status,
      'Father Name': s.parentMappings[0]?.parent.fatherName || '-',
      'Contact Phone': s.phone || s.parentMappings[0]?.parent.phone || '-',
      Address: s.address || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students_list.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
