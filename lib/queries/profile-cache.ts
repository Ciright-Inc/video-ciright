import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ProfileChannelData } from "@/lib/profile/channelProfileData";
import type { ChannelFormInitial } from "@/components/profile/ChannelForm";
import type { SavedVideoEntry, SavedVideosPage } from "@/lib/profile/savedVideosPage";
import type { WatchHistoryEntry, WatchHistoryPage } from "@/lib/profile/watchHistoryPage";
import { profileChannelKeys } from "@/lib/queries/profile-channel";
import { savedVideosKeys } from "@/lib/queries/saved-videos";
import { watchHistoryKeys } from "@/lib/queries/watch-history";

function emptySavedPage(): SavedVideosPage {
  return {
    items: [],
    page: 1,
    pageSize: 50,
    total: 0,
    hasMore: false,
  };
}

function emptyHistoryPage(): WatchHistoryPage {
  return {
    items: [],
    page: 1,
    pageSize: 50,
    total: 0,
    hasMore: false,
  };
}

export function patchSavedVideosCache(
  queryClient: QueryClient,
  action:
    | { type: "add"; entry: SavedVideoEntry }
    | { type: "remove"; videoId: string }
) {
  queryClient.setQueryData<InfiniteData<SavedVideosPage>>(
    savedVideosKeys.all,
    (old) => {
      if (!old?.pages.length) {
        if (action.type === "remove") return old;
        return {
          pages: [
            {
              ...emptySavedPage(),
              items: [action.entry],
              total: 1,
            },
          ],
          pageParams: [1],
        };
      }

      if (action.type === "remove") {
        let removed = 0;
        const pages = old.pages.map((page) => {
          const before = page.items.length;
          const items = page.items.filter(
            (item) => item.video.id !== action.videoId
          );
          removed += before - items.length;
          return { ...page, items };
        });
        const total = Math.max(0, (old.pages[0]?.total ?? 0) - removed);
        return {
          pages: pages.map((page, i) =>
            i === 0 ? { ...page, total } : page
          ),
          pageParams: old.pageParams,
        };
      }

      const { entry } = action;
      const [first, ...rest] = old.pages;
      const filteredFirst = first.items.filter(
        (item) => item.video.id !== entry.video.id
      );
      const wasPresent = filteredFirst.length < first.items.length;
      const totalDelta = wasPresent ? 0 : 1;
      const nextFirst: SavedVideosPage = {
        ...first,
        items: [entry, ...filteredFirst],
        total: first.total + totalDelta,
      };
      const dedupedRest = rest.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.video.id !== entry.video.id),
      }));

      return {
        pages: [nextFirst, ...dedupedRest],
        pageParams: old.pageParams,
      };
    }
  );
}

export function prependWatchHistoryCache(
  queryClient: QueryClient,
  entry: WatchHistoryEntry
) {
  queryClient.setQueryData<InfiniteData<WatchHistoryPage>>(
    watchHistoryKeys.all,
    (old) => {
      if (!old?.pages.length) {
        return {
          pages: [
            {
              ...emptyHistoryPage(),
              items: [entry],
              total: 1,
            },
          ],
          pageParams: [1],
        };
      }

      const [first, ...rest] = old.pages;
      const filteredFirst = first.items.filter(
        (item) => item.video.id !== entry.video.id
      );
      const wasPresent = filteredFirst.length < first.items.length;
      const totalDelta = wasPresent ? 0 : 1;
      const nextFirst: WatchHistoryPage = {
        ...first,
        items: [entry, ...filteredFirst],
        total: first.total + totalDelta,
      };
      const dedupedRest = rest.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.video.id !== entry.video.id),
      }));

      return {
        pages: [nextFirst, ...dedupedRest],
        pageParams: old.pageParams,
      };
    }
  );
}

export function clearWatchHistoryCache(queryClient: QueryClient) {
  queryClient.setQueryData<InfiniteData<WatchHistoryPage>>(watchHistoryKeys.all, {
    pages: [emptyHistoryPage()],
    pageParams: [1],
  });
}

export function patchProfileChannelCache(
  queryClient: QueryClient,
  patch: Partial<ChannelFormInitial> & { countryCode?: string | null }
) {
  queryClient.setQueryData<ProfileChannelData>(profileChannelKeys.all, (old) => {
    if (!old) return old;
    const { countryCode, ...channelPatch } = patch;
    return {
      ...old,
      ...(countryCode !== undefined ? { countryCode } : {}),
      channel: {
        ...old.channel,
        ...channelPatch,
      },
    };
  });
}
