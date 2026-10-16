import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { logAudit } from '../middleware/audit';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter username/email and password.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
      include: {
        staff: true,
        student: {
          include: {
            classGrade: true,
            section: true,
          },
        },
        parent: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    classGrade: true,
                    section: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact school administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const secret = process.env.JWT_SECRET || 'school_cms_super_secret_jwt_key_2026_pakistan';
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        username: user.username,
      },
      secret,
      { expiresIn: '7d' }
    );

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      module: 'Auth',
      details: `User ${user.username} logged in as ${user.role}`,
      ipAddress: req.ip,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        staff: user.staff,
        student: user.student,
        parent: user.parent,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        staff: true,
        student: {
          include: {
            classGrade: true,
            section: true,
          },
        },
        parent: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    classGrade: true,
                    section: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const settings = await prisma.schoolSetting.findFirst();

    return res.json({ user, settings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDemoAccounts = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        staff: { select: { firstName: true, lastName: true, designation: true } },
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        parent: { select: { fatherName: true } },
      },
      orderBy: { id: 'asc' },
    });

    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
