import { vars } from "$lib/app.css";
import { textScale } from "$lib/design-system/design-system.css";
import { style } from "@vanilla-extract/css";

export const page = style({
  height: "100vh",
  display: "flex",
});

export const pageWrapper = style({
  padding: "1rem",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
});

export const hstack = style({
  flexGrow: 1,
});

export const video_date = style({
  color: vars.colors.muted,
  fontSize: textScale.xs,
  textAlign: "right",
  paddingRight: "1.1rem",
  paddingTop: "0.125rem",
});

export const content = style({
  background: vars.colors.card,
  flexGrow: 1,
  height: "100%",
  borderRadius: "1rem",
});

export const contentWrapper = style({
  padding: "1.25rem",
});
