import { vars } from "$lib/app.css";
import {
  breakpoint,
  control,
  radius,
  spacingScale,
  textScale,
} from "$lib/design-system/design-system.css";
import { keyframes, style } from "@vanilla-extract/css";

const scrollFeather = `linear-gradient(to bottom, ${vars.colors.maskTransparent} 0, ${vars.colors.maskOpaque} var(--scroll-feather-top, 0px), ${vars.colors.maskOpaque} calc(100% - var(--scroll-feather-bottom, 0px)), ${vars.colors.maskTransparent} 100%)`;
const warmTint = vars.colors.surfaceTint;
const warmTintSolid = vars.colors.surfaceTintSolid;
const fieldTint = vars.colors.fieldTint;
const compactMetaBreakpoint = "34rem";
const wideWorkspaceBreakpoint = breakpoint.workbench;
const mobileBreakpoint = breakpoint.mobile;
const inlineGap = spacingScale.sm;
const sectionGap = "0.75rem";
const denseGap = "0.625rem";
const surfaceRadius = "0.875rem";
const wideActionPanelWidth = "44rem";
const transcriptProgressHeight = "1.5rem";
const transcriptBlockPadding = `${sectionGap} 2.5rem ${sectionGap} ${sectionGap}`;

const truncateText = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const editableUnderline = style({
  cursor: "text",
  borderBottom: "1px solid transparent",
  transition: `border-color ${vars.transition.normal}`,
  ":hover": {
    borderBottomColor: vars.colors.border,
  },
  ":focus": {
    borderBottomColor: vars.colors.primary,
  },
  ":focus-within": {
    borderBottomColor: vars.colors.primary,
  },
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
    [`(max-width: ${mobileBreakpoint})`]: {
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
  background: warmTint,
  borderRadius: surfaceRadius,
  height: "100%",
  minWidth: 0,
  overflow: "hidden",
});

export const action_panel = style({
  width: "min(100%, 34rem)",
  height: "100%",
  minHeight: 0,
  margin: "0 auto",
  boxSizing: "border-box",
  color: vars.colors.foreground,
  position: "relative",
  overflow: "hidden",
});

export const action_panel_scroller = style({
  height: "100%",
  minHeight: 0,
  padding: "1.5rem",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
  gap: surfaceRadius,
  overflow: "auto",
  scrollPadding: "1rem",
  selectors: {
    "&::before": {
      content: "",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "var(--scroll-feather-top, 0px)",
      zIndex: 1,
      pointerEvents: "none",
      background: `linear-gradient(${warmTintSolid}, ${vars.colors.transparentWarmTint})`,
    },
    "&::after": {
      content: "",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "var(--scroll-feather-bottom, 0px)",
      zIndex: 1,
      pointerEvents: "none",
      background: `linear-gradient(${vars.colors.transparentWarmTint}, ${warmTintSolid})`,
    },
  },
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      padding: "1rem",
    },
  },
});

export const action_panel_scroller_item = style({
  flexShrink: 0,
});

export const action_panel_upload = style({
  width: `min(100%, ${wideActionPanelWidth})`,
});

export const action_panel_scroller_upload = style({
  padding: "1rem",
  gap: denseGap,
});

export const action_panel_title = style({
  margin: 0,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.lg,
  lineHeight: 1.15,
});

export const action_section_start = style({
  marginTop: "1.1875rem",
});

export const action_panel_body = style({
  margin: 0,
  color: vars.colors.muted,
  fontSize: textScale.sm,
  lineHeight: 1.55,
});

export const action_panel_actions = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: denseGap,
  paddingTop: "0.25rem",
});

export const prompt_field = style({
  width: "100%",
  minHeight: "7rem",
  boxSizing: "border-box",
  border: `1px solid ${vars.colors.border}`,
  borderRadius: spacingScale.sm,
  background: fieldTint,
  color: vars.colors.foreground,
  fontFamily: vars.fonts.prose,
  fontSize: textScale.sm,
  lineHeight: 1.5,
  padding: sectionGap,
  resize: "vertical",
  outline: "none",
  ":focus": {
    borderColor: vars.colors.primary,
  },
});

export const email_toggle = style({
  display: "inline-flex",
  alignItems: "center",
  gap: inlineGap,
  color: vars.colors.foreground,
  fontSize: textScale.sm,
  fontWeight: 700,
});

export const contentWrapper = style({
  padding: "1rem",
  height: "100%",
  width: "100%",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateAreas: '"video" "transcription"',
  gridTemplateRows: "minmax(14rem, auto) minmax(0, 1fr)",
  gap: "1rem",
  overflow: "hidden",
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      padding: denseGap,
      gap: surfaceRadius,
    },
  },
  "@container": {
    [`(min-width: ${wideWorkspaceBreakpoint})`]: {
      width: "min(100%, 94rem)",
      margin: "0 auto",
      gridTemplateAreas: '"transcription video"',
      gridTemplateColumns: "minmax(28rem, 1fr) minmax(14rem, 1fr)",
      gridTemplateRows: "minmax(0, 1fr)",
      alignItems: "start",
      justifyContent: "center",
    },
  },
});

export const transcription_panel_shell = style({
  gridArea: "transcription",
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  maxWidth: "46rem",
  display: "flex",
  flexDirection: "column",
  gap: inlineGap,
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      width: "100%",
    },
  },
  "@container": {
    [`(min-width: ${wideWorkspaceBreakpoint})`]: {
      height: "100%",
      boxSizing: "border-box",
    },
  },
});

export const transcription_toolbar = style({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: inlineGap,
  minWidth: 0,
  padding: "0.25rem 0 0",
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      padding: "0.25rem 0 0",
      gap: "0.375rem",
    },
  },
});

export const transcription_search_input = style({
  width: "100%",
  minWidth: 0,
  flex: "1 1 auto",
});

export const transcription_focus_label = style({
  display: "inline-flex",
  alignItems: "center",
  gap: inlineGap,
  flex: "0 0 auto",
  minWidth: 0,
});

export const transcription_focus_input = style({
  width: "4rem",
  height: control.height,
  minWidth: 0,
  padding: `0.375rem ${inlineGap}`,
  boxSizing: "border-box",
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.pill,
  outline: "none",
  background: vars.colors.background,
  color: vars.colors.foreground,
  fontFamily: vars.fonts.code,
  fontSize: textScale.sm,
  fontWeight: 400,
  textAlign: "center",
  transition: `border-color ${vars.transition.normal}`,
  ":focus": {
    borderColor: vars.colors.primary,
  },
});

export const transcription_focus_count = style({
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.sm,
  whiteSpace: "nowrap",
});

export const transcription_panel = style({
  minWidth: 0,
  minHeight: 0,
  flex: "1 1 auto",
  padding: "0.25rem 0",
  overflow: "auto",
  maskImage: scrollFeather,
  WebkitMaskImage: scrollFeather,
  display: "flex",
  flexDirection: "column",
  gap: inlineGap,
  scrollPadding: inlineGap,
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      padding: "0.25rem 0",
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
  padding: transcriptBlockPadding,
  boxSizing: "border-box",
  textAlign: "left",
});

export const transcription_index = style({
  position: "absolute",
  top: sectionGap,
  right: sectionGap,
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.xs,
  fontWeight: 600,
});

export const transcription_meta = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: inlineGap,
});

export const transcription_time = style({
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.xs,
});

export const transcription_text = style({
  margin: `${inlineGap} 0 0`,
  color: vars.colors.foreground,
  fontSize: textScale.sm,
  fontWeight: 400,
  lineHeight: 1.55,
});

export const transcription_textarea = style([
  editableUnderline,
  {
    display: "block",
    width: "auto",
    maxWidth: "100%",
    minHeight: "1.55em",
    padding: "0 0 0.0625rem",
    borderTop: "none",
    borderRight: "none",
    borderLeft: "none",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    background: "transparent",
    fontFamily: vars.fonts.prose,
    boxSizing: "border-box",
  },
]);

const transcriptionProgressIn = keyframes({
  from: { opacity: 0, height: 0, marginTop: 0, transform: "scaleX(0.96)" },
  to: { opacity: 1, height: transcriptProgressHeight, marginTop: inlineGap, transform: "scaleX(1)" },
});

const transcriptionProgressOut = keyframes({
  from: { opacity: 1, height: transcriptProgressHeight, marginTop: inlineGap, transform: "scaleX(1)" },
  to: { opacity: 0, height: 0, marginTop: 0, transform: "scaleX(0.96)" },
});

export const transcription_progress_shell = style({
  gridColumn: "1 / -1",
  height: transcriptProgressHeight,
  marginTop: inlineGap,
  padding: `0 ${inlineGap}`,
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
  width: "100%",
  display: "grid",
  gap: denseGap,
  alignItems: "center",
  justifyItems: "center",
  minHeight: "14rem",
  "@container": {
    [`(min-width: ${wideWorkspaceBreakpoint})`]: {
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
    [`(min-width: ${wideWorkspaceBreakpoint})`]: {
      width: "100%",
      justifySelf: "start",
    },
    "(max-width: 38rem)": {
      width: "100%",
    },
  },
});

export const video_frame_layout = style({
  maxHeight: "none",
});

export const video_meta = style({
  width: "min(100%, 40rem)",
  display: "flex",
  alignItems: "center",
  gap: sectionGap,
  justifySelf: "center",
  overflow: "hidden",
  color: vars.colors.muted,
  "@container": {
    [`(min-width: ${wideWorkspaceBreakpoint})`]: {
      width: "100%",
      justifySelf: "start",
    },
    [`(max-width: ${compactMetaBreakpoint})`]: {
      flexWrap: "wrap",
      gap: `0.375rem ${denseGap}`,
    },
  },
});

export const video_meta_profile = style({
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  minWidth: 0,
  flex: "1 1 auto",
});

export const video_meta_fact = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  flex: "0 0 auto",
  color: vars.colors.muted,
});

export const video_meta_value = style([
  truncateText,
  {
    display: "block",
    minWidth: 0,
    color: "currentColor",
    fontSize: textScale.xs,
    fontWeight: 700,
    lineHeight: 1.25,
  },
]);
