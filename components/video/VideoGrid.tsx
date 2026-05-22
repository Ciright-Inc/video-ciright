import { VideoCard } from "./VideoCard";
import { VideoGridEmpty, type VideoGridEmptyProps } from "./VideoGridEmpty";
import type { VideoListItem } from "@/lib/data/videos";

interface VideoGridProps extends VideoGridEmptyProps {
  videos: VideoListItem[];
}

export function VideoGrid({
  videos,
  title,
  description,
  action,
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <VideoGridEmpty
        title={title}
        description={description}
        action={action}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
