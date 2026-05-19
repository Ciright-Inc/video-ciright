import { cirightTheme } from "./ciright.theme";
import { youtubeTheme } from "./youtube.theme";

export type ThemeKey = "ciright" | "youtube";

export const activeTheme: ThemeKey = "ciright";

export const themes = {
  ciright: cirightTheme,
  youtube: youtubeTheme,
} as const;

export const theme = themes[activeTheme];
