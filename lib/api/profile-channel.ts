import type { ProfileChannelData } from "@/lib/profile/channelProfileData";

export async function fetchProfileChannel(): Promise<ProfileChannelData> {
  const res = await fetch("/api/profile/channel");
  if (!res.ok) {
    throw new Error(`Failed to fetch profile channel: ${res.status}`);
  }
  return res.json() as Promise<ProfileChannelData>;
}
