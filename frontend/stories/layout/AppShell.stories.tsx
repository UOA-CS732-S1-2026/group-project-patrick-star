import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppShell } from "@/components/layout/AppShell";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  render: () => (
    <AppShell>
      <div className="p-10">
        <h2 className="text-2xl font-bold">Main content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A simple shell preview with the sidebar and content area.
        </p>
      </div>
    </AppShell>
  ),
};
