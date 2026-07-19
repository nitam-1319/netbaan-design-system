# COMPONENT_ARCHITECTURE.md — Technical shape of a component

## Baseline
Every component is:
- React + TypeScript, **strict** typing (no `any`, no implicit `any`, exported prop types).
- Built on a Base UI primitive **when one exists** for the interaction.
- Variant-driven via CVA; class composition via `cn()`.
- Tagged with `data-slot` attributes on each meaningful sub-element (for styling hooks & tests).
- Forward-refs the underlying DOM node where consumers legitimately need a ref
  (inputs, buttons, focusable surfaces).
- Composition-first: prefer `Root/Trigger/Content` sub-components over monolith props.

Reference implementations to mirror for structure and typing:
```
src/components/ui/button.tsx
src/components/ui/tooltip.tsx
```

## Base UI inspection (mandatory, before writing code)
1. Confirm the package from the lockfile — it is **`@base-ui/react`** (v1.x), imported per-part
   (`@base-ui/react/<primitive>`). Its API is `render` + `className`; there is **no `slotProps`**.
   Verify:
   ```bash
   grep -m1 "base-ui" package-lock.json
   ```
2. Inspect the primitive's real types (the `.d.ts` files, not a guess):
   ```bash
   ls node_modules/@base-ui/react/<primitive>/
   ```
3. Read its actual API: parts, props, events, types, accessibility behavior.
4. If the directory is missing/empty, **stop and report** — do not invent the API.
   (This rule exists precisely to prevent guessing; an empty dir means the assumption is wrong.)

## Closed public API
Wrap the primitive so the public prop type omits styling hatches:
`Omit<Primitive.Props, "className" | "style"> & VariantProps<…>`. Keep `render` (element
polymorphism). See `../rules/API_RULES.md` and the `../references/` implementations.

## Controlled / uncontrolled
Every stateful component supports both:
- **Uncontrolled**: `defaultValue` / `defaultChecked` / `defaultOpen`.
- **Controlled**: `value` / `checked` / `open` **plus** the matching `onChange` /
  `onCheckedChange` / `onOpenChange`.
Mirror Base UI's own controlled/uncontrolled contract; do not reinvent it.

## Forms
Form controls expose `name`, `required`, `disabled`, `readonly`, `invalid`, and integrate with
native form submission (or the project's form library — check an existing form component first).

## No hardcoded styling
No literal colors/spacing/radii/shadows in components. Tokens only — see `../rules/TOKEN_RULES.md`.
Public styling escape hatches are constrained per `../rules/API_RULES.md`.
