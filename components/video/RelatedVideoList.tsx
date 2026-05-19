import { RelatedVideoCard } from "./RelatedVideoCard";
import type { VideoListItem } from "@/lib/data/videos";

interface RelatedVideoListProps {
  videos: VideoListItem[];
}

export function RelatedVideoList({ videos }: RelatedVideoListProps) {
  if (videos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">No related videos yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {videos.map((video) => (
        <li key={video.id}>
          <RelatedVideoCard video={video} />
        </li>
      ))}
    </ul>
  );
}
