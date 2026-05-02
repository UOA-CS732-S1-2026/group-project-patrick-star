import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

const meta: Meta<typeof PageHeader> = {
  title: "Layout/PageHeader",
  component: PageHeader,
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  render: () => (
    <PageHeader
      title="Closet"
      subtitle="Manage your wardrobe items"
      right={<Button size="sm">Add item</Button>}
    />
  ),
};
