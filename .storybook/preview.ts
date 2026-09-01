import type { Preview } from '@storybook/react';
import '../src/styles/index.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Preview token theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      document.body.style.background = 'var(--ui-color-page-background)';

      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        /* No `color` matcher. Storybook's default one assigns a colour-picker
         * control to any prop whose name ends in "color", but this system's
         * `color` props take a TOKEN NAME or any CSS colour — a union, which the
         * picker cannot represent, so it warned on every LoadingSpinner and
         * ProgressIndicator story. Those components declare their own
         * `argTypes.color` select instead. */
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: 'var(--ui-color-page-background)' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#161616' },
      ],
    },
  },
};

export default preview;
