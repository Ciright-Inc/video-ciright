"use client";

import Link from "next/link";
import { NavLink } from "@/components/layout/NavLink";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Menu, Plus, Search, User } from "lucide-react";
import { NotificationMenu } from "@/components/layout/NotificationMenu";
import { Logo } from "@/components/brand/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { AvatarMenu } from "@/components/auth/AvatarMenu";
import { productName } from "@/themes/theme.config";

export function Topbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
          className="hidden size-10 md:inline-flex"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-6" />
        </Button>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 py-1.5 text-primary no-underline hover:no-underline"
          aria-label={`${productName} home`}
        >
          <Logo className="size-7" />
          <span className="hidden text-lg font-semibold tracking-tight text-primary sm:inline">
            {productName}
          </span>
        </Link>
      </div>

      <div className="mx-4 hidden min-w-0 flex-1 items-center justify-center md:flex">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-[640px] items-stretch gap-3"
        >
          <InputGroup className="h-11 flex-1 overflow-hidden rounded-[var(--radius-pill)] bg-muted focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40 has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-11 rounded-l-[var(--radius-pill)] bg-muted pl-4"
            />
            <InputGroupAddon align="inline-end" className="p-0">
              <InputGroupButton
                type="submit"
                variant="secondary"
                className="h-11 w-16 rounded-r-[var(--radius-pill)] rounded-l-none border-l border-border bg-secondary px-0 hover:bg-secondary/80"
                aria-label="Search"
              >
                <Search className="size-5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>

      <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:ml-0">
        <Link
          href="/search?focus=1"
          aria-label="Search"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "size-10 md:hidden"
          )}
        >
          <Search className="size-6" />
        </Link>

        <NavLink
          href="/upload"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden h-9 gap-2 rounded-[var(--radius-pill)] no-underline hover:no-underline md:inline-flex"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border">
            <Plus className="size-3.5" />
          </span>
          <span className="hidden sm:inline">Create</span>
        </NavLink>

        {status === "loading" ? (
          <div className="ml-1 flex items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
          </div>
        ) : session?.user ? (
          <>
            <NotificationMenu />
            <AvatarMenu session={session} />
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
