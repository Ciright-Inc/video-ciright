import { redirect } from "next/navigation";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileAnalyticsCharts } from "@/components/profile/ProfileAnalyticsCharts";
import { getChannelGeoByCountry } from "@/lib/analytics/getChannelGeoByCountry";

export default async function ProfileAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/analytics");
  }

  const channelId = session.user.channelId;

  const videos = await prisma.video.findMany({
    where: { channelId },
    select: { createdAt: true, views: true, title: true },
  });

  const end = new Date();
  const start = subDays(end, 28);
  const byDay = new Map<string, number>();
  for (const v of videos) {
    if (v.createdAt < start) continue;
    const day = format(v.createdAt, "yyyy-MM-dd");
    byDay.set(day, (byDay.get(day) ?? 0) + v.views);
  }

  const days = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
  const viewsByDay = days.map((day) => ({
    day,
    views: byDay.get(day) ?? 0,
  }));

  const topVideos = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((v) => ({
      title: v.title.length > 36 ? `${v.title.slice(0, 36)}…` : v.title,
      views: v.views,
    }));

  const geoByMetric = await getChannelGeoByCountry(channelId);

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-ink">Analytics</h2>
      <p className="mb-6 text-sm text-body">
        Views by upload day, top videos, and audience by country (from each
        viewer&apos;s profile country; anonymous viewers estimated from IP).
      </p>
      <ProfileAnalyticsCharts
        viewsByDay={viewsByDay}
        topVideos={topVideos}
        geoByMetric={geoByMetric}
      />
    </div>
  );
}
