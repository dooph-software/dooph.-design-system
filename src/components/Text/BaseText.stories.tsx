import type { Meta, StoryObj } from "@storybook/react";
import {
  BaseText,
  TextVariant,
  TextFontFamily,
  TextFontSize,
  TextFontWeight,
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
    fontFamily: {
      name: "FontFamily",
      control: "select",
      options: Object.values(TextFontFamily),
    },
    fontSize: {
      name: "FontSize",
      control: "select",
      options: Object.values(TextFontSize),
    },
    fontWeight: {
      name: "FontWeight",
      control: "select",
      options: Object.values(TextFontWeight),
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof BaseText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = {
  args: {
    children: "Button Text",
    variant: TextVariant.button,
    fontFamily: TextFontFamily.sans,
    fontSize: TextFontSize.body,
    fontWeight: TextFontWeight.medium,
  },
};

export const Heading: Story = {
  args: {
    children: "Heading Text",
    variant: TextVariant.heading,
    fontFamily: TextFontFamily.sans,
    fontSize: TextFontSize.heading,
    fontWeight: TextFontWeight.semibold,
  },
};

export const Hero: Story = {
  args: {
    children: "Hero Text",
    variant: TextVariant.hero,
    fontFamily: TextFontFamily.heading,
    fontSize: TextFontSize.hero,
    fontWeight: TextFontWeight.bold,
  },
};

export const Title: Story = {
  args: {
    children: "Title Text",
    variant: TextVariant.title,
    fontFamily: TextFontFamily.heading,
    fontSize: TextFontSize.title,
    fontWeight: TextFontWeight.bold,
  },
};

export const Body: Story = {
  args: {
    children: "Body Text",
    variant: TextVariant.body,
    fontFamily: TextFontFamily.sans,
    fontSize: TextFontSize.body,
    fontWeight: TextFontWeight.regular,
  },
};

export const Label: Story = {
  args: {
    children: "Label Text",
    variant: TextVariant.label,
    fontFamily: TextFontFamily.label,
    fontSize: TextFontSize.label,
    fontWeight: TextFontWeight.regular,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6">
      {textVariantExamples.map(({ variant, label, children }) => (
        <div key={variant} className="flex flex-col gap-1">
          <LabelText className="uppercase tracking-wide opacity-40">
            {label}
          </LabelText>
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
        <LabelText className="uppercase tracking-wide opacity-40">
          ButtonText
        </LabelText>
        <ButtonText>Button Text</ButtonText>
      </div>
      <div className="flex flex-col gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          HeadingText
        </LabelText>
        <HeadingText>Heading Text</HeadingText>
      </div>
      <div className="flex flex-col gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          HeroText
        </LabelText>
        <HeroText>Hero Text</HeroText>
      </div>
      <div className="flex flex-col gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          TitleText
        </LabelText>
        <TitleText>Title Text</TitleText>
      </div>
      <div className="flex flex-col gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          BodyText
        </LabelText>
        <BodyText>Body Text</BodyText>
      </div>
      <div className="flex flex-col gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">
          LabelText
        </LabelText>
        <LabelText>Label Text</LabelText>
      </div>
    </div>
  ),
};
