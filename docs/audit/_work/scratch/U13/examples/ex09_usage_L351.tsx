// usage/SKILL.md:351-361 verbatim
import { Button, ButtonVariant, type ButtonProps } from "@dooph-software/design-system";

export function SaveButton({ busy, disabled, children = "Save", ...props }: ButtonProps & { busy?: boolean }) {
  return (
    <Button variant={ButtonVariant.primary} aria-busy={busy || undefined} disabled={busy || disabled} {...props}>
      {children}
    </Button>
  );
}
