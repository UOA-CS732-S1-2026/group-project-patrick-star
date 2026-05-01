import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "@/components/ui/SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "UI/SearchInput",
  component: SearchInput,
  args: {
    placeholder: "Search items",
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};
