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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacingScale.sm,
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

export const buttonShapeVariants = styleVariants({
  pill: {
    borderRadius: radius.pill,
  },
  square: {
    borderRadius: radius.sm,
    padding: spacingScale.sm,
  },
  circle: {
    width: "2.35rem",
    height: "2.35rem",
    padding: 0,
    borderRadius: radius.pill,
  },
});

export const buttonPressedVariants = styleVariants({
  primary: {
    boxShadow: "none",
    transform: "translateY(0)",
    ":hover": {
      boxShadow: "none",
      transform: "translateY(0)",
    },
  },
  secondary: {
    boxShadow: "none",
    transform: "translateY(0)",
    ":hover": {
      boxShadow: "none",
      transform: "translateY(0)",
    },
  },
  ghost: {
    background: vars.colors.card,
    border: `1px solid ${vars.colors.border}`,
    boxShadow: "none",
    transform: "translateY(0)",
    ":hover": {
      background: vars.colors.card,
      border: `1px solid ${vars.colors.border}`,
      boxShadow: "none",
      transform: "translateY(0)",
    },
  },
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

// Video player
const controlHeight = "2.1875rem";

const rangeTrack = { height: "0.375rem", borderRadius: radius.pill } as const;
const rangeThumb = {
  boxSizing: "border-box",
  width: "1rem",
  height: "1rem",
  borderRadius: "50%",
  border: `2px solid ${vars.colors.background}`,
  background: vars.colors.primary,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
} as const;

// Shared base for the scrubber + speed sliders — only the track fill differs.
const rangeInput = (fill: string) =>
  style({
    appearance: "none",
    display: "block",
    width: "100%",
    height: "1.25rem",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    selectors: {
      "&:focus-visible": {
        outline: `2px solid ${vars.colors.primary}`,
        outlineOffset: "2px",
      },
      "&::-webkit-slider-runnable-track": { ...rangeTrack, background: fill },
      "&::-webkit-slider-thumb": {
        ...rangeThumb,
        appearance: "none",
        marginTop: "-0.3125rem",
      },
      "&::-moz-range-track": { ...rangeTrack, background: vars.colors.border },
      "&::-moz-range-progress": {
        ...rangeTrack,
        background: vars.colors.primary,
      },
      "&::-moz-range-thumb": { ...rangeThumb },
      "&:disabled": { cursor: "default", opacity: 0.7 },
    },
  });

const fillTrack = (pos: string) =>
  `linear-gradient(to right, ${vars.colors.primary} ${pos}, ${vars.colors.border} ${pos})`;

export const videoPlayer = style([
  cardBase,
  {
    width: "100%",
    maxWidth: "52rem",
    boxSizing: "border-box",
    containerType: "inline-size",
    overflow: "visible",
  },
]);

export const videoFrame = style({
  background: vars.colors.foreground,
  aspectRatio: "16 / 9",
  width: "100%",
  overflow: "hidden",
  borderTopLeftRadius: `calc(${radius.lg} - 1px)`,
  borderTopRightRadius: `calc(${radius.lg} - 1px)`,
});

export const videoElement = style({
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "contain",
});

export const videoChrome = style({
  padding: `${spacingScale.md} ${spacingScale.lg}`,
  "@container": {
    "(max-width: 640px)": {
      padding: spacingScale.md,
    },
  },
});

export const videoChromeStack = style({
  display: "grid",
  alignItems: "center",
  columnGap: spacingScale.sm,
  rowGap: spacingScale.md,
  gridTemplateColumns: "minmax(12.5rem, 1fr) auto minmax(12.5rem, 1fr)",
  gridTemplateAreas: '"title title title" "time transport speed"',
  "@container": {
    "(max-width: 640px)": {
      // On mobile the transport tucks up next to the truncated title, and the
      // time + speed share the row below — far less vertical footprint.
      gridTemplateColumns: "minmax(0, 1fr) 11rem",
      gridTemplateAreas: '"title transport" "time speed"',
      columnGap: spacingScale.md,
      rowGap: spacingScale.sm,
    },
  },
});

export const videoScrubber = style([
  rangeInput(fillTrack("var(--progress, 0%)")),
  { marginBottom: spacingScale.sm },
]);

export const videoTitle = style({
  gridArea: "title",
  minWidth: 0,
  fontFamily: vars.fonts.heading,
  fontSize: textScale.md,
  fontWeight: 800,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const videoTimeEdit = style({
  gridArea: "time",
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  minWidth: 0,
  justifySelf: "start",
  width: "12.5rem",
  "@container": {
    "(max-width: 640px)": {
      width: "max-content",
    },
  },
});

export const videoDuration = style({
  color: vars.colors.muted,
  fontFamily: vars.fonts.code,
  fontSize: textScale.sm,
  whiteSpace: "nowrap",
  flexShrink: 0,
  "@container": {
    "(max-width: 640px)": {
      display: "none",
    },
  },
});

export const videoTimeInput = style({
  width: "7rem",
  height: controlHeight,
  boxSizing: "border-box",
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.pill,
  background: vars.colors.background,
  color: vars.colors.foreground,
  fontFamily: vars.fonts.code,
  fontSize: textScale.sm,
  padding: `0.375rem ${spacingScale.sm}`,
  textAlign: "center",
  outline: "none",
  transition: `border-color ${vars.transition.normal}`,
  ":focus": {
    borderColor: vars.colors.primary,
  },
  "@container": {
    "(max-width: 640px)": {
      width: "5.5rem",
    },
  },
});

export const videoControlCluster = style({
  gridArea: "transport",
  display: "grid",
  gridTemplateColumns: `repeat(3, ${controlHeight})`,
  gap: spacingScale.sm,
  justifySelf: "center",
  "@container": {
    "(max-width: 640px)": {
      justifySelf: "end",
    },
  },
});

export const videoControlButton = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: controlHeight,
  height: controlHeight,
  padding: 0,
  boxSizing: "border-box",
  transform: "none",
  ":hover": {
    transform: "none",
  },
  ":active": {
    transform: "none",
  },
});

export const videoSpeedControl = style({
  vars: {
    "--speed-progress": "40%",
  },
  gridArea: "speed",
  display: "grid",
  gridTemplateColumns: "1rem 1fr 1rem 2.75rem",
  alignItems: "center",
  gap: spacingScale.sm,
  position: "relative",
  height: controlHeight,
  width: "12.5rem",
  boxSizing: "border-box",
  justifySelf: "end",
  "@container": {
    "(max-width: 640px)": {
      gridTemplateColumns: "1rem 1fr 1rem",
      width: "100%",
      maxWidth: "11rem",
      justifySelf: "end",
    },
  },
});

export const videoSpeedIcon = style({
  color: vars.colors.muted,
  flexShrink: 0,
});

export const videoSpeedSlider = rangeInput(
  `var(--speed-dots, none), ${fillTrack("var(--speed-progress, 40%)")}`,
);

export const videoSpeedValue = style({
  color: vars.colors.foreground,
  fontFamily: vars.fonts.prose,
  fontSize: textScale.sm,
  fontWeight: 700,
  textAlign: "right",
  whiteSpace: "nowrap",
  "@container": {
    "(max-width: 640px)": {
      display: "none",
    },
  },
});

export const videoShortcut = style({
  position: "absolute",
  left: "50%",
  bottom: "calc(100% + 0.375rem)",
  transform: "translateX(-50%)",
  zIndex: 2,
  padding: `0.1875rem ${spacingScale.sm}`,
  borderRadius: radius.pill,
  background: vars.colors.foreground,
  color: vars.colors.background,
  fontFamily: vars.fonts.prose,
  fontSize: "0.6875rem",
  fontWeight: 700,
  opacity: 0,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  transition: `opacity ${vars.transition.fast}`,
  "@container": {
    "(max-width: 640px)": {
      display: "none",
    },
  },
  selectors: {
    [`${videoControlButton}:hover &`]: {
      opacity: 1,
    },
    [`${videoControlButton}:focus-visible &`]: {
      opacity: 1,
    },
  },
});
