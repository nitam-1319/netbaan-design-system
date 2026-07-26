import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * AEGIS — Color Picker (Inputs / Overlays)
 *
 * A trigger swatch that opens a Popover with HSL controls — hue, saturation, and
 * lightness sliders plus an optional preset row — and echoes the chosen colour
 * live. Colour is modelled as `{ h, s, l }` and emitted both as that object and
 * as a ready `hsl(…)` CSS string, so there is no hex parsing and nothing to keep
 * in sync. Controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`).
 *
 * The picking surface is three labelled native range inputs (keyboard-operable,
 * announced as sliders), branded with the `--primary` token via `accent-color`;
 * the hue track shows the spectrum via an `hsl()` gradient. The full 2-D
 * saturation/value square and eyedropper are deferred additive layers, consistent
 * with the honestly-scoped input precedents (Currency Input, Combobox, Time
 * Picker's native control).
 *
 * Public API is CLOSED — no `className` / `style`. Colours are HSL data (not
 * design tokens); chrome is token-only. See `.agent/rules/API_RULES.md`.
 */

type HSL = { h: number; s: number; l: number }

type ColorPickerProps = Omit<
  React.ComponentProps<typeof PopoverTrigger>,
  "children" | "render" | "value" | "defaultValue" | "color"
> & {
  /** Controlled colour. */
  value?: HSL
  /** Uncontrolled initial colour. Default `{ h: 217, s: 90, l: 60 }`. */
  defaultValue?: HSL
  /** Called with the next colour and its `hsl(…)` CSS string. */
  onValueChange?: (value: HSL, css: string) => void
  /** Preset swatches shown beneath the sliders. */
  presets?: HSL[]
  /** Accessible name for the trigger. Default "Choose colour". */
  label?: string
  /** Disable the trigger. Default `false`. */
  disabled?: boolean
  /** Trigger swatch size. Default "md". */
  size?: "sm" | "md" | "lg"
}

const DEFAULT_HSL: HSL = { h: 217, s: 90, l: 60 }

function cssOf({ h, s, l }: HSL) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`
}

const triggerSize: Record<NonNullable<ColorPickerProps["size"]>, string> = {
  sm: "h-8 gap-2 ps-1.5 pe-2.5 text-xs",
  md: "h-9 gap-2 ps-1.5 pe-3 text-sm",
  lg: "h-10 gap-2.5 ps-2 pe-3.5 text-sm",
}

const swatchSize: Record<NonNullable<ColorPickerProps["size"]>, string> = {
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
}

function Slider({
  label,
  value,
  max,
  onChange,
  track,
}: {
  label: string
  value: number
  max: number
  onChange: (n: number) => void
  track: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{Math.round(value)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:focus-accent"
        style={{ background: track, accentColor: "var(--primary)" }}
      />
    </label>
  )
}

function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  presets = [],
  label = "Choose colour",
  disabled = false,
  size = "md",
  ...props
}: ColorPickerProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<HSL>(defaultValue ?? DEFAULT_HSL)
  const hsl = isControlled ? value : internal
  const css = cssOf(hsl)

  const commit = (next: HSL) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next, cssOf(next))
  }
  const setChannel = (patch: Partial<HSL>) => commit({ ...hsl, ...patch })

  const hueTrack =
    "linear-gradient(to right, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"
  const satTrack = `linear-gradient(to right, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`
  const lightTrack = `linear-gradient(to right, hsl(${hsl.h} ${hsl.s}% 0%), hsl(${hsl.h} ${hsl.s}% 50%), hsl(${hsl.h} ${hsl.s}% 100%))`

  return (
    <Popover>
      <PopoverTrigger
        data-slot="color-picker-trigger"
        disabled={disabled}
        aria-label={`${label} (${css})`}
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center rounded-md border border-border-strong bg-card text-foreground outline-none transition-[background-color,border-color] hover:brightness-105 focus-visible:focus-accent disabled:pointer-events-none disabled:opacity-45",
              triggerSize[size]
            )}
          />
        }
        {...props}
      >
        <span
          data-slot="color-picker-swatch"
          aria-hidden
          className={cn("rounded-[5px] ring-1 ring-inset ring-border-strong", swatchSize[size])}
          style={{ background: css }}
        />
        <span className="font-medium tabular-nums">{css}</span>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start">
        <div data-slot="color-picker-panel" className="flex flex-col gap-4">
          <div
            data-slot="color-picker-preview"
            className="h-12 w-full rounded-md ring-1 ring-inset ring-border-strong"
            style={{ background: css }}
          />
          <div className="flex flex-col gap-3">
            <Slider
              label="Hue"
              value={hsl.h}
              max={360}
              track={hueTrack}
              onChange={(h) => setChannel({ h })}
            />
            <Slider
              label="Saturation"
              value={hsl.s}
              max={100}
              track={satTrack}
              onChange={(s) => setChannel({ s })}
            />
            <Slider
              label="Lightness"
              value={hsl.l}
              max={100}
              track={lightTrack}
              onChange={(l) => setChannel({ l })}
            />
          </div>
          {presets.length ? (
            <div
              data-slot="color-picker-presets"
              role="group"
              aria-label="Preset colours"
              className="flex flex-wrap gap-2"
            >
              {presets.map((p, i) => {
                const pcss = cssOf(p)
                return (
                  <button
                    key={`${pcss}-${i}`}
                    type="button"
                    data-slot="color-picker-preset"
                    aria-label={pcss}
                    onClick={() => commit(p)}
                    className="size-6 rounded-md ring-1 ring-inset ring-border-strong outline-none transition-transform hover:scale-110 focus-visible:focus-accent"
                    style={{ background: pcss }}
                  />
                )
              })}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker, cssOf as colorToCss }
export type { ColorPickerProps, HSL }
