/*
 * AIPromptInput — the chat composer (Figma 761:1382: Empty / Filled / Active).
 *
 * ## behavior
 * - Compound: `AIPromptInput` (a <form>) provides context to
 *   `AIPromptInputTextarea`, `AIPromptInputToolbar` (+ `…Start` / `…End`) and
 *   `AIPromptInputSubmit`. Anything else — an action menu, AIContextGauge, a
 *   model select trigger — is composed into the toolbar by the consumer.
 * - Empty vs Filled is the textarea's own state; the value is controllable
 *   (`value` / `onValueChange`) or uncontrolled (`defaultValue`).
 * - Enter submits, Shift+Enter breaks the line, and an IME composition's Enter
 *   is left alone. `onSubmit` receives the TRIMMED text; an uncontrolled input
 *   then clears itself, a controlled one is cleared by the consumer.
 * - `responding` is Figma's Active: the submit slot becomes a stop button wired
 *   to `onStop`, and submitting is blocked until it ends.
 * - The textarea grows with its content up to `--ui-chat-prompt-max-height`,
 *   then scrolls, and never drops below one line of its own type (`1lh`).
 *   Cap and floor live only in CSS; the component just sets
 *   height = scrollHeight and lets min/max-height bound it.
 *
 * ## constraints
 * - No transport, no hotkeys beyond Enter. A global "focus the prompt" shortcut
 *   is document-level, so it is the consumer's (architecture Rule 7) — the
 *   textarea forwards its ref for exactly that.
 * - Every submit state renders ButtonSize.iconSm. Keep them one
 *   size: a send button that changes size between Empty and Filled grows the
 *   whole composer on the first keystroke and shrinks it again on send.
 */
"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { ArrowUpIcon, IconSize, StopFilledIcon } from "../Icons";

interface PromptInputContextValue {
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
  isEmpty: boolean;
  responding: boolean;
  disabled: boolean;
  onStop?: () => void;
  textareaRef: { current: HTMLTextAreaElement | null };
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

function usePromptInput(part: string) {
  const ctx = useContext(PromptInputContext);
  if (!ctx) {
    throw new Error(`[${part}] must be rendered inside <AIPromptInput>.`);
  }
  return ctx;
}

// ── Root ──────────────────────────────────────────────────────────────────────

export interface AIPromptInputProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text. Never called with an empty string. */
  onSubmit: (text: string) => void;
  /** A response is in flight: submit becomes stop, and submitting is blocked. */
  responding?: boolean;
  /** Aborts the in-flight response. Without it, no stop button is offered. */
  onStop?: () => void;
  disabled?: boolean;
}

const AIPromptInput = forwardRef<HTMLFormElement, AIPromptInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      responding = false,
      onStop,
      disabled = false,
      className,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolledValue;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const setValue = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const trimmed = value.trim();
    const submit = useCallback(() => {
      if (!trimmed || responding || disabled) return;
      onSubmit(trimmed);
      if (!isControlled) setUncontrolledValue("");
    }, [trimmed, responding, disabled, onSubmit, isControlled]);

    return (
      <PromptInputContext.Provider
        value={{
          value,
          setValue,
          submit,
          isEmpty: trimmed.length === 0,
          responding,
          disabled,
          onStop,
          textareaRef,
        }}
      >
        <form
          ref={ref}
          data-state={responding ? "responding" : trimmed ? "filled" : "empty"}
          data-disabled={disabled || undefined}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          // A click on the card's own padding focuses the textarea, as Figma's
          // whole Empty row is a hit target. Clicks on controls are untouched.
          onClick={(event) => {
            onClick?.(event);
            if (event.target === event.currentTarget) {
              textareaRef.current?.focus();
            }
          }}
          className={cn(
            "flex w-full min-w-0 flex-col gap-rg rounded-normal border border-solid border-border-primary bg-surface-primary p-sm shadow-menu",
            "ds-focus-within-ring focus-within:border-input-border-focus",
            className,
          )}
          {...props}
        >
          {children}
        </form>
      </PromptInputContext.Provider>
    );
  },
);
AIPromptInput.displayName = "AIPromptInput";

// ── Textarea ──────────────────────────────────────────────────────────────────

export type AIPromptInputTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue"
>;

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

const AIPromptInputTextarea = forwardRef<
  HTMLTextAreaElement,
  AIPromptInputTextareaProps
>(({ className, onChange, onKeyDown, rows = 1, disabled, ...props }, ref) => {
  const ctx = usePromptInput("AIPromptInputTextarea");
  const { textareaRef, value } = ctx;

  // Height follows content; CSS max-height is the cap. Layout effect so the
  // resize lands before paint and the text never visibly jumps.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // A textarea with no layout (inside a hidden or collapsed ancestor)
    // measures 0. Pinning that as an inline height would stick until the next
    // keystroke, so leave it on `auto` and let the CSS one-line floor hold.
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
  }, [value, textareaRef]);

  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node;
        assignRef(ref, node);
      }}
      rows={rows}
      value={value}
      disabled={disabled ?? ctx.disabled}
      onChange={(event) => {
        onChange?.(event);
        ctx.setValue(event.target.value);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.nativeEvent.isComposing
        ) {
          event.preventDefault();
          ctx.submit();
        }
      }}
      className={cn(
        "ds-chat-prompt-textarea w-full min-w-0 shrink-0 resize-none overflow-y-auto bg-transparent outline-none",
        "text-style-body text-text placeholder:text-text-tertiary",
        "ds-disabled-control",
        className,
      )}
      {...props}
    />
  );
});
AIPromptInputTextarea.displayName = "AIPromptInputTextarea";

// ── Toolbar ───────────────────────────────────────────────────────────────────

export type AIPromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

/** The row under the textarea; Start and End sit at either edge. */
const AIPromptInputToolbar = forwardRef<
  HTMLDivElement,
  AIPromptInputToolbarProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full min-w-0 items-center justify-between gap-rg", className)}
    {...props}
  />
));
AIPromptInputToolbar.displayName = "AIPromptInputToolbar";

/** Leading tools — Figma spaces these a regular gap apart. */
const AIPromptInputToolbarStart = forwardRef<
  HTMLDivElement,
  AIPromptInputToolbarProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-w-0 items-center gap-rg", className)}
    {...props}
  />
));
AIPromptInputToolbarStart.displayName = "AIPromptInputToolbarStart";

/** Trailing controls — the model trigger and submit, an xs gap apart. */
const AIPromptInputToolbarEnd = forwardRef<
  HTMLDivElement,
  AIPromptInputToolbarProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-w-0 items-center gap-xs", className)}
    {...props}
  />
));
AIPromptInputToolbarEnd.displayName = "AIPromptInputToolbarEnd";

// ── Submit ────────────────────────────────────────────────────────────────────

export interface AIPromptInputSubmitProps {
  /** Accessible name while sending is possible — the consumer's copy. */
  sendLabel?: string;
  /** Accessible name while responding — the consumer's copy. */
  stopLabel?: string;
  className?: string;
}

/**
 * Send when idle, stop while responding. Ghost and disabled while the prompt is
 * empty (Figma Empty); prominent once there is something to send (Filled) or
 * something to stop (Active).
 */
const AIPromptInputSubmit = forwardRef<
  HTMLButtonElement,
  AIPromptInputSubmitProps
>(
  (
    { sendLabel = "Send message", stopLabel = "Stop response", className },
    ref,
  ) => {
    const { isEmpty, responding, disabled, onStop } =
      usePromptInput("AIPromptInputSubmit");

    if (responding && onStop) {
      return (
        <Button
          ref={ref}
          type="button"
          variant={ButtonVariant.prominent}
          size={ButtonSize.iconSm}
          aria-label={stopLabel}
          onClick={onStop}
          className={cn("shrink-0", className)}
        >
          <StopFilledIcon size={IconSize.md} />
        </Button>
      );
    }

    const blocked = isEmpty || responding || disabled;
    return (
      <Button
        ref={ref}
        type="submit"
        variant={blocked ? ButtonVariant.ghost : ButtonVariant.prominent}
        size={ButtonSize.iconSm}
        disabled={blocked}
        aria-label={sendLabel}
        className={cn("shrink-0", className)}
      >
        <ArrowUpIcon size={IconSize.md} />
      </Button>
    );
  },
);
AIPromptInputSubmit.displayName = "AIPromptInputSubmit";

export {
  AIPromptInput,
  AIPromptInputSubmit,
  AIPromptInputTextarea,
  AIPromptInputToolbar,
  AIPromptInputToolbarEnd,
  AIPromptInputToolbarStart,
};
