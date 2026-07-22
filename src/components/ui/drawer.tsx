import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Drawer / Sheet (Interactive tier, closed API)
 *
 * An edge-anchored surface that slides in from a side of the viewport for
 * secondary tasks, filters, or detail panels that shouldn't fully interrupt
 * the page the way a centered `Dialog` does. Built on the Base UI `Dialog`
 * primitive (the Interactive-tier gold standard), so the portal, backdrop,
 * focus trap, scroll lock, `role="dialog"` / `aria-modal` wiring, and
 * Escape / outside-press dismissal are all handled for us.
 *
 * Public API is CLOSED: no `className` / `style`. Placement is the semantic
 * `side` prop; the panel extent is the semantic `size` prop; layout inside the
 * drawer belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const drawerContentVariants = cva(
  [
    "bg-popover text-popover-foreground ring-border-strong fixed z-50 flex flex-col gap-4 p-6 shadow-elevated ring-1 outline-none",
    "transition-[transform,opacity] duration-300 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-full border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        left:
          "inset-y-0 left-0 h-full w-full border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
        top:
          "inset-x-0 top-0 w-full border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 w-full border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
      },
    },
    compoundVariants: [
      // Inline sides (left / right) — `size` controls width.
      { side: ["left", "right"], size: "sm", className: "max-w-xs" },
      { side: ["left", "right"], size: "default", className: "max-w-sm" },
      { side: ["left", "right"], size: "lg", className: "max-w-md" },
      { side: ["left", "right"], size: "xl", className: "max-w-xl" },
      // Block sides (top / bottom) — `size` controls height.
      { side: ["top", "bottom"], size: "sm", className: "max-h-[20vh]" },
      { side: ["top", "bottom"], size: "default", className: "max-h-[33vh]" },
      { side: ["top", "bottom"], size: "lg", className: "max-h-[50vh]" },
      { side: ["top", "bottom"], size: "xl", className: "max-h-[75vh]" },
    ],
    defaultVariants: {
      side: "right",
      size: "default",
    },
  }
)

function Drawer(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Close>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />
}

type DrawerContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  "className" | "style"
> &
  VariantProps<typeof drawerContentVariants> & {
    showClose?: boolean
  }

function DrawerContent({
  side = "right",
  size = "default",
  showClose = true,
  children,
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="drawer-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm",
          "transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <DialogPrimitive.Popup
        data-slot="drawer-content"
        className={cn(drawerContentVariants({ side, size }))}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            data-slot="drawer-close"
            aria-label="Close"
            className={cn(
              "absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none",
              "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring",
              "[&>svg]:size-4"
            )}
          >
            <X aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DrawerHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 pe-8 text-start")}
    >
      {children}
    </div>
  )
}

function DrawerBody({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("flex-1 overflow-y-auto text-sm text-muted-foreground")}
    >
      {children}
    </div>
  )
}

function DrawerFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}
    >
      {children}
    </div>
  )
}

function DrawerTitle(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Title>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-base leading-none font-semibold text-foreground")}
      {...props}
    />
  )
}

function DrawerDescription(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Description>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  drawerContentVariants,
}
