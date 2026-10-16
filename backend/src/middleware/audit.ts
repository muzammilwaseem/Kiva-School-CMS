import { prisma } from '../prisma';

export const logAudit = async (params: {
  userId?: number | null;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        module: params.module,
        details: params.details || '',
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};
