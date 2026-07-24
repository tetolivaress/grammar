import { PrismaClient } from "@prisma/client"

/** Single shared Prisma client for the whole API (including Better Auth). */
export const prisma = new PrismaClient()
