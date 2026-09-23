import type { Meta, StoryObj } from "@storybook/react";
import {
  AIPlanIcon,
  AISkillIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  AttachFileIcon,
  IconSize,
  TagIcon,
} from "../Icons";
import { ButtonText } from "../Text";
import { Sticker } from "./Sticker";
import { StickerVariant } from "./constants";

const meta = {
  title: "Bits & Pieces/Sticker",
  component: Sticker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(StickerVariant),
    },
  },
} satisfies Meta<typeof Sticker>;

export default meta;
type Story = StoryObj<typeof meta>;

const label = (text: string) => <ButtonText>{text}</ButtonText>;

export const Prominent: Story = {
  args: {
    variant: StickerVariant.prominent,
    children: (
      <>
        <AIPlanIcon size={IconSize.md} />
        {label("Milestones")}
      </>
    ),
  },
};

export const Secondary: Story = {
  args: {
    variant: StickerVariant.secondary,
    children: (
      <>
        <TagIcon size={IconSize.md} />
        {label("Constants")}
      </>
    ),
  },
};

export const Alternate: Story = {
  args: {
    variant: StickerVariant.alternate,
    children: (
      <>
        {label("Profit")}
        <ArrowUpRightIcon size={IconSize.md} />
      </>
    ),
  },
};

export const Tertiary: Story = {
  args: {
    variant: StickerVariant.tertiary,
    children: (
      <>
        <AttachFileIcon size={IconSize.md} />
        {label("Files")}
      </>
    ),
  },
};

export const Danger: Story = {
  args: {
    variant: StickerVariant.danger,
    children: (
      <>
        {label("Loss")}
        <ArrowDownRightIcon size={IconSize.md} />
      </>
    ),
  },
};

/** `custom` has no palette — `color` is required, and the wash is that colour
 * at `--ui-sticker-bg-opacity`. This story uses a raw hex so it cannot be
 * mistaken for one of the built-in variants. */
export const Custom: Story = {
  args: {
    variant: StickerVariant.custom,
    color: "#ff7700",
    children: (
      <>
        <AISkillIcon size={IconSize.md} />
        {label("Skills")}
      </>
    ),
  },
};

export const AllVariants: Story = {
  args: { children: "Milestones" },
  render: () => (
    <div className="flex flex-col items-start gap-sm">
      <Sticker variant={StickerVariant.prominent}>
        <AIPlanIcon size={IconSize.md} />
        {label("Milestones")}
      </Sticker>
      <Sticker variant={StickerVariant.secondary}>
        <TagIcon size={IconSize.md} />
        {label("Constants")}
      </Sticker>
      <Sticker variant={StickerVariant.alternate}>
        {label("Profit")}
        <ArrowUpRightIcon size={IconSize.md} />
      </Sticker>
      <Sticker variant={StickerVariant.tertiary}>
        <AttachFileIcon size={IconSize.md} />
        {label("Files")}
      </Sticker>
      <Sticker variant={StickerVariant.danger}>
        {label("Loss")}
        <ArrowDownRightIcon size={IconSize.md} />
      </Sticker>
      <Sticker variant={StickerVariant.custom} color="#ff7700">
        <AISkillIcon size={IconSize.md} />
        {label("Skills")}
      </Sticker>
    </div>
  ),
};
