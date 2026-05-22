import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/format";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { channel: true },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
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
        session.user.channelId = (token.channelId as string | null) ?? null;
        session.user.channelHandle =
          (token.channelHandle as string | null) ?? null;
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
