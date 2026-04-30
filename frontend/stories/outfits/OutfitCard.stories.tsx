import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { defaultOutfit } from "../storybook-mocks";

const meta: Meta<typeof OutfitCard> = {
  title: "Outfits/OutfitCard",
  component: OutfitCard,
  args: {
    outfit: defaultOutfit,
  },
};

export default meta;
type Story = StoryObj<typeof OutfitCard>;

export const Default: Story = {};
