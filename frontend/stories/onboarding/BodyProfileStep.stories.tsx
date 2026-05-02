import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm, FormProvider } from "react-hook-form";
import { BodyProfileStep } from "@/components/onboarding/steps/BodyProfileStep";
import { DEFAULT_ONBOARDING_VALUES } from "@/components/onboarding/onboarding-schema";

const meta: Meta<typeof BodyProfileStep> = {
  title: "Onboarding/BodyProfileStep",
  component: BodyProfileStep,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "First onboarding step for body profile details. All fields are optional in the UI, with validation handled by the shared Zod schema.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BodyProfileStep>;

export const Default: Story = {
  render: () => {
    function BodyProfileDemo() {
      const methods = useForm({
        defaultValues: DEFAULT_ONBOARDING_VALUES,
      });

      return (
        <FormProvider {...methods}>
          <BodyProfileStep onNext={() => {}} />
        </FormProvider>
      );
    }

    return <BodyProfileDemo />;
  },
};
