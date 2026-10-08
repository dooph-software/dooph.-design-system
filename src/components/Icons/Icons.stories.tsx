import type { Meta, StoryObj } from "@storybook/react-vite";
import { BaseIcon, IconProps, IconSize } from "./BaseIcon";
import { BugReportIcon } from "./BugReportIcon";
import { CheckIcon } from "./CheckIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { CloseCancelIcon } from "./CloseCancelIcon";
import { DarkModeIcon } from "./DarkModeIcon";
import { DropdownIcon } from "./DropdownIcon";
import { ExtensionsIcon } from "./ExtensionsIcon";
import { HeartFillIcon } from "./HeartFillIcon";
import { LightModeIcon } from "./LightModeIcon";
import { NewChatIcon } from "./NewChatIcon";
import { RecentsIcon } from "./RecentsIcon";
import { SearchIcon } from "./SearchIcon";
import { SendIcon } from "./SendIcon";
import { SettingsBoltIcon } from "./SettingsBoltIcon";
import { SettingsGearIcon } from "./SettingsGearIcon";
import { SidebarLeftHoverIcon } from "./SidebarLeftHoverIcon";
import { SidebarLeftIcon } from "./SidebarLeftIcon";
import { SidebarRightHoverIcon } from "./SidebarRightHoverIcon";
import { SidebarRightIcon } from "./SidebarRightIcon";
import { StopFilledIcon } from "./StopFilledIcon";
import { TagIcon } from "./TagIcon";
import { LabelText } from "../Text";

const meta = {
  component: BaseIcon,
  title: "Icons/BaseIcon",
  tags: ["autodocs"],
  argTypes: {
    size: { control: "text" },
    color: { control: "color" },
    strokeWidth: { control: "number" },
  },
} satisfies Meta<typeof BaseIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const IconCell = ({
  icon: Icon,
  label,
}: {
  icon: (props: IconProps) => React.ReactNode;
  label: string;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      width: 80,
    }}
  >
    <Icon size={IconSize.rg} />
    <LabelText className="text-center text-text-secondary">{label}</LabelText>
  </div>
);

export const NavigationIcons: Story = {
  name: "Navigation & UI Icons",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      <IconCell
        icon={(props) => <ChevronDownIcon {...props} />}
        label="ChevronDown"
      />
      <IconCell
        icon={(props) => <CloseCancelIcon {...props} />}
        label="CloseCancel"
      />
      <IconCell
        icon={(props) => <DropdownIcon {...props} />}
        label="Dropdown"
      />
      <IconCell icon={(props) => <SearchIcon {...props} />} label="Search" />
      <IconCell icon={(props) => <SendIcon {...props} />} label="Send" />
      <IconCell icon={(props) => <NewChatIcon {...props} />} label="NewChat" />
      <IconCell icon={(props) => <RecentsIcon {...props} />} label="Recents" />
    </div>
  ),
};

export const SidebarIcons: Story = {
  name: "Sidebar Icons",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      <IconCell
        icon={(props) => <SidebarLeftIcon {...props} />}
        label="SidebarLeft"
      />
      <IconCell
        icon={(props) => <SidebarLeftHoverIcon {...props} />}
        label="SidebarLeftHover"
      />
      <IconCell
        icon={(props) => <SidebarRightIcon {...props} />}
        label="SidebarRight"
      />
      <IconCell
        icon={(props) => <SidebarRightHoverIcon {...props} />}
        label="SidebarRightHover"
      />
    </div>
  ),
};

export const SettingsIcons: Story = {
  name: "Settings & System Icons",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      <IconCell
        icon={(props) => <DarkModeIcon {...props} />}
        label="DarkMode"
      />
      <IconCell
        icon={(props) => <LightModeIcon {...props} />}
        label="LightMode"
      />
      <IconCell
        icon={(props) => <ExtensionsIcon {...props} />}
        label="Extensions"
      />
      <IconCell
        icon={(props) => <SettingsGearIcon {...props} />}
        label="SettingsGear"
      />
      <IconCell
        icon={(props) => <SettingsBoltIcon {...props} />}
        label="SettingsBolt"
      />
      <IconCell
        icon={(props) => <BugReportIcon {...props} />}
        label="BugReport"
      />
      <IconCell icon={(props) => <CheckIcon {...props} />} label="Check" />
      <IconCell icon={(props) => <HeartFillIcon {...props} />} label="HeartFill" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "Icon Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "end" }}>
      {(Object.entries(IconSize) as [keyof typeof IconSize, IconSize][]).map(
        ([name, size]) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <SettingsBoltIcon size={size} />
            <LabelText>{name}</LabelText>
          </div>
        ),
      )}
    </div>
  ),
};

export const Colors: Story = {
  name: "Icon Colors",
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <LightModeIcon size={IconSize.md} color="var(--color-text)" />
      <LightModeIcon
        size={IconSize.md}
        color="var(--color-text-secondary)"
      />
      <LightModeIcon
        size={IconSize.md}
        color="var(--color-text-tertiary)"
      />
      <LightModeIcon size={IconSize.md} color="var(--color-prominent-color)" />
      <HeartFillIcon size={IconSize.md} color="var(--color-prominent-color)" />
      <StopFilledIcon size={IconSize.md} color="var(--color-prominent-color)" />
      <TagIcon size={IconSize.md} color="var(--color-prominent-color)" />
    </div>
  ),
};

/** Renders the args, so the size, strokeWidth and colour controls do something.
 * Contradicts the default stroke width (--ui-icon-stroke-width) and colours. */
export const Playground: Story = {
  args: {
    size: IconSize.md,
    strokeWidth: 3,
    strokeColor: "var(--ui-color-prominent)",
    fillColor: "var(--ui-color-surface-secondary)",
    children: <path d="M6 18h6a3 3 0 0 0 3 -3v-10l-4 4m8 0l-4 -4" />,
  },
};
