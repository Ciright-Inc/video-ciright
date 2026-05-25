"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { watchHistoryKeys } from "@/lib/queries/watch-history";

export function ClearHistoryButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function clear() {
    if (!confirm("Clear all watch history?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error();
      queryClient.removeQueries({ queryKey: watchHistoryKeys.all });
      router.refresh();
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
