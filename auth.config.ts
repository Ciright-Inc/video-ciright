import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config used by middleware. It must not import Prisma,
// bcrypt, or any other Node-only modules. The full config in `lib/auth.ts`
// spreads this base and adds the adapter, providers, and DB-touching callbacks.

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.channelId =
          (token.channelId as string | null | undefined) ?? null;
        session.user.channelHandle =
          (token.channelHandle as string | null | undefined) ?? null;
        if (token.picture !== undefined) {
          session.user.image = (token.picture as string | null) ?? null;
        }
        if (token.name !== undefined) {
          session.user.name = (token.name as string | null) ?? null;
        }
      }
      if (typeof token.exp === "number") {
        session.expiresAt = token.exp * 1000;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
