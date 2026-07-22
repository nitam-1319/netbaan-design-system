# REFERENCE_FIDELITY.md — components must match the reference

This is the rule that keeps the system from drifting back to shadcn defaults. It is
**mandatory** and **machine-gated** (`.agent/scripts/verify-conformance.mjs`).

## The mandate
Every component must match its AEGIS reference **exactly** — not just colors. That means
**structure, visual design, interactions, animations, shadows, borders, and behavior**.
(Exact pixel colors/spacing/dimensions come from the tokens; everything else must match too.)

The authoritative specs live in `.agent/references/spec/`:
`Button.dc.html`, `Input.dc.html`, `Select.dc.html`, `Checkbox.dc.html`, `Radio.dc.html`,
`Toggle.dc.html` (→ `switch`), `Badge.dc.html`, `Chip.dc.html`, `Avatar.dc.html`, plus
`AEGIS-CLAUDE.md` (tokens + the 20-point spec) and `Component-Inventory.dc.html`.

## Before building or reviewing a component
1. Open its reference page in `.agent/references/spec/<Name>.dc.html`. The spec data is in the
   `<script type="text/x-dc">` block — arrays named `variants`, `sizes`, `states`, `props`,
   `behaviors`, `a11y`, `anatomy`, `specRows`, `tokens`, `interaction`, `figma`. Read them.
2. Cross-check the machine contract in `.agent/references/spec-manifest.json` (required
   variants/tones/sizes/shape/status + the signature animation for that component).
3. Build to the reference: same variant **names**, the full **size scale** (not one size), every
   **state**, the same **API prop names**, and the signature motion/elevation/border treatment.

## Components NOT in the reference
Any component without a reference page must still follow the **same design language, structure,
and implementation patterns** established by the references: the closed API, the token system, and
the signature motifs below. When in doubt, mirror the closest reference (Button = primitive,
Dialog/Tooltip = interactive, DataTable = data) and the tokens in `AEGIS-CLAUDE.md`.

## Signature motifs (all defined in `src/index.css` — use them, never re-invent)
- **Beam** — rotating `conic-gradient` behind the Primary button / mastheads. Utility:
  `animate-beam-spin`.
- **Pulse dot** — status/legend dots. `animate-pulse-dot`.
- **Entrance pops** — `animate-check-pop` (checkbox mark), `animate-dot-pop` (radio dot),
  `animate-chip-pop` (chip). Menus: `animate-menu-in`. Avatar presence: `animate-status-ping`.
  Spinners: `animate-spin`.
- **Elevation** — the `--shadow` token via the `shadow-elevated` utility (deep in dark,
  violet-tinted in light). **Never** hard-code a `shadow-[…]` literal.
- **Focus ring** — a 3px **accent-soft** ring (`ring-accent-soft`) + accent border. **Not**
  shadcn's `ring-ring/50`.
- **Borders** — resting control borders use **`border-strong`**; hairlines use `border`.
- **Radius** — chips/badges 6–8px · controls 9–11px · cards 14–18px · masthead 20px.
- Motion honors `prefers-reduced-motion` (handled globally in `src/index.css`).

## The gate (hard)
```bash
node .agent/scripts/verify-conformance.mjs <name>   # gate the component you just built
node .agent/scripts/verify-conformance.mjs          # audit the whole library
```
It fails on: hard-coded shadow/color literals, the shadcn `ring-ring/50` focus ring, missing
required variants/tones/sizes/shape/status, and a missing signature animation. A component is not
done until it **conforms** (see `checklists/REVIEW_CHECKLIST.md`). Colors that must be literal live
only in `src/index.css` tokens, never in a component.
