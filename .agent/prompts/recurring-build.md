# prompt: recurring-build

You are running the AEGIS build loop. Read `../AGENT.md` first (only that).

Loop:
1. Enter **CREATE** mode (`component-create.md`) for the next unchecked component in
   `../checklists/COMPONENTS_STATUS.md`, honoring priority and dependencies.
2. Finish it fully (completion definition in `../checklists/REVIEW_CHECKLIST.md`).
3. Commit + push per `../guides/BUILD_GUIDE.md`.
4. Honor the checkpoint gates in `COMPONENTS_STATUS.md`: at every 10th component, on a category
   boundary, or on 3 repeated same-fixes — **STOP and request human review** before continuing.
5. Never enter REFACTOR/UPGRADE implicitly. Record upgrade needs as REVIEW findings and keep going.

End with the standard run report (`../AGENT.md` §6).
