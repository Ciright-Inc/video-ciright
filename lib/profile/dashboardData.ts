import { prisma } from "@/lib/prisma";

export type ProfileDashboardData = {
  totalViews: number;
  subscriberCount: number;
  videoCount: number;
  latestVideo: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
  } | null;
  recentComments: {
    id: string;
    body: string;
    createdAt: string;
    author: { name: string | null; image: string | null };
    video: { id: string; title: string };
  }[];
};

export async function getProfileDashboardData(
  channelId: string
): Promise<ProfileDashboardData> {
  const [agg, latestVideo, recentComments, subscriberCount] = await Promise.all([
    prisma.video.aggregate({
      where: { channelId },
      _sum: { views: true },
      _count: { id: true },
    }),
    prisma.video.findFirst({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, thumbnailUrl: true, views: true },
    }),
    prisma.comment.findMany({
      where: { video: { channelId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
        video: { select: { id: true, title: true } },
      },
    }),
    prisma.subscription.count({ where: { channelId } }),
  ]);

  return {
    totalViews: agg._sum.views ?? 0,
    subscriberCount,
    videoCount: agg._count.id,
    latestVideo,
    recentComments: recentComments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
