import { vars } from "$lib/app.css";
import { breakpoint } from "$lib/design-system/design-system.css";
import { style } from "@vanilla-extract/css";

const mobileBreakpoint = breakpoint.mobile;
const sectionGap = "0.75rem";
const denseGap = "0.625rem";

export const home = style({
  height: "100vh",
  display: "flex",
  overflow: "hidden",
});

export const homeWrapper = style({
  padding: "1rem",
  paddingBottom: "1rem",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "hidden",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  gap: sectionGap,
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      padding: denseGap,
      paddingBottom: denseGap,
      gap: denseGap,
    },
  },
});

export const homeWrapperWithControls = style({
  paddingBottom: "5.75rem",
  "@media": {
    [`(max-width: ${mobileBreakpoint})`]: {
      paddingBottom: "5.5rem",
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
