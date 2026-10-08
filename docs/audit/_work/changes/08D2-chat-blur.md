### Chat parts secondary text + blur-roll soft clip (next-plan: chat parts item 9, blur roll review #1)

- **files:** src/components/AIChat/{AIToolPart,AIThinkingPart,AITurnSummary,ChatDivider}.tsx; src/styles/tokens.css; src/styles/dooph-component-tokens.css; src/styles/index.css; src/components/AnimatedText/{ChangeSwapShell,RollChangeText}.tsx; scripts/sync-theme.mjs (EXCLUDED +1); generated theme files re-synced (no diff for the new token).
- **what changed:**
  - Chat: settled tool label/meta, thinking label/meta, turn-summary label/meta and ChatDivider text now use text-secondary (were ghost foreground / text-tertiary). The settled tool label, thinking label and turn-summary label lift to text-primary (`--ui-color-text`) on row hover/focus/open through the existing `ds-chat-lift` motion-scale transition (it used to lift to ghost-active; turn-summary label now uses it too). Streamed answer prose, the live thinking transcript (tertiary), the error label, the chevron and the model picker are unchanged.
  - `--ui-chat-thinking-shimmer-base` (and its highlight) now text-secondary instead of ghost foreground. Tool shimmer unchanged.
  - Blur roll: `--ui-roll-change-depth` 0.9em -> 0.55em, `--ui-roll-change-blur` 4px -> 0.1em, new `--ui-roll-change-breathe` 0.15em. ChangeSwapShell's hard `overflow-hidden` is replaced by `.ds-change-swap` (index.css): padding-block breathe, equal negative margin-block, vertical mask-image gradient. Fade roll shares the shell and depth so it gets the same soft clip and shorter travel.
  - Deviation from plan: mask fade zones are exactly the breathing room (em stops) rather than 18%/82%, so the resting line is always fully opaque even at line-height 1; a percentage would dim ascenders at tight leading.
- **layout proof:** the root is an inline-grid; padding-block adds 2*0.15em to its box and margin-block subtracts 2*0.15em from its margin box, so margin-box height (what the line box uses) is unchanged; the first-row baseline moves down 0.15em inside the box by the padding and the box moves up 0.15em by the negative margin, so the baseline lands where it did. Width unaffected (no horizontal padding). mask-image does not affect layout. Not browser-measured.
- **consumer impact:** chat label colours shift to text-secondary and lighten to text-primary on hover; blur/fade roll travel is shorter, blur scales with font size, the roll edge fades instead of cutting. Consumers overriding `--ui-roll-change-blur` in px still work. A consumer-set `overflow` on the roll wrapper is no longer needed.
- **breaking:** no
- **verified:** `npm run lint` (tsc) exit 0; `npm run sync-tokens` ok; scoreboard identical before and after.
- **docs owed:** token-contract.md (new `--ui-roll-change-breathe`; roll depth/blur new defaults and em blur; thinking shimmer base now text-secondary); CHANGELOG (chat text colours, soft-clip roll).

## DONE
