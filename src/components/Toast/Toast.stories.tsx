import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonVariant } from "../Button";
import {
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  useToast,
} from "./Toast";
import { ToastVariant } from "./constants";

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
  variant?: ToastVariant;
}) {
  const { toast } = useToast();

  return (
    <Button
      variant={ButtonVariant.primary}
      onClick={() =>
        toast({
          title: label,
          description:
            variant === ToastVariant.simple ? "dashboard.fig moved to trash" : undefined,
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
      <ToastDemo label="File deleted" variant={ToastVariant.simple} />
    </ToastProvider>
  ),
};

export const Prominent: Story = {
  name: "Prominent",
  render: () => (
    <ToastProvider>
      <ToastDemo label="Published" variant={ToastVariant.prominent} />
    </ToastProvider>
  ),
};

/** Export kept as `Error` so the story URL is stable; the variant is `danger`. */
export const Danger: Story = {
  name: "Danger",
  render: () => (
    <ToastProvider>
      <ToastDemo label="Upload failed" variant={ToastVariant.danger} />
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
              variant: ToastVariant.complex,
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
        <ToastDemo label="Saved successfully" variant={ToastVariant.simple} />
        <ToastDemo label="Published" variant={ToastVariant.prominent} />
        <ToastDemo label="Upload failed" variant={ToastVariant.danger} />
        <ActionButton />
      </div>
    </ToastProvider>
  ),
};

/** `ToastProvider duration` sets the auto-dismiss delay for every toast it renders. */
export const ProviderDuration: Story = {
  name: "Provider duration (1s)",
  render: () => (
    <ToastProvider duration={1000}>
      <ToastDemo label="Gone in a second" variant={ToastVariant.simple} />
    </ToastProvider>
  ),
};

/** Composed from the exported parts, not via toast(): the prominent
 * description must stay legible without the provider's template. */
export const ComposedProminent: Story = {
  render: () => (
    <ToastProvider>
      <ToastRoot variant={ToastVariant.prominent} open duration={Infinity}>
        <div className="min-w-0 flex-1">
          <ToastTitle className="block">Published</ToastTitle>
          <ToastDescription className="block" data-testid="composed-desc">
            Your page is live
          </ToastDescription>
        </div>
      </ToastRoot>
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
          variant: ToastVariant.complex,
          action: { label: "Undo", onClick: () => undefined },
        })
      }
    >
      Action
    </Button>
  );
}
