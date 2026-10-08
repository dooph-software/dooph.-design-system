# Brief 04 — `"use client"`: fix the stamping script, and use the directive as rarely as possible (agent C)

Read first: `docs/audit/_work/agent-rules.md` (mandatory). Then, in `docs/audit/REMEDIATION.md`:
- the WI-033 block (stamping fix) and the WI-037 block (policy);
- decision line D-05.

Background: FINDINGS F-011 (16 of 40 client modules ship unstamped: the script reads only the first 5 lines), F-012 and F-027.

**The maintainer's principle:** the DS leaves data and control to the consuming project. A `"use client"` directive implies a component reaches into data or control, so use it ONLY when the module itself:
- calls React hooks;
- touches browser APIs;
- creates event-handler closures on host elements;
- or passes function props to a client component.

Non-RSC consumers (Vite etc.) are unaffected either way.

Change record: `docs/audit/_work/changes/04-use-client.md`.

## Your files
- `scripts/add-use-client.mjs`.
- The FIRST LINE (the directive) of any `src/**/*.ts(x)` module. You may touch nothing else in those files, except where WI-037 requires a tiny change to make a module genuinely hook-free. If that is needed, report it rather than refactoring.
- Header contracts that mention the directive.

## Do
1. **WI-033:** the stamping script reads the directive prologue properly, instead of `split('\n').slice(0, 5)`. A source module that starts with comments or a header contract and then `"use client"` must get its dist chunk stamped.
2. **WI-037 policy, applied strictly:** for every module carrying the directive, check the four triggers above. Remove the directive where none applies (e.g. thin forwardRef Radix wrappers with no hooks or closures). Add it where one applies but it's missing: AIModelSelect, per F-027.
   - Watch the consequence noted in D-05. Once stamping works, any module that keeps the directive turns its exports (e.g. `buttonVariants`, `checkboxVariants`) into client references. Button and Checkbox must therefore be hook-free and directive-free, unless they truly need it.
3. **The audit's RSC check scripts** live under `docs/audit/_work/scratch/` (look for V3 / RSC / use-client probes). Use them against a scratch-worktree build, per agent-rules §7.

## Verify
- `npm run lint` exits 0.
- In a scratch worktree with your changes, run `npm run build`. Then:
  - every dist module whose source carries the directive is stamped;
  - no dist module whose source lacks it is stamped;
  - report counts (source with directive / dist stamped).
- Scoreboard: m7 ("use client" files) should DROP from 40. Report the new number.
- Remove the worktree when done.

## Change record must include
Every file that lost or gained the directive, each with the trigger that justified it.
