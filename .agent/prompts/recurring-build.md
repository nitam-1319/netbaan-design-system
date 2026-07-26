# prompt: recurring-build

You are running the AEGIS build loop, **UNATTENDED**. Read `../AGENT.md` first (only that).
No human is online during this run: do **not** pause to "request review" — make reasonable
decisions and keep building. Work **CONTINUOUSLY** until the session's token/context budget is
nearly spent or the queue is empty. Never leave a component half-finished.

## STAY IN YOUR LANE — build new components, nothing else
This run's ONLY job is to build the next **new** components. Do not let anything else consume the
budget:
- **Do NOT green / run / set up the Storybook interaction (play-test) suite.** Those runner tests
  are `human-verify` / CI (see `../rules/TESTING_RULES.md`); running and greening the whole suite
  (editing dozens of existing stories) would eat the entire session's context. Your gates are the
  **compile** gates below — nothing more.
- **Do NOT edit or "fix up" existing/neighbor components** (their `.tsx`, `.stories.tsx`, or `.mdx`).
  That is REFACTOR/REVIEW work, forbidden in CREATE (AGENT.md rule 2). If you notice a problem in an
  existing component or the suite is red from earlier work, write **ONE line** in the run report as a
  REVIEW finding and keep building — do not fix it now.
- **Do NOT modify `package.json` / dependencies** unless a NEW component you are building genuinely
  needs a new runtime dependency.
- Every unit of budget goes to the next new component, not to maintenance.

## SPEND TURNS LIKE THEY'RE THE SCARCE RESOURCE (they are)
What ends a run first is almost always the **per-session agentic-turn budget** (number of tool calls),
not tokens — a run stops after a handful of components because each one spends ~15 tool calls, not
because context filled. So minimize tool calls per component:
- **Batch shell commands.** Run the per-component gates as ONE chained command, not three:
  `npx tsc --noEmit && node .agent/scripts/verify-conformance.mjs <name> && node .agent/scripts/verify-tokens.mjs`
- **Write each file in a single Write** (compose it fully, don't dribble edits). Don't re-open a file
  to re-read what you just wrote.
- **Do NOT push every component.** A fetch/rebase/push per component is ~3 tool calls each and is the
  single biggest turn sink. `git add -A && git commit` per component (one call, cheap, keeps
  granular history), then **push once every ~5 components and once at end of run.**
- Don't re-run a gate you already saw pass. Don't read docs you've already read this run.
Treat every avoided tool call as one more component you get to build this session.

Loop (repeat — keep building one component after another):
1. Enter **CREATE** mode (`component-create.md`) for the next unchecked component in
   `../checklists/COMPONENTS_STATUS.md`, honoring priority and dependencies.
2. Finish it fully (completion definition in `../checklists/REVIEW_CHECKLIST.md`).
3. Run the per-component gates as ONE chained command (see above) and `git commit` (per component).
   **Push in batches** — every ~5 components and at end of run — not once per component.
4. **Do NOT stop at the "every 10th component" or "category boundary" checkpoints.** This run is
   unattended, so stopping for human review just wastes the session. At each such checkpoint, record
   a one-line "review checkpoint" note for the run report and **continue** — including across
   category boundaries.
5. Never enter REFACTOR/UPGRADE implicitly. Record upgrade needs as REVIEW findings and keep going.

Stop the loop only when one of these is true:
- **Queue empty** — no buildable component remains (all done, or all remaining are blocked by a
  missing Base UI primitive; record which).
- **Session budget** — you are genuinely near the session's limit (agentic-turn budget or context).
  Do NOT stop early "to be safe" — keep building while you can still complete a full component; only
  then finish the component in progress and go to "End of run". (Budget-aware stopping is expected and
  correct — the next run continues where you left off. But stopping at a handful of components while
  budget clearly remains is the bug we are fixing: keep going.)
- **Genuine blocker** — the SAME fix recurs 3× (a systemic problem), or a hard gate cannot pass and
  cannot be fixed. Stop and report it as `BLOCKED`.

End of run (ALWAYS, before finishing):
- Run the **end-of-run COMPILE gates ONCE**: `npm run lint && npm run build && npm run build-storybook`.
  These are compile/lint checks (build-storybook COMPILES stories + MDX). Fix only failures caused by
  the components **you built this run**; if a failure is pre-existing (from an earlier run), record it
  as a REVIEW finding and leave it — do not embark on a suite-wide fix. **Do NOT** run the vitest /
  Storybook interaction (play-test) suite here — that is not a build-run gate.
- Never end a run with a branch that fails the **compile** gates for your own new components.
- Emit the standard run report (`../AGENT.md` §6): components built this run, review-checkpoint
  notes, and anything left `BLOCKED`.
