import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/format";
import { authConfig } from "@/auth.config";
import { cirightLogin } from "@/lib/ciright-auth";
import { syncLocalUserFromCiright } from "@/lib/auth/sync-local-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const loginResult = await cirightLogin({
          username: String(credentials.username).trim(),
          password: String(credentials.password),
        });

        if (!loginResult.ok) return null;

        const { employee, userToken, token } = loginResult.data;

        const localUser = await syncLocalUserFromCiright({
          email: employee.email,
          name: employee.name,
          image: employee.employeePhoto ?? null,
        });

        return {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          image: localUser.image,
          channelId: localUser.channelId,
          channelHandle: localUser.channelHandle,
          cirightUserToken: userToken,
          cirightToken: token,
          cirightEmployeeId: employee.employeeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const u = user as {
          channelId?: string;
          channelHandle?: string;
          cirightUserToken?: string;
          cirightToken?: string;
          cirightEmployeeId?: number;
        };
        if (u.channelId) token.channelId = u.channelId;
        if (u.channelHandle) token.channelHandle = u.channelHandle;
        if (u.cirightUserToken) token.cirightUserToken = u.cirightUserToken;
        if (u.cirightToken) token.cirightToken = u.cirightToken;
        if (u.cirightEmployeeId != null) {
          token.cirightEmployeeId = u.cirightEmployeeId;
        }
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { channel: true },
        });
        if (!dbUser) {
          delete token.id;
          delete token.channelId;
          delete token.channelHandle;
        } else if (!dbUser.channel) {
          const base = slugifyHandle(
            dbUser.name ?? dbUser.email.split("@")[0]
          );
          let handle = base;
          let i = 0;
          while (await prisma.channel.findUnique({ where: { handle } })) {
            i++;
            handle = `${base}${i}`;
          }
          const channel = await prisma.channel.create({
            data: {
              handle,
              name: dbUser.name ?? base,
              avatarUrl: dbUser.image,
              ownerId: dbUser.id,
            },
          });
          token.channelId = channel.id;
          token.channelHandle = channel.handle;
          token.picture = channel.avatarUrl ?? dbUser.image ?? undefined;
          token.name = channel.name ?? dbUser.name ?? undefined;
        } else {
          token.channelId = dbUser.channel.id;
          token.channelHandle = dbUser.channel.handle;
          token.picture =
            dbUser.channel.avatarUrl ?? dbUser.image ?? undefined;
          token.name = dbUser.channel.name ?? dbUser.name ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id;
        } else {
          Reflect.deleteProperty(session.user, "id");
        }
        session.user.channelId =
          (token.channelId as string | null | undefined) ?? undefined;
        session.user.channelHandle =
          (token.channelHandle as string | null | undefined) ?? undefined;
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
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      const existing = await prisma.channel.findUnique({
        where: { ownerId: user.id },
      });
      if (existing) return;

      const base = slugifyHandle(user.name ?? user.email.split("@")[0]);
      let handle = base;
      let i = 0;
      while (await prisma.channel.findUnique({ where: { handle } })) {
        i++;
        handle = `${base}${i}`;
      }
      await prisma.channel.create({
        data: {
          handle,
          name: user.name ?? base,
          avatarUrl: user.image,
          ownerId: user.id,
        },
      });
    },
  },
});
