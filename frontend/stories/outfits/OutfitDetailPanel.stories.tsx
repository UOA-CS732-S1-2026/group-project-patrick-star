import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OutfitDetailPanel } from "@/components/outfits/OutfitDetailPanel";
import { defaultOutfit } from "../storybook-mocks";

const meta: Meta<typeof OutfitDetailPanel> = {
  title: "Outfits/OutfitDetailPanel",
  component: OutfitDetailPanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof OutfitDetailPanel>;

export const Default: Story = {
  args: {
    outfit: defaultOutfit,
  },
};
