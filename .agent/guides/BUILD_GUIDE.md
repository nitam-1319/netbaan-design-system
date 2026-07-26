# BUILD_GUIDE.md — Workflow

Contains only *process*: branches, install, dev loop, commits, push, gates.
Visual/design rules live in `../rules/DESIGN_RULES.md`. Do not duplicate them here.

## Branch strategy
- All work happens on `aegis/build`.
- **Never push to `main`.**

### Initialize
```bash
git fetch origin aegis/build aegis/foundation-tooltip 2>/dev/null || true
```
- If `origin/aegis/build` exists → continue it:
  ```bash
  git switch -c aegis/build origin/aegis/build
  ```
- Else create from foundation:
  ```bash
  git switch -c aegis/build origin/aegis/foundation-tooltip
  ```
- Fallback (only if neither exists **and** `.agent/` is present on main):
  ```bash
  git switch -c aegis/build origin/main
  ```

## Install
```bash
npm ci
```
`npm ci` (not `npm install`) — it respects `package-lock.json` exactly and fails on drift.
Do not continue if install fails; report the error.

## Development loop (CREATE mode)
1. Pick the next unchecked component from `../checklists/COMPONENTS_STATUS.md`, honoring
   priority (Essential → Recommended → Advanced) and dependencies (a primitive ships before
   anything that depends on it).
2. Confirm the Base UI primitive path per `../guides/COMPONENT_ARCHITECTURE.md` before writing code.
3. Build the component and all required files (see `../checklists/REVIEW_CHECKLIST.md` for the
   full "done" definition).
4. Run the **per-component** machine gates (below). Fix failures; never commit a known failure.
5. Update `../checklists/COMPONENTS_STATUS.md` (mark done, bump `Progress`).
6. Commit and push (per component, so a crash keeps finished work).

Finish one component fully before starting the next. In a recurring run, keep going to the next
component; run the **end-of-run** gates (below) once before the session ends.

## Machine gates — fast inner loop, full gate at end of run
Split the gates so the expensive whole-project ones run **once per run**, not once per component.
This is what lets a single session build many more components before its token budget is spent.

**Per component — the FAST correctness gates, before each commit (every commit stays safe):**
```bash
npx tsc --noEmit                                    # type safety (whole project)
node .agent/scripts/verify-conformance.mjs <name>   # reference fidelity — HARD GATE (rules/REFERENCE_FIDELITY.md)
node .agent/scripts/verify-tokens.mjs               # token integrity — no dangling var(--*)
```

**Once at the END of the run — the EXPENSIVE whole-project gates, a single time:**
```bash
npm run lint
npm run build
npm run build-storybook   # compiles ALL stories + MDX (catches MDX/story errors the app build misses)
```
If an end-of-run gate fails, fix it, re-run, and push the fix — **never end a run with a red branch.**
(`npm run verify` = tsc + lint + conformance + tokens; run `build` + `build-storybook` alongside it at
the end.) Do NOT run `npm run build` / `build-storybook` after every component — that repeated cost is
what was capping each run to a handful of components.

Storybook / play-test / a11y-runner gates: see `../rules/TESTING_RULES.md` — they are only
"passing" if you actually ran them this session. Otherwise tag `human-verify`.

## Commit rules — Conventional Commits
Good:
```
feat(button): add Button with variants, stories, and play tests
fix(dialog): resolve focus trap on Escape
docs(select): add usage and API guidelines
```
Reject vague messages: `fix`, `update`, `changes`, `wip`, `test`.

## Push rules
```bash
git push -u origin aegis/build
```
If rejected because the remote moved:
```bash
git pull --rebase origin aegis/build
```
then push again.
