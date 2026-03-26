import { createTheme, keyframes, style } from "@vanilla-extract/css";

export const [lightTheme, vars] = createTheme({
  colors: {
    background: "#fbf1c7",
    foreground: "#3c3836",
    primary: "#d65d0e",
    secondary: "#cc241d",
    success: "#98971a",
    error: "#cc241d",
    warning: "#d79921",
    card: "#f9f5d7",
    muted: "#928374",
    border: "#d5c4a1",
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

export const gradientBackground = style({
  background: `linear-gradient(135deg, ${vars.colors.background} 0%, ${vars.colors.card} 40%, ${vars.colors.border} 100%)`,
  minHeight: "100vh",
});
