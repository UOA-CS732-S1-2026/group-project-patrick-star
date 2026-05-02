import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Open: Story = {
  render: () => {
    function ModalDemo() {
      const [open, setOpen] = useState(true);

      return (
        <div className="p-8">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onClose={() => setOpen(false)} className="max-w-md p-6">
            <h2 className="text-xl font-bold">Example modal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This is a single Storybook use case for the modal component.
            </p>
          </Modal>
        </div>
      );
    }

    return <ModalDemo />;
  },
};
