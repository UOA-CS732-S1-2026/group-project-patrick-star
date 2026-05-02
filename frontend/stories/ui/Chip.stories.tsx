import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip } from "@/components/ui/Chip";

const meta: Meta<typeof Chip> = {
  title: "UI/Chip",
  component: Chip,
  args: {
    children: "Casual",
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Selected: Story = {
  args: { selected: true },
};
