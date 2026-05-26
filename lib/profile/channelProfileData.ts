import { prisma } from "@/lib/prisma";
import { getChannelById } from "@/lib/data/channels";

export type ProfileChannelData = {
  channelId: string;
  channel: {
    name: string;
    handle: string;
    description: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
  };
  countryCode: string | null;
};

export async function getProfileChannelData(
  userId: string,
  channelId: string
): Promise<ProfileChannelData | null> {
  const channel = await getChannelById(channelId);
  if (!channel) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true },
  });

  return {
    channelId: channel.id,
    channel: {
      name: channel.name,
      handle: channel.handle,
      description: channel.description,
      avatarUrl: channel.avatarUrl,
      bannerUrl: channel.bannerUrl,
    },
    countryCode: user?.countryCode ?? null,
  };
}
