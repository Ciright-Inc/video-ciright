import { NextResponse } from "next/server";
import { triggerTranscode } from "@/lib/transcode";
import { runTranscodeJob } from "@/lib/transcode-job";

export const runtime = "nodejs";
export const maxDuration = 300;

interface RouteParams {
  params: Promise<{ id: string }>;
}

type ProcessBody = {
  channelId?: string;
  s3Key?: string;
};

function verifyTranscodeSecret(request: Request): boolean {
  const expected = process.env.TRANSCODE_SECRET;
  if (!expected) return false;
  return request.headers.get("x-transcode-secret") === expected;
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!verifyTranscodeSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: videoId } = await params;
  const body = (await request.json().catch(() => ({}))) as ProcessBody;

  if (!body.channelId || !body.s3Key) {
    return NextResponse.json(
      { error: "channelId and s3Key are required" },
      { status: 400 }
    );
  }

  const wait = new URL(request.url).searchParams.get("wait") === "1";

  if (!wait) {
    triggerTranscode({
      videoId,
      channelId: body.channelId,
      s3Key: body.s3Key,
    });
    return NextResponse.json({ accepted: true, videoId }, { status: 202 });
  }

  try {
    await runTranscodeJob({
      videoId,
      channelId: body.channelId,
      s3Key: body.s3Key,
    });
    return NextResponse.json({ ok: true, videoId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Transcoding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
