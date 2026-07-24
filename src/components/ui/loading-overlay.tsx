import * as React from "react"

import { Spinner } from "@/components/ui/spinner"

/**
 * AEGIS — Loading Overlay
 *
 * A scrim that covers a region while it loads, centering an AEGIS `Spinner` (and
 * an optional label) over the content beneath. Use it for in-place busy states —
 * a panel refetching, a form submitting, a card recalculating — where you want
 * the existing layout to stay put and simply be masked.
 *
 * Two modes:
 *  - **Wrapping** — pass `children`; the overlay is absolutely positioned over a
 *    relative wrapper around them, so it covers exactly that region.
 *  - **Bare** — no `children`; the overlay fills its nearest positioned ancestor
 *    (`absolute inset-0`), or the viewport when `fullscreen`.
 *
 * Public API is CLOSED — no `className` / `style`. Behaviour via the semantic
 * props (`open`, `label`, `spinnerSize`, `blur`, `fullscreen`). Colours are
 * token-only. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type SpinnerSize = React.ComponentProps<typeof Spinner>["size"]

type LoadingOverlayProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Whether the overlay is shown. Default `true`. */
  open?: boolean
  /** Accessible + visible label under the spinner. Default "Loading". */
  label?: string
  /** Hide the visible label text but keep the spinner (label stays accessible). */
  hideLabel?: boolean
  /** Spinner size. Default "lg". */
  spinnerSize?: SpinnerSize
  /** Blur the content behind the scrim. Default `false`. */
  blur?: boolean
  /** Cover the viewport (`fixed`) instead of the nearest positioned ancestor. */
  fullscreen?: boolean
  /** Content the overlay covers; when present the overlay wraps it in a relative box. */
  children?: React.ReactNode
}

function Overlay({
  label = "Loading",
  hideLabel = false,
  spinnerSize = "lg",
  blur = false,
  fullscreen = false,
  ...props
}: Omit<LoadingOverlayProps, "open" | "children">) {
  return (
    <div
      data-slot="loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-fullscreen={fullscreen ? "" : undefined}
      className={[
        fullscreen ? "fixed" : "absolute",
        "inset-0 z-20 flex flex-col items-center justify-center gap-3",
        "bg-background/60",
        blur ? "backdrop-blur-sm" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <Spinner size={spinnerSize} tone="primary" label={label} />
      {!hideLabel && (
        <span
          aria-hidden="true"
          data-slot="loading-overlay-label"
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </span>
      )}
    </div>
  )
}

function LoadingOverlay({ open = true, children, ...props }: LoadingOverlayProps) {
  // Wrapping mode: keep the covered content mounted so layout doesn't jump.
  if (children != null) {
    return (
      <div data-slot="loading-overlay-root" className="relative">
        {children}
        {open && <Overlay {...props} />}
      </div>
    )
  }

  // Bare mode: render nothing when closed; otherwise fill the positioned ancestor.
  if (!open) return null
  return <Overlay {...props} />
}

export { LoadingOverlay }
export type { LoadingOverlayProps }
