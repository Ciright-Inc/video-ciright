"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfileDashboard } from "@/lib/api/profile-dashboard";
import type { ProfileDashboardData } from "@/lib/profile/dashboardData";
import { INITIAL_DATA_UPDATED_AT } from "@/lib/queries/initial-data-timestamp";
import { profileQueryOptions } from "@/lib/queries/profile-query-options";

export const profileDashboardKeys = {
  all: ["profile-dashboard"] as const,
};

export function useProfileDashboard(initialData?: ProfileDashboardData) {
  return useQuery({
    queryKey: profileDashboardKeys.all,
    queryFn: fetchProfileDashboard,
    ...profileQueryOptions,
    ...(initialData
      ? { initialData, initialDataUpdatedAt: INITIAL_DATA_UPDATED_AT }
      : {}),
    placeholderData: (previousData) => previousData,
  });
}
