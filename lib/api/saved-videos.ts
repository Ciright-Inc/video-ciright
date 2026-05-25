import type { SavedVideosPage } from "@/lib/profile/savedVideosPage";

export async function fetchSavedVideosPage(
  page: number
): Promise<SavedVideosPage> {
  const params = new URLSearchParams({ page: String(page) });
  const res = await fetch(`/api/saved?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch saved videos: ${res.status}`);
  }
  return res.json() as Promise<SavedVideosPage>;
}
