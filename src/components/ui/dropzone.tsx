import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { UploadCloud } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Dropzone (File Management, closed API)
 *
 * A file intake region: users can **drag & drop** files onto it or **click /
 * keyboard-activate** it to open the native file picker. The whole region is a
 * `<label>` bound to a visually-hidden, focus-visible file `<input>`, so
 * click-to-browse and Enter/Space both work natively and the AEGIS 3px
 * `accent-soft` focus ring lights the region when the input is focused.
 *
 * On drag-over the dashed border and surface shift to the accent treatment
 * (`data-dragging`), `invalid` paints the destructive border, and `disabled`
 * dims + blocks interaction. Selection is reported through `onFilesSelected`
 * (never storing files itself — render a File List / Upload Progress beside it).
 *
 * Token-only; there is no Base UI primitive for drag-and-drop, so this is a
 * native-DnD composite built to the AEGIS Input surface. The public API is
 * CLOSED — no `className` / `style`; customise via `size` and the semantic
 * `disabled` / `invalid` / `multiple` props. See `.agent/rules/API_RULES.md`.
 */

const dropzoneVariants = cva(
  cn(
    "group/dropzone relative isolate flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors",
    "border-border-strong bg-surface-2 text-muted-foreground",
    "hover:border-accent-strong hover:bg-muted",
    // Focus ring driven by the hidden input's focus-visible state.
    "has-[[data-slot=dropzone-input]:focus-visible]:border-accent-strong has-[[data-slot=dropzone-input]:focus-visible]:ring-3 has-[[data-slot=dropzone-input]:focus-visible]:ring-accent-soft",
    // Active drag.
    "data-[dragging=true]:border-accent-strong data-[dragging=true]:bg-accent-soft data-[dragging=true]:text-foreground",
    // Invalid.
    "data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-ink data-[invalid=true]:hover:border-destructive",
    // Disabled.
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "min-h-28 gap-1.5 p-4 text-xs [&_svg]:size-6",
        md: "min-h-36 gap-2 p-6 text-sm [&_svg]:size-8",
        lg: "min-h-44 gap-2.5 p-8 text-base [&_svg]:size-10",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type DropzoneProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "onDrop" | "children"
> &
  VariantProps<typeof dropzoneVariants> & {
    /** Comma-separated `accept` list forwarded to the input (e.g. `"image/*,.pdf"`). */
    accept?: string
    /** Allow selecting more than one file. Default `false`. */
    multiple?: boolean
    /** Dim + block all interaction. */
    disabled?: boolean
    /** Paint the destructive border/text (e.g. a rejected file). */
    invalid?: boolean
    /** Mark the underlying input required for native form validation. */
    required?: boolean
    /** `name` for the native file input, so it posts with a form. */
    name?: string
    /** Primary prompt line. Default `"Drag & drop files here"`. */
    title?: React.ReactNode
    /** Secondary line under the title. Default `"or click to browse"`. */
    description?: React.ReactNode
    /** Small hint under the description (e.g. accepted types / size limit). */
    hint?: React.ReactNode
    /** Leading glyph; defaults to an upload-cloud icon. Pass `false` to omit. */
    icon?: React.ReactNode | false
    /** Called with the chosen `File[]` on drop or picker selection. */
    onFilesSelected?: (files: File[]) => void
  }

function Dropzone({
  size = "md",
  accept,
  multiple = false,
  disabled = false,
  invalid = false,
  required = false,
  name,
  title = "Drag & drop files here",
  description = "or click to browse",
  hint,
  icon,
  onFilesSelected,
  id,
  ...props
}: DropzoneProps) {
  const reactId = React.useId()
  const inputId = id ?? `dropzone-${reactId}`
  const hintId = hint != null ? `${inputId}-hint` : undefined
  const [dragging, setDragging] = React.useState(false)

  const emit = React.useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return
      onFilesSelected?.(Array.from(list))
    },
    [onFilesSelected]
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    emit(event.target.files)
    // Reset so selecting the same file again still fires a change.
    event.target.value = ""
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    if (!dragging) setDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Ignore leaves bubbling up from children still inside the region.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    emit(event.dataTransfer?.files ?? null)
  }

  return (
    <div
      data-slot="dropzone"
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      className={cn(dropzoneVariants({ size }))}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      <input
        id={inputId}
        data-slot="dropzone-input"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required}
        name={name}
        aria-invalid={invalid || undefined}
        aria-describedby={hintId}
        onChange={handleChange}
        className="sr-only"
      />
      {/* Full-region label: click + keyboard reach the input; content sits above. */}
      <label
        htmlFor={inputId}
        data-slot="dropzone-label"
        className={cn(
          "absolute inset-0 rounded-[inherit]",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <span className="sr-only">{title}</span>
      </label>

      <div
        data-slot="dropzone-content"
        className="pointer-events-none relative z-[1] flex flex-col items-center gap-1"
      >
        {icon !== false &&
          (icon ?? (
            <UploadCloud
              aria-hidden="true"
              className="text-muted-foreground group-hover/dropzone:text-accent-strong group-data-[dragging=true]/dropzone:text-accent-strong group-data-[invalid=true]/dropzone:text-destructive-ink"
            />
          ))}
        <span
          data-slot="dropzone-title"
          className="font-medium text-foreground group-data-[invalid=true]/dropzone:text-destructive-ink"
        >
          {title}
        </span>
        {description != null && (
          <span data-slot="dropzone-description" className="text-muted-foreground">
            {description}
          </span>
        )}
        {hint != null && (
          <span
            id={hintId}
            data-slot="dropzone-hint"
            className="mt-0.5 text-xs text-text-faint"
          >
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}

export { Dropzone, dropzoneVariants }
export type { DropzoneProps }
