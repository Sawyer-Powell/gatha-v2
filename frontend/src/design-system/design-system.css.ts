import { keyframes, style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../app.css";

// Base tokens
export const radius = {
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
  pill: "9999px",
};

export const spacingScale = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2.25rem",
};

export const breakpoint = {
  mobile: "48rem",
  workbench: "44rem",
} as const;

export const control = {
  height: "2.35rem",
} as const;

export const layer = {
  page: 0,
  popover: 30,
  modal: 100,
} as const;

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
  fontSize: textScale.sm,
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
  ":disabled": {
    cursor: "default",
    opacity: 0.62,
    pointerEvents: "none",
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
      boxShadow: `0 3px 0 0 ${vars.colors.primaryShadow}`,
      ":hover": {
        boxShadow: `0 2px 0 0 ${vars.colors.primaryShadow}`,
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
    width: control.height,
    height: control.height,
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

export const profilePicture = style({
  display: "inline-grid",
  placeItems: "center",
  flex: "0 0 auto",
  aspectRatio: "1",
  borderRadius: radius.pill,
  overflow: "hidden",
  background: vars.colors.accent,
  color: vars.colors.background,
  fontFamily: vars.fonts.heading,
  fontWeight: 700,
  lineHeight: 1,
});

export const profilePictureSizeVariants = styleVariants({
  xs: {
    width: "1.35rem",
    fontSize: "0.625rem",
  },
  sm: {
    width: "1.75rem",
    fontSize: textScale.xs,
  },
  md: {
    width: "2.25rem",
    fontSize: textScale.xs,
  },
  lg: {
    width: "3rem",
    fontSize: textScale.sm,
  },
});

export const profilePictureImage = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const hiddenFileInput = style({
  display: "none",
});

export const fileUploadButton = style({
  position: "relative",
  overflow: "hidden",
});

export const fileUploadContent = style({
  display: "inline-grid",
  placeItems: "center",
  width: "100%",
  height: "100%",
  transition: `opacity ${vars.transition.normal}`,
  selectors: {
    [`${fileUploadButton}:hover &`]: {
      opacity: 0,
    },
    [`${fileUploadButton}:focus-visible &`]: {
      opacity: 0,
    },
  },
});

export const fileUploadIcon = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: vars.colors.foreground,
  opacity: 0,
  transition: `opacity ${vars.transition.normal}`,
  selectors: {
    [`${fileUploadButton}:hover &`]: {
      opacity: 1,
    },
    [`${fileUploadButton}:focus-visible &`]: {
      opacity: 1,
    },
  },
});

export const selectableSurface = style([
  buttonVariants.ghost,
  buttonShapeVariants.square,
  {
    width: "100%",
    justifyContent: "stretch",
  },
]);

export const selectableSurfaceActive = style([
  buttonPressedVariants.ghost,
  {
    borderColor: vars.colors.primary,
    cursor: "default",
    ":hover": {
      borderColor: vars.colors.primary,
      boxShadow: "none",
    },
  },
]);

// Shared control sizing (inputs, dropdowns, etc.)
const controlSize = {
  sm: { padding: `0.25rem 0.625rem`, fontSize: textScale.xs },
  md: {
    padding: `${spacingScale.sm} ${spacingScale.md}`,
    fontSize: textScale.sm,
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
  background: vars.colors.switchThumb,
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
  boxShadow: vars.shadows.card,
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
  zIndex: layer.modal,
  background: vars.colors.backdrop,
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
  boxShadow: vars.shadows.modal,
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

// Shared popover styles (used by Dropdown, Combobox, etc.)
export const popoverWrapper = style({
  position: "relative",
  width: "fit-content",
  selectors: {
    '&[data-open="true"]': {
      zIndex: layer.popover,
    },
  },
});

const popoverTrigger = style({
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

const popoverTriggerSize = styleVariants(controlSize);

const popoverTriggerOpen = style({
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

const popoverChevronOpen = style({
  transform: "rotate(180deg)",
});

export const popoverMenu = style({
  position: "absolute",
  left: 0,
  minWidth: "100%",
  width: "max-content",
  zIndex: layer.popover,
  background: vars.colors.card,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.md,
  padding: `${spacingScale.xs} 0`,
  boxShadow: vars.shadows.popover,
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

export const popoverMenuAlignEnd = style({
  left: "auto",
  right: 0,
});

export const popoverItem = style({
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  padding: `${spacingScale.sm} ${spacingScale.md}`,
  margin: `0 ${spacingScale.xs}`,
  borderRadius: radius.pill,
  fontFamily: vars.fonts.prose,
  fontSize: textScale.sm,
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

export const popoverActionItem = style([
  popoverItem,
  {
    width: "calc(100% - 0.5rem)",
    border: "none",
    background: "transparent",
    textAlign: "left",
  },
]);

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
export const dropdownMenuAlignEnd = popoverMenuAlignEnd;
export const dropdownItem = popoverItem;
export const dropdownItemSelected = popoverItemSelected;
export const dropdownCheck = popoverCheck;
export const dropdownActionItem = popoverActionItem;

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

export const comboboxTriggerOpen = style({
  borderColor: vars.colors.primary,
});

export const comboboxTriggerWithTags = style({
  padding: `0.25rem 0.5rem 0.25rem 0.25rem`,
  transition: `border-color ${vars.transition.normal}`,
  ":hover": {
    borderColor: vars.colors.primary,
  },
});

export const comboboxIconTrigger = style({
  width: control.height,
  height: control.height,
  padding: 0,
  justifyContent: "center",
  flexShrink: 0,
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
  fontSize: textScale.sm,
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

export const comboboxOptionContent = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  minWidth: 0,
});

export const comboboxEmptyState = style([
  popoverItem,
  {
    pointerEvents: "none",
    color: vars.colors.muted,
  },
]);

// Video player
const controlHeight = "2.1875rem";

const rangeTrack = { height: "6px", borderRadius: radius.pill } as const;
export const rangeThumbPixels = 16;
const rangeThumbSize = `${rangeThumbPixels}px`;
const rangeHalfThumb = `${rangeThumbPixels / 2}px`;
const rangeHalfTrack = "3px";
const rangeTrackSize = "6px";
const rangeRailWidth = `calc(100% - ${rangeThumbSize})`;
const rangeThumb = {
  boxSizing: "border-box",
  width: "1rem",
  height: "1rem",
  borderRadius: "50%",
  border: `2px solid ${vars.colors.background}`,
  background: vars.colors.primary,
  boxShadow: vars.shadows.rangeThumb,
} as const;

const rangeFillWidth = "var(--range-fill-width, 0px)";
const rangeImages = [
  `linear-gradient(${vars.colors.primary}, ${vars.colors.primary})`,
  `radial-gradient(circle, ${vars.colors.primary} 0 ${rangeHalfTrack}, transparent 3.5px)`,
  `radial-gradient(circle, ${vars.colors.primary} 0 ${rangeHalfTrack}, transparent 3.5px)`,
  `linear-gradient(${vars.colors.border}, ${vars.colors.border})`,
  `radial-gradient(circle, ${vars.colors.border} 0 ${rangeHalfTrack}, transparent 3.5px)`,
  `radial-gradient(circle, ${vars.colors.border} 0 ${rangeHalfTrack}, transparent 3.5px)`,
].join(", ");

const rangePositions = (fillWidth: string) =>
  [
    `${rangeHalfThumb} center`,
    `calc(${rangeHalfThumb} - ${rangeHalfTrack}) center`,
    `calc(${rangeHalfThumb} + ${fillWidth} - ${rangeHalfTrack}) center`,
    `${rangeHalfThumb} center`,
    `calc(${rangeHalfThumb} - ${rangeHalfTrack}) center`,
    `calc(100% - ${rangeHalfThumb} - ${rangeHalfTrack}) center`,
  ].join(", ");

const rangeSizes = (fillWidth: string) =>
  [
    `${fillWidth} ${rangeTrackSize}`,
    `${rangeTrackSize} ${rangeTrackSize}`,
    `${rangeTrackSize} ${rangeTrackSize}`,
    `${rangeRailWidth} ${rangeTrackSize}`,
    `${rangeTrackSize} ${rangeTrackSize}`,
    `${rangeTrackSize} ${rangeTrackSize}`,
  ].join(", ");

// Shared base for range controls. The input is half a thumb wider on each side;
// the native rail is transparent, and the visible rail is drawn from half-thumb
// to half-thumb so the thumb center marks the first/last pixel.
export const timelineScrubber = style({
  appearance: "none",
  display: "block",
  width: `calc(100% + ${rangeThumbSize})`,
  height: "1.25rem",
  margin: `0 -${rangeHalfThumb}`,
  padding: 0,
  border: "none",
  backgroundColor: "transparent",
  backgroundImage: `var(--range-dot-images, none), ${rangeImages}`,
  backgroundPosition: `var(--range-dot-positions, 0 0), ${rangePositions(rangeFillWidth)}`,
  backgroundSize: `var(--range-dot-sizes, auto), ${rangeSizes(rangeFillWidth)}`,
  backgroundRepeat: `var(--range-dot-repeats, no-repeat), no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat`,
  cursor: "pointer",
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.colors.primary}`,
      outlineOffset: "2px",
    },
    "&::-webkit-slider-runnable-track": {
      ...rangeTrack,
      background: "transparent",
    },
    "&::-webkit-slider-thumb": {
      ...rangeThumb,
      appearance: "none",
      marginTop: "-0.3125rem",
    },
    "&::-moz-range-track": {
      ...rangeTrack,
      background: "transparent",
    },
    "&::-moz-range-progress": {
      ...rangeTrack,
      background: "transparent",
    },
    "&::-moz-range-thumb": { ...rangeThumb },
    "&:disabled": { cursor: "default", opacity: 0.7 },
  },
});

export const progressBar = style({
  vars: {
    "--progress-ratio": "0",
  },
  position: "relative",
  display: "block",
  width: "100%",
  height: rangeTrackSize,
  borderRadius: radius.pill,
  overflow: "hidden",
  background: vars.colors.border,
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      inset: 0,
      width: "calc(var(--progress-ratio) * 100%)",
      borderRadius: "inherit",
      background: vars.colors.primary,
      transition: `width ${vars.transition.normal}`,
    },
  },
});

export const progressDial = style({
  vars: {
    "--progress-ratio": "0",
    "--progress-degrees": "0deg",
  },
  display: "inline-grid",
  placeItems: "center",
  width: "1rem",
  height: "1rem",
  flex: "0 0 auto",
  borderRadius: "50%",
  background: `conic-gradient(${vars.colors.primary} var(--progress-degrees), ${vars.colors.border} 0)`,
  boxShadow: `inset 0 0 0 1px ${vars.colors.border}`,
  selectors: {
    "&::after": {
      content: "",
      width: "0.5rem",
      height: "0.5rem",
      borderRadius: "50%",
      background: vars.colors.card,
    },
  },
});

export const videoPlayer = style([
  cardBase,
  {
    width: "100%",
    maxWidth: "52rem",
    boxSizing: "border-box",
    overflow: "hidden",
    background: vars.colors.foreground,
  },
]);

export const videoFrame = style({
  background: vars.colors.foreground,
  aspectRatio: "var(--video-aspect-ratio, 16 / 9)",
  width: "100%",
  overflow: "hidden",
  borderRadius: `calc(${radius.lg} - 1px)`,
});

export const videoElement = style({
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "contain",
});

export const videoChrome = style({
  position: "fixed",
  left: "50%",
  bottom: spacingScale.md,
  transform: "translateX(-50%)",
  zIndex: layer.popover,
  width: "min(calc(100vw - 2rem), 54rem)",
  boxSizing: "border-box",
  padding: `0.625rem ${spacingScale.md}`,
  border: `1px solid ${vars.colors.border}`,
  borderRadius: radius.pill,
  background: vars.colors.chromeTint,
  boxShadow: vars.shadows.chrome,
  backdropFilter: "blur(16px)",
  containerType: "inline-size",
  "@media": {
    [`(max-width: ${breakpoint.mobile})`]: {
      bottom: "0.625rem",
      width: "calc(100vw - 1.25rem)",
      padding: `0.5rem ${spacingScale.sm}`,
    },
  },
  "@container": {
    [`(max-width: ${breakpoint.workbench})`]: {
      borderRadius: radius.lg,
    },
  },
});

export const videoChromeStack = style({
  display: "grid",
  alignItems: "center",
  columnGap: spacingScale.md,
  rowGap: spacingScale.sm,
  gridTemplateColumns: "auto minmax(8rem, 1fr) auto minmax(10rem, 12.5rem)",
  gridTemplateAreas: '"time scrubber transport speed"',
  "@container": {
    [`(max-width: ${breakpoint.workbench})`]: {
      gridTemplateColumns: "auto 1fr auto",
      gridTemplateAreas: '"time scrubber transport" "speed speed speed"',
      rowGap: spacingScale.sm,
    },
    "(max-width: 30rem)": {
      gridTemplateColumns: "1fr auto",
      gridTemplateAreas: '"time transport" "scrubber scrubber" "speed speed"',
    },
  },
});

export const videoScrubber = style({
  gridArea: "scrubber",
});

export const videoTimeEdit = style({
  gridArea: "time",
  display: "flex",
  alignItems: "center",
  gap: spacingScale.sm,
  minWidth: 0,
  justifySelf: "start",
  width: "max-content",
  "@container": {
    [`(max-width: ${breakpoint.workbench})`]: {
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
    [`(max-width: ${breakpoint.workbench})`]: {
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
    [`(max-width: ${breakpoint.workbench})`]: {
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
    [`(max-width: ${breakpoint.workbench})`]: {
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
  ":disabled": {
    opacity: 0.38,
    cursor: "default",
    boxShadow: "none",
    transform: "none",
  },
});

export const videoSpeedControl = style({
  vars: {
    "--speed-ratio": "0.4",
  },
  gridArea: "speed",
  display: "grid",
  gridTemplateColumns: "1rem 1fr 1rem 2.75rem",
  alignItems: "center",
  gap: spacingScale.sm,
  position: "relative",
  height: controlHeight,
  width: "100%",
  boxSizing: "border-box",
  justifySelf: "end",
  "@container": {
    [`(max-width: ${breakpoint.workbench})`]: {
      gridTemplateColumns: "1rem 1fr 1rem",
      width: "100%",
      maxWidth: "none",
      justifySelf: "stretch",
    },
  },
});

export const videoSpeedStepButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1rem",
  height: "1rem",
  padding: 0,
  border: "none",
  borderRadius: radius.pill,
  background: "transparent",
  color: vars.colors.muted,
  cursor: "pointer",
  transition: `color ${vars.transition.fast}, transform ${vars.transition.fast}`,
  ":hover": {
    color: vars.colors.foreground,
    transform: "translateY(-1px)",
  },
  ":active": {
    transform: "translateY(0)",
  },
  ":disabled": {
    opacity: 0.38,
    cursor: "default",
    transform: "none",
  },
});

export const videoSpeedIcon = style({
  flexShrink: 0,
});

export const videoSpeedSlider = style({});

export const videoSpeedValue = style({
  color: vars.colors.foreground,
  fontFamily: vars.fonts.prose,
  fontSize: textScale.sm,
  fontWeight: 700,
  textAlign: "right",
  whiteSpace: "nowrap",
  "@container": {
    [`(max-width: ${breakpoint.workbench})`]: {
      display: "none",
    },
  },
});
