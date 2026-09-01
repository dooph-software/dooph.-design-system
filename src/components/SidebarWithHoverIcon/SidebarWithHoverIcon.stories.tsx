import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { IconSize } from "../Icons";
import { SidebarLeftHoverIcon } from "../Icons/SidebarLeftHoverIcon";
import { SidebarLeftIcon } from "../Icons/SidebarLeftIcon";
import { SidebarRightHoverIcon } from "../Icons/SidebarRightHoverIcon";
import { SidebarRightIcon } from "../Icons/SidebarRightIcon";
import { BodyText, LabelText } from "../Text";
import { SidebarIconSide } from "./constants";
import { SidebarWithHoverIcon } from "./SidebarWithHoverIcon";

const meta = {
  title: "Icons/SidebarWithHoverIcon",
  component: SidebarWithHoverIcon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "select", options: Object.values(SidebarIconSide) },
    hovered: { control: "boolean" },
  },
} satisfies Meta<typeof SidebarWithHoverIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The whole wiring, and the reason `hovered` is controlled: the icon has no
 * interactive surface of its own, so the button that owns the pointer owns the
 * hover state too. Clicking flips `side`, which is what makes the rail traverse.
 */
function SidebarToggle({
  size = IconSize.medium,
  initialSide = SidebarIconSide.left,
}: {
  size?: string | number;
  initialSide?: SidebarIconSide;
}) {
  const [side, setSide] = useState<SidebarIconSide>(initialSide);
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      variant={ButtonVariant.ghost}
      size={ButtonSize.icon}
      aria-label={`Move sidebar to the ${
        side === SidebarIconSide.left ? "right" : "left"
      }`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={() =>
        setSide((s) =>
          s === SidebarIconSide.left
            ? SidebarIconSide.right
            : SidebarIconSide.left,
        )
      }
    >
      <SidebarWithHoverIcon side={side} hovered={hovered} size={size} />
    </Button>
  );
}

/* The case the geometry was built around: click while hovered. The chevron has
 * to cross the frame AND reverse. It flattens at the midpoint because the
 * outward direction is interpolated rather than branched on. */
export const Toggle: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-md p-4">
      <SidebarToggle />
      <BodyText className="max-w-[42ch] text-center text-text-secondary">
        Hover to pull the rail into a chevron pointing where the panel will go.
        Click without moving the pointer — the chevron flattens as it crosses the
        frame and re-forms pointing the other way.
      </BodyText>
    </div>
  ),
};

export const Left: Story = { args: { side: SidebarIconSide.left } };
export const Right: Story = { args: { side: SidebarIconSide.right } };

/* Contradicts the default on purpose: `hovered` must hold the chevron with no
 * pointer anywhere near it, or the prop is doing nothing. */
export const HeldHovered: Story = {
  args: { side: SidebarIconSide.left, hovered: true, size: IconSize.medium },
};

/* At hovered = 1 the animated icon must be indistinguishable from the static
 * pose icons. If these two rows disagree, PULL/BULGE has drifted from the
 * SidebarLeftHoverIcon / SidebarRightHoverIcon paths. */
export const MatchesStaticPoses: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      {(
        [
          [SidebarIconSide.left, SidebarLeftIcon, SidebarLeftHoverIcon],
          [SidebarIconSide.right, SidebarRightIcon, SidebarRightHoverIcon],
        ] as const
      ).map(([side, Rest, Hover]) => (
        <div key={side} className="flex items-center gap-6">
          <LabelText className="w-[3.5rem] text-text-secondary">
            {side}
          </LabelText>
          {(
            [
              ["rest", <Rest key="r" size={IconSize.medium} />, false],
              ["hover", <Hover key="h" size={IconSize.medium} />, true],
            ] as const
          ).map(([label, staticIcon, hovered]) => (
            <div key={label} className="flex items-center gap-2">
              {staticIcon}
              <SidebarWithHoverIcon
                side={side}
                hovered={hovered}
                size={IconSize.medium}
              />
              <LabelText className="text-text-secondary">{label}</LabelText>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/* The pose travels ~1.9 of 24 user units, so how legible the motion is depends
 * entirely on rendered size. This row is where to judge that. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-4">
      {(
        [
          [IconSize.tiny, "tiny · 12"],
          [IconSize.standard, "standard · 14"],
          [IconSize.medium, "medium · 16"],
          [24, "24"],
          [40, "40"],
        ] as const
      ).map(([size, label]) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <SidebarToggle size={size} />
          <LabelText className="text-text-secondary">{label}</LabelText>
        </div>
      ))}
    </div>
  ),
};
