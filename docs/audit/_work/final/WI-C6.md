# WI-C6 — work items

Draft work items for the findings in `F-C6.md` (composer C6) @ b436647.

Ordering note: four items edit `src/components/Toast/Toast.tsx`, so they form a chain: WI-C6-01 → WI-C6-04 → WI-C6-08 → WI-C6-09. Each one quotes its anchor at b436647 and only touches lines its predecessors leave alone, but the chain keeps the steps applying cleanly in order. WI-C6-07 follows WI-C6-02 (both edit `AIPromptInput.tsx`), WI-C6-06 follows WI-C6-03 (the shared dialog shell absorbs the new portal escape hatch), and WI-C6-12 follows WI-C6-11 (both edit `AIThinkingPart.tsx`). Cross-composer dependencies: WI-C3-10 rewrites the AIChat header contracts that WI-C6-02 and WI-C6-11 extend, and WI-C1-03 rewrites `src/utils/cn.ts`, which WI-C6-12 relies on. Nothing here is breaking, so nothing depends on the release items.

"Scratch worktree" means: `git worktree add ../dooph-ds-wi-c6-<nn> HEAD`, then `npm ci && npm run build` in it. Remove the worktree afterwards (`git worktree remove ../dooph-ds-wi-c6-<nn>`). The agent commits nothing. "Storybook" means `npm run storybook` in the main checkout with the Browser pane visible, because a hidden pane freezes timers and CSS animations.

### WI-C6-01: Make ToastProvider's `duration` the default for every toast it renders
- status: todo
- addresses: [F-005]
- depends_on: []
- phase: P3
- risk: low — the default delay stays 4000ms, so an app that sets no `duration` anywhere sees no change. Apps that already pass `<ToastProvider duration={…}>` start getting the delay they asked for, which is the fix. A per-toast `duration` still wins. `toast({ duration: 0 })` keeps falling back to the provider value (Radix's `durationProp || context.duration`), as it does today.
- semver: patch
- files:
  - modify: `src/components/Toast/Toast.tsx:197-208 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:237 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:243 @ b436647`
  - modify: `src/components/Toast/Toast.stories.tsx` (append one story)
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```tsx
  // Toast.tsx:197-208
  export interface ToastProviderProps extends ComponentPropsWithoutRef<
    typeof ToastPrimitive.Provider
  > {
    children: ReactNode;
    viewportProps?: ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>;
  }

  function ToastProvider({
    children,
    viewportProps,
    ...props
  }: ToastProviderProps) {
  // Toast.tsx:237
      <ToastPrimitive.Provider swipeDirection="right" {...props}>
  // Toast.tsx:243
            duration={item.duration ?? 4000}
  ```
- why: `<ToastProvider duration={8000}>` type-checks and reaches Radix context, but every provider-rendered toast passes a truthy per-toast `4000`. Radix resolves `durationProp || context.duration`, so the app-wide knob is dead and consumers have to repeat `duration` on every `toast()` call (F-005).
- steps:
  - [ ] 1. Reproduce (fails before the fix). Append to `src/components/Toast/Toast.stories.tsx`:
    ```tsx
    export const ProviderDuration: Story = {
      name: "Provider duration (1s)",
      render: () => (
        <ToastProvider duration={1000}>
          <ToastDemo label="Gone in a second" variant={ToastTypes.simple} />
        </ToastProvider>
      ),
    };
    ```
    It reuses the file's own `ToastDemo` helper. In Storybook, open the story in isolation (`iframe.html?id=overlays-toast--provider-duration`). Keep the pointer off the toast and the window focused, because Radix pauses the timer on viewport hover, focus and window blur. In the browser console run:
    ```js
    const vp = document.querySelector(".ds-toast-viewport");
    let t0;
    document.querySelector("button").addEventListener("click", () => { t0 = performance.now(); }, { capture: true });
    new MutationObserver((recs) => {
      for (const r of recs) for (const n of r.removedNodes)
        if (n.nodeName === "LI") console.log("removed after", Math.round(performance.now() - t0), "ms");
    }).observe(vp, { childList: true });
    ```
    Click "Show Gone in a second". Today the log reads `removed after ~4000 ms` (the defect).
  - [ ] 2. Toast.tsx:197-208 → put the package default on the provider and document it:
    ```tsx
    export interface ToastProviderProps extends ComponentPropsWithoutRef<
      typeof ToastPrimitive.Provider
    > {
      children: ReactNode;
      viewportProps?: ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>;
      /**
       * Auto-dismiss delay in ms for every toast this provider renders. A
       * `toast({ duration })` overrides it for that toast; pass `Infinity` to keep
       * one open. Default 4000.
       */
      duration?: number;
    }

    function ToastProvider({
      children,
      viewportProps,
      duration = 4000,
      ...props
    }: ToastProviderProps) {
    ```
  - [ ] 3. Toast.tsx:237 → `<ToastPrimitive.Provider swipeDirection="right" duration={duration} {...props}>` (keep `{...props}` last, as today, so the remaining Radix Provider props still pass through).
  - [ ] 4. Toast.tsx:243 → `duration={item.duration}`. Radix then resolves per-toast → provider → package default in its own order, and an omitted per-toast `duration` is `undefined`.
  - [ ] 5. CHANGELOG.md `[Unreleased]`: under `### Fixed` (add the heading after `### Changed` if no earlier item created it): "- `ToastProvider`'s `duration` now sets the auto-dismiss delay for every toast it renders; it was overridden by a per-toast 4000ms. The default stays 4000ms."
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "\?\? 4000" src/components/Toast/Toast.tsx` → no matches.
    - Storybook, the step 1 harness on Provider duration (1s): `removed after ~1000 ms`. On Overlays/Toast › Standard (no provider `duration`) the same harness → `~4000 ms`. On Overlays/Toast › Persistent, the "Processing…" toast (`duration: Infinity`) stays open until its story dismisses it.
    - Scratch worktree build: `rg -n "duration" dist/components/Toast/Toast.d.ts` → the `duration?: number` member with its JSDoc on `ToastProviderProps`.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "\?\? 4000" src/components/Toast/Toast.tsx` → no matches; the Provider duration (1s) story's toast is removed after about 1000ms; the Standard story's after about 4000ms.
- log:
  - 2026-10-01 — created by audit

### WI-C6-02: Spread the rest props in AIPromptInputSubmit and AIThinkingEffortSelector, and make an unknown effort `value` throw
- status: todo
- addresses: [F-028, F-097]
- depends_on: [WI-C3-10]
- phase: P3
- risk: low — both parts gain props they silently dropped. The props each part owns are set after the spread, so a consumer cannot change the submit button's `type`, `variant`, `size`, `disabled` or accessible name. The one new failure mode is deliberate: an `AIThinkingEffortSelector` whose `value` is missing from `steps` now throws during render instead of drawing step 0. An app that relied on the silent fallback across a model switch will see the error and has to map the effort itself, which is the point (F-097).
- semver: minor
- files:
  - modify: `src/components/AIChat/AIPromptInput.tsx:31-44,281-336 @ b436647`
  - modify: `src/components/AIChat/AIModelSelect.tsx:11-19 @ b436647` (header `## constraints`)
  - modify: `src/components/AIChat/AIModelSelect.tsx:112-150 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line, one `### Changed` line)
- anchor:
  ```tsx
  // AIPromptInput.tsx:281-287
  export interface AIPromptInputSubmitProps {
    /** Accessible name while sending is possible — the consumer's copy. */
    sendLabel?: string;
    /** Accessible name while responding — the consumer's copy. */
    stopLabel?: string;
    className?: string;
  }
  // AIPromptInput.tsx:298-300
    (
      { sendLabel = "Send message", stopLabel = "Stop response", className },
      ref,
  // AIModelSelect.tsx:112
  export interface AIThinkingEffortSelectorProps {
  // AIModelSelect.tsx:123-125
    color?: DsColor;
    className?: string;
  }
  // AIModelSelect.tsx:136-150
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
  ```
- why: These are the only two of the AI chat family's 17 parts that do not spread `...props`, so the Radix `Slot` handlers and `data-state` from `<TooltipTrigger asChild>` / `<DropdownMenuTrigger asChild>` are discarded. A "Send (Enter)" tooltip never opens, and `id`/`data-testid`/`aria-describedby` cannot be set (F-028). The selector also maps an unknown `value` to step 0 on both the label and the slider while the app keeps the old value. That is the silent disagreement AIContextGauge's header rejects (F-097). Both changes rewrite the same destructure, so they ship together.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, run `node <main>/docs/audit/_work/scratch/W6/wi-c6-02-check.cjs <worktree>` and save its output as `<scratch>/c6-02-before.txt`. Today it prints `FAILURES: 6`: the submit under `TooltipTrigger asChild` has no `data-state="closed"`; the send and stop buttons drop `id`/`data-testid`; the selector under `DropdownMenuTrigger asChild` has no `data-state`; the selector drops `id`/`data-testid`; and `value: "missing"` does not throw. Run against the audit build (`C:/Users/stick/Github/dooph/dooph-ds-audit-build`), it prints the same 6 FAILs.
  - [ ] 2. AIPromptInput.tsx:281-287 → extend the HTML button props. Use `ComponentPropsWithoutRef<"button">`, as `AIModelSelectTriggerProps` does (AIModelSelect.tsx:43-44), and not the polymorphic `typeof Button`, whose generic call signature does not resolve to one props type:
    ```tsx
    export interface AIPromptInputSubmitProps
      extends Omit<
        ComponentPropsWithoutRef<"button">,
        "children" | "type" | "disabled" | "aria-label"
      > {
      /** Accessible name while sending is possible — the consumer's copy. */
      sendLabel?: string;
      /** Accessible name while responding — the consumer's copy. */
      stopLabel?: string;
    }
    ```
    Add `type ComponentPropsWithoutRef,` to the `react` import at :31-44.
  - [ ] 3. AIPromptInput.tsx:298-334 → destructure the rest and spread it FIRST on both buttons, so the part's own `type`, `variant`, `size` (header: "Every submit state renders ButtonSize.iconSm"), `disabled` and `aria-label` always win. In the stop branch, run the consumer's `onClick` before `onStop`, and let `preventDefault()` cancel the stop:
    ```tsx
      (
        {
          sendLabel = "Send message",
          stopLabel = "Stop response",
          className,
          onClick,
          ...props
        },
        ref,
      ) => {
        const { isEmpty, responding, disabled, onStop } =
          usePromptInput("AIPromptInputSubmit");

        if (responding && onStop) {
          return (
            <Button
              {...props}
              ref={ref}
              type="button"
              variant={ButtonVariant.prominent}
              size={ButtonSize.iconSm}
              aria-label={stopLabel}
              onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) onStop();
              }}
              className={cn("shrink-0", className)}
            >
              <StopFilledIcon size={IconSize.md} />
            </Button>
          );
        }

        const blocked = isEmpty || responding || disabled;
        return (
          <Button
            {...props}
            ref={ref}
            type="submit"
            variant={blocked ? ButtonVariant.ghost : ButtonVariant.prominent}
            size={ButtonSize.iconSm}
            disabled={blocked}
            aria-label={sendLabel}
            onClick={onClick}
            className={cn("shrink-0", className)}
          >
            <ArrowUpIcon size={IconSize.md} />
          </Button>
        );
      },
    ```
  - [ ] 4. AIModelSelect.tsx:112 → extend the HTML div props. The part's own `color?: DsColor` replaces the HTML `color` attribute. `onChange` and `defaultValue` are omitted so they cannot be confused with `onValueChange`/`value`:
    ```tsx
    export interface AIThinkingEffortSelectorProps
      extends Omit<
        ComponentPropsWithoutRef<"div">,
        "children" | "color" | "onChange" | "defaultValue"
      > {
    ```
    Delete the now-inherited `className?: string;` at :124. `ComponentPropsWithoutRef` is already imported (:22).
  - [ ] 5. AIModelSelect.tsx:136-150 → spread the rest first on the root, and replace the clamp with a guard worded like ProgressIndicator.tsx:293-295:
    ```tsx
      (
        { steps, value, onValueChange, label, labels, color, className, ...props },
        ref,
      ) => {
        const found = steps.findIndex((step) => step.value === value);
        if (steps.length > 0 && found === -1) {
          throw new Error(
            `[AIThinkingEffortSelector] value "${value}" is not one of steps: ${steps
              .map((step) => step.value)
              .join(", ")}`,
          );
        }
        const index = Math.max(0, found);
        const current = steps[index];

        return (
          <div
            {...props}
            ref={ref}
            className={cn("flex w-full min-w-0 flex-col gap-rg p-xs", className)}
          >
    ```
    `Math.max(0, found)` now covers only the empty-`steps` case, which keeps rendering as today (no step label, a 0..0 slider).
  - [ ] 6. AIModelSelect.tsx header: append to `## constraints`, after the radio-choice bullet that ends at :18 (`selected fill, check and aria-checked all come from the menu itself.`) and before the closing ` */`. WI-C3-10 reorganises the header above this point, so append after whatever is then the last `## constraints` bullet:
    ```text
     * - AIThinkingEffortSelector THROWS when `value` is not one of `steps`. A
     *   selector that quietly drew step 0 would disagree with the effort the
     *   consumer sends, the same reason AIContextGauge is not clamped. Mapping an
     *   effort across a model switch whose steps differ is the consumer's job.
    ```
    The existing "Every label, colour and step list is data the consumer passes in" constraint still holds: the guard validates consumer data and adds no levels.
  - [ ] 7. CHANGELOG.md `[Unreleased]`: under `### Fixed` (create it after `### Changed` if no earlier item did): "- `AIPromptInputSubmit` and `AIThinkingEffortSelector` forward their remaining props, so `asChild` triggers (Tooltip, DropdownMenu) and `id`/`data-*`/`aria-*` attributes work on them." Under `### Changed`: "- `AIThinkingEffortSelector` throws when `value` is not one of `steps`, instead of drawing the first step."
  - [ ] 8. Verify:
    - `npm run lint` → exit 0.
    - In a fresh scratch worktree build with the change: `node <main>/docs/audit/_work/scratch/W6/wi-c6-02-check.cjs <worktree>` → `ALL PASS`. Diff its `BASELINE:` line against the one in `c6-02-before.txt` → identical (a valid value renders exactly as before).
    - tsc probe in the worktree: a scratch `probe.tsx` importing from `@dooph-software/design-system`, with `<AIPromptInputSubmit type="button" />` and `<AIThinkingEffortSelector steps={[]} value="" onValueChange={() => {}} label="T" labels={{ start: "a", end: "b" }} onChange={() => {}} />` → `npx tsc --noEmit --jsx react-jsx probe.tsx` reports errors on `type` and `onChange` only. `<AIPromptInputSubmit id="s" data-testid="s" onClick={() => {}} />` → no error.
    - Storybook, AI Chat/Prompt Input: in a local, uncommitted story edit, wrap the submit in `<Tooltip><TooltipTrigger asChild>…</TooltipTrigger><TooltipContent>Send (Enter)</TooltipContent></Tooltip>` → hovering the button opens the tooltip. With `responding` and `onStop` set, a click still calls `onStop`. Revert the story edit.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-02-check.cjs` prints `ALL PASS` on a fresh build, and its `BASELINE:` line is unchanged from b436647; AIModelSelect.tsx's `## constraints` contains "THROWS when `value` is not one of `steps`".
- log:
  - 2026-10-01 — created by audit
  - note: if D-12 settles the invalid-value policy on a dev-only `console.warn` (the Calendar.tsx:61-70 pattern) instead of a throw, replace step 5's `throw` with that warning plus the step-0 fallback, reword step 6's bullet to "warns in development", and change the script's throw assertion to match.

### WI-C6-03: Give ModalContent and SheetContent the `portal` / `portalProps` escape hatch
- status: todo
- addresses: [F-030]
- depends_on: []
- phase: P3
- risk: low — both props are optional, and the default (`portal = true`, no `portalProps`) renders exactly the tree it does today: one `DialogPrimitive.Portal` whose children are the optional overlay and the content, as two separate children. `portal={false}` renders the `fixed` overlay and panel in place, so an ancestor with a `transform` or `filter` becomes their containing block. That is what a consumer opting out of the portal asks for, and Tooltip, Popover and DropdownMenu content behave the same way. The one way to get this wrong is to hand the portal a single Fragment (see step 2).
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
  // Modal.tsx:57-86
  const ModalContent = forwardRef<
    ComponentRef<typeof DialogPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
      /** When true, renders the overlay behind the modal. Defaults to true. */
      withOverlay?: boolean;
    }
  >(({ className, children, withOverlay = true, ...props }, ref) => (
    <ModalPortal>
      {withOverlay && <ModalOverlay />}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50',
          '-translate-x-1/2 -translate-y-1/2',
          'bg-modal-surface border border-solid border-border-popovers',
          'rounded-soft overflow-hidden',
          'shadow-menu',
          'focus-visible:outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
          'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  ));
  ModalContent.displayName = 'ModalContent';
  // Sheet.tsx:120-150
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
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
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
    - In a scratch worktree build of HEAD, `node <main>/docs/audit/_work/scratch/W6/wi-c6-03-check.cjs <worktree>` → `FAILURES: 3`. `ModalContent portal={false}` (two assertions) and `SheetContent portal={false}` render an empty string, because the prop falls through to `DialogPrimitive.Content` inside a portal, and a Radix portal renders nothing during SSR. The default-portal assertions and the `withOverlay={false}` one pass. Run against the audit build (`C:/Users/stick/Github/dooph/dooph-ds-audit-build`), it prints the same 3 FAILs (re-run 2026-10-02).
    - tsc probe: in the worktree, a scratch `probe.tsx` containing `import { ModalContent, SheetContent } from "@dooph-software/design-system"; export const a = <ModalContent portal={false} />; export const b = <SheetContent portalProps={{ container: null }} />;` → `npx tsc --noEmit --jsx react-jsx probe.tsx` reports TS2322 on both lines.
  - [ ] 2. Modal.tsx:57-86 → a named props interface plus Tooltip.tsx:79-86's portal-or-not shape. Keep the overlay and the panel as two separate JSX values and pass them to the portal as two children. Do NOT wrap them in one `<>…</>` and hand that to `DialogPrimitive.Portal`: Radix `DialogPortal` (`@radix-ui/react-dialog` 1.1.23 `dist/index.mjs:94`) maps its children one by one into `Presence` → `Portal asChild`, and `Presence` calls `React.Children.only` and then `cloneElement(child, { ref })` (`@radix-ui/react-presence` `dist/index.mjs:23-26`). A Fragment child would receive that ref, so `Presence` would lose the node it watches for the exit animation.
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
        const overlay = withOverlay ? <ModalOverlay /> : null;
        const panel = (
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'fixed left-1/2 top-1/2 z-50',
              '-translate-x-1/2 -translate-y-1/2',
              'bg-modal-surface border border-solid border-border-popovers',
              'rounded-soft overflow-hidden',
              'shadow-menu',
              'focus-visible:outline-none',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
              'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
              className
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        );

        if (!portal) {
          return (
            <>
              {overlay}
              {panel}
            </>
          );
        }

        return (
          <DialogPrimitive.Portal {...portalProps}>
            {overlay}
            {panel}
          </DialogPrimitive.Portal>
        );
      },
    );
    ModalContent.displayName = 'ModalContent';
    ```
    The `cn(...)` list is the one at :69-78. If WI-C4-03 has already replaced :75-77 with its motion helper, carry the list as it then stands; this item changes no class. `React.Children.map` skips the `null` overlay, as it skips today's `false`. Keep the file's single-quote style. `ModalPortal` (:15) stays exported, unchanged. `Modal/index.ts` is `export * from './Modal'`, so `ModalContentProps` reaches the barrel without an index edit.
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
        const overlay = withOverlay ? <SheetOverlay /> : null;
        const panel = (
          <DialogPrimitive.Content
            ref={ref}
            className={cn(sheetVariants({ side }), className)}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        );

        if (!portal) {
          return (
            <>
              {overlay}
              {panel}
            </>
          );
        }

        return (
          <DialogPrimitive.Portal {...portalProps}>
            {overlay}
            {panel}
          </DialogPrimitive.Portal>
        );
      },
    );
    SheetContent.displayName = "SheetContent";
    ```
    The `side` typing stays `VariantProps<typeof sheetVariants>` here. WI-C5-05 (P4) retypes `side` later; when it lands, its Sheet.tsx:122-126 step applies to this `SheetContentProps` interface: replace `VariantProps<typeof sheetVariants>` with `side?: SheetSide`.
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
    Append the same to `src/components/Sheet/Sheet.stories.tsx`, with `Sheet` / `SheetTrigger` / `<SheetContent side={SheetSide.right} …>` / `SheetTitle`, the demo named `SheetInContainerDemo` and `data-testid="sheet-container"`. Both files already import `useState`, `Button` and `ButtonVariant` (Modal.stories.tsx:2,11-12; Sheet.stories.tsx:2,12-13), and Sheet.stories.tsx imports `SheetSide` (:11).
  - [ ] 5. Docs:
    - `.agents/skills/dooph-ds-codebase/SKILL.md:232` and `:237`: in each row, replace the substring `` `withOverlay` bool `` with `` `withOverlay` bool; `portal` (default true) / `portalProps` escape hatch ``. Leave the rest of each row alone; WI-C3-07 edits other parts of :237.
    - `skills/dooph-design-system-usage/references/responsive-sheet-modal.md:16`: change the third cell `` Sheet adds `side` (`SheetSide.*`); both have `withOverlay` `` to `` Sheet adds `side` (`SheetSide.*`); both have `withOverlay`, `portal` and `portalProps` ``.
    - CHANGELOG.md `[Unreleased]` → `### Added`: "- `ModalContent` and `SheetContent` accept `portal` (default `true`) and `portalProps`, like the other overlay contents; `ModalContentProps` and `SheetContentProps` are exported."
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with the change: `wi-c6-03-check.cjs <worktree>` → `ALL PASS`. Re-run step 1's tsc probe → 0 errors. `rg -n "portalProps" dist/components/Modal/Modal.d.ts dist/components/Sheet/Sheet.d.ts` → at least one hit in each file.
    - Default output and exit animation unchanged: in Storybook, Overlays/Modal › Default and Overlays/Sheet › Right open and close as before. While open, `[...document.querySelectorAll('[role=dialog]')].every((d) => d.parentElement === document.body)` → `true`, and the browser console shows no "Invalid prop `ref` supplied to `React.Fragment`" error. Press Escape and, in the same task, run `document.querySelector('[role=dialog]')?.dataset.state` → `"closed"`: the panel stays mounted for its exit animation. With a Fragment-wrapped portal child it would already be gone.
    - Overlays/Modal › Custom Container and Overlays/Sheet › Custom Container: open each → `document.querySelector('[data-testid=modal-container] [role=dialog]')` (resp. `sheet-container`) is non-null, and Tab keeps focus inside the dialog.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-03-check.cjs` prints `ALL PASS` on a fresh build; `<ModalContent portal={false}>` and `<SheetContent portalProps={{ container: null }}>` type-check; both Custom Container stories mount their dialog inside the local container; `rg -n "Portal \{\.\.\.portalProps\}>\{" src/components/Modal/Modal.tsx src/components/Sheet/Sheet.tsx` → no matches (no Fragment handed to the portal).
- log:
  - 2026-10-01 — created by audit

### WI-C6-04: Let every provider-rendered toast play its exit animation, and remove it on `animationend` instead of a 200ms timer
- status: todo
- addresses: [F-035]
- depends_on: [WI-C6-01]
- phase: P3
- risk: low — the open path and every class stay as they are. What changes is when a closed toast leaves React state: on the end of its own exit animation instead of at once (Radix close paths) or after 200ms (`dismiss`). Two things could regress. (a) A toast whose exit never fires `animationend` would stay in state with `open: false`. Radix `Presence` has already unmounted it in that case, so nothing shows, but the array keeps the entry. Provider-rendered toasts take no `className`, and the reduced-motion `duration-0` still dispatches `animationend`, so the only way to hit this is a hidden tab, which delivers the event when the tab is shown again. (b) A bubbling `animationend` from a descendant could prune a toast early; the `target === currentTarget` and `data-state === "closed"` guards stop that.
- semver: patch
- files:
  - modify: `src/components/Toast/Toast.tsx:225-232 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:245-251 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```tsx
  // Toast.tsx:225-232
    const dismiss = useCallback((id: string) => {
      setToasts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 200);
    }, []);
  // Toast.tsx:245-251
            onOpenChange={(open) => {
              if (!open) {
                setToasts((prev) =>
                  prev.filter((toastItem) => toastItem.id !== item.id),
                );
              }
            }}
  ```
- why: The provider controls each `ToastRoot`'s `open`, so every Radix close path (timer, close button, `ToastDismiss`, Escape, swipe end) only calls the DS `onOpenChange`, which filters the item out synchronously. The root unmounts before Radix `Presence` sees `present=false`, so the `data-[state=closed]:*` exit never plays. Only `dismiss()` animates, through a 200ms JS copy of the 150ms CSS exit, which arch Rule 6 (arch:354-359) forbids and which truncates the exit as soon as it is retuned above 200ms (F-035).
- steps:
  - [ ] 1. Reproduce (fails before the fix). In Storybook with the Browser pane visible (a hidden pane freezes CSS animations), open Overlays/Toast › Persistent in isolation (`iframe.html?id=overlays-toast--persistent`) and run in the console:
    ```js
    const vp = document.querySelector(".ds-toast-viewport");
    window.__toastLog = [];
    new MutationObserver((recs) => {
      for (const r of recs) for (const n of r.removedNodes)
        if (n.nodeName === "LI") {
          const line = `removed "${n.textContent.trim().slice(0, 24)}" state-at-removal=${n.dataset.state}`;
          window.__toastLog.push(line);
          console.log(line);
        }
    }).observe(vp, { childList: true });
    ```
    Then: (a) click "Show persistent", then the toast's close (X) button; (b) click "Show persistent", then "Dismiss"; (c) open Overlays/Toast › Standard, re-run the snippet, click "Show File deleted" and wait 5s with the pointer off the toast. Today (a) and (c) log `state-at-removal=open` and (b) logs `state-at-removal=closed`, which matches V7's run against the built dist (`308ms … open`, `823ms … closed`, `1485ms … open`).
  - [ ] 2. Toast.tsx:225-232 → `dismiss` only closes; the item leaves state when its exit animation ends (step 3):
    ```tsx
      const dismiss = useCallback((id: string) => {
        setToasts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
        );
      }, []);
    ```
  - [ ] 3. Toast.tsx:245-251 → `onOpenChange(false)` does what `dismiss` does, and a new `onAnimationEnd` prunes the item once its own exit animation has finished:
    ```tsx
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            onAnimationEnd={(event) => {
              // Prune only on this toast's own exit animation. Radix Presence
              // keeps the <li> mounted until the data-[state=closed] animation
              // ends, so the CSS is the only source of the exit timing; the
              // reduced-motion duration-0 still dispatches animationend.
              if (
                event.target === event.currentTarget &&
                event.currentTarget.dataset.state === "closed"
              ) {
                setToasts((prev) =>
                  prev.filter((toastItem) => toastItem.id !== item.id),
                );
              }
            }}
    ```
    `onAnimationEnd` reaches the `<li>`: Radix spreads the remaining root props onto it (`@radix-ui/react-toast` 1.2.23 `dist/index.mjs:394-399`), and `Presence` listens with its own native listener, so the two do not interfere. Do not prune from an effect cleanup instead: StrictMode double-invokes effects in development and would prune live toasts. `dismiss` is declared above the JSX (:225), so the handler can call it. WI-C6-01 has already changed :243 to `duration={item.duration}`; leave that line alone.
  - [ ] 4. CHANGELOG.md `[Unreleased]` → `### Fixed` (create it after `### Changed` if no earlier item did): "- Toasts closed by their timer, close button, Escape or a swipe now play their exit animation; they used to vanish at once. `dismiss()` no longer waits on a 200ms timer."
  - [ ] 5. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "setTimeout" src/components/Toast/Toast.tsx` → no matches.
    - Storybook, the step 1 harness and the same three paths: all three log `state-at-removal=closed`. Add a fourth path: on Overlays/Toast › Standard, focus the toast (Tab to it) and press Escape → `closed`.
    - Reduced motion: with the pane's DevTools rendering emulation set to `prefers-reduced-motion: reduce`, repeat path (a) → the toast still leaves the DOM, and `document.querySelectorAll(".ds-toast-viewport li").length` → `0` afterwards.
    - Retuned exit: in a local, uncommitted edit change `data-[state=closed]:duration-150` at Toast.tsx:63 to `duration-[600ms]`, repeat path (b) → the log line appears about 600ms after the click and still reads `closed` (the old 200ms timer would have cut it off). Revert the edit.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "setTimeout" src/components/Toast/Toast.tsx` → no matches; the step 1 harness logs `state-at-removal=closed` for the close button, the timer, Escape and `dismiss()`.
- log:
  - 2026-10-01 — created by audit

### WI-C6-05: Give the chat's re-based shimmer labels a static tone colour under reduced motion
- status: todo
- addresses: [F-073]
- depends_on: []
- phase: P3
- risk: low — the new rules apply only under `prefers-reduced-motion: reduce` and only to elements carrying both `ds-shimmer-text` and a chat re-base class. With motion allowed, nothing changes. ShimmerText's own `color: inherit` fallback stays for every other use. A consumer who styled the reduced-motion label through its container colour will now see the chat tone instead, which is the documented tone (tokens.css:175-177).
- semver: patch
- files:
  - modify: `src/styles/dooph-component-tokens.css:396-410 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```css
  /* dooph-component-tokens.css:396-410 */
    /*
     * AI chat parts.
     *
     * ShimmerText re-bases. ShimmerText reads --ui-shimmer-base/-highlight; these
     * point them at the chat's own pair instead of editing ShimmerText, so the
     * working-row sheen is retunable per role without a second shimmer.
     */
    .ds-chat-tool-shimmer {
      --ui-shimmer-base: var(--ui-chat-tool-shimmer-base);
      --ui-shimmer-highlight: var(--ui-chat-tool-shimmer-highlight);
    }
    .ds-chat-thinking-shimmer {
      --ui-shimmer-base: var(--ui-chat-thinking-shimmer-base);
      --ui-shimmer-highlight: var(--ui-chat-thinking-shimmer-highlight);
    }
  /* index.css:382-388 (context only, not edited) */
    @media (prefers-reduced-motion: reduce) {
      .ds-shimmer-text {
        animation: none;
        background: none;
        color: inherit;
      }
    }
  ```
- why: Under reduced motion ShimmerText drops the gradient and falls back to `color: inherit`, and neither chat part's root sets a colour (AIToolPart.tsx:57, AIThinkingPart.tsx:103). The live tool and thinking labels then take the consumer container's colour, usually `--ui-color-text`, which is brighter than the settled ghost rows and inverts the tool/thinking weight hierarchy. The re-base classes only redirect the gradient variables, which the reduced-motion rule throws away (F-073). The users hit are exactly the ones who opted out of motion.
- steps:
  - [ ] 1. Reproduce (fails before the fix). Run Storybook with the Browser pane visible and open AI Chat/Parts › Tool Part, then › Thinking Part, each in isolation (`iframe.html?id=ai-chat-parts--tool-part`, `…--thinking-part`). Emulate `prefers-reduced-motion: reduce` (Chrome DevTools › Rendering › "Emulate CSS media feature prefers-reduced-motion", or Playwright `page.emulateMedia({ reducedMotion: "reduce" })`). In the console:
    ```js
    document.querySelector("#storybook-root").style.color = "rgb(255, 0, 0)"; // a consumer container colour
    const probe = (v) => {
      const s = document.createElement("span");
      s.style.color = `var(${v})`;
      document.body.append(s);
      const c = getComputedStyle(s).color;
      s.remove();
      return c;
    };
    const el = document.querySelector(".ds-chat-tool-shimmer, .ds-chat-thinking-shimmer");
    const want = el.classList.contains("ds-chat-tool-shimmer")
      ? probe("--ui-color-ghost-foreground-active")
      : probe("--ui-color-ghost-foreground");
    console.log(getComputedStyle(el).color, want, getComputedStyle(el).color === want);
    ```
    Today both stories log `rgb(255, 0, 0) … false`: the label follows the container. Without the red override, Thinking Part still logs `false`, because `--ui-color-text` (#161616) is not `--ui-color-ghost-foreground` (#4a4a4a). Tool Part logs `true` only by coincidence, because light `--ui-color-ghost-foreground-active` and `--ui-color-text` are both #161616.
  - [ ] 2. dooph-component-tokens.css → insert directly after :410 (the closing `}` of `.ds-chat-thinking-shimmer`), inside the same `@layer utilities`:
    ```css
      /*
       * Reduced motion: ShimmerText drops its gradient and falls back to
       * `color: inherit` (index.css), which would discard the re-based tone. Paint
       * each live chat label in its own base colour instead. Two classes are
       * required: this file is imported (index.css:5) ahead of index.css's own
       * `.ds-shimmer-text` rules in the same layer, so a one-class selector would
       * lose to `color: inherit` on source order.
       */
      @media (prefers-reduced-motion: reduce) {
        .ds-shimmer-text.ds-chat-tool-shimmer {
          color: var(--ui-chat-tool-shimmer-base);
        }
        .ds-shimmer-text.ds-chat-thinking-shimmer {
          color: var(--ui-chat-thinking-shimmer-base);
        }
      }
    ```
    Leave index.css:382-388 and ShimmerText untouched. The AIToolPart and AIThinkingPart headers ("re-based onto the tool pair by `ds-chat-tool-shimmer`", "re-based by `ds-chat-thinking-shimmer`") stay true, so neither header changes.
  - [ ] 3. CHANGELOG.md `[Unreleased]` → `### Fixed` (create it after `### Changed` if no earlier item did): "- Under `prefers-reduced-motion: reduce`, a live `AIToolPart` / `AIThinkingPart` label keeps its chat tone instead of inheriting the container's text colour."
  - [ ] 4. Verify:
    - `npm run lint` → exit 0.
    - Scratch worktree build: `rg -c "ds-shimmer-text\.ds-chat-(tool|thinking)-shimmer" dist/styles.css` → `2` or more. Then `git status --porcelain` in the worktree → empty apart from `dist/` (no generated drift).
    - Storybook, step 1's script with reduced motion emulated: Tool Part and Thinking Part both log `… true`, with and without the red container override. Repeat with the toolbar Theme set to Dark (`.storybook/preview.ts:6-23` toggles `.dark` on `<html>`) → still `true` (the probe resolves the dark values).
    - With reduced motion off, both stories still shimmer, and `getComputedStyle(el).color` → `rgba(0, 0, 0, 0)` (the gradient path's `color: transparent`).
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "ds-shimmer-text\.ds-chat-tool-shimmer" src/styles/dooph-component-tokens.css` → one match inside a `prefers-reduced-motion: reduce` block; under reduced motion both labels' computed colour equals their `--ui-chat-*-shimmer-base` token whatever the container colour is.
- log:
  - 2026-10-01 — created by audit

### WI-C6-06: Move Modal's and Sheet's shared Overlay, Title, Description and Content shell into one internal `dialogShell.tsx`
- status: todo
- addresses: [F-083]
- depends_on: [WI-C6-03]
- phase: P2
- risk: low — every exported name, prop type and `displayName` stays; each public part becomes a thin `forwardRef` wrapper over a shared internal part. What could regress is the merged class list. The Content surface classes now come first, so the order of tokens inside the `class` attribute changes for `ModalContent` and `SheetContent`. Token order inside one attribute has no effect on the cascade, and tailwind-merge still sees the consumer `className` last, so a consumer override wins exactly as before. Step 1's snapshot compares sorted class sets per element to prove the set is unchanged. Motion classes stay in Modal.tsx and Sheet.tsx, so WI-C4-03 applies the same before or after this item.
- semver: none
- files:
  - create: `src/components/Modal/dialogShell.tsx`
  - modify: `src/components/Modal/Modal.tsx:1-123 @ b436647` (as left by WI-C6-03)
  - modify: `src/components/Sheet/Sheet.tsx:22-45 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:60-61 @ b436647` (JSDoc sentence)
  - modify: `src/components/Sheet/Sheet.tsx:67-76 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:120-176 @ b436647` (as left by WI-C6-03)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:234 @ b436647` (add one row after it)
- anchor:
  ```tsx
  // Modal.tsx:20-37
  const ModalOverlay = forwardRef<
    ComponentRef<typeof DialogPrimitive.Overlay>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50',
        'bg-modal-backdrop',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150',
        'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
        className
      )}
      {...props}
    />
  ));
  ModalOverlay.displayName = 'ModalOverlay';
  // Modal.tsx:90-112
  const ModalTitle = forwardRef<
    ComponentRef<typeof DialogPrimitive.Title>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-style-heading text-text', className)}
      {...props}
    />
  ));
  ModalTitle.displayName = 'ModalTitle';

  const ModalDescription = forwardRef<
    ComponentRef<typeof DialogPrimitive.Description>,
    ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-style-body text-text-secondary', className)}
      {...props}
    />
  ));
  ModalDescription.displayName = 'ModalDescription';
  // Sheet.tsx:22-27
  /**
   * Shares the backdrop token + fade behavior with `ModalOverlay`
   * (bg-modal-backdrop, fade-in on open, fade-out on close) so sheets and
   * modals feel like one family. Durations match the panel slide so the
   * backdrop and panel arrive together.
   */
  // Sheet.tsx:60-61
   * Uses the same surface/border/shadow tokens as `ModalContent`; the border
   * sits only on the panel's inner edge.
  // Sheet.tsx:67-76
  const sheetVariants = cva(
    cn(
      "fixed z-50",
      "bg-modal-surface border-solid border-border-popovers",
      "shadow-menu overflow-hidden",
      "focus-visible:outline-none",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:[animation-timing-function:cubic-bezier(0.4,0,1,1)]",
      "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
    ),
  // Sheet.tsx:154-176 — SheetTitle / SheetDescription, token-identical to Modal.tsx:90-112 apart from quote style
  ```
  Sheet.tsx:28-45 (`SheetOverlay`) is Modal.tsx:20-37 with `duration-300`/`duration-200` in place of `duration-200`/`duration-150`. The Content shells at Modal.tsx:57-86 and Sheet.tsx:120-150 are the ones WI-C6-03 rewrites; this item starts from that rewrite.
- why: About 70 lines covering four parts exist twice, and the "one family" promise (Sheet.tsx:23-26, :60-61) is held only by comments. Any change to the dialog surface, the title/description styling, the backdrop, or the portal escape hatch has to be remembered in two files (F-083).
- steps:
  - [ ] 1. Baseline. After WI-C6-03 has landed (and before this item), build a scratch worktree and run `node <main>/docs/audit/_work/scratch/W6b/wi-c6-06-snapshot.cjs <worktree> > <scratch>/c6-06-before.txt`. The script server-renders every Modal and Sheet part inside an open root (Content with `portal={false}`, each Sheet side, with and without the overlay, with and without a consumer `className`) and prints one line per case with Radix ids stripped and class tokens sorted. Check that all 22 lines are non-empty. On the audit build (b436647, before WI-C6-03) the 10 Content lines are empty and the 12 Overlay/Title/Description lines are filled, which is expected.
  - [ ] 2. Create `src/components/Modal/dialogShell.tsx`. Give it the same first line Modal.tsx has when this item lands: `"use client";` at b436647, or nothing if WI-C1-05 has already removed the directive from Modal.tsx and Sheet.tsx.
    ```tsx
    /*
     * Internal dialog shell shared by Modal and Sheet. Not exported from
     * Modal/index.ts or src/index.ts: the public parts in Modal.tsx and
     * Sheet.tsx wrap these and pass only what differs (overlay motion, panel
     * geometry and motion, which overlay to render).
     */
    import * as DialogPrimitive from "@radix-ui/react-dialog";
    import {
      forwardRef,
      type ComponentPropsWithoutRef,
      type ComponentRef,
      type ReactNode,
    } from "react";
    import { cn } from "../../utils/cn";

    /** Backdrop base; the caller's className carries its open/close motion. */
    export const DialogShellOverlay = forwardRef<
      ComponentRef<typeof DialogPrimitive.Overlay>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50", "bg-modal-backdrop", className)}
        {...props}
      />
    ));
    DialogShellOverlay.displayName = "DialogShellOverlay";

    export const DialogShellTitle = forwardRef<
      ComponentRef<typeof DialogPrimitive.Title>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("text-style-heading text-text", className)}
        {...props}
      />
    ));
    DialogShellTitle.displayName = "DialogShellTitle";

    export const DialogShellDescription = forwardRef<
      ComponentRef<typeof DialogPrimitive.Description>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
    >(({ className, ...props }, ref) => (
      <DialogPrimitive.Description
        ref={ref}
        className={cn("text-style-body text-text-secondary", className)}
        {...props}
      />
    ));
    DialogShellDescription.displayName = "DialogShellDescription";

    export interface DialogShellContentProps
      extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
      /** The caller's overlay element, or null for none. */
      overlay: ReactNode;
      /** Render through a portal (the default) or in place. */
      portal?: boolean;
      /** Props for the portal, e.g. `container` or `forceMount`. */
      portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
    }

    /**
     * Panel surface shared by ModalContent and SheetContent. The overlay and the
     * panel go to the portal as two children, never one Fragment: Radix
     * DialogPortal wraps each child in Presence, which clones it with a ref.
     */
    export const DialogShellContent = forwardRef<
      ComponentRef<typeof DialogPrimitive.Content>,
      DialogShellContentProps
    >(
      (
        { overlay, portal = true, portalProps, className, children, ...props },
        ref,
      ) => {
        const panel = (
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "bg-modal-surface border-solid border-border-popovers",
              "shadow-menu overflow-hidden",
              "focus-visible:outline-none",
              className,
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        );

        if (!portal) {
          return (
            <>
              {overlay}
              {panel}
            </>
          );
        }

        return (
          <DialogPrimitive.Portal {...portalProps}>
            {overlay}
            {panel}
          </DialogPrimitive.Portal>
        );
      },
    );
    DialogShellContent.displayName = "DialogShellContent";
    ```
  - [ ] 3. Modal.tsx → replace `ModalOverlay` (:20-37), `ModalContent` (WI-C6-03's version of :57-86) and `ModalTitle`/`ModalDescription` (:90-112) with wrappers. `ModalContentProps` (added by WI-C6-03) stays in Modal.tsx unchanged. Add `import { DialogShellContent, DialogShellDescription, DialogShellOverlay, DialogShellTitle } from './dialogShell';` after the `cn` import (:9). The three motion strings below are Modal.tsx:29-31 and :75-77 at b436647; if WI-C4-03 has replaced them with its `ds-modal-motion` helper, carry them as they then stand.
    ```tsx
    const ModalOverlay = forwardRef<
      ComponentRef<typeof DialogPrimitive.Overlay>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
    >(({ className, ...props }, ref) => (
      <DialogShellOverlay
        ref={ref}
        className={cn(
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150',
          'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
          className
        )}
        {...props}
      />
    ));
    ModalOverlay.displayName = 'ModalOverlay';

    const ModalContent = forwardRef<
      ComponentRef<typeof DialogPrimitive.Content>,
      ModalContentProps
    >(({ className, withOverlay = true, ...props }, ref) => (
      <DialogShellContent
        ref={ref}
        overlay={withOverlay ? <ModalOverlay /> : null}
        className={cn(
          'fixed left-1/2 top-1/2 z-50',
          '-translate-x-1/2 -translate-y-1/2',
          'border rounded-soft',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
          'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
          className
        )}
        {...props}
      />
    ));
    ModalContent.displayName = 'ModalContent';

    const ModalTitle = forwardRef<
      ComponentRef<typeof DialogPrimitive.Title>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
    >((props, ref) => <DialogShellTitle ref={ref} {...props} />);
    ModalTitle.displayName = 'ModalTitle';

    const ModalDescription = forwardRef<
      ComponentRef<typeof DialogPrimitive.Description>,
      ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
    >((props, ref) => <DialogShellDescription ref={ref} {...props} />);
    ModalDescription.displayName = 'ModalDescription';
    ```
    `children`, `portal` and `portalProps` reach the shell through `...props`, and the shell defaults `portal` to `true`. Keep the JSDoc block above `ModalContent` (:41-56), the pass-throughs at :13-16 and the export list at :114-123 as they are.
  - [ ] 4. Sheet.tsx → the same:
    - :22-45 → replace the JSDoc with `/** Backdrop: the shared dialog shell's base, plus a fade timed to the panel slide (300ms in / 200ms out) so backdrop and panel arrive together. */` and make `SheetOverlay` a wrapper over `DialogShellOverlay` whose `cn(…)` holds only Sheet.tsx:37-39 (or what WI-C4-03 left there) plus `className`, in the shape of step 3's `ModalOverlay`.
    - :67-76 → drop the three surface strings the shell now owns. The base becomes:
      ```tsx
      const sheetVariants = cva(
        cn(
          "fixed z-50",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:[animation-timing-function:cubic-bezier(0.4,0,1,1)]",
          "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
        ),
      ```
      (if WI-C4-03 has landed, keep its replacement of :73-75 and drop only `"bg-modal-surface border-solid border-border-popovers"`, `"shadow-menu overflow-hidden"` and `"focus-visible:outline-none"`).
    - :60-61 → `* Takes the shared dialog surface (\`dialogShell.tsx\`) that \`ModalContent\` also uses; the border sits only on the panel's inner edge.`
    - `SheetContent` (WI-C6-03's version of :120-150) →
      ```tsx
      const SheetContent = forwardRef<
        ComponentRef<typeof DialogPrimitive.Content>,
        SheetContentProps
      >(
        (
          { className, side = SheetSide.right, withOverlay = true, ...props },
          ref,
        ) => (
          <DialogShellContent
            ref={ref}
            overlay={withOverlay ? <SheetOverlay /> : null}
            className={cn(sheetVariants({ side }), className)}
            {...props}
          />
        ),
      );
      SheetContent.displayName = "SheetContent";
      ```
    - `SheetTitle` / `SheetDescription` (:154-176) → wrappers over `DialogShellTitle` / `DialogShellDescription` in step 3's shape, keeping their `displayName`s.
    - Add `import { DialogShellContent, DialogShellDescription, DialogShellOverlay, DialogShellTitle } from "../Modal/dialogShell";` after the `cn` import (:10).
  - [ ] 5. `.agents/skills/dooph-ds-codebase/SKILL.md`: after the `SheetTitle`, `SheetDescription` row (:234), add `` | (internal) `DialogShell*` | `Modal/dialogShell.tsx` | shared backdrop base, panel surface, portal-or-in-place shell, title/description; not exported — Modal and Sheet wrap it | `` padded to the table's columns. No CHANGELOG line: nothing consumer-visible changes.
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with the change: `node <main>/docs/audit/_work/scratch/W6b/wi-c6-06-snapshot.cjs <worktree> > <scratch>/c6-06-after.txt`, then `diff <scratch>/c6-06-before.txt <scratch>/c6-06-after.txt` → no output.
    - `rg -n "dialogShell|DialogShell" dist/index.d.ts dist/components/Modal/index.d.ts` in that worktree → no matches (the shell is not public).
    - `rg -n "bg-modal-surface|bg-modal-backdrop|text-style-heading text-text|text-style-body text-text-secondary" src/components/Modal src/components/Sheet --glob '!*.stories.tsx'` → exactly four matches, all in `dialogShell.tsx`. The stories use these classes in their own demo markup, so they are excluded.
    - Storybook: Overlays/Modal › Default and Overlays/Sheet › Right, Left, Top, Bottom open and close with the same look and motion; React DevTools (or the console warning list) shows `ModalContent` / `SheetContent` display names unchanged.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the before/after snapshots from `wi-c6-06-snapshot.cjs` are identical; outside the stories, `bg-modal-surface`, `bg-modal-backdrop`, `text-style-heading text-text` and `text-style-body text-text-secondary` each appear exactly once under `src/components/Modal` + `src/components/Sheet`, all in `dialogShell.tsx`; no `DialogShell*` name reaches `dist/index.d.ts`.
- log:
  - 2026-10-01 — created by audit

### WI-C6-07: Replace the four hand-rolled ref merges with one memoized internal `useComposedRefs`
- status: todo
- addresses: [F-085]
- depends_on: [WI-C6-02]
- phase: P3
- risk: low — every element still receives the same refs. What changes is that the merged callback keeps its identity across renders, so React stops calling a consumer callback ref with `null` and then the node on every re-render of AIPromptInputTextarea and Input. A consumer that relied on that re-fire (for example, re-measuring on each keystroke through a callback ref) loses it; that was never documented and is the defect. OutlineButton and DropdownTrigger are already memoized, so for them the change is a pure de-duplication. A consumer who passes an inline arrow as `ref` still gets a new identity per render; that is their choice, as with any element.
- semver: patch
- files:
  - create: `src/utils/composeRefs.ts`
  - modify: `src/components/AIChat/AIPromptInput.tsx:42,175-178,201-204 @ b436647`
  - modify: `src/components/Input/Input.tsx:35-43,83-88 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.tsx:4-15,91-101 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:4-14,172-187 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:29 @ b436647` (add one line after the `utils/color.ts` entry, which ends at :32)
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```tsx
  // AIPromptInput.tsx:175-178
  function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: T | null }).current = node;
  }
  // AIPromptInput.tsx:201-204
        ref={(node) => {
          textareaRef.current = node;
          assignRef(ref, node);
        }}
  // Input.tsx:83-88
      const inputEl = useRef<HTMLInputElement | null>(null);
      const setRefs = (node: HTMLInputElement | null) => {
        inputEl.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      };
  // OutlineButton.tsx:91-101
      const composedRef = useCallback(
        (node: HTMLElement | null) => {
          innerElRef.current = node;
          if (typeof ref === "function") {
            (ref as RefCallback<HTMLElement>)(node);
          } else if (ref) {
            (ref as MutableRefObject<HTMLElement | null>).current = node;
          }
        },
        [ref],
      );
  // DropdownTrigger.tsx:172-187
      const inputElRef = useRef<HTMLInputElement>(null);
      const setInputRef = useCallback(
        (node: HTMLInputElement | null) => {
          inputElRef.current = node;

          if (typeof inputRef === "function") {
            inputRef(node);
            return;
          }

          if (inputRef) {
            inputRef.current = node;
          }
        },
        [inputRef],
      );
  ```
- why: Four copies of one helper exist with inconsistent memoization. The two unmemoized ones (AIPromptInput's inline arrow, Input's `setRefs`) get a new identity on every render, and both components re-render on every keystroke. React therefore detaches and re-attaches the consumer's callback ref twice per keystroke, which unregisters and re-registers the "focus the prompt" hotkey integration AIPromptInput's header names as the reason the ref is forwarded (F-085). The next component will copy whichever version it finds first.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a local, uncommitted edit, append this story to `src/components/AIChat/AIPromptInput.stories.tsx` (add `useCallback` to its `react` import at :2):
    ```tsx
    export const RefStabilityProbe: Story = {
      render: function Render() {
        const textareaRef = useCallback((node: HTMLTextAreaElement | null) => {
          const w = window as unknown as { __refCalls?: { node: number; null: number } };
          w.__refCalls ??= { node: 0, null: 0 };
          w.__refCalls[node ? "node" : "null"] += 1;
        }, []);
        return (
          <AIPromptInput onSubmit={() => {}}>
            <AIPromptInputTextarea ref={textareaRef} placeholder="Type here" />
          </AIPromptInput>
        );
      },
    };
    ```
    and the same probe to `src/components/Input/Input.stories.tsx` as `RefStabilityProbe` rendering `<Input ref={inputRef} placeholder="Type here" />` uncontrolled (callback typed `HTMLInputElement | null`; add `useCallback` to its `react` import at :2). Both files type stories as `StoryObj<typeof meta>`; if tsc asks for `args`, copy the ones the file's neighbouring stories pass. Open each story in isolation in Storybook, then in the console run `window.__refCalls = { node: 0, null: 0 }`, click into the field, type `hello`, and read `window.__refCalls`. Today both stories show `{ node: 5, null: 5 }`: one detach and one re-attach per keystroke.
  - [ ] 2. Create `src/utils/composeRefs.ts`. No `"use client"`: it calls only `useCallback`, which works in React's server build (contribution SKILL.md:71), and every component that calls it carries its own directive.
    ```ts
    import { useCallback, type Ref, type RefCallback } from "react";

    function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }

    /**
     * Internal (not exported from src/index.ts). One callback ref that writes the
     * node into every given ref. Memoized on the refs themselves, so React does
     * not detach and re-attach a consumer's callback ref on every render, which
     * an inline merge would do.
     */
    export function useComposedRefs<T>(
      ...refs: (Ref<T> | undefined)[]
    ): RefCallback<T> {
      // Each call site passes a fixed number of refs, so `refs` is a
      // stable-length dependency list.
      return useCallback((node: T | null) => {
        for (const ref of refs) assignRef(ref, node);
      }, refs);
    }
    ```
  - [ ] 3. AIPromptInput.tsx: delete `assignRef` (:175-178) and the blank line after it. In `AIPromptInputTextarea`, after `const { textareaRef, value } = ctx;` (:185) add `const composedRef = useComposedRefs(textareaRef, ref);`, and replace :201-204 with `ref={composedRef}`. Remove `type Ref,` from the `react` import (:42; it has no other use). Add `import { useComposedRefs } from "../../utils/composeRefs";` after the `cn` import (:45). WI-C6-02 has already edited this import block (adding `type ComponentPropsWithoutRef,`); keep that.
  - [ ] 4. Input.tsx:84-88 → `const setRefs = useComposedRefs(inputEl, ref);`, keeping the name so :107 (`ref: setRefs`) is unchanged. Add `import { useComposedRefs } from "../../utils/composeRefs";` after the `cn` import (:44). The header's "every other prop, and `ref`, always land on the `<input>`" stays true.
  - [ ] 5. OutlineButton.tsx:91-101 → `const composedRef = useComposedRefs<HTMLElement>(innerElRef, ref);`. Its use at :155 (`ref={composedRef as ForwardedRef<HTMLElement>}`) stays. Remove `type MutableRefObject,` (:12) and `type RefCallback,` (:14) from the `react` import (no other uses; `noUnusedLocals` is on, tsconfig.json:14). Add the `useComposedRefs` import after the `cn` import (:16).
  - [ ] 6. DropdownTrigger.tsx:173-187 → `const setInputRef = useComposedRefs(inputElRef, inputRef);` (:252 `ref={setInputRef}` stays). Remove `useCallback,` (:6) from the `react` import; :173 is its only use. Add the `useComposedRefs` import after the `cn` import (:15).
  - [ ] 7. Docs: `.agents/skills/dooph-ds-codebase/SKILL.md`, in the Directory Structure block after the `utils/color.ts` entry (:29-32), add `  utils/composeRefs.ts        ← internal useComposedRefs: one memoized callback ref for forwarded + internal refs (not exported)`. CHANGELOG.md `[Unreleased]` → `### Fixed` (create it after `### Changed` if no earlier item did): "- `AIPromptInputTextarea` and `Input` no longer detach and re-attach a callback `ref` on every keystroke."
  - [ ] 8. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "assignRef|\.current = node" src --glob '!*.stories.tsx'` → matches only in `src/utils/composeRefs.ts` and at `src/components/Calendar/Calendar.tsx:352` (`focusedButtonRef.current = node;`, a plain assignment, not a merge).
    - Step 1's probes, same procedure → both stories show `{ node: 0, null: 0 }` after typing `hello`.
    - Refs still land: on Inputs/Input and the AIPromptInput stories, clicking the wrapper chrome or the composer's padding still focuses the field (both read the internal ref, Input.tsx:144-146 and AIPromptInput.tsx:150). On the OutlineButton default story, hovering still moves the glow (OutlineButton.tsx:106 reads `innerElRef`). On the TypeableDropdownTrigger story, clicking the chevron still focuses the input (DropdownTrigger.tsx:228).
    - Scratch worktree build: `rg -n "useComposedRefs" dist/index.d.ts` → no matches.
    - Revert the step 1 story edits.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "assignRef|\.current = node" src --glob '!*.stories.tsx'` → matches only in `src/utils/composeRefs.ts` and Calendar.tsx's plain assignment; `rg -l "useComposedRefs\(" src/components` → exactly AIPromptInput.tsx, Input.tsx, OutlineButton.tsx and DropdownTrigger.tsx; the step 1 probes record no ref calls while typing.
- log:
  - 2026-10-01 — created by audit

### WI-C6-08: Move the toast description's prominent colour into ToastDescription, keyed off a `data-variant` on ToastRoot
- status: todo
- addresses: [F-086]
- depends_on: [WI-C6-04]
- phase: P3
- risk: low — every provider-rendered toast keeps its computed colours: the prominent title already inherits `text-prominent-fg` from the root (:72), the prominent description gets it from the new group variant, and every other variant keeps `text-text` / `text-text-secondary`. `ToastRoot` gains a `data-variant` attribute on its `<li>`. A consumer selector that happened to target `[data-variant]` inside a toast would now match it; nothing in the package does. A consumer `className` that sets a text colour on `ToastDescription` still wins on non-prominent roots. On a prominent root the group variant (higher specificity) wins, which keeps the description legible on the prominent surface.
- semver: patch
- files:
  - modify: `src/components/Toast/Toast.tsx:93-99 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:132 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:283-302 @ b436647`
  - modify: `src/components/Toast/Toast.stories.tsx:4` and append one story
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```tsx
  // Toast.tsx:58
      "group pointer-events-auto relative flex w-full overflow-hidden rounded-normal shadow-menu",
  // Toast.tsx:93-99
  >(({ className, variant, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastRootVariants({ variant }), className)}
      {...props}
    />
  ));
  // Toast.tsx:132
          className={cn("text-text-secondary", className)}
  // Toast.tsx:283-302
                  <ToastTitle
                    className={cn(
                      "block wrap-break-word",
                      item.variant === ToastTypes.prominent
                        ? "text-prominent-fg"
                        : "text-text",
                    )}
                  >
                    {item.title}
                  </ToastTitle>
                )}
                {item.description && (
                  <ToastDescription
                    className={cn(
                      "block wrap-break-word",
                      item.variant === ToastTypes.prominent
                        ? "text-prominent-fg"
                        : "text-text-secondary",
                    )}
                  >
  ```
- why: `ToastRoot`, `ToastTitle` and `ToastDescription` are exported for custom composition, which is the only route to rich toast content. But the prominent variant's description colour lives only in the provider's private template. A consumer composing `<ToastRoot variant={ToastTypes.prominent}>` + `<ToastDescription>` gets #4a4a4a on #340fd9, about 1.07:1 contrast (F-086). The root's `group` class (:58) is already there and nothing reads it.
- steps:
  - [ ] 1. Reproduce (fails before the fix). Add `ToastDescription, ToastRoot, ToastTitle` to the `./Toast` import at Toast.stories.tsx:4 and append:
    ```tsx
    /** Composed from the exported parts, not via toast(): the prominent
     * description must stay legible without the provider's template. */
    export const ComposedProminent: Story = {
      render: () => (
        <ToastProvider>
          <ToastRoot variant={ToastTypes.prominent} open duration={Infinity}>
            <div className="min-w-0 flex-1">
              <ToastTitle className="block">Published</ToastTitle>
              <ToastDescription className="block" data-testid="composed-desc">
                Your page is live
              </ToastDescription>
            </div>
          </ToastRoot>
        </ToastProvider>
      ),
    };
    ```
    Open Overlays/Toast › Composed Prominent in Storybook (Browser pane visible) and run:
    ```js
    const probe = (v) => { const s = document.createElement("span"); s.style.color = `var(${v})`; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };
    const d = document.querySelector("[data-testid=composed-desc]");
    [getComputedStyle(d).color, probe("--ui-color-prominent-foreground"), getComputedStyle(d).color === probe("--ui-color-prominent-foreground")];
    ```
    Today → `["rgb(74, 74, 74)", "rgb(255, 255, 255)", false]`.
  - [ ] 2. Toast.tsx:93-99 → put the resolved variant on the `<li>` (Radix spreads root props onto it, `@radix-ui/react-toast` 1.2.23 `dist/index.mjs:394-399`):
    ```tsx
    >(({ className, variant, ...props }, ref) => (
      <ToastPrimitive.Root
        ref={ref}
        data-variant={variant ?? ToastTypes.simple}
        className={cn(toastRootVariants({ variant }), className)}
        {...props}
      />
    ));
    ```
    `ToastTypes.simple` matches the cva `defaultVariants` (:79-81).
  - [ ] 3. Toast.tsx:132 → `className={cn("text-text-secondary group-data-[variant=prominent]:text-prominent-fg", className)}`. This reads the root's existing `group` class at :58.
  - [ ] 4. Toast.tsx:283-302 → delete both ternaries; the parts now carry the colour:
    ```tsx
                  <ToastTitle className="block wrap-break-word">
                    {item.title}
                  </ToastTitle>
                )}
                {item.description && (
                  <ToastDescription className="block wrap-break-word">
    ```
    Leave the complex branch (:255-264) as it is.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Fixed` (create it after `### Changed` if no earlier item did): "- `ToastDescription` inside a prominent `ToastRoot` uses the prominent foreground colour, so custom-composed prominent toasts are legible. `ToastRoot` now renders `data-variant`."
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "ToastTypes.prominent" src/components/Toast/Toast.tsx` → no matches (the template no longer branches on it).
    - Composed Prominent, step 1's snippet → `[…, …, true]`, and `document.querySelector("[data-testid=composed-desc]").closest("li").dataset.variant` → `"prominent"`.
    - Provider path unchanged: on Overlays/Toast › All Variants, show each toast, select its title and then its description in the Elements panel, and read `getComputedStyle($0).color`, comparing against step 1's `probe`: prominent title and description → `--ui-color-prominent-foreground`; simple title → `--ui-color-text`, simple description → `--ui-color-text-secondary`; danger title → `--ui-color-text`. Repeat with the toolbar Theme set to Dark.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the Composed Prominent story's description computes to `--ui-color-prominent-foreground`; `rg -n "ToastTypes.prominent" src/components/Toast/Toast.tsx` → no matches; the All Variants toasts render the same colours as at b436647.
- log:
  - 2026-10-01 — created by audit

### WI-C6-09: Make the hardcoded English accessible names overridable: Calendar `labels`, toast `closeLabel` (and export `ToastOptions`), Slider `aria-labelledby` on the thumb, VerificationCodeInput `digitLabel`
- status: todo
- addresses: [F-090]
- depends_on: [WI-C6-08]
- phase: P3
- risk: low — every new prop is optional and defaults to today's English string, so a consumer who passes none of them renders the same markup. One rendered change is deliberate: a Slider given `aria-labelledby` / `aria-describedby` now puts them on the `role="slider"` thumb instead of the role-less Root span, and drops the `"Value"` fallback name when `aria-labelledby` is present. Anything that queried those attributes on the Root span (nothing in the package does) would have to look at the thumb, which is where assistive technology reads them.
- semver: minor
- files:
  - modify: `src/components/Calendar/CalendarCaption.tsx:18-38,117,127 @ b436647`
  - modify: `src/components/Calendar/Calendar.tsx:30-45,124-136,332-339 @ b436647`
  - modify: `src/components/Calendar/index.ts:5-6 @ b436647`
  - modify: `src/components/DatePicker/DatePicker.tsx:5-11,15-33,53-68,132-160 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:25-36,307 @ b436647`
  - modify: `src/components/Toast/index.ts:12-17 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:137,405-406 @ b436647`
  - modify: `src/components/VerificationCode/VerificationCodeInput.tsx:29-39,47-58,154 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Added` line, one `### Fixed` line)
- anchor:
  ```tsx
  // CalendarCaption.tsx:18-28
  export type CalendarCaptionProps = {
    /** First day of the displayed month. */
    viewMonth: Date;
    /** The current selection anchor, so the year list always contains it. */
    value: Date;
    today: Date;
    yearBounds?: { from?: Date; to?: Date };
    onMonthChange: (month: Date) => void;
    locale?: string;
    className?: string;
  };
  // CalendarCaption.tsx:117
          aria-label="Previous month"
  // CalendarCaption.tsx:127
          aria-label="Next month"
  // Calendar.tsx:39
    locale?: string;
  // Calendar.tsx:332-339
          <CalendarCaption
            viewMonth={viewMonth}
            value={anchorDate}
            today={today}
            yearBounds={yearBounds}
            onMonthChange={changeMonth}
            locale={locale}
          />
  // DatePicker.tsx:22
    locale?: string;
  // Toast.tsx:25-36
  type ToastOptions = {
    title?: string;
    description?: string;
    variant?: ToastTypes;
    duration?: number;
    action?: {
      label: string;
      altText?: string;
      onClick: () => void;
    };
    dismissLabel?: string;
  };
  // Toast.tsx:307
                <ToastClose aria-label="Close" />
  // Slider.tsx:137
        'aria-label': ariaLabel,
  // Slider.tsx:405-406
          <SliderPrimitive.Thumb
            aria-label={ariaLabel ?? 'Value'}
  // VerificationCodeInput.tsx:57
        "aria-label": ariaLabel = "Verification code",
  // VerificationCodeInput.tsx:154
              aria-label={`Digit ${index + 1} of ${length}`}
  ```
- why: Each of these components localises or accepts its visible copy but fixes its screen-reader names in English. With `locale="de"` the calendar announces German months next to English "Previous month"/"Next month"; the simple/prominent/danger toast's close button is always "Close" while the complex toast's `dismissLabel` is configurable, and `ToastOptions` is not exported for consumers wrapping `toast()`; VerificationCodeInput's per-digit names are fixed. Slider is the sharpest case: `aria-labelledby` type-checks but lands on the role-less Root span, so the `role="slider"` thumb stays "Value" (F-090).
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, `node <main>/docs/audit/_work/scratch/W6b/wi-c6-09-check.cjs <worktree>` → `FAILURES: 7` (Calendar ×2, Slider ×4, VerificationCodeInput ×1). The default-name assertions pass. Run against the audit build (`C:/Users/stick/Github/dooph/dooph-ds-audit-build`), it prints the same 7 FAILs (run 2026-10-02); React also warns that `digitLabel` reached a DOM element. tsc probe in the worktree: `import type { ToastOptions } from "@dooph-software/design-system";` → TS2305; `toast({ title: "x", closeLabel: "Schließen" })` → TS2353.
  - [ ] 2. CalendarCaption.tsx:18-28 → add the labels type and prop:
    ```tsx
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
    ```
    Add `labels,` after `locale,` in the destructure (:36). :117 → `aria-label={labels?.previousMonth ?? "Previous month"}`; :127 → `aria-label={labels?.nextMonth ?? "Next month"}`.
  - [ ] 3. Calendar.tsx: import `type CalendarLabels` alongside `CalendarCaption` (:12: `import { CalendarCaption, type CalendarLabels } from "./CalendarCaption";`). In `CalendarSharedProps`, after `locale?: string;` (:39) add `/** Accessible names for the month arrows; pair with \`locale\`. */` and `labels?: CalendarLabels;`. Add `labels,` after `locale,` in the destructure (:132), and `labels={labels}` after `locale={locale}` at :338.
  - [ ] 4. Calendar/index.ts:6 → `export type { CalendarCaptionProps, CalendarLabels } from "./CalendarCaption";`.
  - [ ] 5. DatePicker.tsx: add `type CalendarLabels,` to the `../Calendar` import (:5-11). In `DatePickerSharedProps`, after `locale?: string;` (:22) add `/** Accessible names for the calendar's month arrows; pair with \`locale\`. */` and `labels?: CalendarLabels;`. Add `labels,` after `locale,` in the destructure (:60). On both `<Calendar>` renders add `labels={labels}` after `locale={locale}` (:138 and :153).
  - [ ] 6. Toast.tsx:25-36 → export the options type and add the close label:
    ```tsx
    export type ToastOptions = {
      title?: string;
      description?: string;
      variant?: ToastTypes;
      duration?: number;
      action?: {
        label: string;
        altText?: string;
        onClick: () => void;
      };
      /** Visible label of the complex toast's dismiss button. Default "Dismiss". */
      dismissLabel?: string;
      /** Accessible name of the other variants' close (X) button. Default "Close". */
      closeLabel?: string;
    };
    ```
    :307 → `<ToastClose aria-label={item.closeLabel ?? "Close"} />`. WI-C6-01, WI-C6-04 and WI-C6-08 have edited other lines of this file; :307 is the line that reads `<ToastClose aria-label="Close" />`.
  - [ ] 7. Toast/index.ts:12-17 → add `ToastOptions,` to the type re-export list (after `ToastDescriptionProps,`). `src/index.ts:32` (`export * from './components/Toast'`) then carries it to the package root.
  - [ ] 8. Slider.tsx:137 → take the two ARIA relationship props out of `...props` so they stop reaching the Root span:
    ```tsx
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy,
          'aria-describedby': ariaDescribedBy,
    ```
    Slider.tsx:405-406 → put them on the thumb, and fall back to `'Value'` only when the consumer gave no name at all:
    ```tsx
            <SliderPrimitive.Thumb
              aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Value')}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
    ```
    Keep the Thumb's `className` (:407-412) as it stands; WI-C4-07 edits it. All three public sliders (`SliderContinuous`, `SliderStepped`, `SliderLabeled`) render `SliderBase`, so this one change covers them.
  - [ ] 9. VerificationCodeInput.tsx: in the props interface (:29-39), after `"aria-label"?: string;` (:38) add:
    ```tsx
      /** Accessible name of each digit cell. Default `Digit ${index + 1} of ${length}`. */
      digitLabel?: (index: number, length: number) => string;
    ```
    After `onlyDigits` (:41) add:
    ```tsx
    const defaultDigitLabel = (index: number, length: number) =>
      `Digit ${index + 1} of ${length}`;
    ```
    Destructure the prop after `"aria-label": ariaLabel = "Verification code",` (:57) as `digitLabel = defaultDigitLabel,`, and change :154 to `aria-label={digitLabel(index, length)}`. The header's `## constraints` (no package-level verification layout) is unaffected: this adds a label prop only.
  - [ ] 10. CHANGELOG.md `[Unreleased]`: under `### Added`: "- Overridable accessible names: `labels` on `Calendar`/`DatePicker`/`CalendarCaption` (month arrows), `closeLabel` on `toast()` options, `digitLabel` on `VerificationCodeInput`; `ToastOptions` and `CalendarLabels` are exported." Under `### Fixed` (create it after `### Changed` if no earlier item did): "- Slider `aria-labelledby` / `aria-describedby` now land on the `role=\"slider\"` thumb, which no longer falls back to the name \"Value\" when labelled by reference."
  - [ ] 11. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with the change: `wi-c6-09-check.cjs <worktree>` → `ALL PASS`, with no React unknown-prop warning. Re-run step 1's tsc probe → 0 errors.
    - `rg -n '"Previous month"|"Next month"|"Close"|Digit \$\{index' src/components --glob '!*.stories.tsx'` → each match is the right-hand side of a `??` default or the `defaultDigitLabel` template.
    - Storybook, toast: in a local, uncommitted edit of `ToastDemo` (Toast.stories.tsx:28-33), add `closeLabel: "Schließen"` to the `toast({…})` call; on Overlays/Toast › Standard show the toast and run `document.querySelector(".ds-toast-viewport li button").getAttribute("aria-label")` → `"Schließen"`. Revert the edit; the same query → `"Close"`.
  - [ ] 12. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-09-check.cjs` prints `ALL PASS` on a fresh build; `ToastOptions` and `CalendarLabels` import from the package root; a toast shown with `closeLabel` names its close button with it.
- log:
  - 2026-10-01 — created by audit

### WI-C6-10: Add styled `DropdownMenuSubTrigger` and `DropdownMenuSubContent` so the exported `DropdownMenuSub` can be used
- status: todo
- addresses: [F-091]
- depends_on: []
- phase: P3
- risk: low — additive: two new exports, and `DropdownMenuContent`'s panel classes move into a module constant that it and the new sub panel share. `DropdownMenuContent` renders the same class list in the same order, so its output is unchanged. No Figma spec for a submenu exists in the repo, so the sub trigger reuses the Menu Item geometry (`itemBase`) and the sub panel reuses the root panel; a later Figma pass may restyle either without an API change.
- semver: minor
- files:
  - modify: `src/components/Menu/DropdownMenu.tsx:8-16 @ b436647` (header `## behavior`, one bullet)
  - modify: `src/components/Menu/DropdownMenu.tsx:32-35 @ b436647` (imports)
  - modify: `src/components/Menu/DropdownMenu.tsx:149-175 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.tsx:200-201 @ b436647` (insert the two parts after `itemBase`)
  - modify: `src/components/Menu/DropdownMenu.tsx:402-418 @ b436647`
  - modify: `src/components/Menu/index.ts:7 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.stories.tsx:3-16,30 @ b436647` and append one story
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:218 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:139-140 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Added` line)
- anchor:
  ```tsx
  // DropdownMenu.tsx:16
   * - Default `modal={false}`; portals on by default with an escape hatch.
  // DropdownMenu.tsx:91
  const DropdownMenuSub = DropdownMenuPrimitive.Sub;
  // DropdownMenu.tsx:160-172
          className={cn(
            "z-50 flex flex-col gap-xs overflow-hidden rounded-normal border border-solid border-border-popovers bg-modal-surface",
            "ds-py-ui-xs",
            "shadow-menu",
            "ds-radix-dropdown-content-origin",
            // Items carry the 160px floor and the panel hugs them; matching the
            // trigger only ever widens it.
            matchTriggerWidth && "ds-radix-dropdown-match-trigger-width",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-100",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1.5 data-[state=closed]:duration-150",
            "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
            className,
          )}
  // DropdownMenu.tsx:199-200
  /** Dropdown items also hold the menu's 160px floor; sections and the panel hug them. */
  const itemBase = cn(menuItemClassName, "ds-min-w-menu");
  // Menu/index.ts:7
    DropdownMenuSub,
  ```
- why: `DropdownMenuSub` has been exported since the initial commit, but no DS sub trigger or sub content exists, and the DS `DropdownMenuTrigger`/`DropdownMenuContent` bind to the root menu. To build a submenu a consumer must import `@radix-ui/react-dropdown-menu` directly, which only works while their copy dedupes with the DS's, and which bypasses the DS item styling and the portal escape hatch (F-091).
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, a scratch `probe-sub.tsx`: `import { DropdownMenuSubTrigger, DropdownMenuSubContent } from "@dooph-software/design-system"; export const a = [DropdownMenuSubTrigger, DropdownMenuSubContent];` → `npx tsc --noEmit --jsx react-jsx probe-sub.tsx` reports TS2724 ("has no exported member named 'DropdownMenuSubTrigger'") for both names, as V7 recorded against the audit build.
  - [ ] 2. Imports: add `import { ChevronRightIcon, IconSize } from "../Icons";` after the `CheckIcon` import (:35). Use the barrel, as CalendarCaption.tsx:5 does, not a default import.
  - [ ] 3. DropdownMenu.tsx:160-172 → lift the panel classes into one module constant, placed directly above `const DropdownMenuContent` (:94), so the root and sub panels cannot drift:
    ```tsx
    /** Panel chrome shared by DropdownMenuContent and DropdownMenuSubContent. */
    const menuPanelClassName = [
      "z-50 flex flex-col gap-xs overflow-hidden rounded-normal border border-solid border-border-popovers bg-modal-surface",
      "ds-py-ui-xs",
      "shadow-menu",
      "ds-radix-dropdown-content-origin",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-100",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1.5 data-[state=closed]:duration-150",
      "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
    ];
    ```
    and the Content's `className` becomes:
    ```tsx
            className={cn(
              menuPanelClassName,
              // Items carry the 160px floor and the panel hugs them; matching the
              // trigger only ever widens it.
              matchTriggerWidth && "ds-radix-dropdown-match-trigger-width",
              className,
            )}
    ```
    The merged class set is unchanged; `ds-radix-dropdown-match-trigger-width` now follows the motion strings instead of preceding them, which has no cascade effect (different properties). If WI-C4-03 has replaced :168-170 with its `ds-menu-motion` helper, move the list as it then stands.
  - [ ] 4. After `itemBase` (:200), add the two parts. `DropdownMenuPrimitive.SubContent` positions itself beside its trigger, so it takes no `sideOffset` default and no `matchTriggerWidth`:
    ```tsx
    /** Opens a DropdownMenuSub. Menu Item geometry, with the item's open fill while its submenu is open and a trailing chevron. */
    const DropdownMenuSubTrigger = forwardRef<
      ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
      ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
    >(({ className, children, ...props }, ref) => (
      <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(itemBase, "data-[state=open]:bg-ghost-active", className)}
        {...props}
      >
        <span className="flex flex-1 items-center gap-sm">{children}</span>
        <span className="flex shrink-0" aria-hidden>
          <ChevronRightIcon size={IconSize.rg} />
        </span>
      </DropdownMenuPrimitive.SubTrigger>
    ));
    DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

    /** The submenu panel. Same chrome as DropdownMenuContent; portals by default. */
    const DropdownMenuSubContent = forwardRef<
      ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
      ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & {
        portal?: boolean;
        portalProps?: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>;
      }
    >(({ className, portal = true, portalProps, ...props }, ref) => {
      const content = (
        <DropdownMenuPrimitive.SubContent
          ref={ref}
          className={cn(menuPanelClassName, className)}
          {...props}
        />
      );

      if (!portal) {
        return content;
      }

      return (
        <DropdownMenuPrimitive.Portal {...portalProps}>
          {content}
        </DropdownMenuPrimitive.Portal>
      );
    });
    DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
    ```
    The header constraint "Style open/disabled/highlighted via Radix data attributes only" holds: the open fill keys off Radix's `data-state`, and highlight/disabled come from `itemBase`.
  - [ ] 5. Exports: add `DropdownMenuSubContent,` and `DropdownMenuSubTrigger,` after `DropdownMenuSub,` (:416) in the export list, and after `DropdownMenuSub,` (:7) in `Menu/index.ts`. `src/index.ts` re-exports the Menu barrel, so both reach the package root.
  - [ ] 6. Header `## behavior` (:8-16): after the `modal={false}` bullet (:16), add:
    ```text
     * - `DropdownMenuSub` + `DropdownMenuSubTrigger` + `DropdownMenuSubContent`
     *   build a submenu: the trigger is a menu item with a trailing chevron, the
     *   sub panel shares the root panel's chrome and portals by default too.
    ```
  - [ ] 7. Story: add `DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,` to the `./DropdownMenu` import (:3-16) and append to `DropdownMenu.stories.tsx`:
    ```tsx
    export const Submenu: Story = {
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DropdownTrigger>Open menu</DropdownTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              <DropdownMenuItem>New file</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Open recent</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuSection>
                    <DropdownMenuItem>dashboard.fig</DropdownMenuItem>
                    <DropdownMenuItem>roadmap.fig</DropdownMenuItem>
                  </DropdownMenuSection>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>Save</DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    };
    ```
  - [ ] 8. Docs:
    - `.agents/skills/dooph-ds-codebase/SKILL.md:218`: remove `` `DropdownMenuSub`, `` from the pass-through row, and add a row after it: `` | `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` | same | `Sub` is a pass-through; `SubTrigger` = `itemBase` + open fill + trailing `ChevronRightIcon`; `SubContent` shares `menuPanelClassName`, `portal`/`portalProps` | `` padded to the table's columns.
    - `skills/dooph-design-system-usage/SKILL.md:139-140`: after `` `DropdownMenuSection` (`width` prop for a wide menu), `` insert `` `DropdownMenuSub` + `DropdownMenuSubTrigger` + `DropdownMenuSubContent` (a nested submenu; the sub panel takes `portal`/`portalProps`), ``. WI-C3-08 also edits this paragraph; apply this insertion to the list as it then stands.
    - CHANGELOG.md `[Unreleased]` → `### Added`: "- `DropdownMenuSubTrigger` and `DropdownMenuSubContent`, so `DropdownMenuSub` builds a styled submenu without importing Radix."
  - [ ] 9. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build: step 1's probe → 0 errors.
    - Storybook, Menus/DropdownMenu › Submenu (Browser pane visible): open the menu, arrow down to "Open recent", press ArrowRight → the sub panel opens and focus moves to "dashboard.fig"; `document.querySelectorAll('[role=menu]').length` → `2`; press Escape → only the sub panel closes and focus returns to "Open recent". Hovering "Open recent" also opens it, and the trigger shows the `ghost-active` fill while open.
    - Root panel unchanged: before the edit, on Menus/DropdownMenu › Standard with the menu open, save `[...document.querySelector('[role=menu]').classList].sort().join(" ")`; after the edit the same expression → the identical string.
  - [ ] 10. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `DropdownMenuSubTrigger` and `DropdownMenuSubContent` import from the package root and type-check; the Submenu story opens on ArrowRight and closes on Escape; `rg -c "DropdownMenuSubTrigger" .agents/skills/dooph-ds-codebase/SKILL.md skills/dooph-design-system-usage/SKILL.md` → at least 1 in each file.
- log:
  - 2026-10-01 — created by audit

### WI-C6-11: Put AIThinkingPart's phase on a stable `data-phase` root attribute and document both root attributes in the header
- status: todo
- addresses: [F-096]
- depends_on: [WI-C3-10]
- phase: P3
- risk: low — additive: one new attribute on the root `<div>` in each of the three branches. `data-state` keeps exactly its b436647 values, so the `.ds-chat-reveal-root[data-state="open"]` reveal and lift rules (dooph-component-tokens.css:424-436) and any consumer selector on `open`/`closed` or on the phase keep working. A consumer passing their own `data-phase` through `...props` still overrides it, as with `data-state` today, because the attribute is set before the spread.
- semver: minor
- files:
  - modify: `src/components/AIChat/AIThinkingPart.tsx:4-13 @ b436647` (header `## behavior`, as rewritten by WI-C3-10)
  - modify: `src/components/AIChat/AIThinkingPart.tsx:99-101 @ b436647`
  - modify: `src/components/AIChat/AIThinkingPart.tsx:139-141 @ b436647`
  - modify: `src/components/AIChat/AIThinkingPart.tsx:154-159 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Added` line)
- anchor:
  ```tsx
  // AIThinkingPart.tsx:4-13 (header ## behavior)
   * ## behavior
   * - `thinking`: the label shimmers (ShimmerText, re-based by
   *   `ds-chat-thinking-shimmer`) and a transcript, if given, streams inline and
   *   is always visible — there is nothing to toggle while it is live.
   * - `thought` with a transcript: the row becomes a disclosure. The chevron is
   *   revealed on hover and stays while open; the transcript collapses with a
   *   grid-rows transition timed by `--ui-chat-disclosure-*`.
   * - `thought` without a transcript: a plain settled row.
   * - Open state is controllable (`open` / `onOpenChange`) or uncontrolled
   *   (`defaultOpen`). It is the only state this component owns.
  // AIThinkingPart.tsx:99-101
        <div
          ref={ref}
          data-state={state}
  // AIThinkingPart.tsx:139-141
        <div
          ref={ref}
          data-state={state}
  // AIThinkingPart.tsx:154-159
      const openState = open ? "open" : "closed";

      return (
        <div
          ref={ref}
          data-state={openState}
  ```
- why: The live row and the plain settled row put the phase (`thinking` / `thought`) on the root's `data-state`, while the expandable settled row puts `open` / `closed` there. A consumer styling settled rows with `data-[state=thought]:…`, as AIToolPart's `data-state={state}` (AIToolPart.tsx:54) and the prop name suggest, silently misses every thought row with a transcript. The header documents neither vocabulary, so an agent "normalising" the attribute to the phase would break the reveal CSS (F-096). A separate attribute fixes the first problem without breaking anyone.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, `node <main>/docs/audit/_work/scratch/W6b/wi-c6-11-check.cjs <worktree>` → `FAILURES: 4`: the four root-`data-phase` assertions (thinking; thought without a transcript; thought with a transcript, closed and open) fail, and the four `data-state` assertions pass. The audit build (`C:/Users/stick/Github/dooph/dooph-ds-audit-build`) gives the same result (run 2026-10-02).
  - [ ] 2. AIThinkingPart.tsx:99-101 and :139-141 → add the phase after `data-state={state}` in both branches:
    ```tsx
          <div
            ref={ref}
            data-state={state}
            data-phase={state}
    ```
  - [ ] 3. AIThinkingPart.tsx:157-159 → add it to the disclosure root too; the `Button` (:168) and transcript (:189) keep `data-state={openState}` only:
    ```tsx
        <div
          ref={ref}
          data-state={openState}
          data-phase={state}
    ```
  - [ ] 4. Header: append to `## behavior`, after its last bullet. WI-C3-10 moves the "Transcript colour is inherited by `ds-chat-prose`" bullet there, so this goes after that one, before `## constraints`:
    ```text
     * - Root attributes: `data-phase` is always the `AIThinkingPartState`.
     *   `data-state` is the phase on the `thinking` row and on a `thought` row
     *   without a transcript, but the disclosure state (`open` / `closed`) on an
     *   expandable `thought` row, where the `[data-state="open"]` reveal and lift
     *   rules in dooph-component-tokens.css read it. Style on `data-phase` to
     *   target a phase; do not change what `data-state` holds.
    ```
    The existing "Open state is … the only state this component owns" bullet stays true: the phase is still the consumer's prop, only reflected as an attribute.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Added`: "- `AIThinkingPart` renders `data-phase` (the `state` prop) on its root in every variant; `data-state` is unchanged."
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with the change: `wi-c6-11-check.cjs <worktree>` → `ALL PASS`.
    - `rg -c "data-phase=\{state\}" src/components/AIChat/AIThinkingPart.tsx` → `3`.
    - Storybook, AI Chat/Parts › Thinking Part: hovering a settled row with a transcript still reveals its chevron and lifts its label; clicking it opens the transcript and the chevron stays visible (the `[data-state="open"]` rules still match).
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-11-check.cjs` prints `ALL PASS`; AIThinkingPart.tsx's `## behavior` contains "`data-phase` is always the `AIThinkingPartState`".
- log:
  - 2026-10-01 — created by audit

### WI-C6-12: Stop the chat parts restating sibling internals: drop ChatDivider's `h-3`, and AIThinkingPart's `h-auto!` once `cn` knows `h-button`
- status: todo
- addresses: [F-114]
- depends_on: [WI-C1-03, WI-C6-11]
- phase: P3
- risk: low — at a 16px root font size nothing moves: the divider svg is 12px from its own `height` attribute instead of `h-3` (0.75rem = 12px), and the disclosure button hugs its text through `h-auto`, which WI-C1-03's `cn` now lets replace Button's `h-button`. At any other root font size the divider stops scaling with rem and stays at WavyDivider's 12px band, which is the intended geometry. The only regression path is landing step 3 before WI-C1-03: then `h-button` and `h-auto` both survive and the row grows to the button height, so the dependency is hard.
- semver: patch
- files:
  - modify: `src/components/AIChat/ChatDivider.tsx:28 @ b436647`
  - modify: `src/components/AIChat/AIThinkingPart.tsx:172-175 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]` (one `### Fixed` line)
- anchor:
  ```tsx
  // ChatDivider.tsx:24-29
      const rule = (
        <WavyDivider
          variant={WavyDividerVariant.high}
          aria-hidden
          className="h-3 min-w-0 flex-1 text-border-primary"
        />
  // WavyDivider.tsx:15 (context, not edited)
  const HEIGHT = 12;
  // WavyDivider.tsx:69-71 (context, not edited)
          width="100%"
          height={HEIGHT}
          className={cn("block", className)}
  // AIThinkingPart.tsx:172-175
            // `h-auto!`: the row hugs its text like every other part. Button's
            // `h-button` is a package utility tailwind-merge cannot recognise as
            // a height, so a plain `h-auto` would not replace it.
            className="h-auto! w-full justify-start gap-sm border-0 px-xs py-xxs"
  ```
- why: ChatDivider's `h-3` restates WavyDivider's 12px band in rem and overrides the svg's own `height` attribute, so a band change or a non-16px root clips or stretches the wave. AIThinkingPart forces `h-auto!` because `cn` did not register `h-button` as a height; WI-C1-03 registers it, after which the `!important` and its three-line workaround comment are dead weight that teaches the wrong fix (F-114).
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, `node <main>/docs/audit/_work/scratch/W6b/wi-c6-12-check.cjs <worktree>` → `FAILURES: 4`: `cn("h-button px-3", "h-auto")` keeps both heights; the ChatDivider svg carries `h-3`; the AIThinkingPart disclosure button carries `h-auto!` and `h-button`. The audit build gives the same 4 FAILs (run 2026-10-02). After WI-C1-03 lands, the `cn` line passes and the other three still fail. Record the baseline geometry too: in Storybook (Browser pane visible), on AI Chat/Parts › Dividers run `[...document.querySelectorAll("svg[role=presentation]")].map((s) => s.getBoundingClientRect().height)`, and on › Thinking Part run `[...document.querySelectorAll("button[aria-expanded]")].map((b) => b.getBoundingClientRect().height)`. Save both arrays.
  - [ ] 2. ChatDivider.tsx:28 → `className="min-w-0 flex-1 text-border-primary"`. WavyDivider already sizes itself (`height={HEIGHT}`, WavyDivider.tsx:70). The ChatDivider header's `## constraints` ("Deciding WHEN to draw one … is the consumer's") is unaffected.
  - [ ] 3. AIThinkingPart.tsx:172-175 → delete the three comment lines and drop the important suffix:
    ```tsx
            className="h-auto w-full justify-start gap-sm border-0 px-xs py-xxs"
    ```
    No header constraint covers the button's classes.
  - [ ] 4. CHANGELOG.md `[Unreleased]` → `### Fixed` (create it after `### Changed` if no earlier item did): "- `ChatDivider`'s wavy rules keep WavyDivider's 12px band at any root font size."
  - [ ] 5. Verify:
    - `npm run lint` → exit 0.
    - Fresh scratch worktree build with WI-C1-03 and this item: `wi-c6-12-check.cjs <worktree>` → `ALL PASS`.
    - `rg -n "h-auto!|h-3" src/components/AIChat --glob '!*.stories.tsx'` → no matches.
    - Storybook, the two step-1 expressions → arrays identical to the baseline (every divider svg `12`; every disclosure button the same content height as before).
    - The `cn` call-site check F-114 asks for: `rg -n "h-button|size-button|min-h-button" src/components/AIChat --glob '!*.stories.tsx'` → only AITurnSummary.tsx:37 (`h-button-sm`), whose `cn(…, className)` now lets a consumer height class replace it, which is the intended fix. WI-C1-03's own regression scan covers every other component.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `wi-c6-12-check.cjs` prints `ALL PASS`; `rg -n "h-auto!|h-3" src/components/AIChat --glob '!*.stories.tsx'` → no matches; divider and disclosure-row heights equal the b436647 baseline.
- log:
  - 2026-10-01 — created by audit

## DONE
