import { cva, type VariantProps } from "class-variance-authority"
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Toolbar
 *
 * A container that groups a set of controls — action buttons, links, toggle
 * groups, or an inline input — with roving-tabindex keyboard navigation, built
 * on the Base UI Toolbar primitive. The primitive supplies `role="toolbar"`,
 * arrow-key movement between items, focus looping, and orientation semantics.
 * The bar is an AEGIS surface: bordered, rounded, elevated; items are ghost
 * controls that take a `muted` hover and the accent focus ring.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic props.
 * Compose with `ToolbarButton`, `ToolbarSeparator`, `ToolbarGroup`, and
 * `ToolbarLink`. See `.agent/rules/API_RULES.md`.
 */

const rootVariants = cva(
  cn(
    "inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-card p-1 text-foreground shadow-elevated",
    "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
  )
)

function Toolbar(
  props: Omit<ToolbarPrimitive.Root.Props, "className" | "style" | "render">
) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(rootVariants())}
      {...props}
    />
  )
}

const toolbarButtonVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none select-none",
    "text-muted-foreground hover:bg-muted hover:text-foreground",
    "focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:text-foreground",
    "data-[pressed]:bg-muted data-[pressed]:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "h-7 min-w-7 px-2 [&_svg]:size-3.5",
        md: "h-8 min-w-8 px-2.5 [&_svg]:size-4",
        lg: "h-10 min-w-10 px-3 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type ToolbarButtonProps = Omit<
  ToolbarPrimitive.Button.Props,
  "className" | "style"
> &
  VariantProps<typeof toolbarButtonVariants>

function ToolbarButton({ size = "md", ...props }: ToolbarButtonProps) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(toolbarButtonVariants({ size }))}
      {...props}
    />
  )
}

type ToolbarLinkProps = Omit<
  ToolbarPrimitive.Link.Props,
  "className" | "style"
> &
  VariantProps<typeof toolbarButtonVariants>

function ToolbarLink({ size = "md", ...props }: ToolbarLinkProps) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(toolbarButtonVariants({ size }), "underline-offset-4 hover:underline")}
      {...props}
    />
  )
}

function ToolbarGroup(
  props: Omit<ToolbarPrimitive.Group.Props, "className" | "style" | "render">
) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={cn(
        "flex items-center gap-1",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
      )}
      {...props}
    />
  )
}

function ToolbarSeparator(
  props: Omit<ToolbarPrimitive.Separator.Props, "className" | "style" | "render">
) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        "shrink-0 bg-border",
        // The separator's own orientation: a vertical separator is a vertical
        // line (default inside a horizontal toolbar), and vice-versa.
        "data-[orientation=vertical]:w-px data-[orientation=vertical]:h-5 data-[orientation=vertical]:mx-1",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:my-1"
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarGroup,
  ToolbarSeparator,
  toolbarButtonVariants,
}
export type { ToolbarButtonProps, ToolbarLinkProps }
