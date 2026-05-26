"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { prependWatchHistoryCache } from "@/lib/queries/profile-cache";
import type { WatchHistoryEntry } from "@/lib/profile/watchHistoryPage";

function hasCountedView(videoId: string): boolean {
  try {
    return sessionStorage.getItem(`viewed:${videoId}`) === "1";
  } catch {
    return false;
  }
}

function markViewCounted(videoId: string): void {
  try {
    sessionStorage.setItem(`viewed:${videoId}`, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function ViewCounter({ videoId }: { videoId: string }) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasCountedView(videoId)) return;

    markViewCounted(videoId);
    void fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incrementViews: true }),
    }).catch(() => {});
  }, [videoId]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    void fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          entry?: WatchHistoryEntry | null;
        };
        if (data.entry) {
          prependWatchHistoryCache(queryClient, data.entry);
        }
      })
      .catch(() => {});
  }, [videoId, status, session?.user?.id, queryClient]);

  return null;
}
