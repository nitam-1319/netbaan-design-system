import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-to-clipboard"

/**
 * AEGIS — Code Block
 *
 * A read-only surface for displaying a snippet of code: monospace, token-themed,
 * with an optional filename/language header, optional line numbers, and a
 * one-press copy affordance (the AEGIS `CopyButton`). It does not syntax-colour
 * the source (that needs a highlighter and is out of scope here) — it presents
 * the code faithfully with correct whitespace, horizontal scroll or soft-wrap,
 * and a keyboard-scrollable region.
 *
 * Public API is CLOSED — no `className` / `style`. Feed `code`; toggle behaviour
 * with the semantic props (`language`, `filename`, `showLineNumbers`, `wrap`,
 * `showCopy`, `size`). All colour is token-driven.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const codeBlockVariants = cva(
  "relative overflow-hidden rounded-lg border border-border bg-surface-2 font-mono text-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type CodeBlockProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof codeBlockVariants> & {
    /** The source to display. Rendered verbatim, whitespace preserved. */
    code: string
    /** Short language tag shown in the header (e.g. "tsx", "bash"). */
    language?: string
    /** Optional filename shown at the start of the header. */
    filename?: React.ReactNode
    /** Render a left gutter of line numbers. Default `false`. */
    showLineNumbers?: boolean
    /** Soft-wrap long lines instead of scrolling horizontally. Default `false`. */
    wrap?: boolean
    /** Show the copy-to-clipboard button. Default `true`. */
    showCopy?: boolean
    /** Accessible name for the scrollable code region. Default "Code". */
    label?: string
  }

function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  wrap = false,
  showCopy = true,
  size = "md",
  label = "Code",
  ...props
}: CodeBlockProps) {
  // Drop a single trailing newline so it doesn't render as a blank final line.
  const normalized = code.replace(/\n$/, "")
  const lines = normalized.split("\n")
  const hasHeader = filename != null || language != null

  return (
    <div data-slot="code-block" className={cn(codeBlockVariants({ size }))} {...props}>
      {hasHeader && (
        <div
          data-slot="code-block-header"
          className={cn(
            "flex items-center justify-between gap-2 border-b border-border bg-surface-3 px-3 py-1.5"
          )}
        >
          <span
            data-slot="code-block-filename"
            className={cn("truncate text-xs font-medium text-muted-foreground")}
          >
            {filename}
          </span>
          <div className={cn("flex shrink-0 items-center gap-2")}>
            {language != null && (
              <span
                data-slot="code-block-language"
                className={cn(
                  "rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase"
                )}
              >
                {language}
              </span>
            )}
            {showCopy && (
              <CopyButton value={code} variant="ghost" size="sm" aria-label="Copy code" />
            )}
          </div>
        </div>
      )}

      {!hasHeader && showCopy && (
        <div
          data-slot="code-block-copy"
          className={cn("absolute end-2 top-2 z-10")}
        >
          <CopyButton value={code} variant="ghost" size="sm" aria-label="Copy code" />
        </div>
      )}

      <pre
        data-slot="code-block-pre"
        tabIndex={0}
        role="group"
        aria-label={label}
        className={cn(
          "overflow-x-auto p-4 leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
          !hasHeader && showCopy && "pe-12"
        )}
      >
        <code data-slot="code-block-code" className={cn("block")}>
          {showLineNumbers
            ? lines.map((line, i) => (
                <span
                  key={i}
                  data-slot="code-block-line"
                  className={cn(
                    "grid grid-cols-[auto_1fr] gap-4",
                    wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                  )}
                >
                  <span
                    aria-hidden="true"
                    data-slot="code-block-line-number"
                    className={cn(
                      "sticky start-0 select-none text-end text-text-faint tabular-nums"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span data-slot="code-block-line-content">
                    {line.length ? line : " "}
                  </span>
                </span>
              ))
            : (
              <span
                className={cn(wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}
              >
                {normalized}
              </span>
            )}
        </code>
      </pre>
    </div>
  )
}

export { CodeBlock, codeBlockVariants }
export type { CodeBlockProps }
