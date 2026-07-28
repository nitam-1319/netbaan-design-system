# Packaging Plan — AEGIS Design System

Status: **draft / under review** — no code changes until sign-off.
Last updated: 2026-07-28

---

## 1. Goal & constraints

Turn this repo (currently a private Vite **application**) into an installable package for use across **the author's own React/Next.js projects**.

Hard requirements, in priority order:

1. **Immutability is a red line.** Neither users nor AI agents may modify component implementation. (This is also why components deliberately **do not accept `className`** or arbitrary custom classes — the styling surface is intentionally sealed.)
2. **AI must fully understand and make maximum use of the components** — specifically:
   - understand each component's **concept**,
   - know the **best place to use** each one,
   - **compose** them together correctly,
   - **never recreate** a component that already exists.
3. **Stable** and **easy to work with**.
4. Own-projects only — **not** a public distribution.

Non-goal: public/third-party distribution, "works in any React stack with zero config," consumer-side styling customization.

---

## 2. Chosen model

**A sealed, compiled, private npm package + an AI knowledge layer.**

- The **compiled package** enforces the immutability red line and the locked styling philosophy.
- The **AI knowledge layer** (catalog + types + docs + MCP) delivers full AI comprehension *for use*, without exposing or allowing edits to the implementation.

The unifying principle: **separate the immutable *implementation* from a rich, legible *contract*.** AI does not need the source to use a component well — it needs the contract (types, docs, catalog). Compiled output hides internals; the contract makes usage maximally clear.

### Alternatives considered and rejected

| Model | Why rejected |
|---|---|
| **Source-first monorepo workspace** | Exposes editable `.tsx` source → violates immutability red line. |
| **shadcn registry (copy source into each app)** | Same — source lands editable in each project. |
| **Require-Tailwind compiled lib** | Viable technically (all classes are literal strings), but styling would be consumer-tunable, contradicting the sealed/no-`className` philosophy. Also gates adoption to Tailwind v4. |
| **Ship-compiled-CSS "works anywhere"** | The zero-config styling benefit is irrelevant for own-projects; precompiled CSS is still used, but the "works in any stack" framing isn't the driver. |

Decision: precompiled `styles.css` **is** used (styling is locked, not consumer-configurable), but the reason is *sealing*, not portability.

---

## 3. Audited facts (basis for the plan)

Measured from `src/components/ui` on 2026-07-28:

| Fact | Value | Implication |
|---|---|---|
| Component `.tsx` files | **207** (+207 `.mdx`, + stories) | Large public surface; per-component entry points required |
| `"use client"` directives present | **0** | 🔴 Top blocker for Next.js App Router |
| Files using hooks/state/events | **~86** | These all need `"use client"` |
| Internal cross-component imports | **439** | High coupling → tree-shaking + barrel design matter |
| `@/lib/utils` (`cn`) importers | **166** | `clsx` + `tailwind-merge` ship as runtime deps |
| Barrel `index.ts` | **none** | Must be authored; defines the public API |
| Heavy libs (recharts/d3/framer-motion/date-fns) | **none** | Charts are hand-rolled SVG — bundle lighter than feared |
| Dynamic `className` construction (`${...}`) | **0 files** | 100% literal classes → safe for any CSS strategy |
| `cva` usage | **94 files** | Literal-string variants — safe |
| Custom animations | `animate-status-ping`, `animate-pulse-dot`, `animate-menu-in`, `animate-check-pop`, `animate-beam-spin(-fast)`, `animate-presence` | Defined in `index.css`; must travel in shipped CSS |
| Real runtime deps | `@base-ui/react` (subpath imports), `lucide-react` (115 files), `class-variance-authority`, `clsx`, `tailwind-merge` | Determines peer vs dependency split |
| `@storybook/addon-mcp` | installed (devDep) | Already-present live AI discovery channel |

---

## 4. Part A — the sealed compiled package

Distribution: **private registry** (GitHub Packages / Verdaccio / npm private).

Build output:

- **tsup or Vite lib build** → ESM, `preserveModules` (tree-shakeable per component), **minified**.
- **`"use client"` preserved** on the ~86 stateful files (requires `rollup-preserve-directives` or tsup directive handling — esbuild/Rollup strip directives by default).
- **Rich `.d.ts` emitted with TSDoc carried through** — this is the contract; non-negotiable.
- **No source maps shipped to consumers** — keep internals opaque; retain maps in the library repo for own debugging.
- **Precompiled `styles.css`** (Tailwind compiled to plain CSS + tokens + custom animations). Styling is locked, matching the no-`className` philosophy.
- **Fonts not baked in** — ship a separate opt-in `fonts.css` (or document), never a forced network font fetch.

`package.json` changes:

- Remove `"private": true`; set scoped name (e.g. `@netbaan/ui`).
- **peerDependencies**: `react`, `react-dom`, `@base-ui/react` (consider `lucide-react`).
- **dependencies**: `clsx`, `class-variance-authority`, `tailwind-merge`.
- Add `exports` map, `module`, `types`, `sideEffects: ["*.css"]`, `files: ["dist"]`.

Immutability enforcement (practical, not cryptographic):

- Compiled output lives in `node_modules` — git-ignored, regenerated on install, uncommittable. Edits are ephemeral and unshippable.
- **Minified + no source maps** → nothing meaningful to hand-edit.
- **`AGENTS.md` rule** in each consuming project: sealed dependency; never edit `node_modules`; use components only via typed props; never pass `className`.
- Optional CI/pre-commit check rejecting staged changes under `node_modules/@netbaan/ui`.

---

## 5. Part B — the AI knowledge layer

Maps directly to the four AI goals:

| Goal | Mechanism |
|---|---|
| Understand concepts | Generated **catalog** entry per component + **TSDoc `@description`** |
| Best place to use | `whenToUse` / `whenNotToUse` fields + **disambiguation tables** (Dialog vs BottomSheet vs ActionSheet; Alert vs Toast vs Banner) |
| Compose together | Per-component `composesWith` metadata + **type system as guardrail** + Storybook composed stories + a small `RECIPES.md` seed |
| Never recreate | Discoverable categorized **catalog read first** + **`AGENTS.md` "search before build" rule** + **Storybook MCP** live query |

### Catalog (centerpiece)

A **generated** `catalog.json` + rendered `CATALOG.md`, one entry per component:

```jsonc
{
  "name": "BottomSheet",
  "category": "overlay",
  "concept": "Modal panel that slides up from the bottom edge; mobile-first actions and forms.",
  "whenToUse": ["mobile action menus", "compact forms triggered from a tap"],
  "whenNotToUse": "Desktop-centric modals -> Dialog. Quick confirmations -> ActionSheet.",
  "useInstead": { "desktop modal": "Dialog", "menu of actions": "ActionSheet" },
  "props": ["open", "onOpenChange", "snapPoints"],
  "composesWith": ["Field", "Button", "List"],
  "example": "<BottomSheet open={o} onOpenChange={setO}>...</BottomSheet>"
}
```

**Generate, never hand-maintain** (207 entries would rot): a `.agent/scripts/build-catalog.mjs` extracts name/category/props from source + concept/when-to-use from `.mdx`, keeping it in sync. Fits the existing `.agent/scripts/` pattern (conformance, tokens).

### Composition is emergent, not enumerated

A hand-written recipe list would be capped by imagination and high-maintenance, and could suppress good novel compositions. Instead:

- **`composesWith` metadata + strict types** let the agent *derive* compositions never written; invalid ones fail typecheck → self-correction. Unbounded, automatic.
- **Storybook stories are a living recipe corpus** — every real screen built becomes another example (queryable via MCP). Grows from usage, not brainstorming.
- **`RECIPES.md` shrinks to a small seed** — only the trickiest/highest-frequency patterns that teach the composition *grammar*.

### Token economics

- **Build-time catalog generation**: deterministic parsing, ~zero AI tokens (optional one-time AI pass for prose).
- **Runtime**: use a **two-tier catalog** — always-loaded index (name + category + one-line concept ≈ ~3k tokens for all 207) + **on-demand** detailed entries + **MCP retrieval** + **prompt caching** (stable index caches well).
- **Net token-negative**: a few-thousand-token cached index prevents the far larger cost of reinventing/duplicating components and choosing wrong ones.

### Existing assets to leverage

- 207 `.mdx` docs → catalog source material + published docs.
- 207 Storybook stories → living usage/recipe corpus.
- `@storybook/addon-mcp` (already installed) → live AI discovery/query channel.
- `.agent/scripts/` + memory files → conventions feeding `AGENTS.md`.

---

## 6. Blocking issues (ranked)

1. **🔴 `"use client"` on ~86 files (0 present today).** Add + preserve through build. Largest, highest-risk task.
2. **🟠 No barrel / public API.** Author `src/index.ts`; decide public vs internal (439 internal imports mean some files are implementation detail).
3. **🟠 Build pipeline swap.** `tsconfig.app.json` is app-shaped (`noEmit`, `allowImportingTsExtensions`, `verbatimModuleSyntax`). Needs a lib emit config, or tsup. Rewrite any explicit `.tsx`-extension imports.
4. **🟠 `package.json` app-shaped.** private/deps split (see §4).
5. **🟡 `@/` aliases** must be rewritten to relative paths in output.
6. **🟡 Base UI subpath imports** must stay externalized (peer), not bundled, and survive `preserveModules`.

---

## 7. Phased sequencing

- **Phase 0 — Decisions** (see §8).
- **Phase 1 — `"use client"`** on the ~86 stateful files (scripted + verified) + build preservation.
- **Phase 2 — Barrel `src/index.ts`** + curate public API.
- **Phase 3 — `package.json`** rework (peer deps, exports, private off).
- **Phase 4 — Build config** (tsup: ESM, minified, dts, externals, alias rewrite, directive preservation, no consumer source maps).
- **Phase 5 — CSS**: precompiled `styles.css` (tokens + custom animations) + separate `fonts.css`.
- **Phase 6 — AI knowledge layer**: `build-catalog.mjs` → `catalog.json` + `CATALOG.md`; `RECIPES.md` seed; disambiguation tables; `AGENTS.md`; wire Storybook MCP; publish Storybook.
- **Phase 7 — Consumer smoke test**: throwaway Next.js App Router app, install tarball (`npm pack`), verify SSR + client components + styles + immutability rule.
- **Phase 8 — Release**: Changesets, private registry publish.

---

## 8. Open decisions (to resolve before Phase 1)

- [ ] Package name / scope (`@netbaan/ui`?).
- [ ] Private registry choice (GitHub Packages / Verdaccio / npm private).
- [ ] ESM-only vs ESM+CJS (recommend **ESM-only** — simplest, works in Next/Vite, cleanest `"use client"` preservation).
- [ ] Public vs internal component split (what the barrel exports).
- [ ] Token scoping: keep global names vs prefix (`--nb-*`) — lower priority for own-use, but decide before 1.0.
- [ ] Font delivery: separate `fonts.css` (recommended) vs document-only.
- [ ] Catalog category taxonomy (inputs / overlays / data-display / layout / feedback / domain widgets / charts …).

---

## 9. Summary

A **sealed compiled private package** makes the implementation effectively immutable and the styling locked (no `className`), satisfying the red line. A **generated catalog + rich typed contract + Storybook MCP** gives AI full understanding *for use* — concepts, when-to-use, composition, and discovery to avoid duplication — without ever exposing or permitting edits to the source. Composition stays open-ended via metadata + types + living stories rather than a finite recipe list. The sealed format is what *forces* agents into this disciplined "understand and use, never modify" interaction.
