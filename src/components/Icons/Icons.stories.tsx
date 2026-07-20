import type { Meta, StoryObj } from "@storybook/react-vite";
import { BaseIcon, IconProps, IconSizes } from "./BaseIcon";
import { BugReportIcon } from "./BugReportIcon";
import CheckIcon from "./CheckIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { CloseCancelIcon } from "./CloseCancelIcon";
import { DarkModeIcon } from "./DarkModeIcon";
import { DropdownIcon } from "./DropdownIcon";
import { ExtensionsIcon } from "./ExtensionsIcon";
import { LeftSidebarClosedIcon } from "./LeftSidebarClosedIcon";
import { LeftSidebarOpenedIcon } from "./LeftSidebarOpenedIcon";
import { LightModeIcon } from "./LightModeIcon";
import { NewChatIcon } from "./NewChatIcon";
import { RecentsIcon } from "./RecentsIcon";
import { RightSidebarClosedIcon } from "./RightSidebarClosedIcon";
import { RightSidebarOpenedIcon } from "./RightSidebarOpenedIcon";
import { SearchIcon } from "./SearchIcon";
import { SendIcon } from "./SendIcon";
import { SettingsBoltIcon } from "./SettingsBoltIcon";
import { SettingsGearIcon } from "./SettingsGearIcon";

const meta = {
  component: BaseIcon,
  title: "Primitives/Icons",
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
    <Icon size={IconSizes.standard} />
    <span
      style={{
        fontSize: 11,
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      {label}
    </span>
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
        icon={(props) => <LeftSidebarClosedIcon {...props} />}
        label="LeftSidebar Closed"
      />
      <IconCell
        icon={(props) => <LeftSidebarOpenedIcon {...props} />}
        label="LeftSidebar Open"
      />
      <IconCell
        icon={(props) => <RightSidebarClosedIcon {...props} />}
        label="RightSidebar Closed"
      />
      <IconCell
        icon={(props) => <RightSidebarOpenedIcon {...props} />}
        label="RightSidebar Open"
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
    </div>
  ),
};

export const Sizes: Story = {
  name: "Icon Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "end" }}>
      {(
        Object.entries(IconSizes) as [keyof typeof IconSizes, IconSizes][]
      ).map(([name, size]) => (
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
          <span style={{ fontSize: 12 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  name: "Icon Colors",
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <LightModeIcon size={IconSizes.medium} color="var(--color-text)" />
      <LightModeIcon
        size={IconSizes.medium}
        color="var(--color-text-secondary)"
      />
      <LightModeIcon
        size={IconSizes.medium}
        color="var(--color-text-tertiary)"
      />
      <LightModeIcon size={IconSizes.medium} color="var(--color-brand-color)" />
    </div>
  ),
};
