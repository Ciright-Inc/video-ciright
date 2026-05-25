"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { savedVideosKeys } from "@/lib/queries/saved-videos";
import { Bookmark } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  videoId: string;
  initialSaved: boolean;
}

export function SaveButton({ videoId, initialSaved }: SaveButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const prev = saved;
    setSaved(!saved);

    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaved(data.saved);
      void queryClient.invalidateQueries({ queryKey: savedVideosKeys.all });
      toast.success(data.saved ? "Saved to your library" : "Removed from saved");
    } catch {
      setSaved(prev);
      toast.error("Could not update save");
    } finally {
      setLoading(false);
    }
  }

  const label = saved ? "Saved" : "Save";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={loading || status === "loading"}
      aria-label={label}
      aria-pressed={saved}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-surface-soft px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 max-sm:size-10 max-sm:rounded-full max-sm:p-0",
        saved && "text-primary",
        loading && "opacity-70"
      )}
    >
      <Bookmark
        className="size-5 shrink-0"
        aria-hidden
        fill={saved ? "currentColor" : "none"}
      />
      <span className="sr-only sm:hidden">{label}</span>
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
