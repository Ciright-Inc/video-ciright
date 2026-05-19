"use client";

import { useEffect } from "react";

export function ViewCounter({ videoId }: { videoId: string }) {
  useEffect(() => {
    fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incrementViews: true }),
    }).catch(() => {});
  }, [videoId]);

  return null;
}
