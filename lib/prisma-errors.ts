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

export function isForeignKeyConstraintError(error: unknown): boolean {
  return isKnownPrismaError(error) && error.code === "P2003";
}

export function isMissingWatchHistoryTableError(error: unknown): boolean {
  return isMissingTableError(error, "watchhistory");
}

export function isMissingSavedVideoTableError(error: unknown): boolean {
  return isMissingTableError(error, "savedvideo");
}

export function isMissingNotificationTableError(error: unknown): boolean {
  return isMissingTableError(error, "notification");
}

function isNotificationPermissionDeniedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("permission denied for table notification") ||
    message.includes("permission denied for table notificationactor") ||
    message.includes("permission denied for table commentlike")
  );
}

export function isMissingNotificationSchemaError(error: unknown): boolean {
  return (
    isMissingNotificationTableError(error) ||
    isMissingTableError(error, "notificationactor") ||
    isMissingTableError(error, "commentlike") ||
    isNotificationPermissionDeniedError(error)
  );
}

export function isMissingChannelGeoEventTableError(error: unknown): boolean {
  return isMissingTableError(error, "channelgeoevent");
}

const NOTIFICATIONS_SETUP_HINT =
  "[notifications] schema or grants missing — run: npm run db:setup-notifications";

export function warnMissingNotificationSchema(): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(NOTIFICATIONS_SETUP_HINT);
  }
}
