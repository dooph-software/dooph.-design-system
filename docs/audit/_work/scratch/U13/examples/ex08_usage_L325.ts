// usage/SKILL.md:325-337 verbatim
import { extendTailwindMerge } from "tailwind-merge";
export const twMerge = extendTailwindMerge<"text-style">({
  extend: {
    classGroups: {
      "text-style": [
        "text-style-button", "text-style-body", "text-style-label",
        "text-style-title", "text-style-heading", "text-style-hero",
      ],
    },
  },
});
