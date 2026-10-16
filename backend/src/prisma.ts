import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Ensure Decimal serializes properly to number/string in JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
