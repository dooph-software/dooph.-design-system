import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from './Sheet';
import { SheetSide } from './constants';
import { Button } from '../Button/Button';
import { ButtonVariant, ButtonSize } from '../Button/constants';
import { ButtonText, LabelText } from '../Text';

const meta = {
  title: 'Overlays/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBody = ({ side }: { side: SheetSide }) => (
  <>
    <div className="flex h-full flex-col gap-4 p-6">
      <SheetTitle>Sheet from {side}</SheetTitle>
      <SheetDescription>
        The sheet slides in from the {side} edge with a gentle ease while the
        backdrop fades in. Click outside or press Escape to dismiss.
      </SheetDescription>
      <div className="flex flex-col gap-2">
        {['First item', 'Second item', 'Third item'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-normal border border-border-primary px-4 py-3"
          >
            <ButtonText className="text-text">{item}</ButtonText>
            <Button variant={ButtonVariant.ghost} size={ButtonSize.sm}>
              Select
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-end gap-2">
        <SheetClose asChild>
          <Button variant={ButtonVariant.secondary}>Cancel</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button variant={ButtonVariant.primary}>Confirm</Button>
        </SheetClose>
      </div>
    </div>
  </>
);

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.primary}>Open right sheet</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.right}>
        <DemoBody side={SheetSide.right} />
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.left}>
        <DemoBody side={SheetSide.left} />
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open top sheet</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.top}>
        <DemoBody side={SheetSide.top} />
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.bottom}>
        <DemoBody side={SheetSide.bottom} />
      </SheetContent>
    </Sheet>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant={ButtonVariant.primary} onClick={() => setOpen(true)}>
          Open controlled
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side={SheetSide.right}>
            <div className="flex flex-col gap-4 p-6">
              <SheetTitle>Controlled sheet</SheetTitle>
              <SheetDescription>
                Open/close state is managed externally via the{' '}
                <LabelText
                  as="code"
                  className="bg-surface-secondary rounded-tight px-xxs"
                >
                  open
                </LabelText>{' '}
                prop.
              </SheetDescription>
              <div className="flex justify-end">
                <Button
                  variant={ButtonVariant.secondary}
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  },
};

export const CustomWidth: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open wide sheet</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.right} className="w-[540px] max-w-none">
        <div className="flex flex-col gap-4 p-6">
          <SheetTitle>Custom width</SheetTitle>
          <SheetDescription>
            Cross-axis size is overridable via className — override max-w-* along
            with the width, since the default caps it at max-w-96.
          </SheetDescription>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

function SheetInContainerDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div className="flex flex-col items-center gap-md">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={ButtonVariant.primary}>Open into the frame</Button>
        </SheetTrigger>
        <SheetContent
          side={SheetSide.right}
          portalProps={{ container }}
          aria-describedby={undefined}
        >
          <div className="p-xl">
            <SheetTitle>Portalled into a local container</SheetTitle>
          </div>
        </SheetContent>
      </Sheet>
      <div ref={setContainer} data-testid="sheet-container" />
    </div>
  );
}

/** `portalProps={{ container }}` mounts the overlay and panel into a chosen element instead of `document.body`. `portal={false}` renders them in place. */
export const CustomContainer: Story = {
  render: () => <SheetInContainerDemo />,
};

/** Contradicts withOverlay (default true): no backdrop, the page stays visible. */
export const NoOverlay: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open (no backdrop)</Button>
      </SheetTrigger>
      <SheetContent side={SheetSide.right} withOverlay={false}>
        <DemoBody side={SheetSide.right} />
      </SheetContent>
    </Sheet>
  ),
};
