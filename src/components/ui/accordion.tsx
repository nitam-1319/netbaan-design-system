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
      bordered:
        "divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70 bg-surface-2/40",
    },
  },
  defaultVariants: {
    variant: "default",
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
})

type AccordionProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof accordionVariants>

function Accordion({ variant = "default", ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ variant }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(accordionVariants({ variant }))}
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
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitive.Trigger>,
  "className" | "style"
>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-medium text-foreground outline-none transition-colors",
          "hover:text-foreground focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0"
        )}
        {...props}
      >
        {children}
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

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel, accordionVariants }
