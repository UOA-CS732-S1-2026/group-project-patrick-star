import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardBody } from "@/components/ui/Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardBody>
        <p className="text-sm text-muted-foreground">Card content goes here.</p>
      </CardBody>
    </Card>
  ),
};
