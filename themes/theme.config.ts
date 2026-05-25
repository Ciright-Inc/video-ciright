import { cirightTheme } from "./ciright.theme";
import { keyraTheme } from "./keyra.theme";
import { youtubeTheme } from "./youtube.theme";

export type ThemeKey = "ciright" | "keyra" | "youtube";

export const activeTheme: ThemeKey = "keyra";

export const themes = {
  ciright: cirightTheme,
  keyra: keyraTheme,
  youtube: youtubeTheme,
} as const;

export const theme = themes[activeTheme];
