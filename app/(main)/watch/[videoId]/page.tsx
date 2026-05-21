import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getVideoById, getRelatedVideos } from "@/lib/data/videos";
import { getCommentsByVideoId } from "@/lib/data/comments";
import { getVideoLikeStats, getUserLikeValue } from "@/lib/data/likes";
import { isSubscribed } from "@/lib/data/channels";
import { WatchPlayerSection } from "@/components/video/WatchPlayerSection";
import { VideoInfo } from "@/components/video/VideoInfo";
import { RelatedVideoList } from "@/components/video/RelatedVideoList";
import { CommentsSection } from "@/components/comment/CommentsSection";
import { ViewCounter } from "@/components/video/ViewCounter";
import { recordWatchHistory } from "@/lib/profile/recordWatchHistory";

interface WatchPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const session = await auth();

  const video = await getVideoById(videoId);
  if (!video) notFound();

  const [comments, likeStats, related] = await Promise.all([
    getCommentsByVideoId(videoId),
    getVideoLikeStats(videoId),
    getRelatedVideos(videoId, video.channelId),
  ]);

  const userLikeValue = session?.user?.id
    ? await getUserLikeValue(session.user.id, videoId)
    : 0;

  const subscribed = session?.user?.id
    ? await isSubscribed(session.user.id, video.channelId)
    : false;

  const isOwner = session?.user?.channelId === video.channelId;

  if (session?.user?.id) {
    await recordWatchHistory(session.user.id, videoId);
  }

  return (
    <div className="mx-auto max-w-[1754px]">
      <ViewCounter videoId={videoId} />
      <div className="flex flex-col gap-4 xl:flex-row xl:gap-4">
        <div className="min-w-0 flex-1 xl:max-w-[calc(100%-424px)]">
          <WatchPlayerSection
            videoId={video.id}
            initialStatus={video.status}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            isOwner={isOwner}
          />
          <VideoInfo
            videoId={video.id}
            title={video.title}
            description={video.description}
            views={video.views}
            createdAt={video.createdAt}
            channel={video.channel}
            likeCount={likeStats.likeCount}
            dislikeCount={likeStats.dislikeCount}
            userLikeValue={userLikeValue}
            isSubscribed={subscribed}
            isOwner={isOwner}
          />
          <CommentsSection videoId={videoId} comments={comments} />
        </div>

        <aside className="w-full shrink-0 xl:w-[402px]">
          <RelatedVideoList videos={related} />
        </aside>
      </div>
    </div>
  );
}
