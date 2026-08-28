import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Calendar } from "./Calendar";
import { CalendarPresetItem, CalendarPresetsPanel } from "./CalendarPresetsPanel";
import {
  CalendarPresets,
  DatePickerMode,
  DEFAULT_CALENDAR_PRESETS,
  type DateRange,
} from "./constants";
import { BodyText } from "../Text";

/** Fixed so the grid never changes shape between runs. May 1 2026 is a Friday. */
const TODAY = new Date(2026, 4, 15);

const meta: Meta<typeof Calendar> = {
  title: "Inputs/Calendar",
  component: Calendar,
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const SingleDay: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      />
    );
  },
};

export const DateRangeMode: Story = {
  render: () => {
    const [selected, setSelected] = useState<DateRange>({
      from: new Date(2026, 4, 15),
      to: new Date(2026, 4, 22),
    });
    return (
      <Calendar
        mode={DatePickerMode.dateRange}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      />
    );
  },
};

export const WithPresets: Story = {
  render: () => {
    const [selected, setSelected] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <Calendar
        mode={DatePickerMode.dateRange}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      >
        <CalendarPresetsPanel>
          {DEFAULT_CALENDAR_PRESETS.map((preset) => (
            <CalendarPresetItem
              key={preset.id}
              preset={preset}
              selected={selected}
              today={TODAY}
              onSelect={setSelected}
            />
          ))}
        </CalendarPresetsPanel>
      </Calendar>
    );
  },
};

export const DisabledFutureDates: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
        disabled={{ after: TODAY }}
      />
    );
  },
};

export const CustomRenderDay: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
        renderDay={({ date }) => (
          <div className="flex flex-col items-center">
            <BodyText>{date.getDate()}</BodyText>
            {date.getDate() % 5 === 0 && (
              <span className="size-1 rounded-full bg-primary" aria-hidden />
            )}
          </div>
        )}
      />
    );
  },
};

/** Edge months: 6-row May, Sunday-aligned Feb, leap Feb, century non-leap Feb. */
export const EdgeMonths: Story = {
  render: () => {
    const months = [
      new Date(2026, 4, 1),
      new Date(2026, 1, 1),
      new Date(2024, 1, 1),
      new Date(2100, 1, 1),
    ];
    return (
      <div className="flex flex-wrap gap-md">
        {months.map((month) => (
          <Calendar
            key={month.toISOString()}
            mode={DatePickerMode.singleDay}
            selected={month}
            onSelect={() => {}}
            month={month}
            today={TODAY}
          />
        ))}
      </div>
    );
  },
};
