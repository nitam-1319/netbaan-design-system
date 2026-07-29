# Working with @netbaan/ui (rules for AI agents)

`@netbaan/ui` is a **sealed** React component library (the AEGIS design system).
These rules apply both in this repository and in any project that consumes the
package. Copy or reference this file from a consuming project's own `AGENTS.md`
so the contract travels with the dependency.

## The contract

1. **Discover before you build.** Before creating ANY UI element, consult the
   catalog — `CATALOG.md` (human/AI index) or `catalog.json` (machine-readable),
   shipped at the package root (`node_modules/@netbaan/ui/`). If a component
   there fits, **use it. Never recreate a component that already exists.**

2. **Compose, don't reinvent.** Build screens by composing existing components.
   Each catalog entry lists `composesWith` (what it pairs with) and `exports`
   (its sub-parts). Prefer assembling primitives over writing new ones.

3. **The implementation is immutable.** Never edit anything under
   `node_modules/@netbaan/ui`. It is compiled, minified, and has no source maps
   — there is nothing to hand-edit, and any change is ephemeral and unshippable.
   If a component is missing or wrong, that is a request to the design-system
   maintainer, not a local patch.

4. **No `className`, no ad-hoc styling.** Components deliberately do **not**
   accept `className` or arbitrary classes. Configure appearance only through
   the typed props (variants, tones, sizes). If a needed variant does not exist,
   it is a design-system change — do not work around it with wrapper styling.

5. **Types are the source of truth.** Every component ships full `.d.ts` types.
   Rely on the compiler: valid props are those the types accept. Invalid usage
   fails typecheck — treat that as the signal, not a hint to cast or `any`.

## Using it

```tsx
// Once, at your app's root (or root layout in Next.js App Router):
import "@netbaan/ui/styles.css";

// Components — tree-shakeable named imports:
import { Button, Dialog, ThemeProvider } from "@netbaan/ui";
```

- **Theme:** the system is dark-first. Wrap your tree in `<ThemeProvider>` and
  toggle with `useTheme()`. Theming is done by overriding the CSS variables the
  tokens expose — never by restyling components.
- **Fonts:** optional. `import "@netbaan/ui/fonts.css"` if you want the bundled
  type stack; otherwise the components fall back to system fonts.
- **Next.js:** components that need interactivity already carry `"use client"`.
  Render them from server or client components as usual.

## Quick catalog lookup

- "Is there already a component for X?" → search `CATALOG.md` by category or name.
- "When do I use A vs B?" → each entry's **Use when** / **Avoid when** lines
  disambiguate (e.g. `BottomSheet` vs `Dialog` vs `Drawer` vs `Toast`).
- "What does it pair with?" → the **Composes with** line.
