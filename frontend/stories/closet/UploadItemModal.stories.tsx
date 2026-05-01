import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UploadItemModal } from "@/components/closet/UploadItemModal";

const meta: Meta<typeof UploadItemModal> = {
  title: "Closet/UploadItemModal",
  component: UploadItemModal,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof UploadItemModal>;

export const Open: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSubmit: () => {},
  },
};
