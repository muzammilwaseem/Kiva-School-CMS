import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getTransportData = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.transportVehicle.findMany({
      include: {
        routes: {
          include: {
            students: {
              include: {
                student: {
                  include: { classGrade: true, section: true },
                },
              },
            },
          },
        },
      },
    });

    const routes = await prisma.transportRoute.findMany({
      include: {
        vehicle: true,
        _count: { select: { students: true } },
      },
    });

    return res.json({ vehicles, routes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleNumber, vehicleModel, capacity, driverName, driverPhone, driverLicense } = req.body;
    const vehicle = await prisma.transportVehicle.create({
      data: {
        vehicleNumber,
        vehicleModel,
        capacity: Number(capacity || 30),
        driverName,
        driverPhone,
        driverLicense: driverLicense || null,
      },
    });
    return res.status(201).json(vehicle);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { routeName, startPoint, endPoint, vehicleId, monthlyFee } = req.body;
    const route = await prisma.transportRoute.create({
      data: {
        routeName,
        startPoint,
        endPoint,
        vehicleId: Number(vehicleId),
        monthlyFee: Number(monthlyFee || 3500),
      },
    });
    return res.status(201).json(route);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const assignStudentTransport = async (req: Request, res: Response) => {
  try {
    const { studentId, routeId, pickupPoint } = req.body;
    const allocation = await prisma.studentTransport.upsert({
      where: { studentId: Number(studentId) },
      create: {
        studentId: Number(studentId),
        routeId: Number(routeId),
        pickupPoint: pickupPoint || 'Default Stop',
      },
      update: {
        routeId: Number(routeId),
        pickupPoint: pickupPoint || 'Default Stop',
      },
    });
    return res.json(allocation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
