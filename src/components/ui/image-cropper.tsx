import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Image Cropper (Advanced / File Management)
 *
 * An interactive crop selector over an image: a draggable, resizable rectangle
 * with a dimmed exterior, corner handles, keyboard nudging, and a live
 * percentage readout. The crop is expressed in FRACTIONAL coordinates
 * (`x`/`y`/`width`/`height` in `[0, 1]` of the image), so it is
 * resolution-independent — you apply it to the full-resolution bitmap upstream
 * (a `<canvas>` `drawImage`), exactly as `GeoChoroplethMap` leaves projection to
 * the caller.
 *
 * SCOPE: it selects a crop region; it does NOT rasterise/export the cropped image
 * (that is a `<canvas>` step the consumer owns) and does not rotate/zoom —
 * honestly-scoped, additive follow-ups. Pointer geometry needs a laid-out
 * element, so drag/resize is browser-verified (HUMAN_VERIFY); keyboard nudging is
 * deterministic. Public API is CLOSED — no `className` / `style`; treatment is
 * semantic props. Tokens only. See `.agent/rules/API_RULES.md`.
 */

export interface CropRect {
  /** Left edge as a fraction of image width [0, 1]. */
  x: number
  /** Top edge as a fraction of image height [0, 1]. */
  y: number
  /** Width as a fraction of image width (0, 1]. */
  width: number
  /** Height as a fraction of image height (0, 1]. */
  height: number
}

type Corner = "nw" | "ne" | "sw" | "se"

type ImageCropperProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange"
> & {
  /** Image source URL. */
  src: string
  /** Accessible description of the image. */
  alt: string
  /** Controlled crop (fractional). */
  value?: CropRect
  /** Initial crop (fractional, uncontrolled). Default centred 60% box. */
  defaultValue?: CropRect
  /** Fires whenever the crop changes. */
  onValueChange?: (crop: CropRect) => void
  /** Accessible name for the cropper. Default "Crop image". */
  label?: string
  /** Keyboard nudge / resize step (fraction). Default 0.02. */
  step?: number
  /** Smallest allowed crop side (fraction). Default 0.1. */
  minSize?: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const pct = (v: number) => `${Math.round(v * 100)}%`

const DEFAULT_CROP: CropRect = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 }

function normalize(rect: CropRect, minSize: number): CropRect {
  const width = clamp(rect.width, minSize, 1)
  const height = clamp(rect.height, minSize, 1)
  const x = clamp(rect.x, 0, 1 - width)
  const y = clamp(rect.y, 0, 1 - height)
  return { x, y, width, height }
}

function useControllable<T>(
  controlled: T | undefined,
  fallback: T,
  onChange?: (v: T) => void
): [T, (v: T) => void] {
  const [inner, setInner] = React.useState(fallback)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T) : inner
  const set = React.useCallback(
    (v: T) => {
      if (!isControlled) setInner(v)
      onChange?.(v)
    },
    [isControlled, onChange]
  )
  return [value, set]
}

function ImageCropper({
  src,
  alt,
  value,
  defaultValue = DEFAULT_CROP,
  onValueChange,
  label = "Crop image",
  step = 0.02,
  minSize = 0.1,
  ...props
}: ImageCropperProps) {
  const [crop, setCrop] = useControllable<CropRect>(
    value ? normalize(value, minSize) : undefined,
    normalize(defaultValue, minSize),
    onValueChange
  )
  const frameRef = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<
    | { mode: "move" | "resize"; corner?: Corner; startX: number; startY: number; startCrop: CropRect }
    | null
  >(null)

  const commit = (next: CropRect) => setCrop(normalize(next, minSize))

  const fracFromEvent = (clientX: number, clientY: number) => {
    const el = frameRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    return {
      fx: clamp((clientX - rect.left) / rect.width, 0, 1),
      fy: clamp((clientY - rect.top) / rect.height, 0, 1),
    }
  }

  // Window listeners are attached once; they early-return unless a drag is live.
  // `commitRef` keeps the handler pointed at the latest committer without
  // re-subscribing on every crop change.
  const commitRef = React.useRef(commit)
  React.useEffect(() => {
    commitRef.current = commit
  })
  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const f = fracFromEvent(e.clientX, e.clientY)
      if (!f) return
      if (d.mode === "move") {
        commitRef.current({
          ...d.startCrop,
          x: d.startCrop.x + (f.fx - d.startX),
          y: d.startCrop.y + (f.fy - d.startY),
        })
      } else {
        const c = d.startCrop
        let l = c.x
        let t = c.y
        let r = c.x + c.width
        let b = c.y + c.height
        if (d.corner === "nw" || d.corner === "sw") l = clamp(f.fx, 0, r - minSize)
        if (d.corner === "ne" || d.corner === "se") r = clamp(f.fx, l + minSize, 1)
        if (d.corner === "nw" || d.corner === "ne") t = clamp(f.fy, 0, b - minSize)
        if (d.corner === "sw" || d.corner === "se") b = clamp(f.fy, t + minSize, 1)
        commitRef.current({ x: l, y: t, width: r - l, height: b - t })
      }
    }
    const onUp = () => {
      drag.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [minSize])

  const beginMove = (e: React.PointerEvent) => {
    const f = fracFromEvent(e.clientX, e.clientY)
    if (!f) return
    drag.current = { mode: "move", startX: f.fx, startY: f.fy, startCrop: crop }
  }
  const beginResize = (e: React.PointerEvent, corner: Corner) => {
    e.stopPropagation()
    const f = fracFromEvent(e.clientX, e.clientY)
    if (!f) return
    drag.current = { mode: "resize", corner, startX: f.fx, startY: f.fy, startCrop: crop }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const resize = e.shiftKey
    let handled = true
    const c = crop
    switch (e.key) {
      case "ArrowLeft":
        commit(resize ? { ...c, width: c.width - step } : { ...c, x: c.x - step })
        break
      case "ArrowRight":
        commit(resize ? { ...c, width: c.width + step } : { ...c, x: c.x + step })
        break
      case "ArrowUp":
        commit(resize ? { ...c, height: c.height - step } : { ...c, y: c.y - step })
        break
      case "ArrowDown":
        commit(resize ? { ...c, height: c.height + step } : { ...c, y: c.y + step })
        break
      default:
        handled = false
    }
    if (handled) e.preventDefault()
  }

  const readout = `Crop ${pct(crop.width)} × ${pct(crop.height)} at ${pct(crop.x)}, ${pct(crop.y)}`
  const boxStyle: React.CSSProperties = {
    left: pct(crop.x),
    top: pct(crop.y),
    width: pct(crop.width),
    height: pct(crop.height),
  }
  const handleCorners: Corner[] = ["nw", "ne", "sw", "se"]
  const cornerPos: Record<Corner, string> = {
    nw: "start-0 top-0 -translate-x-1/2 -translate-y-1/2",
    ne: "end-0 top-0 translate-x-1/2 -translate-y-1/2",
    sw: "start-0 bottom-0 -translate-x-1/2 translate-y-1/2",
    se: "end-0 bottom-0 translate-x-1/2 translate-y-1/2",
  }

  return (
    <div
      data-slot="image-cropper"
      role="group"
      aria-label={label}
      className={cn("flex w-full flex-col gap-2 text-foreground")}
      {...props}
    >
      <div
        ref={frameRef}
        data-slot="image-cropper-frame"
        className={cn(
          "relative w-full overflow-hidden rounded-lg border border-border bg-surface-2 select-none"
        )}
      >
        <img
          data-slot="image-cropper-image"
          src={src}
          alt={alt}
          draggable={false}
          className={cn("pointer-events-none block h-auto w-full")}
        />

        {/* Dimmed exterior: four bands around the crop box. */}
        <div aria-hidden data-slot="image-cropper-shade" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 bg-background/60" style={{ height: pct(crop.y) }} />
          <div
            className="absolute inset-x-0 bottom-0 bg-background/60"
            style={{ height: pct(1 - crop.y - crop.height) }}
          />
          <div
            className="absolute start-0 bg-background/60"
            style={{ top: pct(crop.y), height: pct(crop.height), width: pct(crop.x) }}
          />
          <div
            className="absolute end-0 bg-background/60"
            style={{ top: pct(crop.y), height: pct(crop.height), width: pct(1 - crop.x - crop.width) }}
          />
        </div>

        {/* Crop box: focusable, draggable, arrow-nudgeable. */}
        <div
          data-slot="image-cropper-selection"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuetext={readout}
          aria-valuenow={Math.round(crop.width * crop.height * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={beginMove}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute cursor-move rounded-[3px] outline-none ring-2 ring-primary",
            "focus-visible:ring-[3px] focus-visible:ring-accent-soft"
          )}
          style={boxStyle}
        >
          {/* Rule-of-thirds guides. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 start-1/3 w-px bg-foreground/25" />
            <div className="absolute inset-y-0 start-2/3 w-px bg-foreground/25" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-foreground/25" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-foreground/25" />
          </div>
          {handleCorners.map((corner) => (
            <span
              key={corner}
              data-slot="image-cropper-handle"
              data-corner={corner}
              aria-hidden
              onPointerDown={(e) => beginResize(e, corner)}
              className={cn(
                "absolute size-3 rounded-full border-2 border-background bg-primary",
                cornerPos[corner]
              )}
            />
          ))}
        </div>
      </div>

      <output
        data-slot="image-cropper-readout"
        aria-live="polite"
        className={cn("text-xs font-medium tabular-nums text-muted-foreground")}
      >
        {readout}
      </output>
    </div>
  )
}

export { ImageCropper }
export type { ImageCropperProps }
