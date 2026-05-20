import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChannelById, getChannelVideos, isSubscribed } from "@/lib/data/channels";
import { ChannelBanner } from "@/components/channel/ChannelBanner";
import { ChannelAvatar } from "@/components/channel/ChannelAvatar";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { VideoGrid } from "@/components/video/VideoGrid";

interface ChannelPageProps {
  params: Promise<{ channelId: string }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = await params;
  const session = await auth();

  const channel = await getChannelById(channelId);
  if (!channel) notFound();

  const videos = await getChannelVideos(channelId);
  const subscribed = session?.user?.id
    ? await isSubscribed(session.user.id, channelId)
    : false;

  const isOwner = session?.user?.channelId === channelId;

  return (
    <div className="mx-auto max-w-6xl">
      <ChannelBanner bannerUrl={channel.bannerUrl} name={channel.name} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 px-2">
        <div className="flex items-end gap-4">
          <ChannelAvatar src={channel.avatarUrl} name={channel.name} />
          <div className="pb-2">
            <h1 className="text-2xl font-bold text-ink">{channel.name}</h1>
            <p className="text-sm text-muted-foreground">@{channel.handle}</p>
            <p className="text-sm text-body">
              {channel._count.subscribers.toLocaleString()} subscribers ·{" "}
              {channel._count.videos} videos
            </p>
          </div>
        </div>
        {!isOwner && (
          <SubscribeButton channelId={channelId} initialSubscribed={subscribed} />
        )}
      </div>
      {channel.description && (
        <p className="mt-4 px-2 text-sm text-body">{channel.description}</p>
      )}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink">Videos</h2>
        <VideoGrid videos={videos} />
      </div>
    </div>
  );
}
