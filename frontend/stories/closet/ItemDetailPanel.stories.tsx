import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ItemDetailPanel } from "@/components/closet/ItemDetailPanel";
import { defaultItem } from "../storybook-mocks";

const meta: Meta<typeof ItemDetailPanel> = {
  title: "Closet/ItemDetailPanel",
  component: ItemDetailPanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ItemDetailPanel>;

export const Default: Story = {
  args: {
    item: defaultItem,
    onClose: () => {},
    onEdit: () => {},
  },
};
