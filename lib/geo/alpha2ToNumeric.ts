import mapping from "./alpha2-to-numeric.json";

const ALPHA2_TO_NUMERIC = mapping as Record<string, string>;

/** ISO 3166-1 alpha-2 → numeric id used by world-atlas TopoJSON. */
export function alpha2ToNumeric(code: string): string | null {
  const upper = code.toUpperCase();
  if (upper === "XX") return null;
  return ALPHA2_TO_NUMERIC[upper] ?? null;
}
