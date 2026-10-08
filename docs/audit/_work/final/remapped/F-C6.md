# F-C6 — final findings (composer C6) @ b436647

### F-005: ToastProvider's `duration` prop is ignored, because every provider-rendered toast passes `item.duration ?? 4000`
- severity: S1
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U8 read Radix @radix-ui/react-toast 1.2.23 dist/index.mjs against Toast.tsx and the built Toast.d.ts (ToastProviderProps extends Radix Provider props). V2 re-traced the resolution: Provider default `duration = 5e3` (:29) → context; ToastImpl `const duration = durationProp || context.duration;` (:314); with durationProp = `item.duration ?? 4000` the `||` never reaches the provider value. Line refs confirmed."
- locations:
  - src/components/Toast/Toast.tsx:197-208
  - src/components/Toast/Toast.tsx:237
  - src/components/Toast/Toast.tsx:243
- evidence: |
    Toast.tsx:197  export interface ToastProviderProps extends ComponentPropsWithoutRef<
    Toast.tsx:198    typeof ToastPrimitive.Provider
    Toast.tsx:237      <ToastPrimitive.Provider swipeDirection="right" {...props}>
    Toast.tsx:243            duration={item.duration ?? 4000}
    react-toast dist/index.mjs:29   duration = 5e3,                      (Provider default → context)
    react-toast dist/index.mjs:314  const duration = durationProp || context.duration;
- impact: `<ToastProvider duration={8000}>` type-checks, because the prop is inherited from Radix's Provider, and it reaches Radix context. Every toast the provider renders then overrides it with its own per-toast 4000, which is always truthy. The app-wide auto-dismiss knob does nothing, and a consumer who wants a different delay has to pass `duration` on every `toast()` call. The 4000 also replaces Radix's 5000 default without being stated anywhere. One accidental exception: `toast({ duration: 0 })` gives `0 ?? 4000 = 0`, which is falsy, so Radix falls back to the provider value. That escape hatch is undocumented.
- recommendation: Put the package default on the provider: default the destructured `duration` to 4000 and pass it to `ToastPrimitive.Provider`. On each `ToastRoot`, pass only `item.duration`, which is undefined when the caller omits it. Radix then resolves per-toast, then provider, then package default in its own order. The default delay stays 4000ms. Document the prop on `ToastProviderProps`.
- breaking: none
- contract: n/a
- remediation: [WI-093]
- related: [F-035, F-086, F-105]

### F-028: AIPromptInputSubmit and AIThinkingEffortSelector drop every prop they do not name, so DS `asChild` triggers composed on them lose their handlers and `data-state`
- severity: S2
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U11 read both Props types and render bodies against the other forwardRef parts in AIChat/, all of which spread `...props`. V6 SSR'd the built dist under `<TooltipTrigger asChild>`/`<DropdownMenuTrigger asChild>`: a probe child receives `aria-describedby,data-state,onPointerMove,…,onClick`; Submit renders with no `data-state`, while the ToolbarEnd and Button controls carry `data-state=\"closed\"`. `grep -c forwardRef<` → 17 parts."
- locations:
  - src/components/AIChat/AIPromptInput.tsx:281-287
  - src/components/AIChat/AIPromptInput.tsx:298-300
  - src/components/AIChat/AIPromptInput.tsx:307-317
  - src/components/AIChat/AIModelSelect.tsx:112-125
  - src/components/AIChat/AIModelSelect.tsx:136-138
  - src/components/AIChat/AIModelSelect.tsx:147-150
- evidence: |
    AIPromptInput.tsx:281  export interface AIPromptInputSubmitProps {
    AIPromptInput.tsx:283    sendLabel?: string;
    AIPromptInput.tsx:286    className?: string;
    AIPromptInput.tsx:299      { sendLabel = "Send message", stopLabel = "Stop response", className },
    AIPromptInput.tsx:313            onClick={onStop}
    AIModelSelect.tsx:112  export interface AIThinkingEffortSelectorProps {
    AIModelSelect.tsx:137      { steps, value, onValueChange, label, labels, color, className },
    AIModelSelect.tsx:147        <div
    AIModelSelect.tsx:148          ref={ref}
- impact: Radix `Slot`, which `TooltipTrigger asChild` and `DropdownMenuTrigger asChild` use, injects `onPointerMove`, `onFocus`, `onPointerDown`, `onClick`, `data-state` and `aria-*` at runtime. Both parts discard them. A "Send (Enter)" tooltip on the submit button therefore never opens, and a menu trigger composed on either part never toggles. TypeScript cannot catch this, because Slot passes the props at runtime and not through JSX. Consumers also cannot set `id`, `data-testid`, `aria-describedby` or `title` on either part. These two are the only parts of the 17 in the AI chat family that do not spread `...props` onto their root. The ref still forwards, so Slot's composed ref reaches the button and only the handlers and attributes are lost.
- recommendation: Make `AIPromptInputSubmitProps` extend `Omit<ComponentPropsWithoutRef<typeof Button>, "children" | "type" | "variant" | "size" | "disabled" | "aria-label">` and `AIThinkingEffortSelectorProps` extend `Omit<ComponentPropsWithoutRef<"div">, "children" | "color" | "onChange" | "defaultValue">` (the part's own `color?: DsColor` replaces the HTML `color` attribute). Destructure `...props` in both and spread it onto the rendered `Button` / root `div` BEFORE the props the part owns, so `type`, `variant`, `size` (header: "Every submit state renders ButtonSize.iconSm"), `disabled` and `aria-label` cannot be overridden. In the stop branch, compose the consumer's `onClick` with `onStop`: call `props.onClick?.(event)`, then `onStop()` unless `event.defaultPrevented`. In the send branch, pass `onClick` through unchanged. Verify by SSR-rendering both parts under `<TooltipTrigger asChild>` and checking that `data-state="closed"` appears on the button and the root div.
- breaking: none
- contract: src/components/AIChat/AIPromptInput.tsx "Every submit state renders ButtonSize.iconSm. Keep them one size" → consistent (`size` is omitted from the accepted props and set after the spread); src/components/AIChat/AIModelSelect.tsx "Every label, colour and step list is data the consumer passes in." → consistent
- remediation: [WI-094]
- related: [F-097, F-085]

### F-030: ModalContent and SheetContent always portal and accept no `portal` / `portalProps` escape hatch
- severity: S2
- category: inconsistency
- rules: [R2.9]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U8 rg'd `portal|portalProps|Portal` across src/components: the pair exists on DropdownMenu, Popover and Tooltip content and is absent on Modal/Sheet. V7 tsc probe against the audit build's dist/index.d.ts: `<ModalContent portal={false}>` / `portalProps` and the same on SheetContent → TS2322 ×4; the same props on Tooltip/Popover/DropdownMenu content compile."
- locations:
  - src/components/Modal/Modal.tsx:57-85
  - src/components/Sheet/Sheet.tsx:120-149
  - src/components/Tooltip/Tooltip.tsx:36-37
  - src/components/Tooltip/Tooltip.tsx:79-86
  - .agents/skills/dooph-ds-architecture/SKILL.md:167
  - .agents/skills/dooph-ds-architecture/SKILL.md:193
- evidence: |
    Modal.tsx:59     ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    Modal.tsx:61       withOverlay?: boolean;
    Modal.tsx:64     <ModalPortal>
    Modal.tsx:65       {withOverlay && <ModalOverlay />}
    Sheet.tsx:138      <SheetPortal>
    Sheet.tsx:139        {withOverlay && <SheetOverlay />}
    Tooltip.tsx:36    portal?: boolean;
    Tooltip.tsx:37    portalProps?: ComponentPropsWithoutRef<typeof TooltipPrimitive.Portal>;
    SKILL.md:167  Overlay/floating content defaults to portalled (`portal={true}` on `DropdownMenuContent`). Always expose an escape hatch:
    SKILL.md:193  Add to `dependencies` in `package.json` (runtime dep, not devDependency). Follow the exact same forwardRef wrapper pattern as `Modal.tsx` or `DropdownMenu.tsx`.
- impact: A consumer cannot render a modal or sheet into a chosen `container` (a shadow root, an iframe, a `.light`/`.dark` themed wrapper) or pass `forceMount` to its portal. The exported `ModalPortal`/`SheetPortal` do not help: nesting `ModalContent` inside a consumer `<ModalPortal container={x}>` re-portals through the inner, container-less portal to `document.body`. The only way out is to drop to `@radix-ui/react-dialog` directly. The theming skill's advice to decorate the portal container therefore cannot be followed for Modal or Sheet. Arch:193 also tells the next agent adding a Radix wrapper to copy "the exact same … pattern as `Modal.tsx`", so the non-compliant shape spreads. Default behaviour works, so the cost falls on consumers with non-default mounting needs. The un-portalled `ToastViewport` that U8 also raised is not part of this finding: V7 found that R2.9 covers overlay `*Content`, and Radix Toast already portals each toast into the viewport.
- recommendation: Add `portal?: boolean` (default `true`) and `portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>` to `ModalContent` and `SheetContent`, in Tooltip.tsx:36-37 / :79-86's shape: build the overlay-plus-content fragment once, return it bare when `portal` is false, and otherwise wrap it in `<DialogPrimitive.Portal {...portalProps}>`. Keep `withOverlay` unchanged. Export named `ModalContentProps` / `SheetContentProps` interfaces carrying the two props, so the d.ts documents them. Add one Storybook story per component that portals into a local `container` ref. Verify with a tsc probe: `<ModalContent portal={false}>` and `<SheetContent portalProps={{ container: null }}>` must compile.
- breaking: none
- contract: n/a
- remediation: [WI-095]
- related: [F-083]

### F-035: Toasts closed by Radix unmount before their exit animation plays; only `dismiss()` animates, through a `setTimeout` that mirrors the CSS exit duration
- severity: S2
- category: wrong-layer
- rules: [R6.6, R6.7]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U8 traced @radix-ui/react-toast 1.2.23 dist/index.mjs: :243 controlled `useControllableState`, :255 `onClose: () => setOpen(false)`, :281 swipe end, :532 Close. V7 ran the built dist in a browser with a MutationObserver: the close-button and timer paths removed the `<li>` while still `data-state=open`; `dismiss(B)` reached `data-state=closed` (computed `animation-duration: 0.15s`) and was removed ~214ms after the call."
- locations:
  - src/components/Toast/Toast.tsx:62-64
  - src/components/Toast/Toast.tsx:225-232
  - src/components/Toast/Toast.tsx:245-251
  - .agents/skills/dooph-ds-architecture/SKILL.md:354-359
- evidence: |
    Toast.tsx:63   "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2 data-[state=closed]:duration-150",
    Toast.tsx:227      prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
    Toast.tsx:229    setTimeout(() => {
    Toast.tsx:230      setToasts((prev) => prev.filter((item) => item.id !== id));
    Toast.tsx:231    }, 200);
    Toast.tsx:245          onOpenChange={(open) => {
    Toast.tsx:246            if (!open) {
    Toast.tsx:247              setToasts((prev) =>
    Toast.tsx:248                prev.filter((toastItem) => toastItem.id !== item.id),
    SKILL.md:354  - Mirror a CSS duration in a JS constant in order to stage two motions against
    SKILL.md:358  - Reach for a timer, a frame callback or a `transitionend` before checking
    V7 browser log:  308ms removed li[A-closebtn] state-at-removal=open
                     823ms removed li[B-dismiss] state-at-removal=closed   (~214ms after dismiss())
                    1485ms removed li[C-timer] state-at-removal=open
- impact: The provider renders each `ToastRoot` with `open` controlled. Radix's close paths (auto-dismiss timer, close button, `ToastDismiss`, Escape, swipe end) all call `setOpen(false)`, which with a controlled `open` only invokes the DS `onOpenChange`. That handler filters the item out synchronously, so the root unmounts before Radix `Presence` ever sees `present=false`. Every user- or timer-driven close, which is the common case, makes the toast vanish with no fade or slide. Only programmatic `dismiss(id)` animates, and it does so by waiting 200ms, a JS copy of the 150ms CSS exit. Retuning the exit above 200ms, or moving it onto a motion token, silently truncates it again. The `data-[state=closed]:*` classes are dead for the provider path.
- recommendation: Use one removal path with no timer. Have `onOpenChange(false)` do exactly what `dismiss` does first, setting the item's `open` to `false`, and delete the `setTimeout` from `dismiss`. Remove the item only when its exit has finished: pass `onAnimationEnd` to each provider-rendered `ToastRoot`, and prune the item when `event.target === event.currentTarget` and `event.currentTarget.dataset.state === "closed"`. The reduced-motion `duration-0` still dispatches `animationend`. Radix `Presence` already defers the unmount until the exit animation ends, so the CSS stays the only source of the exit timing. Do not use an effect-cleanup-based prune, because StrictMode's double-invoked effects would prune live toasts in development. Verify in a Storybook story or a browser harness, with a MutationObserver logging `data-state` at `<li>` removal: the close button, the timer and `dismiss()` must each show `state-at-removal=closed`.
- breaking: none
- contract: n/a
- remediation: [WI-096]
- related: [F-005, F-086, F-090]

### F-073: Under reduced motion, live tool and thinking labels lose the chat tone, because ShimmerText's fallback is `color: inherit` and the chat re-base only redirects gradient variables
- severity: S3
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample. The facts were re-read at b436647 by U11 (ShimmerText CSS, chat re-base classes and both parts' root classes, where `.text-style-body` sets no colour) and re-checked by this composer, including the cascade order.
- verified_by: "U11 read index.css:369-388, dooph-component-tokens.css:403-410 and the root classes of AIToolPart/AIThinkingPart. The composer confirmed that both rules sit in `@layer utilities` and that index.css:5 imports dooph-component-tokens.css before its own `.ds-shimmer-text` rules, so an equal-specificity chat rule loses to `color: inherit`."
- locations:
  - src/styles/index.css:382-387
  - src/styles/dooph-component-tokens.css:403-410
  - src/styles/tokens.css:175-180
  - src/styles/tokens.css:186
  - src/components/AIChat/AIToolPart.tsx:57
  - src/components/AIChat/AIToolPart.tsx:64
  - src/components/AIChat/AIThinkingPart.tsx:103
  - src/components/AIChat/AIThinkingPart.tsx:109
- evidence: |
    index.css:382    @media (prefers-reduced-motion: reduce) {
    index.css:383      .ds-shimmer-text {
    index.css:386        color: inherit;
    dooph-component-tokens.css:404    --ui-shimmer-base: var(--ui-chat-tool-shimmer-base);
    dooph-component-tokens.css:408    --ui-shimmer-base: var(--ui-chat-thinking-shimmer-base);
    tokens.css:176   * working tool row reads at full ghost-active weight, the thinking row at the
    tokens.css:180   --ui-chat-tool-shimmer-base: var(--ui-color-ghost-foreground-active);
    tokens.css:186   --ui-chat-thinking-shimmer-base: var(--ui-color-ghost-foreground);
    AIToolPart.tsx:57  "flex w-full min-w-0 select-none items-center gap-sm px-xs py-xxs text-style-body",
    AIToolPart.tsx:64  <ShimmerText className="ds-chat-tool-shimmer shrink-0 whitespace-nowrap">
    AIThinkingPart.tsx:109  <ShimmerText className="ds-chat-thinking-shimmer shrink-0 whitespace-nowrap text-style-body">
- impact: When `prefers-reduced-motion: reduce` is set, ShimmerText drops its gradient and falls back to `color: inherit`. Neither part's root sets a text colour, so an active tool row and a live "Thinking" label take whatever colour the consumer's container has, usually `--ui-color-text`. That is brighter than the settled `text-ghost-fg` rows around them, which inverts the hierarchy tokens.css:175-177 describes (tool at ghost-active weight, thinking at the quieter ghost weight). The chat re-base classes redirect only `--ui-shimmer-base`/`-highlight`, which the reduced-motion rule discards. The users affected are the ones who opted out of motion.
- recommendation: In dooph-component-tokens.css, directly after the re-base classes at :403-410, add a reduced-motion block that gives each re-based shimmer a static colour from its own base token: `@media (prefers-reduced-motion: reduce) { .ds-shimmer-text.ds-chat-tool-shimmer { color: var(--ui-chat-tool-shimmer-base); } .ds-shimmer-text.ds-chat-thinking-shimmer { color: var(--ui-chat-thinking-shimmer-base); } }`. The two-class selector is required: dooph-component-tokens.css is imported at index.css:5, ahead of index.css's own `.ds-shimmer-text { color: inherit }` in the same `@layer utilities`, so a single-class selector would lose on source order. Leave ShimmerText's own fallback alone. Verify in the AIToolPart and AIThinkingPart Storybook stories with reduced motion emulated: `getComputedStyle(label).color` must equal the resolved `--ui-color-ghost-foreground-active` (tool) and `--ui-color-ghost-foreground` (thinking).
- breaking: none
- contract: src/components/AIChat/AIToolPart.tsx "`active` shimmers the label via ShimmerText (re-based onto the tool pair by `ds-chat-tool-shimmer`)" → consistent (the fix keeps the re-base in chat CSS); src/components/AIChat/AIThinkingPart.tsx "the label shimmers (ShimmerText, re-based by `ds-chat-thinking-shimmer`)" → consistent
- remediation: [WI-097]
- related: []

### F-083: Modal and Sheet copy-paste their Overlay, Title, Description and portal-plus-overlay Content shell, kept in sync only by comments
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the Phase-4 verification sample. U8 diffed the files side by side; this composer re-read both files at b436647 and confirmed the quoted lines.
- verified_by: "U8 side-by-side read: ModalTitle/SheetTitle and ModalDescription/SheetDescription are token-identical apart from quote style. ModalOverlay and SheetOverlay differ only in `duration-200/150` vs `duration-300/200`. Both Content shells share the portal, `withOverlay` and the `bg-modal-surface … border-border-popovers … shadow-menu overflow-hidden focus-visible:outline-none` surface."
- locations:
  - src/components/Modal/Modal.tsx:20-37
  - src/components/Modal/Modal.tsx:57-112
  - src/components/Sheet/Sheet.tsx:22-45
  - src/components/Sheet/Sheet.tsx:60-61
  - src/components/Sheet/Sheet.tsx:67-76
  - src/components/Sheet/Sheet.tsx:120-176
- evidence: |
    Modal.tsx:96   className={cn('text-style-heading text-text', className)}
    Sheet.tsx:160  className={cn("text-style-heading text-text", className)}
    Modal.tsx:108  className={cn('text-style-body text-text-secondary', className)}
    Sheet.tsx:172  className={cn("text-style-body text-text-secondary", className)}
    Sheet.tsx:23   * Shares the backdrop token + fade behavior with `ModalOverlay`
    Sheet.tsx:60   * Uses the same surface/border/shadow tokens as `ModalContent`; the border
- impact: About 70 lines covering four parts exist twice. The "one family" guarantee (Sheet.tsx:23-26, :60-61) lives in comments, so any change to the dialog surface, the title or description styling, or the backdrop has to be remembered in two files. F-030's portal escape hatch would also have to be added twice, as would any motion-token change. Consumers are not affected today; the maintenance cost is ongoing.
- recommendation: Add one internal module, `src/components/Modal/dialogShell.tsx`, that is not re-exported from `Modal/index.ts` or the package barrel. It holds the shared Title and Description implementations, an overlay that takes its open/close motion classes as a parameter, and the Content shell: portal plus `portalProps` (from F-030), `withOverlay`, and the shared surface classes. `Modal.tsx` and `Sheet.tsx` then define their public parts as thin `forwardRef` wrappers over the shell, each with its own `displayName`, passing only what differs: overlay durations, Modal's centred geometry and zoom, and Sheet's `sheetVariants` side geometry. Every exported name, prop type and rendered class string stays the same. Verify with react-dom/server: render each Modal and Sheet part before and after the change and diff the HTML, which must be identical. Update `.agents/skills/dooph-ds-codebase/SKILL.md:229-235` if the file column changes.
- breaking: none
- contract: n/a
- remediation: [WI-098]
- related: [F-030, F-016]

### F-085: Ref merging is hand-rolled four ways, and the unmemoized copies in AIPromptInputTextarea and Input re-fire a consumer callback ref on every render
- severity: S3
- category: duplication
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U11: `rg -n \"composeRefs|mergeRefs|useComposedRefs|assignRef|\.current = node\" src --glob '!*.stories.tsx'` → 4 implementations. V8 repeated the grep and read each site: 2 memoized (OutlineButton, DropdownTrigger) and 2 not (AIPromptInput's inline arrow, Input's `setRefs`). Both unmemoized components re-render per keystroke. No DOM env, so V8 argued the re-attach from React's callback-ref semantics rather than executing it. Calendar.tsx:352 is a plain assignment, not a merge."
- locations:
  - src/components/AIChat/AIPromptInput.tsx:175-178
  - src/components/AIChat/AIPromptInput.tsx:201-204
  - src/components/AIChat/AIPromptInput.tsx:125-135
  - src/components/Input/Input.tsx:83-88
  - src/components/OutlineButton/OutlineButton.tsx:91-101
  - src/components/DropdownTrigger/DropdownTrigger.tsx:172-187
- evidence: |
    AIPromptInput.tsx:175  function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
    AIPromptInput.tsx:201        ref={(node) => {
    AIPromptInput.tsx:203          assignRef(ref, node);
    AIPromptInput.tsx:126          value={{
    Input.tsx:84     const setRefs = (node: HTMLInputElement | null) => {
    OutlineButton.tsx:91     const composedRef = useCallback(
    OutlineButton.tsx:100      [ref],
    DropdownTrigger.tsx:173     const setInputRef = useCallback(
- impact: React detaches and re-attaches a ref callback whose identity changes, calling it with `null` and then the node. AIPromptInputTextarea reads `value` from a context whose value object is rebuilt on every render (:125-135), so it re-renders on every keystroke. Its inline ref arrow therefore calls a consumer's callback ref twice per keystroke, in both controlled and uncontrolled use. The component's header says the textarea forwards its ref for a "focus the prompt" hotkey. Written as a callback ref, that integration would unregister and re-register on every keypress. Input's `setRefs` does the same whenever Input re-renders, which happens on every keystroke when it is uncontrolled. Maintainers also keep four copies of one helper with inconsistent memoization, and the next component will copy whichever one it finds first.
- recommendation: Add one internal hook, `useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T>`, in `src/utils/composeRefs.ts`. It is memoized with `useCallback` over the refs, in OutlineButton.tsx:91-101's shape, and is not exported from `src/index.ts`. Replace all four merges with it: AIPromptInput.tsx:175-178 + :201-204 (`useComposedRefs(textareaRef, ref)`; delete `assignRef`), Input.tsx:83-88 (`useComposedRefs(inputEl, ref)`), OutlineButton.tsx:91-101 (`useComposedRefs(innerElRef, ref)`) and DropdownTrigger.tsx:172-187 (`useComposedRefs(inputElRef, inputRef)`). This removes three duplicates. Every element still receives the same ref. Verify with a Storybook story or browser harness that passes a counting callback ref to `AIPromptInputTextarea` and to an uncontrolled `Input`, types five characters, and asserts one call with the node and no `null` calls. Then `rg -n "assignRef|setRefs" src` → no matches.
- breaking: none
- contract: src/components/AIChat/AIPromptInput.tsx "the textarea forwards its ref for exactly that." → consistent (the ref still forwards, now with a stable identity); src/components/Input/Input.tsx "every other prop, and `ref`, always land on the `<input>`." → consistent
- remediation: [WI-099]
- related: [F-028]

### F-086: Toast's per-variant text colour is decided in ToastProvider's JSX, so a consumer composing the exported parts gets grey description text on the prominent toast
- severity: S3
- category: wrong-layer
- rules: [R3.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U8: `rg group- Toast.tsx` → no matches beyond the bare `group` at :58. V8 read Toast.tsx:50-140,200-310, confirmed that BaseText adds no colour and that ToastProvider renders `{children}` inside the Radix Provider, so composing `ToastRoot` plus parts is a live path, and computed tokens.css #340fd9 vs #4a4a4a ≈ 1.07:1 contrast. V8 corrected U8: only the description is broken, because ToastTitle has no colour and inherits the root's; R2.2 applied only by analogy and is dropped."
- locations:
  - src/components/Toast/Toast.tsx:58
  - src/components/Toast/Toast.tsx:72
  - src/components/Toast/Toast.tsx:93-99
  - src/components/Toast/Toast.tsx:126-133
  - src/components/Toast/Toast.tsx:281-305
  - src/styles/tokens.css:53
  - src/styles/tokens.css:135
- evidence: |
    Toast.tsx:58   "group pointer-events-auto relative flex w-full overflow-hidden rounded-normal shadow-menu",
    Toast.tsx:72   "ds-toast-width-simple flex-row items-center gap-xxl border border-solid border-prominent bg-prominent py-2 pl-4 pr-2 text-prominent-fg",
    Toast.tsx:132          className={cn("text-text-secondary", className)}
    Toast.tsx:298                      item.variant === ToastTypes.prominent
    Toast.tsx:299                        ? "text-prominent-fg"
    Toast.tsx:300                        : "text-text-secondary",
    tokens.css:53   --ui-color-prominent: #340fd9;
    tokens.css:135  --ui-color-text-secondary: #4a4a4a;
- impact: `ToastRoot`, `ToastTitle`, `ToastDescription` and `ToastClose` are exported for custom composition, which is the only route to rich content because `toast()` accepts only string title and description. The prominent variant's legibility fix exists only in the provider's private template. A consumer who composes `<ToastRoot variant="prominent">` with `<ToastDescription>` therefore gets `--ui-color-text-secondary` (#4a4a4a) on the #340fd9 surface, about 1.07:1 contrast, which is effectively invisible. The title happens to work, because ToastTitle sets no colour and inherits `text-prominent-fg` from the root, so the provider's title ternary at :286-288 is redundant. Variant styling is split between the root's cva and JSX ternaries in the children, and the root's `group` class is a vestigial hook that nothing reads.
- recommendation: Move the description's variant colour into the parts. Have `ToastRoot` render `data-variant={variant ?? ToastTypes.simple}`, and change ToastDescription's base class at :132 to `cn("text-text-secondary group-data-[variant=prominent]:text-prominent-fg", className)`, which puts the existing `group` class at :58 to use. Then delete both ternaries in the provider template (:284-289 and :296-301), leaving `"block wrap-break-word"` on each. Every provider-rendered toast must render the same computed colours as before. Verify in a Storybook story that composes `<ToastRoot variant={ToastTypes.prominent} open>` + `<ToastTitle>` + `<ToastDescription>` inside `ToastProvider`: `getComputedStyle(description).color` must equal the resolved `--ui-color-prominent-foreground`, and a `toast({ variant: "prominent", description })` call must still match it.
- breaking: none
- contract: n/a
- remediation: [WI-100]
- related: [F-035, F-076]

### F-090: Calendar navigation, the imperative toast's close button, Slider's thumb and VerificationCodeInput's digits hardcode English accessible names with no working override
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "V8: `grep -rn 'aria-label=\"' src/components --include=*.tsx | grep -v stories` → CalendarCaption.tsx:117,127 and Toast.tsx:307. Read the Slider and VerificationCodeInput label paths. In the audit build, dist Toast.d.ts declares `type ToastOptions` without exporting it, and @radix-ui/react-slider dist/index.mjs:496-497 puts `role: \"slider\"` and `\"aria-label\": props[\"aria-label\"] || label` on the Thumb. U8's tsc probe: TS2305, no exported member 'ToastOptions'."
- locations:
  - src/components/Calendar/CalendarCaption.tsx:18-28
  - src/components/Calendar/CalendarCaption.tsx:117
  - src/components/Calendar/CalendarCaption.tsx:127
  - src/components/Calendar/Calendar.tsx:39
  - src/components/Calendar/Calendar.tsx:332-339
  - src/components/DatePicker/DatePicker.tsx:22
  - src/components/Toast/Toast.tsx:25-36
  - src/components/Toast/Toast.tsx:267
  - src/components/Toast/Toast.tsx:307
  - src/components/Toast/index.ts:12-17
  - src/components/Slider/Slider.tsx:45
  - src/components/Slider/Slider.tsx:137
  - src/components/Slider/Slider.tsx:357
  - src/components/Slider/Slider.tsx:405-406
  - src/components/VerificationCode/VerificationCodeInput.tsx:57
  - src/components/VerificationCode/VerificationCodeInput.tsx:154
- evidence: |
    CalendarCaption.tsx:26     locale?: string;
    CalendarCaption.tsx:117    aria-label="Previous month"
    CalendarCaption.tsx:127    aria-label="Next month"
    Toast.tsx:25   type ToastOptions = {
    Toast.tsx:35     dismissLabel?: string;
    Toast.tsx:267                  {item.dismissLabel ?? "Dismiss"}
    Toast.tsx:307                <ToastClose aria-label="Close" />
    Slider.tsx:45   export type SliderProps = RootProps & SliderPaintProps;
    Slider.tsx:137      'aria-label': ariaLabel,
    Slider.tsx:357          {...props}
    Slider.tsx:406            aria-label={ariaLabel ?? 'Value'}
    VerificationCodeInput.tsx:154            aria-label={`Digit ${index + 1} of ${length}`}
- impact: Each of these components localises or accepts its visible copy but fixes its screen-reader names in English. With `locale="de"`, Calendar and DatePicker announce German day and month names (CalendarGrid.tsx:226 localises them) next to English "Previous month"/"Next month" buttons, and the only workaround is re-implementing the caption. On simple, prominent and danger toasts, `toast()` always names the close button "Close", while the complex toast's visible label is configurable through `dismissLabel`. Consumers wrapping `toast()` also have to reconstruct the unexported options type, for example via `Parameters<ReturnType<typeof useToast>["toast"]>[0]`. VerificationCodeInput's per-digit names cannot be changed, although its group label at :57 can. Slider is the sharpest case: `aria-labelledby` type-checks because `SliderProps` includes Root props, but it lands on the role-less Root span, so the `role="slider"` Thumb keeps the name "Value". `<label htmlFor>` cannot label the span at all. A consumer who labels a slider the standard way gets "Value, slider".
- recommendation: Expose every hardcoded name as an optional prop and keep today's English strings as defaults. (1) Calendar: add `labels?: { previousMonth?: string; nextMonth?: string }` to `CalendarSharedProps` and `CalendarCaptionProps`, pass it from Calendar.tsx:332-339 and from DatePicker (add the same prop to `DatePickerSharedProps` and pass it to both `<Calendar>` renders), and read it at CalendarCaption.tsx:117/:127. (2) Toast: add `closeLabel?: string` to `ToastOptions`, use `aria-label={item.closeLabel ?? "Close"}` at :307, and `export type ToastOptions`, re-exporting it from Toast/index.ts:12-17. (3) Slider: also destructure `'aria-labelledby'` and `'aria-describedby'` at :137 so they no longer reach the Root through `...props`, pass both to `SliderPrimitive.Thumb`, and apply the `'Value'` fallback only when neither `aria-label` nor `aria-labelledby` is given. (4) VerificationCodeInput: add `digitLabel?: (index: number, length: number) => string`, defaulting to the current template, and use it at :154. Verify each with react-dom/server: render with the new props, and for Slider with `aria-labelledby="vol"`, and assert the attributes on the button, close button, `role="slider"` span and digit inputs.
- breaking: none
- contract: src/components/VerificationCode/VerificationCodeInput.tsx "Do not ship a package-level “verification section” layout" → consistent (adds a label prop only)
- remediation: [WI-101]
- related: [F-089, F-005, F-035]
- note-to-orchestrator: V8 suggests the Slider `aria-labelledby` leg alone could be S2: a typed prop does nothing useful for its only purpose, and the thumb stays "Value". Severity is kept at the map's S3.

### F-091: DropdownMenuSub is exported, but no DropdownMenuSubTrigger or DropdownMenuSubContent part exists, so the public submenu root cannot be used without importing Radix directly
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HC: `rg SubTrigger|SubContent` over src and dist-index.d.ts → 0. `git log -S 'DropdownMenuSub = '` → a01e5e8 (initial commit); no commit ever added SubContent. V7 tsc probe against the audit build: importing `DropdownMenuSubTrigger`/`DropdownMenuSubContent` → TS2724 'has no exported member', while `<DropdownMenuSub>` type-checks. package.json:82 lists @radix-ui/react-dropdown-menu as a dependency, not a peer. Stories have 0 uses."
- locations:
  - src/components/Menu/DropdownMenu.tsx:91
  - src/components/Menu/DropdownMenu.tsx:149-186
  - src/components/Menu/DropdownMenu.tsx:200
  - src/components/Menu/DropdownMenu.tsx:416
  - src/components/Menu/index.ts:7
  - package.json:82
  - .agents/skills/dooph-ds-codebase/SKILL.md:218
- evidence: |
    DropdownMenu.tsx:91    const DropdownMenuSub = DropdownMenuPrimitive.Sub;
    DropdownMenu.tsx:200   const itemBase = cn(menuItemClassName, "ds-min-w-menu");
    DropdownMenu.tsx:416     DropdownMenuSub,
    index.ts:7     DropdownMenuSub,
    package.json:82    "@radix-ui/react-dropdown-menu": "^2.1.24",
    SKILL.md:218  | `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuRadioGroup`, `DropdownMenuPortal` | same | pass-throughs |
    V7 tsc:  probe-sub.ts(1,10): error TS2724: '"@dooph-software/design-system"' has no exported member named 'DropdownMenuSubTrigger'.
- impact: A consumer who finds `DropdownMenuSub` in IntelliSense gets a root that does nothing useful on its own. The DS's `DropdownMenuTrigger` and `DropdownMenuContent` wrap the root menu's `Trigger`/`Content`, so placing them inside `Sub` binds them to the root menu and no DS part can stand in. To build a submenu, the consumer has to add `@radix-ui/react-dropdown-menu` themselves and import `SubTrigger`/`SubContent` from it. That only works while their copy dedupes to the DS's, because Radix is a direct dependency here and a second copy means a second context. The result also bypasses the DS item styling and the portal escape hatch. Every other public DropdownMenu part is styled. This one has been a vestigial pass-through since the initial commit. The internal codebase skill lists it as a pass-through, and no consumer doc mentions it.
- recommendation: Complete the part family additively. (1) Add `DropdownMenuSubTrigger`, a `forwardRef` over `DropdownMenuPrimitive.SubTrigger` styled with `itemBase` plus `data-[state=open]:bg-ghost-active` and a trailing `ChevronRightIcon` after `children`. (2) Add `DropdownMenuSubContent`, a `forwardRef` over `DropdownMenuPrimitive.SubContent` with the R2.9 `portal = true` / `portalProps` pair. Move the panel class list at :160-170 into one module-level constant that both Content and SubContent use; SubContent omits the `matchTriggerWidth` class. (3) Export both from DropdownMenu.tsx:402-418 and Menu/index.ts. (4) Add a Storybook story with a nested submenu and update `.agents/skills/dooph-ds-codebase/SKILL.md:218` so that `DropdownMenuSub` is no longer described as a lone pass-through. If no Figma spec for a submenu exists, the WI should state that the trigger reuses Menu Item geometry. Verify with a tsc probe importing both names, and in the story that ArrowRight opens the submenu and Escape closes it.
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx "Default `modal={false}`; portals on by default with an escape hatch." → consistent (SubContent portals by default with `portal`/`portalProps`); "Style open/disabled/highlighted via Radix data attributes only." → consistent (the open fill uses `data-[state=open]`)
- remediation: [WI-102]
- related: [F-099, F-030]

### F-096: AIThinkingPart's root `data-state` holds the phase in two render branches and the disclosure open state in the third
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample. U11 read all three return branches and the CSS consumer, and this composer re-read them at b436647.
- verified_by: "U11 read AIThinkingPart.tsx's three return branches (:97-124 thinking, :137-152 thought without a transcript, :154-202 thought with a transcript) and the `[data-state=\"open\"]` consumers in dooph-component-tokens.css. The composer re-confirmed the line numbers and that AIToolPart's root `data-state` is always its `state` prop (AIToolPart.tsx:54)."
- locations:
  - src/components/AIChat/AIThinkingPart.tsx:4-13
  - src/components/AIChat/AIThinkingPart.tsx:101
  - src/components/AIChat/AIThinkingPart.tsx:141
  - src/components/AIChat/AIThinkingPart.tsx:154-159
  - src/components/AIChat/AIToolPart.tsx:54
  - src/styles/dooph-component-tokens.css:424-436
- evidence: |
    AIThinkingPart.tsx:101          data-state={state}
    AIThinkingPart.tsx:141          data-state={state}
    AIThinkingPart.tsx:154    const openState = open ? "open" : "closed";
    AIThinkingPart.tsx:159        data-state={openState}
    AIToolPart.tsx:54        data-state={state}
    dooph-component-tokens.css:426  .ds-chat-reveal-root[data-state="open"] .ds-chat-reveal {
- impact: The live row and the plain settled row report the phase (`thinking` / `thought`) on the root's `data-state`. The expandable settled row reports `open` / `closed` instead. A consumer who styles settled rows with `data-[state=thought]:…`, as AIToolPart's convention (`data-state={state}`) and the prop name both suggest, silently misses every thought row that has a transcript. The header documents neither vocabulary. An agent that "normalises" the attribute to the phase would break the `.ds-chat-reveal-root[data-state="open"]` reveal and lift rules at dooph-component-tokens.css:424-436.
- recommendation: Add the phase as a separate attribute without changing `data-state`, so the change is non-breaking. Render `data-phase={state}` on the root in all three branches (:99-101, :139-141, :157-159). Leave `data-state` exactly as it is, because the reveal CSS and any consumer selectors depend on it. Then extend the header's `## behavior` with one bullet: the root's `data-phase` is always the `AIThinkingPartState`, while `data-state` is the phase on the `thinking` and transcript-less `thought` rows and the disclosure state (`open`/`closed`) on an expandable `thought` row, where the `[data-state="open"]` reveal rules read it. Making `data-state` always mean the phase would break consumers who key on `open`, so it is out of scope for a non-breaking change. Verify by rendering the three branches with react-dom/server and asserting `data-phase` on each root, with `data-state` unchanged from b436647's output.
- breaking: none
- contract: src/components/AIChat/AIThinkingPart.tsx "Open state is controllable (`open` / `onOpenChange`) or uncontrolled (`defaultOpen`). It is the only state this component owns." → consistent (the phase is still the consumer's prop, only reflected as an attribute); the header's `## behavior` must gain the attribute bullet in the same change
- remediation: [WI-103]
- related: [F-114]

### F-097: AIThinkingEffortSelector silently coerces an unknown `value` to the first step, so the slider and its label disagree with the value the consumer holds
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample. U11 read AIModelSelect.tsx:140-173, and this composer re-read it at b436647 together with the AIContextGauge and ProgressIndicator guards it is compared against.
- verified_by: "U11 read AIModelSelect.tsx:140-173: `Math.max(0, steps.findIndex(...))` maps a missing value to index 0, which drives both the rolled label (`steps[index]`) and the slider (`value={[index]}`). The composer confirmed the family precedent: AIContextGauge.tsx:12-15 forwards out-of-range ratios, and ProgressIndicator.tsx:292-296 throws on them."
- locations:
  - src/components/AIChat/AIModelSelect.tsx:11-18
  - src/components/AIChat/AIModelSelect.tsx:140-144
  - src/components/AIChat/AIModelSelect.tsx:166
  - src/components/AIChat/AIContextGauge.tsx:12-15
  - src/components/ProgressIndicator/ProgressIndicator.tsx:292-296
- evidence: |
    AIModelSelect.tsx:140    const index = Math.max(
    AIModelSelect.tsx:141      0,
    AIModelSelect.tsx:142      steps.findIndex((step) => step.value === value),
    AIModelSelect.tsx:143    );
    AIModelSelect.tsx:166          value={[index]}
    AIContextGauge.tsx:12  * - Deliberately NOT clamped. A gauge that quietly pins at full would disagree
    AIContextGauge.tsx:13  *   with the numbers the consumer holds, so an out-of-range ratio reaches
    AIContextGauge.tsx:14  *   ProgressIndicator — which THROWS. Keeping the figures in range is the
- impact: Model selectors switch between models whose effort lists differ, and the story's model catalogue is shaped for exactly that. When `value` (say "medium") is missing from the new model's `steps`, the selector draws step 0 ("Low") on both the label and the slider, while the app keeps sending "medium" to its API. Nothing surfaces the mismatch until the user notices the wrong behaviour. This is the silent disagreement the family's own gauge contract rejects.
- recommendation: Follow the AI family's precedent and make a mismatch loud. Replace the `Math.max(0, …)` clamp at :140-143 with a guard: when `steps.length > 0` and `findIndex` returns -1, throw an `Error` whose message names the part, the received `value` and the list of step values (format `[AIThinkingEffortSelector] value "<value>" is not one of steps: <a>, <b>, …`), worded like ProgressIndicator.tsx:293-295. Keep an empty `steps` array rendering as it does today. Add a `## constraints` bullet to AIModelSelect.tsx's header, mirroring AIContextGauge.tsx:12-15: an unknown `value` throws, the selector never draws a step the consumer does not hold, and mapping the effort across a model switch is the consumer's job. Do this in the same WI as F-028, which rewrites the same destructure and render body. Verify with react-dom/server: rendering with `value="missing"` throws the message, and a valid value renders exactly as at b436647.
- breaking: none
- contract: src/components/AIChat/AIModelSelect.tsx "No model catalogue, provider enum or reasoning levels live here. Every label, colour and step list is data the consumer passes in." → consistent (the guard validates consumer data and adds no levels); the header gains the new constraint in the same change
- remediation: [WI-094]
- related: [F-028, F-032]
- note-to-orchestrator: D-12 (Calendar invalid value: throw vs render nothing) settles the same policy question for the DS. This finding recommends throwing to match AIContextGauge/ProgressIndicator. If D-12 settles on a dev-only `console.warn` (the Calendar.tsx:61-70 pattern), WI-094 should use that instead.

### F-114: S4 batch: chat parts restate sibling internals: ChatDivider repeats WavyDivider's 12px band as `h-3`, and AIThinkingPart forces `h-auto!` over Button because `cn` does not recognise `h-button` as a height
- severity: S4
- category: coupling
- rules: []
- scope: internal
- confidence: plausible: S4 is outside the Phase-4 verification sample. U11 executed the `cn` behaviour against the audit build, and this composer re-read every cited line at b436647.
- verified_by: "U11 ran `node -e` in dooph-ds-audit-build with dist/utils/cn.cjs: cn('h-button px-3','h-auto') → \"h-button px-3 h-auto\" (both kept); cn('border border-solid','border-0') → \"border-solid border-0\" (`border-0` already resolves). WavyDivider.tsx:15 `HEIGHT = 12` is already applied as the svg `height` attribute (:70)."
- locations:
  - src/components/AIChat/ChatDivider.tsx:28
  - src/components/WavyDivider/WavyDivider.tsx:15
  - src/components/WavyDivider/WavyDivider.tsx:70
  - src/components/AIChat/AIThinkingPart.tsx:172-175
  - src/components/Button/Button.tsx:130
  - src/utils/cn.ts:14-29
  - src/styles/index.css:324-362
- evidence: |
    ChatDivider.tsx:28        className="h-3 min-w-0 flex-1 text-border-primary"
    WavyDivider.tsx:15   const HEIGHT = 12;
    WavyDivider.tsx:70        height={HEIGHT}
    AIThinkingPart.tsx:173          // `h-button` is a package utility tailwind-merge cannot recognise as
    AIThinkingPart.tsx:175          className="h-auto! w-full justify-start gap-sm border-0 px-xs py-xxs"
    cn.ts:17      'text-style': [
    index.css:324    .h-button {
- impact: Two chat parts encode facts that belong to their siblings. ChatDivider's `h-3` (0.75rem) restates WavyDivider's 12px band in a rem unit: if the band changes, or the root font size is not 16px, the CSS height overrides the svg's own `height` attribute and clips or stretches the wave. `cn`'s tailwind-merge config registers only the `text-style-*` group. It therefore treats the package's `h-button*`/`size-button*`/`min-h-button` utilities as unknown and keeps them next to any `h-*`/`size-*` override, with the winner decided by stylesheet order. AIThinkingPart works around this locally with `!important`, and any consumer overriding a Button's height through `className` meets the same trap without a comment to warn them. The cost falls on maintainers today and on consumers who override Button sizing.
- recommendation: (1) ChatDivider.tsx:28: drop `h-3`, because WavyDivider already sizes itself. (2) cn.ts: register the package's sizing utilities in their tailwind-merge groups next to `text-style`: `h: [{ h: ['button', 'button-sm', 'tab-micro', 'slider-track'] }]`, `size: [{ size: ['button', 'button-sm', 'button-micro', 'checkbox', 'code-digit', 'tab-micro'] }]`, `'min-h': [{ 'min-h': ['button'] }]` and `'min-w': [{ 'min-w': ['button'] }]`, after re-listing the utilities defined at index.css:322-362 at implementation time. (3) AIThinkingPart.tsx:172-175: replace `h-auto!` with `h-auto` and delete the three-line workaround comment. Before landing (2), run `rg -n "h-button|size-button|min-h-button" src --glob '*.tsx'` and check each `cn()` call where a later `h-*`/`size-*` class would now replace the package utility. Verify with `node -e` against a scratch-worktree build: `cn('h-button px-3','h-auto')` → `"px-3 h-auto"`. In the AIThinkingPart and ChatDivider stories, the settled-thought row's computed height must equal its content height and the divider's svg must measure 12px, both unchanged from b436647.
- breaking: none
- contract: src/components/AIChat/ChatDivider.tsx "Deciding WHEN to draw one (a day boundary, a model change) is the consumer's" → consistent; src/components/AIChat/AIThinkingPart.tsx (no constraint covers the button classes) → consistent
- remediation: [WI-104]
- related: [F-096, F-073]

## DONE
