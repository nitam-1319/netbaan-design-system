# AEGIS × netbaan — daily build guide

This file is the contract the automated daily task follows. It is self-contained:
a fresh session with no memory should be able to read this, build the next
components correctly, and push — matching everything already in `src/components/ui`.

## Goal

Ship the AEGIS design system as a production React package: **219 components**
(see `COMPONENTS_STATUS.md`), each with a full package — implementation, Storybook
stories, interaction tests, accessibility, and written docs/specs — all consistent
with the AEGIS visual language.

## Stack & conventions (do not deviate)

- **React 19 + TypeScript + Vite**, **Tailwind CSS v4**, **shadcn/ui on Base UI**
  (`@base-ui/react`) primitives, **CVA** for variants, **lucide-react** icons.
- Every component wraps a Base UI primitive, styles with Tailwind utilities bound to
  **AEGIS tokens** (never hard-coded colors), composes classes with `cn()` from
  `@/lib/utils`, and tags parts with `data-slot="…"`. Mirror `src/components/ui/button.tsx`
  and `src/components/ui/tooltip.tsx` exactly for structure and typing style
  (`React.ComponentProps<typeof Primitive>`).
- Tokens live in `src/index.css` — dark-first AEGIS palette mapped onto shadcn's
  semantic variables (`--primary` = purple accent, `--popover`/`--card`/`--surface*`,
  severity scale on `--chart-*` / `--sev-*`). Fonts: Space Grotesk (headings), IBM
  Plex Sans (body), IBM Plex Mono (code/labels). **Do not reintroduce Geist/neutral.**
- Inspect the installed primitive's `.d.ts` before writing a component — do not guess
  the Base UI API (e.g. `node_modules/@base-ui/react/<part>/…`).

## Per-component deliverables

For each component `<Name>` build all of:

1. `src/components/ui/<name>.tsx` — implementation, all variants/sizes/states as CVA
   variants, forwarded props, `data-slot`s, AEGIS tokens only.
2. `src/components/ui/<name>.stories.tsx` — `title: "Components/<Name>"`, `tags:
   ["autodocs"]`, a story per variant/state, and at least one `play` function that
   drives the interaction and asserts with `storybook/test` (`expect`, `userEvent`,
   `screen`). Wrap stories in a `.dark` decorator so they render in the default theme.
3. `src/components/ui/<name>.mdx` — `title: "Components/<Name>/Guidelines"` — purpose,
   when-to-use, anatomy, behavior, **accessibility**, **design tokens**, and an **API**
   table (the 20-point AEGIS spec, adapted to prose/tables).
4. Accessibility: rely on the Base UI primitive's ARIA, verify with the a11y addon,
   and document roles/keyboard map in the mdx.

## Order

Follow `COMPONENTS_STATUS.md` top-to-bottom, **Essential → Recommended → Advanced**.
Respect dependencies (build a primitive before the components that list it under
"depends on" in the inventory). Do as many as the run's budget allows; always finish
a component fully before starting the next (never leave a half-built component).

**Foundations rows that are not React components.** The first category
("Foundations") contains abstract tokens/config rather than shippable components —
Color Tokens, Typography Scale, Spacing Scale, Elevation & Shadows, Radius Tokens,
Iconography (lucide), Grid & Breakpoints, Motion Tokens, Z-index, Theme Provider,
Focus Ring Token. These are already realized in `src/index.css`, the Tailwind v4
config, `src/components/theme-provider.tsx`, and lucide-react. Do **not** author a
`.tsx` component for them — just tick them off in `COMPONENTS_STATUS.md` (with a
one-line note of where they live) and move on to the first real component. Only
build a `.tsx` + stories + mdx when the row is an actual UI component.

## Validation gates (must pass before commit)

```bash
npm ci
npx tsc --noEmit          # HARD GATE — must be clean
npm run build             # HARD GATE — tsc -b + vite build must succeed
npm run lint              # new files must be clean; the ONE pre-existing
                          # react-refresh error in button.tsx is known/ignored
```

**Story + a11y tests** (`*.stories.tsx` `play` functions + the a11y addon) run in a
real browser via `npx vitest run --project=storybook`. This requires a matching
Playwright browser build, which the sandbox does **not** have (it ships an older
build and re-downloading is disabled), so the browser test step is **skipped in the
sandbox / daily run** and runs in CI (GitHub Actions / Chromatic) instead. Always
still author the `play` tests — they are committed and run downstream.

If a hard gate fails on a component you added, fix it before committing. Never commit
a red typecheck or build.

## Git workflow (each run)

1. `git switch -c aegis/build-YYYY-MM-DD` (branch per run; if it exists, append `-2`).
2. Build the next components + tick them in `COMPONENTS_STATUS.md` (update the
   progress count).
3. Commit per component or per run with a clear message
   (`feat(tooltip): add Tooltip component, stories, docs, tests`).
4. Push the branch. Do **not** force-push `main`.

## Update this as decisions change

If a convention changes, edit this file and `COMPONENTS_STATUS.md` in the same commit
so the next run stays consistent.
