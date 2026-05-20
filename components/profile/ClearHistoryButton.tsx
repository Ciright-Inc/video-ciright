"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ClearHistoryButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clear() {
    if (!confirm("Clear all watch history?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error();
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
