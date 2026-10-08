import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, ButtonVariant } from "../Button";
import { ChevronDownIcon } from "../Icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../Menu";
import {
  CloverShape,
  CookieShape,
  PentagonShape,
  PixircleShape,
  PuffShape,
  SquircleShape,
} from "../Shapes";
import { ButtonText } from "../Text";
import { MorphRotationShape } from "./MorphRotationShape";
import { MorphRotationShapeMode } from "./constants";

const meta = {
  title: "Progress/MorphRotationShape",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;
type Story = StoryObj;

function ControlledDemo({ shapes, restingAngle }: { shapes: typeof CloverShape[]; restingAngle?: number }) {
  const [index, setIndex] = useState(0);
  const [landed, setLanded] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="relative block size-[120px] text-primary">
        <MorphRotationShape
          mode={MorphRotationShapeMode.controlled}
          shapes={shapes}
          activeIndex={index}
          restingAngle={restingAngle}
          onStepComplete={setLanded}
          className="absolute inset-[11px]"
        />
      </span>
      <div className="flex gap-2">
        <Button variant={ButtonVariant.secondary} onClick={() => setIndex((i) => i - 1)}>
          <ButtonText>Previous</ButtonText>
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={() => setIndex((i) => i + 1)}>
          <ButtonText>Next</ButtonText>
        </Button>
      </div>
      <ButtonText>landed on {landed}</ButtonText>
    </div>
  );
}

/** Each click: one spring step (morph + 90° turn with backspin), then rest. */
export const Controlled: Story = {
  render: () => <ControlledDemo shapes={[CookieShape, CloverShape, PuffShape, SquircleShape]} />,
};

/** Two shapes: a one-shot toggle. */
export const TwoShapeToggle: Story = {
  render: () => <ControlledDemo shapes={[CookieShape, CloverShape]} />,
};

/** Pentagon (no symmetry about the frame centre) forces 360° steps to rest upright. */
export const RestingAngle: Story = {
  render: () => <ControlledDemo shapes={[CloverShape, PentagonShape, PixircleShape]} restingAngle={0} />,
};

/**
 * Figma 874:1682 / 874:1723 — a caret frame in a dropdown trigger. The trigger
 * passes no props: Radix sets data-state=open and CSS moves the target.
 * 31px frame, 2.5px inset = the ~9% spill budget around a 26px shape.
 */
export const EmbeddedDropdownCaret: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={ButtonVariant.secondary} className="group">
          <ButtonText>Users</ButtonText>
          <span className="relative inline-flex size-[31px] items-center justify-center">
            <MorphRotationShape
              mode={MorphRotationShapeMode.embedded}
              shapes={[CloverShape, PuffShape]}
              className="absolute inset-[2.5px] text-primary transition-colors group-data-[state=open]:text-prominent group-data-[state=open]:[--ds-shape-morph-target:1]"
            />
            <span className="relative text-primary-fg transition-transform group-data-[state=open]:rotate-180">
              <ChevronDownIcon size={14} />
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <ButtonText>Everyone</ButtonText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Contradicts the token defaults on purpose: a slow, linear step. */
export const TimingOverride: Story = {
  render: () => (
    <span className="relative block size-[120px] text-prominent">
      <MorphRotationShape
        mode={MorphRotationShapeMode.autoplay}
        shapes={[CloverShape, SquircleShape]}
        timing={{ duration: 1200, ease: "linear", interval: 1600, passiveSpinDuration: 0 }}
        className="absolute inset-0"
      />
    </span>
  ),
};
