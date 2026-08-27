import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { BodyText, HeadingText, LabelText } from "../Text";
import { CodeDigitInput } from "./CodeDigitInput";
import { VerificationCodeInput } from "./VerificationCodeInput";

const meta = {
  title: "Buttons & inputs/VerificationCode",
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

export const SingleDigitStates: Story = {
  render: () => (
    <div className="flex items-center gap-md p-4">
      <CodeDigitInput value="" aria-label="Empty" />
      <CodeDigitInput value="1" aria-label="Filled" />
      <CodeDigitInput value="1" hasError aria-label="Error" />
      <CodeDigitInput value="1" disabled aria-label="Disabled" />
    </div>
  ),
};

/** Story-only composition — not a package component. */
export const PreRolledSection: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const [hasError, setHasError] = useState(false);
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
          autoFocus
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
