import { vars } from "$lib/app.css";
import { textScale } from "$lib/design-system/design-system.css";
import { keyframes, style } from "@vanilla-extract/css";

export const page = style({
  height: "100vh",
  display: "flex",
  overflow: "hidden",
});

export const pageWrapper = style({
  padding: "1rem",
  paddingBottom: "5.75rem",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "hidden",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  "@media": {
    "(max-width: 48rem)": {
      padding: "0.625rem",
      paddingBottom: "5.5rem",
      gap: "0.625rem",
    },
  },
});

export const hstack = style({
  flexGrow: 1,
  minWidth: 0,
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
  flexShrink: 1,
  minWidth: 0,
  height: "100%",
  containerType: "inline-size",
});

export const workspace_query_sidebar_open = style({
  "@media": {
    "(max-width: 48rem)": {
      flexShrink: 0,
      minWidth: "calc(100vw - 1.25rem)",
    },
  },
});

export const workspace = style({
  minWidth: 0,
  height: "100%",
  display: "block",
});

export const content = style({
  background: "rgba(249, 245, 215, 0.48)",
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
});

export const contentWrapper = style({
  padding: "1.25rem",
  height: "100%",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateAreas: '"video" "transcription"',
  gridTemplateRows: "minmax(14rem, auto) minmax(0, 1fr)",
  gap: "1.25rem",
  overflow: "hidden",
  "@media": {
    "(max-width: 48rem)": {
      padding: "0.625rem",
      gap: "0.875rem",
    },
  },
  "@container": {
    "(min-width: 36rem)": {
      gridTemplateAreas: '"transcription video"',
      gridTemplateColumns: "minmax(0, 46rem) clamp(16rem, 34%, 24rem)",
      gridTemplateRows: "minmax(0, 1fr)",
      alignItems: "start",
      justifyContent: "center",
    },
  },
});

export const transcription_panel = style({
  gridArea: "transcription",
  minWidth: 0,
  minHeight: 0,
  width: "min(100%, 46rem)",
  padding: "0.5rem 1rem",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  scrollPadding: "0.75rem",
  "@media": {
    "(max-width: 48rem)": {
      width: "100%",
      padding: "0.25rem 0.375rem",
    },
  },
  "@container": {
    "(min-width: 36rem)": {
      height: "100%",
      boxSizing: "border-box",
    },
  },
});

export const transcription_block = style({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  gap: 0,
  alignItems: "start",
  justifyContent: "stretch",
  padding: "0.875rem 2.75rem 0.875rem 0.875rem",
  boxSizing: "border-box",
  textAlign: "left",
});

export const transcription_index = style({
  position: "absolute",
  top: "0.875rem",
  right: "0.875rem",
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.xs,
  fontWeight: 600,
});

export const transcription_meta = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const transcription_time = style({
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.xs,
});

export const transcription_text = style({
  margin: "0.5rem 0 0",
  color: vars.colors.foreground,
  fontSize: textScale.sm,
  fontWeight: 400,
  lineHeight: 1.55,
});

export const transcription_textarea = style({
  display: "block",
  width: "100%",
  minHeight: "1.55em",
  padding: 0,
  border: "none",
  outline: "none",
  resize: "none",
  overflow: "hidden",
  background: "transparent",
  fontFamily: vars.fonts.prose,
  boxSizing: "border-box",
  fieldSizing: "content",
});

const transcriptionProgressIn = keyframes({
  from: { opacity: 0, height: 0, marginTop: 0, transform: "scaleX(0.96)" },
  to: { opacity: 1, height: "1.5rem", marginTop: "0.5rem", transform: "scaleX(1)" },
});

const transcriptionProgressOut = keyframes({
  from: { opacity: 1, height: "1.5rem", marginTop: "0.5rem", transform: "scaleX(1)" },
  to: { opacity: 0, height: 0, marginTop: 0, transform: "scaleX(0.96)" },
});

export const transcription_progress_shell = style({
  gridColumn: "1 / -1",
  height: "1.5rem",
  marginTop: "0.5rem",
  padding: "0 0.5rem",
  overflow: "visible",
  transformOrigin: "left center",
  animation: `${transcriptionProgressIn} ${vars.transition.slow}`,
});

export const transcription_progress_exit = style({
  pointerEvents: "none",
  animation: `${transcriptionProgressOut} ${vars.transition.slow} forwards`,
});

export const video_stage = style({
  gridArea: "video",
  minWidth: 0,
  display: "grid",
  alignItems: "center",
  justifyItems: "center",
  minHeight: "14rem",
  "@container": {
    "(min-width: 36rem)": {
      minHeight: 0,
      alignItems: "start",
      justifyItems: "start",
      paddingTop: "0.25rem",
    },
  },
});

export const video_player_layout = style({
  width: "min(100%, 40rem)",
  justifySelf: "center",
  "@container": {
    "(min-width: 36rem)": {
      width: "100%",
      justifySelf: "start",
    },
    "(max-width: 38rem)": {
      width: "100%",
    },
  },
});

export const video_frame_layout = style({
  maxHeight: "min(42vh, 28rem)",
  "@container": {
    "(min-width: 36rem)": {
      maxHeight: "min(28vh, 18rem)",
    },
  },
});
