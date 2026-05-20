import { Prisma } from "@prisma/client";

function isKnownPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isMissingWatchHistoryTableError(error: unknown): boolean {
  if (!isKnownPrismaError(error) || error.code !== "P2021") {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("watchhistory");
}
