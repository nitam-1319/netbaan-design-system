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
