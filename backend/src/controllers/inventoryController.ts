import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        movements: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { id: 'desc' },
    });
    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { itemName, category, quantityInStock, minAlertQuantity, unitPrice, unit, location } = req.body;
    const count = await prisma.inventoryItem.count();
    const itemCode = `INV-${category.slice(0, 3).toUpperCase()}-${(count + 1).toString().padStart(3, '0')}`;

    const item = await prisma.inventoryItem.create({
      data: {
        itemCode,
        itemName,
        category,
        quantityInStock: Number(quantityInStock || 0),
        minAlertQuantity: Number(minAlertQuantity || 10),
        unitPrice: Number(unitPrice || 0),
        unit: unit || 'Pcs',
        location: location || null,
      },
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const recordStockMovement = async (req: Request, res: Response) => {
  try {
    const { inventoryItemId, movementType, quantity, referenceNo, remarks } = req.body;
    const qty = Number(quantity);
    const item = await prisma.inventoryItem.findUnique({ where: { id: Number(inventoryItemId) } });

    if (!item) return res.status(404).json({ error: 'Item not found.' });

    let newStock = item.quantityInStock;
    if (movementType === 'IN') {
      newStock += qty;
    } else if (movementType === 'OUT') {
      if (qty > item.quantityInStock) {
        return res.status(400).json({ error: 'Insufficient stock available.' });
      }
      newStock -= qty;
    } else {
      newStock = qty;
    }

    const movement = await prisma.$transaction(async (tx) => {
      const m = await tx.stockMovement.create({
        data: {
          inventoryItemId: item.id,
          movementType,
          quantity: qty,
          referenceNo: referenceNo || null,
          recordedBy: req.user?.username || 'Staff',
          remarks: remarks || null,
        },
      });

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { quantityInStock: newStock },
      });

      return m;
    });

    return res.json(movement);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
