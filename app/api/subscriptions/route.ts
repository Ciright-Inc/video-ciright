import { NextResponse } from "next/server";
import { ChannelGeoMetric } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordChannelGeoEvent } from "@/lib/analytics/recordChannelGeoEvent";

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

    if (subscriberId === (await prisma.channel.findUnique({ where: { id: channelId } }))?.ownerId) {
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
