"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { Button } from "../Button";
import { ButtonVariant, ButtonSize } from "../Button/constants";
import { CheckIcon, ClipboardIcon, IconSize } from "../Icons";
import { cn } from "../../utils/cn";
import { CopyButtonVariant } from "./constants";

const REVERT_MS = 2000;

export interface CopyButtonProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Button>,
    "variant" | "size" | "children"
  > {
  /** Text written to the clipboard. */
  value: string;
  variant?: CopyButtonVariant;
  onCopied?: (value: string) => void;
}

const CopyButton = forwardRef<HTMLElement, CopyButtonProps>(
  (
    {
      value,
      variant = CopyButtonVariant.ghost,
      onCopied,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(null);
    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e as never);
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          onCopied?.(value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), REVERT_MS);
        });
      },
      [value, onClick, onCopied],
    );

    const iconSize =
      variant === CopyButtonVariant.ghost ? IconSize.standard : IconSize.medium;
    return (
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        variant={
          variant === CopyButtonVariant.ghost
            ? ButtonVariant.ghost
            : ButtonVariant.secondary
        }
        size={
          variant === CopyButtonVariant.ghost
            ? ButtonSize.iconMicro
            : ButtonSize.iconSm
        }
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        data-copied={copied || undefined}
        onClick={handleClick}
        className={cn("group/copy relative grid place-items-center", className)}
        {...props}
      >
        {/* stacked icons; CSS swaps them on [data-copied] */}
        <span aria-hidden className="ds-copy-icon-clipboard">
          <ClipboardIcon size={iconSize} />
        </span>
        <span aria-hidden className="ds-copy-icon-check">
          <CheckIcon size={iconSize} />
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      </Button>
    );
  },
);
CopyButton.displayName = "CopyButton";
export { CopyButton };
