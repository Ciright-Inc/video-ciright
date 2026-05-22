import { Prisma } from "@prisma/client";

function isKnownPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!isKnownPrismaError(error) || error.code !== "P2021") {
    return false;
  }

  const needle = tableName.toLowerCase();
  const meta = error.meta as { modelName?: string; table?: string } | undefined;

  if (meta?.modelName?.toLowerCase() === needle) {
    return true;
  }

  if (meta?.table?.toLowerCase().includes(needle)) {
    return true;
  }

  return error.message.toLowerCase().includes(needle);
}

export function isMissingWatchHistoryTableError(error: unknown): boolean {
  return isMissingTableError(error, "watchhistory");
}

export function isMissingNotificationTableError(error: unknown): boolean {
  return isMissingTableError(error, "notification");
}

export function isMissingNotificationSchemaError(error: unknown): boolean {
  return (
    isMissingNotificationTableError(error) ||
    isMissingTableError(error, "notificationactor") ||
    isMissingTableError(error, "commentlike")
  );
}

const NOTIFICATIONS_SETUP_HINT =
  "[notifications] tables missing — run: npm run db:setup-notifications";

export function warnMissingNotificationSchema(): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(NOTIFICATIONS_SETUP_HINT);
  }
}
