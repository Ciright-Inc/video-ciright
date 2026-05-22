import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCountryCode } from "@/lib/geo/validCountryCode";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const countryCode = normalizeCountryCode(String(body.countryCode ?? ""));
  if (!countryCode) {
    return NextResponse.json(
      { error: "A valid country is required" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { countryCode },
  });

  return NextResponse.json({ countryCode });
}
