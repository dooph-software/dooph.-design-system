import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonSize, ButtonVariant } from "../Button";
import { OutlineButton } from "../OutlineButton";
import {
  BaseText,
  BodyText,
  ButtonText,
  FontWeights,
  HeroText,
  LabelText,
  TitleText,
} from "../Text";
import { TextLink } from "../TextLink";
import { RevealChangeText } from "./RevealChangeText";
import { RollChangeText } from "./RollChangeText";
import { RollHoverText } from "./RollHoverText";
import { RollingDigitsText } from "./RollingDigitsText";
import { ShimmerText } from "./ShimmerText";
import { UnderlineLinkText } from "./UnderlineLinkText";
import { RevealDirection, RollDirection } from "./constants";

/*
 * One entry for all six animated text wrappers. They are wrappers rather than
 * BaseText props on purpose: each has to be able to wrap icons and arbitrary
 * children, not just text.
 *
 * `meta` names no `component`, because there are six. Stories are therefore
 * untyped `StoryObj` and every one is `render`-based — none reads `args`, so
 * the old per-file `args: { children: ... }` placeholders (which existed only
 * to satisfy `StoryObj<typeof meta>`) are gone.
 *
 * Export names are prefixed with their component so the six groups stay
 * legible in one sidebar list and so colliding names (Standalone,
 * LargeDisplayType, InBodyCopy, ControlledActive, DirectionUpVsDown) survive
 * the merge.
 */
const meta = {
  title: "Text/AnimatedText",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Six wrappers that animate text without owning its typography: " +
          "**ShimmerText** (a sheen masked to the glyphs), **RollHoverText** " +
          "(per-character barrel roll on hover), **RollChangeText** (old " +
          "content rolls out as new content rolls in), **RevealChangeText** (a " +
          "width-animated slot that tucks and reveals), **RollingDigitsText** " +
          "(per-place-value digit wheels for a numeric string) and " +
          "**UnderlineLinkText** (an underline that wipes and redraws). All of " +
          "them respect `prefers-reduced-motion`, and none defines a color of " +
          "its own, so dark mode needs nothing from them.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;


/* == ShimmerText =============================================================
 *
 * Masks an animated sheen across its children's glyphs (ChatGPT-style
 * "working" indicator). Shimmer tokens (`--ui-shimmer-base` / `--ui-shimmer-
 * highlight`) adapt automatically in dark mode. Children must not set an
 * explicit text color — ShimmerText owns color while active via a clipped
 * gradient.
 */

export const ShimmerWrappingButtonText: Story = {
  name: "Wrapping ButtonText",
  render: () => (
    <ShimmerText>
      <ButtonText>Generating response…</ButtonText>
    </ShimmerText>
  ),
};

export const ShimmerWrappingBodyText: Story = {
  name: "Wrapping BodyText",
  render: () => (
    <ShimmerText>
      <BodyText>Thinking through the request…</BodyText>
    </ShimmerText>
  ),
};

export const ShimmerWrappingWithFontWeightOverride: Story = {
  name: "Wrapping BodyText (fontWeight override)",
  render: () => (
    <ShimmerText>
      <BodyText fontWeight={FontWeights.semibold}>
        Composing an answer…
      </BodyText>
    </ShimmerText>
  ),
};

export const ShimmerToggleOnOff: Story = {
  name: "Toggle on/off",
  render: function ToggleOnOffStory() {
    const [active, setActive] = useState(true);
    return (
      <div className="flex flex-col items-start gap-4">
        {active ? (
          <ShimmerText>
            <ButtonText>Working on it…</ButtonText>
          </ShimmerText>
        ) : (
          <ButtonText>Done.</ButtonText>
        )}
        <Button
          variant={ButtonVariant.secondary}
          onClick={() => setActive((v) => !v)}
        >
          <ButtonText>Toggle shimmer</ButtonText>
        </Button>
      </div>
    );
  },
};


/* == RollHoverText ===========================================================
 *
 * On hover, each character rolls in place on a shallow 3D barrel and blurs
 * through the rotation, staggered so many characters are mid-roll at once.
 * Un-hovering reverses from wherever it currently sits. The text never
 * changes, so every character keeps its own slot. Triggers on its own
 * `:hover`, an ancestor `.group:hover`, or the `active` prop. The duration-
 * to-stagger ratio (~1:14) is what makes it read as one travelling wave
 * rather than discrete letter-by-letter flips.
 */

export const RollHoverInButton: Story = {
  name: "In Button",
  render: () => (
    <Button className="group">
      <ButtonText>
        <RollHoverText>Deploy now</RollHoverText>
      </ButtonText>
    </Button>
  ),
};

export const RollHoverInOutlineButton: Story = {
  name: "In OutlineButton",
  render: () => (
    <OutlineButton>
      <ButtonText>
        <RollHoverText>Deploy now</RollHoverText>
      </ButtonText>
    </OutlineButton>
  ),
};

export const RollHoverStandalone: Story = {
  name: "Standalone (self hover)",
  render: () => (
    <ButtonText>
      <RollHoverText>Deploy now</RollHoverText>
    </ButtonText>
  ),
};

export const RollHoverLargeDisplayType: Story = {
  name: "Large display type",
  parameters: {
    docs: {
      description: {
        story:
          "Hero-scale text (36px, ~2.6× button size). Because `--ui-roll-hover-depth` and " +
          "`--ui-roll-hover-perspective` are both in `em`, the depth-to-perspective ratio is " +
          "identical here and at button size — the roll should read exactly as subtle as it does " +
          "in the Button story, just larger. A px perspective would make this version look overdone.",
      },
    },
  },
  render: () => (
    <HeroText>
      <RollHoverText>Deploy now</RollHoverText>
    </HeroText>
  ),
};

export const RollHoverInBodyCopy: Story = {
  name: "In body copy (wrapping + descenders)",
  render: () => (
    <div className="max-w-[18rem]">
      <BodyText>
        Inline in a paragraph the roll must never break a word across lines, and
        it must not clip descenders — hover{" "}
        <RollHoverText>Deploy piggyback jerky</RollHoverText> and confirm the
        tails of the g, y, p and j stay intact while the letters roll.
      </BodyText>
    </div>
  ),
};

export const RollHoverDirectionUpVsDown: Story = {
  name: "Direction (up vs down)",
  parameters: {
    docs: {
      description: {
        story:
          "`direction` flips the barrel roll. `up` (default) rolls each glyph upward; `down` rolls it " +
          "downward. Hover each to compare.",
      },
    },
  },
  render: () => (
    <div className="flex gap-12">
      <HeroText>
        <RollHoverText direction={RollDirection.up}>Upward</RollHoverText>
      </HeroText>
      <HeroText>
        <RollHoverText direction={RollDirection.down}>Downward</RollHoverText>
      </HeroText>
    </div>
  ),
};

export const RollHoverControlledActive: Story = {
  name: "Controlled via active prop",
  render: function ControlledActiveStory() {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <ButtonText>
          <RollHoverText active={active}>Deploy now</RollHoverText>
        </ButtonText>
        <Button
          variant={ButtonVariant.secondary}
          onClick={() => setActive((v) => !v)}
        >
          <ButtonText>Toggle roll</ButtonText>
        </Button>
      </div>
    );
  },
};


/* == RollChangeText ==========================================================
 *
 * When content changes, the old text rolls away and blurs out while the new
 * text rolls in and settles into focus. Respects `prefers-reduced-motion`
 * (animation classes are `motion-safe:` scoped). The roll owns no color
 * tokens — it only transforms and blurs children that are already themed.
 */

const statuses = ["Queued", "Starting up", "Running", "Finalizing", "Complete"];

export const RollChangeAutoCyclingStatus: Story = {
  name: "Auto-cycling status (interval)",
  render: function AutoCyclingStatusStory() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % statuses.length);
      }, 1800);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-start gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          Job status
        </LabelText>
        <RollChangeText changeKey={statuses[index]}>
          <BodyText>{statuses[index]}</BodyText>
        </RollChangeText>
      </div>
    );
  },
};

export const RollChangeDirectionUpVsDown: Story = {
  name: "Direction (up vs down)",
  parameters: {
    docs: {
      description: {
        story:
          "`direction` flips the travel. `down` (default) settles the new value in from above; `up` " +
          "rises it in from below. Both counters below advance on the same interval.",
      },
    },
  },
  render: function DirectionStory() {
    const [n, setN] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => setN((v) => v + 1), 1500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex gap-12">
        <div className="flex flex-col items-start gap-1">
          <LabelText className="uppercase tracking-wide opacity-40">
            Down (default)
          </LabelText>
          <RollChangeText changeKey={n} direction={RollDirection.down}>
            <BodyText>{n}</BodyText>
          </RollChangeText>
        </div>
        <div className="flex flex-col items-start gap-1">
          <LabelText className="uppercase tracking-wide opacity-40">
            Up
          </LabelText>
          <RollChangeText changeKey={n} direction={RollDirection.up}>
            <BodyText>{n}</BodyText>
          </RollChangeText>
        </div>
      </div>
    );
  },
};

const models = [
  { id: "gpt-fast", name: "Fast", weight: FontWeights.regular },
  { id: "gpt-balanced", name: "Balanced", weight: FontWeights.medium },
  { id: "gpt-max", name: "Max Quality", weight: FontWeights.semibold },
];

export const RollChangeChangeKeyWithComplexChildren: Story = {
  name: "changeKey + complex children",
  render: function ChangeKeyStory() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % models.length);
      }, 1800);
      return () => clearInterval(interval);
    }, []);

    const model = models[index];

    return (
      <div className="flex flex-col items-start gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          Selected model
        </LabelText>
        <RollChangeText changeKey={model.id}>
          <BodyText fontWeight={model.weight}>{model.name}</BodyText>
        </RollChangeText>
      </div>
    );
  },
};


/* == RevealChangeText ========================================================
 *
 * A slot that slides its content out from one edge and tucks it back under
 * whatever follows. On a change the old content collapses first, then the
 * new content reveals back out from the same edge. WIDTH is the animated
 * property, so the row around it re-flows instead of snapping. Content
 * inside never rolls or fades — pair it with RollChangeText for the piece
 * that swaps its text, and use `onSettled` to start that roll once the
 * reveal has landed.
 */

const Separator = () => (
  <span aria-hidden className="pr-xxs pl-xxs text-text-tertiary">
    /
  </span>
);

export const RevealChangeRevealAndCollapse: Story = {
  name: "Reveal and collapse (null key)",
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

export const RevealChangeChangeCollapsesThenReveals: Story = {
  name: "Change (collapse, swap, reveal)",
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

export const RevealChangeDirectionLeftVsRight: Story = {
  name: "Direction (left vs right)",
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

export const RevealChangeBreadcrumbWithRollChangeText: Story = {
  name: "Breadcrumb (paired with RollChangeText)",
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


/* == RollingDigitsText =======================================================
 *
 * Per-digit 2D roll for a pre-formatted numeric string — a cash-register
 * snap rather than a 3D barrel. Wheels are keyed by PLACE VALUE, so a figure
 * aligns from the right and a grouping comma collapses together with the
 * digit it trails. Tabular figures are mandatory: the fixed slot width is
 * only correct while every digit shares one advance.
 */

/* Every story frames the figure the same way so the demos are comparable. */
function Figure({ children }: { children: string }) {
  return (
    <BaseText fontSize={28} fontWeight={FontWeights.medium}>
      <RollingDigitsText>{children}</RollingDigitsText>
    </BaseText>
  );
}

function Values({
  values,
  value,
  onPick,
}: {
  values: string[];
  value: string;
  onPick: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <Button
          key={v}
          size={ButtonSize.sm}
          variant={
            v === value ? ButtonVariant.primary : ButtonVariant.secondary
          }
          onClick={() => onPick(v)}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}

function Demo({
  values,
  caption,
  smallDecimals = false,
}: {
  values: string[];
  caption: string;
  smallDecimals?: boolean;
}) {
  const [value, setValue] = useState(values[0]);
  return (
    <div className="flex flex-col items-start gap-md p-4">
      <BaseText fontSize={28} fontWeight={FontWeights.medium}>
        {smallDecimals ? (
          <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>
            {value}
          </RollingDigitsText>
        ) : (
          <RollingDigitsText>{value}</RollingDigitsText>
        )}
      </BaseText>
      <Values values={values} value={value} onPick={setValue} />
      <BodyText className="max-w-[46ch] text-text-secondary">
        {caption}
      </BodyText>
    </div>
  );
}

export const RollingDigitsDefault: Story = {
  render: () => (
    <Demo
      values={["$1,240.00", "$3,891.45", "$2,507.62"]}
      caption="Same digit count throughout: only the wheels turn, and the figure never
        changes width."
    />
  ),
};

/* The behaviour this component was rebuilt for. Crossing a power of ten adds or
 * removes a wheel AND its grouping separator; both open and collapse from zero
 * width rather than appearing at full width, so the figure grows continuously
 * instead of snapping. */
export const RollingDigitsDigitCountChange: Story = {
  render: () => (
    <Demo
      values={["$9.99", "$99.99", "$999.99", "$1,240.00", "$12,450.00"]}
      caption="Step up and down the magnitudes. Each added place opens from zero
        width while it fades in; each departing one collapses where it stands.
        The comma belongs to the wheel it trails, so it leaves with it."
    />
  ),
};

/* Decimals are their own strip, reconciled independently — a change confined to
 * one side must leave the other alone. Losing them entirely is the case that
 * used to unmount the group before it could animate. */
export const RollingDigitsDecimalsAppearAndLeave: Story = {
  render: () => (
    <Demo
      values={["$5", "$5.2", "$5.25", "$5.250"]}
      caption="The decimal point opens with its group and collapses with it. Going
        back to a bare integer is a visible exit, not an unmount."
    />
  ),
};

export const RollingDigitsSuffixes: Story = {
  render: () => (
    <Demo
      values={["1.2M", "16.3M", "43.2M", "62.3k"]}
      caption="Prefix and suffix are simply the non-digit runs that bookend the
        string — no format flag exists or is needed. Note the suffix itself swaps
        without animating; only digits roll."
    />
  ),
};

export const RollingDigitsSmallDecimals: Story = {
  render: () => (
    <Demo
      smallDecimals
      values={["$5,746.31", "$8,102.37", "$912.04", "$74.50"]}
      caption="Decimals rendered through LabelText, raised and reduced. The size
        comes from --ui-rolling-digits-decimals-size in em of the integers, so the
        proportion holds at every figure size; the passed role supplies family,
        weight and tracking."
    />
  ),
};

/* The shapes a consumer can hand the component, rendered live and static. */
const FORMATS: Array<{ value: string; note: string }> = [
  { value: "$1,234.56", note: "standard" },
  { value: "$12,450.00", note: "separators derived from place, never parsed" },
  { value: "-$5,746.31", note: "multi-character prefix" },
  { value: "1,234", note: "no decimals group" },
  { value: "$0.99", note: "sub-unit" },
  { value: "1.2M", note: "suffix preserved" },
  { value: "98.6%", note: "not money at all" },
];

export const RollingDigitsFormats: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-sm p-4">
      {FORMATS.map((f) => (
        <div key={f.value} className="flex items-baseline gap-4">
          <BaseText
            fontSize={18}
            fontWeight={FontWeights.medium}
            className="w-[11ch]"
          >
            <RollingDigitsText>{f.value}</RollingDigitsText>
          </BaseText>
          <LabelText className="text-text-secondary">{f.note}</LabelText>
        </div>
      ))}
    </div>
  ),
};

/* The figure inherits typography from whatever wraps it, and the 1ch slots
 * resolve against that size — so the same component is correct from label to
 * hero with no size prop. */
export const RollingDigitsScales: Story = {
  render: () => {
    const [value, setValue] = useState("$982.10");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <LabelText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </LabelText>
        <BodyText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </BodyText>
        <TitleText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </TitleText>
        <Values
          values={["$982.10", "$1,240.00", "$12,450.00"]}
          value={value}
          onPick={setValue}
        />
      </div>
    );
  },
};

const ROWS = [
  { label: "Acquisition", amount: "$3,891.45" },
  { label: "Retention", amount: "$982.10" },
  { label: "Expansion", amount: "$12,450.00" },
  { label: "Services", amount: "$5,746.31" },
];
const TOTAL = "$23,069.86";

/* The motivating use case: a total that follows the pointer. Rows differ in
 * digit count on purpose, so scrubbing exercises enters and exits back to back
 * and interrupts them mid-flight. */
export const RollingDigitsTableScrub: Story = {
  render: () => {
    const [amount, setAmount] = useState(TOTAL);
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <BaseText fontSize={28} fontWeight={FontWeights.medium}>
          <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>
            {amount}
          </RollingDigitsText>
        </BaseText>
        <div
          className="flex flex-col items-start"
          onMouseLeave={() => setAmount(TOTAL)}
        >
          {ROWS.map((r) => (
            <BodyText
              key={r.label}
              className="cursor-default px-2 py-1"
              onMouseEnter={() => setAmount(r.amount)}
            >
              {r.label}
            </BodyText>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Hover the rows; leave to return to the total.
        </BodyText>
      </div>
    );
  },
};

/* A ticker crosses magnitudes continuously and at a rate that guarantees
 * changes land while the previous animation is still running — the state the
 * component has to survive without stranding a wheel. */
export const RollingDigitsLiveTicker: Story = {
  render: () => {
    const [cents, setCents] = useState(87_432);
    useEffect(() => {
      const id = window.setInterval(
        () =>
          setCents((c) =>
            Math.max(80, Math.round(c * (1 + (Math.random() - 0.48) * 0.35))),
          ),
        700,
      );
      return () => window.clearInterval(id);
    }, []);
    const value = (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <Figure>{value}</Figure>
        <BodyText className="max-w-[46ch] text-text-secondary">
          Random walk every 700ms, wide enough to cross magnitudes. Watch the
          width: it should only ever glide.
        </BodyText>
      </div>
    );
  },
};


/* == UnderlineLinkText =======================================================
 *
 * An underline that wipes out to the right and redraws from the left on
 * hover. The line is a `currentColor` gradient in `background`, so it tracks
 * this element’s own colour — set the colour HERE or ABOVE; a child setting
 * its own colour paints glyphs but not the line. Responds to its own
 * `:hover`, an ancestor `.group:hover`, or the `active` prop.
 */

export const UnderlineLinkStandalone: Story = {
  name: "Standalone (self hover)",
  render: () => (
    <BodyText>
      <UnderlineLinkText>Changelog</UnderlineLinkText>
    </BodyText>
  ),
};

export const UnderlineLinkThickness: Story = {
  name: "Stroke weight (thickness prop)",
  parameters: {
    docs: {
      description: {
        story:
          "`thickness` sets the underline stroke weight — a number is px, or pass any CSS length " +
          '(e.g. `"0.15em"`).',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <BodyText>
        <UnderlineLinkText>Default</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness={2}>2px</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness={4}>4px</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness="0.2em">
          0.2em (scales with text)
        </UnderlineLinkText>
      </BodyText>
    </div>
  ),
};

export const UnderlineLinkOffset: Story = {
  name: "Gap under text (offset prop)",
  parameters: {
    docs: {
      description: {
        story:
          "`offset` is the distance below the em-square bottom. `0` sits flush at the em bottom; " +
          "negative pulls into the glyphs; larger positive values push further down.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <BodyText>
        <UnderlineLinkText offset={0}>offset 0</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText>Default token</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText offset="0.2em">offset 0.2em</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText offset="-0.05em">
          offset -0.05em (into glyphs)
        </UnderlineLinkText>
      </BodyText>
    </div>
  ),
};

export const UnderlineLinkInTextLink: Story = {
  name: "In TextLink (inherits hover color)",
  parameters: {
    docs: {
      description: {
        story:
          "Color lives on TextLink (the ancestor). UnderlineLinkText uses `currentColor`, so the " +
          "underline tracks TextLink's ghost → active color change on hover with no color prop.",
      },
    },
  },
  render: () => (
    <TextLink href="#">
      <UnderlineLinkText>View the changelog</UnderlineLinkText>
    </TextLink>
  ),
};

export const UnderlineLinkLargeDisplayType: Story = {
  name: "Large display type",
  parameters: {
    docs: {
      description: {
        story:
          "Hero-scale text. Because the thickness and offset are in `em`, the underline scales " +
          "proportionally with the text — it reads as the same weight here as it does in body copy.",
      },
    },
  },
  render: () => (
    <HeroText>
      <UnderlineLinkText>Read more</UnderlineLinkText>
    </HeroText>
  ),
};

export const UnderlineLinkInBodyCopy: Story = {
  name: "In body copy (wrapping + descenders)",
  render: () => (
    <div className="max-w-[18rem]">
      <BodyText>
        Inline in a paragraph the underline must wrap cleanly across lines and
        never clip the tails of descenders — hover{" "}
        <UnderlineLinkText>
          this piggyback jerky typography link
        </UnderlineLinkText>{" "}
        and confirm the g, y, p and j stay intact while the line sweeps.
      </BodyText>
    </div>
  ),
};

export const UnderlineLinkControlledActive: Story = {
  name: "Controlled via active prop",
  render: function ControlledActiveStory() {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <BodyText>
          <UnderlineLinkText active={active}>Changelog</UnderlineLinkText>
        </BodyText>
        <Button
          variant={ButtonVariant.secondary}
          onClick={() => setActive((v) => !v)}
        >
          Toggle sweep
        </Button>
      </div>
    );
  },
};
