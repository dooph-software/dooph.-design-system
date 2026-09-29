import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, ButtonVariant } from "../Button";
import { ButtonText } from "../Text";
import { DropdownCaret } from "./DropdownCaret";
import { DropdownCaretVariant } from "./constants";

const meta = { title: "Menus/DropdownCaret", parameters: { layout: "centered" } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** A stand-in host: any element with the host class, a 1px border and the trigger height. */
const Host = ({ state, disabled, variant }: { state: "open" | "closed"; disabled?: boolean; variant: DropdownCaretVariant }) => (
  <div
    className="ds-dropdown-caret-host inline-flex h-button min-w-40 items-center justify-end rounded-tight border border-solid border-border-primary bg-secondary"
    data-state={state}
    data-disabled={disabled ? "" : undefined}
  >
    <DropdownCaret variant={variant} />
  </div>
);

/** Figma 887:1825: every State × Color × TriggerVariant. Hover any closed/open host to see the nudge. */
export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {Object.values(DropdownCaretVariant).map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <ButtonText>{variant}</ButtonText>
          <Host variant={variant} state="closed" />
          <Host variant={variant} state="open" />
          <Host variant={variant} state="closed" disabled />
        </div>
      ))}
    </div>
  ),
};

function InteractiveDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <Host variant={DropdownCaretVariant.typeable} state={open ? "open" : "closed"} />
      <Button variant={ButtonVariant.secondary} onClick={() => setOpen((o) => !o)}>
        <ButtonText>{open ? "Close" : "Open"}</ButtonText>
      </Button>
    </div>
  );
}

/** Toggle open with the button; hover the host for the nudge in either state. */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
