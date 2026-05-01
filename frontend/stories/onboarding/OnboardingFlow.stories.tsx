import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

const meta: Meta<typeof OnboardingFlow> = {
  title: "Onboarding/OnboardingFlow",
  component: OnboardingFlow,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Single-page onboarding flow built with React Hook Form and Zod. The three steps collect body profile details, style preferences, and model selection or photo upload.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/onboarding",
        push: fn(),
        replace: fn(),
        back: fn(),
        forward: fn(),
        prefetch: fn(),
        refresh: fn(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingFlow>;

export const StepOne: Story = {
  args: {
    initialStepIndex: 0,
  },
};
