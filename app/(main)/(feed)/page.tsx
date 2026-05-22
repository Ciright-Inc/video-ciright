import { getPublicVideosPage } from "@/lib/data/videos";
import { VirtualVideoGrid } from "@/components/video/VirtualVideoGrid";

export default async function HomePage() {
  const initialPage = await getPublicVideosPage();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Recommended</h1>
      <VirtualVideoGrid feed={{ type: "public" }} initialPage={initialPage} />
    </div>
  );
}
