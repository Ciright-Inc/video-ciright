"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SubscribedChannel } from "@/lib/data/channels";

interface ChannelChipsRowProps {
  channels: SubscribedChannel[];
}

export function ChannelChipsRow({ channels }: ChannelChipsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChannelId = searchParams.get("channel");

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function selectChannel(channelId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (channelId) {
      params.set("channel", channelId);
    } else {
      params.delete("channel");
    }
    const qs = params.toString();
    router.push(`/subscriptions${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  if (channels.length === 0) return null;

  return (
    <div className="mb-6 flex items-center gap-2">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="hidden shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft p-1.5 shadow-sm transition-colors hover:bg-surface-strong md:flex"
      >
        <ChevronLeft className="size-4 text-ink" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-none flex min-w-0 flex-1 gap-3 overflow-x-auto py-1"
      >
        <button
          type="button"
          onClick={() => selectChannel(null)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
            !activeChannelId
              ? "border-primary bg-primary text-on-primary"
              : "border-border bg-surface-soft text-body hover:bg-surface-strong"
          )}
        >
          All
        </button>

        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() =>
              selectChannel(ch.id === activeChannelId ? null : ch.id)
            }
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors",
              ch.id === activeChannelId
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-soft text-body hover:bg-surface-strong"
            )}
          >
            <Avatar src={ch.avatarUrl} name={ch.name} size="sm" />
            <span className="max-w-[120px] truncate">{ch.name}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="hidden shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft p-1.5 shadow-sm transition-colors hover:bg-surface-strong md:flex"
      >
        <ChevronRight className="size-4 text-ink" />
      </button>
    </div>
  );
}
