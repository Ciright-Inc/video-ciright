import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// App helpers live in lib/format.ts so shadcn CLI won't overwrite them.
export { formatDuration, formatViews, slugifyHandle } from "./format";
