// usage/SKILL.md:64-75 — SCAFFOLD: imports, `save`, wrapper, fragment
import { Button, ButtonVariant } from "@dooph-software/design-system"; // SCAFFOLD
declare function save(): void; // SCAFFOLD
export const Ex = () => ( // SCAFFOLD
<>
{/* ✗ hand-rolled button with bespoke styling */}
<button
  className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
  onClick={save}
>
  Save
</button>

{/* ✓ the Button component owns variants, sizes, states, focus ring, shadow */}
<Button variant={ButtonVariant.primary} onClick={save}>Save</Button>
</>
);
