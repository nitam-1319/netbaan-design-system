# REVIEW_CHECKLIST.md — Completion definition

A component is **complete** only when all of the following hold. Items are split by how they are
verified, because the tracker must never record an unexecuted check as passed. Report each with the
four-value vocabulary `PASS` / `FAILED` / `BLOCKED` / `HUMAN_VERIFY_REQUIRED`
(see `../rules/TESTING_RULES.md`). The structural rows below are computed by
`../scripts/verify-inventory.mjs`, not marked by hand.

## Machine-verified (must be green this session)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (includes token + escape-hatch lint rules)
- [ ] `node .agent/scripts/verify-conformance.mjs <name>` passes — conforms to the reference (rules/REFERENCE_FIDELITY.md)
- [ ] Component file exists: `src/components/ui/<name>.tsx`
- [ ] Stories exist: `src/components/ui/<name>.stories.tsx`
- [ ] Docs exist: `src/components/ui/<name>.mdx`

## Runner-verified (green only if the runner actually ran; else `HUMAN_VERIFY_REQUIRED`)
- [ ] Storybook builds
- [ ] Play tests pass
- [ ] Accessibility (axe) passes
- [ ] Visual regression reviewed

## Human-verified (judgment; reviewer signs off)
- [ ] Light + Dark correct in all states
- [ ] RTL + LTR correct
- [ ] Persian + English correct (incl. Vazirmatn)
- [ ] Responsive across breakpoints
- [ ] Controls + Actions complete
- [ ] Uses tokens only; no raw `className`/`style` escape hatch
- [ ] API names match canonical conventions

## Existing-component review (REVIEW mode, read-only)
Flag — do **not** auto-fix — when a component has: missing RTL, missing dark mode, missing tests,
non-canonical API, a11y issues, raw `className`/`style` usage, or token violations. Fixes happen in
REFACTOR/UPGRADE mode, invoked explicitly.
