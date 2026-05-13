import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ModelScroller,
} from "@/components/onboarding/ModelScroller";
import { MODEL_OPTIONS } from "@/components/onboarding/onboarding-data";

const meta: Meta<typeof ModelScroller> = {
  title: "Onboarding/ModelScroller",
  component: ModelScroller,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Reusable center-focused model carousel for onboarding. The active model appears large in the middle, while the left and right preview cards can be clicked to switch selection.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModelScroller>;

export const Default: Story = {
  render: () => {
    function ModelScrollerDemo() {
      const [selectedId, setSelectedId] = useState<string>("model-1");

      return (
        <div className="min-h-screen bg-background px-6 py-10 md:px-12">
          <div className="mx-auto max-w-6xl">
            <ModelScroller
              items={MODEL_OPTIONS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      );
    }

    return <ModelScrollerDemo />;
  },
};
