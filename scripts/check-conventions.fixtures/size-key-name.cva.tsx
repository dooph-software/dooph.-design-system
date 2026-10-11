// Fixture: size keys named default or small, inside cva. One violation: `small`.
// Not reported: a `default` key in the `variant` group.
import { cva } from "class-variance-authority";
export const fixture = cva("", {
  variants: {
    variant: {
      default: "bg-primary",
    },
    size: {
      standard: "h-button",
      small: "h-button-sm",
    },
  },
});
