"use client";

import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { hasFlag } from "country-flag-icons";
import { GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CountryFlagProps = {
  code: string;
  className?: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "text-base leading-none",
  md: "text-lg leading-none",
} as const;

export function CountryFlag({
  code,
  className,
  size = "md",
}: CountryFlagProps) {
  const upper = code.trim().toUpperCase();

  if (!upper || !hasFlag(upper)) {
    return (
      <GlobeIcon
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          "shrink-0 text-muted-foreground",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(sizeClasses[size], "shrink-0", className)}
    >
      {getUnicodeFlagIcon(upper)}
    </span>
  );
}
