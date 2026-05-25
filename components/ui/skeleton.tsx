import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "motion-safe:animate-pulse",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-surface-strong/80 before:to-transparent motion-safe:before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        "motion-reduce:before:hidden",
        className
      )}
      {...props}
    />
  )
}

export function VideoCardSkeleton() {
  return (
    <article className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full" />
      <div className="flex gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </article>
  )
}

/** Matches RelatedVideoCard horizontal layout */
export function RelatedVideoRowSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="aspect-video w-[168px] shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  )
}

export { Skeleton }
