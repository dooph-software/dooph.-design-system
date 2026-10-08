// U8 probe: responsive-sheet-modal.md examples (lines 29-46, 50-95, 100-102) + overlay API facts.
"use client";
import { useSyncExternalStore } from "react";
import {
  Modal, ModalTrigger, ModalContent, ModalTitle,
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetSide,
  Button, ToastProvider, TooltipContent, TooltipTypes, ToastTypes, useToast,
} from "@dooph-software/design-system";

const QUERY = "(min-width: 768px)";
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}

export function ResponsiveDialog({
  trigger, title, children, open, onOpenChange,
}: {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalTrigger asChild>{trigger}</ModalTrigger>
        <ModalContent>
          <ModalTitle className="sr-only">{title}</ModalTitle>
          {children}
        </ModalContent>
      </Modal>
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={SheetSide.bottom}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export const usage = (
  <ResponsiveDialog trigger={<Button>Filters</Button>} title="Filters">
    <div className="p-6">{/* same content in both presentations */}</div>
  </ResponsiveDialog>
);

// Fact: ToastProvider accepts Radix provider `duration` (U8-F1)
export const provider = <ToastProvider duration={8000}>{null}</ToastProvider>;
// Fact: ModalContent / SheetContent reject portal props (U8-F4) — expect errors on the next two lines
export const m = <Modal><ModalContent portal={false} /></Modal>;
export const s = <Sheet><SheetContent portalProps={{}} /></Sheet>;
export const t = <TooltipContent portal={false} variant={TooltipTypes.rich} />;
// Fact: toast options type is not importable by name
import type { ToastOptions } from "@dooph-software/design-system";
export function useT() { const { toast } = useToast(); return toast({ variant: ToastTypes.prominent }); }
