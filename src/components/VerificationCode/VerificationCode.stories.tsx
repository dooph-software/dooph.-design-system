import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { BodyText, HeadingText, LabelText } from "../Text";
import { CodeDigitInput } from "./CodeDigitInput";
import { VerificationCodeInput } from "./VerificationCodeInput";

const meta = {
  title: "Inputs/VerificationCode",
  component: VerificationCodeInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof VerificationCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {},
};

export const Partial: Story = {
  args: { defaultValue: "123" },
};

export const Filled: Story = {
  args: { defaultValue: "123456" },
};

export const Error: Story = {
  args: { defaultValue: "123456", hasError: true },
};

export const Disabled: Story = {
  args: { defaultValue: "123456", disabled: true },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <VerificationCodeInput value={value} onChange={setValue} />
        <LabelText className="text-text-secondary">
          Value: {value || "(empty)"}
        </LabelText>
      </div>
    );
  },
};

/* A static showcase of one cell in each state, so every cell is deliberately
 * `readOnly`: passing `value` with no `onChange` is a controlled field with no
 * way to change, which React warns about. `readOnly` states that intent
 * instead. Interactive entry is covered by the group stories above. */
export const SingleDigitStates: Story = {
  render: () => (
    <div className="flex items-center gap-md p-4">
      <CodeDigitInput value="" readOnly aria-label="Empty" />
      <CodeDigitInput value="1" readOnly aria-label="Filled" />
      <CodeDigitInput value="1" readOnly hasError aria-label="Error" />
      <CodeDigitInput value="1" readOnly disabled aria-label="Disabled" />
    </div>
  ),
};

/** Story-only composition — not a package component. */
export const PreRolledSection: Story = {
  render: function PreRolled() {
    const [value, setValue] = useState("");
    const [hasError, setHasError] = useState(false);
    const groupRef = useRef<HTMLDivElement>(null);
    /* Focused after commit rather than via the component's `autoFocus` prop:
     * Storybook renders inside an `act` scope, and focusing during that commit
     * trips React's "a component suspended inside an act scope" warning. The
     * prop itself is fine in an app — this is a Storybook-only accommodation. */
    useEffect(() => {
      const id = window.setTimeout(
        () => groupRef.current?.querySelector("input")?.focus(),
        0,
      );
      return () => window.clearTimeout(id);
    }, []);
    return (
      <div className="flex w-[360px] flex-col items-start gap-md p-6">
        <HeadingText>Enter verification code</HeadingText>
        <BodyText className="text-text-secondary">
          We sent a 6-digit code to your email. Enter it below to continue.
        </BodyText>
        <VerificationCodeInput
          value={value}
          onChange={(next) => {
            setHasError(false);
            setValue(next);
          }}
          hasError={hasError}
          ref={groupRef}
        />
        {hasError ? (
          <LabelText className="text-error-primary">
            That code is incorrect. Try again.
          </LabelText>
        ) : null}
        <Button
          variant={ButtonVariant.primary}
          onClick={() => {
            if (value !== "123456") setHasError(true);
          }}
        >
          Verify
        </Button>
      </div>
    );
  },
};
