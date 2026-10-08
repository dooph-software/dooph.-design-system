// responsive-sheet-modal.md:99-103 — SCAFFOLD: imports + wrapper
import { Button } from "@dooph-software/design-system"; // SCAFFOLD
import { ResponsiveDialog } from "./ResponsiveDialog"; // SCAFFOLD
export const Ex = () => ( // SCAFFOLD
<ResponsiveDialog trigger={<Button>Filters</Button>} title="Filters">
  <div className="p-6">{/* same content in both presentations */}</div>
</ResponsiveDialog>
);
