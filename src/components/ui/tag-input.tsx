"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"

/**
 * AEGIS — Tag Input
 *
 * A field for entering a set of short tokens — labels, keywords, recipients,
 * filters. Committed values render as removable `Tag` chips inside an AEGIS
 * Input shell, with a bare text input trailing them for the next entry. It is a
 * sibling of the other inputs (Text Field, Search Input, …) and wears the same
 * shell (resting `border-strong`, `accent-strong` hover border, 3px
 * `accent-soft` focus-within ring, 32 / 40 / 48px size scale), but grows in
 * height as tags wrap onto new rows.
 *
 * Type and press one of the commit keys (Enter by default) to add a tag;
 * Backspace on an empty input removes the last tag; each chip has its own
 * remove affordance. Controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`) are both supported, and a `name` emits hidden inputs so the
 * set posts with a native form.
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop and all colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const shellVariants = cva(
  cn(
    "flex w-full flex-wrap items-center gap-1.5 rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "hover:border-accent-strong",
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-accent-soft",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive/30"
  ),
  {
    variants: {
      size: {
        sm: "min-h-8 px-1.5 py-1 text-xs",
        md: "min-h-10 px-2 py-1.5 text-sm",
        lg: "min-h-12 px-2.5 py-2 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const TAG_SIZE = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const

type TagInputProps = VariantProps<typeof shellVariants> & {
  /** Controlled list of tags. Pair with `onValueChange`. */
  value?: string[]
  /** Uncontrolled initial list of tags. */
  defaultValue?: string[]
  /** Fired with the next list whenever a tag is added or removed. */
  onValueChange?: (value: string[]) => void
  /** Visible label above the control. */
  label?: React.ReactNode
  /** Helper text below the control. */
  description?: React.ReactNode
  /** Validation message; shown whenever present. Also paints the error state. */
  error?: React.ReactNode
  /** Placeholder for the trailing text input (shown when there are no tags). */
  placeholder?: string
  /** Disable the field and every remove affordance. */
  disabled?: boolean
  /** Mark the field required (applies to the trailing input). */
  required?: boolean
  /** Keys that commit the current input as a tag. Default: `["Enter"]`. */
  addKeys?: string[]
  /** Also commit the current input when the field loses focus. */
  addOnBlur?: boolean
  /** Allow the same tag value more than once. Default: `false`. */
  allowDuplicates?: boolean
  /** Cap the number of tags. Further additions are ignored once reached. */
  maxTags?: number
  /** Form field name — emits a hidden input per tag for native submission. */
  name?: string
  /** Field id; also links the label to the trailing input. */
  id?: string
}

function TagInput({
  size = "md",
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  error,
  placeholder,
  disabled = false,
  required = false,
  addKeys = ["Enter"],
  addOnBlur = false,
  allowDuplicates = false,
  maxTags,
  name,
  id,
}: TagInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const labelId = `${fieldId}-label`
  const descId = `${fieldId}-desc`
  const invalid = error != null

  const isControlled = value != null
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const tags = isControlled ? value : internal

  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const commit = (next: string[]) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  const atMax = maxTags != null && tags.length >= maxTags

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (tag === "" || atMax) return
    if (!allowDuplicates && tags.includes(tag)) {
      setDraft("")
      return
    }
    commit([...tags, tag])
    setDraft("")
  }

  const removeTag = (index: number) => {
    commit(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (addKeys.includes(event.key)) {
      event.preventDefault()
      addTag(draft)
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      event.preventDefault()
      removeTag(tags.length - 1)
    }
  }

  const handleBlur = () => {
    if (addOnBlur) addTag(draft)
  }

  return (
    <div data-slot="tag-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          id={labelId}
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div
        role="group"
        aria-labelledby={label != null ? labelId : undefined}
        data-slot="tag-input-shell"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onMouseDown={(event) => {
          // Clicking empty shell space focuses the input, not the chips.
          if (event.target === event.currentTarget) {
            event.preventDefault()
            inputRef.current?.focus()
          }
        }}
        className={cn(shellVariants({ size }))}
      >
        {tags.map((tag, index) => (
          <Tag
            key={`${tag}-${index}`}
            size={TAG_SIZE[size ?? "md"]}
            disabled={disabled}
            onRemove={disabled ? undefined : () => removeTag(index)}
            removeLabel={`Remove ${tag}`}
            data-slot="tag-input-tag"
          >
            {tag}
          </Tag>
        ))}

        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          value={draft}
          disabled={disabled}
          required={required && tags.length === 0}
          placeholder={tags.length === 0 ? placeholder : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={description != null || invalid ? descId : undefined}
          data-slot="tag-input-control"
          className={cn(
            "min-w-[6ch] flex-1 bg-transparent px-1 py-0.5 outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed"
          )}
        />

        {name != null &&
          tags.map((tag, index) => (
            <input
              key={`hidden-${tag}-${index}`}
              type="hidden"
              name={name}
              value={tag}
            />
          ))}
      </div>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="tag-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="tag-input-error"
          className="text-destructive-ink text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { TagInput, shellVariants as tagInputShellVariants }
export type { TagInputProps }
