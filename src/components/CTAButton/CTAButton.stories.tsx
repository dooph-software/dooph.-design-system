import type { Meta, StoryObj } from "@storybook/react";
import { DownloadIcon } from "../Icons";
import { CTAButton } from "./CTAButton";
import { CTAButtonSize, CTAButtonVariant } from "./constants";

const meta = {
  title: "Buttons/CTAButton",
  component: CTAButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    size: {
      control: "select",
      options: Object.values(CTAButtonSize),
    },
    variant: {
      control: "select",
      options: Object.values(CTAButtonVariant),
    },
    asChild: { control: "boolean" },
  },
} satisfies Meta<typeof CTAButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const downloadIcon = <DownloadIcon size={20} />;

export const PrimaryStandard: Story = {
  args: {
    text: "Download for Mac",
    href: "#",
    icon: downloadIcon,
    size: CTAButtonSize.standard,
    variant: CTAButtonVariant.primary,
  },
};

export const PrimaryBig: Story = {
  args: {
    text: "Get started",
    href: "#",
    icon: downloadIcon,
    size: CTAButtonSize.big,
    variant: CTAButtonVariant.primary,
  },
};

export const SecondaryStandard: Story = {
  args: {
    text: "View docs",
    href: "#",
    icon: downloadIcon,
    size: CTAButtonSize.standard,
    variant: CTAButtonVariant.secondary,
  },
};

export const SecondaryBig: Story = {
  args: {
    text: "Talk to us",
    href: "#",
    icon: downloadIcon,
    size: CTAButtonSize.big,
    variant: CTAButtonVariant.secondary,
  },
};

export const AsChildButton: Story = {
  name: "asChild with button",
  args: {
    text: "Continue",
    icon: downloadIcon,
    size: CTAButtonSize.standard,
    variant: CTAButtonVariant.primary,
  },
  render: (args) => (
    <CTAButton asChild {...args}>
      <button type="button" onClick={() => alert("CTA clicked")} />
    </CTAButton>
  ),
};

export const AllVariants: Story = {
  args: {
    text: "Primary standard",
    href: "#",
    icon: downloadIcon,
  },
  render: () => (
    <div className="flex flex-col items-start gap-md">
      <CTAButton
        text="Primary standard"
        href="#"
        icon={downloadIcon}
        size={CTAButtonSize.standard}
        variant={CTAButtonVariant.primary}
      />
      <CTAButton
        text="Primary big"
        href="#"
        icon={downloadIcon}
        size={CTAButtonSize.big}
        variant={CTAButtonVariant.primary}
      />
      <CTAButton
        text="Secondary standard"
        href="#"
        icon={downloadIcon}
        size={CTAButtonSize.standard}
        variant={CTAButtonVariant.secondary}
      />
      <CTAButton
        text="Secondary big"
        href="#"
        icon={downloadIcon}
        size={CTAButtonSize.big}
        variant={CTAButtonVariant.secondary}
      />
    </div>
  ),
};
