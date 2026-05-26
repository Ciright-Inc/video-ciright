import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileAnalyticsCharts } from "@/components/profile/ProfileAnalyticsCharts";
import { getChannelAnalyticsData } from "@/lib/analytics/getChannelAnalyticsData";
import { getChannelGeoByCountry } from "@/lib/analytics/getChannelGeoByCountry";

export default async function ProfileAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/analytics");
  }

  const channelId = session.user.channelId;

  const [analytics, geoByMetric] = await Promise.all([
    getChannelAnalyticsData(channelId),
    getChannelGeoByCountry(channelId),
  ]);

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-ink">Analytics</h2>
      <p className="mb-6 text-sm text-secondary-foreground">
        Daily views and subscriber growth (last 28 days), top videos, engagement
        rates, and audience by country (profile country or IP estimate for
        anonymous viewers).
      </p>
      <ProfileAnalyticsCharts analytics={analytics} geoByMetric={geoByMetric} />
    </div>
  );
}
