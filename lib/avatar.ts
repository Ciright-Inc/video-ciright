const AVATAR_COLORS = [
  { bg: "#e53935", text: "#ffffff" },
  { bg: "#8e24aa", text: "#ffffff" },
  { bg: "#3949ab", text: "#ffffff" },
  { bg: "#1e88e5", text: "#ffffff" },
  { bg: "#00897b", text: "#ffffff" },
  { bg: "#43a047", text: "#ffffff" },
  { bg: "#f4511e", text: "#ffffff" },
  { bg: "#6d4c41", text: "#ffffff" },
  { bg: "#546e7a", text: "#ffffff" },
  { bg: "#c2185b", text: "#ffffff" },
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAvatarLetter(name?: string | null): string {
  const trimmed = (name ?? "?").trim();
  return (trimmed[0] ?? "?").toUpperCase();
}

export function getAvatarColor(name?: string | null): {
  bg: string;
  text: string;
} {
  const key = (name ?? "?").trim().toLowerCase() || "?";
  return AVATAR_COLORS[hashString(key) % AVATAR_COLORS.length];
}
