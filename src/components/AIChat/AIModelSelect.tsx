/*
 * AI model select parts — composed by the consumer inside a DropdownMenu
 * (Figma 761:3079). There is no sealed "ModelSelect": the menu is
 * DropdownMenu + these parts + whatever else the consumer adds ("Edit models").
 *
 *   AIModelSelectTrigger     Figma 761:2502 — model name + effort + chevron
 *   AIModelSelectItem        Figma 761:2073 — Auto / Model / Model Selected
 *   AIThinkingEffortSelector Figma 761:2088 — "Thinking <step>" + stepped slider
 *   AIModelTooltipContent    Figma 761:2843 — name, description, speed↔power bar
 *
 * ## constraints
 * - No model catalogue, provider enum or reasoning levels live here. Every
 *   label, colour and step list is data the consumer passes in.
 * - Provider colour is an open design value (`color`: DS token name or any CSS
 *   colour), written as a custom property the CSS reads — never a class.
 * - Selection is a radio choice, so AIModelSelectItem IS a
 *   DropdownMenuRadioSelectItem: wrap items in DropdownMenuRadioGroup and the
 *   selected fill, check and aria-checked all come from the menu itself.
 */
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { resolveDsColor, type DsColor } from "../../utils/color";
import { RollChangeText } from "../AnimatedText";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { AIPowerIcon, AISpeedIcon, DropdownIcon, IconSize } from "../Icons";
import { LinearProgressIndicator } from "../LinearProgressIndicator";
import { DropdownMenuRadioSelectItem } from "../Menu";
import { SliderLabeled } from "../Slider";
import { SliderVariant } from "../Slider/constants";
import { BodyText, ButtonText } from "../Text";
import { TooltipBody, TooltipContent } from "../Tooltip";
import { TooltipTypes } from "../Tooltip/constants";

// ── Trigger ───────────────────────────────────────────────────────────────────

export interface AIModelSelectTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** The selected model's name. */
  children: ReactNode;
  /** Secondary detail — typically the thinking effort ("Medium"). */
  detail?: ReactNode;
}

/** Ghost trigger. Use as `<DropdownMenuTrigger asChild>`'s child. */
const AIModelSelectTrigger = forwardRef<
  HTMLButtonElement,
  AIModelSelectTriggerProps
>(({ children, detail, className, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant={ButtonVariant.ghost}
    size={ButtonSize.sm}
    className={cn("shrink-0 gap-xs px-xs", className)}
    {...props}
  >
    <span className="whitespace-nowrap text-text">{children}</span>
    {detail != null && detail !== false ? (
      <span className="whitespace-nowrap text-style-body text-ghost-fg">
        {detail}
      </span>
    ) : null}
    <DropdownIcon size={IconSize.rg} aria-hidden className="rotate-180" />
  </Button>
));
AIModelSelectTrigger.displayName = "AIModelSelectTrigger";

// ── Item ──────────────────────────────────────────────────────────────────────

export interface AIModelSelectItemProps
  extends ComponentPropsWithoutRef<typeof DropdownMenuRadioSelectItem> {
  /** Provider swatch colour. Defaults to prominent — Figma's "Auto" item. */
  color?: DsColor;
}

const AIModelSelectItem = forwardRef<
  ComponentRef<typeof DropdownMenuRadioSelectItem>,
  AIModelSelectItemProps
>(({ color, children, style, ...props }, ref) => (
  <DropdownMenuRadioSelectItem
    ref={ref}
    style={
      {
        ...style,
        ...(color
          ? { "--ds-chat-model-color": resolveDsColor(color, "") }
          : {}),
      } as CSSProperties
    }
    {...props}
  >
    <span aria-hidden className="ds-chat-model-swatch" />
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </DropdownMenuRadioSelectItem>
));
AIModelSelectItem.displayName = "AIModelSelectItem";

// ── Thinking effort ───────────────────────────────────────────────────────────

export interface AIThinkingEffortStep {
  value: string;
  label: string;
}

export interface AIThinkingEffortSelectorProps {
  /** Ordered from least to most effort. */
  steps: readonly AIThinkingEffortStep[];
  /** The `value` of the current step. */
  value: string;
  onValueChange: (value: string) => void;
  /** Heading before the step label — "Thinking" in Figma. */
  label: ReactNode;
  /** Captions under the track's two ends — "Faster" / "Smarter" in Figma. */
  labels: { start: string; end: string };
  /** Slider paint: a DS token name or any CSS colour (e.g. the provider's). */
  color?: DsColor;
  className?: string;
}

/**
 * The effort slider that heads the model menu. The step label rolls as the
 * handle crosses stops (RollChangeText keyed on the step, so a drag across
 * three stops rolls three times rather than once per pointer frame).
 */
const AIThinkingEffortSelector = forwardRef<
  HTMLDivElement,
  AIThinkingEffortSelectorProps
>(
  (
    { steps, value, onValueChange, label, labels, color, className },
    ref,
  ) => {
    const index = Math.max(
      0,
      steps.findIndex((step) => step.value === value),
    );
    const current = steps[index];

    return (
      <div
        ref={ref}
        className={cn("flex w-full min-w-0 flex-col gap-rg p-xs", className)}
      >
        <div className="flex items-center gap-xxs text-text">
          <BodyText>{label}</BodyText>
          {current ? (
            <RollChangeText changeKey={current.value}>
              <ButtonText>{current.label}</ButtonText>
            </RollChangeText>
          ) : null}
        </div>
        <SliderLabeled
          stepped
          variant={SliderVariant.prominent}
          color={color}
          min={0}
          max={Math.max(steps.length - 1, 0)}
          step={1}
          value={[index]}
          onValueChange={([next]) => {
            const step = steps[next];
            if (step && step.value !== value) onValueChange(step.value);
          }}
          labels={labels}
          aria-label={typeof label === "string" ? label : undefined}
        />
      </div>
    );
  },
);
AIThinkingEffortSelector.displayName = "AIThinkingEffortSelector";

// ── Tooltip ───────────────────────────────────────────────────────────────────

export interface AIModelTooltipContentProps
  extends Omit<
    ComponentPropsWithoutRef<typeof TooltipContent>,
    "variant" | "children" | "title" | "color"
  > {
  /** Model name, painted in `color`. */
  title: ReactNode;
  description: ReactNode;
  /** Where the model sits between speed (0) and power (100). */
  capability: number;
  /** Provider colour for the name and the bar: DS token name or any CSS colour. */
  color?: DsColor;
}

/**
 * The tooltip panel for a model item. Compose as
 * `<Tooltip><TooltipTrigger asChild><AIModelSelectItem/></TooltipTrigger>
 *  <AIModelTooltipContent …/></Tooltip>`.
 */
const AIModelTooltipContent = forwardRef<
  ComponentRef<typeof TooltipContent>,
  AIModelTooltipContentProps
>(
  (
    {
      title,
      description,
      capability,
      color,
      className,
      themeInverse = false,
      ...props
    },
    ref,
  ) => (
    <TooltipContent
      ref={ref}
      variant={TooltipTypes.complex}
      themeInverse={themeInverse}
      className={cn("ds-width-chat-model-tooltip", className)}
      {...props}
    >
      <div className="flex w-full flex-col gap-rg px-rg pt-sm pb-md">
        <div className="flex w-full flex-col gap-xs">
          <ButtonText
            style={color ? { color: resolveDsColor(color, "") } : undefined}
          >
            {title}
          </ButtonText>
          <TooltipBody className="text-text">{description}</TooltipBody>
        </div>
        <div className="flex w-full items-center gap-sm">
          <AISpeedIcon size={IconSize.sm} aria-hidden />
          <LinearProgressIndicator
            className="min-w-0 flex-1"
            color={color}
            value={capability}
          />
          <AIPowerIcon size={IconSize.sm} aria-hidden />
        </div>
      </div>
    </TooltipContent>
  ),
);
AIModelTooltipContent.displayName = "AIModelTooltipContent";

export {
  AIModelSelectItem,
  AIModelSelectTrigger,
  AIModelTooltipContent,
  AIThinkingEffortSelector,
};
