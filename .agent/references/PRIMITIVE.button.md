# Reference — Button (Primitive tier, closed API)

Canonical source: `src/components/ui/button.tsx`. Copy this shape for primitives.

## Patterns this reference locks in
- **Base UI:** wraps `@base-ui/react/button` (`ButtonPrimitive`). Verify the API under
  `node_modules/@base-ui/react/button/` before changing anything (see `../DECISIONS.md`, 2026-07-19g).
- **CVA variants**: one `cva()` block. Canonical keys are `variant` and `size`. The current values
  (from the shadcn base) are `variant`: `default | outline | secondary | ghost | destructive | link`
  and `size`: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`. Keep values stable
  across the system; add a value, don't rename existing ones without a superseding decision.
- **Closed public API**: the prop type is `Omit<ButtonPrimitive.Props, "className" | "style"> &
  VariantProps<typeof buttonVariants>`. No `className`/`style` passthrough. `render` (element
  polymorphism) remains available from the primitive.
- **Tokens only**: every color/space/radius/shadow resolves to a `var(--…)` token via the theme in
  `src/index.css` (see `../rules/TOKEN_RULES.md`).
- **`cn()`** composes CVA output only — nothing public is merged in.
- **`data-slot="button"`** on the root.
- **States**: default, hover, focus-visible, active, disabled (via the primitive's `disabled`).

## Skeleton
```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("…token-based base classes…", {
  variants: {
    variant: { default: "…", outline: "…", secondary: "…", ghost: "…", destructive: "…", link: "…" },
    size:    { default: "…", xs: "…", sm: "…", lg: "…", icon: "…" /* + icon-xs/sm/lg */ },
  },
  defaultVariants: { variant: "default", size: "default" },
})

type ButtonProps = Omit<ButtonPrimitive.Props, "className" | "style"> &
  VariantProps<typeof buttonVariants>

function Button({ variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

Note: no `className`/`style` in the public prop type. Element swaps go through the primitive's
`render` prop; one-off layout goes through `Box`/`Stack` (token-only), never a class on the Button.
Per `../DECISIONS.md` (escape-hatch policy, 2026-07-19h).
