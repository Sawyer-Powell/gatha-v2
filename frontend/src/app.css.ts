import { createTheme, globalStyle, keyframes, style } from "@vanilla-extract/css";

export const [lightTheme, vars] = createTheme({
  colors: {
    background: "#fbf1c7",
    foreground: "#3c3836",
    primary: "#d65d0e",
    primaryShadow: "#af4b0b",
    secondary: "#cc241d",
    accent: "#458588",
    success: "#98971a",
    error: "#cc241d",
    warning: "#d79921",
    card: "#f9f5d7",
    muted: "#928374",
    border: "#d5c4a1",
    surfaceTint: "rgba(242, 229, 188, 0.42)",
    surfaceTintSelected: "rgba(242, 229, 188, 0.64)",
    surfaceTintSolid: "rgba(242, 229, 188, 0.96)",
    fieldTint: "rgba(249, 245, 215, 0.72)",
    chromeTint: "rgba(249, 245, 215, 0.94)",
    dividerSubtle: "rgba(213, 196, 161, 0.55)",
    backdrop: "rgba(0, 0, 0, 0.4)",
    transparentWarmTint: "rgba(242, 229, 188, 0)",
    switchThumb: "#ffffff",
    maskOpaque: "#000000",
    maskTransparent: "rgba(0, 0, 0, 0)",
  },
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.06)",
    popover: "0 4px 16px rgba(0, 0, 0, 0.1)",
    modal: "0 1rem 3rem rgba(0, 0, 0, 0.2)",
    chrome: "0 1rem 2.5rem rgba(60, 56, 54, 0.18)",
    thumbnailInset: "inset 0 0 0 1px rgba(255, 255, 255, 0.35)",
    avatarLift: "0 2px 4px rgba(60, 56, 54, 0.24)",
    rangeThumb: "0 1px 3px rgba(0, 0, 0, 0.2)",
    accentGlow: "0 0 0 0.2rem rgba(69, 133, 136, 0.14), 0 0 0.55rem rgba(69, 133, 136, 0.42)",
    errorGlow: "0 0 0 0.2rem rgba(204, 36, 29, 0.12), 0 0 0.55rem rgba(204, 36, 29, 0.38)",
  },
  fonts: {
    logo: "Fredoka, sans-serif",
    heading: "Nunito, sans-serif",
    prose: "Inter, sans-serif",
    code: "JetBrains Mono, monospace",
  },
  transition: {
    fast: "0.1s ease",
    normal: "0.15s ease",
    slow: "0.25s ease",
  },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const body = style({
  fontFamily: vars.fonts.prose,
  background: vars.colors.background,
  color: vars.colors.foreground,
  minHeight: "100vh",
  animation: `${fadeIn} ${vars.transition.slow}`,
});

globalStyle("*, *::before, *::after", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.01ms",
      animationIterationCount: "1",
      scrollBehavior: "auto",
      transitionDuration: "0.01ms",
    },
  },
});
