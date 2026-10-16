import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { PriorityLevel, TargetAudience } from '@prisma/client';

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: { classGrade: true },
      orderBy: { publishedAt: 'desc' },
    });
    return res.json(announcements);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, targetAudience, classGradeId, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const ann = await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience: (targetAudience as TargetAudience) || TargetAudience.ALL,
        classGradeId: classGradeId ? Number(classGradeId) : null,
        priority: (priority as PriorityLevel) || PriorityLevel.NORMAL,
        createdBy: req.user?.username || 'Admin',
      },
    });

    return res.status(201).json(ann);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
