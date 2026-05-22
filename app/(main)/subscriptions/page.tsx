import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getSubscribedChannels,
  getSubscriptionFeedVideosPage,
} from "@/lib/data/channels";
import { VirtualVideoGrid } from "@/components/video/VirtualVideoGrid";
import { ChannelChipsRow } from "@/components/subscriptions/ChannelChipsRow";
import { pillCtaLinkClass } from "@/components/ui/button";
import { Bell, Layers } from "lucide-react";

interface SubscriptionsPageProps {
  searchParams: Promise<{ channel?: string }>;
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/subscriptions");
  }

  const { channel: channelFilter } = await searchParams;
  const [channels, initialPage] = await Promise.all([
    getSubscribedChannels(session.user.id),
    getSubscriptionFeedVideosPage(session.user.id, {
      channelId: channelFilter,
    }),
  ]);

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-surface-soft">
          <Layers className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-ink">
          No subscriptions yet
        </h1>
        <p className="mb-6 max-w-md text-sm text-body">
          Subscribe to channels you love and their latest videos will show up
          here. Start by exploring what&apos;s available.
        </p>
        <Link href="/" className={pillCtaLinkClass}>
          Browse videos
        </Link>
      </div>
    );
  }

  const activeChannel = channelFilter
    ? channels.find((c) => c.id === channelFilter)
    : null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">Subscriptions</h1>
      </div>

      <ChannelChipsRow channels={channels} />

      {activeChannel && (
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-ink">
            {activeChannel.name}
          </h2>
          <span className="text-sm text-muted-foreground">
            {activeChannel._count.subscribers} subscriber
            {activeChannel._count.subscribers !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {initialPage.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-body">
            {activeChannel
              ? `${activeChannel.name} hasn't posted any videos yet.`
              : "No new videos from your subscriptions."}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-text-link no-underline hover:underline"
          >
            Browse all videos
          </Link>
        </div>
      ) : (
        <>
          {!activeChannel && (
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              Latest videos
            </h2>
          )}
          <VirtualVideoGrid
            feed={{
              type: "subscriptions",
              channelId: channelFilter,
            }}
            initialPage={initialPage}
          />
        </>
      )}
    </div>
  );
}
