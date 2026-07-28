import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cva } from "class-variance-authority"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Toast (Feedback tier, closed API)
 *
 * Transient, non-blocking feedback that confirms an action or reports a
 * background result without stealing focus — "Scan queued", "Copied",
 * "Export failed". Built on the Base UI Toast primitive, so the live-region
 * announcement, auto-dismiss timers, hover-to-pause, swipe-to-dismiss, and
 * focus management are all handled for us.
 *
 * Usage: wrap the app in `<ToastProvider>` and render `<Toaster />` once near
 * the root, then call `useToast().add({ ... })` from anywhere to raise a toast.
 *
 * Public API is CLOSED: no `className` / `style`. Intent is the semantic `type`
 * on the toast (`success` | `warning` | `error` | `info` | default). Colors are
 * token-only. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-[22rem] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground ring-1 ring-border-strong shadow-elevated",
    "transition-[transform,opacity] duration-300 ease-out data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
  ],
  {
    variants: {
      type: {
        default: "",
        success: "",
        warning: "",
        error: "",
        info: "",
      },
    },
    defaultVariants: {
      type: "default",
    },
  }
)

const iconByType = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
} as const

const iconToneByType = {
  success: "text-success-ink",
  warning: "text-warning-ink",
  error: "text-destructive-ink",
  info: "text-sev-low-ink",
} as const

type ToastType = "default" | "success" | "warning" | "error" | "info"

/**
 * Wrap the application. Owns the toast queue, default auto-dismiss timeout, and
 * the visible-at-once limit. Renders no visual element of its own.
 */
function ToastProvider(
  props: Omit<
    React.ComponentProps<typeof ToastPrimitive.Provider>,
    "className" | "style"
  >
) {
  return <ToastPrimitive.Provider {...props} />
}

/** Access the toast manager: `const toast = useToast(); toast.add({ title })`. */
function useToast() {
  return ToastPrimitive.useToastManager()
}

function ToastItem({
  toast,
}: {
  toast: ReturnType<typeof useToast>["toasts"][number]
}) {
  const type = (toast.type as ToastType | undefined) ?? "default"
  const Icon = type !== "default" ? iconByType[type] : null
  return (
    <ToastPrimitive.Root
      toast={toast}
      data-slot="toast"
      swipeDirection={["right", "down"]}
      className={cn(toastVariants({ type }))}
    >
      {Icon ? (
        <Icon
          aria-hidden
          className={cn("mt-0.5 size-5 shrink-0", iconToneByType[type as keyof typeof iconToneByType])}
        />
      ) : null}
      <div data-slot="toast-body" className={cn("flex min-w-0 flex-1 flex-col gap-1")}>
        <ToastPrimitive.Title
          data-slot="toast-title"
          className={cn("text-sm font-semibold text-foreground")}
        />
        <ToastPrimitive.Description
          data-slot="toast-description"
          className={cn("text-sm text-muted-foreground")}
        />
        {toast.actionProps ? (
          <ToastPrimitive.Action
            data-slot="toast-action"
            className={cn(
              "mt-1 inline-flex h-8 w-fit items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors outline-none",
              "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring"
            )}
          />
        ) : null}
      </div>
      <ToastPrimitive.Close
        data-slot="toast-close"
        aria-label="Close"
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none",
          "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring",
          "[&>svg]:size-4"
        )}
      >
        <X aria-hidden />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

/**
 * The visible toast region. Render once, inside `ToastProvider`, near the app
 * root. Anchors to the bottom-inline-end of the viewport.
 */
function Toaster() {
  const { toasts } = useToast()
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toaster"
        className={cn(
          "pointer-events-none fixed bottom-0 end-0 z-[100] flex max-h-screen w-full flex-col items-end gap-2 p-4 sm:max-w-[24rem]"
        )}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { ToastProvider, Toaster, useToast, toastVariants }
export type { ToastType }
