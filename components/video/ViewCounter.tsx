"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function ViewCounter({ videoId }: { videoId: string }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    void fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incrementViews: true }),
    }).catch(() => {});

    if (status === "authenticated" && session?.user?.id) {
      void fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      }).catch(() => {});
    }
  }, [videoId, status, session?.user?.id]);

  return null;
}
