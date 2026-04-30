import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "New",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Accent: Story = {};
