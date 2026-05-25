import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className, size }: LogoProps) {
  const sizedByClass = /\bsize-/.test(className ?? "");

  return (
    <Play
      aria-hidden
      className={cn("shrink-0 fill-primary text-primary", className)}
      strokeWidth={0}
      {...(!sizedByClass && size != null ? { size } : !sizedByClass ? { size: 40 } : {})}
    />
  );
}
