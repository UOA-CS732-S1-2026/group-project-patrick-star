import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

const meta: Meta<typeof OnboardingShell> = {
  title: "Onboarding/OnboardingShell",
  component: OnboardingShell,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingShell>;

export const Default: Story = {
  args: {
    step: 1,
    totalSteps: 3,
    stepLabel: "Body profile",
    left: (
      <div className="relative flex aspect-[3/4] w-60 items-center justify-center rounded-3xl bg-neutral-100 text-sm font-medium text-muted-foreground">
        Preview
      </div>
    ),
    children: (
      <div className="rounded-2xl border border-border bg-white p-6">
        Step content
      </div>
    ),
  },
};
