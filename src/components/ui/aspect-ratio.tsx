"use client";

import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — AspectRatio (Layout primitive, closed API)
 *
 * Constrains its content to a fixed width-to-height ratio using the modern CSS
 * `aspect-ratio` property. Media placed inside (image / video / iframe) fills
 * the box and is cropped with `object-cover`, so thumbnails, map tiles, and
 * embeds keep a consistent shape across a grid.
 *
 * Polymorphic via `render`; token-only and exposes **no** `className`/`style`.
 * The ratio is chosen from a curated named set (no arbitrary style hatch).
 * See `.agent/rules/API_RULES.md`.
 */

type AspectRatioValue =
  | "square"
  | "video"
  | "portrait"
  | "wide"
  | "ultrawide"
  | "4/3"
  | "3/2"
  | "3/4"
  | "2/1"
  | "golden"

// Literal class map (Tailwind JIT needs whole class names, not interpolations).
const RATIO: Record<AspectRatioValue, string> = {
  square: "aspect-square", // 1 / 1
  video: "aspect-video", // 16 / 9
  portrait: "aspect-[3/4]",
  wide: "aspect-[2/1]",
  ultrawide: "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "3/4": "aspect-[3/4]",
  "2/1": "aspect-[2/1]",
  golden: "aspect-[1.618/1]",
}

type AspectRatioProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Named width-to-height ratio. Default `video` (16 / 9). */
  ratio?: AspectRatioValue
}

function AspectRatio({ render, ratio = "video", ...props }: AspectRatioProps) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "aspect-ratio",
      className: cn(
        "relative w-full overflow-hidden",
        RATIO[ratio],
        // Media children fill the box and crop to the ratio.
        "[&>img]:h-full [&>img]:w-full [&>img]:object-cover",
        "[&>video]:h-full [&>video]:w-full [&>video]:object-cover",
        "[&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
      ),
      ...props,
    },
  })
}

export { AspectRatio }
export type { AspectRatioProps, AspectRatioValue }
