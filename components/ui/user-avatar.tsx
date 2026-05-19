"use client";

import { useState } from "react";
import {
  Avatar as AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarColor, getAvatarLetter } from "@/lib/avatar";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, string> = {
  sm: "size-6 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-24 text-2xl",
};

const shadcnSizeMap: Record<Size, "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
  xl: "lg",
};

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(src) && !imageError;
  const letter = getAvatarLetter(name);
  const { bg, text } = getAvatarColor(name);

  return (
    <AvatarRoot
      size={shadcnSizeMap[size]}
      className={cn(sizeMap[size], className)}
    >
      {showImage ? (
        <AvatarImage
          src={src!}
          alt={name ?? "Avatar"}
          onError={() => setImageError(true)}
        />
      ) : null}
      <AvatarFallback
        className="font-semibold"
        style={{ backgroundColor: bg, color: text }}
      >
        {letter}
      </AvatarFallback>
    </AvatarRoot>
  );
}
