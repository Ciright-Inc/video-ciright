import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /** Unix ms when the JWT expires (for client-side session expiry UI). */
    expiresAt?: number;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      channelId?: string | null;
      channelHandle?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    channelId?: string | null;
    channelHandle?: string | null;
  }
}
