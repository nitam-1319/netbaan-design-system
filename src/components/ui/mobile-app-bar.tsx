import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Mobile App Bar (Mobile-specific, closed API)
 *
 * The compact top bar for small screens: a leading control (back / menu), a
 * screen title, and a few trailing actions, pinned to the top edge with a
 * top safe-area inset so it clears the notch / status bar. It is the mobile
 * sibling of `Navbar` — both render a landmark `<header>` (banner) and follow the
 * same slot-part, token-only, closed-API shape — but where `Navbar` carries a
 * horizontal primary-navigation list for wide layouts, the App Bar is the
 * three-zone (leading · title · trailing) header of a single mobile screen.
 *
 * Assemble it from slots:
 *
 *   <MobileAppBar>
 *     <MobileAppBarLeading>
 *       <Button variant="ghost" size="icon-sm" aria-label="Back"><ChevronLeft /></Button>
 *     </MobileAppBarLeading>
 *     <MobileAppBarTitle render={<h1 />}>Findings</MobileAppBarTitle>
 *     <MobileAppBarActions>
 *       <Button variant="ghost" size="icon-sm" aria-label="Search"><Search /></Button>
 *     </MobileAppBarActions>
 *   </MobileAppBar>
 *
 * The title truncates rather than wrapping, and can be centred (iOS idiom) or
 * start-aligned (Material idiom) via its `align` prop. Element polymorphism lets
 * the title become the screen's `<h1>` through `render`.
 *
 * Public API is CLOSED: no `className` / `style`. Density is the semantic `size`
 * prop; pinning is `placement`. See `.agent/rules/API_RULES.md`.
 */

const mobileAppBarVariants = cva(
  [
    "bg-surface/80 border-border z-30 flex w-full items-center gap-1 border-b px-2 pt-[env(safe-area-inset-top)] backdrop-blur-md",
  ],
  {
    variants: {
      size: {
        // Content row height + the top safe-area inset, so the bar clears the
        // notch without squashing its content.
        sm: "min-h-[calc(3rem+env(safe-area-inset-top))]",
        default: "min-h-[calc(3.5rem+env(safe-area-inset-top))]",
        lg: "min-h-[calc(4rem+env(safe-area-inset-top))]",
      },
      placement: {
        sticky: "sticky top-0",
        fixed: "fixed inset-x-0 top-0",
        static: "",
      },
    },
    defaultVariants: {
      size: "default",
      placement: "sticky",
    },
  }
)

type MobileAppBarProps = Omit<
  React.ComponentProps<"header">,
  "className" | "style"
> &
  VariantProps<typeof mobileAppBarVariants>

function MobileAppBar({
  size = "default",
  placement = "sticky",
  children,
  ...props
}: MobileAppBarProps) {
  return (
    <header
      data-slot="mobile-app-bar"
      className={cn(mobileAppBarVariants({ size, placement }))}
      {...props}
    >
      {children}
    </header>
  )
}

function MobileAppBarLeading({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="mobile-app-bar-leading"
      className={cn("flex shrink-0 items-center gap-0.5 [&_svg]:size-5")}
      {...props}
    />
  )
}

const mobileAppBarTitleVariants = cva(
  "min-w-0 flex-1 truncate text-base font-semibold text-foreground",
  {
    variants: {
      align: {
        start: "text-start",
        center: "text-center",
      },
    },
    defaultVariants: {
      align: "start",
    },
  }
)

type MobileAppBarTitleProps = Omit<
  useRender.ComponentProps<"span">,
  "className" | "style"
> &
  VariantProps<typeof mobileAppBarTitleVariants>

function MobileAppBarTitle({
  align = "start",
  render,
  ...props
}: MobileAppBarTitleProps) {
  return useRender({
    render: render ?? <span />,
    props: {
      "data-slot": "mobile-app-bar-title",
      className: cn(mobileAppBarTitleVariants({ align })),
      ...props,
    },
  })
}

function MobileAppBarActions({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="mobile-app-bar-actions"
      className={cn("ms-auto flex shrink-0 items-center gap-0.5 [&_svg]:size-5")}
      {...props}
    />
  )
}

export {
  MobileAppBar,
  MobileAppBarLeading,
  MobileAppBarTitle,
  MobileAppBarActions,
  mobileAppBarVariants,
}
