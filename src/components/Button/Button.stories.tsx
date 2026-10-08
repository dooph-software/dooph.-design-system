import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconSize, NewChatIcon, SidebarLeftIcon } from "../Icons";
import { LabelText } from "../Text";
import { Button } from "./Button";
import { ButtonSize, ButtonVariant } from "./constants";

const meta = {
  title: "Buttons/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(ButtonVariant),
    },
    size: {
      control: "select",
      options: Object.values(ButtonSize),
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Button", variant: ButtonVariant.primary },
};
export const Secondary: Story = {
  args: { children: "Button", variant: ButtonVariant.secondary },
};
export const Prominent: Story = {
  name: "Prominent",
  args: { children: "Button", variant: ButtonVariant.prominent },
};
export const Danger: Story = {
  args: { children: "Button", variant: ButtonVariant.danger },
};
export const Ghost: Story = {
  args: { children: "Button", variant: ButtonVariant.ghost },
};
export const Text: Story = {
  args: { children: "Button", variant: ButtonVariant.text },
};
export const Small: Story = {
  args: {
    children: "Button",
    variant: ButtonVariant.primary,
    size: ButtonSize.sm,
  },
};
export const Medium: Story = {
  args: {
    children: "Button",
    variant: ButtonVariant.primary,
    size: ButtonSize.medium,
  },
};
export const Big: Story = {
  args: {
    children: "Button",
    variant: ButtonVariant.prominent,
    size: ButtonSize.big,
  },
};
export const Disabled: Story = {
  args: { children: "Button", variant: ButtonVariant.primary, disabled: true },
};

/** `asChild` renders the consumer's element (here a link) with the button's styling. */
export const AsChild: Story = {
  render: () => (
    <Button asChild variant={ButtonVariant.primary}>
      <a href="#settings">Settings</a>
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {Object.values(ButtonVariant).map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <Button variant={ButtonVariant.primary} size={ButtonSize.big}>
        Big
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.medium}>
        Medium
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.standard}>
        Standard
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.sm}>
        Small
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.icon}>
        <SidebarLeftIcon />
      </Button>
    </div>
  ),
};

export const DisabledAll: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(
        Object.values(ButtonVariant).filter(
          (v) => v !== ButtonVariant.text,
        ) as ButtonVariant[]
      ).map((v) => (
        <Button key={v} variant={v} disabled>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const IconSizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {[ButtonVariant.ghost, ButtonVariant.secondary, ButtonVariant.primary].map(
        (variant) => (
          <div key={variant} className="flex items-center gap-4">
            <div className="w-20">
              <LabelText className="text-text-secondary">{variant}</LabelText>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.icon}>
                <SidebarLeftIcon size={IconSize.rg} />
              </Button>
              <LabelText className="text-text-secondary">icon (38px)</LabelText>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.iconSm}>
                <SidebarLeftIcon size={IconSize.rg} />
              </Button>
              <LabelText className="text-text-secondary">
                icon-sm (34px)
              </LabelText>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.iconMicro}>
                <SidebarLeftIcon size={IconSize.rg} />
              </Button>
              <LabelText className="text-text-secondary">
                icon-micro (26px)
              </LabelText>
            </div>
          </div>
        ),
      )}
    </div>
  ),
};

/** Medium (46px) and big (54px) pills: prominent, primary and secondary only.
 * Danger, ghost and text have no pill sizes — the type rejects them. */
const pillVariants = [
  ButtonVariant.prominent,
  ButtonVariant.primary,
  ButtonVariant.secondary,
] as const;
const pillSizes = [ButtonSize.big, ButtonSize.medium] as const;

export const PillSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-lg p-lg">
      {pillSizes.map((size) => (
        <div key={size} className="flex flex-col gap-md">
          {[false, true].map((disabled) => (
            <div key={String(disabled)} className="flex items-center gap-md">
              <div className="w-20">
                <LabelText className="text-text-secondary">
                  {disabled ? `${size} disabled` : size}
                </LabelText>
              </div>
              {pillVariants.map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  size={size}
                  disabled={disabled}
                >
                  <NewChatIcon size={IconSize.md} />
                  New Chat
                </Button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
