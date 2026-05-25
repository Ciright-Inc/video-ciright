import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRelatedVideos } from "@/lib/recommendations";

interface RouteParams {
  params: Promise<{ videoId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { videoId } = await params;
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const session = await auth();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    30,
    Math.max(1, Number(searchParams.get("limit") ?? 12) || 12)
  );

  try {
    const videos = await getRelatedVideos(
      videoId,
      session?.user?.id,
      limit
    );
    return NextResponse.json({ videos, videoId });
  } catch {
    return NextResponse.json(
      { error: "Failed to load related videos" },
      { status: 500 }
    );
  }
}
