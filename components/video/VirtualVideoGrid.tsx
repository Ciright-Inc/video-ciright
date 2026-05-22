"use client";

import { useCallback } from "react";
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useVideoFeedInfinite(feed, initialPage);

  const items = flattenVideoFeedPages(data?.pages);

  const handleNearEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isPending && items.length === 0) {
    return (
      <VideoGridEmpty
        title={title}
        description={description}
        action={action}
      />
    );
  }

  if (isPending && items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
