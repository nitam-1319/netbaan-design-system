import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — AI Suggestion Chips
 *
 * A wrapping row of tappable prompt starters / quick replies for a
 * conversational surface ("Summarise findings", "Show critical assets", …).
 * Each chip is the interactive sibling of `Tag`: same compact chip silhouette,
 * but a real `<button>` that fires `onSelect`, with the AEGIS control focus ring.
 *
 * Use it config-driven (`items` + `onSelect`) for the common case, or compose
 * `SuggestionChip` children directly. The container is a labelled `group`; chips
 * inherit its `size` unless a chip overrides it.
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop and all colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const chipVariants = cva(
  cn(
    "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-border bg-background font-medium whitespace-nowrap text-foreground transition-colors outline-none",
    "hover:border-strong hover:bg-muted hover:text-foreground",
    "focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5"
  ),
  {
    variants: {
      size: {
        sm: "gap-0.5 px-2 py-0.5 text-[0.7rem]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-[0.8rem]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type ChipSize = NonNullable<VariantProps<typeof chipVariants>["size"]>

const SuggestionChipsContext = React.createContext<ChipSize>("md")

type SuggestionChipProps = Omit<
  React.ComponentProps<"button">,
  "className" | "style"
> &
  VariantProps<typeof chipVariants> & {
    /** Optional leading icon (decorative). */
    icon?: React.ReactNode
  }

function SuggestionChip({
  size,
  icon,
  type = "button",
  children,
  ...props
}: SuggestionChipProps) {
  const inheritedSize = React.useContext(SuggestionChipsContext)
  const resolvedSize = size ?? inheritedSize
  return (
    <button
      type={type}
      data-slot="suggestion-chip"
      className={cn(chipVariants({ size: resolvedSize }))}
      {...props}
    >
      {icon != null && (
        <span data-slot="suggestion-chip-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}

type SuggestionItem = {
  /** Visible chip content. */
  label: React.ReactNode
  /** Value passed to `onSelect`; defaults to `label` when it is a string. */
  value?: string
  /** Optional leading icon. */
  icon?: React.ReactNode
  /** Disable this chip. */
  disabled?: boolean
}

type SuggestionChipsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof chipVariants> & {
    /** Accessible name for the group. Default "Suggestions". */
    label?: string
    /** Config-driven chips. Omit to compose `SuggestionChip` children instead. */
    items?: SuggestionItem[]
    /** Fired with a chip's value and index when it is chosen. */
    onSelect?: (value: string, index: number) => void
    /** Disable every chip. */
    disabled?: boolean
    /** Chips (used when `items` is not provided). */
    children?: React.ReactNode
  }

function SuggestionChips({
  size = "md",
  label = "Suggestions",
  items,
  onSelect,
  disabled = false,
  children,
  ...props
}: SuggestionChipsProps) {
  return (
    <SuggestionChipsContext.Provider value={size ?? "md"}>
      <div
        role="group"
        aria-label={label}
        data-slot="suggestion-chips"
        className={cn("flex flex-wrap items-center gap-2")}
        {...props}
      >
        {items
          ? items.map((item, index) => {
              const value =
                item.value ??
                (typeof item.label === "string" ? item.label : String(index))
              return (
                <SuggestionChip
                  key={value + index}
                  icon={item.icon}
                  disabled={disabled || item.disabled}
                  onClick={() => onSelect?.(value, index)}
                >
                  {item.label}
                </SuggestionChip>
              )
            })
          : children}
      </div>
    </SuggestionChipsContext.Provider>
  )
}

export {
  SuggestionChips,
  SuggestionChip,
  chipVariants as suggestionChipVariants,
}
export type { SuggestionChipsProps, SuggestionChipProps, SuggestionItem }
