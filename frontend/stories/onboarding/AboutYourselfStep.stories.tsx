import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm, FormProvider } from "react-hook-form";
import { AboutYourselfStep } from "@/components/onboarding/steps/AboutYourselfStep";
import { DEFAULT_ONBOARDING_VALUES } from "@/components/onboarding/onboarding-schema";

const meta: Meta<typeof AboutYourselfStep> = {
  title: "Onboarding/AboutYourselfStep",
  component: AboutYourselfStep,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Second onboarding step for multi-select style preferences. The continue button stays disabled until at least one style is selected.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AboutYourselfStep>;

export const Default: Story = {
  render: () => {
    function AboutYourselfDemo() {
      const methods = useForm({
        defaultValues: DEFAULT_ONBOARDING_VALUES,
      });

      return (
        <FormProvider {...methods}>
          <AboutYourselfStep onBack={() => {}} onNext={() => {}} />
        </FormProvider>
      );
    }

    return <AboutYourselfDemo />;
  },
};
