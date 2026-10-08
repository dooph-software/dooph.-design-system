import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonVariant } from "../Button";
import { BodyText } from "../Text";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="p-lg">
        <BodyText>Anchored panel content.</BodyText>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignedEnd: Story = {
  render: () => (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={ButtonVariant.secondary}>Aligned end</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-lg">
          <BodyText>Right-aligned to the trigger.</BodyText>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Not portalled</Button>
      </PopoverTrigger>
      <PopoverContent portal={false} className="p-lg">
        <BodyText>Rendered in place rather than in a portal.</BodyText>
      </PopoverContent>
    </Popover>
  ),
};
