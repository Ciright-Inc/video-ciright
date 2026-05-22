import type { PaginatedResult } from "@/lib/data/pagination";
import type { VideoListItem } from "@/lib/data/videos";

export type VideoFeedPage = PaginatedResult<VideoListItem>;

async function fetchVideoFeedPage(url: string): Promise<VideoFeedPage> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch videos: ${res.status}`);
  }
  return res.json() as Promise<VideoFeedPage>;
}

export function fetchPublicVideosPage({
  cursor,
  limit = 24,
}: {
  cursor?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return fetchVideoFeedPage(`/api/videos?${params}`);
}

export function fetchChannelVideosPage({
  channelId,
  cursor,
  limit = 24,
}: {
  channelId: string;
  cursor?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({
    limit: String(limit),
    channelId,
  });
  if (cursor) params.set("cursor", cursor);
  return fetchVideoFeedPage(`/api/videos?${params}`);
}

export function fetchSearchVideosPage({
  query,
  cursor,
  limit = 24,
}: {
  query: string;
  cursor?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return fetchVideoFeedPage(`/api/videos/search?${params}`);
}

export function fetchSubscriptionFeedPage({
  channelId,
  cursor,
  limit = 24,
}: {
  channelId?: string;
  cursor?: string;
  limit?: number;
}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (channelId) params.set("channelId", channelId);
  if (cursor) params.set("cursor", cursor);
  return fetchVideoFeedPage(`/api/subscriptions/feed?${params}`);
}
