import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-to-clipboard"

/**
 * AEGIS — Diff Viewer (Data Display)
 *
 * A read-only, line-by-line view of a change set — the diff-scoped sibling of
 * `Code Block`. It shares Code Block's surface language (mono, token-themed,
 * bordered, copyable) but renders each line with an old/new line-number gutter, a
 * `+` / `−` / ` ` change marker, and a tinted background so additions and
 * removals read at a glance.
 *
 * Change type is carried by the **marker glyph** (and background), never colour
 * alone. Feed a pre-parsed `lines` array (no diff algorithm here — the parsing is
 * the caller's). Public API is CLOSED — no `className` / `style`; behaviour is the
 * semantic props. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type DiffLineType = "add" | "remove" | "context"

type DiffLine = {
  /** Change kind → marker + tint. */
  type: DiffLineType
  /** The line text (rendered verbatim). */
  content: string
  /** Line number in the old file (context + remove). */
  oldLine?: number
  /** Line number in the new file (context + add). */
  newLine?: number
}

const MARKER: Record<DiffLineType, string> = {
  add: "+",
  remove: "−",
  context: " ",
}

const rowTint: Record<DiffLineType, string> = {
  add: "bg-[color-mix(in_oklch,var(--success),transparent_88%)]",
  remove: "bg-[color-mix(in_oklch,var(--destructive),transparent_88%)]",
  context: "",
}

const markerColor: Record<DiffLineType, string> = {
  add: "text-success-ink",
  remove: "text-destructive-ink",
  context: "text-text-faint",
}

type DiffViewerProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The pre-parsed diff lines to render. */
  lines: DiffLine[]
  /** Optional filename shown in the header. */
  filename?: React.ReactNode
  /** Show the old/new line-number gutter. Default `true`. */
  showLineNumbers?: boolean
  /** Show a copy button that copies the changed source. Default `true`. */
  showCopy?: boolean
  /** Text scale. Default "md". */
  size?: "sm" | "md"
  /** Accessible name for the scrollable region. Default "Diff". */
  label?: string
}

function DiffViewer({
  lines,
  filename,
  showLineNumbers = true,
  showCopy = true,
  size = "md",
  label = "Diff",
  ...props
}: DiffViewerProps) {
  const additions = lines.filter((l) => l.type === "add").length
  const deletions = lines.filter((l) => l.type === "remove").length
  // Copy the resulting (new) source: context + additions, markers stripped.
  const copyText = lines
    .filter((l) => l.type !== "remove")
    .map((l) => l.content)
    .join("\n")

  return (
    <div
      data-slot="diff-viewer"
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-surface-2 font-mono text-foreground",
        size === "sm" ? "text-xs" : "text-sm"
      )}
      {...props}
    >
      <div
        data-slot="diff-viewer-header"
        className="flex items-center justify-between gap-2 border-b border-border bg-surface-3 px-3 py-1.5"
      >
        <span className="truncate text-xs font-medium text-muted-foreground">
          {filename}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-2 text-[0.7rem] font-medium tabular-nums">
            <span className="text-success-ink">+{additions}</span>
            <span className="text-destructive-ink">−{deletions}</span>
          </span>
          {showCopy ? (
            <CopyButton value={copyText} variant="ghost" size="sm" aria-label="Copy changed source" />
          ) : null}
        </div>
      </div>

      <div
        data-slot="diff-viewer-body"
        tabIndex={0}
        role="group"
        aria-label={label}
        className="overflow-x-auto outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr
                key={i}
                data-slot="diff-viewer-line"
                data-type={line.type}
                className={cn(rowTint[line.type])}
              >
                {showLineNumbers ? (
                  <>
                    <td
                      aria-hidden
                      className="w-10 select-none px-2 text-end align-top text-text-faint tabular-nums"
                    >
                      {line.oldLine ?? ""}
                    </td>
                    <td
                      aria-hidden
                      className="w-10 select-none px-2 text-end align-top text-text-faint tabular-nums"
                    >
                      {line.newLine ?? ""}
                    </td>
                  </>
                ) : null}
                <td
                  aria-hidden
                  className={cn(
                    "w-5 select-none px-1 text-center align-top font-semibold",
                    markerColor[line.type]
                  )}
                >
                  {MARKER[line.type]}
                </td>
                <td className="w-full whitespace-pre px-2 align-top">
                  <span className="sr-only">
                    {line.type === "add"
                      ? "Added: "
                      : line.type === "remove"
                        ? "Removed: "
                        : ""}
                  </span>
                  {line.content.length ? line.content : " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { DiffViewer }
export type { DiffViewerProps, DiffLine, DiffLineType }
