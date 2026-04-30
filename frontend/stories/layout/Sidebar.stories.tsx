import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sidebar } from "@/components/layout/Sidebar";
import { defaultNav } from "../storybook-mocks";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    nav: defaultNav,
    user: { name: "Alex Johnson", itemCount: 42 },
  },
};
