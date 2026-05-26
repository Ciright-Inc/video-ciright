"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfileChannel } from "@/lib/api/profile-channel";
import type { ProfileChannelData } from "@/lib/profile/channelProfileData";
import { INITIAL_DATA_UPDATED_AT } from "@/lib/queries/initial-data-timestamp";
import { profileQueryOptions } from "@/lib/queries/profile-query-options";

export const profileChannelKeys = {
  all: ["profile-channel"] as const,
};

export function useProfileChannel(initialData?: ProfileChannelData) {
  return useQuery({
    queryKey: profileChannelKeys.all,
    queryFn: fetchProfileChannel,
    ...profileQueryOptions,
    ...(initialData
      ? { initialData, initialDataUpdatedAt: INITIAL_DATA_UPDATED_AT }
      : {}),
    placeholderData: (previousData) => previousData,
  });
}
