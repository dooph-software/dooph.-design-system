import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  viteFinal: async (config) => {
    // GitHub Pages project sites live at /<repo>/, not /. Local `storybook
    // build` stays at `/`; CI sets STORYBOOK_BASE_PATH to the repo subpath.
    const storybookBasePath = process.env.STORYBOOK_BASE_PATH;
    if (storybookBasePath) {
      config.base = storybookBasePath;
    }

    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    config.build = {
      ...config.build,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        ...config.build?.rollupOptions,
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            typeof warning.id === 'string' &&
            warning.id.includes('@radix-ui')
          ) {
            return;
          }

          defaultHandler(warning);
        },
      },
    };
    return config;
  },
};

export default config;
