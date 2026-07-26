import * as React from "react"
import { Check, Loader2, Wrench, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/ui/code-block"

/**
 * AEGIS — Tool Call Block (AI Components)
 *
 * A structured record of a single tool / function invocation made by an agent —
 * the tool name, the arguments it was called with, the result it returned, and
 * the call's status (running · succeeded · failed). Arguments and result are
 * rendered through the AEGIS `CodeBlock` (monospace, copyable, scrollable) and
 * the status through a `Badge`, so the block reuses the library's affordances
 * rather than reinventing them.
 *
 * Status is carried by an icon **and** a text label (never colour alone). Feed
 * `args` as an object (pretty-printed as JSON) or a raw string. Public API is
 * CLOSED — no `className` / `style`; everything is a semantic prop. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type ToolCallStatus = "pending" | "success" | "error"

const STATUS_META: Record<
  ToolCallStatus,
  { label: string; tone: "accent" | "success" | "danger"; icon: React.ElementType; spin?: boolean }
> = {
  pending: { label: "Running", tone: "accent", icon: Loader2, spin: true },
  success: { label: "Succeeded", tone: "success", icon: Check },
  error: { label: "Failed", tone: "danger", icon: X },
}

type ToolCallBlockProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The invoked tool / function name. Required. */
  name: string
  /** Arguments — an object (pretty-printed) or a pre-formatted string. */
  args?: unknown
  /** The returned result — an object (pretty-printed) or a string. */
  result?: unknown
  /** Call status. Default "success". */
  status?: ToolCallStatus
  /** Language tag for the code sections. Default "json". */
  language?: string
  /** Optional one-line description of what the call does. */
  description?: React.ReactNode
}

/** Pretty-print objects to JSON; pass strings through unchanged. */
function toSource(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function ToolCallBlock({
  name,
  args,
  result,
  status = "success",
  language = "json",
  description,
  ...props
}: ToolCallBlockProps) {
  const meta = STATUS_META[status]
  const StatusIcon = meta.icon
  const argsSource = toSource(args)
  const resultSource = toSource(result)

  return (
    <div
      data-slot="tool-call-block"
      data-status={status}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card"
      )}
      {...props}
    >
      <div
        data-slot="tool-call-block-header"
        className="flex items-center gap-2 border-b border-border bg-surface-3 px-3 py-2"
      >
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong [&>svg]:size-3.5"
        >
          <Wrench />
        </span>
        <div className="flex min-w-0 flex-col">
          <span
            data-slot="tool-call-block-name"
            className="truncate font-mono text-sm font-medium text-foreground"
          >
            {name}
          </span>
          {description != null ? (
            <span className="truncate text-xs text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        <span className="ms-auto shrink-0">
          <Badge
            tone={meta.tone}
            variant="soft"
            size="sm"
            data-slot="tool-call-block-status"
            icon={
              <StatusIcon aria-hidden className={cn(meta.spin && "animate-spin")} />
            }
          >
            {meta.label}
          </Badge>
        </span>
      </div>

      <div
        data-slot="tool-call-block-body"
        className="flex flex-col gap-3 p-3"
      >
        <section data-slot="tool-call-block-args">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Arguments
          </p>
          {argsSource ? (
            <CodeBlock code={argsSource} language={language} label="Tool arguments" />
          ) : (
            <p className="text-xs text-text-faint italic">No arguments</p>
          )}
        </section>

        {resultSource ? (
          <section data-slot="tool-call-block-result">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Result
            </p>
            <CodeBlock code={resultSource} language={language} label="Tool result" />
          </section>
        ) : null}
      </div>
    </div>
  )
}

export { ToolCallBlock, toSource }
export type { ToolCallBlockProps, ToolCallStatus }
