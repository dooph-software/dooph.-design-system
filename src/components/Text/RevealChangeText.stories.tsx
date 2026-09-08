import { useCallback, useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RevealChangeText } from "./RevealChangeText";
import { RollChangeText } from "./RollChangeText";
import { BodyText, ButtonText, LabelText } from "./BaseText";
import { RevealDirection } from "./constants";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";

const meta = {
  title: "Primitives/RevealChangeText",
  component: RevealChangeText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A slot that slides its content out from one edge and tucks it back under whatever follows. " +
          "On a change the old content collapses first, then the new content reveals back out from the " +
          "same edge. WIDTH is the animated property, so the row around it re-flows (and re-centres) " +
          "instead of snapping. Content inside never rolls or fades — pair it with RollChangeText for " +
          "the piece that swaps its text, and use `onSettled` to start that roll once the reveal has " +
          "landed. Respects `prefers-reduced-motion` (timings collapse to ~0). No color tokens of its " +
          "own, so dark mode needs nothing.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RevealChangeText>;

export default meta;
type Story = StoryObj<typeof meta>;

const Separator = () => (
  <span aria-hidden className="pr-xxs pl-xxs text-text-tertiary">
    /
  </span>
);

export const RevealAndCollapse: Story = {
  name: "Reveal and collapse (null key)",
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          "`changeKey={null}` collapses the slot and leaves it collapsed. The row re-centres as the " +
          "width eases, which is the whole reason width animates rather than a transform.",
      },
    },
  },
  render: function RevealAndCollapseStory() {
    const [shown, setShown] = useState(true);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row items-center">
          <RevealChangeText changeKey={shown ? "Projects" : null}>
            <BodyText className="text-text-secondary">Projects</BodyText>
            <Separator />
          </RevealChangeText>
          <BodyText className="whitespace-nowrap">Overview</BodyText>
        </div>
        <Button
          variant={ButtonVariant.secondary}
          size={ButtonSize.sm}
          onClick={() => setShown((v) => !v)}
        >
          <ButtonText>{shown ? "Collapse" : "Reveal"}</ButtonText>
        </Button>
      </div>
    );
  },
};

const sections = ["Projects", "Settings", "Billing"];

export const ChangeCollapsesThenReveals: Story = {
  name: "Change (collapse, swap, reveal)",
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          "When the key changes with content already on screen, the slot runs both halves back to " +
          "back: the old value tucks away, the content swaps while nothing is visible, and the new " +
          "value slides back out. Rapid changes land on the newest value, not the one that started " +
          "the collapse.",
      },
    },
  },
  render: function ChangeStory() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(
        () => setIndex((i) => (i + 1) % sections.length),
        2400,
      );
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-row items-center">
        <RevealChangeText changeKey={sections[index]}>
          <BodyText className="text-text-secondary">{sections[index]}</BodyText>
          <Separator />
        </RevealChangeText>
        <BodyText className="whitespace-nowrap">Overview</BodyText>
      </div>
    );
  },
};

export const DirectionLeftVsRight: Story = {
  name: "Direction (left vs right)",
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          "`direction` picks the edge the content is pinned to. `left` (default) pins the RIGHT edge, " +
          "so the content tucks under what follows it — the breadcrumb-stem case. `right` pins the " +
          "LEFT edge, so the content grows rightward into the space after it. Both toggle together.",
      },
    },
  },
  render: function DirectionStory() {
    const [shown, setShown] = useState(true);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center">
            <RevealChangeText
              changeKey={shown ? "Projects" : null}
              direction={RevealDirection.left}
            >
              <BodyText className="text-text-secondary">Projects</BodyText>
              <Separator />
            </RevealChangeText>
            <BodyText className="whitespace-nowrap">Left (default)</BodyText>
          </div>
          <div className="flex flex-row items-center">
            <BodyText className="whitespace-nowrap">Right</BodyText>
            <RevealChangeText
              changeKey={shown ? "Projects" : null}
              direction={RevealDirection.right}
            >
              <Separator />
              <BodyText className="text-text-secondary">Projects</BodyText>
            </RevealChangeText>
          </div>
        </div>
        <Button
          variant={ButtonVariant.secondary}
          size={ButtonSize.sm}
          onClick={() => setShown((v) => !v)}
        >
          <ButtonText>{shown ? "Collapse both" : "Reveal both"}</ButtonText>
        </Button>
      </div>
    );
  },
};

const routes = [
  { stem: null, title: "Home" },
  { stem: "Projects", title: "Overview" },
  { stem: "Projects", title: "Activity" },
  { stem: "Settings", title: "Members" },
  { stem: null, title: "Search" },
];

/** Beat between the slot settling and the title being allowed to roll. */
const TITLE_HOLD_MS = 110;

export const BreadcrumbWithRollChangeText: Story = {
  name: "Breadcrumb (paired with RollChangeText)",
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          "The pairing this component was extracted from. The stem reveals or collapses first; the " +
          "title rolls after. The title is DEFERRED behind the slot — it only catches up once " +
          "`onSettled` fires, and then only after a short hold, so the reveal finishes and settles " +
          "before the roll starts. Navigating inside one stem leaves the slot idle, so that case — " +
          "the common one — rolls immediately with no hold. Cycles: Home → Projects/Overview → " +
          "Projects/Activity (same stem, no slide) → Settings/Members → Search.",
      },
    },
  },
  render: function BreadcrumbStory() {
    const [index, setIndex] = useState(0);
    const route = routes[index];

    useEffect(() => {
      const interval = setInterval(
        () => setIndex((i) => (i + 1) % routes.length),
        2600,
      );
      return () => clearInterval(interval);
    }, []);

    /* The title waits for the slot. `pending` is set on the render where the
     * stem VALUE changed, which is exactly when a slide is about to run; every
     * other navigation releases the title immediately. */
    const [displayedTitle, setDisplayedTitle] = useState(route.title);
    const [stem, setStem] = useState(route.stem);
    const [pending, setPending] = useState(false);

    if (stem !== route.stem) {
      setStem(route.stem);
      setPending(true);
    }
    if (!pending && displayedTitle !== route.title) {
      setDisplayedTitle(route.title);
    }

    /* onSettled is stable here, so the slot's own guard is enough; the hold
     * lives in a timer rather than in the callback so the reveal is allowed to
     * come to rest first. */
    const onSettled = useCallback(() => setPending(false), []);
    useEffect(() => {
      if (pending) return;
      const timer = window.setTimeout(
        () => setDisplayedTitle(route.title),
        TITLE_HOLD_MS,
      );
      return () => window.clearTimeout(timer);
    }, [pending, route.title]);

    return (
      <div className="flex flex-col items-center gap-3">
        <LabelText className="tracking-wide uppercase opacity-40">
          Dashboard top bar
        </LabelText>
        <div className="flex w-96 flex-row items-center justify-center">
          <RevealChangeText changeKey={stem} onSettled={onSettled}>
            <BodyText className="text-text-secondary">{stem}</BodyText>
            <Separator />
          </RevealChangeText>
          <RollChangeText changeKey={displayedTitle}>
            <BodyText className="whitespace-nowrap">{displayedTitle}</BodyText>
          </RollChangeText>
        </div>
      </div>
    );
  },
};
