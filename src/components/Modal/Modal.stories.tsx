import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalTrigger,
  ModalClose,
} from './Modal';
import { Button } from '../Button/Button';
import { ButtonVariant, ButtonSize } from '../Button/constants';

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant={ButtonVariant.primary}>Open modal</Button>
      </ModalTrigger>
      <ModalContent className="w-[400px]">
        <ModalTitle className="sr-only">Modal</ModalTitle>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-style-heading text-text">Modal title</p>
          <p className="text-style-body text-text-secondary">
            This is the raw modal primitive. No internal padding or flex is added by
            the component — you compose it directly.
          </p>
          <div className="flex justify-end gap-2">
            <ModalClose asChild>
              <Button variant={ButtonVariant.secondary}>Cancel</Button>
            </ModalClose>
            <ModalClose asChild>
              <Button variant={ButtonVariant.primary}>Confirm</Button>
            </ModalClose>
          </div>
        </div>
      </ModalContent>
    </Modal>
  ),
};

export const LargerContent: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open large modal</Button>
      </ModalTrigger>
      <ModalContent className="w-[560px]">
        <ModalTitle className="sr-only">Large modal</ModalTitle>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-style-heading text-text">Larger modal</p>
          <ModalDescription>
            The width and padding are entirely up to the consumer. The primitive
            only provides the surface, border, backdrop, and animation.
          </ModalDescription>
          <div className="flex flex-col gap-2">
            {['First item', 'Second item', 'Third item'].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-standard border border-border px-4 py-3"
              >
                <span className="text-style-button text-text">{item}</span>
                <Button variant={ButtonVariant.ghost} size={ButtonSize.sm}>Select</Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <ModalClose asChild>
              <Button variant={ButtonVariant.secondary}>Close</Button>
            </ModalClose>
          </div>
        </div>
      </ModalContent>
    </Modal>
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
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent className="w-[400px]">
            <ModalTitle className="sr-only">Controlled modal</ModalTitle>
            <div className="flex flex-col gap-4 p-6">
              <p className="text-style-heading text-text">Controlled modal</p>
              <p className="text-style-body text-text-secondary">
                Open/close state is managed externally via the{' '}
                <code className="text-style-label bg-surface-secondary rounded px-1">open</code> prop.
              </p>
              <div className="flex justify-end">
                <Button variant={ButtonVariant.secondary} onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>
    );
  },
};

export const NoOverlay: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open (no backdrop)</Button>
      </ModalTrigger>
      <ModalContent withOverlay={false} className="w-[400px]">
        <ModalTitle className="sr-only">Modal without overlay</ModalTitle>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-style-heading text-text">No backdrop</p>
          <p className="text-style-body text-text-secondary">
            Rendered without the fullscreen overlay. Useful for in-page panels or
            when a custom backdrop is already present.
          </p>
          <div className="flex justify-end">
            <ModalClose asChild>
              <Button variant={ButtonVariant.secondary}>Close</Button>
            </ModalClose>
          </div>
        </div>
      </ModalContent>
    </Modal>
  ),
};
