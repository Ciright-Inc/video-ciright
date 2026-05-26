"use client";

import { ChannelForm } from "@/components/profile/ChannelForm";
import { ProfileChannelSkeleton } from "@/components/profile/ProfileSkeletons";
import { UserCountryForm } from "@/components/profile/UserCountryForm";
import type { ProfileChannelData } from "@/lib/profile/channelProfileData";
import { useProfileChannel } from "@/lib/queries/profile-channel";

export function ProfileChannelTab({
  initialData,
}: {
  initialData?: ProfileChannelData;
}) {
  const { data, isLoading, isError } = useProfileChannel(initialData);

  if (isLoading) {
    return <ProfileChannelSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-secondary-foreground">
        Could not load channel settings. Try refreshing the page.
      </p>
    );
  }

  return (
    <div>
      <ChannelForm channelId={data.channelId} initial={data.channel} />
      <UserCountryForm initialCountryCode={data.countryCode} />
    </div>
  );
}
