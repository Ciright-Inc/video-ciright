import type { Theme } from "./theme.types";

export const youtubeTheme: Theme = {
  name: "YouTube Dark",
  productName: "YouTube",

  colors: {
    primary: "#ff0000",
    primaryHover: "#cc0000",
    primaryActive: "#990000",
    primaryDisabled: "#ff9999",
    onPrimary: "#ffffff",
    textLink: "#3ea6ff",

    canvas: "#0f0f0f",
    canvasSoft: "#181818",
    surfaceCard: "#212121",
    surfaceSoft: "#272727",
    surfaceStrong: "#3f3f3f",
    surfaceDark: "#0f0f0f",
    surfaceDarkElevated: "#1a1a1a",

    gradientSkyLight: "#272727",
    gradientSkyMid: "#1a1a1a",

    hairline: "#3f3f3f",
    hairlineSoft: "#303030",
    hairlineStrong: "#525252",

    ink: "#f1f1f1",
    body: "#aaaaaa",
    muted: "#717171",
    mutedSoft: "#606060",
    onDark: "#ffffff",
    onDarkSoft: "#aaaaaa",

    warning: "#f9a825",
    success: "#2ba640",
    error: "#ff4e45",
  },

  typography: {
    fontSans: "'Roboto', -apple-system, system-ui, sans-serif",
    fontMono: "'Roboto Mono', monospace",
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
    card: "0 4px 12px rgba(0, 0, 0, 0.4)",
  },
};
