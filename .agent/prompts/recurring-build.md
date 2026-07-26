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

Loop (repeat — keep building one component after another):
1. Enter **CREATE** mode (`component-create.md`) for the next unchecked component in
   `../checklists/COMPONENTS_STATUS.md`, honoring priority and dependencies.
2. Finish it fully (completion definition in `../checklists/REVIEW_CHECKLIST.md`).
3. Run the **per-component fast gates** and commit + push per `../guides/BUILD_GUIDE.md`
   (tsc + `verify-conformance <name>` + `verify-tokens`). Push per component so a crash keeps
   finished work.
4. **Do NOT stop at the "every 10th component" or "category boundary" checkpoints.** This run is
   unattended, so stopping for human review just wastes the session. At each such checkpoint, record
   a one-line "review checkpoint" note for the run report and **continue** — including across
   category boundaries.
5. Never enter REFACTOR/UPGRADE implicitly. Record upgrade needs as REVIEW findings and keep going.

Stop the loop only when one of these is true:
- **Queue empty** — no buildable component remains (all done, or all remaining are blocked by a
  missing Base UI primitive; record which).
- **Token budget** — you are approaching the session's context/token budget. Finish the component
  in progress, then go to "End of run". (Budget-aware stopping is expected and correct — it is not a
  failure; the next scheduled run continues where you left off.)
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
