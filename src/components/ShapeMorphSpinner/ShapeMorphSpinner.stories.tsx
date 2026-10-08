import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingSpinnerColor, LoadingSpinnerSize } from "../LoadingSpinner/constants";
import { CloverShape, CookieShape, SquircleShape } from "../Shapes";
import { ShapeMorphSpinner } from "./ShapeMorphSpinner";

const meta = {
  title: "Progress/ShapeMorphSpinner",
  component: ShapeMorphSpinner,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: Object.values(LoadingSpinnerSize) },
    color: { control: "select", options: [...Object.values(LoadingSpinnerColor), "#e05252"] },
  },
} satisfies Meta<typeof ShapeMorphSpinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {Object.values(LoadingSpinnerSize).map((s) => (
        <ShapeMorphSpinner key={s} size={s} />
      ))}
    </div>
  ),
};

/** Contradicts the default colour: prominent, then an arbitrary hex. */
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ShapeMorphSpinner color={LoadingSpinnerColor.prominent} size={LoadingSpinnerSize.xl} />
      <ShapeMorphSpinner color="#e05252" size={LoadingSpinnerSize.xl} />
    </div>
  ),
};

export const CustomShapes: Story = {
  args: { shapes: [CookieShape, CloverShape, SquircleShape], size: LoadingSpinnerSize.xl },
};

/** Contradicts the --ui-shape-morph-* timing tokens for this instance. */
export const SlowTiming: Story = {
  args: {
    size: LoadingSpinnerSize.xl,
    timing: { duration: 1200, interval: 2400, ease: "linear" },
  },
};
