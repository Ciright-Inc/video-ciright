import type { Theme } from "./theme.types";

/** Tokens from keyra_theme.md — solid fills, no brand gradients. */
export const keyraTheme: Theme = {
  name: "Keyra",

  colors: {
    primary: "#000000",
    primaryHover: "#1a1a1a",
    primaryActive: "#1a1a1a",
    primaryDisabled: "#cccccc",
    onPrimary: "#ffffff",
    textLink: "#0d74ce",

    canvas: "#ffffff",
    canvasSoft: "#fafafa",
    surfaceCard: "#ffffff",
    surfaceSoft: "#f0f0f3",
    surfaceStrong: "#f0f0f3",
    surfaceDark: "#171717",
    surfaceDarkElevated: "#262626",

    gradientSkyLight: "#f0f0f3",
    gradientSkyMid: "#e2e4e8",

    hairline: "#f0f0f3",
    hairlineSoft: "#f5f5f7",
    hairlineStrong: "#dcdee0",

    ink: "#171717",
    body: "#60646c",
    muted: "#999999",
    mutedSoft: "#cccccc",
    onDark: "#ffffff",
    onDarkSoft: "#cccccc",

    warning: "#ab6400",
    success: "#16a34a",
    error: "#dc2626",
  },

  typography: {
    fontSans: "'Inter', -apple-system, system-ui, sans-serif",
    fontMono: "ui-monospace, 'JetBrains Mono', monospace",
  },

  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "9999px",
  },

  shadow: {
    card: "0 4px 12px rgba(0, 0, 0, 0.04)",
  },
};
