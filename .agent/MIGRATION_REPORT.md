# MIGRATION_REPORT.md — What changed vs. the original PART 1–3 agenda

## Created files
Router + guides + rules + checklists + prompts + one script (see `AGENT.md` §5 for the tree).

## Structural changes (why the split now earns its keep)
1. **Router + lazy loading.** `AGENT.md` is the only mandatory read. It routes to a task-specific
   document set per mode (CREATE / REVIEW / REFACTOR / RELEASE / RECURRING). The original
   "read all 14 docs before any action" was removed — it re-created the mega-prompt's context cost
   and degraded rule adherence.
2. **Explicit mode switch resolves the create-vs-upgrade contradiction.** PART 1 said "don't rewrite
   existing components"; PART 2/3 said "upgrade outdated ones first / newest must not exceed oldest."
   Now: CREATE never rewrites neighbors; upgrades happen only in REFACTOR/UPGRADE, invoked
   explicitly, usually from a REVIEW finding.
3. **Gate honesty.** Gates are split into machine-verifiable, runner-verified, and human-verified.
   The agent may not mark a runner gate "passed" unless it actually ran it — otherwise `human-verify`.
   This stops `Progress` from lying.
4. **Escape-hatch policy revised** from a total `className`/`style` ban to a controlled, token-only
   `slotProps` surface, with the tradeoff documented so it isn't relitigated. Removed `class`
   (not a React prop).
5. **Scope + checkpoints.** `219` is flagged for re-basing (likely counts variants). Added human
   checkpoint gates every 10 components / on category boundaries / on repeated same-fixes.
6. **Docs moved under `.agent/`** (was repo root clutter) and organized into guides/rules/checklists/
   prompts. Single-source rule enforced: each rule in exactly one file, cross-referenced elsewhere.

## Rules relocated / de-duplicated
- API rules (were in PART 1 + PART 3) → `rules/API_RULES.md` only.
- RTL/i18n (scattered) → `rules/RTL_I18N_RULES.md` only.
- Storybook + Storybook-a11y (split) → `rules/STORYBOOK_RULES.md` (+ a11y in `ACCESSIBILITY_RULES.md`).
- Completion definition (PART 2 + PART 3 §19) → `checklists/REVIEW_CHECKLIST.md` only.

## Added (were missing for the stated quality tier)
- Base UI package-path correction: `@base-ui/react` (verify in lockfile).
- Token *source* definition; controlled/uncontrolled + forms in architecture.
- Versioning + changelog + **visual regression** in `RELEASE_GUIDE.md`.
- `scripts/verify-inventory.mjs` to reconcile trackers against the filesystem.

## Open items for a human to decide
- Confirm/re-base the `219` denominator and the unit of "component".
- Confirm the Storybook/a11y test runner works in the agent sandbox (else those gates stay
  `human-verify`).
- Wire up visual-regression tooling if not already present.

---

# Round 2 — accepted recommendations folded in

## Added
- **`DECISIONS.md`** — append-only ADR log with `proposed / accepted / superseded-by` status.
  Seeded with the real decisions (Base UI path, router, create-vs-upgrade, escape-hatch, computed
  status, 219-provisional). This is the cross-run memory the agent otherwise lacks.
- **`references/`** — three-tier gold-standard references: `PRIMITIVE.button.md`,
  `INTERACTIVE.dialog.md` (focus/keyboard/controlled), `DATA.datatable.md`
  (loading/empty/error/virtualization). They are the executable spec; rule changes update the
  reference first.
- **`CHANGELOG.md` at repo root** (consumer-facing) — generated release notes + a curated migration
  layer, with an explicit reconciliation rule in the release flow.

## Resolved (was a real conflict)
- **Escape-hatch policy** finalized in `API_RULES.md` + `DECISIONS.md`: no raw `className`/`style`;
  `slotProps` is **semantic-only**; the layout valve **moves** to a token-only `Box`/`Stack`
  primitive so teams still have a sanctioned layout path (no forking).

## Reworked (rejected the naive version)
- **Health score** is now **computed** by `verify-inventory.mjs` (structural axes from disk; runner
  axes only from a real `.agent/.gate-report.json`; unknown → `HUMAN_VERIFY_REQUIRED`, never PASS).
  No hand-typed "Accessibility: 100%". Overall is `PASS / PARTIAL / FAIL`.
- **Ownership metadata** collapsed into `COMPONENT_INVENTORY.md` (only new field: last-review date);
  no separate drift-prone metadata file.

## Wired in
- **`BLOCKED`** added to the status vocabulary (`PASS / FAILED / BLOCKED / HUMAN_VERIFY_REQUIRED`)
  across `AGENT.md`, `TESTING_RULES.md`, `REVIEW_CHECKLIST.md`, `COMPONENTS_STATUS.md`.
- **Visual regression** made **sampled** (representative matrix), not the full
  theme×direction×breakpoint×state cartesian product.
- **Split counts** (Components / Variants / Stories / A11y) in `COMPONENTS_STATUS.md`.

## Still awaiting a human decision
- Confirm/re-base the component denominator (219 → provisional in `DECISIONS.md`).
- Confirm the Storybook/a11y/VR runners execute in the agent sandbox (else those axes stay
  `HUMAN_VERIFY_REQUIRED`).
