import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { Role } from '@prisma/client';
import { logAudit } from '../middleware/audit';

export const getSchoolSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.schoolSetting.findFirst();
    if (!settings) {
      settings = await prisma.schoolSetting.create({
        data: {},
      });
    }
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateSchoolSettings = async (req: Request, res: Response) => {
  try {
    const {
      schoolName,
      campusName,
      registrationNumber,
      address,
      phone,
      email,
      website,
      principalName,
      currency,
      currencySymbol,
      timezone,
    } = req.body;

    let settings = await prisma.schoolSetting.findFirst();
    if (!settings) {
      settings = await prisma.schoolSetting.create({ data: {} });
    }

    const updated = await prisma.schoolSetting.update({
      where: { id: settings.id },
      data: {
        schoolName,
        campusName,
        registrationNumber,
        address,
        phone,
        email,
        website,
        principalName,
        currency: currency || 'PKR',
        currencySymbol: currencySymbol || '₨',
        timezone: timezone || 'Asia/Karachi',
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_SETTINGS',
      module: 'Settings',
      details: 'Updated school general configurations and branding',
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Users Management
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        staff: { select: { firstName: true, lastName: true, designation: true } },
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        parent: { select: { fatherName: true } },
      },
      orderBy: { id: 'desc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Username, email, password, and role are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: role as Role,
        isActive: true,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_USER',
      module: 'Users',
      details: `Created new login account: ${username} (${role})`,
    });

    return res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return res.json({ message: `User status changed to ${updated.isActive ? 'Active' : 'Suspended'}.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, role: true },
        },
      },
    });
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
