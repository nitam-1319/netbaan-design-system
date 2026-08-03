# AEGIS — `@netbaan-project/ui`

The AEGIS design system: a **sealed** React component library for Netbaan's security
products. Dark-first, token-driven, and built on [Base UI](https://base-ui.com/)
primitives, so keyboard behaviour, focus management and ARIA wiring come from the
primitives rather than being reimplemented per component.

"Sealed" is the important word. Components do **not** accept `className` or `style`.
Appearance is configured only through typed props — variants, tones, sizes — and
retheming happens by overriding CSS custom properties, never by reaching into a
component. That is what keeps 207 components looking like one system.

> **This repository is the design system itself.** If you are building a product
> *with* AEGIS, you want the install instructions below. If you are changing AEGIS,
> skip to [Developing this repo](#developing-this-repo).

## Install

The package is published **privately** to GitHub Packages, so npm needs to be told
where the `@netbaan-project` scope lives, and given a token with `read:packages`.

```ini
# .npmrc, in the consuming project
@netbaan-project:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm i @netbaan-project/ui
```

Peer dependencies (installed by you, not bundled): `react` ^19, `react-dom` ^19,
`@base-ui/react` ^1.6, `lucide-react` ^1.25.

## Use

```tsx
import "@netbaan-project/ui/styles.css";   // required — tokens + utilities
import "@netbaan-project/ui/fonts.css";    // optional — self-hosted type stack

import { Button, ThemeProvider } from "@netbaan-project/ui";

export function App() {
  return (
    <ThemeProvider>
      <Button variant="primary">Run scan</Button>
    </ThemeProvider>
  );
}
```

Import **either** `@netbaan-project/ui/styles.css` (consumers) **or** this repo's own
`src/index.css` (this repo only) — never both, as they share `theme.css`.

Everything is exported from the package root; there are no deep imports.

## Theming

Override the AEGIS custom properties on `:root`, or on any element to scope a
subtree. Do not restyle components, and do not target `[data-slot]` from outside
the library — those attributes exist for testing and analytics, and styling
through them is a contract violation rather than an escape hatch.

```css
:root {
  --primary: #7c53d4;
  --radius: 0.625rem;
}
```

`ThemeProvider` mounts the app in `.dark` by default; AEGIS is designed dark-first
and the light palette is the secondary target.

## Where to look next

| I want to… | Read |
|---|---|
| Know the rules before writing UI | [`AGENTS.md`](./AGENTS.md) — the contract (sealed, no `className`, tokens only) |
| Find a component | [`CATALOG.md`](./CATALOG.md) — all 207, with props, do/don't and `composesWith` |
| Compose a screen | [`RECIPES.md`](./RECIPES.md) — worked multi-component patterns |
| See what changed / migrate | [`CHANGELOG.md`](./CHANGELOG.md) — breaking changes carry migration notes |
| Cut a release | [`RELEASING.md`](./RELEASING.md) |

`catalog.json` ships alongside `CATALOG.md` as the machine-readable index, for
agents and codegen.

## Developing this repo

```bash
npm install
npm run storybook     # component workbench at :6006 — the primary dev surface
npm run verify        # typecheck + lint + conformance + token integrity
npm run build         # barrel -> js/d.ts -> css -> catalog
npm run build:fonts   # regenerate src/fonts.css + woff2 from @fontsource
```

`npm run verify` is what CI gates on. `verify:conformance` enforces the sealed API
(no `className`/`style` escape hatches, required `data-slot`s), and `verify:tokens`
catches CSS variables that a component references but nobody defines.

Components live in `src/components/ui/`, one file each, with a co-located
`*.stories.tsx`. `src/index.ts` is **generated** — run `npm run gen:barrel` rather
than editing it. Design tokens live in `src/theme.css`, shared by the app stylesheet
(`src/index.css`) and the published one (`src/styles.css`).
