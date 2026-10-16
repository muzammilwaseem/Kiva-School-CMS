import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { InquiryStatus, StudentStatus } from '@prisma/client';
import { logAudit } from '../middleware/audit';

async function generateInquiryNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.admissionInquiry.count();
  const nextNum = (count + 1).toString().padStart(3, '0');
  return `INQ-${currentYear}-${nextNum}`;
}

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const { status, classGradeId, search } = req.query;
    const where: any = {};
    if (status) where.status = status as InquiryStatus;
    if (classGradeId) where.applyingForClassId = Number(classGradeId);
    if (search) {
      where.OR = [
        { studentName: { contains: String(search) } },
        { parentName: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { inquiryNo: { contains: String(search) } },
      ];
    }

    const inquiries = await prisma.admissionInquiry.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    const classes = await prisma.classGrade.findMany();
    const classMap = new Map();
    classes.forEach((c) => classMap.set(c.id, c.name));

    const enriched = inquiries.map((inq) => ({
      ...inq,
      applyingClassName: classMap.get(inq.applyingForClassId) || 'Grade',
    }));

    return res.json(enriched);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const {
      studentName,
      gender,
      dateOfBirth,
      applyingForClassId,
      parentName,
      phone,
      email,
      address,
      previousSchool,
      notes,
    } = req.body;

    if (!studentName || !parentName || !phone || !applyingForClassId) {
      return res.status(400).json({ error: 'Student name, parent name, phone, and class are required.' });
    }

    const inquiryNo = await generateInquiryNumber();

    const inq = await prisma.admissionInquiry.create({
      data: {
        inquiryNo,
        studentName,
        gender: gender || 'Male',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        applyingForClassId: Number(applyingForClassId),
        parentName,
        phone,
        email: email || null,
        address: address || null,
        previousSchool: previousSchool || null,
        status: InquiryStatus.NEW,
        notes: notes || null,
      },
    });

    return res.status(201).json(inq);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes, followUpDate } = req.body;

    const inq = await prisma.admissionInquiry.update({
      where: { id },
      data: {
        status: status as InquiryStatus,
        notes: notes !== undefined ? notes : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
    });

    return res.json(inq);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
