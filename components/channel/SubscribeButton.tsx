"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SubscribeButtonProps {
  channelId: string;
  initialSubscribed: boolean;
}

export function SubscribeButton({
  channelId,
  initialSubscribed,
}: SubscribeButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const prev = subscribed;
    setSubscribed(!subscribed);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubscribed(data.subscribed);
    } catch {
      setSubscribed(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={subscribed ? "secondary" : "primary"}
      size="sm"
      className="rounded-[var(--radius-pill)]"
      onClick={toggle}
      disabled={loading || status === "loading"}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}
