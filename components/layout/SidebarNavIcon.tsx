import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavIconProps {
  icon: LucideIcon;
  active: boolean;
  className?: string;
}

export function SidebarNavIcon({ icon: Icon, active, className }: SidebarNavIconProps) {
  return (
    <Icon
      aria-hidden
      strokeWidth={active ? 2.25 : 1.75}
      className={cn(
        "size-6 shrink-0 transition-colors duration-200",
        active ? "text-sidebar-primary" : "text-current",
        className
      )}
    />
  );
}
