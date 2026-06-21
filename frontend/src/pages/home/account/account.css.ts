import { vars } from "$lib/app.css";
import {
  radius,
  spacingScale,
  textScale,
} from "$lib/design-system/design-system.css";
import { style } from "@vanilla-extract/css";

const accountBreakpoint = "42rem";
const accountModalWidth = "48rem";
const denseGap = "0.625rem";
const inlineGap = spacingScale.sm;
const sectionGap = "0.75rem";
const sectionRadius = "0.75rem";
const subtleDivider = vars.colors.dividerSubtle;
const warmTint = vars.colors.surfaceTint;
const interactiveLift = `background ${vars.transition.normal}, border-color ${vars.transition.normal}, box-shadow ${vars.transition.normal}, transform ${vars.transition.normal}`;

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

const accountSurface = style({
  padding: "0.875rem",
  borderRadius: sectionRadius,
  background: warmTint,
  border: "1px solid transparent",
});

const smallMutedText = style({
  color: vars.colors.muted,
  fontSize: textScale.xs,
});

const sectionTitleText = style({
  color: vars.colors.foreground,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.sm,
});

const uploadMediaButton = style({
  display: "inline-grid",
  placeItems: "center",
  flex: "0 0 auto",
  padding: 0,
  border: "1px solid transparent",
  cursor: "pointer",
  transition: interactiveLift,
  ":hover": {
    background: vars.colors.card,
    borderColor: vars.colors.border,
    boxShadow: `0 2px 0 0 ${vars.colors.border}`,
    transform: "translateY(-1px)",
  },
  ":active": {
    boxShadow: "none",
    transform: "translateY(0)",
  },
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: "2px",
    },
  },
});

export const account_avatar_button = style([
  uploadMediaButton,
  {
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: radius.pill,
    background: "transparent",
  },
]);

export const account_profile_meta = style({
  minWidth: 0,
  display: "grid",
  gap: "0.125rem",
  justifyItems: "start",
});

export const account_profile_name_wrap = style([
  editableUnderline,
  {
    display: "inline-grid",
    width: "fit-content",
    maxWidth: "100%",
  },
]);

export const account_profile_name_row = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  maxWidth: "100%",
});

export const account_profile_name_input = style([
  truncateText,
  {
    display: "inline-block",
    width: "fit-content",
    maxWidth: "100%",
    minHeight: "1.25em",
    padding: 0,
    border: "none",
    outline: "none",
    resize: "none",
    background: "transparent",
    fontFamily: vars.fonts.heading,
    boxSizing: "border-box",
    fieldSizing: "content",
  },
]);

export const account_profile_text = style([
  smallMutedText,
  truncateText,
  {
    margin: 0,
    lineHeight: 1.35,
  },
]);

export const account_role_icon = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  flex: "0 0 auto",
  transform: "translateY(-0.06em)",
  color: vars.colors.accent,
});

export const account_member_options = style({
  marginLeft: "auto",
  flex: "0 0 auto",
});

export const account_profile_actions = style({
  display: "flex",
  justifyContent: "flex-start",
  marginTop: sectionGap,
});

export const account_modal = style({
  width: `min(${accountModalWidth}, calc(100vw - 2rem))`,
  height: "min(30rem, calc(100vh - 2rem))",
  padding: "1rem",
  background: vars.colors.background,
  display: "grid",
  gridTemplateColumns: "8.75rem minmax(0, 1fr)",
  gap: "1rem",
  overflow: "hidden",
  "@media": {
    [`(max-width: ${accountBreakpoint})`]: {
      gridTemplateColumns: "1fr",
    },
  },
});

export const account_tab_list = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
  paddingRight: sectionGap,
  borderRight: `1px solid ${subtleDivider}`,
  "@media": {
    [`(max-width: ${accountBreakpoint})`]: {
      flexDirection: "row",
      paddingRight: 0,
      paddingBottom: sectionGap,
      borderRight: "none",
      borderBottom: `1px solid ${subtleDivider}`,
      overflowX: "auto",
    },
  },
});

export const account_tab_button = style({
  width: "100%",
  justifyContent: "flex-start",
  boxShadow: "none",
});

export const account_modal_body = style({
  minWidth: 0,
  overflow: "auto",
  padding: "0.125rem 0.25rem 0.25rem",
});

export const account_contribution_panel = style({
  display: "grid",
  gap: sectionGap,
  width: "min(100%, 28rem)",
});

export const account_modal_header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: sectionGap,
  marginBottom: "1rem",
});

export const account_modal_title = style({
  margin: 0,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.lg,
  lineHeight: 1.1,
});

export const account_section = style([
  accountSurface,
  {
    display: "flex",
    alignItems: "center",
    gap: sectionGap,
    minWidth: 0,
  },
]);

export const account_section_title = style([
  sectionTitleText,
  {
    margin: 0,
    lineHeight: 1.25,
  },
]);

export const account_org_logo_button = style([
  uploadMediaButton,
  {
    width: "3rem",
    height: "3rem",
    borderRadius: sectionRadius,
    background: vars.colors.primary,
    color: vars.colors.background,
    fontFamily: vars.fonts.heading,
    fontSize: textScale.xs,
    fontWeight: 700,
  },
]);

export const account_org_logo_image = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const account_billing_grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: denseGap,
  marginTop: denseGap,
  marginBottom: sectionGap,
  "@media": {
    [`(max-width: ${accountBreakpoint})`]: {
      gridTemplateColumns: "1fr",
    },
  },
});

export const account_metric = style([
  accountSurface,
  {
    display: "grid",
    gap: "0.375rem",
  },
]);

export const account_metric_label = smallMutedText;

export const account_metric_value = style({
  color: vars.colors.foreground,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.lg,
  fontWeight: 700,
});

export const account_table_tabs = style({
  display: "flex",
  gap: inlineGap,
  margin: `${sectionGap} 0 ${sectionGap}`,
});

export const account_table = style({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: textScale.xs,
});

export const account_table_cell = style({
  padding: `${denseGap} 0.375rem`,
  borderTop: `1px solid ${subtleDivider}`,
  color: vars.colors.foreground,
});

export const account_table_header = style({
  padding: "0 0.375rem 0.375rem",
  color: vars.colors.muted,
  fontSize: textScale.xs,
  fontWeight: 700,
  textAlign: "left",
  whiteSpace: "nowrap",
});

export const account_table_link = style({
  display: "inline",
  maxWidth: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  color: vars.colors.primary,
  font: "inherit",
  fontWeight: 700,
  textAlign: "left",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "0.15em",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const account_table_value = style([
  account_table_cell,
  {
    textAlign: "right",
    color: vars.colors.muted,
    fontFamily: vars.fonts.code,
    whiteSpace: "nowrap",
  },
]);
