import { prisma } from "@/lib/prisma";
import { isMissingWatchHistoryTableError } from "@/lib/prisma-errors";

/** Upserts a watch-history row for the signed-in user (no-op if table missing). */
export async function recordWatchHistory(userId: string, videoId: string) {
  try {
    await prisma.watchHistory.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      create: { userId, videoId },
      update: { watchedAt: new Date() },
    });
  } catch (error) {
    if (isMissingWatchHistoryTableError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[watch-history] WatchHistory table missing — run: npm run db:migrate-watch-history"
        );
      }
      return;
    }
    throw error;
  }
}
