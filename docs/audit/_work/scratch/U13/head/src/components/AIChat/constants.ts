// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Which kind of work an AIToolPart row reports (Figma 761:1329 `Variant`).
 *
 * simple — an ordinary tool call. Settled rows lift their label and reveal
 *          `meta` on hover.
 * skill  — a skill/instructions load. Figma draws it as a quiet, static row:
 *          no hover response and no meta.
 *
 * Usage: <AIToolPart variant={AIToolPartVariant.skill} />
 */
export const AIToolPartVariant = {
  simple: "simple",
  skill: "skill",
} as const;
export type AIToolPartVariant =
  (typeof AIToolPartVariant)[keyof typeof AIToolPartVariant];

/**
 * Lifecycle of the tool call an AIToolPart row reports. Deliberately NOT the AI
 * SDK's part states — the consumer maps its own states onto these three
 * (e.g. `input-streaming`/`input-available` → active, `output-error` → error).
 *
 * Usage: <AIToolPart state={AIToolPartState.active} />
 */
export const AIToolPartState = {
  active: "active",
  complete: "complete",
  error: "error",
} as const;
export type AIToolPartState =
  (typeof AIToolPartState)[keyof typeof AIToolPartState];

/**
 * AIThinkingPart phase (Figma 761:1345 `Variant`). `thinking` is live — the
 * label shimmers and any transcript streams inline, always visible. `thought`
 * is settled — a transcript collapses behind a disclosure.
 *
 * Usage: <AIThinkingPart state={AIThinkingPartState.thinking} />
 */
export const AIThinkingPartState = {
  thinking: "thinking",
  thought: "thought",
} as const;
export type AIThinkingPartState =
  (typeof AIThinkingPartState)[keyof typeof AIThinkingPartState];
