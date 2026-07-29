"use client";

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Collapse (Motion tier, closed API)
 *
 * A low-level show/hide primitive that animates a region's height open and
 * closed, built on the Base UI Collapsible primitive. It owns the disclosure
 * state (`open` / `defaultOpen` / `onOpenChange` / `disabled`), the
 * trigger↔panel ARIA wiring (`aria-controls` / `aria-expanded` / `role=region`),
 * and exposes the measured panel height as `--collapsible-panel-height` so the
 * open/close transition runs on the AEGIS motion tokens.
 *
 * `Collapse` is the motion building block; higher-level disclosure UIs
 * (`Accordion`, a sidebar section, a "show more" block) are built from it or
 * from the same primitive. The trigger is left unstyled so callers supply their
 * own control via the `render` prop (e.g. a `Button`).
 *
 * Public API is CLOSED: no `className` / `style` on any part. Element
 * polymorphism stays available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function Collapse(
  props: Omit<
    React.ComponentProps<typeof CollapsiblePrimitive.Root>,
    "className" | "style"
  >
) {
  return <CollapsiblePrimitive.Root data-slot="collapse" {...props} />
}

/* --------------------------------------------------------------- Trigger -- */

function CollapseTrigger(
  props: Omit<
    React.ComponentProps<typeof CollapsiblePrimitive.Trigger>,
    "className" | "style"
  >
) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapse-trigger"
      className={cn("outline-none")}
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Content -- */

function CollapseContent({
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.Panel>,
  "className" | "style"
>) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapse-content"
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden",
        "transition-[height] duration-200 ease-out",
        "data-[ending-style]:h-0 data-[starting-style]:h-0"
      )}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapse, CollapseTrigger, CollapseContent }
