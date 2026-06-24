import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonVariant } from "../Button";
import { ToastProvider, useToast } from "./Toast";
import { ToastTypes } from "./constants";

const meta = {
  title: "Overlays/Toast",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function ToastDemo({
  label,
  variant,
}: {
  label: string;
  variant?: ToastTypes;
}) {
  const { toast } = useToast();

  return (
    <Button
      variant={ButtonVariant.primary}
      onClick={() =>
        toast({
          title: label,
          description:
            variant === ToastTypes.standard ? "dashboard.fig moved to trash" : undefined,
          variant,
        })
      }
    >
      Show {label}
    </Button>
  );
}

export const Standard: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo label="File deleted" variant={ToastTypes.standard} />
    </ToastProvider>
  ),
};

export const Brand: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo label="Published" variant={ToastTypes.brand} />
    </ToastProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo label="Upload failed" variant={ToastTypes.error} />
    </ToastProvider>
  ),
};

export const Action: Story = {
  render: () => {
    function ActionToastDemo() {
      const { toast } = useToast();

      return (
        <Button
          variant={ButtonVariant.primary}
          onClick={() =>
            toast({
              title: "Export will be discarded. Continue?",
              variant: ToastTypes.action,
              action: {
                label: "Undo",
                onClick: () => undefined,
              },
            })
          }
        >
          Show action toast
        </Button>
      );
    }

    return (
      <ToastProvider>
        <ActionToastDemo />
      </ToastProvider>
    );
  },
};

export const Persistent: Story = {
  render: () => {
    function PersistentToastDemo() {
      const { toast, dismiss } = useToast();
      const [activeId, setActiveId] = useState<string | null>(null);

      return (
        <div className="flex gap-3">
          <Button
            variant={ButtonVariant.primary}
            onClick={() => {
              const id = toast({ title: "Processing…", duration: Infinity });
              setActiveId(id);
            }}
          >
            Show persistent
          </Button>
          <Button
            variant={ButtonVariant.ghost}
            disabled={!activeId}
            onClick={() => {
              if (activeId) {
                dismiss(activeId);
                setActiveId(null);
              }
            }}
          >
            Dismiss
          </Button>
        </div>
      );
    }

    return (
      <ToastProvider>
        <PersistentToastDemo />
      </ToastProvider>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <ToastProvider>
      <div className="flex flex-wrap gap-3">
        <ToastDemo label="Saved successfully" variant={ToastTypes.standard} />
        <ToastDemo label="Published" variant={ToastTypes.brand} />
        <ToastDemo label="Upload failed" variant={ToastTypes.error} />
        <ActionButton />
      </div>
    </ToastProvider>
  ),
};

function ActionButton() {
  const { toast } = useToast();

  return (
    <Button
      variant={ButtonVariant.primary}
      onClick={() =>
        toast({
          title: "Export will be discarded. Continue?",
          variant: ToastTypes.action,
          action: { label: "Undo", onClick: () => undefined },
        })
      }
    >
      Action
    </Button>
  );
}
