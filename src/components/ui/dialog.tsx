"use client";

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Dialog / Modal (Interactive tier, closed API)
 *
 * A focus-trapping modal surface built on the Base UI Dialog primitive: the
 * portal, backdrop, focus trap, scroll lock, `role="dialog"` / `aria-modal`
 * wiring, and Escape / outside-press dismissal are all handled for us.
 *
 * Public API is CLOSED: no `className` / `style`. Size is the semantic `size`
 * prop; layout inside the dialog belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const dialogContentVariants = cva(
  [
    "bg-popover text-popover-foreground ring-border-strong fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl p-6 shadow-elevated ring-1 outline-none",
    "origin-[var(--transform-origin)] transition-[transform,opacity] duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-2xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Close>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  "className" | "style"
> &
  VariantProps<typeof dialogContentVariants> & {
    showClose?: boolean
  }

function DialogContent({
  size = "default",
  showClose = true,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm",
          "transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ size }))}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="Close"
            className={cn(
              "absolute top-4 end-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none",
              "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft",
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

function DialogHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pe-8 text-start")}
    >
      {children}
    </div>
  )
}

function DialogFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      )}
    >
      {children}
    </div>
  )
}

function DialogTitle(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Title>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-semibold text-foreground")}
      {...props}
    />
  )
}

function DialogDescription(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Description>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogContentVariants,
}
