# TESTING_RULES.md — Gates & honesty

## Two classes of gate
**Machine-verifiable (must run + pass before commit):**
```bash
npx tsc --noEmit
npm run build
npm run lint
```

**Environment-dependent (only "passing" if actually executed this session):**
- Storybook build
- Storybook play tests (`test-storybook`, needs a headless browser)
- Accessibility runner (axe via Storybook a11y)
- Visual regression (Chromatic or equivalent)

## Status vocabulary (use exactly these four)
- `PASS` — actually executed this session and green.
- `FAILED` — executed and red. Fix before commit; never commit a known `FAILED`.
- `BLOCKED` — could not run: missing dependency, broken environment, unresolved prerequisite.
  This is an *environment/prereq* problem, not a judgment call. Report the blocker and stop.
- `HUMAN_VERIFY_REQUIRED` — ran but needs human judgment (visual quality, UX), or the runner is
  unavailable here so a human must execute it. Not the same as `BLOCKED`: the work can proceed,
  it just isn't machine-confirmable.

`BLOCKED` and `HUMAN_VERIFY_REQUIRED` demand different actions — unblock vs. request review — so
keep them distinct.

## The honesty rule (critical)
If you cannot execute an environment-dependent gate in this sandbox, you **must not** claim it
passed. Tag it `human-verify`, name the exact command a human should run, and record it in the
report. A green tracker built on unexecuted gates is worse than an honest partial one — it makes
`Progress` lie.

Before relying on Storybook/a11y gates, confirm the runner actually works here:
```bash
npx test-storybook --help >/dev/null 2>&1 && echo "runner available" || echo "runner NOT available -> human-verify"
```

## Debugging failed tests
Read the error → find root cause → fix component or story → rerun → confirm green. Never ignore or
skip a failing test to make progress.
