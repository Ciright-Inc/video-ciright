"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CloudUpload,
  Home,
  Search,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Explore", icon: Search },
  { href: "/studio", label: "Studio", icon: BarChart3 },
  { href: "/upload", label: "Upload", icon: CloudUpload },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-muted md:flex",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                buttonVariants({
                  variant: active ? "secondary" : "ghost",
                  size: "default",
                }),
                "h-auto w-full justify-start gap-4 py-2.5 font-medium no-underline hover:no-underline",
                collapsed && "justify-center gap-0 px-2"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
