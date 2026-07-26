import * as React from "react"
import { Brain } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion"

/**
 * AEGIS — Reasoning Trace (AI Components)
 *
 * A collapsible disclosure for a model's intermediate reasoning ("chain of
 * thought") — collapsed by default behind a summary so it never competes with the
 * final answer, expandable to reveal the steps. It composes the AEGIS
 * `Accordion` (a single item), inheriting its keyboard, ARIA, and open/close
 * animation, and adds an AI-appropriate header (a brain glyph, a title, and an
 * optional "Thought for Ns" duration or a live "Thinking…" state).
 *
 * Feed `steps` for an ordered trace, or arbitrary `children` for freeform
 * reasoning. Public API is CLOSED — no `className` / `style`; everything is a
 * semantic prop. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type ReasoningTraceProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Header title. Default "Reasoning". */
  title?: React.ReactNode
  /** Ordered reasoning steps. Rendered as a numbered list. */
  steps?: React.ReactNode[]
  /** Freeform reasoning content (used when `steps` is omitted). */
  children?: React.ReactNode
  /** Thinking time in seconds → "Thought for Ns" in the header. */
  durationSeconds?: number
  /** Live status: `thinking` shows an animated indicator; `done` is resting. */
  status?: "thinking" | "done"
  /** Start expanded. Default `false`. */
  defaultOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  /** Fired when the trace is expanded/collapsed. */
  onOpenChange?: (open: boolean) => void
}

const ITEM_VALUE = "reasoning-trace"

function ReasoningTrace({
  title = "Reasoning",
  steps,
  children,
  durationSeconds,
  status = "done",
  defaultOpen = false,
  open,
  onOpenChange,
  ...props
}: ReasoningTraceProps) {
  const isControlled = open != null
  const value = isControlled ? (open ? [ITEM_VALUE] : []) : undefined
  const defaultValue = defaultOpen ? [ITEM_VALUE] : []

  const durationLabel =
    status === "thinking"
      ? "Thinking…"
      : durationSeconds != null
        ? `Thought for ${durationSeconds}s`
        : null

  return (
    <div data-slot="reasoning-trace" data-status={status} {...props}>
      <Accordion
        variant="separated"
        openMultiple
        value={value}
        defaultValue={isControlled ? undefined : defaultValue}
        onValueChange={
          onOpenChange
            ? (v: string[]) => onOpenChange(v.includes(ITEM_VALUE))
            : undefined
        }
      >
        <AccordionItem value={ITEM_VALUE}>
          <AccordionTrigger>
            <span className="flex min-w-0 items-center gap-2">
              <span
                data-slot="reasoning-trace-icon"
                aria-hidden
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-strong [&>svg]:size-3.5",
                  status === "thinking" && "animate-pulse"
                )}
              >
                <Brain />
              </span>
              <span className="truncate font-medium text-foreground">{title}</span>
              {durationLabel ? (
                <span
                  data-slot="reasoning-trace-meta"
                  className="shrink-0 text-xs font-normal text-muted-foreground"
                >
                  {durationLabel}
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionPanel>
            {steps && steps.length > 0 ? (
              <ol
                data-slot="reasoning-trace-steps"
                className="flex list-none flex-col gap-2 ps-0"
              >
                {steps.map((step, i) => (
                  <li
                    key={i}
                    data-slot="reasoning-trace-step"
                    className="flex gap-2.5 text-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-3 font-mono text-[11px] tabular-nums text-text-faint"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 leading-relaxed text-pretty">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div
                data-slot="reasoning-trace-content"
                className="text-sm leading-relaxed text-muted-foreground text-pretty"
              >
                {children}
              </div>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export { ReasoningTrace }
export type { ReasoningTraceProps }
