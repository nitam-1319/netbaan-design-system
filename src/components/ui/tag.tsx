"use client"

import { useRender } from "@base-ui/react/use-render"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Tag / Chip (restored to reference)
 *
 * The chip from `.agent/references/spec/Chip.dc.html` (Tag == Chip): the
 * sm/md/lg size scale (22/28/34px tall, default md), a `chip-pop` entrance, a
 * resting ↔ `selected` accent treatment, and an optional first-class dismiss
 * button. Renders a `<span>` by default and composes with any element via
 * `render` (Base UI `useRender`). Closed API — no `className` / `style`;
 * dismissal is a semantic prop, not a styling hatch. Tokens only.
 * See `.agent/rules/API_RULES.md`.
 */

const tagVariants = cva(
  "group/tag inline-flex w-fit shrink-0 animate-chip-pop items-center gap-[7px] border font-sans leading-[1.2] font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 outline-none select-none focus-visible:border-accent-strong focus-visible:ring-[3px] focus-visible:ring-accent-soft [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "rounded-[7px] px-[9px] py-[3px] text-[11px] [&_svg]:size-3",
        md: "rounded-lg px-3 py-[5px] text-[12.5px] [&_svg]:size-3.5",
        lg: "rounded-[9px] px-[15px] py-[7px] text-[13.5px] [&_svg]:size-4",
      },
      /**
       * `rounded` (default) is the reference chip radius. `pill` is the fully
       * rounded filter chip — a chip that is a FILTER rather than a label, so
       * the two read differently in a row that contains both.
       */
      shape: {
        rounded: "",
        pill: "rounded-full",
      },
      selected: {
        true: "border-accent-strong/35 bg-accent-soft text-accent-strong",
        false:
          "border-border-strong bg-surface-3 text-muted-foreground hover:border-accent-strong hover:text-foreground",
      },
    },
    defaultVariants: { size: "md", shape: "rounded", selected: false },
  }
)

/** Dismiss-button diameter per size. */
const REMOVE_SIZE: Record<string, string> = {
  sm: "size-4",
  md: "size-[18px]",
  lg: "size-5",
}

type TagProps = Omit<
  useRender.ComponentProps<"span">,
  "className" | "style" | "children"
> &
  VariantProps<typeof tagVariants> & {
    children?: React.ReactNode
    /** Show a trailing dismiss button and fire this when it is activated. */
    onRemove?: () => void
    /** Accessible label for the dismiss button. */
    removeLabel?: string
    /** Dim the tag and disable its dismiss affordance. */
    disabled?: boolean
    /**
     * A trailing count, set in the mono face and dimmed against the label — the
     * "Hosts 4" filter chip. It is rendered inside the tag so it is part of the
     * accessible name, which is what a screen-reader user needs to hear.
     */
    count?: React.ReactNode
  }

function Tag({
  size = "md",
  shape = "rounded",
  selected = false,
  count,
  onRemove,
  removeLabel = "Remove",
  disabled = false,
  render = <span />,
  children,
  ...props
}: TagProps) {
  const sizeKey = (size ?? "md") as string

  return useRender({
    render,
    props: {
      "data-slot": "tag",
      "data-selected": selected || undefined,
      "data-disabled": disabled || undefined,
      "aria-disabled": disabled || undefined,
      className: cn(
        tagVariants({ size, shape, selected }),
        disabled && "pointer-events-none opacity-45"
      ),
      ...props,
      children: (
        <>
          {children}
          {count !== undefined && count !== null ? (
            <span
              data-slot="tag-count"
              className={cn(
                "font-mono tabular-nums",
                selected ? "text-accent-strong" : "text-muted-foreground"
              )}
            >
              {count}
            </span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              data-slot="tag-remove"
              aria-label={removeLabel}
              disabled={disabled}
              onClick={onRemove}
              className={cn(
                "ms-[1px] -me-1 inline-flex shrink-0 items-center justify-center rounded-full transition-[filter,background-color] outline-none hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-accent-soft disabled:pointer-events-none",
                REMOVE_SIZE[sizeKey],
                selected
                  ? "bg-accent-strong/20 text-accent-strong"
                  : "bg-[var(--track)] text-muted-foreground"
              )}
            >
              <X className="size-[60%]" strokeWidth={2.75} aria-hidden />
            </button>
          ) : null}
        </>
      ),
    },
  })
}

export { Tag, tagVariants }
export type { TagProps }
