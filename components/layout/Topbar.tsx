"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import {
  Bell,
  Menu,
  Mic,
  Play,
  Plus,
  Search,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

export function Topbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center bg-background px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="size-10"
          onClick={toggle}
          aria-label="Toggle menu"
        >
          <Menu className="size-6" />
        </Button>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 py-1.5 text-foreground no-underline hover:no-underline"
          aria-label="Ciright Video home"
        >
          <Play className="size-7 fill-primary text-primary" />
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            Ciright Video
          </span>
        </Link>
      </div>

      <div className="mx-4 hidden min-w-0 flex-1 items-center justify-center md:flex">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-[640px] items-stretch gap-3"
        >
          <InputGroup className="h-10 flex-1 rounded-[var(--radius-pill)] bg-muted">
            <InputGroupInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-10 rounded-l-[var(--radius-pill)] bg-muted pl-4"
            />
            <InputGroupAddon align="inline-end" className="p-0">
              <InputGroupButton
                type="submit"
                variant="secondary"
                className="h-10 w-16 rounded-r-[var(--radius-pill)] rounded-l-none border-l border-border bg-secondary px-0 hover:bg-secondary/80"
                aria-label="Search"
              >
                <Search className="size-5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="hidden size-10 lg:inline-flex"
            aria-label="Search with voice"
          >
            <Mic className="size-5" />
          </Button>
        </form>
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:ml-0">
        <Link
          href="/search"
          aria-label="Search"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "size-10 md:hidden"
          )}
        >
          <Search className="size-6" />
        </Link>

        <Link
          href="/upload"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 gap-2 rounded-[var(--radius-pill)] no-underline hover:no-underline"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border">
            <Plus className="size-3.5" />
          </span>
          <span className="hidden sm:inline">Create</span>
        </Link>

        {session?.user ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="size-10"
              aria-label="Notifications"
            >
              <Bell className="size-6" />
            </Button>
            <Link
              href="/studio"
              className="ml-1 flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="Account"
            >
              <Avatar
                src={session.user.image}
                name={session.user.name}
                size="md"
              />
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 gap-2 rounded-[var(--radius-pill)] text-text-link no-underline hover:no-underline"
            )}
          >
            <User className="size-5 shrink-0" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}
