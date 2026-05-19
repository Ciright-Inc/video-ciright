import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoById, incrementVideoViews } from "@/lib/data/videos";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const video = await getVideoById(id);
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(video);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const session = await auth();

  if (body.incrementViews) {
    try {
      const video = await incrementVideoViews(id);
      return NextResponse.json({ views: video.views });
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, visibility, status } = body;

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing || existing.channelId !== session.user.channelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const video = await prisma.video.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(visibility !== undefined && { visibility }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(video);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing || existing.channelId !== session.user.channelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
