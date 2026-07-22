import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Navbar / Top Bar (Navigation tier, closed API)
 *
 * The horizontal application bar: brand on the inline-start, primary navigation,
 * and trailing actions. Composed of slot parts (`Navbar`, `NavbarBrand`,
 * `NavbarContent`, `NavbarItem`, `NavbarActions`) so a product can assemble a
 * consistent top bar. It renders a landmark `<header>` containing a `<nav>`, so
 * assistive tech exposes both the banner and navigation regions.
 *
 * Public API is CLOSED: no `className` / `style`. Density is the semantic `size`
 * prop; `NavbarItem` marks the current page with `active`. Element polymorphism
 * (e.g. a router `Link`) is available through `render`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const navbarVariants = cva(
  "bg-surface/80 border-border sticky top-0 z-30 flex w-full items-center gap-3 border-b px-4 backdrop-blur-md",
  {
    variants: {
      size: {
        sm: "h-12",
        default: "h-14",
        lg: "h-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type NavbarProps = Omit<React.ComponentProps<"header">, "className" | "style"> &
  VariantProps<typeof navbarVariants> & {
    /** Accessible label for the contained navigation landmark. */
    navLabel?: string
  }

function Navbar({ size = "default", navLabel = "Primary", children, ...props }: NavbarProps) {
  return (
    <header data-slot="navbar" className={cn(navbarVariants({ size }))} {...props}>
      <nav
        data-slot="navbar-nav"
        aria-label={navLabel}
        className={cn("flex w-full items-center gap-3")}
      >
        {children}
      </nav>
    </header>
  )
}

function NavbarBrand({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="navbar-brand"
      className={cn(
        "flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground [&_svg]:size-5"
      )}
      {...props}
    />
  )
}

const navbarContentVariants = cva("flex min-w-0 items-center gap-1", {
  variants: {
    justify: {
      start: "justify-start",
      center: "flex-1 justify-center",
      end: "flex-1 justify-end",
    },
  },
  defaultVariants: {
    justify: "start",
  },
})

type NavbarContentProps = Omit<
  React.ComponentProps<"ul">,
  "className" | "style"
> &
  VariantProps<typeof navbarContentVariants>

function NavbarContent({ justify = "start", ...props }: NavbarContentProps) {
  return (
    <ul
      data-slot="navbar-content"
      className={cn(navbarContentVariants({ justify }))}
      {...props}
    />
  )
}

type NavbarItemProps = Omit<
  useRender.ComponentProps<"a">,
  "className" | "style"
> & {
  /** Marks this item as the current page (`aria-current="page"` + active styling). */
  active?: boolean
}

function NavbarItem({ active = false, render, ...props }: NavbarItemProps) {
  const element = useRender({
    render: render ?? <a />,
    props: {
      "data-slot": "navbar-item",
      "data-active": active ? "" : undefined,
      "aria-current": active ? "page" : undefined,
      className: cn(
        "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors outline-none",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring",
        "data-[active]:bg-accent-soft data-[active]:text-foreground"
      ),
      ...props,
    },
  })
  return <li className={cn("contents")}>{element}</li>
}

function NavbarActions({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn("ms-auto flex shrink-0 items-center gap-2")}
      {...props}
    />
  )
}

export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  navbarVariants,
}
