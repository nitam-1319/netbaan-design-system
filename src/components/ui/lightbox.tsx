import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Lightbox
 *
 * A full-screen media viewer: click a thumbnail (or open programmatically) to
 * inspect an image at size, stepping through a set with the arrows, dots-free
 * counter, and keyboard. Built on the Base UI Dialog primitive, so the portal,
 * focus trap, scroll lock, `role="dialog"` / `aria-modal`, and Escape dismissal
 * are handled for us; on top of that it manages the current-image index,
 * previous / next navigation, and a live position announcement.
 *
 * Config-driven convenience over Dialog (mirrors Confirmation Dialog): pass an
 * `images` array and, optionally, a `trigger`. The public API is CLOSED — no
 * `className` / `style`; behaviour is driven by semantic props (`loop`, `index`,
 * `open`). Colour, radius, and motion come from tokens.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type LightboxImage = {
  /** Image URL. */
  src: string
  /** Required alternative text — announced and shown to assistive tech. */
  alt: string
  /** Optional caption shown beneath the image. */
  caption?: React.ReactNode
}

type LightboxProps = {
  /** The set of images to browse. */
  images: LightboxImage[]
  /** Element that opens the lightbox (rendered as the Dialog trigger). */
  trigger?: React.ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  /** Fires when the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Controlled active image index. */
  index?: number
  /** Uncontrolled initial active index. */
  defaultIndex?: number
  /** Fires when the active index changes. */
  onIndexChange?: (index: number) => void
  /** Wrap past the last image back to the first (and vice-versa). */
  loop?: boolean
  /** Accessible name for the viewer. */
  label?: string
}

function Lightbox({
  images,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = false,
  label = "Image viewer",
}: LightboxProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(defaultIndex)
  const currentIndex = index ?? uncontrolledIndex
  const count = images.length

  const goTo = React.useCallback(
    (next: number) => {
      if (count === 0) return
      const clamped = loop
        ? ((next % count) + count) % count
        : Math.max(0, Math.min(count - 1, next))
      if (index == null) setUncontrolledIndex(clamped)
      onIndexChange?.(clamped)
    },
    [count, loop, index, onIndexChange]
  )

  const canPrev = loop ? count > 1 : currentIndex > 0
  const canNext = loop ? count > 1 : currentIndex < count - 1
  const current = images[currentIndex]

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const rtl = window.getComputedStyle(e.currentTarget).direction === "rtl"
    if (e.key === "ArrowRight") {
      e.preventDefault()
      goTo(currentIndex + (rtl ? -1 : 1))
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      goTo(currentIndex + (rtl ? 1 : -1))
    } else if (e.key === "Home") {
      e.preventDefault()
      goTo(0)
    } else if (e.key === "End") {
      e.preventDefault()
      goTo(count - 1)
    }
  }

  return (
    <DialogPrimitive.Root
      data-slot="lightbox"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger != null ? (
        <DialogPrimitive.Trigger data-slot="lightbox-trigger">
          {trigger}
        </DialogPrimitive.Trigger>
      ) : null}

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="lightbox-backdrop"
          className={cn(
            "fixed inset-0 z-50 bg-background/90 backdrop-blur-sm",
            "transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        />
        <DialogPrimitive.Popup
          data-slot="lightbox-content"
          onKeyDown={onKeyDown}
          className={cn(
            "fixed inset-0 z-50 flex flex-col gap-3 p-4 outline-none sm:p-6",
            "transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        >
          <DialogPrimitive.Title data-slot="lightbox-title" className="sr-only">
            {label}
          </DialogPrimitive.Title>

          {/* Live position + description, announced politely on navigation. */}
          <span role="status" aria-live="polite" className="sr-only">
            {count > 0
              ? `Image ${currentIndex + 1} of ${count}: ${current?.alt ?? ""}`
              : "No images"}
          </span>

          {/* Top bar: counter + close. */}
          <div
            data-slot="lightbox-toolbar"
            className={cn("flex shrink-0 items-center justify-between")}
          >
            <span
              data-slot="lightbox-counter"
              className={cn(
                "text-muted-foreground text-sm font-medium tabular-nums"
              )}
              aria-hidden="true"
            >
              {count > 0 ? `${currentIndex + 1} / ${count}` : "0 / 0"}
            </span>
            <DialogPrimitive.Close
              data-slot="lightbox-close"
              render={<Button variant="ghost" size="icon" aria-label="Close" />}
            >
              <X aria-hidden />
            </DialogPrimitive.Close>
          </div>

          {/* Stage: image flanked by prev / next. */}
          <div
            data-slot="lightbox-stage"
            className={cn(
              "relative flex min-h-0 flex-1 items-center justify-center"
            )}
          >
            {count > 1 ? (
              <div className="absolute start-1 top-1/2 z-10 -translate-y-1/2 sm:start-2">
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Previous image"
                  disabled={!canPrev}
                  onClick={() => goTo(currentIndex - 1)}
                >
                  <span className="inline-flex rtl:rotate-180">
                    <ChevronLeft />
                  </span>
                </Button>
              </div>
            ) : null}

            {current ? (
              <img
                data-slot="lightbox-image"
                src={current.src}
                alt={current.alt}
                className={cn(
                  "max-h-full max-w-full rounded-[var(--radius-lg)] object-contain shadow-elevated"
                )}
              />
            ) : null}

            {count > 1 ? (
              <div className="absolute end-1 top-1/2 z-10 -translate-y-1/2 sm:end-2">
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Next image"
                  disabled={!canNext}
                  onClick={() => goTo(currentIndex + 1)}
                >
                  <span className="inline-flex rtl:rotate-180">
                    <ChevronRight />
                  </span>
                </Button>
              </div>
            ) : null}
          </div>

          {/* Caption. */}
          {current?.caption != null ? (
            <div
              data-slot="lightbox-caption"
              className={cn(
                "text-muted-foreground mx-auto max-w-2xl shrink-0 text-center text-sm"
              )}
            >
              {current.caption}
            </div>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Lightbox }
export type { LightboxProps, LightboxImage }
