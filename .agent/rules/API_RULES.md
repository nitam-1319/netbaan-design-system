# API_RULES.md — Public component API (closed)

## Consistency
Equivalent behavior uses **identical** prop names across every component. The API should feel like
one product.

Canonical props:
```
variant  size  disabled  loading  invalid  readonly  required  orientation  appearance  density
```
Banned inconsistent variants: `buttonType`, `buttonSize`, `isDisabled`, `isLoadingState`, etc.

## Styling escape hatches — closed API (on `@base-ui/react`)
See `../DECISIONS.md` (2026-07-19h, escape-hatch corrected; 2026-07-19i, closed-API adopted) for the
full rationale and history. This repo uses **`@base-ui/react`** (`render` + `className`), which has
**no `slotProps`** — so the policy is expressed in that library's terms:

- **No raw `className`, no raw `style`** on any public component API. The public prop type is
  `Omit<Primitive.Props, "className" | "style">` merged with `VariantProps<…>` and the canonical
  semantic props. The internal wrapper still sets `className={cn(variants(...))}` — that's fine; the
  point is the *consumer* cannot inject styling.
- **Customization is semantic only**: `variant` / `size` / `appearance` / `density` / state props.
- **Polymorphism via `render`** is allowed — it swaps the *rendered element* (Button-as-anchor, a
  Tooltip trigger that renders a Button), which is composition, not styling. Do not use `render` to
  smuggle in `className`/`style`.
- **Layout has a sanctioned home: `Box`/`Stack`** (token-only spacing/layout props, lint-enforced —
  primitive to be built). One-off margin/width/grid needs go there, so teams never fork or
  wrapper-hack a component.
- `class` is not a React prop — only `className` is. Do not list `class`.

Forbidden:
```tsx
<Button className="custom-red-button" style={{ color: "#f00" }} />
<Button render={<a className="text-red-500" />}>link</Button>   {/* render must not inject styling */}
```
Allowed:
```tsx
<Button variant="destructive" size="lg" />
<Button render={<a href="/scan" />}>Run scan</Button>          {/* element swap only */}
<Stack gap="md"><Button variant="default" /></Stack>            {/* token-only layout */}
```

If a genuine need can't be met through variants, canonical semantic props, or `Box`/`Stack` tokens,
that's a **signal to add a first-class prop** — not to open a raw hatch.

## Typing pattern (mirror the references)
```ts
type ButtonProps = Omit<ButtonPrimitive.Props, "className" | "style"> &
  VariantProps<typeof buttonVariants>
```
See `../references/PRIMITIVE.button.md` for the canonical shape.
