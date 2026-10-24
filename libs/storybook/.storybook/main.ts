import type { StorybookConfig } from '@storybook/angular';
const config: StorybookConfig = {
  stories: ['../docs/*.mdx', '../*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/angular', options: {} },
  core: { disableTelemetry: true },
  webpackFinal: async (config) => {
    // Keep prose in Markdown and render it through Storybook's Markdown block.
    config.module ??= {};
    config.module.rules ??= [];
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' });
    return config;
  },
};
export default config;
