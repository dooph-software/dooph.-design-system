
### WI-C6-03: Give ModalContent and SheetContent the `portal` / `portalProps` escape hatch
- status: todo
- addresses: [F-030]
- depends_on: []
- phase: P3
- risk: low — both props are optional, and the default (`portal = true`, no `portalProps`) renders exactly the tree it does today: one `DialogPrimitive.Portal` around the optional overlay plus the content. `portal={false}` renders the `fixed` overlay and panel in place, so an ancestor with a `transform` or `filter` becomes their containing block. That is what a consumer opting out of the portal asks for, and Tooltip, Popover and DropdownMenu content behave the same way.
- semver: minor
- files:
  - modify: `src/components/Modal/Modal.tsx:57-86 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:120-150 @ b436647`
  - modify: `src/components/Modal/Modal.stories.tsx` (append one story)
  - modify: `src/components/Sheet/Sheet.stories.tsx` (append one story)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:232,237 @ b436647`
  - modify: `skills/dooph-design-system-usage/references/responsive-sheet-modal.md:16 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Added` line)
- anchor:
  ```tsx
  // Modal.tsx:57-65
  const ModalContent = forwardRef<
    ComponentRef<typeof DialogPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
      /** When true, renders the overlay behind the modal. Defaults to true. */
      withOverlay?: boolean;
    }
  >(({ className, children, withOverlay = true, ...props }, ref) => (
    <ModalPortal>
      {withOverlay && <ModalOverlay />}
  // Modal.tsx:82-86
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  ));
  ModalContent.displayName = 'ModalContent';
  // Sheet.tsx:120-140
  const SheetContent = forwardRef<
    ComponentRef<typeof DialogPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
      VariantProps<typeof sheetVariants> & {
        /** When true, renders the overlay behind the sheet. Defaults to true. */
        withOverlay?: boolean;
      }
  >(
    (
      {
        className,
        children,
        side = SheetSide.right,
        withOverlay = true,
        ...props
      },
      ref,
    ) => (
      <SheetPortal>
        {withOverlay && <SheetOverlay />}
        <DialogPrimitive.Content
  // Sheet.tsx:145-150
          {children}
        </DialogPrimitive.Content>
      </SheetPortal>
    ),
  );
  SheetContent.displayName = "SheetContent";
  ```
- why: R2.9 and arch:167 require every overlay `*Content` to default to portalled AND expose `portal`/`portalProps`. Tooltip, Popover and DropdownMenu do; Modal and Sheet do not. So a consumer cannot mount a dialog into a chosen `container` (a shadow root, an iframe, a themed wrapper) or pass `forceMount`, and nesting the content inside the exported `ModalPortal` re-portals to `document.body` (F-030). arch:193 tells the next agent to copy `Modal.tsx`, which spreads the gap.
- steps:
  - [ ] 1. Reproduce (fails before the fix):
    - In a scratch worktree build of HEAD, `node <main>/docs/audit/_work/scratch/W6/wi-c6-03-check.cjs <worktree>` → `FAILURES: 3`. `ModalContent portal={false}` and `SheetContent portal={false}` render nothing, because the prop falls through to `DialogPrimitive.Content` inside a portal, which renders nothing during SSR. The default-portal assertions pass. The audit build gives the same result.
    - tsc probe: in the worktree, a scratch `probe.tsx` containing `import { ModalContent, SheetContent } from "@dooph-software/design-system"; export const a = <ModalContent portal={false} />; export const b = <SheetContent portalProps={{ container: null }} />;` → `npx tsc --noEmit --jsx react-jsx probe.tsx` reports TS2322 on both lines.
  - [ ] 2. Modal.tsx:57-86 → a named props interface plus Tooltip.tsx:79-86's shape. The overlay-plus-content fragment is built once and either returned bare or wrapped in the portal:
    ```tsx
    export interface ModalContentProps
      extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
      /** When true, renders the overlay behind the modal. Defaults to true. */
      withOverlay?: boolean;
      /** Render through a portal (the default) or in place. */
      portal?: boolean;
      /** Props for the portal, e.g. `container` or `forceMount`. */
      portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
    }

    const ModalContent = forwardRef<
      ComponentRef<typeof DialogPrimitive.Content>,
      ModalContentProps
    >(
      (
        {
          className,
          children,
          withOverlay = true,
          portal = true,
          portalProps,
          ...props
        },
        ref,
      ) => {
        const content = (
          <>
            {withOverlay && <ModalOverlay />}
            <DialogPrimitive.Content
              ref={ref}
              className={cn(
                /* the eleven class strings at :69-78, unchanged */
              )}
              {...props}
            >
              {children}
            </DialogPrimitive.Content>
          </>
        );

        if (!portal) {
          return content;
        }

        return (
          <DialogPrimitive.Portal {...portalProps}>{content}</DialogPrimitive.Portal>
        );
      },
    );
    ModalContent.displayName = 'ModalContent';
    ```
    Move the `cn(...)` argument list at :69-78 into the new `className={cn(…)}` verbatim. Do not use the placeholder comment: it only marks where the existing lines go. Keep the file's single-quote style. `ModalPortal` (:15) stays exported, unchanged. `Modal/index.ts` is `export * from './Modal'`, so `ModalContentProps` reaches the barrel without an index edit.
  - [ ] 3. Sheet.tsx:120-150 → the same shape:
    ```tsx
    export interface SheetContentProps
      extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
        VariantProps<typeof sheetVariants> {
      /** When true, renders the overlay behind the sheet. Defaults to true. */
      withOverlay?: boolean;
      /** Render through a portal (the default) or in place. */
      portal?: boolean;
      /** Props for the portal, e.g. `container` or `forceMount`. */
      portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
    }

    const SheetContent = forwardRef<
      ComponentRef<typeof DialogPrimitive.Content>,
      SheetContentProps
    >(
      (
        {
          className,
          children,
          side = SheetSide.right,
          withOverlay = true,
          portal = true,
          portalProps,
          ...props
        },
        ref,
      ) => {
        const content = (
          <>
            {withOverlay && <SheetOverlay />}
            <DialogPrimitive.Content
              ref={ref}
              className={cn(sheetVariants({ side }), className)}
              {...props}
            >
              {children}
            </DialogPrimitive.Content>
          </>
        );

        if (!portal) {
          return content;
        }

        return (
          <DialogPrimitive.Portal {...portalProps}>{content}</DialogPrimitive.Portal>
        );
      },
    );
    SheetContent.displayName = "SheetContent";
    ```
    The `side` typing stays `VariantProps<typeof sheetVariants>` here, so nothing about it changes in this item. WI-C5-05 (P4) retypes `side` later; when it lands, its Sheet.tsx:122-126 step applies to this `SheetContentProps` interface: replace `VariantProps<typeof sheetVariants>` with `side?: SheetSide`.
  - [ ] 4. Stories. Append to `src/components/Modal/Modal.stories.tsx`:
    ```tsx
    function ModalInContainerDemo() {
      const [container, setContainer] = useState<HTMLDivElement | null>(null);
      return (
        <div className="flex flex-col items-center gap-md">
          <Modal>
            <ModalTrigger asChild>
              <Button variant={ButtonVariant.primary}>Open into the frame</Button>
            </ModalTrigger>
            <ModalContent portalProps={{ container }} aria-describedby={undefined}>
              <div className="p-6">
                <ModalTitle>Portalled into a local container</ModalTitle>
              </div>
            </ModalContent>
          </Modal>
          <div ref={setContainer} data-testid="modal-container" />
        </div>
      );
    }

    export const CustomContainer: Story = {
      render: () => <ModalInContainerDemo />,
    };
    ```
    Append the same to `src/components/Sheet/Sheet.stories.tsx`, with `Sheet`/`SheetTrigger`/`SheetContent side={SheetSide.right}`/`SheetTitle`, the demo named `SheetInContainerDemo` and `data-testid="sheet-container"`. Both files already import `useState`, `Button` and `ButtonVariant`.
  - [ ] 5. Docs:
    - `.agents/skills/dooph-ds-codebase/SKILL.md:232` and `:237`: in each row, replace the substring `` `withOverlay` bool `` with `` `withOverlay` bool; `portal` (default true) / `portalProps` escape hatch ``. Leave the rest of each row alone; WI-C3-07 edits other parts of :237.
    - `skills/dooph-design-system-usage/references/responsive-sheet-modal.md:16`: change the third cell `Sheet adds \`side\` (\`SheetSide.*\`); both have \`withOverlay\`` to `Sheet adds \`side\` (\`SheetSide.*\`); both have \`withOverlay\`, \`portal\` and \`portalProps\``.
    - CHANGELOG.md `[Unreleased]` → `### Added`: "- `ModalContent` and `SheetContent` accept `portal` (default `true`) and `portalProps`, like the other overlay contents; `ModalContentProps` and `SheetContentProps` are exported."
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with the change: `wi-c6-03-check.cjs <worktree>` → `ALL PASS`. Re-run step 1's tsc probe → 0 errors. `rg -n "portalProps" dist/components/Modal/Modal.d.ts dist/components/Sheet/Sheet.d.ts` → one hit each.
    - Default output unchanged: in Storybook, Overlays/Modal › Default and Overlays/Sheet › Right open, animate and close as before, and `document.querySelectorAll('[role=dialog]')[0].parentElement === document.body` → `true` while open.
    - Overlays/Modal › Custom Container and Overlays/Sheet › Custom Container: open each → `document.querySelector('[data-testid=modal-container] [role=dialog]')` (resp. `sheet-container`) is non-null, and focus is trapped inside the dialog.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-03-check.cjs` prints `ALL PASS` on a fresh build; `<ModalContent portal={false}>` and `<SheetContent portalProps={{ container: null }}>` type-check; both Custom Container stories mount their dialog inside the local container.
- log:
  - 2026-10-01 — created by audit
