import type { WatchHistoryPage } from "@/lib/profile/watchHistoryPage";

export async function fetchWatchHistoryPage(
  page: number
): Promise<WatchHistoryPage> {
  const params = new URLSearchParams({ page: String(page) });
  const res = await fetch(`/api/history?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch watch history: ${res.status}`);
  }
  return res.json() as Promise<WatchHistoryPage>;
}
