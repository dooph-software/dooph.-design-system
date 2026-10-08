"use client";

import { cn } from "../../utils/cn";
import { Button, ButtonSize, ButtonVariant } from "../Button";
import { ChevronLeftIcon, ChevronRightIcon, IconSize } from "../Icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "../Menu";
import { TextDropdownSize, TextDropdownTrigger } from "../DropdownTrigger";
import { BodyText, ButtonText } from "../Text";
import { addMonths } from "./dateUtils";
import { buildYearOptions, formatMonthName, isYearOutOfBounds } from "./dateFormat";

/** Accessible names for the caption's month arrows. English by default. */
export type CalendarLabels = {
  previousMonth?: string;
  nextMonth?: string;
};

export type CalendarCaptionProps = {
  /** First day of the displayed month. */
  viewMonth: Date;
  /** The current selection anchor, so the year list always contains it. */
  value: Date;
  today: Date;
  yearBounds?: { from?: Date; to?: Date };
  onMonthChange: (month: Date) => void;
  locale?: string;
  /** Accessible names for the month arrows; pair with `locale`. */
  labels?: CalendarLabels;
  className?: string;
};

function CalendarCaption({
  viewMonth,
  value,
  today,
  yearBounds,
  onMonthChange,
  locale,
  labels,
  className,
}: CalendarCaptionProps) {
  const years = buildYearOptions(viewMonth, value, today, yearBounds);
  const months = Array.from({ length: 12 }, (_, index) => index);

  // Clamping already prevents navigating out of bounds — disabling the button
  // tells the user that, instead of letting them click into a no-op.
  //
  // Guarded on the CURRENT view being in bounds. A controlled `month` is
  // respected rather than clamped, so `viewMonth` can be out of bounds, and then
  // BOTH neighbours are out of bounds too — an unguarded test would disable both
  // arrows, including the one pointing back toward the bounds, stranding the
  // user exactly where they most need to navigate.
  const viewInBounds = !isYearOutOfBounds(viewMonth, yearBounds);
  const atFloor =
    viewInBounds && isYearOutOfBounds(addMonths(viewMonth, -1), yearBounds);
  const atCeiling =
    viewInBounds && isYearOutOfBounds(addMonths(viewMonth, 1), yearBounds);

  return (
    <div className={cn("flex items-center justify-between gap-sm", className)}>
      <div className="flex items-center gap-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger
              size={TextDropdownSize.sm}
              className="text-ghost-fg-active"
            >
              <ButtonText>{formatMonthName(viewMonth, locale)}</ButtonText>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger
              size={TextDropdownSize.sm}
              className="text-ghost-fg-active"
            >
              <ButtonText>{viewMonth.getFullYear()}</ButtonText>
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
          size={ButtonSize.iconSm}
          aria-label={labels?.previousMonth ?? "Previous month"}
          disabled={atFloor}
          className="text-ghost-fg-active"
          onClick={() => onMonthChange(addMonths(viewMonth, -1))}
        >
          <ChevronLeftIcon size={IconSize.rg} />
        </Button>
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconSm}
          aria-label={labels?.nextMonth ?? "Next month"}
          disabled={atCeiling}
          className="text-ghost-fg-active"
          onClick={() => onMonthChange(addMonths(viewMonth, 1))}
        >
          <ChevronRightIcon size={IconSize.rg} />
        </Button>
      </div>
    </div>
  );
}

CalendarCaption.displayName = "CalendarCaption";

export { CalendarCaption };
