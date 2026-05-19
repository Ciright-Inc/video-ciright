import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugifyHandle } from "@/lib/format";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
        if (dbUser) {
          token.channelId = dbUser.channel?.id ?? null;
          token.channelHandle = dbUser.channel?.handle ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.channelId = (token.channelId as string | null) ?? null;
        session.user.channelHandle =
          (token.channelHandle as string | null) ?? null;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          include: { channel: true },
        });

        if (existing && !existing.channel) {
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
              ownerId: existing.id,
            },
          });
        }
      }
      return true;
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
