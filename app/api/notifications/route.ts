import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getNotificationsForUser,
  markNotificationsRead,
} from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const cursor = searchParams.get("cursor") ?? undefined;
  const unreadOnly = searchParams.get("unreadOnly") !== "false";

  const result = await getNotificationsForUser(session.user.id, {
    limit: Number.isFinite(limit) ? limit : 20,
    cursor,
    unreadOnly,
  });

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { ids?: string[]; all?: boolean };
    await markNotificationsRead(session.user.id, {
      ids: body.ids,
      all: body.all,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
