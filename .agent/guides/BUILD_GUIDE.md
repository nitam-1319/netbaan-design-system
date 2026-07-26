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

**Per component — the FAST correctness gates, as ONE chained command (saves tool calls):**
```bash
npx tsc --noEmit && node .agent/scripts/verify-conformance.mjs <name> && node .agent/scripts/verify-tokens.mjs
```
(type safety + reference-fidelity HARD GATE + token integrity, in a single call.) Then `git add -A &&
git commit` — one call. Do NOT run these as three separate calls; the per-session **agentic-turn
budget** is what ends a run, so every avoided tool call is another component you get to build.

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

The end-of-run gates are **compile/lint only**. In a recurring build run, do **NOT** run or green the
Storybook **interaction (play-test) suite**, and do **NOT** edit existing/neighbor components to make
that suite pass — that is a library-wide REFACTOR/REVIEW job that would consume the whole session's
context. Fix only compile failures your own new components introduced; log any pre-existing red as a
REVIEW finding.

Storybook / play-test / a11y-runner gates: see `../rules/TESTING_RULES.md` — they are only
"passing" if you actually ran them this session. Otherwise tag `human-verify`. Greening them is a
dedicated REVIEW task, never part of a build run.

## Commit rules — Conventional Commits
Good:
```
feat(button): add Button with variants, stories, and play tests
fix(dialog): resolve focus trap on Escape
docs(select): add usage and API guidelines
```
Reject vague messages: `fix`, `update`, `changes`, `wip`, `test`.

## Push rules — commit per component, PUSH IN BATCHES
Commit each component locally (`git add -A && git commit`), but do **not** push after every one — a
fetch/rebase/push cycle is ~3 tool calls and, repeated per component, is the biggest drain on the
per-session turn budget (it's a large part of why runs stopped after only a handful of components).
Push **every ~5 components and once at end of run**:
```bash
git pull --rebase origin aegis/build && git push origin aegis/build
```
(If a run dies between pushes, at most ~5 local commits are lost and the next run simply rebuilds them
from the queue — an acceptable trade for the throughput gained.)
