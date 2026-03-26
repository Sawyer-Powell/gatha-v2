import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../app.css";

// Base tokens
const radius = {
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
  pill: "9999px",
};

const spacingScale = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2.25rem",
};

// Layout
export const hstack = style({
  display: "flex",
  position: "relative",
  flexDirection: "row",
  alignItems: "center",
});

export const vstack = style({
  display: "flex",
  flexDirection: "column",
});

export const hstackGap = styleVariants(spacingScale, (gap) => ({ gap }));
export const vstackGap = styleVariants(spacingScale, (gap) => ({ gap }));

export const alignVariants = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
});

export const justifyVariants = styleVariants({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  between: { justifyContent: "space-between" },
});

export const gridGap = styleVariants(spacingScale, (gap) => ({ gap }));

// Spacer
export const spacerSize = styleVariants(spacingScale, (size) => ({
  height: size,
  width: size,
}));

// Logo
export const logo = style({
  fontFamily: vars.fonts.logo,
  fontSize: "2.5rem",
  fontWeight: 600,
  color: vars.colors.primary,
});

// Typography
export const textScale = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
};

export const textSize = styleVariants(textScale, (fontSize) => ({ fontSize }));

export const text = style({
  fontFamily: vars.fonts.prose,
  margin: 0,
});

export const bold = style({
  fontWeight: 700,
});

export const italic = style({
  fontStyle: "italic",
});

export const link = style({
  color: vars.colors.primary,
  textDecoration: "underline",
  cursor: "pointer",
  transition: `color ${vars.transition.fast}`,
  ":hover": {
    color: vars.colors.secondary,
  },
});

// Button
const pulse = keyframes({
  "0%, 100%": { opacity: "0.5" },
  "50%": { opacity: "0.8" },
});

const buttonBase = style({
  fontFamily: vars.fonts.prose,
  fontSize: "0.875rem",
  fontWeight: 600,
  padding: `${spacingScale.sm} ${spacingScale.md}`,
  borderRadius: radius.pill,
  border: "none",
  cursor: "pointer",
  width: "fit-content",
  position: "relative",
  transform: "translateY(-2px)",
  transition: `background ${vars.transition.normal}, color ${vars.transition.normal}, box-shadow ${vars.transition.normal}, transform ${vars.transition.normal}`,
  ":hover": {
    transform: "translateY(-1px)",
  },
  ":active": {
    transform: "translateY(0)",
    boxShadow: "none",
  },
});

const loadingState = {
  boxShadow: "none",
  transform: "translateY(0)",
  pointerEvents: "none",
  animation: `${pulse} 1.5s ease-in-out infinite`,
} as const;

export const buttonVariants = styleVariants({
  primary: [
    buttonBase,
    {
      background: vars.colors.primary,
      color: vars.colors.background,
      boxShadow: `0 3px 0 0 #af4b0b`,
      ":hover": {
        boxShadow: `0 2px 0 0 #af4b0b`,
        transform: "translateY(-1px)",
      },
      ":active": { boxShadow: "none", transform: "translateY(0)" },
    },
  ],
  "primary-loading": [
    buttonBase,
    {
      background: vars.colors.primary,
      color: vars.colors.background,
      ...loadingState,
    },
  ],
  secondary: [
    buttonBase,
    {
      background: vars.colors.card,
      color: vars.colors.foreground,
      border: `1px solid ${vars.colors.border}`,
      boxShadow: `0 3px 0 0 ${vars.colors.border}`,
      ":hover": {
        boxShadow: `0 2px 0 0 ${vars.colors.border}`,
        transform: "translateY(-1px)",
      },
      ":active": { boxShadow: "none", transform: "translateY(0)" },
    },
  ],
  "secondary-loading": [
    buttonBase,
    {
      background: vars.colors.card,
      color: vars.colors.foreground,
      border: `1px solid ${vars.colors.border}`,
      ...loadingState,
    },
  ],
  ghost: [
    buttonBase,
    {
      background: "transparent",
      color: vars.colors.foreground,
      boxShadow: "none",
      border: "1px solid transparent",
      transform: "translateY(0)",
      ":hover": {
        background: vars.colors.card,
        border: `1px solid ${vars.colors.border}`,
        boxShadow: `0 2px 0 0 ${vars.colors.border}`,
        transform: "translateY(-1px)",
      },
      ":active": {
        background: vars.colors.card,
        border: `1px solid ${vars.colors.border}`,
        boxShadow: "none",
        transform: "translateY(0)",
      },
    },
  ],
  "ghost-loading": [
    buttonBase,
    {
      background: vars.colors.card,
      color: vars.colors.foreground,
      border: `1px solid ${vars.colors.border}`,
      ...loadingState,
    },
  ],
});

// Shared control sizing (inputs, dropdowns, etc.)
const controlSize = {
  sm: { padding: `0.25rem 0.625rem`, fontSize: "0.75rem" },
  md: {
    padding: `${spacingScale.sm} ${spacingScale.md}`,
    fontSize: "0.875rem",
  },
  lg: { padding: `0.625rem 1.25rem`, fontSize: "1rem" },
};

export const controlSizeVariants = styleVariants(controlSize);

// Input
export const inputWrapper = style({
  display: "flex",
  alignItems: "center",
  borderRadius: radius.pill,
  border: `1px solid ${vars.colors.border}`,
  background: vars.colors.background,
  transition: `border-color ${vars.transition.normal}`,
  width: "fit-content",
  selectors: {
    "&:focus-within": {
      borderColor: vars.colors.primary,
    },
  },
});

export const inputWrapperSize = styleVariants(controlSize);

export const inputField = style({
  fontFamily: vars.fonts.prose,
  fontSize: "inherit",
  background: "transparent",
  color: vars.colors.foreground,
  border: "none",
  outline: "none",
  flex: 1,
  minWidth: 0,
  "::placeholder": {
    color: vars.colors.muted,
  },
});

export const inputIcon = style({
  display: "flex",
  alignItems: "center",
  color: vars.colors.muted,
  marginRight: spacingScale.sm,
  flexShrink: 0,
});

export const inputClear = style({
  display: "flex",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: vars.colors.muted,
  padding: 0,
  marginLeft: spacingScale.sm,
  flexShrink: 0,
  transition: `color ${vars.transition.fast}`,
  ":hover": {
    color: vars.colors.foreground,
  },
});

// Switch
export const switchButton = style({
  position: "relative",
  width: "2.75rem",
  height: "1.5rem",
  borderRadius: radius.pill,
  border: "none",
  cursor: "pointer",
  padding: 0,
  background: vars.colors.border,
  transition: `background ${vars.transition.normal}`,
  selectors: {
    '&[aria-checked="true"]': {
      background: vars.colors.primary,
    },
  },
});

export const switchThumb = style({
  display: "block",
  width: "1.125rem",
  height: "1.125rem",
  borderRadius: "50%",
  background: "white",
  position: "absolute",
  top: "0.1875rem",
  left: "0.1875rem",
  transition: `transform ${vars.transition.normal}`,
  selectors: {
    '[aria-checked="true"] > &': {
      transform: "translateX(1.25rem)",
    },
  },
});

// Card
const cardBase = style({
  background: vars.colors.card,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.lg,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
});

export const cardPadding = styleVariants({
  sm: [cardBase, { padding: spacingScale.sm }],
  md: [cardBase, { padding: spacingScale.md }],
  lg: [cardBase, { padding: spacingScale.lg }],
  xl: [cardBase, { padding: spacingScale.xl }],
});

// Modal
export const modalBackdrop = style({
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  pointerEvents: "none",
  transition: `opacity ${vars.transition.slow}`,
  selectors: {
    '&[data-open="true"]': {
      opacity: 1,
      pointerEvents: "auto",
    },
  },
});

export const modalContent = style({
  background: vars.colors.card,
  borderRadius: radius.lg,
  padding: spacingScale.lg,
  boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.2)",
  transform: "scale(0.95) translateY(0.5rem)",
  transition: `transform ${vars.transition.slow}, opacity ${vars.transition.slow}`,
  opacity: 0,
  selectors: {
    '[data-open="true"] > &': {
      transform: "scale(1) translateY(0)",
      opacity: 1,
    },
  },
});

// Slider
export const sliderTrack = style({
  position: "relative",
  cursor: "pointer",
  touchAction: "none",
  userSelect: "none",
});

export const sliderTrackDirection = styleVariants({
  horizontal: {
    width: "100%",
    height: "1.5rem",
    display: "flex",
    alignItems: "center",
  },
  vertical: {
    width: "1.5rem",
    height: "100%",
    display: "flex",
    justifyContent: "center",
  },
});

export const sliderRail = style({
  position: "relative",
  background: vars.colors.border,
  borderRadius: radius.pill,
  flex: "none",
});

export const sliderRailDirection = styleVariants({
  horizontal: { width: "100%", height: "0.375rem" },
  vertical: { width: "0.375rem", height: "100%" },
});

export const sliderFill = style({
  position: "absolute",
  background: vars.colors.primary,
  borderRadius: radius.pill,
});

export const sliderFillDirection = styleVariants({
  horizontal: { top: 0, bottom: 0, left: 0 },
  vertical: { left: 0, right: 0, bottom: 0 },
});

export const sliderThumb = style({
  position: "absolute",
  width: "1rem",
  height: "1rem",
  borderRadius: "50%",
  background: vars.colors.primary,
  border: `2px solid ${vars.colors.background}`,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
  transition: `transform ${vars.transition.fast}`,
  ":hover": {
    transform: "scale(1.05)",
  },
});

export const sliderThumbDirection = styleVariants({
  horizontal: {
    top: "50%",
    marginTop: "calc(-0.5rem - 2px)",
    marginLeft: "calc(-0.5rem - 2px)",
  },
  vertical: {
    left: "50%",
    marginLeft: "calc(-0.5rem - 2px)",
    marginBottom: "calc(-0.5rem - 2px)",
  },
});

// Shared popover styles (used by Dropdown, Combobox, etc.)
export const popoverWrapper = style({
  position: "relative",
  width: "fit-content",
});

export const popoverTrigger = style({
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  fontFamily: vars.fonts.prose,
  borderRadius: radius.pill,
  border: `1px solid ${vars.colors.border}`,
  background: vars.colors.background,
  color: vars.colors.foreground,
  cursor: "pointer",
  transition: `border-color ${vars.transition.normal}`,
  ":hover": {
    borderColor: vars.colors.primary,
  },
});

export const popoverTriggerSize = styleVariants(controlSize);

export const popoverTriggerOpen = style({
  borderColor: vars.colors.primary,
});

export const popoverPlaceholder = style({
  color: vars.colors.muted,
});

export const popoverChevron = style({
  display: "flex",
  alignItems: "center",
  color: vars.colors.muted,
  transition: `transform ${vars.transition.normal}`,
  marginLeft: "auto",
});

export const popoverChevronOpen = style({
  transform: "rotate(180deg)",
});

export const popoverMenu = style({
  position: "absolute",
  left: 0,
  minWidth: "100%",
  width: "max-content",
  zIndex: 100,
  background: vars.colors.card,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.md,
  padding: `${spacingScale.xs} 0`,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  opacity: 0,
  transform: "scaleY(0.95)",
  transformOrigin: "top",
  pointerEvents: "none",
  transition: `opacity ${vars.transition.normal}, transform ${vars.transition.normal}`,
});

export const popoverMenuOpen = style({
  opacity: 1,
  transform: "scaleY(1)",
  pointerEvents: "auto",
});

export const popoverMenuUp = style({
  transformOrigin: "bottom",
});

export const popoverItem = style({
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  padding: `${spacingScale.sm} ${spacingScale.md}`,
  margin: `0 ${spacingScale.xs}`,
  borderRadius: radius.pill,
  fontFamily: vars.fonts.prose,
  fontSize: "0.875rem",
  color: vars.colors.foreground,
  cursor: "pointer",
  transition: `background ${vars.transition.fast}`,
  whiteSpace: "nowrap",
  ":hover": {
    background: vars.colors.border,
  },
});

export const popoverItemSelected = style({
  fontWeight: 600,
});

export const popoverItemHighlighted = style({
  background: vars.colors.border,
});

export const popoverCheck = style({
  display: "flex",
  alignItems: "center",
  color: vars.colors.primary,
  width: "1rem",
  flexShrink: 0,
});

// Dropdown aliases (use shared popover)
export const dropdownWrapper = popoverWrapper;
export const dropdownTrigger = popoverTrigger;
export const dropdownTriggerSize = popoverTriggerSize;
export const dropdownTriggerOpen = popoverTriggerOpen;
export const dropdownPlaceholder = popoverPlaceholder;
export const dropdownChevron = popoverChevron;
export const dropdownChevronOpen = popoverChevronOpen;
export const dropdownMenu = popoverMenu;
export const dropdownMenuOpen = popoverMenuOpen;
export const dropdownMenuUp = popoverMenuUp;
export const dropdownItem = popoverItem;
export const dropdownItemSelected = popoverItemSelected;
export const dropdownCheck = popoverCheck;

// Combobox-specific styles
export const comboboxTrigger = style({
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  gap: spacingScale.xs,
  fontFamily: vars.fonts.prose,
  borderRadius: radius.pill,
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: vars.colors.border,
  background: vars.colors.background,
  color: vars.colors.foreground,
  cursor: "pointer",
  overflow: "hidden",
  transition: `border-color ${vars.transition.normal}`,
  ":hover": {
    borderColor: vars.colors.primary,
  },
});

export const comboboxTriggerWithTags = style({
  padding: `0.25rem 0.5rem 0.25rem 0.25rem`,
  transition: `border-color ${vars.transition.normal}`,
  ":hover": {
    borderColor: vars.colors.primary,
  },
});

export const comboboxInput = style({
  fontFamily: vars.fonts.prose,
  fontSize: "inherit",
  background: "transparent",
  color: vars.colors.foreground,
  border: "none",
  outline: "none",
  flex: 1,
  minWidth: "4rem",
  "::placeholder": {
    color: vars.colors.muted,
  },
});

export const comboboxTag = style({
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: `0.3rem 0.625rem`,
  borderRadius: radius.pill,
  border: "none",
  outline: "none",
  background: vars.colors.primary,
  color: vars.colors.background,
  fontFamily: vars.fonts.prose,
  fontSize: "0.8125rem",
  fontWeight: 600,
  flexShrink: 0,
  cursor: "pointer",
  transition: `opacity ${vars.transition.fast}`,
  whiteSpace: "nowrap",
  ":hover": {
    opacity: "0.8",
  },
});

export const comboboxOverflow = style({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: vars.colors.muted,
  whiteSpace: "nowrap",
});

export const comboboxSearchWrapper = style({
  padding: `${spacingScale.sm}`,
});

export const comboboxSearchInput = style({
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  width: "100%",
  padding: `${spacingScale.sm} ${spacingScale.md}`,
  borderRadius: radius.pill,
  border: `1px solid ${vars.colors.border}`,
  background: vars.colors.background,
  fontFamily: vars.fonts.prose,
  fontSize: "0.875rem",
  color: vars.colors.foreground,
  outline: "none",
  boxSizing: "border-box",
  transition: `border-color ${vars.transition.normal}`,
  ":focus": {
    borderColor: vars.colors.primary,
  },
  "::placeholder": {
    color: vars.colors.muted,
  },
});
