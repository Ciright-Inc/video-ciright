import { clientIpFromRequest } from "@/lib/geo/clientIpFromRequest";
import { countryFromIp } from "@/lib/geo/countryFromIp";

const COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
  "x-geo-country",
] as const;

function normalizeCountryHeader(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  if (code.length === 2 && code !== "XX") return code;
  return null;
}

/** ISO 3166-1 alpha-2 from edge/CDN headers or IP lookup; XX when unknown. */
export function countryFromRequest(request: Request): string {
  for (const name of COUNTRY_HEADERS) {
    const raw = request.headers.get(name);
    if (raw) {
      const code = normalizeCountryHeader(raw);
      if (code) return code;
    }
  }

  const dev = process.env.DEV_GEO_COUNTRY;
  if (dev) {
    const code = normalizeCountryHeader(dev);
    if (code) return code;
  }

  const ip = clientIpFromRequest(request);
  if (ip) {
    const fromIp = countryFromIp(ip);
    if (fromIp) return fromIp;
  }

  return "XX";
}
