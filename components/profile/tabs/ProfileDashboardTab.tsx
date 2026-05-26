"use client";

import { DashboardCards } from "@/components/profile/DashboardCards";
import { ProfileDashboardSkeleton } from "@/components/profile/ProfileSkeletons";
import type { ProfileDashboardData } from "@/lib/profile/dashboardData";
import { useProfileDashboard } from "@/lib/queries/profile-dashboard";

export function ProfileDashboardTab({
  initialData,
}: {
  initialData?: ProfileDashboardData;
}) {
  const { data, isLoading, isError } = useProfileDashboard(initialData);

  if (isLoading) {
    return <ProfileDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-secondary-foreground">
        Could not load dashboard. Try refreshing the page.
      </p>
    );
  }

  return (
    <DashboardCards
      totalViews={data.totalViews}
      subscriberCount={data.subscriberCount}
      videoCount={data.videoCount}
      latestVideo={data.latestVideo}
      recentComments={data.recentComments.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }))}
    />
  );
}
