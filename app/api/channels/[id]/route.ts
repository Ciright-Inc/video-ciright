import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChannelById } from "@/lib/data/channels";
import { slugifyHandle } from "@/lib/format";
import { deleteObject, tryExtractKeyFromPublicObjectUrl } from "@/lib/s3";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const channel = await getChannelById(id);
  if (!channel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(channel);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.channelId || session.user.channelId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, handle, description, avatarUrl, bannerUrl } = body as {
    name?: string;
    handle?: string;
    description?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
  };

  const data: {
    name?: string;
    handle?: string;
    description?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
  } = {};

  if (name !== undefined) {
    const n = String(name).trim();
    if (n.length < 1 || n.length > 120) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = n;
  }

  if (handle !== undefined) {
    const raw = String(handle).trim().toLowerCase().replace(/^@/, "");
    const h = slugifyHandle(raw.length ? raw : "channel");
    if (h.length < 2) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }
    const taken = await prisma.channel.findFirst({
      where: { handle: h, NOT: { id } },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Handle already taken" },
        { status: 409 }
      );
    }
    data.handle = h;
  }

  if (description !== undefined) {
    data.description =
      description === null || description === ""
        ? null
        : String(description).slice(0, 2000);
  }
  if (avatarUrl !== undefined) {
    data.avatarUrl =
      avatarUrl === null || avatarUrl === "" ? null : String(avatarUrl);
  }
  if (bannerUrl !== undefined) {
    data.bannerUrl =
      bannerUrl === null || bannerUrl === "" ? null : String(bannerUrl);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.channel.findUnique({
    where: { id },
    select: { avatarUrl: true, bannerUrl: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.channel.update({
    where: { id },
    data,
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { subscribers: true, videos: true } },
    },
  });

  const avatarChanged =
    Object.prototype.hasOwnProperty.call(data, "avatarUrl") &&
    existing.avatarUrl !== updated.avatarUrl;
  const bannerChanged =
    Object.prototype.hasOwnProperty.call(data, "bannerUrl") &&
    existing.bannerUrl !== updated.bannerUrl;

  const oldAvatarKey =
    avatarChanged && existing.avatarUrl
      ? tryExtractKeyFromPublicObjectUrl(existing.avatarUrl)
      : null;
  const oldBannerKey =
    bannerChanged && existing.bannerUrl
      ? tryExtractKeyFromPublicObjectUrl(existing.bannerUrl)
      : null;
  const newAvatarKey = updated.avatarUrl
    ? tryExtractKeyFromPublicObjectUrl(updated.avatarUrl)
    : null;
  const newBannerKey = updated.bannerUrl
    ? tryExtractKeyFromPublicObjectUrl(updated.bannerUrl)
    : null;

  const keysToDelete = [oldAvatarKey, oldBannerKey].filter(
    (key): key is string =>
      Boolean(key) && key !== newAvatarKey && key !== newBannerKey
  );

  await Promise.allSettled(
    keysToDelete.map(async (key) => {
      try {
        await deleteObject(key);
      } catch (err) {
        console.error("Failed to delete replaced channel asset:", key, err);
      }
    })
  );

  return NextResponse.json(updated);
}
