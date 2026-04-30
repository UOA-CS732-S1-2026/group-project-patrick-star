import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
};
export default config;
