import { NextResponse } from "next/server";
import { cirightSignUp } from "@/lib/ciright-auth";
import { syncLocalUserFromCiright } from "@/lib/auth/sync-local-user";
import { normalizeCountryCode } from "@/lib/geo/validCountryCode";

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      password,
      phone,
      countryCode: rawCountry,
    } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email and password (min 6 chars) are required" },
        { status: 400 }
      );
    }

    const phoneStr = String(phone ?? "").trim();
    if (!phoneStr) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const countryCode = normalizeCountryCode(String(rawCountry ?? ""));
    if (!countryCode) {
      return NextResponse.json(
        { error: "A valid country is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const displayName = name?.trim() || normalizedEmail.split("@")[0];

    const signupResult = await cirightSignUp({
      name: displayName,
      email: normalizedEmail,
      phone: phoneStr,
      password: String(password),
    });

    if (!signupResult.ok) {
      return NextResponse.json(
        { error: signupResult.message },
        { status: 400 }
      );
    }

    const user = await syncLocalUserFromCiright({
      email: normalizedEmail,
      name: displayName,
      countryCode,
    });

    return NextResponse.json(
      { id: user.id, email: user.email, channelId: user.channelId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
