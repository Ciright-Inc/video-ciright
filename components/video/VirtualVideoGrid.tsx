"use client";

import { useCallback } from "react";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { VideoCard } from "./VideoCard";
import { VideoGridEmpty, type VideoGridEmptyProps } from "./VideoGridEmpty";
import { VirtualGrid } from "@/components/virtual/VirtualGrid";
import { VideoCardSkeleton } from "@/components/ui/skeleton";
import {
  flattenVideoFeedPages,
  useVideoFeedInfinite,
  type VideoFeedSource,
} from "@/lib/queries/video-feed";
import type { VideoFeedPage } from "@/lib/api/video-feed";

export interface VirtualVideoGridProps extends VideoGridEmptyProps {
  feed: VideoFeedSource;
  initialPage?: VideoFeedPage;
}

export function VirtualVideoGrid({
  feed,
  initialPage,
  title,
  description,
  action,
}: VirtualVideoGridProps) {
  const searchInactive =
    feed.type === "search" && feed.query.trim().length === 0;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useVideoFeedInfinite(feed, initialPage);

  const isLoading = isPending && isFetching;

  const items = flattenVideoFeedPages(data?.pages);

  const handleNearEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (searchInactive) {
    return null;
  }

  if (isError && items.length === 0) {
    return (
      <VideoGridEmpty
        title="Could not load videos"
        description="Check your connection and try again."
        action={{ label: "Retry", onClick: () => void refetch() }}
      />
    );
  }

  if (!isLoading && items.length === 0) {
    if (feed.type === "search") {
      return (
        <SearchEmptyState variant="no-results" query={feed.query.trim()} />
      );
    }
    return (
      <VideoGridEmpty
        title={title}
        description={description}
        action={action}
      />
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <VirtualGrid
        items={items}
        getItemKey={(video) => video.id}
        renderItem={(video) => <VideoCard video={video} />}
        onNearEnd={handleNearEnd}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
      />
      {isFetchingNextPage && (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
