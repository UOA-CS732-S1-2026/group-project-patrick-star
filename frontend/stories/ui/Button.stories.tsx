import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Continue",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
