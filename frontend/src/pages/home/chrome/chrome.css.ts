import { vars } from "$lib/app.css";
import {
  spacingScale,
  textScale,
} from "$lib/design-system/design-system.css";
import { style } from "@vanilla-extract/css";

const inlineGap = spacingScale.sm;
const sectionGap = "0.75rem";

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

export const top_bar = style({
  display: "flex",
  alignItems: "center",
  gap: sectionGap,
  minHeight: "2.75rem",
});

export const top_bar_title = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: vars.colors.foreground,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.lg,
  fontWeight: 700,
});

export const top_bar_title_group = style({
  minWidth: 0,
  flex: "1 1 auto",
  display: "flex",
  alignItems: "center",
  gap: inlineGap,
});

export const top_bar_title_stack = style({
  minWidth: 0,
  display: "grid",
  gap: "0.125rem",
});

export const top_bar_title_input = style([
  editableUnderline,
  {
    display: "block",
    width: "auto",
    maxWidth: "100%",
    minHeight: "1.4em",
    maxHeight: "1.4em",
    margin: 0,
    padding: "0 0 0.0625rem",
    borderTop: "none",
    borderRight: "none",
    borderLeft: "none",
    outline: "none",
    resize: "none",
    background: "transparent",
    flex: "0 1 auto",
    lineHeight: 1.4,
    boxSizing: "border-box",
    fieldSizing: "content",
  },
]);

export const top_bar_actions = style({
  display: "flex",
  alignItems: "center",
  gap: inlineGap,
  flexShrink: 0,
});

export const account_top_button = style({
  position: "relative",
  overflow: "visible",
});

export const account_top_content = style({
  display: "inline-grid",
  placeItems: "center",
  transition: `opacity ${vars.transition.normal}`,
  selectors: {
    [`${account_top_button}:hover &`]: {
      opacity: 0,
    },
    [`${account_top_button}:focus-visible &`]: {
      opacity: 0,
    },
  },
});

export const account_top_settings_icon = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: vars.colors.foreground,
  opacity: 0,
  transition: `opacity ${vars.transition.normal}`,
  selectors: {
    [`${account_top_button}:hover &`]: {
      opacity: 1,
    },
    [`${account_top_button}:focus-visible &`]: {
      opacity: 1,
    },
  },
});
