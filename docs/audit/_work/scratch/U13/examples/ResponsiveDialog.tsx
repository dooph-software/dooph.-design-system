// responsive-sheet-modal.md:50-95 verbatim (ex11). Uses the global `React`
// namespace for React.ReactNode without importing React (as in the doc).
"use client";
import {
  Modal, ModalTrigger, ModalContent, ModalTitle,
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetSide,
} from "@dooph-software/design-system";
import { useIsDesktop } from "./useIsDesktop";

export function ResponsiveDialog({
  trigger,
  title,
  children,
  open,
  onOpenChange,
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
