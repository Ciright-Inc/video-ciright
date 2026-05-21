import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ProfileSurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <ProfileSurfaceCard>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-14" />
    </ProfileSurfaceCard>
  );
}

function PageHeaderSkeleton({
  titleWidth = "w-40",
  descriptionWidth = "w-full max-w-md",
}: {
  titleWidth?: string;
  descriptionWidth?: string;
}) {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className={cn("h-7", titleWidth)} />
      <Skeleton className={cn("h-4", descriptionWidth)} />
    </div>
  );
}

export function ProfileDashboardSkeleton() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading dashboard…</span>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSurfaceCard>
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="aspect-video w-40 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
          </div>
        </ProfileSurfaceCard>

        <ProfileSurfaceCard>
          <Skeleton className="h-4 w-56" />
          <ul className="mt-3 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-3 w-3/5" />
              </li>
            ))}
          </ul>
        </ProfileSurfaceCard>
      </div>
    </div>
  );
}

export function ProfileContentSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading content">
      <span className="sr-only">Loading your videos…</span>
      <PageHeaderSkeleton titleWidth="w-36" descriptionWidth="w-full max-w-lg" />

      <div className="overflow-hidden rounded-lg border border-hairline">
        <div className="flex gap-3 border-b border-hairline bg-surface-soft p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === 0 ? "w-24" : "hidden w-16 sm:block")}
            />
          ))}
        </div>
        <ul className="divide-y divide-hairline-soft">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-20 shrink-0 rounded-sm" />
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="hidden h-6 w-16 rounded-full md:block" />
              <Skeleton className="hidden h-4 w-12 md:block" />
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="hidden h-8 w-24 md:block" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ProfileAnalyticsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading analytics">
      <span className="sr-only">Loading analytics…</span>
      <PageHeaderSkeleton titleWidth="w-32" descriptionWidth="w-full max-w-xl" />

      <div className="grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <ProfileSurfaceCard key={i}>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-4 h-64 w-full rounded-md" />
          </ProfileSurfaceCard>
        ))}
      </div>
    </div>
  );
}

export function ProfileHistorySkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading watch history">
      <span className="sr-only">Loading watch history…</span>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, section) => (
          <section key={section}>
            <Skeleton className="mb-3 h-4 w-24" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: section === 0 ? 4 : 3 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="aspect-video w-[168px] shrink-0 rounded-md" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ProfileChannelSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-label="Loading channel settings"
    >
      <span className="sr-only">Loading channel settings…</span>

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-full rounded-md md:w-40" />
      </div>

      <Skeleton className="h-40 w-full rounded-lg" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
