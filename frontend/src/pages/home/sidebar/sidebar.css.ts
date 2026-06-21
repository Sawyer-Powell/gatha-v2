import { vars } from "$lib/app.css";
import {
  comboboxOptionContent,
  layer,
  popoverActionItem,
  popoverCheck,
  popoverItemSelected,
  radius,
  spacingScale,
  textScale,
} from "$lib/design-system/design-system.css";
import { style } from "@vanilla-extract/css";

const scrollFeather = `linear-gradient(to bottom, ${vars.colors.maskTransparent} 0, ${vars.colors.maskOpaque} var(--scroll-feather-top, 0px), ${vars.colors.maskOpaque} calc(100% - var(--scroll-feather-bottom, 0px)), ${vars.colors.maskTransparent} 100%)`;
const warmTint = vars.colors.surfaceTint;
const warmTintSelected = vars.colors.surfaceTintSelected;
const denseGap = "0.625rem";
const inlineGap = spacingScale.sm;
const sectionGap = "0.75rem";
const surfaceRadius = "0.875rem";
const stackedAvatarFontSize = "0.5rem";
const ownerAvatarOffset = "-0.42rem";
const statusDotSize = spacingScale.sm;

const truncateText = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const smallMutedText = style({
  color: vars.colors.muted,
  fontSize: textScale.xs,
});

export const sidebar_shell = style({
  position: "relative",
  width: "18.25rem",
  maxWidth: "18.25rem",
  flexShrink: 0,
  overflow: "visible",
  opacity: 1,
  transform: "translateX(0)",
  transition: `width ${vars.transition.slow}, max-width ${vars.transition.slow}, opacity ${vars.transition.normal}, transform ${vars.transition.slow}`,
});

export const sidebar_closed = style({
  width: 0,
  maxWidth: 0,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
  transform: `translateX(-${sectionGap})`,
});

export const sidebar_popover_open = style({
  zIndex: layer.popover,
});

export const sidebar_list = style({
  height: "100%",
  boxSizing: "border-box",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

export const sidebar_header = style({
  position: "relative",
  flex: "0 0 auto",
  padding: "0.625rem 0 0.25rem",
  background: vars.colors.background,
});

export const sidebar_header_controls = style({
  display: "flex",
  alignItems: "center",
  gap: 0,
  minWidth: 0,
  overflow: "visible",
});

export const sidebar_upload_action = style({
  display: "inline-flex",
  maxWidth: "11rem",
  marginRight: inlineGap,
  opacity: 1,
  overflow: "visible",
  clipPath: `inset(-${inlineGap} 0 -${inlineGap} 0)`,
  flexShrink: 0,
  transform: "translateX(0)",
  transition: `max-width ${vars.transition.normal}, margin-right ${vars.transition.normal}, opacity ${vars.transition.fast}, transform ${vars.transition.normal}`,
});

export const sidebar_upload_action_hidden = style({
  maxWidth: 0,
  marginRight: 0,
  opacity: 0,
  pointerEvents: "none",
  transform: "translateX(-0.375rem)",
});

export const sidebar_upload_content = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  whiteSpace: "nowrap",
});

export const sidebar_search_button = style({
  display: "inline-flex",
  marginRight: inlineGap,
  flex: "0 0 auto",
});

export const sidebar_filter_control = style({
  position: "relative",
  display: "inline-flex",
  marginRight: inlineGap,
  flex: "0 0 auto",
  overflow: "visible",
  maxWidth: "8rem",
  opacity: 1,
  transform: "translateX(0)",
  transition: `max-width ${vars.transition.normal}, margin-right ${vars.transition.normal}, opacity ${vars.transition.fast}, transform ${vars.transition.normal}`,
});

export const sidebar_filter_control_hidden = style({
  maxWidth: 0,
  marginRight: 0,
  opacity: 0,
  overflow: "hidden",
  pointerEvents: "none",
  transform: "translateX(-0.375rem)",
});

export const sidebar_filter_button_content = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  height: "1.25rem",
  lineHeight: 1,
  whiteSpace: "nowrap",
});

export const sidebar_filter_button = style({
  minWidth: "2.375rem",
  height: "2.375rem",
  minHeight: "2.375rem",
  boxSizing: "border-box",
});

export const sidebar_filter_avatar_stack = style({
  display: "inline-flex",
  alignItems: "center",
  height: "1.25rem",
  paddingLeft: "0.125rem",
});

export const sidebar_filter_avatar = style({
  width: "1.25rem",
  height: "1.25rem",
  fontSize: stackedAvatarFontSize,
  boxShadow: `0 0 0 1px ${vars.colors.background}`,
  selectors: {
    "& + &": {
      marginLeft: "-0.4rem",
    },
  },
});

export const sidebar_filter_panel = style({
  width: "14rem",
  display: "grid",
  gap: inlineGap,
  padding: inlineGap,
  borderRadius: surfaceRadius,
});

export const sidebar_filter_input = style({
  width: "100%",
  boxSizing: "border-box",
});

export const sidebar_filter_options = style({
  display: "grid",
  gap: "0.125rem",
});

export const sidebar_filter_option = style([
  popoverActionItem,
  {
    justifyContent: "space-between",
    padding: "0.375rem 0.45rem",
    margin: 0,
    width: "100%",
    fontSize: textScale.xs,
    border: "1px solid transparent",
    ":hover": {
      background: warmTint,
    },
  },
]);

export const sidebar_filter_option_selected = style([
  popoverItemSelected,
  {
    borderColor: vars.colors.primary,
    background: warmTintSelected,
  },
]);

export const sidebar_filter_check = popoverCheck;

export const sidebar_filter_profile = style([
  comboboxOptionContent,
  {
    overflow: "hidden",
  },
]);

export const sidebar_search_control = style({
  display: "inline-flex",
  minWidth: 0,
  flex: "1 1 auto",
});

export const sidebar_search_input = style({
  width: "100%",
  maxWidth: 0,
  opacity: 0,
  overflow: "hidden",
  pointerEvents: "none",
  flex: "1 1 auto",
  transform: "translateX(-0.375rem)",
  transition: `max-width ${vars.transition.normal}, opacity ${vars.transition.normal}, transform ${vars.transition.normal}, border-color ${vars.transition.normal}`,
});

export const sidebar_search_input_open = style({
  maxWidth: "14.5rem",
  opacity: 1,
  pointerEvents: "auto",
  transform: "translateX(0)",
});

export const sidebar_video_stack = style({
  paddingBottom: inlineGap,
});

export const sidebar_video_scroller = style({
  flex: "1 1 auto",
  minHeight: 0,
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  padding: `0.25rem ${denseGap} ${sectionGap} 0`,
  maskImage: scrollFeather,
  WebkitMaskImage: scrollFeather,
});

export const video_entry_content = style({
  width: "15.875rem",
  display: "grid",
  gridTemplateColumns: "3.5rem minmax(0, 1fr)",
  gap: denseGap,
  alignItems: "center",
  textAlign: "left",
});

export const video_thumbnail = style({
  position: "relative",
  display: "block",
  overflow: "visible",
  width: "3.5rem",
  aspectRatio: "16 / 9",
  boxSizing: "border-box",
  borderRadius: "0.45rem",
  border: `1px solid ${vars.colors.border}`,
  background: `linear-gradient(135deg, ${vars.colors.border}, ${vars.colors.card})`,
  boxShadow: vars.shadows.thumbnailInset,
});

export const video_owner_avatar = style({
  position: "absolute",
  top: ownerAvatarOffset,
  left: ownerAvatarOffset,
  transform: "rotate(-8deg)",
  boxShadow: `0 0 0 2px ${vars.colors.background}, ${vars.shadows.avatarLift}`,
});

export const video_entry_title = style([
  truncateText,
  {
    display: "block",
    minWidth: 0,
    fontSize: textScale.sm,
    fontWeight: 700,
    lineHeight: 1.25,
    minHeight: "1.25em",
  },
]);

export const video_date = style([
  smallMutedText,
  {
    display: "inline-flex",
    flex: "0 0 auto",
    lineHeight: 1.25,
  },
]);

export const sidebar_meta = style({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  minWidth: 0,
  paddingTop: "0.275rem",
  whiteSpace: "nowrap",
});

export const sidebar_status = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  flex: "0 0 auto",
  "::before": {
    content: "\"\"",
    width: statusDotSize,
    height: statusDotSize,
    borderRadius: radius.pill,
  },
});

export const sidebar_status_action = style({
  selectors: {
    "&::before": {
      background: vars.colors.accent,
      boxShadow: vars.shadows.accentGlow,
    },
  },
});

export const sidebar_status_error = style({
  selectors: {
    "&::before": {
      background: vars.colors.error,
      boxShadow: vars.shadows.errorGlow,
    },
  },
});
