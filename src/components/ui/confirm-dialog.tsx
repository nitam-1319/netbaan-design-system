import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, HelpCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Confirmation Dialog (Interactive tier, closed API)
 *
 * A focused "are you sure?" surface built on the Base UI Alert Dialog
 * primitive. Unlike the general `Dialog`, an alert dialog is `role="alertdialog"`,
 * is always modal, and cannot be dismissed by an outside-press — the user must
 * make an explicit choice — which is exactly what a destructive or irreversible
 * action warrants. Portalling, focus trap, scroll lock and Escape handling are
 * supplied by the primitive.
 *
 * This is a **config-driven** convenience over `Dialog` (see `.agent/DECISIONS.md`,
 * 2026-07-22b): `ConfirmDialogContent` takes `title`, `description`,
 * `confirmLabel`, `cancelLabel`, a semantic `tone`, and an `onConfirm` callback,
 * and composes AEGIS `Button` for the actions so tokens stay consistent. An
 * optional `children` slot renders extra body content between the description
 * and the actions.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Intent is the
 * semantic `tone`; sizing is `size`; layout inside belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const confirmDialogContentVariants = cva(
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
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/* ------------------------------------------------------------------ Root -- */

function ConfirmDialog(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Root>
) {
  return <AlertDialogPrimitive.Root data-slot="confirm-dialog" {...props} />
}

function ConfirmDialogTrigger(
  props: Omit<
    React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="confirm-dialog-trigger"
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Content -- */

const toneIconWrapVariants = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-full [&>svg]:size-5",
  {
    variants: {
      tone: {
        default: "bg-accent text-accent-foreground",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

type ConfirmTone = "default" | "destructive"

type ConfirmDialogContentProps = Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Popup>,
  "className" | "style" | "title"
> &
  VariantProps<typeof confirmDialogContentVariants> & {
    /** Heading — the question being asked. */
    title: React.ReactNode
    /** Supporting copy explaining the consequence. */
    description?: React.ReactNode
    /** Intent of the confirm action; drives the confirm button + icon. */
    tone?: ConfirmTone
    /** Label of the confirm button. */
    confirmLabel?: React.ReactNode
    /** Label of the cancel button. */
    cancelLabel?: React.ReactNode
    /** Fired when the confirm button is pressed (before the dialog closes). */
    onConfirm?: () => void
    /** Disable the confirm button (e.g. while a precondition is unmet). */
    confirmDisabled?: boolean
    /** Show the tone icon in the header. */
    showIcon?: boolean
    /** Extra body content between the description and the actions. */
    children?: React.ReactNode
  }

function ConfirmDialogContent({
  size = "default",
  tone = "default",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmDisabled = false,
  showIcon = true,
  children,
  ...props
}: ConfirmDialogContentProps) {
  const ToneIcon = tone === "destructive" ? AlertTriangle : HelpCircle

  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="confirm-dialog-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm",
          "transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <AlertDialogPrimitive.Popup
        data-slot="confirm-dialog-content"
        className={cn(confirmDialogContentVariants({ size }))}
        {...props}
      >
        <div
          data-slot="confirm-dialog-header"
          className="flex items-start gap-3 text-left"
        >
          {showIcon ? (
            <span
              data-slot="confirm-dialog-icon"
              className={cn(toneIconWrapVariants({ tone }))}
            >
              <ToneIcon aria-hidden />
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1.5">
            <AlertDialogPrimitive.Title
              data-slot="confirm-dialog-title"
              className="text-base leading-tight font-semibold text-foreground"
            >
              {title}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description
                data-slot="confirm-dialog-description"
                className="text-sm text-muted-foreground"
              >
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
          </div>
        </div>

        {children ? (
          <div data-slot="confirm-dialog-body" className="text-sm text-foreground">
            {children}
          </div>
        ) : null}

        <div
          data-slot="confirm-dialog-footer"
          className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <AlertDialogPrimitive.Close
            data-slot="confirm-dialog-cancel"
            render={<Button variant="outline" size="sm" />}
          >
            {cancelLabel}
          </AlertDialogPrimitive.Close>
          <AlertDialogPrimitive.Close
            data-slot="confirm-dialog-confirm"
            onClick={() => onConfirm?.()}
            render={
              <Button
                variant={tone === "destructive" ? "destructive" : "primary"}
                size="sm"
                disabled={confirmDisabled}
              />
            }
          >
            {confirmLabel}
          </AlertDialogPrimitive.Close>
        </div>
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  )
}

export { ConfirmDialog, ConfirmDialogTrigger, ConfirmDialogContent }
