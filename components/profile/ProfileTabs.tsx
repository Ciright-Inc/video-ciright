"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ProfileTab = { href: string; label: string; exact?: boolean };

const tabs: ProfileTab[] = [
  { href: "/profile", label: "Dashboard", exact: true },
  { href: "/profile/content", label: "Content" },
  { href: "/profile/analytics", label: "Analytics" },
  { href: "/profile/history", label: "History" },
  { href: "/profile/channel", label: "Channel" },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium no-underline transition-colors",
              active
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-ink"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
