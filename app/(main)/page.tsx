import { getPublicVideos } from "@/lib/data/videos";
import { VideoGrid } from "@/components/video/VideoGrid";

export default async function HomePage() {
  const videos = await getPublicVideos();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Recommended</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
