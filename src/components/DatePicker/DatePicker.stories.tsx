import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  CalendarPresetItem,
  CalendarPresets,
  CalendarPresetsPanel,
  DatePickerMode,
  DEFAULT_CALENDAR_PRESETS,
  DEFAULT_SPLIT_TRIGGER_PRESETS,
  type DateRange,
} from "../Calendar";
import { DatePicker } from "./DatePicker";

const TODAY = new Date(2026, 4, 15);

const meta: Meta<typeof DatePicker> = {
  title: "Inputs/DatePicker",
  component: DatePicker,
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const SingleDay: Story = {
  render: () => {
    const [value, setValue] = useState<Date>(new Date(2026, 4, 14));
    return (
      <DatePicker
        mode={DatePickerMode.singleDay}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const DateRangeMode: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      from: new Date(2026, 4, 14),
      to: new Date(2026, 5, 14),
    });
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const WithPresetsPanel: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      >
        <CalendarPresetsPanel>
          {[CalendarPresets.today, ...DEFAULT_CALENDAR_PRESETS].map((preset) => (
            <CalendarPresetItem
              key={preset.id}
              preset={preset}
              selected={value}
              today={TODAY}
              onSelect={setValue}
            />
          ))}
        </CalendarPresetsPanel>
      </DatePicker>
    );
  },
};

export const SplitTrigger: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS}
        today={TODAY}
      />
    );
  },
};

export const CrossingAYearBoundary: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      from: new Date(2025, 11, 28),
      to: new Date(2026, 0, 4),
    });
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const DisabledTrigger: Story = {
  render: () => (
    <div className="flex flex-col gap-sm">
      <DatePicker
        mode={DatePickerMode.singleDay}
        value={new Date(2026, 4, 14)}
        onChange={() => {}}
        triggerDisabled
        today={TODAY}
      />
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={{ from: new Date(2026, 4, 14), to: new Date(2026, 5, 14) }}
        onChange={() => {}}
        splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS}
        triggerDisabled
        today={TODAY}
      />
    </div>
  ),
};
