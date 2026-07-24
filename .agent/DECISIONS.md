# DECISIONS.md — Architecture Decision Log (ADR)

> **Append-only.** Never edit or delete a past decision. To change one, add a **new** entry and set
> the old one's status to `superseded-by: <id of new entry>`. This is the memory the agent does
> not otherwise have between runs — without it, settled choices get silently re-litigated.
>
> Consult this file **before** making any architectural choice. If your choice contradicts an
> `accepted` decision, stop and either follow it or add a superseding entry with justification.

Entry format:
```
## <id> — <short title>
Status: proposed | accepted | superseded-by: <id>
Decision: <what>
Reason: <why>
Impact: <what this binds going forward>
```

---

## 2026-07-19a — Base UI package path
Status: superseded-by: 2026-07-19g
Decision: The Base UI primitives package is `@base-ui-components/react`, not `@base-ui/react`.
Reason: That is what MUI publishes; the wrong path yields an empty dir and invites API guessing.
Impact: All primitive inspection uses that path.
> ⚠️ This decision was FACTUALLY WRONG for this repository and is retained only for the audit trail.
> The repo actually depends on `@base-ui/react`. See the correction, 2026-07-19g.

## 2026-07-19b — Docs are router + lazy-loaded, not read-all-up-front
Status: accepted
Decision: `AGENT.md` is the only mandatory read; each mode loads only its document set.
Reason: Front-loading every rule dilutes attention (lost-in-the-middle) and re-creates the
mega-prompt cost the modular split was meant to remove.
Impact: New rule files must be wired into a mode in `AGENT.md`, not into a global read list.

## 2026-07-19c — CREATE never rewrites neighbors; upgrades are an explicit mode
Status: accepted
Decision: Bringing older components up to standard happens only in REFACTOR/UPGRADE mode, invoked
explicitly (usually from a REVIEW finding). CREATE records gaps as findings and moves on.
Reason: PART 1 forbade rewrites while PART 2/3 demanded "upgrade first" — a contradiction that would
turn every build into a library-wide refactor.
Impact: A CREATE run that starts modifying other components is a bug.

## 2026-07-19d — Escape-hatch policy (slotProps formulation)
Status: superseded-by: 2026-07-19h
Decision: No raw `className`/`style`; `slotProps` is semantic-only; layout valve lives in `Box`/`Stack`.
Reason: A total ban with no sanctioned layout path pushes teams to fork components.
Impact: Public APIs expose no styling hatch.
> ⚠️ Formulated against the older MUI-Base `slotProps` API. This repo uses `@base-ui/react`, which
> has no `slotProps` (it uses `render` + `className`). Superseded by 2026-07-19h, which keeps the
> closed-API intent but expresses it in `@base-ui/react` terms.

## 2026-07-19e — Health/status is computed, never hand-typed
Status: accepted
Decision: Per-component status is derived by `scripts/verify-inventory.mjs` from the filesystem plus
gate output. No hand-assigned percentages (e.g. "Accessibility: 100%").
Reason: Percentages are false precision (a11y is criteria met/violated, not a %), they invite
gaming, and hand-typed status drifts from reality within days.
Impact: Any status surface must be generated, not authored.

## 2026-07-19f — Component-count denominator is provisional
Status: proposed
Decision: Track Components, Variants, Stories, and A11y-checks as **separate** counts; do not report
a single `X / 219`. Treat 219 as unverified until the unit ("component" vs "variant") is confirmed.
Reason: 219 exceeds the distinct-component count of MUI/Carbon/Polaris; it likely folds in variants.
Impact: Awaiting human confirmation of the denominator before this moves to `accepted`. The full
catalog currently lives as the queue in `checklists/COMPONENTS_STATUS.md`.

## 2026-07-19g — Base UI package path (correction)
Status: accepted
Decision: The Base UI package for THIS repo is **`@base-ui/react`** (v1.x), imported per-part
(e.g. `@base-ui/react/button`, `@base-ui/react/tooltip`). Its primitive API is `render` +
`className`; there is **no `slotProps`**. Inspect `node_modules/@base-ui/react/<part>/` before coding.
Reason: Verified against `package.json`, `package-lock.json`, the installed `node_modules/@base-ui/react`
directory, and the imports in `src/components/ui/button.tsx` / `tooltip.tsx`. The earlier 2026-07-19a
decision named the wrong (older) package and would make every CREATE run halt on an empty directory.
Impact: All primitive inspection uses `@base-ui/react`. Supersedes 2026-07-19a.

## 2026-07-19h — Closed API on @base-ui/react (escape-hatch, corrected)
Status: accepted
Decision: Public AEGIS component props are **closed**: the public type **omits `className` and
`style`** (`Omit<Primitive.Props, "className" | "style">`). Customization is only via semantic props
— `variant`, `size`, `appearance`, `density`, and state props. Element polymorphism stays available
through Base UI's **`render`** prop (swap the rendered element, e.g. Button-as-anchor or a Tooltip
trigger) — `render` is for composition, **not** a styling hatch. One-off layout (margin, width, grid
placement) is served by a first-class token-only `Box`/`Stack` primitive (to be built). There is no
`slotProps` in `@base-ui/react`; where an inner element needs a semantic setting, add a first-class
prop for it — never a raw hatch.
Reason: Keeps the closed-API intent from 2026-07-19d but expressed in the actual library's API.
Impact: Every public component type omits `className`/`style`. If a genuine need can't be met via
variants / first-class props / `Box`/`Stack` tokens, add a first-class prop. Supersedes 2026-07-19d.

## 2026-07-19i — Adopt Closed API; migrate existing components once (carve-out)
Status: accepted
Decision: AEGIS is a **closed-API** design system (per 2026-07-19h), chosen deliberately by the
maintainer over the open shadcn/`className` model. The two pre-existing components that forwarded
`className` (`Button`, `Tooltip`) were migrated to the closed API in a **one-time REFACTOR**, and
their stories + the `App` demo updated to stop passing `className` to AEGIS components.
Reason: The repo was scaffolded as open shadcn/ui; a closed API is a different contract, so the
seed components had to be reconciled or the docs would contradict the code.
Impact: This is an explicit, one-time carve-out to safety rule #1 ("don't change existing behavior")
and rule #2 ("CREATE never rewrites"), applied only to this migration. Going forward: every NEW
component ships closed from the start; anything `npx shadcn add` generates is treated as
non-conformant scaffolding that must be closed before it counts as done. Future closed-API violations
found in existing components are handled in REFACTOR mode, not silently in CREATE.

## 2026-07-22 — Reference fidelity is mandatory and machine-gated
Status: accepted
Decision: Every component must match its AEGIS reference (`references/spec/<Name>.dc.html`) exactly —
structure, visual design, interactions, animations, shadows, borders, and behavior — not only colors.
Components without a reference page must follow the same design language and signature motifs.
Enforced by `scripts/verify-conformance.mjs` (a HARD gate) against `references/spec-manifest.json`.
Reason: The build had drifted to shadcn defaults (dropped size scales, missing variants/states, no
signature beam/pulse/pop animations, `ring-ring/50` focus, generic/hard-coded shadows). The reference
specs were never a build input, so drift was inevitable. This makes the specs both an input and a gate.
Impact: New components fail the gate unless they conform. The signature keyframes + `--shadow` token now
live in `src/index.css` (utilities `animate-*`, `shadow-elevated`; focus `ring-accent-soft`; control
borders `border-strong`). The five existing drifted components (button, checkbox, switch, badge, avatar)
are a REFACTOR backlog to bring into conformance — done only after this foundation lands.

## 2026-07-22b — DataTable is config-driven (typed columns), not a compound generic
Status: accepted
Decision: `DataTable` exposes a **config-driven** API — a typed `columns: DataTableColumn<TRow>[]`
array plus `data` / `getRowId` — rather than compound `DataTable.Root/Header/Body/Row/Cell`
sub-components. The reference (`references/DATA.datatable.md`) names a compound shape as one option;
this build satisfies its actual mandate — "a column-definition API (typed columns), not hardcoded
markup" — through the config form. Composition slots (`toolbar`, `footer`) remain for AEGIS nodes
(e.g. `Pagination`).
Reason: A generic compound component built over React context loses row-type inference at the leaf
(`Cell`) — context is invariant, so `TRow` degrades to `unknown` and every cell needs a manual cast.
The config form keeps end-to-end inference from the row shape to each `cell(row)` callback, which is
the stronger type-safety guarantee and the one the closed-API contract depends on.
Impact: The four required state surfaces (loading/empty/error/filled), selection, sorting (`aria-sort`),
and density all live on the single `DataTable` root. If a future consumer genuinely needs compound
composition, add it as an additive layer over the same column model — do not fork the state logic.

## 2026-07-22c — DataTable defers virtualization + arrow-key cell navigation (REVIEW finding)
Status: proposed
Decision: The first `DataTable` ships WITHOUT row virtualization and without arrow-key cell/row
grid navigation. All rows render to the DOM; keyboard access follows the natural tab order of the
interactive controls (sort headers, checkboxes, retry). Both gaps are documented in `data-table.mdx`
("Known limitations") and recorded here as a REVIEW/REFACTOR backlog item.
Reason: The reference lists virtualization ("document the threshold at which it engages") and
cell/row keyboard navigation as target patterns. Both are large, browser-verification-heavy additions;
landing them blind in a no-browser sandbox risks unverifiable complexity. Shipping a correct,
type-safe, fully-stated table now — with the gaps stated honestly rather than silently — is the better
increment (safety rule #3: never claim a capability not delivered).
Impact: A follow-up REFACTOR run adds windowing (recommended engage threshold ~100 rows) and roving
`tabindex` cell navigation, verified against the reference in CI with a browser runner. Until then the
guidance is: paginate via the `footer` slot for large datasets.

## 2026-07-23 — Combobox ships single-select; multi-select chips deferred (REVIEW finding)
Status: proposed
Decision: The first `Combobox` is **single-select** — input + filtered listbox + selected-check
indicator, built on the Base UI Combobox primitive. Multi-select with removable chips (the
primitive's `Chips` / `Chip` / `ChipRemove` parts, plus `multiple`) is NOT wrapped in this build and
is recorded here as a REVIEW/REFACTOR backlog item.
Reason: Chip entry/removal, backspace-to-remove, wrapping/overflow and multi-value keyboard semantics
are interaction-heavy and browser-verification-heavy; landing them blind in a no-browser sandbox risks
unverifiable complexity (same rationale as DataTable, 2026-07-22c). Shipping a correct, type-safe,
fully-stated single-select autocomplete now — with the gap stated honestly in `combobox.mdx` — is the
better increment (safety rule #3).
Impact: A follow-up REFACTOR run adds the chips layer over the same root (additive, not a fork),
verified against a browser runner in CI. Until then: use `Select` with `multiple` for multi-value
picking, or the future Multi-select component (queue #43). This mirrors the config-driven, honestly-
scoped precedent set by DataTable.

## 2026-07-23b — Choice Card ships single-select; multi-select deferred
Status: proposed
Decision: The first `ChoiceCard` is **single-select** — a `ChoiceCardGroup` on the Base UI Radio
Group + Radio primitives, one `ChoiceCard` (role=radio) per option. A multi-select variant (several
cards selectable at once, built on the Checkbox Group primitive) is NOT wrapped in this build and is
recorded here as a REVIEW/REFACTOR backlog item.
Reason: Single-select is the dominant choice-card pattern (pick one plan / workspace / speed) and maps
cleanly onto the existing Radio group semantics (roving focus, aria-checked, native form submission).
Adding a parallel checkbox-backed group in the same run doubles the state/keyboard surface with no
browser runner to verify it; shipping the correct single-select increment now — with the gap stated in
`choice-card.mdx` — is the better step (safety rule #3). Mirrors Combobox (2026-07-23) and DataTable
(2026-07-22c).
Impact: A follow-up run adds a checkbox-backed multi-select group as an additive layer (not a fork of
`ChoiceCard`). Until then, for multi-select compose `Checkbox` inside `Card`.

## 2026-07-24 — Currency / Masked Input ships as Currency Input; generic mask deferred
Status: accepted
Decision: Roadmap slot #52 ("Currency / Masked Input") ships as **`currency-input.tsx`**, a numeric
money field (deterministic group/decimal separators, blur-format / focus-raw so the caret never jumps,
committed value is a real `number | null` via `onValueChange`). A general-purpose **mask engine**
(phone, card, arbitrary pattern tokens) is NOT bundled in this component and is recorded as a separate
future primitive.
Reason: The two have different contracts — a currency field is a numeric value with formatting on
display, whereas a mask is a per-character pattern with insert/delete caret bookkeeping and its own
validation surface. Fusing them into one closed API would muddy both. Shipping the correct, verifiable
currency increment now (with the scope stated in `currency-input.mdx`) beats a half-built universal
mask with no browser runner to verify caret behaviour (safety rule #3). Mirrors Combobox (2026-07-23),
Choice Card (2026-07-23b), DataTable (2026-07-22c).
Impact: A later run may add a dedicated masked-input primitive (e.g. on a pattern spec) as an additive
component; `currency-input` stays the money-specific field. The queue row for #52 is satisfied by
`currency-input` with this carve-out noted.
