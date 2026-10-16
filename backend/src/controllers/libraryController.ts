import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { author: { contains: String(search) } },
        { accessionNo: { contains: String(search) } },
        { isbn: { contains: String(search) } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        borrows: {
          where: { isReturned: false },
          include: {
            student: true,
            staff: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return res.json(books);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn, publisher, category, totalCopies, rackNumber } = req.body;
    const count = await prisma.book.count();
    const accessionNo = `LIB-${(count + 1).toString().padStart(4, '0')}`;
    const copies = totalCopies ? Number(totalCopies) : 1;

    const book = await prisma.book.create({
      data: {
        accessionNo,
        title,
        author,
        isbn: isbn || null,
        publisher: publisher || null,
        category: category || 'General',
        totalCopies: copies,
        availableCopies: copies,
        rackNumber: rackNumber || null,
      },
    });

    return res.status(201).json(book);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const issueBook = async (req: Request, res: Response) => {
  try {
    const { bookId, borrowerType, studentId, staffId, dueDate } = req.body;

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'No copies available for issue.' });
    }

    const targetDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    const borrow = await prisma.$transaction(async (tx) => {
      const b = await tx.bookBorrow.create({
        data: {
          bookId: book.id,
          borrowerType: borrowerType || 'STUDENT',
          studentId: studentId ? Number(studentId) : null,
          staffId: staffId ? Number(staffId) : null,
          dueDate: targetDueDate,
          isReturned: false,
        },
      });

      await tx.book.update({
        where: { id: book.id },
        data: { availableCopies: book.availableCopies - 1 },
      });

      return b;
    });

    return res.status(201).json(borrow);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const borrowId = Number(req.params.id);
    const { fineAmount } = req.body;

    const borrow = await prisma.bookBorrow.findUnique({
      where: { id: borrowId },
      include: { book: true },
    });

    if (!borrow) return res.status(404).json({ error: 'Borrow record not found.' });
    if (borrow.isReturned) return res.status(400).json({ error: 'Book is already returned.' });

    await prisma.$transaction(async (tx) => {
      await tx.bookBorrow.update({
        where: { id: borrowId },
        data: {
          isReturned: true,
          returnDate: new Date(),
          fineAmount: fineAmount ? Number(fineAmount) : 0,
        },
      });

      await tx.book.update({
        where: { id: borrow.bookId },
        data: { availableCopies: borrow.book.availableCopies + 1 },
      });
    });

    return res.json({ message: 'Book returned successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
