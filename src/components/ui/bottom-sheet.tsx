import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Bottom Sheet (Mobile-specific, closed API)
 *
 * A surface that slides up from the bottom edge of the viewport — the mobile
 * idiom for secondary tasks, option lists, and detail panels that a centered
 * `Dialog` would interrupt too heavily on a small screen. It is a specialised,
 * always-bottom sibling of `Drawer`: both wrap the Base UI `Dialog` primitive
 * (so the portal, backdrop, focus trap, scroll lock, `role="dialog"` /
 * `aria-modal`, and Escape / outside-press dismissal come for free), but the
 * Bottom Sheet adds the mobile affordances a generic drawer doesn't — a rounded
 * top, a grabber handle, snap-style `height` steps, and bottom safe-area inset.
 *
 *   <BottomSheet>
 *     <BottomSheetTrigger render={<Button>Share</Button>} />
 *     <BottomSheetContent>
 *       <BottomSheetHeader>
 *         <BottomSheetTitle>Share asset</BottomSheetTitle>
 *         <BottomSheetDescription>Pick a destination.</BottomSheetDescription>
 *       </BottomSheetHeader>
 *       <BottomSheetBody>…</BottomSheetBody>
 *     </BottomSheetContent>
 *   </BottomSheet>
 *
 * The grabber is a visual affordance only (`aria-hidden`); an actual
 * drag-to-dismiss / drag-between-snap-points gesture is pointer-driven and
 * browser-verification-heavy, so it is deferred to a follow-up per the
 * honestly-scoped precedent in `.agent/DECISIONS.md`. Dismissal today is the
 * primitive's Escape / outside-press / close-button, which is fully verifiable.
 *
 * Public API is CLOSED: no `className` / `style`. The panel extent is the
 * semantic `height` prop; layout inside the sheet belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const bottomSheetContentVariants = cva(
  [
    "bg-popover text-popover-foreground ring-border-strong fixed inset-x-0 bottom-0 z-50 flex w-full flex-col gap-4 rounded-t-2xl border-t p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-elevated ring-1 outline-none",
    "transition-[transform,opacity] duration-300 ease-out data-[ending-style]:translate-y-full data-[ending-style]:opacity-0 data-[starting-style]:translate-y-full data-[starting-style]:opacity-0",
  ],
  {
    variants: {
      // `height` controls how tall the sheet rises. Steps read like snap points;
      // the panel never exceeds the given cap and scrolls its body past it.
      height: {
        sm: "max-h-[35dvh]",
        default: "max-h-[60dvh]",
        lg: "max-h-[85dvh]",
        full: "max-h-[95dvh]",
      },
    },
    defaultVariants: {
      height: "default",
    },
  }
)

function BottomSheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="bottom-sheet" {...props} />
}

function BottomSheetTrigger(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Trigger data-slot="bottom-sheet-trigger" {...props} />
}

function BottomSheetClose(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Close>,
    "className" | "style"
  >
) {
  return <DialogPrimitive.Close data-slot="bottom-sheet-close" {...props} />
}

type BottomSheetContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  "className" | "style"
> &
  VariantProps<typeof bottomSheetContentVariants> & {
    /** Render the grabber handle affordance at the top edge. Default `true`. */
    showGrabber?: boolean
    /** Render the corner close button. Default `true`. */
    showClose?: boolean
  }

function BottomSheetContent({
  height = "default",
  showGrabber = true,
  showClose = true,
  children,
  ...props
}: BottomSheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="bottom-sheet-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm",
          "transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        )}
      />
      <DialogPrimitive.Popup
        data-slot="bottom-sheet-content"
        className={cn(bottomSheetContentVariants({ height }))}
        {...props}
      >
        {showGrabber ? (
          <div
            data-slot="bottom-sheet-grabber"
            aria-hidden
            className={cn(
              "mx-auto -mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
            )}
          />
        ) : null}
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            data-slot="bottom-sheet-close"
            aria-label="Close"
            className={cn(
              "absolute top-4 end-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none",
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

function BottomSheetHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="bottom-sheet-header"
      className={cn("flex flex-col gap-1.5 pe-8 text-start")}
    >
      {children}
    </div>
  )
}

function BottomSheetBody({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="bottom-sheet-body"
      className={cn("flex-1 overflow-y-auto text-sm text-muted-foreground")}
    >
      {children}
    </div>
  )
}

function BottomSheetFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div
      data-slot="bottom-sheet-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}
    >
      {children}
    </div>
  )
}

function BottomSheetTitle(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Title>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Title
      data-slot="bottom-sheet-title"
      className={cn("text-base leading-none font-semibold text-foreground")}
      {...props}
    />
  )
}

function BottomSheetDescription(
  props: Omit<
    React.ComponentProps<typeof DialogPrimitive.Description>,
    "className" | "style"
  >
) {
  return (
    <DialogPrimitive.Description
      data-slot="bottom-sheet-description"
      className={cn("text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
  bottomSheetContentVariants,
}
export type { BottomSheetContentProps }
