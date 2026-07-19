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
4. Run the machine gates (below). Fix failures; never commit a known failure.
5. Update `../checklists/COMPONENTS_STATUS.md` (mark done, bump `Progress`).
6. Commit and push.

Finish one component fully before starting the next.

## Machine gates (must run and pass before commit)
```bash
npx tsc --noEmit      # type safety
npm run build         # build
npm run lint          # lint
```
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
