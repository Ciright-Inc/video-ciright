import type { QueryClient } from "@tanstack/react-query";
import { profileChannelKeys } from "@/lib/queries/profile-channel";
import { profileDashboardKeys } from "@/lib/queries/profile-dashboard";
import { savedVideosKeys } from "@/lib/queries/saved-videos";
import { watchHistoryKeys } from "@/lib/queries/watch-history";

function profilePathname(href: string): string {
  return href.split("?")[0] ?? href;
}

function queryKeyForProfilePath(path: string): readonly unknown[] | null {
  if (path === "/profile") return profileDashboardKeys.all;
  if (path.startsWith("/profile/saved")) return savedVideosKeys.all;
  if (path.startsWith("/profile/history")) return watchHistoryKeys.all;
  if (path.startsWith("/profile/channel")) return profileChannelKeys.all;
  return null;
}

/** True when React Query already has data for a cached profile tab route. */
export function hasCachedProfileTabData(
  queryClient: QueryClient,
  href: string
): boolean {
  const key = queryKeyForProfilePath(profilePathname(href));
  if (!key) return false;
  return queryClient.getQueryData(key) !== undefined;
}

export function prefetchProfileTab(
  queryClient: QueryClient,
  href: string
): void {
  const path = profilePathname(href);
  if (hasCachedProfileTabData(queryClient, href)) return;

  if (path === "/profile") {
    void import("@/lib/api/profile-dashboard").then(({ fetchProfileDashboard }) =>
      queryClient.prefetchQuery({
        queryKey: profileDashboardKeys.all,
        queryFn: fetchProfileDashboard,
        staleTime: Infinity,
      })
    );
    return;
  }

  if (path.startsWith("/profile/channel")) {
    void import("@/lib/api/profile-channel").then(({ fetchProfileChannel }) =>
      queryClient.prefetchQuery({
        queryKey: profileChannelKeys.all,
        queryFn: fetchProfileChannel,
        staleTime: Infinity,
      })
    );
    return;
  }

  if (path.startsWith("/profile/history")) {
    void import("@/lib/api/watch-history").then(({ fetchWatchHistoryPage }) =>
      queryClient.prefetchInfiniteQuery({
        queryKey: watchHistoryKeys.all,
        queryFn: () => fetchWatchHistoryPage(1),
        initialPageParam: 1,
        staleTime: Infinity,
      })
    );
    return;
  }

  if (path.startsWith("/profile/saved")) {
    void import("@/lib/api/saved-videos").then(({ fetchSavedVideosPage }) =>
      queryClient.prefetchInfiniteQuery({
        queryKey: savedVideosKeys.all,
        queryFn: () => fetchSavedVideosPage(1),
        initialPageParam: 1,
        staleTime: Infinity,
      })
    );
  }
}
