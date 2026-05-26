"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearWatchHistoryCache } from "@/lib/queries/profile-cache";

export function ClearHistoryButton() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function clear() {
    if (!confirm("Clear all watch history?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error();
      clearWatchHistoryCache(queryClient);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      disabled={loading}
      onClick={() => void clear()}
    >
      Clear all history
    </Button>
  );
}
