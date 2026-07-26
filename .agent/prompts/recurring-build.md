# prompt: recurring-build

You are running the AEGIS build loop, **UNATTENDED**. Read `../AGENT.md` first (only that).
No human is online during this run: do **not** pause to "request review" — make reasonable
decisions and keep building. Work **CONTINUOUSLY** until the session's token/context budget is
nearly spent or the queue is empty. Never leave a component half-finished.

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
- Run the **end-of-run heavy gates ONCE**: `npm run lint && npm run build && npm run build-storybook`.
  If any fail, fix, re-run, and push — **never end a run with a red branch.**
- Emit the standard run report (`../AGENT.md` §6): components built this run, review-checkpoint
  notes, and anything left `BLOCKED`.
