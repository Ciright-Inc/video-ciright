import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/format";

export type SyncLocalUserInput = {
  email: string;
  name?: string | null;
  image?: string | null;
  countryCode?: string | null;
};

export type SyncedLocalUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  channelId: string;
  channelHandle: string;
};

async function ensureChannel(
  userId: string,
  displayName: string,
  avatarUrl: string | null
): Promise<{ channelId: string; channelHandle: string }> {
  const existing = await prisma.channel.findUnique({
    where: { ownerId: userId },
  });

  if (existing) {
    return { channelId: existing.id, channelHandle: existing.handle };
  }

  const base = slugifyHandle(displayName);
  let handle = base;
  let i = 0;
  while (await prisma.channel.findUnique({ where: { handle } })) {
    i++;
    handle = `${base}${i}`;
  }

  const channel = await prisma.channel.create({
    data: {
      handle,
      name: displayName,
      avatarUrl,
      ownerId: userId,
    },
  });

  return { channelId: channel.id, channelHandle: channel.handle };
}

export async function syncLocalUserFromCiright(
  input: SyncLocalUserInput
): Promise<SyncedLocalUser> {
  const email = input.email.toLowerCase().trim();
  const displayName =
    input.name?.trim() || email.split("@")[0];
  const image = input.image?.trim() || null;

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { channel: true },
  });

  let user;

  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: displayName,
        image: image ?? existing.image,
        ...(input.countryCode ? { countryCode: input.countryCode } : {}),
      },
      include: { channel: true },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: displayName,
        image,
        countryCode: input.countryCode ?? null,
      },
      include: { channel: true },
    });
  }

  let channelId = user.channel?.id;
  let channelHandle = user.channel?.handle;

  if (!channelId || !channelHandle) {
    const channel = await ensureChannel(user.id, displayName, image);
    channelId = channel.channelId;
    channelHandle = channel.channelHandle;
  } else if (image && user.channel && user.channel.avatarUrl !== image) {
    await prisma.channel.update({
      where: { id: user.channel.id },
      data: { avatarUrl: image },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    channelId: channelId!,
    channelHandle: channelHandle!,
  };
}
