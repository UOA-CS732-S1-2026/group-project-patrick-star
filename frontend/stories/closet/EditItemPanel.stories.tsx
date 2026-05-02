import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditItemPanel } from "@/components/closet/EditItemPanel";
import { defaultItem } from "../storybook-mocks";

const meta: Meta<typeof EditItemPanel> = {
  title: "Closet/EditItemPanel",
  component: EditItemPanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof EditItemPanel>;

export const Default: Story = {
  args: {
    item: defaultItem,
    onCancel: () => {},
    onSave: () => {},
    onRemove: () => {},
  },
};
