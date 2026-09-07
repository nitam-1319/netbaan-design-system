"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Accordion (Interactive tier, closed API)
 *
 * Stacked, expandable disclosure sections built on the Base UI Accordion
 * primitive: `multiple`, controlled/uncontrolled value, `role`/`aria-*`
 * wiring, keyboard navigation, and the `--accordion-panel-height` open/close
 * animation variable are all handled for us.
 *
 * Public API is CLOSED: no `className` / `style`. Appearance is the semantic
 * `variant` prop; layout belongs in `Box`/`Stack`. Element polymorphism stays
 * available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const accordionVariants = cva("w-full", {
  variants: {
    variant: {
      // Hairline dividers between flush items.
      default: "divide-y divide-border/70",
      // Each item boxed on its own surface.
      separated: "flex flex-col gap-2",
      // Single outlined container with divided rows.
      // A2: triggers are flush to all four edges of this container, so plain
      // `overflow-hidden` clips their focus ring (outline included — overflow
      // clips a descendant's outline exactly as it clips its box-shadow).
      // `focus-escape` still clips content but permits the ring to paint past
      // the edge.
      bordered:
        "divide-y divide-border/70 focus-escape rounded-lg border border-border/70 bg-surface-2/40",
    },
    /**
     * Row height. `comfortable` is today's; `compact` is roughly half, for a
     * side panel where the default spends more height on inset than on the
     * rows themselves — and drops the divider, which at that density reads as
     * clutter rather than structure.
     */
    density: {
      comfortable: "",
      compact: "divide-y-0",
    },
  },
  defaultVariants: {
    variant: "default",
    density: "comfortable",
  },
})

const accordionItemVariants = cva("group/accordion-item", {
  variants: {
    variant: {
      default: "",
      separated:
        "rounded-lg border border-border/70 bg-surface-2/40 px-4 transition-colors data-[open]:bg-surface-2",
      bordered: "px-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type AccordionContextValue = VariantProps<typeof accordionVariants>
const AccordionContext = React.createContext<AccordionContextValue>({
  variant: "default",
  density: "comfortable",
})

type AccordionProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof accordionVariants>

function Accordion({
  variant = "default",
  density = "comfortable",
  ...props
}: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ variant, density }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        // The trigger reads the density from here through the group, so one
        // prop at the root cannot leave half the rows at the other rung.
        data-density={density}
        className={cn(
          "group/accordion",
          accordionVariants({ variant, density })
        )}
        {...props}
      />
    </AccordionContext.Provider>
  )
}

function AccordionItem(
  props: Omit<
    React.ComponentProps<typeof AccordionPrimitive.Item>,
    "className" | "style"
  >
) {
  const { variant } = React.useContext(AccordionContext)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(accordionItemVariants({ variant }))}
      {...props}
    />
  )
}

function AccordionTrigger({
  children,
  trailing,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitive.Trigger>,
  "className" | "style"
> & {
  /**
   * Content between the label and the chevron — a count, a status dot.
   *
   * Passing it as part of `children` made it share the label's flex slot, so
   * it was pushed around by the title's length instead of sitting against the
   * chevron.
   */
  trailing?: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between gap-3 text-start text-sm font-medium text-foreground transition-colors outline-none",
          "py-4 group-data-[density=compact]/accordion:py-1.5 group-data-[density=compact]/accordion:text-[13px]",
          "hover:text-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-accent-soft",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0"
        )}
        {...props}
      >
        {children}
        {trailing != null ? (
          <span
            data-slot="accordion-trigger-trailing"
            className="ms-auto flex shrink-0 items-center gap-2"
          >
            {trailing}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionPanel({
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitive.Panel>,
  "className" | "style"
>) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-muted-foreground",
        "transition-[height] duration-200 ease-out",
        "data-[ending-style]:h-0 data-[starting-style]:h-0"
      )}
      {...props}
    >
      <div data-slot="accordion-panel-content" className="pb-4">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  accordionVariants,
}
