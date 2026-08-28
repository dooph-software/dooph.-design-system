"use client";

import { Button, ButtonSize, ButtonVariant } from "../Button";
import { ChevronLeftIcon, ChevronRightIcon, IconSize } from "../Icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
  DropdownMenuVariant,
} from "../Menu";
import { TextDropdownSize, TextDropdownTrigger } from "../DropdownTrigger";
import { BodyText } from "../Text";
import { addMonths } from "./dateUtils";
import { buildYearOptions, formatMonthName, isYearOutOfBounds } from "./dateFormat";

export type CalendarCaptionProps = {
  /** First day of the displayed month. */
  viewMonth: Date;
  /** The current selection anchor, so the year list always contains it. */
  value: Date;
  today: Date;
  yearBounds?: { from?: Date; to?: Date };
  onMonthChange: (month: Date) => void;
  locale?: string;
};

function CalendarCaption({
  viewMonth,
  value,
  today,
  yearBounds,
  onMonthChange,
  locale,
}: CalendarCaptionProps) {
  const years = buildYearOptions(viewMonth, value, today, yearBounds);
  const months = Array.from({ length: 12 }, (_, index) => index);

  // Clamping already prevents navigating out of bounds — disabling the button
  // means the user gets told that, instead of clicking into a no-op.
  const atFloor = isYearOutOfBounds(addMonths(viewMonth, -1), yearBounds);
  const atCeiling = isYearOutOfBounds(addMonths(viewMonth, 1), yearBounds);

  return (
    <div className="flex items-center justify-between gap-xs">
      <div className="flex items-center gap-xs">
        <DropdownMenu variant={DropdownMenuVariant.action}>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger size={TextDropdownSize.sm}>
              {formatMonthName(viewMonth, locale)}
            </TextDropdownTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              {months.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onSelect={() =>
                    onMonthChange(new Date(viewMonth.getFullYear(), month, 1))
                  }
                >
                  <BodyText>
                    {formatMonthName(new Date(2026, month, 1), locale)}
                  </BodyText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu variant={DropdownMenuVariant.action}>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger size={TextDropdownSize.sm}>
              {viewMonth.getFullYear()}
            </TextDropdownTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              {years.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onSelect={() =>
                    onMonthChange(new Date(year, viewMonth.getMonth(), 1))
                  }
                >
                  <BodyText>{year}</BodyText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center">
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Previous month"
          disabled={atFloor}
          onClick={() => onMonthChange(addMonths(viewMonth, -1))}
        >
          <ChevronLeftIcon size={IconSize.standard} />
        </Button>
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Next month"
          disabled={atCeiling}
          onClick={() => onMonthChange(addMonths(viewMonth, 1))}
        >
          <ChevronRightIcon size={IconSize.standard} />
        </Button>
      </div>
    </div>
  );
}

export { CalendarCaption };
