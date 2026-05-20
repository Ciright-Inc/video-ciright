"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

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
    }).catch(() => {});
  }, [videoId, status, session?.user?.id]);

  return null;
}
