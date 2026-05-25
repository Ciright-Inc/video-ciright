import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { isMissingWatchHistoryTableError } from "@/lib/prisma-errors";
import type { VideoListItem } from "@/lib/data/videos";

export const WATCH_HISTORY_PAGE_SIZE = 50;

export type WatchHistoryEntry = {
  watchedAt: string;
  video: VideoListItem;
};

export type WatchHistoryPage = {
  items: WatchHistoryEntry[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

type WatchHistoryWithVideo = Prisma.WatchHistoryGetPayload<{
  include: { video: { select: typeof videoListSelect } };
}>;

export async function getWatchHistoryPage(
  userId: string,
  page: number
): Promise<WatchHistoryPage> {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * WATCH_HISTORY_PAGE_SIZE;

  let items: WatchHistoryWithVideo[] = [];
  let total = 0;

  try {
    [items, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId },
        orderBy: { watchedAt: "desc" },
        skip,
        take: WATCH_HISTORY_PAGE_SIZE,
        include: {
          video: { select: videoListSelect },
        },
      }),
      prisma.watchHistory.count({ where: { userId } }),
    ]);
  } catch (error) {
    if (!isMissingWatchHistoryTableError(error)) {
      throw error;
    }
  }

  const mapped = items.map((h) => ({
    watchedAt: h.watchedAt.toISOString(),
    video: h.video,
  }));

  return {
    items: mapped,
    page: safePage,
    pageSize: WATCH_HISTORY_PAGE_SIZE,
    total,
    hasMore: skip + mapped.length < total,
  };
}
