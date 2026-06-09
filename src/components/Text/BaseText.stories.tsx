import type { Meta, StoryObj } from "@storybook/react";
import {
  BaseText,
  TextVariant,
  ButtonText,
  HeadingText,
  HeroText,
  TitleText,
  BodyText,
  LabelText,
} from "./BaseText";

const textVariantExamples = [
  { variant: TextVariant.button, label: "button", children: "Button Text" },
  { variant: TextVariant.heading, label: "heading", children: "Heading Text" },
  { variant: TextVariant.hero, label: "hero", children: "Hero Text" },
  { variant: TextVariant.title, label: "title", children: "Title Text" },
  { variant: TextVariant.body, label: "body", children: "Body Text" },
  { variant: TextVariant.label, label: "label", children: "Label Text" },
] as const;

const meta = {
  title: "Primitives/BaseText",
  component: BaseText,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(TextVariant),
    },
    as: {
      control: "select",
      options: ["span", "p", "div", "h1", "h2", "h3", "h4", "label"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof BaseText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = {
  args: { children: "Button Text", variant: TextVariant.button },
};

export const Heading: Story = {
  args: { children: "Heading Text", variant: TextVariant.heading },
};

export const Hero: Story = {
  args: { children: "Hero Text", variant: TextVariant.hero },
};

export const Title: Story = {
  args: { children: "Title Text", variant: TextVariant.title },
};

export const Body: Story = {
  args: { children: "Body Text", variant: TextVariant.body },
};

export const Label: Story = {
  args: { children: "Label Text", variant: TextVariant.label },
};

export const PolymorphicHeading: Story = {
  name: "Polymorphic — as heading",
  args: {
    children: "Rendered as an h2",
    variant: TextVariant.body,
    as: "h2",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      {textVariantExamples.map(({ variant, label, children }) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide opacity-40">
            {label}
          </span>
          <BaseText variant={variant}>{children}</BaseText>
        </div>
      ))}
    </div>
  ),
};

export const PreComposedVariants: Story = {
  name: "Pre-composed variants",
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          ButtonText
        </span>
        <ButtonText>Button Text</ButtonText>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          HeadingText
        </span>
        <HeadingText>Heading Text</HeadingText>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          HeroText
        </span>
        <HeroText>Hero Text</HeroText>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          TitleText
        </span>
        <TitleText>Title Text</TitleText>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          BodyText
        </span>
        <BodyText>Body Text</BodyText>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide opacity-40">
          LabelText
        </span>
        <LabelText>Label Text</LabelText>
      </div>
    </div>
  ),
};

export const PolymorphicElements: Story = {
  name: "Polymorphic — multiple HTML elements",
  render: () => (
    <div className="flex flex-col gap-3 p-6">
      {(
        [
          { as: "span", label: "span" },
          { as: "p", label: "p" },
          { as: "h3", label: "h3" },
          { as: "label", label: "label" },
        ] as const
      ).map(({ as, label }) => (
        <div key={label} className="flex items-baseline gap-3">
          <span className="w-14 text-xs uppercase tracking-wide opacity-40 shrink-0">
            {label}
          </span>
          <BaseText as={as} variant={TextVariant.body}>
            Rendered as &lt;{label}&gt;
          </BaseText>
        </div>
      ))}
    </div>
  ),
};
