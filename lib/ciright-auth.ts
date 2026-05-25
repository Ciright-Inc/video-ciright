const DEFAULT_SIGNUP_URL =
  "https://www.myciright.com/Ciright/api/commonadmin/m3337090";
const DEFAULT_LOGIN_URL =
  "https://www.myciright.com/Ciright/api/commonrestapi/m1342055";

export const CIRIGHT_SUBSCRIPTION_ID = Number(
  process.env.CIRIGHT_SUBSCRIPTION_ID ?? 9329
);
export const CIRIGHT_VERTICAL_ID = Number(
  process.env.CIRIGHT_VERTICAL_ID ?? 18
);
export const CIRIGHT_APP_ID = Number(process.env.CIRIGHT_APP_ID ?? 2988);
export const CIRIGHT_SPHERE_TYPE_URL =
  process.env.CIRIGHT_SPHERE_TYPE_URL ?? "video-ciright.htm";

const SIGNUP_URL = process.env.CIRIGHT_SIGNUP_URL ?? DEFAULT_SIGNUP_URL;
const LOGIN_URL = process.env.CIRIGHT_LOGIN_URL ?? DEFAULT_LOGIN_URL;

const FETCH_TIMEOUT_MS = 30_000;

export type CirightEmployee = {
  employeeId: number;
  name: string;
  employeePhoto?: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: unknown;
};

export type CirightLoginDataItem = {
  employees: CirightEmployee[];
  mfa?: number;
  userToken: string;
  token: string;
  appSessionLogId?: number;
};

export type CirightApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type CirightLoginSuccess = {
  employee: CirightEmployee;
  userToken: string;
  token: string;
  mfa: number;
  appSessionLogId?: number;
};

export type CirightAuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function cirightFetch<T>(
  url: string,
  body: Record<string, unknown>
): Promise<CirightAuthResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let json: CirightApiResponse<T> | null = null;

    try {
      json = text ? (JSON.parse(text) as CirightApiResponse<T>) : null;
    } catch {
      json = null;
    }

    if (json && typeof json.status === "boolean") {
      if (!json.status) {
        return {
          ok: false,
          message: json.message || "Request failed",
        };
      }
      return { ok: true, data: json.data };
    }

    if (!res.ok) {
      return {
        ok: false,
        message:
          res.status === 409
            ? "An account with this email already exists."
            : `Authentication request failed (${res.status}). Please try again.`,
      };
    }

    return {
      ok: false,
      message: "Unexpected response from authentication service.",
    };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      message: isAbort
        ? "Authentication service timed out. Please try again."
        : "Authentication service unavailable. Please try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function cirightSignUp(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<CirightAuthResult<null>> {
  return cirightFetch<null>(SIGNUP_URL, {
    subscriptionId: CIRIGHT_SUBSCRIPTION_ID,
    verticalId: CIRIGHT_VERTICAL_ID,
    appId: CIRIGHT_APP_ID,
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
    verificationId: null,
    otp: null,
  });
}

export async function cirightLogin(input: {
  username: string;
  password: string;
  userToken?: string;
}): Promise<CirightAuthResult<CirightLoginSuccess>> {
  const result = await cirightFetch<CirightLoginDataItem[] | null>(LOGIN_URL, {
    subscriptionId: CIRIGHT_SUBSCRIPTION_ID,
    verticalId: CIRIGHT_VERTICAL_ID,
    appId: CIRIGHT_APP_ID,
    sphereTypeUrl: CIRIGHT_SPHERE_TYPE_URL,
    username: input.username,
    password: input.password,
    userToken: input.userToken ?? "",
    isAutoLogin: 0,
  });

  if (!result.ok) {
    return result;
  }

  const row = Array.isArray(result.data) ? result.data[0] : null;
  const employee = row?.employees?.[0];

  if (!employee?.email) {
    return { ok: false, message: "Invalid login response from server" };
  }

  const mfa = row?.mfa ?? 0;
  if (mfa !== 0) {
    return {
      ok: false,
      message: "Multi-factor authentication is required for this account.",
    };
  }

  return {
    ok: true,
    data: {
      employee,
      userToken: row?.userToken ?? "",
      token: row?.token ?? "",
      mfa,
      appSessionLogId: row?.appSessionLogId,
    },
  };
}
