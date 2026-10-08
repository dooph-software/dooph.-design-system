import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarSize } from '../Avatar';
import { Button } from '../Button/Button';
import { ButtonSize, ButtonVariant } from '../Button/constants';
import { CheckIcon, OrganizationIcon, PlusIcon } from '../Icons';
import { LinearProgressIndicator } from '../LinearProgressIndicator/LinearProgressIndicator';
import { SegmentedTabItem, SegmentedTabSelect } from '../SegmentedTabSelect';
import { SegmentedVariant } from '../SegmentedTabSelect/constants';
import { Sticker } from '../Sticker/Sticker';
import { StickerVariant } from '../Sticker/constants';
import { BodyText, ButtonText, HeadingText, LabelText } from '../Text';
import { OutlineSection } from './OutlineSection';

const meta = {
  title: 'Bits & Pieces/OutlineSection',
  component: OutlineSection,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof OutlineSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OutlineSection>
      <Button variant={ButtonVariant.secondary}>Action</Button>
    </OutlineSection>
  ),
};

export const Card: Story = {
  render: () => (
    <OutlineSection>
      <div className="flex w-80 flex-col gap-lg">
        <div className="flex items-start justify-between gap-rg">
          <div className="flex items-center gap-rg">
            <Avatar size={AvatarSize.sm}>
              <OrganizationIcon />
            </Avatar>
            <div className="flex flex-col">
              <HeadingText>Northwind</HeadingText>
              <LabelText>Workspace</LabelText>
            </div>
          </div>
          <Sticker variant={StickerVariant.prominent}>
            <CheckIcon />
            <ButtonText>Active</ButtonText>
          </Sticker>
        </div>

        <BodyText>
          Billing is on track for this cycle. Two seats are still unassigned.
        </BodyText>

        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-rg">
            <LabelText>Seats used</LabelText>
            <LabelText>18 / 24</LabelText>
          </div>
          <LinearProgressIndicator value={75} />
        </div>

        <SegmentedTabSelect
          defaultValue="overview"
          variant={SegmentedVariant.ghost}
        >
          <SegmentedTabItem value="overview">Overview</SegmentedTabItem>
          <SegmentedTabItem value="members">Members</SegmentedTabItem>
          <SegmentedTabItem value="billing">Billing</SegmentedTabItem>
        </SegmentedTabSelect>

        <div className="flex items-center justify-end gap-rg">
          <Button variant={ButtonVariant.secondary} size={ButtonSize.sm}>
            <PlusIcon />
            Invite
          </Button>
          <Button variant={ButtonVariant.primary} size={ButtonSize.sm}>
            Manage
          </Button>
        </div>
      </div>
    </OutlineSection>
  ),
};
