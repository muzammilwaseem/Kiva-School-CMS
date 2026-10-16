import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { Role, StaffStatus } from '@prisma/client';
import { logAudit } from '../middleware/audit';

async function generateStaffId(): Promise<string> {
  const count = await prisma.staff.count();
  const nextNum = (count + 1).toString().padStart(3, '0');
  let candidate = `STF-${nextNum}`;

  let existing = await prisma.staff.findUnique({ where: { staffId: candidate } });
  let counter = count + 1;
  while (existing) {
    counter++;
    candidate = `STF-${counter.toString().padStart(3, '0')}`;
    existing = await prisma.staff.findUnique({ where: { staffId: candidate } });
  }
  return candidate;
}

export const getStaffList = async (req: Request, res: Response) => {
  try {
    const { department, status, designation, search } = req.query;

    const where: any = {};
    if (department) where.department = String(department);
    if (status) where.employmentStatus = status as StaffStatus;
    if (designation) where.designation = String(designation);

    if (search) {
      where.OR = [
        { firstName: { contains: String(search) } },
        { lastName: { contains: String(search) } },
        { staffId: { contains: String(search) } },
        { email: { contains: String(search) } },
        { cnic: { contains: String(search) } },
      ];
    }

    const isAuthorizedForSalary =
      req.user &&
      ([Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT] as Role[]).includes(req.user.role);

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        classesHeaded: {
          include: { classGrade: true },
        },
        subjectTeachings: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Protect salary information if not authorized
    const sanitized = staffList.map((s) => {
      if (!isAuthorizedForSalary) {
        const { basicSalary, ...rest } = s;
        return rest;
      }
      return s;
    });

    return res.json(sanitized);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        classesHeaded: {
          include: { classGrade: true },
        },
        subjectTeachings: {
          include: {
            subject: {
              include: { classGrade: true },
            },
          },
        },
        timetables: {
          include: {
            period: true,
            subject: true,
            classGrade: true,
            section: true,
          },
        },
        attendances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        leaveRequests: {
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const isAuthorizedForSalary =
      req.user &&
      ([Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT] as Role[]).includes(req.user.role);

    if (!isAuthorizedForSalary) {
      const { basicSalary, ...rest } = staff;
      return res.json(rest);
    }

    return res.json(staff);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      cnic,
      phone,
      email,
      address,
      qualification,
      designation,
      department,
      joiningDate,
      basicSalary,
      staffId,
    } = req.body;

    if (!firstName || !lastName || !phone || !email || !designation) {
      return res.status(400).json({ error: 'Missing required staff information.' });
    }

    const finalStaffId = staffId || (await generateStaffId());

    const staff = await prisma.staff.create({
      data: {
        staffId: finalStaffId,
        firstName,
        lastName,
        gender: gender || 'Male',
        cnic: cnic || null,
        phone,
        email,
        address: address || null,
        qualification: qualification || null,
        designation,
        department: department || 'Academic',
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        basicSalary: basicSalary ? Number(basicSalary) : 0,
        employmentStatus: StaffStatus.ACTIVE,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_STAFF',
      module: 'Staff',
      details: `Added new staff member ${firstName} ${lastName} (${staff.staffId})`,
    });

    return res.status(201).json(staff);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      firstName,
      lastName,
      gender,
      cnic,
      phone,
      email,
      address,
      qualification,
      designation,
      department,
      basicSalary,
      employmentStatus,
    } = req.body;

    const data: any = {
      firstName,
      lastName,
      gender,
      cnic,
      phone,
      email,
      address,
      qualification,
      designation,
      department,
      employmentStatus: employmentStatus as StaffStatus,
    };

    if (basicSalary !== undefined) {
      data.basicSalary = Number(basicSalary);
    }

    const updated = await prisma.staff.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_STAFF',
      module: 'Staff',
      details: `Updated staff ${updated.firstName} ${updated.lastName} (${updated.staffId})`,
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const staff = await prisma.staff.update({
      where: { id },
      data: { employmentStatus: StaffStatus.RESIGNED },
    });

    return res.json({ message: 'Staff status set to resigned.', staff });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
