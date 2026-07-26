import * as React from "react"

import { cn } from "@/lib/utils"
import { AnimatePresence } from "@/components/ui/animate-presence"

/**
 * AEGIS — Fade / Slide / Scale (Motion)
 *
 * The everyday enter/leave presets, built on `Animate Presence`. Give it an
 * `open` boolean and a `preset`; it fades, slides, or scales its content in when
 * `open` turns true and animates it out — then unmounts — when `open` turns false.
 *
 * `Transition` is the general form; `Fade`, `Slide`, and `Scale` are thin
 * convenience wrappers that preset the animation. Motion is token-scaled and
 * reduced-motion-aware. Public API is CLOSED — no `className` / `style`; behaviour
 * is the semantic props. See `.agent/rules/API_RULES.md`.
 */

type Preset =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "scale-fade"

type Speed = "fast" | "default" | "slow"

const durationMs: Record<Speed, number> = {
  fast: 150,
  default: 200,
  slow: 300,
}

const durationClass: Record<Speed, string> = {
  fast: "duration-150",
  default: "duration-200",
  slow: "duration-300",
}

/** Closed-state transform utilities (the "from"/"to" of the transition). */
const closedClass: Record<Preset, string> = {
  fade: "data-[state=closed]:opacity-0",
  "slide-up": "data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0",
  "slide-down": "data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0",
  "slide-left": "data-[state=closed]:translate-x-2 data-[state=closed]:opacity-0",
  "slide-right": "data-[state=closed]:-translate-x-2 data-[state=closed]:opacity-0",
  scale: "data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
  "scale-fade": "data-[state=closed]:scale-[0.98] data-[state=closed]:opacity-0",
}

type TransitionProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Whether the content is shown. Toggling drives the enter/leave animation. */
  open: boolean
  /** Content to animate (kept mounted through its leave). */
  children: React.ReactNode
  /** Which entrance/exit motion to use. Default "fade". */
  preset?: Preset
  /** Transition speed. Default "default". */
  speed?: Speed
  /** Also animate the first mount when `open` starts true. Default `false`. */
  appear?: boolean
}

function Transition({
  open,
  children,
  preset = "fade",
  speed = "default",
  appear = false,
  ...props
}: TransitionProps) {
  return (
    <AnimatePresence present={open} duration={durationMs[speed]} appear={appear}>
      <div
        data-slot="transition"
        className={cn(
          "transition-[opacity,transform] ease-out will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
          durationClass[speed],
          closedClass[preset]
        )}
        {...props}
      >
        {children}
      </div>
    </AnimatePresence>
  )
}

type PresetWrapperProps = Omit<TransitionProps, "preset">

function Fade(props: PresetWrapperProps) {
  return <Transition preset="fade" {...props} />
}

function Slide({
  from = "up",
  ...props
}: PresetWrapperProps & { from?: "up" | "down" | "left" | "right" }) {
  return <Transition preset={`slide-${from}` as Preset} {...props} />
}

function Scale({
  fade = false,
  ...props
}: PresetWrapperProps & { fade?: boolean }) {
  return <Transition preset={fade ? "scale-fade" : "scale"} {...props} />
}

export { Transition, Fade, Slide, Scale }
export type { TransitionProps, Preset, Speed }
