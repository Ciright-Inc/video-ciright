import { NextResponse } from "next/server";
import { ChannelGeoMetric, NotificationType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordChannelGeoEvent } from "@/lib/analytics/recordChannelGeoEvent";
import { recordNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: "channelId required" }, { status: 400 });
    }

    const subscriberId = session.user.id;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { ownerId: true },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (subscriberId === channel.ownerId) {
      return NextResponse.json({ error: "Cannot subscribe to own channel" }, { status: 400 });
    }

    const existing = await prisma.subscription.findUnique({
      where: { subscriberId_channelId: { subscriberId, channelId } },
    });

    if (existing) {
      await prisma.subscription.delete({
        where: { subscriberId_channelId: { subscriberId, channelId } },
      });
      return NextResponse.json({ subscribed: false });
    }

    await prisma.subscription.create({
      data: { subscriberId, channelId },
    });

    await recordNotification({
      recipientId: channel.ownerId,
      type: NotificationType.CHANNEL_NEW_SUBSCRIBER,
      actorId: subscriberId,
      channelId,
    });

    void recordChannelGeoEvent(
      request,
      channelId,
      ChannelGeoMetric.SUBSCRIBE,
      subscriberId
    );

    return NextResponse.json({ subscribed: true });
  } catch {
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
