import type { Meta, StoryObj } from "@storybook/react";
import { AIPlanIcon, IconSize } from "../../../../../../src/components/Icons";
import { ButtonText } from "../../../../../../src/components/Text";
import { Sticker } from "../../../../../../src/components/Sticker/Sticker";
import { StickerSize, StickerVariant } from "../../../../../../src/components/Sticker/constants";
const meta = {
  title: "Bits & Pieces/Sticker", component: Sticker, parameters: { layout: "centered" }, tags: ["autodocs"],
  argTypes: { variant: { control: "select", options: Object.values(StickerVariant) }, size: { control: "inline-radio", options: Object.values(StickerSize) } },
} satisfies Meta<typeof Sticker>;
export default meta;
type Story = StoryObj<typeof meta>;
const label = (text: string) => <ButtonText>{text}</ButtonText>;
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-sm">
      {([StickerSize.standard, StickerSize.micro] as const).map((size) => (
        <Sticker key={size} variant={StickerVariant.prominent} size={size}>
          <AIPlanIcon size={IconSize.md} />
          {label("Milestones")}
        </Sticker>
      ))}
    </div>
  ),
};
