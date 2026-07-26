import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

/**
 * AEGIS — Click Outside (Utilities, closed API)
 *
 * The "dismiss when the user interacts elsewhere" primitive, for the custom
 * surfaces you build yourself — a bespoke popover, an inline editor, a
 * disclosure — that don't already sit on a Base UI overlay (Base UI's own
 * `Dialog` / `Popover` / `Menu` handle outside-press internally, so reach for
 * those first). It ships as a hook and a thin wrapper:
 *
 *   // Hook — attach to your own ref:
 *   const ref = React.useRef<HTMLDivElement>(null)
 *   useClickOutside(ref, () => setOpen(false), { enabled: open })
 *
 *   // Component — wrap the surface (polymorphic via `render`):
 *   <ClickOutside onClickOutside={() => setOpen(false)} enabled={open}>
 *     <MyPanel />
 *   </ClickOutside>
 *
 * Detection runs on the capture phase of `pointerdown`, so it fires before an
 * inner handler can `stopPropagation`, and optionally on `focusin` (`detectFocus`)
 * to also dismiss on keyboard focus leaving the surface. The listener is only
 * attached while `enabled`, and cleans up on unmount.
 *
 * Public API is CLOSED: no `className` / `style`. The wrapper adds no visual
 * styling; element polymorphism is available through `render`.
 * See `.agent/rules/API_RULES.md`.
 */

type ClickOutsideHandler = (event: PointerEvent | FocusEvent) => void

type UseClickOutsideOptions = {
  /** Only listen while `true`. Default `true`. */
  enabled?: boolean
  /** Also fire when focus moves outside the element (keyboard). Default `false`. */
  detectFocus?: boolean
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: ClickOutsideHandler,
  options: UseClickOutsideOptions = {}
): void {
  const { enabled = true, detectFocus = false } = options

  // Keep the latest handler without re-subscribing the DOM listeners.
  const handlerRef = React.useRef(handler)
  React.useEffect(() => {
    handlerRef.current = handler
  })

  React.useEffect(() => {
    if (!enabled) return

    function isOutside(target: EventTarget | null): boolean {
      const el = ref.current
      return el != null && target instanceof Node && !el.contains(target)
    }

    function onPointerDown(event: PointerEvent) {
      if (isOutside(event.target)) handlerRef.current(event)
    }
    function onFocusIn(event: FocusEvent) {
      if (isOutside(event.target)) handlerRef.current(event)
    }

    // Capture phase: fire before an inner handler can stop propagation.
    document.addEventListener("pointerdown", onPointerDown, true)
    if (detectFocus) document.addEventListener("focusin", onFocusIn, true)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      if (detectFocus) document.removeEventListener("focusin", onFocusIn, true)
    }
  }, [ref, enabled, detectFocus])
}

type ClickOutsideProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Fired when a pointer/focus interaction lands outside the wrapper. */
  onClickOutside: ClickOutsideHandler
  /** Only listen while `true`. Default `true`. */
  enabled?: boolean
  /** Also fire when focus moves outside the wrapper (keyboard). Default `false`. */
  detectFocus?: boolean
}

function ClickOutside({
  onClickOutside,
  enabled = true,
  detectFocus = false,
  render,
  ...props
}: ClickOutsideProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  useClickOutside(ref, onClickOutside, { enabled, detectFocus })

  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "click-outside",
      ...props,
    },
  })
}

export { ClickOutside, useClickOutside }
export type { ClickOutsideProps, ClickOutsideHandler, UseClickOutsideOptions }
