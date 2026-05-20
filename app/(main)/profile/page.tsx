import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCards } from "@/components/profile/DashboardCards";

export default async function ProfileDashboardPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile");
  }

  const channelId = session.user.channelId;

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

  return (
    <DashboardCards
      totalViews={agg._sum.views ?? 0}
      subscriberCount={subscriberCount}
      videoCount={agg._count.id}
      latestVideo={latestVideo}
      recentComments={recentComments}
    />
  );
}
