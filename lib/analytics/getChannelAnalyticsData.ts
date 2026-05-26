import { ChannelGeoMetric } from "@prisma/client";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { isMissingChannelGeoEventTableError } from "@/lib/prisma-errors";

export type DailyCount = { day: string; count: number };

export type TopVideoByViews = { title: string; views: number };

export type TopVideoEngagement = {
  title: string;
  views: number;
  likes: number;
  engagementRate: number;
};

type DailyRow = { day: Date; count: bigint };

const ANALYTICS_DAYS = 28;

function truncateTitle(title: string, max = 36): string {
  return title.length > max ? `${title.slice(0, max)}…` : title;
}

function fillDailySeries(
  start: Date,
  end: Date,
  countsByDay: Map<string, number>
): DailyCount[] {
  const days = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
  return days.map((day) => ({
    day,
    count: countsByDay.get(day) ?? 0,
  }));
}

function rowsToDayMap(rows: DailyRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(format(row.day, "yyyy-MM-dd"), Number(row.count));
  }
  return map;
}

async function getDailyGeoMetricCounts(
  channelId: string,
  metric: ChannelGeoMetric,
  start: Date
): Promise<Map<string, number>> {
  try {
    const rows = await prisma.$queryRaw<DailyRow[]>`
      SELECT DATE("createdAt") AS day, COUNT(*)::bigint AS count
      FROM "ChannelGeoEvent"
      WHERE "channelId" = ${channelId}
        AND metric = ${metric}::"ChannelGeoMetric"
        AND "createdAt" >= ${start}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `;
    return rowsToDayMap(rows);
  } catch (error) {
    if (isMissingChannelGeoEventTableError(error)) {
      return new Map();
    }
    throw error;
  }
}

async function getDailyNewSubscribers(
  channelId: string,
  start: Date
): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<DailyRow[]>`
    SELECT DATE("createdAt") AS day, COUNT(*)::bigint AS count
    FROM "Subscription"
    WHERE "channelId" = ${channelId}
      AND "createdAt" >= ${start}
    GROUP BY DATE("createdAt")
    ORDER BY day ASC
  `;
  return rowsToDayMap(rows);
}

async function getTopVideosEngagement(channelId: string): Promise<TopVideoEngagement[]> {
  const videos = await prisma.video.findMany({
    where: { channelId, views: { gt: 0 } },
    select: { id: true, title: true, views: true },
  });

  if (videos.length === 0) return [];

  const videoIds = videos.map((v) => v.id);
  const likeGroups = await prisma.like.groupBy({
    by: ["videoId"],
    where: { videoId: { in: videoIds }, value: 1 },
    _count: { _all: true },
  });

  const likesByVideo = new Map(
    likeGroups.map((g) => [g.videoId, g._count._all])
  );

  return videos
    .map((v) => {
      const likes = likesByVideo.get(v.id) ?? 0;
      const engagementRate = Math.round((likes / v.views) * 1000) / 10;
      return {
        title: truncateTitle(v.title),
        views: v.views,
        likes,
        engagementRate,
      };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);
}

export type SubscriberSummary = {
  total: number;
  newInPeriod: number;
};

export type ChannelAnalyticsData = {
  viewsByDay: DailyCount[];
  newSubscribersByDay: DailyCount[];
  subscriberSummary: SubscriberSummary;
  topVideosByViews: TopVideoByViews[];
  topVideosByEngagement: TopVideoEngagement[];
};

export async function getChannelAnalyticsData(
  channelId: string,
  days = ANALYTICS_DAYS
): Promise<ChannelAnalyticsData> {
  const end = new Date();
  const start = subDays(end, days);

  const [viewsByDayMap, subsByDayMap, videos, subscriberTotal, topVideosByEngagement] =
    await Promise.all([
      getDailyGeoMetricCounts(channelId, ChannelGeoMetric.VIEW, start),
      getDailyNewSubscribers(channelId, start),
      prisma.video.findMany({
        where: { channelId },
        select: { title: true, views: true },
        orderBy: { views: "desc" },
        take: 5,
      }),
      prisma.subscription.count({ where: { channelId } }),
      getTopVideosEngagement(channelId),
    ]);

  const dailyViews = fillDailySeries(start, end, viewsByDayMap);
  const newSubscribersByDay = fillDailySeries(start, end, subsByDayMap);
  const newInPeriod = newSubscribersByDay.reduce((sum, d) => sum + d.count, 0);

  return {
    viewsByDay: dailyViews,
    newSubscribersByDay,
    subscriberSummary: { total: subscriberTotal, newInPeriod },
    topVideosByViews: videos.map((v) => ({
      title: truncateTitle(v.title),
      views: v.views,
    })),
    topVideosByEngagement,
  };
}
