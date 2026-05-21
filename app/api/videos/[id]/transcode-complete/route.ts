import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus } from "@prisma/client";
import { notifyVideoReadyIfPublic } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

type CallbackBody = {
  secret?: string;
  status?: "ready" | "failed";
  videoUrl?: string;
  duration?: number;
  error?: string;
};

export async function POST(request: Request, { params }: RouteParams) {
  const expectedSecret = process.env.TRANSCODE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Transcode webhook not configured" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as CallbackBody;

  if (body.secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.status === "ready" && body.videoUrl) {
    await prisma.video.update({
      where: { id },
      data: {
        videoUrl: body.videoUrl,
        status: VideoStatus.READY,
        ...(body.duration != null && { duration: body.duration }),
      },
    });
    await notifyVideoReadyIfPublic(id);
    return NextResponse.json({ ok: true });
  }

  if (body.status === "failed") {
    await prisma.video.update({
      where: { id },
      data: { status: VideoStatus.FAILED },
    });
    console.error(`Transcode failed for video ${id}:`, body.error);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid callback payload" }, { status: 400 });
}
