import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm, FormProvider } from "react-hook-form";
import { SelectModelStep } from "@/components/onboarding/steps/SelectModelStep";
import { DEFAULT_ONBOARDING_VALUES } from "@/components/onboarding/onboarding-schema";

const meta: Meta<typeof SelectModelStep> = {
  title: "Onboarding/SelectModelStep",
  component: SelectModelStep,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Final onboarding step where the user can either upload a photo or select an existing model. The latest selected image is used for the preview on the left.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectModelStep>;

export const Default: Story = {
  render: () => {
    function SelectModelDemo() {
      const methods = useForm({
        defaultValues: {
          ...DEFAULT_ONBOARDING_VALUES,
          modelMode: "select",
          selectedModelId: "model-1",
        },
      });

      return (
        <FormProvider {...methods}>
          <SelectModelStep onBack={() => {}} />
        </FormProvider>
      );
    }

    return <SelectModelDemo />;
  },
};
