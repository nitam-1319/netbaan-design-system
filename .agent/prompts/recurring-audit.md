# prompt: recurring-audit

You are running the AEGIS **deep quality audit**, **UNATTENDED**. The build phase is
done; your job is to make the existing components production-ready — the bar is a
professional enterprise design system maintained by a senior frontend team. Read
`../AGENT.md` first, then this file. Make reasonable decisions and keep working; do
not pause to "request review."

## What ends a run (budget-bounded — NOT a fixed count)
Audit **as many components as you can fully finish** before the session's budget
(agentic turns / context) is nearly spent. Do **not** target a fixed number and do
**not** stop early "to be safe." The committed tracker carries progress across runs,
so the next run continues where you left off. Spend tool calls like the scarce
resource they are (this is what capped past runs): batch shell commands, write each
file in one Write, don't re-run a gate you already saw pass, and push in batches.

## Branch & coexistence
- NEVER push to `main` or `aegis/build` directly. The build task may still be pushing
  to `aegis/build`; keep the two separate. Mask the PAT in all output through
  `sed -E 's/github_pat_[A-Za-z0-9_]+/***TOKEN***/g'`.
- `aegis/audit` is a **short-lived integration branch = latest `aegis/build` + the
  current batch of fixes.** At the **start of each batch**, re-sync it so every PR is a
  clean, reviewable diff and you automatically pick up any new components the build task
  shipped:
  ```
  git fetch origin && git switch -C aegis/audit origin/aegis/build
  ```
  (`gh` is NOT installed — use the GitHub REST API via curl for PRs; see below.)
- `npm ci` (stop and report if it fails).

## One-time per run: build the review harness
The audit tooling needs a built Storybook (fast — ~15s). Do this **once per run**,
not per component:
```
npm run build-storybook            # -> storybook-static/ (index.json = 940+ stories)
node .agent/scripts/verify-audit.mjs --out .agent/audit/triage.json   # static triage, all components
node .agent/scripts/audit-queue.mjs                                    # (re)rank the queue, preserves prior results
```
(Chromium is pre-installed; the harness points Playwright at it. Never run
`playwright install`.)

## Pick the next components — highest risk first
Read `../checklists/AUDIT_STATUS.md` and take the next **⬜ (not-reviewed)** rows from
the **top** (already ordered by risk: reference-spec page → blast radius → triage
severity). **Do NOT re-audit a ✅ row** unless a dependency it imports changed this
cycle (when you change a shared file — `src/index.css`, `lib/utils`, or a primitive
imported by others — mark its dependents ⬜ again in the tracker with a note).

Group the run into a **reviewable batch** (a handful of related components). Audit
foundations/tokens BEFORE the components that depend on them, so a token fix doesn't
invalidate work you already signed off.

## Per component — the audit (design-system compliance is the HIGHEST priority)
For each component, in order:

1. **Understand context (read-only first).** Read `<name>.tsx`, `<name>.stories.tsx`,
   `<name>.mdx`, its reference `../references/spec/<Name>.dc.html` if one exists, and
   `../rules/REFERENCE_FIDELITY.md` + `../rules/DESIGN_RULES.md` + `../rules/TOKEN_RULES.md`.
   Compare against the closest gold-standard (`../references/`). Understand the intended
   API and usage. Never modify blindly.
2. **Design-system compliance (MAX attention).** Verify spacing, sizing, typography,
   color, shadow, radius, and **tokens** (no hardcoded values where a token exists);
   correct light/dark behavior; RTL/LTR + Persian/English; responsive behavior;
   animations/transitions defined by the reference; **no visual drift** from the spec.
   Use the static triage (`.agent/audit/triage.json`) as leads.
3. **Visual review — use the browser (real, not imagined).**
   ```
   node .agent/scripts/audit-visual.mjs --themes dark,light --locales en,fa --viewports desktop,mobile <name>
   ```
   Then **open and read the montage PNGs** in `.agent/audit/screens/<name>/` — each is
   all of the component's stories/states stitched together for one theme×locale×viewport.
   Inspect default / hover / focus / disabled / loading / error / empty / dark / RTL /
   mobile. (Hover/focus states that only exist on interaction: verify from the code +
   the story's `play`; capture a dedicated story if one is missing.) Identify visual
   inconsistencies.
4. **Code quality.** TypeScript correctness, prop typing, API consistency, no
   unnecessary props, **closed API (no `className`/`style` leak)**, composition,
   reusability, maintainability, performance, React best practices.
5. **Accessibility + tests (real browser).**
   ```
   node .agent/scripts/audit-checks.mjs <name>     # play/render errors + axe (dark & light)
   ```
   Read the output: uncaught errors / failing play functions, and axe violations
   (contrast is checked per-theme). Also verify keyboard nav, focus management, ARIA,
   and semantics from the code. Confirm every variant/state has a story; add a missing
   story or `play` test when needed.

## Find → verify → fix (split: objective auto, subjective queued)
1. **Collect findings** with a severity and a concrete citation (spec line, token rule,
   axe rule id, or screenshot).
2. **Verify each finding before acting** — confirm it's real (re-read the spec / the
   screenshot / re-run the check). Discard plausible-but-wrong findings. Contrast
   "violations" on genuinely disabled elements or decorative text are exempt — confirm
   against WCAG before fixing.
3. **Auto-fix the OBJECTIVE ones** (hardcoded value → token, className/style leak →
   closed API, missing token, missing story/`play`, a confirmed axe failure, a clear
   spec-structure mismatch). Keep changes **minimal and focused** — no unrelated
   refactors; preserve behavior unless it violates the design system.
4. **QUEUE the SUBJECTIVE ones** (a judgment call on visual weight, spacing feel,
   motion taste, or anything where the "correct" answer isn't pinned by the spec).
   Do **not** auto-apply these — record them in the PR under "Queued for confirmation"
   with the screenshot and your proposed change, and leave the component as-is for that
   point. This is how we avoid re-introducing drift under the banner of fixing it.
5. Re-run the relevant checks after each fix to prove no regression.

## Gates before committing a batch (chained — save tool calls)
Per touched component (fast): `npx tsc --noEmit && node .agent/scripts/verify-conformance.mjs <name> && node .agent/scripts/verify-tokens.mjs`
Once before the PR (whole-project): `npm run lint && npm run build && npm run build-storybook`
Never commit a red typecheck/build/lint. Re-run `audit-checks.mjs` on fixed components
to confirm the a11y/error finding is actually gone.

## Update the tracker HONESTLY
For each component set the row in `../checklists/AUDIT_STATUS.md`:
Reviewed ✅ · Issues (yes/—) · Fixed (✅ / ⏳ if subjective calls queued) · DS ✓ · Tests ✓.
A column is ✅ **only if the check actually ran and passed this session** — never mark a
gate you didn't run (AGENT.md §3; a tracker that lies is worse than none). Bump the
Progress line.

## Pull request — one per batch, MERGE ON GREEN (REST API, no gh)
Commit per component (Conventional Commits, e.g. `fix(badge): token contrast on solid tones`),
then `git push -f origin aegis/audit` (force is safe — the branch is defined as
build+batch). Open **one PR per batch** into `aegis/build` and merge it **only if you
personally ran every gate this run and saw them all green** (`gh` is absent, so you are
the green check). Use curl with the PAT in `$TOKEN` (never echo it):
```
# create PR (body via a heredoc file to keep JSON clean)
PR=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/nitam-1319/netbaan-design-system/pulls \
  -d "$(jq -n --arg t 'audit: <batch title>' --arg h aegis/audit --arg b aegis/build --arg body "$PR_BODY" \
        '{title:$t, head:$h, base:$b, body:$body}')" | jq -r .number)
# merge ONLY if all gates were green:
curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/nitam-1319/netbaan-design-system/pulls/$PR/merge \
  -d '{"merge_method":"squash"}'
```
The PR body must contain: **Components reviewed**, **Problems discovered**, **Fixes
applied**, **Testing performed** (gates + which checks ran green in-browser), **Queued
for confirmation** (subjective), **Remaining concerns**. If any gate is RED: do NOT
merge — leave the PR open, and **stop the run** (don't start another batch — the next
batch would reset this branch and orphan the open PR). Report the red PR in the run
report. After a successful merge, the next batch re-syncs `aegis/audit` from the updated
`aegis/build` (top of this section).

## Stop conditions
- **Queue empty** — every component is ✅ reviewed (and re-audits from dependency
  changes are done). Report the library production-ready.
- **Budget** — near the session limit: finish the component in progress, commit/push,
  open the batch PR, update the tracker, then End of run. Don't leave a component
  half-audited on the branch.
- **Blocker** — a hard gate can't pass and can't be fixed, or the SAME fix recurs 3×
  (systemic). Stop and report `BLOCKED` with the exact step/cause.

## End-of-run report (AGENT.md §6)
Components audited this run; issues found & fixed; subjective items queued; gate results
tagged PASS/FAILED/BLOCKED/HUMAN_VERIFY_REQUIRED; PR link(s) + merge status; the Progress
line; why the run ended (queue empty / budget — turns or context); any doc inconsistency.
Never push to `main` or `aegis/build` directly. Never print the token.
