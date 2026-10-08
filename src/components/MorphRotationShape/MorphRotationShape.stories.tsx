import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonVariant } from "../Button";
import {
  CloverShape,
  CookieShape,
  PentagonShape,
  PixircleShape,
  PuffShape,
  Shapes,
  SquircleShape,
} from "../Shapes";
import { ButtonText } from "../Text";
import { MorphRotationShape, type MorphRotationShapeProps } from "./MorphRotationShape";
import { MorphRotationShapeMode } from "./constants";

const meta = {
  title: "Progress/MorphRotationShape",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;
type Story = StoryObj;

function ControlledDemo({ shapes, restingAngle }: { shapes: MorphRotationShapeProps["shapes"]; restingAngle?: number }) {
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

/** `Shapes` keys instead of components: the serialisable form a Server Component can pass. */
export const ShapeKeys: Story = {
  render: () => <ControlledDemo shapes={[Shapes.clover, Shapes.puff, Shapes.squircle]} />,
};

/* Embedded mode inside a trigger: see Menus/DropdownCaret, the shipped embedding. */

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

/** A consumer ref must reach the span WITHOUT displacing the component's own:
 *  the status shows the span's tag, and every click still lands a step. */
function ForwardedRefDemo() {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [landed, setLanded] = useState(0);
  const [tag, setTag] = useState("–");
  useEffect(() => setTag(ref.current?.tagName ?? "null"), []);
  return (
    <div className="flex flex-col items-center gap-lg">
      <span className="relative block size-[120px] text-primary">
        <MorphRotationShape
          ref={ref}
          mode={MorphRotationShapeMode.controlled}
          shapes={[CloverShape, PuffShape]}
          activeIndex={index}
          onStepComplete={() => setLanded((n) => n + 1)}
          className="absolute inset-[11px]"
        />
      </span>
      <Button variant={ButtonVariant.secondary} onClick={() => setIndex((i) => i + 1)}>
        <ButtonText>Next shape</ButtonText>
      </Button>
      <ButtonText>ref: {tag} · landed: {landed}</ButtonText>
    </div>
  );
}

export const ForwardedRef: Story = { render: () => <ForwardedRefDemo /> };
