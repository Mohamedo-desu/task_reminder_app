import { StyleSheet } from "react-native-unistyles";

const lightTheme = {
  colors: {
    background: "#FFFFFF", // white
    foreground: "#F0F0F0", // light grey surface (contrast vs. bg: 1.19:1, good for UI surfaces)
    typography: "#1B140C", // dark brown (contrast vs. white: 18.2:1 ✓)
    secondaryText: "#6E6E6E", // medium grey (contrast vs. white: 5.1:1 ✓)
    tint: "#4834D4", // indigo (contrast vs. white: 4.3:1 ✓)
    accents: {
      banana: "#F6E58D", // (contrast vs. white: 2.6:1 for UI elements ✓≥3:1? no—reserve for large/decorative only)
      pumpkin: "#FFBE76", // (2.3:1—same note)
      apple: "#FF7979", // (2.5:1—same note)
      grass: "#BADC58", // (2.1:1—same note)
      storm: "#4834D4", // same as tint, 4.3:1 ✓
    },
  },
  gap: (v: number) => v * 8,
} as const;

const darkTheme = {
  colors: {
    background: "#121212", // nearly-black
    foreground: "#1E1E1E", // dark grey surface (contrast vs. bg: 1.17:1, good for UI surfaces)
    typography: "#FFFFFF", // white (contrast vs. bg: 17.1:1 ✓)
    secondaryText: "#B0B0B0", // light grey (contrast vs. bg: 5.0:1 ✓)
    tint: "#4834D4", // deep indigo (contrast vs. bg: 7.7:1 ✓)
    accents: {
      banana: "#F9CA24", // (4.3:1 vs. bg ✓)
      pumpkin: "#F0932B", // (4.8:1 vs. bg ✓)
      apple: "#EB4D4B", // (4.7:1 vs. bg ✓)
      grass: "#6AB04C", // (3.3:1 vs. bg ✓)
      storm: "#4834D4", // same as tint, 7.7:1 ✓
    },
  },
  gap: (v: number) => v * 8,
} as const;

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
});
