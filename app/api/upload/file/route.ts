import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildVideoOriginalKey,
  buildVideoThumbnailKey,
  getPublicObjectUrl,
  isAllowedImageContentType,
  isAllowedVideoContentType,
  uploadObjectFromFile,
} from "@/lib/s3";

const VIDEO_MAX_BYTES = 1024 * 1024 * 1024;
const THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const kind = form.get("kind");
    const file = form.get("file");
    const videoId = form.get("videoId");

    if (kind !== "video" && kind !== "thumbnail") {
      return NextResponse.json(
        { error: "kind must be video or thumbnail" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "File must be greater than zero bytes" },
        { status: 400 }
      );
    }

    if (kind === "video") {
      if (file.size > VIDEO_MAX_BYTES) {
        return NextResponse.json(
          { error: "File exceeds 1 GB limit" },
          { status: 413 }
        );
      }
      if (!isAllowedVideoContentType(file.type)) {
        return NextResponse.json(
          { error: "Unsupported video format" },
          { status: 400 }
        );
      }
    } else {
      if (file.size > THUMBNAIL_MAX_BYTES) {
        return NextResponse.json(
          { error: "Thumbnail exceeds 10 MB limit" },
          { status: 413 }
        );
      }
      if (!isAllowedImageContentType(file.type)) {
        return NextResponse.json(
          { error: "Unsupported image format" },
          { status: 400 }
        );
      }
    }

    if (typeof videoId !== "string" || !videoId.trim()) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

    const key =
      kind === "video"
        ? buildVideoOriginalKey(
            session.user.channelId,
            videoId.trim(),
            file.name
          )
        : buildVideoThumbnailKey(
            session.user.channelId,
            videoId.trim(),
            file.name
          );

    await uploadObjectFromFile({
      key,
      contentType: file.type,
      file,
    });

    return NextResponse.json({
      key,
      publicUrl: getPublicObjectUrl(key),
    });
  } catch (err) {
    console.error("File upload failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
