# DS Updates Implementation Plan

> **For agentic workers:** Execute task-by-task. Do not commit unless the user asks.

**Goal:** Ship approved 2026-08-26 design-system token, text, menu, verification, and rolling-money updates.

**Architecture:** Token-first (`tokens.css` → `sync-tokens`); components consume Tailwind/`ds-*` only; new pieces follow existing folder + constants + stories + barrel patterns.

**Tech Stack:** React 19, Radix, CVA, Tailwind v4, Storybook.

## Global Constraints
- No bare HTML text — always `BaseText` / role text.
- Dot-accessible consts in server-safe `constants.ts`.
- `"use client"` only when needed (`useState`/`useEffect`/`useRef`/timers).
- Frontmatter markdown block comments on new/touched components that deserve them.
- No commits unless requested.

---

### Task 1: Tokens + text roles + sync
- [ ] Remap primary-disabled → secondary-disabled
- [ ] Add error-primary / error-secondary; fix trigger-error-focus alias
- [ ] Update heading/title/hero sizes; add subheading token
- [ ] Add `text-style-subheading`; `TextVariant.subheading`; `SubheadingText`; FontSizes
- [ ] `npm run sync-tokens`
- [ ] Update BaseText stories for SubheadingText / size changes

### Task 2: Button danger + disabled + stories; ShapeButton pentagon; color util; Input/Toast fallout
- [ ] Danger variant classes per map; primary disabled paint tokens
- [ ] Icon stories drop brand
- [ ] ShapeButtons remove pentagon; ShapeButton types/map
- [ ] Input/Toast/color.ts → error tokens

### Task 3: Checkbox disabled-checked
- [ ] Styles + stories

### Task 4: DropdownMenuItem danger + DropdownMenuSearch
- [ ] Variant const + item styles
- [ ] Slim search component + complex stories

### Task 5: RollingMoneyText
- [ ] Component + CSS keyframes/tokens if needed + stories + export

### Task 6: Verification code family
- [ ] CodeDigitInput + VerificationCodeInput + stories (incl. prerolled section) + export
- [ ] BaseText 18/medium for digits

### Task 7: Linear progress animation
- [ ] `@property` / transition fix + story if needed

### Task 8: Verify
- [ ] `npm run lint` and `npm run build`
