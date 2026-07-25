import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Currency Input
 *
 * A numeric money field. It edits as a plain number and, on blur, reformats to
 * a grouped amount (e.g. `1,234.50`) with a leading currency symbol; on focus it
 * returns to the raw number so editing never fights a caret-jumping mask. The
 * committed value is a real `number` (or `null` when empty), exposed via
 * `onValueChange`. Grouping and the decimal mark are deterministic props, so the
 * field behaves identically across environments.
 *
 * Sibling of the other inputs (Text Field, Number Input, …): it wears the AEGIS
 * Input shell (resting `border-strong`, `accent-strong` hover border, 3px
 * `accent-soft` focus-within ring, 32 / 40 / 48px size scale) with a leading
 * symbol adornment and an optional trailing unit.
 *
 * Scope: this covers the currency case of the "Currency / Masked Input" slot.
 * A general-purpose mask engine (phone, card, arbitrary patterns) is a separate,
 * larger primitive and is intentionally not bundled here — see
 * `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop and all colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const shellVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "focus-within:border-accent-strong focus-within:ring-3 focus-within:ring-accent-soft",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive/30"
  ),
  {
    variants: {
      size: {
        sm: "h-8 text-[0.8rem]",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const adornmentVariants = cva(
  "flex shrink-0 items-center justify-center px-2.5 text-muted-foreground select-none",
  {
    variants: {
      size: {
        sm: "text-[0.8rem]",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

type CurrencyInputProps = VariantProps<typeof shellVariants> & {
  /** Controlled numeric value (`null` = empty). Pair with `onValueChange`. */
  value?: number | null
  /** Uncontrolled initial numeric value. */
  defaultValue?: number | null
  /** Fired with the parsed number (or `null`) as the field is edited. */
  onValueChange?: (value: number | null) => void
  /** Leading currency symbol adornment. Default: `"$"`. */
  symbol?: React.ReactNode
  /** Optional trailing unit adornment (e.g. a currency code like `"USD"`). */
  suffix?: React.ReactNode
  /** Fraction digits shown when formatted. Default: `2`. */
  decimals?: number
  /** Thousands group separator. Default: `","`. */
  groupSeparator?: string
  /** Decimal mark. Default: `"."`. */
  decimalSeparator?: string
  /** Clamp the committed value to at least this on blur. */
  min?: number
  /** Clamp the committed value to at most this on blur. */
  max?: number
  /** Visible label above the control. */
  label?: React.ReactNode
  /** Helper text below the control. */
  description?: React.ReactNode
  /** Validation message; shown whenever present. Also paints the error state. */
  error?: React.ReactNode
  /** Placeholder shown when the field is empty. */
  placeholder?: string
  /** Disable the field. */
  disabled?: boolean
  /** Mark the field required. */
  required?: boolean
  /** Form field name — emits a hidden input carrying the numeric value. */
  name?: string
  /** Field id; also links the label to the input. */
  id?: string
}

function CurrencyInput({
  size = "md",
  value,
  defaultValue,
  onValueChange,
  symbol = "$",
  suffix,
  decimals = 2,
  groupSeparator = ",",
  decimalSeparator = ".",
  min,
  max,
  label,
  description,
  error,
  placeholder,
  disabled = false,
  required = false,
  name,
  id,
}: CurrencyInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const descId = `${fieldId}-desc`
  const invalid = error != null

  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<number | null>(
    defaultValue ?? null
  )
  const current = isControlled ? (value ?? null) : internal

  const [focused, setFocused] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  const format = (n: number): string => {
    const fixed = Math.abs(n).toFixed(Math.max(0, decimals))
    const [intPart, fracPart] = fixed.split(".")
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)
    const sign = n < 0 ? "-" : ""
    return decimals > 0
      ? `${sign}${grouped}${decimalSeparator}${fracPart}`
      : `${sign}${grouped}`
  }

  const toEditable = (n: number | null): string =>
    n == null ? "" : String(n).replace(".", decimalSeparator)

  const parse = (raw: string): number | null => {
    if (raw.trim() === "") return null
    const cleaned = raw
      .split(escapeRegExp(groupSeparator))
      .join("")
      .replace(escapeRegExp(decimalSeparator), ".")
      .replace(/[^0-9.-]/g, "")
    const n = Number.parseFloat(cleaned)
    return Number.isFinite(n) ? n : null
  }

  const sanitize = (raw: string): string => {
    let out = ""
    let seenDot = false
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i]
      if (ch >= "0" && ch <= "9") out += ch
      else if (ch === decimalSeparator && !seenDot && decimals > 0) {
        out += ch
        seenDot = true
      } else if (ch === "-" && i === 0) out += ch
    }
    return out
  }

  const commit = (next: number | null) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  const clamp = (n: number | null): number | null => {
    if (n == null) return null
    let result = n
    if (min != null && result < min) result = min
    if (max != null && result > max) result = max
    return result
  }

  const displayed = focused
    ? draft
    : current == null
      ? ""
      : format(current)

  const handleFocus = () => {
    setDraft(toEditable(current))
    setFocused(true)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitize(event.target.value)
    setDraft(raw)
    commit(parse(raw))
  }

  const handleBlur = () => {
    const next = clamp(parse(draft))
    commit(next)
    setFocused(false)
  }

  return (
    <div data-slot="currency-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div
        data-slot="currency-input-shell"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(shellVariants({ size }))}
      >
        {symbol != null && (
          <span
            data-slot="currency-input-symbol"
            className={cn(adornmentVariants({ size }), "border-r border-border")}
          >
            {symbol}
          </span>
        )}

        <input
          id={fieldId}
          type="text"
          inputMode="decimal"
          value={displayed}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={description != null || invalid ? descId : undefined}
          data-slot="currency-input-control"
          className={cn(
            "w-full min-w-0 flex-1 bg-transparent px-2.5 text-right tabular-nums outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed"
          )}
        />

        {suffix != null && (
          <span
            data-slot="currency-input-suffix"
            className={cn(adornmentVariants({ size }), "border-l border-border")}
          >
            {suffix}
          </span>
        )}

        {name != null && (
          <input type="hidden" name={name} value={current ?? ""} />
        )}
      </div>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="currency-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="currency-input-error"
          className="text-destructive text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { CurrencyInput, shellVariants as currencyInputShellVariants }
export type { CurrencyInputProps }
