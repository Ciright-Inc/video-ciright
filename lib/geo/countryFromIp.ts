import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|169\.254\.)/;
const PRIVATE_IPV6 =
  /^(::1|::|fc|fd|fe80:|::ffff:127\.)/i;

export function isPrivateOrLoopbackIp(ip: string): boolean {
  if (PRIVATE_IPV4.test(ip)) return true;
  if (PRIVATE_IPV6.test(ip)) return true;
  if (ip === "localhost") return true;
  return false;
}

/** ISO 3166-1 alpha-2 from IP via bundled GeoLite data, or null when unknown/private. */
export function countryFromIp(ip: string): string | null {
  if (isPrivateOrLoopbackIp(ip)) return null;

  try {
    const geoip = require("geoip-lite") as {
      lookup: (addr: string) => { country?: string } | null;
    };
    const lookup = geoip.lookup(ip);
    const code = lookup?.country?.toUpperCase();
    if (!code || code.length !== 2 || code === "XX") return null;
    return code;
  } catch {
    return null;
  }
}
