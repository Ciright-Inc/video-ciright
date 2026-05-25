"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchChannelVideosPage,
  fetchPublicVideosPage,
  fetchSearchVideosPage,
  fetchSubscriptionFeedPage,
  type VideoFeedPage,
} from "@/lib/api/video-feed";

export type VideoFeedSource =
  | { type: "public" }
  | { type: "channel"; channelId: string }
  | { type: "search"; query: string }
  | { type: "subscriptions"; channelId?: string };

export const videoFeedKeys = {
  public: ["videos", "public"] as const,
  channel: (channelId: string) => ["videos", "channel", channelId] as const,
  search: (q: string) => ["videos", "search", q] as const,
  subscriptions: (channelId?: string) =>
    ["videos", "subscriptions", channelId ?? "all"] as const,
};

function getQueryKey(feed: VideoFeedSource) {
  switch (feed.type) {
    case "public":
      return videoFeedKeys.public;
    case "channel":
      return videoFeedKeys.channel(feed.channelId);
    case "search":
      return videoFeedKeys.search(feed.query);
    case "subscriptions":
      return videoFeedKeys.subscriptions(feed.channelId);
  }
}

function fetchPage(
  feed: VideoFeedSource,
  cursor?: string
): Promise<VideoFeedPage> {
  switch (feed.type) {
    case "public":
      return fetchPublicVideosPage({ cursor });
    case "channel":
      return fetchChannelVideosPage({
        channelId: feed.channelId,
        cursor,
      });
    case "search":
      return fetchSearchVideosPage({ query: feed.query, cursor });
    case "subscriptions":
      return fetchSubscriptionFeedPage({
        channelId: feed.channelId,
        cursor,
      });
  }
}

export function useVideoFeedInfinite(
  feed: VideoFeedSource,
  initialPage?: VideoFeedPage
) {
  const enabled =
    feed.type !== "search" || feed.query.trim().length > 0;

  return useInfiniteQuery({
    queryKey: getQueryKey(feed),
    queryFn: ({ pageParam }) => fetchPage(feed, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    ...(initialPage
      ? {
          initialData: {
            pages: [initialPage],
            pageParams: [undefined],
          },
          initialDataUpdatedAt: Date.now(),
        }
      : {}),
    placeholderData: (previousData) => previousData,
  });
}

export function flattenVideoFeedPages(
  pages: VideoFeedPage[] | undefined
): VideoFeedPage["items"] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items);
}
