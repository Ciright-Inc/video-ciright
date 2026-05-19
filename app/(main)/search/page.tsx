import { searchVideos } from "@/lib/data/videos";
import { VideoGrid } from "@/components/video/VideoGrid";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const videos = query ? await searchVideos(query) : [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink">Search results</h1>
      {query ? (
        <p className="mb-6 text-sm text-muted">
          {videos.length} result{videos.length !== 1 ? "s" : ""} for &quot;{query}&quot;
        </p>
      ) : (
        <p className="mb-6 text-sm text-muted">Enter a search term in the top bar.</p>
      )}
      <VideoGrid videos={videos} />
    </div>
  );
}
