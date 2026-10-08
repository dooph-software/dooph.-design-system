import { clsx, type ClassValue } from 'clsx';
import {
  extendTailwindMerge,
  type ConfigExtension,
  type DefaultClassGroupIds,
  type DefaultThemeGroupIds,
} from 'tailwind-merge';
import {
  DS_SIZE_UTILITIES,
  DS_TEXT_STYLE_ROLES,
  DS_TW_MERGE_THEME,
} from './twMergeTheme';

/**
 * tailwind-merge classifies any unknown `text-{word}` class as a text-color utility.
 * That means `text-style-button` lands in the same conflict group as `text-primary-fg`,
 * `text-text`, etc., and the last one in the class string wins — silently erasing
 * `text-style-button` whenever a color utility appears after it (e.g. in cva where base
 * classes always precede variant classes).
 *
 * Registering the `text-style-*` classes in their own group tells twMerge they are an
 * independent typographic intent, not a color, so they coexist with color utilities.
 *
 * Every list comes from `./twMergeTheme`, which `npm run sync-tokens` generates from
 * tokens.css and index.css — never hand-list a class name here (the hand list drifted
 * twice). The DS theme scales (text sizes, radius, spacing, shadow) make `rounded-full`
 * override `rounded-tight`, `p-lg` override `p-md`, and keep `text-body` a size, not a
 * colour. The custom `.h-button` / `.size-checkbox` / … utilities join their Tailwind
 * groups, so a consumer height or size class replaces the DS one.
 */
export const DS_TW_MERGE_CONFIG: ConfigExtension<
  DefaultClassGroupIds | 'text-style',
  DefaultThemeGroupIds
> = {
  extend: {
    theme: DS_TW_MERGE_THEME,
    classGroups: {
      'text-style': [{ 'text-style': DS_TEXT_STYLE_ROLES }],
      h: [{ h: DS_SIZE_UTILITIES.h }],
      w: [{ w: DS_SIZE_UTILITIES.w }],
      size: [{ size: DS_SIZE_UTILITIES.size }],
      'min-h': [{ 'min-h': DS_SIZE_UTILITIES['min-h'] }],
      'min-w': [{ 'min-w': DS_SIZE_UTILITIES['min-w'] }],
      'max-h': [{ 'max-h': DS_SIZE_UTILITIES['max-h'] }],
      'max-w': [{ 'max-w': DS_SIZE_UTILITIES['max-w'] }],
    },
  },
};

const twMerge = extendTailwindMerge<'text-style'>(DS_TW_MERGE_CONFIG);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
