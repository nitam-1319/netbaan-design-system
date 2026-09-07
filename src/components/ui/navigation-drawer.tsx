"use client";

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — NavigationDrawer (Interactive tier, closed API)
 *
 * The app rail as an edge-anchored overlay, for viewports below the desktop
 * breakpoint where the persistent sidebar cannot stay on screen.
 *
 * `Drawer` is the nearest existing component and cannot be this surface, on
 * five counts its closed API has no way to express: it paints `--popover`
 * where a rail is `--sidebar`; it carries `p-6`/`gap-4` where a nav must run
 * flush to its own edges so rows can bleed to the panel's inline start; its
 * widths are the `max-w-*` ladder where a touch drawer is a viewport fraction
 * with a cap; it eases entrance and exit identically at 300ms where an overlay
 * this size wants a decelerating arrival and a faster, accelerating dismissal;
 * and its scrim is a blurred wash where a nav scrim is a flat dim.
 *
 * Everything structural is the Base UI `Dialog` primitive's, exactly as
 * `Drawer` uses it: portal, focus trap, focus restore, scroll lock,
 * `role="dialog"` / `aria-modal`, Escape and outside-press.
 *
 * There is deliberately no close button. In this pattern the close control
 * belongs on the brand row beside the mark, where the reader's eye already is
 * — a floating corner button is a second, competing affordance.
 *
 * Public API is CLOSED: no `className` / `style`. Placement is `side`, extent
 * is the semantic `size`; the rail's contents belong in `Sidebar` (whose
 * `density="touch"` is the right pairing here).
 */

const navigationDrawerVariants = cva(
  [
    "bg-sidebar text-sidebar-foreground fixed inset-y-0 z-50 flex h-full flex-col outline-none",
    // Transform only. Fading a full-height rail in and out reads as a flicker
    // at this size; the movement is the signal.
    "transition-transform ease-[var(--ease-enter)] duration-[220ms]",
    "data-[ending-style]:ease-[var(--ease-exit)] data-[ending-style]:duration-[140ms]",
  ],
  {
    variants: {
      side: {
        // Offsets are LOGICAL: the panel docks to the inline start / end, so in
        // a Persian layout it arrives from the correct edge without the caller
        // choosing a different side.
        start:
          "start-0 border-e border-sidebar-border data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full rtl:data-[ending-style]:translate-x-full rtl:data-[starting-style]:translate-x-full",
        end: "end-0 border-s border-sidebar-border data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full rtl:data-[ending-style]:-translate-x-full rtl:data-[starting-style]:-translate-x-full",
      },
      size: {
        /** Phone: nearly full width, capped so the scrim stays graspable. */
        compact: "w-[min(86vw,304px)]",
        /** Tablet: about half the viewport, capped at the rail's design width. */
        default: "w-[min(52vw,320px)]",
      },
    },
    defaultVariants: { side: "start", size: "default" },
  }
)

function NavigationDrawer(
  props: React.ComponentProps<typeof DialogPrimitive.Root>
) {
  return <DialogPrimitive.Root data-slot="navigation-drawer" {...props} />
}

function NavigationDrawerTrigger(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Trigger data-slot="navigation-drawer-trigger" {...props} />
  )
}

function NavigationDrawerClose(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Close>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Close data-slot="navigation-drawer-close" {...props} />
  )
}

type NavigationDrawerContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  "className" | "style"
> &
  VariantProps<typeof navigationDrawerVariants>

function NavigationDrawerContent({
  side = "start",
  size = "default",
  children,
  ...props
}: NavigationDrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="navigation-drawer-scrim"
        className={cn(
          // A flat dim, not the dialog's blurred wash: the page behind a nav
          // drawer stays legible on purpose, so the reader keeps their place.
          "fixed inset-0 z-50 bg-[rgb(9_9_11/0.62)]",
          "transition-opacity ease-[var(--ease-enter)] duration-[220ms]",
          "data-[ending-style]:ease-[var(--ease-exit)] data-[ending-style]:opacity-0 data-[ending-style]:duration-[140ms] data-[starting-style]:opacity-0"
        )}
      />
      <DialogPrimitive.Popup
        data-slot="navigation-drawer-content"
        className={cn(navigationDrawerVariants({ side, size }))}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export {
  NavigationDrawer,
  NavigationDrawerTrigger,
  NavigationDrawerClose,
  NavigationDrawerContent,
  navigationDrawerVariants,
}
export type { NavigationDrawerContentProps }
