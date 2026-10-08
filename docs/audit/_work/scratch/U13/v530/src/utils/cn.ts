import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge classifies any unknown `text-{word}` class as a text-color utility.
 * That means `text-style-button` lands in the same conflict group as `text-primary-fg`,
 * `text-text`, etc., and the last one in the class string wins — silently erasing
 * `text-style-button` whenever a color utility appears after it (e.g. in cva where base
 * classes always precede variant classes).
 *
 * Registering the `text-style-*` classes in their own group tells twMerge they are an
 * independent typographic intent, not a color, so they coexist with color utilities.
 */
const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    classGroups: {
      'text-style': [
        'text-style-button',
        'text-style-body',
        'text-style-label',
        'text-style-title',
        'text-style-heading',
        'text-style-hero',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
