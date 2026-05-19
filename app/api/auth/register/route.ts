import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/format";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email and password (min 6 chars) are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const displayName = name?.trim() || normalizedEmail.split("@")[0];

    let handle = slugifyHandle(displayName);
    let i = 0;
    while (await prisma.channel.findUnique({ where: { handle } })) {
      i++;
      handle = `${slugifyHandle(displayName)}${i}`;
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        passwordHash,
        channel: {
          create: {
            handle,
            name: displayName,
            avatarUrl: null,
          },
        },
      },
      include: { channel: true },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, channelId: user.channel?.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
