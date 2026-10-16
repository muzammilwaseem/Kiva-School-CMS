import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // SUPER_ADMIN has full permissions across all modules
    if (req.user.role === Role.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
      });
    }

    next();
  };
};
