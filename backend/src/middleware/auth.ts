import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../prisma';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  staffId?: number | null;
  studentId?: number | null;
  parentId?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'school_cms_super_secret_jwt_key_2026_pakistan';
    const decoded = jwt.verify(token, secret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        staff: { select: { id: true } },
        student: { select: { id: true } },
        parent: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User is inactive or not found.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      staffId: user.staff?.id || null,
      studentId: user.student?.id || null,
      parentId: user.parent?.id || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};
