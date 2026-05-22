function stripIpv6Brackets(ip: string): string {
  if (ip.startsWith("[") && ip.includes("]")) {
    return ip.slice(1, ip.indexOf("]"));
  }
  return ip;
}

import { isPrivateOrLoopbackIp } from "@/lib/geo/countryFromIp";

function withoutPort(ip: string): string {
  if (ip.includes(":") && ip.includes(".")) {
    // IPv4 with port, e.g. 203.0.113.1:8080
    return ip.slice(0, ip.lastIndexOf(":"));
  }
  return ip;
}

function parseIp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const ip = withoutPort(stripIpv6Brackets(trimmed));
  return ip.length > 0 ? ip : null;
}

/** IPs from a comma-separated forwarded chain (client may not be first hop). */
function ipsFromForwardedChain(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => parseIp(part))
    .filter((ip): ip is string => ip != null);
}

/** First public routable IP in a header value, or the first IP if none are public. */
function bestIpFromHeader(raw: string): string | null {
  const ips = ipsFromForwardedChain(raw);
  if (ips.length === 0) return null;
  return ips.find((ip) => !isPrivateOrLoopbackIp(ip)) ?? ips[0];
}

/** Client IP from common proxy / CDN headers. */
export function clientIpFromRequest(request: Request): string | null {
  const singleValueHeaders = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("x-real-ip"),
  ];

  for (const raw of singleValueHeaders) {
    if (!raw) continue;
    const ip = bestIpFromHeader(raw) ?? parseIp(raw);
    if (ip) return ip;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = bestIpFromHeader(forwarded);
    if (ip) return ip;
  }

  return null;
}
