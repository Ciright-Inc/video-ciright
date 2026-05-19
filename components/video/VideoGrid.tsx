import { VideoCard } from "./VideoCard";
import type { VideoListItem } from "@/lib/data/videos";

interface VideoGridProps {
  videos: VideoListItem[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <p className="py-16 text-center text-body">
        No videos found. Try uploading one!
      </p>
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
