import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressBar } from "@/components/ui/ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "UI/ProgressBar",
  component: ProgressBar,
  args: {
    value: 66,
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const InProgress: Story = {};
