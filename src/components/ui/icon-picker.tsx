"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/ui/search-input"

/**
 * AEGIS — Icon Picker
 *
 * A searchable GRID of glyphs with a live preview at the size the glyph will be
 * used. Three curator surfaces ask for one — a workflow template, a category, a
 * saved profile — and the catalog had no component for it: `Select` and
 * `Combobox` are text lists, and a curator picking an icon is choosing a
 * picture, so a list of its names is the wrong control.
 *
 * The glyph SET is data, not part of the component: the library ships no icons
 * of its own, and hard-coding one vendor's set here would make the picker
 * unusable for an app that draws from another. Pass `icons` — each entry is a
 * stable `name`, the rendered `glyph`, and optional `keywords` the search also
 * matches, so "shield" can find `ShieldCheck`.
 *
 * A real `radiogroup`: one tab stop, arrow keys between glyphs, `aria-checked`
 * on the selected cell — the same semantics a list of names would have had.
 *
 * Public API is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type IconPickerIcon = {
  /** Stable identifier — what `value` holds and `onValueChange` reports. */
  name: string
  /** The rendered glyph. */
  glyph: React.ReactNode
  /** Extra words the search matches, beyond `name`. */
  keywords?: string[]
}

type IconPickerProps = Omit<
  React.ComponentProps<"div">,
  // `value` / `defaultValue` here name an ICON, not a form value, and the
  // div's natives are `string | string[] | number`; left in they intersect and
  // no caller can satisfy both. Same root cause as DS-004 and DS-027.
  "className" | "style" | "children" | "onChange" | "value" | "defaultValue"
> & {
  /** The glyphs to choose from. */
  icons: IconPickerIcon[]
  /** Accessible name for the group (e.g. "Template icon"). Required. */
  label: string
  /** Controlled selection — an icon `name`. */
  value?: string | null
  /** Uncontrolled initial selection. */
  defaultValue?: string | null
  /** Fires with the chosen icon's `name`. */
  onValueChange?: (name: string) => void
  /** Placeholder for the search field. Default `"Search icons"`. */
  searchPlaceholder?: string
  /** Shown when the search matches nothing. Default `"No icons match that search."`. */
  emptyMessage?: React.ReactNode
  /**
   * Size of the live preview in px — set it to the size the glyph will actually
   * be USED at, which is the whole point of previewing it. Default `40`.
   */
  previewSize?: number
  /** Hide the preview (for a picker beside something that already shows one). */
  showPreview?: boolean
  /** Rows of glyphs visible before the grid scrolls. Default `4`. */
  visibleRows?: number
}

function IconPicker({
  icons,
  label,
  value,
  defaultValue = null,
  onValueChange,
  searchPlaceholder = "Search icons",
  emptyMessage = "No icons match that search.",
  previewSize = 40,
  showPreview = true,
  visibleRows = 4,
  ...props
}: IconPickerProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(defaultValue)
  const selected = value !== undefined ? value : uncontrolled
  const [query, setQuery] = React.useState("")

  const select = (name: string) => {
    if (value === undefined) setUncontrolled(name)
    onValueChange?.(name)
  }

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return icons
    return icons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(q) ||
        icon.keywords?.some((k) => k.toLowerCase().includes(q))
    )
  }, [icons, query])

  const preview = icons.find((icon) => icon.name === selected) ?? null

  // Roving focus across the grid. `selected` is the tab stop when it is in the
  // filtered set; otherwise the first match is, so the grid is always reachable.
  const focusName =
    matches.find((icon) => icon.name === selected)?.name ?? matches[0]?.name

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"]
    if (!keys.includes(event.key)) return
    const index = matches.findIndex((icon) => icon.name === focusName)
    if (index < 0) return
    // The grid is `auto-fill`, so the column count is not known here; arrow
    // up/down move by a nominal row of 8, which is the widest the grid gets at
    // its 40px track and typical panel width.
    const ROW = 8
    const next =
      event.key === "ArrowRight"
        ? index + 1
        : event.key === "ArrowLeft"
          ? index - 1
          : event.key === "ArrowDown"
            ? index + ROW
            : event.key === "ArrowUp"
              ? index - ROW
              : event.key === "Home"
                ? 0
                : matches.length - 1
    const clamped = Math.min(matches.length - 1, Math.max(0, next))
    event.preventDefault()
    select(matches[clamped].name)
  }

  return (
    <div
      data-slot="icon-picker"
      role="group"
      aria-label={label}
      className={cn("flex w-full min-w-0 flex-col gap-3")}
      {...props}
    >
      <div className="flex items-center gap-3">
        {showPreview ? (
          <span
            data-slot="icon-picker-preview"
            aria-hidden
            // The preview's size IS the point of the preview: it shows the
            // glyph at the size it will be used, which no fixed rung can know.
            style={{ width: previewSize, height: previewSize }}
            className={cn(
              "bg-surface-2 text-foreground flex shrink-0 items-center justify-center rounded-xl",
              "[&_svg]:size-[55%]"
            )}
          >
            {preview?.glyph ?? null}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <SearchInput
            size="sm"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {matches.length === 0 ? (
        <p
          data-slot="icon-picker-empty"
          className="text-muted-foreground py-6 text-center text-sm"
        >
          {emptyMessage}
        </p>
      ) : (
        <div
          data-slot="icon-picker-grid"
          role="radiogroup"
          aria-label={label}
          onKeyDown={onKeyDown}
          style={{ maxHeight: visibleRows * 44 }}
          className={cn(
            "grid gap-1.5 overflow-y-auto",
            "[grid-template-columns:repeat(auto-fill,minmax(40px,1fr))]"
          )}
        >
          {matches.map((icon) => {
            const isSelected = icon.name === selected
            return (
              <button
                key={icon.name}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={icon.name}
                tabIndex={icon.name === focusName ? 0 : -1}
                data-slot="icon-picker-item"
                data-icon={icon.name}
                onClick={() => select(icon.name)}
                className={cn(
                  "flex aspect-square cursor-pointer items-center justify-center rounded-lg border outline-none transition-colors",
                  "focus-visible:ring-3 focus-visible:ring-accent-soft",
                  "[&_svg]:size-[18px]",
                  isSelected
                    ? "border-accent-strong/35 bg-accent-soft text-accent-strong"
                    : "border-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {icon.glyph}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { IconPicker }
export type { IconPickerProps, IconPickerIcon }
