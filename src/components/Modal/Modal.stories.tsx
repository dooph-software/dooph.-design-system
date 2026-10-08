import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { ButtonText, LabelText } from '../Text';

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
        <div className="flex flex-col gap-4 p-6">
          <ModalTitle>Modal title</ModalTitle>
          <ModalDescription>
            This is the raw modal primitive. No internal padding or flex is added by
            the component — you compose it directly.
          </ModalDescription>
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
        <div className="flex flex-col gap-4 p-6">
          <ModalTitle>Larger modal</ModalTitle>
          <ModalDescription>
            The width and padding are entirely up to the consumer. The primitive
            only provides the surface, border, backdrop, and animation.
          </ModalDescription>
          <div className="flex flex-col gap-2">
            {['First item', 'Second item', 'Third item'].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-normal border border-border-primary px-4 py-3"
              >
                <ButtonText className="text-text">{item}</ButtonText>
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
            <div className="flex flex-col gap-4 p-6">
              <ModalTitle>Controlled modal</ModalTitle>
              <ModalDescription>
                Open/close state is managed externally via the{' '}
                <LabelText as="code" className="bg-surface-secondary rounded-tight px-xxs">open</LabelText> prop.
              </ModalDescription>
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
        <div className="flex flex-col gap-4 p-6">
          <ModalTitle>No backdrop</ModalTitle>
          <ModalDescription>
            Rendered without the fullscreen overlay. Useful for in-page panels or
            when a custom backdrop is already present.
          </ModalDescription>
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

function ModalInContainerDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div className="flex flex-col items-center gap-md">
      <Modal>
        <ModalTrigger asChild>
          <Button variant={ButtonVariant.primary}>Open into the frame</Button>
        </ModalTrigger>
        <ModalContent portalProps={{ container }} aria-describedby={undefined}>
          <div className="p-xl">
            <ModalTitle>Portalled into a local container</ModalTitle>
          </div>
        </ModalContent>
      </Modal>
      <div ref={setContainer} data-testid="modal-container" />
    </div>
  );
}

/** `portalProps={{ container }}` mounts the overlay and panel into a chosen element instead of `document.body`. `portal={false}` renders them in place. */
export const CustomContainer: Story = {
  render: () => <ModalInContainerDemo />,
};
