import { vars } from "$lib/app.css";
import { style } from "@vanilla-extract/css";

export const signInPage = style({
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
});

export const signInContent = style({
  position: "relative",
  zIndex: 1,
});

export const signInError = style({
  color: vars.colors.error,
  fontSize: "0.8rem",
  margin: "0.25rem 0 0 0",
});

export const scrollingText = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  pointerEvents: "none",
  maskImage: `linear-gradient(135deg, transparent 0%, ${vars.colors.backdrop} 30%, ${vars.colors.backdrop} 70%, transparent 100%)`,
  WebkitMaskImage: `linear-gradient(135deg, transparent 0%, ${vars.colors.backdrop} 30%, ${vars.colors.backdrop} 70%, transparent 100%)`,
});

export const scrollingTextRow = style({
  whiteSpace: "nowrap",
  fontFamily: vars.fonts.code,
  fontSize: "1.5rem",
  lineHeight: 1.6,
  color: vars.colors.muted,
  opacity: 0.15,
  letterSpacing: "0.05em",
  willChange: "transform",
});
