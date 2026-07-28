import * as React from "react"
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/toolbar"

/**
 * AEGIS — Rich Text Editor (Advanced / Inputs)
 *
 * A lightweight WYSIWYG editor: the AEGIS `Toolbar` (its formatting controls) on
 * top of a `contenteditable` region wearing the Input visual language
 * (`border-strong` outline, accent focus ring). It emits HTML via
 * `onValueChange`, supports bold / italic / underline and bulleted / numbered
 * lists, and can be controlled or uncontrolled.
 *
 * SCOPE: formatting is applied with the built-in `document.execCommand` rich-text
 * commands (broadly supported, guarded), which keeps the editor dependency-free.
 * A schema-backed engine (ProseMirror / Lexical) with links, headings, images,
 * tables, and collaborative editing is a documented upgrade path — deferred
 * rather than pulling a heavy dependency into a no-browser sandbox, consistent
 * with the honestly-scoped precedents. Public API is CLOSED — no `className` /
 * `style`; treatment is semantic. Tokens only. See `.agent/rules/API_RULES.md`.
 */

export type RichTextControl =
  | "bold"
  | "italic"
  | "underline"
  | "bulletList"
  | "orderedList"

type ControlSpec = {
  id: RichTextControl
  cmd: string
  icon: React.ComponentType<{ "aria-hidden"?: boolean }>
  label: string
}

const CONTROL_SPECS: Record<RichTextControl, ControlSpec> = {
  bold: { id: "bold", cmd: "bold", icon: Bold, label: "Bold" },
  italic: { id: "italic", cmd: "italic", icon: Italic, label: "Italic" },
  underline: { id: "underline", cmd: "underline", icon: Underline, label: "Underline" },
  bulletList: { id: "bulletList", cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
  orderedList: { id: "orderedList", cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
}

const DEFAULT_CONTROLS: RichTextControl[] = [
  "bold",
  "italic",
  "underline",
  "bulletList",
  "orderedList",
]

type RichTextEditorProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "onChange"
> & {
  /** Controlled HTML value. */
  value?: string
  /** Initial HTML value (uncontrolled). */
  defaultValue?: string
  /** Fires with the editor's HTML whenever it changes. */
  onValueChange?: (html: string) => void
  /** Visible label. */
  label?: React.ReactNode
  /** Placeholder shown while the editor is empty. */
  placeholder?: string
  /** Which formatting controls to show. Default: all. */
  controls?: RichTextControl[]
  /** Disable the whole editor. */
  disabled?: boolean
  /** Make the content read-only (toolbar hidden). */
  readOnly?: boolean
  /** Minimum editor body height in rem. Default 6. */
  minHeightRem?: number
}

/** True when the HTML has no visible text (ignoring tags, `<br>`, `&nbsp;`). */
function isHtmlEmpty(html: string): boolean {
  return (
    html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]*>/g, "")
      .trim().length === 0
  )
}

function canExec(): boolean {
  return typeof document !== "undefined" && typeof document.execCommand === "function"
}

function RichTextEditor({
  value,
  defaultValue = "",
  onValueChange,
  label,
  placeholder = "Write something…",
  controls = DEFAULT_CONTROLS,
  disabled = false,
  readOnly = false,
  minHeightRem = 6,
  ...props
}: RichTextEditorProps) {
  const reactId = React.useId()
  const editorId = `${reactId}-rte`
  const labelId = `${reactId}-rte-label`
  const editorRef = React.useRef<HTMLDivElement>(null)

  const [empty, setEmpty] = React.useState(() => isHtmlEmpty(value ?? defaultValue))
  const [active, setActive] = React.useState<Partial<Record<RichTextControl, boolean>>>({})

  const specs = controls.map((c) => CONTROL_SPECS[c]).filter(Boolean)

  // Seed initial content once.
  React.useEffect(() => {
    const el = editorRef.current
    if (!el) return
    const initial = value ?? defaultValue ?? ""
    el.innerHTML = initial
    setEmpty(isHtmlEmpty(initial))
    // Mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync a controlled value in without disturbing the caret while editing.
  React.useEffect(() => {
    const el = editorRef.current
    if (!el || value === undefined) return
    if (value !== el.innerHTML && document.activeElement !== el) {
      el.innerHTML = value
      setEmpty(isHtmlEmpty(value))
    }
  }, [value])

  const refreshActive = React.useCallback(() => {
    const el = editorRef.current
    if (!el || !canExec() || document.activeElement !== el) return
    const next: Partial<Record<RichTextControl, boolean>> = {}
    for (const spec of specs) {
      try {
        next[spec.id] = document.queryCommandState(spec.cmd)
      } catch {
        next[spec.id] = false
      }
    }
    setActive(next)
    // specs is derived from `controls`; depend on the stable key list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls])

  React.useEffect(() => {
    document.addEventListener("selectionchange", refreshActive)
    return () => document.removeEventListener("selectionchange", refreshActive)
  }, [refreshActive])

  const emitChange = () => {
    const el = editorRef.current
    if (!el) return
    setEmpty(isHtmlEmpty(el.innerHTML))
    onValueChange?.(el.innerHTML)
  }

  const runCommand = (spec: ControlSpec) => {
    const el = editorRef.current
    if (!el || disabled || readOnly) return
    el.focus()
    if (canExec()) {
      try {
        document.execCommand(spec.cmd, false)
      } catch {
        /* no-op in environments without execCommand */
      }
    }
    emitChange()
    refreshActive()
  }

  return (
    <div
      data-slot="rich-text-editor"
      data-disabled={disabled || undefined}
      className={cn("flex w-full flex-col gap-1.5 text-foreground", disabled && "opacity-60")}
      {...props}
    >
      {label != null ? (
        // The editor is a contenteditable div (not a labelable element), so
        // `htmlFor` can't associate it — use `aria-labelledby` for the name and
        // wire click-to-focus manually. `onMouseDown` preventDefault keeps the
        // caret placement from the programmatic focus.
        <label
          data-slot="rich-text-editor-label"
          id={labelId}
          onMouseDown={(e) => {
            if (disabled || readOnly) return
            e.preventDefault()
            editorRef.current?.focus()
          }}
          className={cn(
            "text-sm font-medium text-foreground",
            !disabled && !readOnly && "cursor-text"
          )}
        >
          {label}
        </label>
      ) : null}

      <div
        data-slot="rich-text-editor-shell"
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-border-strong bg-surface-2 p-2",
          "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-accent-soft",
          "transition-[color,background-color,border-color,box-shadow] duration-150"
        )}
      >
        {!readOnly ? (
          <Toolbar aria-label="Text formatting" aria-controls={editorId}>
            <ToolbarGroup>
              {specs.map((spec, i) => {
                const isSep =
                  (spec.id === "bulletList" &&
                    specs[i - 1] &&
                    specs[i - 1].id !== "bulletList" &&
                    specs[i - 1].id !== "orderedList") ||
                  false
                const Icon = spec.icon
                return (
                  <React.Fragment key={spec.id}>
                    {isSep ? <ToolbarSeparator /> : null}
                    <ToolbarButton
                      size="sm"
                      aria-label={spec.label}
                      aria-pressed={active[spec.id] || false}
                      disabled={disabled}
                      // Keep the selection when the button takes focus.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runCommand(spec)}
                    >
                      <Icon aria-hidden />
                    </ToolbarButton>
                  </React.Fragment>
                )
              })}
            </ToolbarGroup>
          </Toolbar>
        ) : null}

        <div className={cn("relative")}>
          {empty && !readOnly ? (
            <div
              data-slot="rich-text-editor-placeholder"
              aria-hidden
              className={cn("pointer-events-none absolute inset-0 px-3 py-2 text-sm text-muted-foreground")}
            >
              {placeholder}
            </div>
          ) : null}

          <div
            ref={editorRef}
            id={editorId}
            data-slot="rich-text-editor-content"
            role="textbox"
            aria-multiline="true"
            aria-labelledby={label != null ? labelId : undefined}
            aria-label={label == null ? "Rich text editor" : undefined}
            aria-readonly={readOnly || undefined}
            aria-disabled={disabled || undefined}
            contentEditable={!disabled && !readOnly}
            suppressContentEditableWarning
            onInput={emitChange}
            onBlur={emitChange}
            className={cn(
              "w-full rounded-md bg-surface px-3 py-2 text-sm text-foreground outline-none",
              "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ps-5",
              "[&_a]:text-primary [&_a]:underline",
              readOnly ? "bg-transparent px-0" : "",
              !disabled && !readOnly ? "cursor-text" : "cursor-default"
            )}
            style={{ minHeight: readOnly ? undefined : `${minHeightRem}rem` }}
          />
        </div>
      </div>
    </div>
  )
}

export { RichTextEditor }
export type { RichTextEditorProps }
