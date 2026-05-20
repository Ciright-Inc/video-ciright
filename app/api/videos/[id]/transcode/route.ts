import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryExtractKeyFromPublicObjectUrl } from "@/lib/s3";
import {
  buildTranscodeCallbackUrl,
  isTranscodingEnabled,
  triggerTranscode,
} from "@/lib/transcode";
import { VideoStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTranscodingEnabled()) {
    return NextResponse.json(
      { error: "Transcoder is not configured" },
      { status: 503 }
    );
  }

  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video || video.channelId !== session.user.channelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (video.status === VideoStatus.READY) {
    return NextResponse.json({ ok: true, message: "Already ready" });
  }

  const s3Key =
    tryExtractKeyFromPublicObjectUrl(video.videoUrl) ??
    null;

  if (!s3Key) {
    return NextResponse.json(
      { error: "Could not resolve S3 key for original video" },
      { status: 400 }
    );
  }

  const result = await triggerTranscode({
    videoId: id,
    channelId: video.channelId,
    s3Key,
    callbackUrl: buildTranscodeCallbackUrl(id),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to start transcoding" },
      { status: 502 }
    );
  }

  await prisma.video.update({
    where: { id },
    data: { status: VideoStatus.PROCESSING },
  });

  return NextResponse.json({ ok: true });
}
