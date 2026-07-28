import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Search Input
 *
 * A single-line search field with a leading search glyph and an optional
 * trailing clear button that appears once the field has a value. Sibling to
 * `PasswordInput` / `NumberInput`: it shares the AEGIS Input shell (resting
 * `border-strong`, `accent-strong` hover border, 3px `accent-soft` focus ring,
 * 32 / 40 / 48px size scale) so search fields sit consistently beside other
 * inputs. An optional `label`, `description`, and `error` render around the
 * control (associated for assistive tech).
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop. See `.agent/rules/API_RULES.md` and the AEGIS Input reference.
 */

const shellVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-accent-soft",
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
  "flex shrink-0 items-center justify-center text-muted-foreground select-none",
  {
    variants: {
      size: {
        sm: "w-7 [&_svg]:size-3.5",
        md: "w-9 [&_svg]:size-4",
        lg: "w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const clearVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center text-muted-foreground transition-colors select-none",
    "hover:text-foreground",
    "outline-none focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-40"
  ),
  {
    variants: {
      size: {
        sm: "w-7 [&_svg]:size-3.5",
        md: "w-9 [&_svg]:size-4",
        lg: "w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "className" | "style" | "size" | "type"
> &
  VariantProps<typeof shellVariants> & {
    /** Visible label above the control. */
    label?: React.ReactNode
    /** Helper text below the control. */
    description?: React.ReactNode
    /** Validation message; shown whenever present. Also paints the error state. */
    error?: React.ReactNode
    /** Hide the trailing clear button. */
    hideClear?: boolean
    /** Called after the field is cleared via the clear button. */
    onClear?: () => void
  }

function SearchInput({
  size = "md",
  label,
  description,
  error,
  hideClear = false,
  onClear,
  id,
  disabled,
  value,
  defaultValue,
  onChange,
  placeholder = "Search…",
  ...input
}: SearchInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const descId = `${fieldId}-desc`
  const inputRef = React.useRef<HTMLInputElement>(null)
  const invalid = error != null

  // Controlled clear-button visibility derives from `value`; uncontrolled
  // tracks its own state. No effect needed (avoids state-sync-in-effect).
  const isControlled = value != null
  const [uncontrolledHasValue, setUncontrolledHasValue] = React.useState(
    defaultValue != null && String(defaultValue).length > 0
  )
  const hasValue = isControlled
    ? String(value).length > 0
    : uncontrolledHasValue

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledHasValue(event.target.value.length > 0)
    onChange?.(event)
  }

  const handleClear = () => {
    const el = inputRef.current
    if (el) {
      // Native value setter so React's onChange fires for controlled inputs too.
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set
      setter?.call(el, "")
      el.dispatchEvent(new Event("input", { bubbles: true }))
      el.focus()
    }
    if (!isControlled) setUncontrolledHasValue(false)
    onClear?.()
  }

  const showClear = !hideClear && hasValue && !disabled

  return (
    <div data-slot="search-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div
        data-slot="search-input-shell"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(shellVariants({ size }))}
      >
        <span data-slot="search-input-icon" className={cn(adornmentVariants({ size }))}>
          <Search aria-hidden="true" />
        </span>

        <input
          ref={inputRef}
          id={fieldId}
          type="search"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={description != null || invalid ? descId : undefined}
          data-slot="search-input-control"
          className={cn(
            "w-full min-w-0 flex-1 bg-transparent outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
            // Hide the native WebKit search decorations; AEGIS supplies its own.
            "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          )}
          {...input}
        />

        {showClear && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear search"
            onClick={handleClear}
            data-slot="search-input-clear"
            className={cn(clearVariants({ size }))}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="search-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="search-input-error"
          className="text-destructive-ink text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { SearchInput, shellVariants as searchInputShellVariants }
export type { SearchInputProps }
