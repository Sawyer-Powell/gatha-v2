import { vars } from "$lib/app.css";
import {
  textScale,
  videoFrame,
  videoPlayer,
} from "$lib/design-system/design-system.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const page = style({
  height: "100vh",
  display: "flex",
});

export const pageWrapper = style({
  padding: "1rem",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const hstack = style({
  flexGrow: 1,
  minHeight: 0,
  transition: `gap ${vars.transition.slow}`,
});

export const hstack_sidebar_closed = style({
  gap: 0,
});

export const top_bar = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  minHeight: "2.75rem",
});

export const top_bar_title = style({
  minWidth: 0,
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: vars.colors.foreground,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.lg,
  fontWeight: 700,
});

export const top_bar_actions = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexShrink: 0,
});

export const sidebar_shell = style({
  width: "18.25rem",
  maxWidth: "18.25rem",
  flexShrink: 0,
  overflowX: "hidden",
  overflowY: "visible",
  opacity: 1,
  transform: "translateX(0)",
  transition: `width ${vars.transition.slow}, max-width ${vars.transition.slow}, opacity ${vars.transition.normal}, transform ${vars.transition.slow}`,
});

export const sidebar_closed = style({
  width: 0,
  maxWidth: 0,
  opacity: 0,
  pointerEvents: "none",
  transform: "translateX(-0.75rem)",
});

export const sidebar_list = style({
  paddingTop: "0.25rem",
});

export const video_entry_content = style({
  width: "17rem",
  display: "grid",
  gridTemplateColumns: "4.5rem minmax(0, 1fr)",
  gap: "0.75rem",
  alignItems: "center",
  textAlign: "left",
});

export const video_thumbnail = style({
  width: "4.5rem",
  aspectRatio: "16 / 10",
  borderRadius: "0.5rem",
  border: `1px solid ${vars.colors.border}`,
  background: `linear-gradient(135deg, ${vars.colors.border}, ${vars.colors.card})`,
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.35)",
});

export const video_entry_title = style({
  display: "block",
  minWidth: 0,
  fontSize: textScale.sm,
  fontWeight: 700,
  lineHeight: 1.25,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const video_date = style({
  display: "block",
  color: vars.colors.muted,
  fontSize: textScale.xs,
  lineHeight: 1.25,
  paddingTop: "0.25rem",
});

export const workspace_query = style({
  flexGrow: 1,
  minWidth: 0,
  height: "100%",
  containerType: "inline-size",
});

export const workspace = style({
  minWidth: 0,
  height: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gridTemplateAreas: '"video" "transcription"',
  gap: "1.25rem",
  alignItems: "stretch",
  alignContent: "stretch",
  transition: `gap ${vars.transition.slow}`,
  "@container": {
    "(min-width: 48rem)": {
      gridTemplateColumns: "minmax(22rem, 1fr) minmax(24rem, 32rem)",
      gridTemplateRows: "minmax(0, 1fr)",
      gridTemplateAreas: '"transcription video"',
    },
  },
});

export const content = style({
  background: vars.colors.card,
  gridArea: "transcription",
  height: "100%",
  borderRadius: "1rem",
  minWidth: 0,
});

export const contentWrapper = style({
  padding: "1.25rem",
  height: "100%",
  boxSizing: "border-box",
});

export const transcription_panel = style({
  minWidth: 0,
});

export const video_panel = style({
  gridArea: "video",
  minWidth: 0,
  display: "grid",
  alignContent: "start",
  alignSelf: "start",
});

globalStyle(`${video_panel} ${videoPlayer}`, {
  maxWidth: "min(44rem, calc(88.888vh - 18.666rem))",
  justifySelf: "center",
});

globalStyle(`${video_panel} ${videoFrame}`, {
  maxHeight: "none",
});

globalStyle(`${video_panel} ${videoPlayer}`, {
  "@container": {
    "(min-width: 48rem)": {
      maxWidth: "100%",
    },
  },
});
