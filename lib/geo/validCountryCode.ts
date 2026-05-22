import alpha2Codes from "@/lib/geo/alpha2-to-numeric.json";

const VALID_CODES = new Set(Object.keys(alpha2Codes));

export function normalizeCountryCode(raw: string): string | null {
  const code = String(raw).trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  if (!VALID_CODES.has(code)) return null;
  return code;
}

export function isValidCountryCode(code: string): boolean {
  return normalizeCountryCode(code) !== null;
}

export function listCountryOptions(): { code: string; label: string }[] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return Array.from(VALID_CODES)
    .map((code) => ({
      code,
      label: names.of(code) ?? code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}
