import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  BaseText,
  BodyText,
  ButtonText,
  HeadingText,
  HeroText,
  LabelText,
  SubheadingText,
  TitleText,
} from './BaseText';
import {
  FontAxes,
  FontSizes,
  FontWeights,
  Fonts,
  TextVariant,
  Tracking,
} from './constants';

const meta = {
  title: 'Primitives/BaseText',
  component: BaseText,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every visible string renders through BaseText. Typography resolves in three tiers: **props** (written inline, always win) → **className** (the consumer’s own utilities) → **role class** (`.text-style-*`, in the `components` layer so utilities can override it). Prop values come from the dot-accessible constants, which resolve to `var(--ui-*)` so a consuming project’s token overrides still apply — or from raw CSS values and numbers.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: Object.values(TextVariant) },
    font: { control: 'select', options: Object.values(Fonts) },
    fontSize: { control: 'select', options: Object.values(FontSizes) },
    fontWeight: { control: 'select', options: Object.values(FontWeights) },
    letterSpacing: { control: 'select', options: Object.values(Tracking) },
    lineHeight: { control: 'text' },
    unstyled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { children: 'The quick brown fox jumps over the lazy dog' },
} satisfies Meta<typeof BaseText>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── helpers ─────────────────────────────────────────────────────────── */

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-baseline gap-md border-b border-border-primary py-sm">
    <LabelText className="w-[14rem] shrink-0 text-text-tertiary">
      {label}
    </LabelText>
    <div className="min-w-0">{children}</div>
  </div>
);

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-xs pb-xl">
    <HeadingText className="text-text">{title}</HeadingText>
    {note ? (
      <BodyText className="max-w-[48rem] text-text-secondary">{note}</BodyText>
    ) : null}
    <div className="pt-xs">{children}</div>
  </section>
);

const SAMPLE = 'Handgloves 0123';

/* ── stories ─────────────────────────────────────────────────────────── */

export const Playground: Story = {
  args: { variant: TextVariant.body },
};

export const Roles: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Roles"
      note="The pre-composed role components. Each is BaseText with variant fixed; every default comes from --ui-* tokens."
    >
      <Row label="HeroText">
        <HeroText>{SAMPLE}</HeroText>
      </Row>
      <Row label="TitleText">
        <TitleText>{SAMPLE}</TitleText>
      </Row>
      <Row label="HeadingText">
        <HeadingText>{SAMPLE}</HeadingText>
      </Row>
      <Row label="SubheadingText">
        <SubheadingText>{SAMPLE}</SubheadingText>
      </Row>
      <Row label="BodyText">
        <BodyText>{SAMPLE}</BodyText>
      </Row>
      <Row label="ButtonText">
        <ButtonText>{SAMPLE}</ButtonText>
      </Row>
      <Row label="LabelText">
        <LabelText>{SAMPLE}</LabelText>
      </Row>
    </Section>
  ),
};

export const TokenProps: Story = {
  name: 'Props — tokens',
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Token props"
      note="Each row is BodyText with one prop overridden from a constant. These emit var(--ui-*), so retuning the token in a consuming project retunes these with it."
    >
      <Row label="(no override)">
        <BodyText>{SAMPLE}</BodyText>
      </Row>
      <Row label="font={Fonts.title}">
        <BodyText font={Fonts.title}>{SAMPLE}</BodyText>
      </Row>
      <Row label="font={Fonts.label}">
        <BodyText font={Fonts.label}>{SAMPLE}</BodyText>
      </Row>
      <Row label="fontSize={FontSizes.title}">
        <BodyText fontSize={FontSizes.title}>{SAMPLE}</BodyText>
      </Row>
      <Row label="fontSize={FontSizes.label}">
        <BodyText fontSize={FontSizes.label}>{SAMPLE}</BodyText>
      </Row>
      <Row label="fontWeight={FontWeights.bold}">
        <BodyText fontWeight={FontWeights.bold}>{SAMPLE}</BodyText>
      </Row>
      <Row label="letterSpacing={Tracking.hero}">
        <BodyText letterSpacing={Tracking.hero}>{SAMPLE}</BodyText>
      </Row>
      <Row label="all four at once">
        <BodyText
          font={Fonts.hero}
          fontSize={FontSizes.title}
          fontWeight={FontWeights.bold}
          letterSpacing={Tracking.hero}
        >
          {SAMPLE}
        </BodyText>
      </Row>
    </Section>
  ),
};

export const RawValueProps: Story = {
  name: 'Props — raw values',
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Raw values"
      note="Numbers resolve per property: fontSize and letterSpacing become px, lineHeight stays a unitless ratio, fontWeight stays a number. Strings pass through untouched, so rem, clamp() and a bespoke family all work."
    >
      <Row label="fontSize={16}">
        <BodyText fontSize={16}>{SAMPLE}</BodyText>
      </Row>
      <Row label="fontSize={28}">
        <BodyText fontSize={28}>{SAMPLE}</BodyText>
      </Row>
      <Row label={'fontSize="1.75rem"'}>
        <BodyText fontSize="1.75rem">{SAMPLE}</BodyText>
      </Row>
      <Row label="fontWeight={450}">
        <BodyText fontWeight={450}>{SAMPLE}</BodyText>
      </Row>
      <Row label="fontWeight={700}">
        <BodyText fontWeight={700}>{SAMPLE}</BodyText>
      </Row>
      <Row label="letterSpacing={2}">
        <BodyText letterSpacing={2}>{SAMPLE}</BodyText>
      </Row>
      <Row label="lineHeight={1}">
        <BodyText lineHeight={1}>
          Two lines of body text, set solid, so the leading shows in the gap
          between them. Two lines of body text, set solid.
        </BodyText>
      </Row>
      <Row label="lineHeight={1.8}">
        <BodyText lineHeight={1.8}>
          Two lines of body text, set loose, so the leading shows in the gap
          between them. Two lines of body text, set loose.
        </BodyText>
      </Row>
    </Section>
  ),
};

export const Precedence: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Precedence"
      note="prop > className > role. The role class sits in the components layer, so a consumer utility beats it; props are inline, so they beat the utility. That is what makes leading-* and text-* usable as an escape hatch without props ever losing."
    >
      <Row label="role only">
        <BodyText>{SAMPLE}</BodyText>
      </Row>
      <Row label={'className="text-hero"'}>
        <BodyText className="text-hero">{SAMPLE}</BodyText>
      </Row>
      <Row label="className + fontSize={20}">
        <BodyText className="text-hero" fontSize={20}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label={'className="tracking-[0.2em]"'}>
        <BodyText className="tracking-[0.2em]">{SAMPLE}</BodyText>
      </Row>
      <Row label="style beats props">
        <BodyText fontSize={40} style={{ fontSize: 14 }}>
          {SAMPLE}
        </BodyText>
      </Row>
    </Section>
  ),
};

export const VariableAxes: Story = {
  name: 'Variable font axes',
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Variable font axes"
      note="axes merges with the role's --ui-font-var-* token — later duplicates win, so naming one axis leaves the role's other axes intact. Setting an axis a font does not implement is a harmless no-op, which is why the Host Grotesk row below does not move. Never pass wght here: font-variation-settings outranks font-weight, so it would disable the fontWeight prop."
    >
      <Row label="body (role default)">
        <BodyText fontSize={28}>{SAMPLE}</BodyText>
      </Row>
      <Row label="grade 0">
        <BodyText fontSize={28} axes={{ [FontAxes.grade]: 0 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="grade 100">
        <BodyText fontSize={28} axes={{ [FontAxes.grade]: 100 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="roundness 0">
        <BodyText fontSize={28} axes={{ [FontAxes.roundness]: 0 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="roundness 100">
        <BodyText fontSize={28} axes={{ [FontAxes.roundness]: 100 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="width 25">
        <BodyText fontSize={28} axes={{ [FontAxes.width]: 25 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="width 151">
        <BodyText fontSize={28} axes={{ [FontAxes.width]: 151 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="slant -10">
        <BodyText fontSize={28} axes={{ [FontAxes.slant]: -10 }}>
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="grade 100 + width 60">
        <BodyText
          fontSize={28}
          axes={{ [FontAxes.grade]: 100, [FontAxes.width]: 60 }}
        >
          {SAMPLE}
        </BodyText>
      </Row>
      <Row label="label role — no such axes">
        <LabelText
          fontSize={28}
          axes={{ [FontAxes.grade]: 100, [FontAxes.roundness]: 0 }}
        >
          {SAMPLE}
        </LabelText>
      </Row>
    </Section>
  ),
};

export const Unstyled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="unstyled"
      note="Drops the role class entirely — no family, size, weight, tracking or axes. Props and className still apply, so it is the starting point for typography the system does not describe."
    >
      <Row label="BodyText">
        <BodyText>{SAMPLE}</BodyText>
      </Row>
      <Row label="BodyText unstyled">
        <BodyText unstyled>{SAMPLE}</BodyText>
      </Row>
      <Row label="unstyled + props">
        <BodyText unstyled font={Fonts.title} fontSize={24} fontWeight={450}>
          {SAMPLE}
        </BodyText>
      </Row>
    </Section>
  ),
};

export const Polymorphic: Story = {
  name: 'as — element',
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="Polymorphic"
      note="as renders any element while keeping the role's typography and that element's own prop typing."
    >
      <Row label={'as="h1"'}>
        <HeroText as="h1">{SAMPLE}</HeroText>
      </Row>
      <Row label={'as="p"'}>
        <BodyText as="p">{SAMPLE}</BodyText>
      </Row>
      <Row label={'as="label" htmlFor'}>
        <LabelText as="label" htmlFor="demo-input">
          Field label
        </LabelText>
      </Row>
      <Row label={'as="code"'}>
        <BodyText as="code" font={Fonts.label}>
          const x = 1;
        </BodyText>
      </Row>
    </Section>
  ),
};
