import { style } from "@vanilla-extract/css";
import { vars } from "../../app.css";

export const heading = style({
  padding: 0,
  margin: 0,
  fontFamily: vars.fonts.heading,
  fontWeight: 700,
});

export const h1 = style([
  heading,
  {
    fontSize: "1.75rem",
  },
]);

export const h2 = style([
  heading,
  {
    fontSize: "1.5rem",
  },
]);

export const h3 = style([
  heading,
  {
    fontSize: "1.25rem",
  },
]);

export const h4 = style([
  heading,
  {
    fontSize: "1rem",
  },
]);
