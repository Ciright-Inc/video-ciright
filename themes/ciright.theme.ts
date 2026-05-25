import type { Theme } from "./theme.types";

export const cirightTheme: Theme = {
  name: "Ciright",

  colors: {
    primary: "#003087",
    primaryHover: "#004099",
    primaryActive: "#002070",
    primaryDisabled: "#b8c4d8",
    onPrimary: "#ffffff",
    textLink: "#003087",

    canvas: "#ffffff",
    canvasSoft: "#fafafa",
    surfaceCard: "#ffffff",
    surfaceSoft: "#e8eef8",
    surfaceStrong: "#f0f2f8",
    surfaceDark: "#001a4d",
    surfaceDarkElevated: "#002070",

    gradientSkyLight: "#d0e0ff",
    gradientSkyMid: "#a0bce8",

    hairline: "#c8d4e8",
    hairlineSoft: "#f0f4fb",
    hairlineStrong: "#c8d4ec",

    ink: "#003087",
    body: "#334155",
    muted: "#475569",
    mutedSoft: "#b8c4d8",
    onDark: "#ffffff",
    onDarkSoft: "#a8b8d0",

    warning: "#ab6400",
    success: "#16a34a",
    error: "#eb8e90",
  },

  typography: {
    fontSans: "'Inter', -apple-system, system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
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
    card: "0 4px 12px rgba(0, 48, 135, 0.06)",
  },
};
