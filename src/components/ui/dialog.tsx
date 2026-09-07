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
    "bg-popover text-popover-foreground ring-border-strong fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl shadow-elevated ring-1 outline-none",
    "origin-[var(--transform-origin)] transition-[transform,opacity] duration-200 data-[ending-style]:scale-95 data-[ending-style]:motion-exit data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        md: "max-w-[460px]",
        lg: "max-w-lg",
        xl: "max-w-2xl",
        /** Wide enough for a two-column body — a picker, a diff, a preview. */
        "2xl": "max-w-4xl",
        /** Near-viewport: a modal that is a workspace rather than a question. */
        full: "max-w-[min(1200px,calc(100vw-2rem))]",
      },
      /**
       * Drop the panel's own padding and gap so the regions can own their
       * edges — the same escape `Card flush` already offers. Without it a
       * dialog could not carry a tinted header band or a full-bleed body, and
       * callers rebuilt the panel from the primitives to get one.
       */
      flush: {
        true: "gap-0 overflow-clip p-0",
        false: "gap-4 p-6",
      },
      /**
       * `fit` sizes to content (the default). `fill` takes a tall, bounded box
       * whose body scrolls, which is what a dialog with chrome needs — the
       * header and footer must stay put while the middle moves.
       */
      height: {
        fit: "max-h-[calc(100vh-4rem)]",
        fill: "h-[min(720px,calc(100vh-4rem))]",
      },
    },
    defaultVariants: {
      size: "default",
      flush: false,
      height: "fit",
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
  flush = false,
  height = "fit",
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
          "transition-opacity duration-200 data-[ending-style]:motion-exit data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-flush={flush || undefined}
        className={cn(dialogContentVariants({ size, flush, height }))}
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

type DialogRegionProps = {
  children?: React.ReactNode
  /**
   * Paint the region onto `--surface` with a rule against the body.
   *
   * Only meaningful inside a `flush` panel, where the regions own their edges.
   * A dialog that carries chrome needs its head and foot to read as bands, not
   * as the first and last paragraphs of one sheet.
   */
  banded?: boolean
}

function DialogHeader({ children, banded = false }: DialogRegionProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 pe-8 text-start",
        banded && "border-b border-border bg-surface px-6 py-4"
      )}
    >
      {children}
    </div>
  )
}

/**
 * The scrolling middle of a dialog with chrome.
 *
 * Without it the panel itself scrolled, which took the header and footer with
 * it — so a long form's actions disappeared exactly when the reader reached
 * the end of it.
 */
function DialogBody({
  children,
  padded = true,
}: {
  children?: React.ReactNode
  padded?: boolean
}) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("min-h-0 flex-1 overflow-y-auto", padded && "px-6 py-5")}
    >
      {children}
    </div>
  )
}

function DialogFooter({ children, banded = false }: DialogRegionProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        banded && "border-t border-border bg-surface px-6 py-3.5"
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
      // Every other AEGIS heading is `--font-heading`; this one was the
      // exception, so a dialog title sat in the body face beside a card title
      // that did not.
      className={cn("font-heading text-base leading-none font-semibold text-foreground")}
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
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogContentVariants,
}
