import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BackButton } from "@/components/ui/BackButton";

const meta: Meta<typeof BackButton> = {
  title: "UI/BackButton",
  component: BackButton,
};

export default meta;
type Story = StoryObj<typeof BackButton>;

export const Default: Story = {};
