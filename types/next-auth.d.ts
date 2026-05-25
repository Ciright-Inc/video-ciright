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

  interface User {
    channelId?: string;
    channelHandle?: string;
    cirightUserToken?: string;
    cirightToken?: string;
    cirightEmployeeId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    channelId?: string | null;
    channelHandle?: string | null;
    cirightUserToken?: string;
    cirightToken?: string;
    cirightEmployeeId?: number;
  }
}
