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
  title: "Dates/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const SingleDay: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        value={selected}
        onValueChange={setSelected}
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
        value={selected}
        onValueChange={setSelected}
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
        value={selected}
        onValueChange={setSelected}
        today={TODAY}
      >
        <CalendarPresetsPanel>
          {[CalendarPresets.today, ...DEFAULT_CALENDAR_PRESETS].map((preset) => (
            <CalendarPresetItem
              key={preset.id}
              preset={preset}
              value={selected}
              today={TODAY}
              onValueChange={setSelected}
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
        value={selected}
        onValueChange={setSelected}
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
        value={selected}
        onValueChange={setSelected}
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
      <div className="flex flex-wrap gap-lg">
        {months.map((month) => (
          <Calendar
            key={month.toISOString()}
            mode={DatePickerMode.singleDay}
            value={month}
            onValueChange={() => {}}
            month={month}
            today={TODAY}
          />
        ))}
      </div>
    );
  },
};

export const YearBounds: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        value={selected}
        onValueChange={setSelected}
        today={TODAY}
        yearBounds={{ from: new Date(2026, 0, 1), to: new Date(2026, 11, 31) }}
      />
    );
  },
};

/**
 * An invalid single-day `value` (here `Invalid Date`) warns in development and
 * renders NOTHING — it never crashes.
 */
export const InvalidSingleDayValueRendersNothing: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      <BodyText>The calendar below received an Invalid Date and renders nothing.</BodyText>
      <Calendar
        mode={DatePickerMode.singleDay}
        value={new Date("not a date")}
        onValueChange={() => {}}
        today={TODAY}
      />
    </div>
  ),
};

/**
 * An invalid range `value` (here an Invalid Date as `from`) warns in
 * development and renders NOTHING — it never crashes.
 */
export const InvalidRangeValueRendersNothing: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      <BodyText>The calendar below received a range with an invalid end and renders nothing.</BodyText>
      <Calendar
        mode={DatePickerMode.dateRange}
        value={{ from: new Date(NaN), to: TODAY }}
        onValueChange={() => {}}
        today={TODAY}
      />
    </div>
  ),
};

/** A `mode` other than the two DatePickerMode values warns and renders nothing. */
export const UnknownModeRendersNothing: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      <BodyText>The calendar below received an unknown mode and renders nothing.</BodyText>
      <Calendar
        mode={"week" as unknown as typeof DatePickerMode.singleDay}
        value={TODAY}
        onValueChange={() => {}}
        today={TODAY}
      />
    </div>
  ),
};
