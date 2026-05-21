import Image from "next/image";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/logo.png";

type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}
