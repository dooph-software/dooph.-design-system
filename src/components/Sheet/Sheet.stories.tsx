import type { Meta, StoryObj } from '@storybook/react';
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
    <SheetTitle className="sr-only">Sheet from {side}</SheetTitle>
    <div className="flex h-full flex-col gap-4 p-6">
      <p className="text-style-heading text-text">Sheet from {side}</p>
      <SheetDescription>
        The sheet slides in from the {side} edge with a gentle ease while the
        backdrop fades in. Click outside or press Escape to dismiss.
      </SheetDescription>
      <div className="flex flex-col gap-2">
        {['First item', 'Second item', 'Third item'].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-standard border border-border px-4 py-3"
          >
            <span className="text-style-button text-text">{item}</span>
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
            <SheetTitle className="sr-only">Controlled sheet</SheetTitle>
            <div className="flex flex-col gap-4 p-6">
              <p className="text-style-heading text-text">Controlled sheet</p>
              <p className="text-style-body text-text-secondary">
                Open/close state is managed externally via the{' '}
                <code className="text-style-label bg-surface-secondary rounded px-1">
                  open
                </code>{' '}
                prop.
              </p>
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
        <SheetTitle className="sr-only">Wide sheet</SheetTitle>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-style-heading text-text">Custom width</p>
          <p className="text-style-body text-text-secondary">
            Cross-axis size is fully overridable via className — tailwind-merge
            lets the consumer width win over the default.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
