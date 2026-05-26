import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { isMissingWatchHistoryTableError } from "@/lib/prisma-errors";
import type { WatchHistoryEntry } from "@/lib/profile/watchHistoryPage";

export async function getWatchHistoryEntryForVideo(
  userId: string,
  videoId: string
): Promise<WatchHistoryEntry | null> {
  try {
    const row = await prisma.watchHistory.findUnique({
      where: { userId_videoId: { userId, videoId } },
      include: { video: { select: videoListSelect } },
    });
    if (!row) return null;
    return {
      watchedAt: row.watchedAt.toISOString(),
      video: row.video,
    };
  } catch (error) {
    if (isMissingWatchHistoryTableError(error)) return null;
    throw error;
  }
}
