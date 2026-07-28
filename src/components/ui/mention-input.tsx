import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Mention Input (Advanced / Inputs)
 *
 * A multi-line text control that opens a listbox of mentionable entities when the
 * user types the trigger character (default `@`), letting them complete a mention
 * with the keyboard or pointer. It wears the AEGIS Input visual language (the
 * `border-strong` resting outline, the accent border + 3px `accent-soft` focus
 * ring, the sm/md/lg scale) so it sits beside `Textarea` / `Combobox`, and the
 * suggestion surface mirrors `Menu` / `Combobox` (the `popover` token, the
 * `border-strong` ring).
 *
 * Interaction is self-contained (Base UI's Combobox anchors to its own input, not
 * to a caret inside a textarea): as you type `@query`, the active token under the
 * caret drives an ARIA `listbox` (`aria-autocomplete="list"`,
 * `aria-activedescendant`); ArrowUp/Down move the highlight, Enter/Tab complete,
 * Escape dismisses. Completing replaces the `@query` token with the mention text
 * (default `@label `) and fires `onMention`.
 *
 * SCOPE: the suggestion popup anchors below the field (caret-pixel following is
 * deferred — an additive layer), and mentions are plain text tokens rather than
 * atomic chips, consistent with the honestly-scoped precedents. Public API is
 * CLOSED — no `className` / `style`; treatment is the semantic `size` prop and
 * layout belongs in `Box` / `Stack`. Tokens only. See `.agent/rules/API_RULES.md`.
 */

type MentionOption = {
  /** Stable identifier, emitted to `onMention`. */
  id: string
  /** Text shown in the listbox and (by default) inserted after the trigger. */
  label: string
  /** Optional secondary line shown under the label. */
  description?: React.ReactNode
}

type MentionInputSize = "sm" | "md" | "lg"

type MentionInputProps = Omit<
  React.ComponentProps<"textarea">,
  "className" | "style" | "size" | "value" | "defaultValue" | "onChange"
> & {
  /** Mentionable entities offered when the trigger token is active. */
  options: MentionOption[]
  /** Controlled text value. */
  value?: string
  /** Initial text value (uncontrolled). */
  defaultValue?: string
  /** Fires with the full text whenever it changes. */
  onValueChange?: (value: string) => void
  /** Fires when a mention is completed. */
  onMention?: (option: MentionOption) => void
  /** The visible label. */
  label?: React.ReactNode
  /** The character that opens the suggestion list. Default "@". */
  trigger?: string
  /** Control height / type scale. Default "md". */
  size?: MentionInputSize
  /** Filter options against the active query. Default: label/id contains query. */
  filter?: (option: MentionOption, query: string) => boolean
  /** Build the inserted text for a completed mention. Default `@label ` (with trailing space). */
  mentionText?: (option: MentionOption, trigger: string) => string
  /** Shown in the list when no option matches. Default "No matches". */
  emptyMessage?: React.ReactNode
  /** Visible textarea rows. Default 3. */
  rows?: number
}

const shellSize: Record<MentionInputSize, string> = {
  sm: "min-h-16 rounded-[8px] px-3 py-2 text-xs",
  md: "min-h-20 rounded-[9px] px-3.5 py-2.5 text-sm",
  lg: "min-h-28 rounded-[11px] px-4 py-3 text-base",
}

const defaultFilter = (o: MentionOption, q: string) => {
  const needle = q.toLowerCase()
  return (
    o.label.toLowerCase().includes(needle) || o.id.toLowerCase().includes(needle)
  )
}

const defaultMentionText = (o: MentionOption, trigger: string) =>
  `${trigger}${o.label} `

/** Find the trigger token under the caret: a trigger char at a word boundary with
 *  no whitespace between it and the caret. Returns its start index + the query. */
function activeToken(
  value: string,
  caret: number,
  trigger: string
): { start: number; query: string } | null {
  let i = caret - 1
  while (i >= 0) {
    const ch = value[i]
    if (ch === trigger) {
      const before = i === 0 ? "" : value[i - 1]
      if (i === 0 || /\s/.test(before)) {
        return { start: i, query: value.slice(i + 1, caret) }
      }
      return null
    }
    if (/\s/.test(ch)) return null
    i--
  }
  return null
}

function MentionInput({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onMention,
  label,
  trigger = "@",
  size = "md",
  filter = defaultFilter,
  mentionText = defaultMentionText,
  emptyMessage = "No matches",
  rows = 3,
  disabled,
  id: idProp,
  ...textareaProps
}: MentionInputProps) {
  const reactId = React.useId()
  const id = idProp ?? `${reactId}-mention`
  const listId = `${reactId}-mention-list`
  const optionId = (i: number) => `${reactId}-mention-opt-${i}`

  const ref = React.useRef<HTMLTextAreaElement>(null)
  const isControlled = valueProp !== undefined
  const [inner, setInner] = React.useState(defaultValue)
  const value = isControlled ? valueProp : inner

  const [token, setToken] = React.useState<{ start: number; query: string } | null>(null)
  const [active, setActive] = React.useState(0)
  const caretTarget = React.useRef<number | null>(null)

  const matches = React.useMemo(() => {
    if (!token) return []
    return options.filter((o) => filter(o, token.query))
  }, [options, token, filter])

  const open = token !== null

  // Apply a pending caret position after a programmatic value change.
  React.useEffect(() => {
    if (caretTarget.current != null && ref.current) {
      const pos = caretTarget.current
      caretTarget.current = null
      ref.current.setSelectionRange(pos, pos)
    }
  })

  const commitValue = (next: string) => {
    if (!isControlled) setInner(next)
    onValueChange?.(next)
  }

  const syncToken = (el: HTMLTextAreaElement) => {
    const caret = el.selectionStart ?? el.value.length
    const t = activeToken(el.value, caret, trigger)
    setToken(t)
    setActive(0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    commitValue(e.target.value)
    syncToken(e.target)
  }

  const selectOption = (o: MentionOption) => {
    const el = ref.current
    if (!el || !token) return
    const caret = el.selectionStart ?? value.length
    const inserted = mentionText(o, trigger)
    const next = value.slice(0, token.start) + inserted + value.slice(caret)
    caretTarget.current = token.start + inserted.length
    commitValue(next)
    setToken(null)
    onMention?.(o)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || matches.length === 0) {
      if (open && e.key === "Escape") {
        e.preventDefault()
        setToken(null)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % matches.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + matches.length) % matches.length)
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      selectOption(matches[Math.min(active, matches.length - 1)])
    } else if (e.key === "Escape") {
      e.preventDefault()
      setToken(null)
    }
  }

  const activeDescendant = open && matches.length > 0 ? optionId(Math.min(active, matches.length - 1)) : undefined

  return (
    <div data-slot="mention-input" className={cn("relative flex w-full flex-col gap-1.5")}>
      {label != null ? (
        <label
          data-slot="mention-input-label"
          htmlFor={id}
          className={cn("text-sm font-medium text-foreground")}
        >
          {label}
        </label>
      ) : null}

      <textarea
        {...textareaProps}
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => syncToken(e.currentTarget)}
        onKeyUp={(e) => {
          // keep the token in sync when the caret moves via arrows/home/end
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            syncToken(e.currentTarget)
          }
        }}
        role="textbox"
        aria-multiline="true"
        aria-autocomplete="list"
        aria-expanded={open || undefined}
        aria-controls={open && matches.length > 0 ? listId : undefined}
        aria-activedescendant={activeDescendant}
        data-slot="mention-input-control"
        className={cn(
          "field-sizing-content w-full resize-y border border-border-strong bg-surface-2 bg-clip-padding font-medium text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-150",
          "placeholder:text-muted-foreground",
          "hover:border-accent-strong",
          "focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-[3px] focus-visible:ring-accent-soft",
          "disabled:pointer-events-none disabled:resize-none disabled:cursor-not-allowed disabled:opacity-50",
          shellSize[size]
        )}
      />

      {open ? (
        <div
          data-slot="mention-input-popup"
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-elevated ring-1 ring-border-strong"
          )}
        >
          {matches.length > 0 ? (
            <ul id={listId} role="listbox" data-slot="mention-input-list" aria-label="Mentions">
              {matches.map((o, i) => {
                const isActive = i === Math.min(active, matches.length - 1)
                return (
                  <li
                    key={o.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isActive}
                    data-slot="mention-input-option"
                    data-active={isActive || undefined}
                    // Use pointer-down (not click) so the textarea keeps focus.
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectOption(o)
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex cursor-default select-none flex-col rounded-md px-2 py-1.5 outline-none transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-popover-foreground"
                    )}
                  >
                    <span className="truncate font-medium">
                      {trigger}
                      {o.label}
                    </span>
                    {o.description != null ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {o.description}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div
              data-slot="mention-input-empty"
              className={cn("px-2 py-6 text-center text-sm text-muted-foreground")}
            >
              {emptyMessage}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { MentionInput }
export type { MentionInputProps, MentionOption }
