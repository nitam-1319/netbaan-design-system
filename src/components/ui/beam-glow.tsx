import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Beam / Glow Effect (Motion, closed API)
 *
 * The system's signature **accent beam** — the rotating conic-gradient edge that
 * makes the Primary `Button` and `FloatingActionButton` read as lit-from-within —
 * extracted as a reusable decorative frame. Wrap any content to give it the same
 * animated beam border (a spinning conic gradient clipped to a thin ring by an
 * inset surface mask), optionally over a diffuse accent `glow` (`shadow-bloom`).
 *
 *   <BeamGlow glow>
 *     <Stack gap="2"><Text>Upgrade to Pro</Text>…</Stack>
 *   </BeamGlow>
 *
 * The frame owns a real surface (the inset mask), so the beam always reads as a
 * border regardless of what's inside. It is purely decorative: the beam layers
 * are `aria-hidden`, and the spin honours `prefers-reduced-motion` (the ring
 * stays but stops rotating). Motion tokens (`animate-beam-spin` /
 * `animate-beam-spin-fast`, `shadow-bloom`) are the single source of the timing
 * and colour — nothing is hard-coded.
 *
 * Public API is CLOSED: no `className` / `style`. Shape is the semantic `radius`,
 * padding is `size`, motion is `speed` / `active`. Element polymorphism is
 * available through `render`. See `.agent/rules/API_RULES.md` and
 * `.agent/rules/REFERENCE_FIDELITY.md` (signature motifs).
 */

const beamGlowVariants = cva(
  "relative isolate [--beam-w:1.5px] rounded-[var(--beam-r)]",
  {
    variants: {
      radius: {
        sm: "[--beam-r:0.625rem]",
        md: "[--beam-r:0.875rem]",
        lg: "[--beam-r:1.25rem]",
        full: "[--beam-r:9999px]",
      },
      glow: {
        true: "shadow-bloom",
        false: "",
      },
    },
    defaultVariants: {
      radius: "md",
      glow: false,
    },
  }
)

const beamGlowContentVariants = cva(
  "relative rounded-[calc(var(--beam-r)-var(--beam-w))]",
  {
    variants: {
      size: {
        none: "",
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type BeamGlowProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof beamGlowVariants> &
  VariantProps<typeof beamGlowContentVariants> & {
    /** Rotation speed of the beam. Default `"default"`. */
    speed?: "default" | "fast"
    /** Animate the beam. When `false`, the ring is shown but static. Default `true`. */
    active?: boolean
  }

function BeamGlow({
  radius = "md",
  glow = false,
  size = "md",
  speed = "default",
  active = true,
  render,
  children,
  ...props
}: BeamGlowProps) {
  const spin = active
    ? speed === "fast"
      ? "animate-beam-spin-fast"
      : "animate-beam-spin"
    : ""

  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "beam-glow",
      className: cn(beamGlowVariants({ radius, glow })),
      children: (
        <>
          {/* Signature accent beam — a conic gradient clipped to the frame. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          >
            <span
              className={cn(
                "absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2",
                "bg-[conic-gradient(from_0deg,transparent_0_68%,var(--primary)_84%,var(--accent-strong)_92%,transparent_100%)]",
                "motion-reduce:animate-none",
                spin
              )}
            />
          </span>
          {/* Inset surface mask — leaves only the beam-width ring visible. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[var(--beam-w)] -z-10 rounded-[calc(var(--beam-r)-var(--beam-w))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_10%,var(--surface-2)),var(--surface-2))]"
          />
          <div
            data-slot="beam-glow-content"
            className={cn(beamGlowContentVariants({ size }))}
          >
            {children}
          </div>
        </>
      ),
      ...props,
    },
  })
}

export { BeamGlow, beamGlowVariants }
export type { BeamGlowProps }
