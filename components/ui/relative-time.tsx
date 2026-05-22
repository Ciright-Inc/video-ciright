"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export interface RelativeTimeProps {
  date: Date | string | number;
  className?: string;
}

/** Relative time label; computed after mount to avoid SSR hydration mismatch. */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const parsed = new Date(date);
    const update = () => {
      setLabel(formatDistanceToNow(parsed, { addSuffix: true }));
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [date]);

  return (
    <time dateTime={new Date(date).toISOString()} className={className}>
      {label ?? "\u00a0"}
    </time>
  );
}
