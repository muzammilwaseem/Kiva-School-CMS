import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { LeaveStatus } from '@prisma/client';

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { status, applicantType } = req.query;
    const where: any = {};
    if (status) where.status = status as LeaveStatus;
    if (applicantType) where.applicantType = String(applicantType);

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: { classGrade: true, section: true },
        },
        staff: true,
      },
      orderBy: { id: 'desc' },
    });

    return res.json(leaves);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { applicantType, studentId, staffId, leaveType, startDate, endDate, reason } = req.body;

    const leave = await prisma.leaveRequest.create({
      data: {
        applicantType: applicantType || 'STUDENT',
        studentId: studentId ? Number(studentId) : null,
        staffId: staffId ? Number(staffId) : null,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: LeaveStatus.PENDING,
      },
    });

    return res.status(201).json(leave);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, reviewRemarks } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: status as LeaveStatus,
        reviewedBy: req.user?.username || 'Principal',
        reviewRemarks: reviewRemarks || null,
      },
    });

    return res.json(leave);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
