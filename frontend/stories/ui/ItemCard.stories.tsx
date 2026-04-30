import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ItemCard } from "@/components/ui/ItemCard";
import { defaultItem } from "../storybook-mocks";

const meta: Meta<typeof ItemCard> = {
  title: "UI/ItemCard",
  component: ItemCard,
  args: {
    item: defaultItem,
  },
};

export default meta;
type Story = StoryObj<typeof ItemCard>;

export const Default: Story = {};
