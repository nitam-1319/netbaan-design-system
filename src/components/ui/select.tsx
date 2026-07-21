import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Select (Interactive tier, closed API)
 *
 * A form control for choosing one value (or several, with `multiple`) from a
 * list, built on the Base UI Select primitive. Portalling, floating-engine
 * positioning, typeahead, roving focus, modal focus management, native form
 * integration (`name` / `required`) and outside-press / Escape dismissal are
 * handled by the primitive.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Trigger sizing is
 * the semantic `size` prop; placement is semantic on `SelectContent`; layout
 * inside the surface belongs in `Box`/`Stack`. Element polymorphism stays
 * available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(
  props: Omit<
    React.ComponentProps<typeof SelectPrimitive.Group>,
    "className" | "style"
  >
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(
  props: Omit<
    React.ComponentProps<typeof SelectPrimitive.Value>,
    "className" | "style"
  >
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/* --------------------------------------------------------------- Trigger -- */

const selectTriggerVariants = cva(
  cn(
    "group/select-trigger border-input bg-background text-foreground dark:bg-input/30 dark:hover:bg-input/50 inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-clip-padding whitespace-nowrap transition-all outline-none select-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "data-[placeholder]:text-muted-foreground",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 text-[0.8rem]",
        default: "h-8 px-2.5 text-sm",
        lg: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SelectTriggerProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Trigger>,
  "className" | "style"
> &
  VariantProps<typeof selectTriggerVariants>

function SelectTrigger({ size, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="text-muted-foreground"
      >
        <ChevronsUpDown aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/* --------------------------------------------------------------- Content -- */

type SelectContentProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof SelectPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof SelectPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
}

function SelectContent({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        data-slot="select-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <SelectPrimitive.ScrollUpArrow
          data-slot="select-scroll-up"
          className="bg-popover text-muted-foreground flex h-6 cursor-default items-center justify-center rounded-t-lg"
        >
          <ChevronUp aria-hidden className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg p-1 text-sm shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] ring-1 outline-none",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
        <SelectPrimitive.ScrollDownArrow
          data-slot="select-scroll-down"
          className="bg-popover text-muted-foreground flex h-6 cursor-default items-center justify-center rounded-b-lg"
        >
          <ChevronDown aria-hidden className="size-4" />
        </SelectPrimitive.ScrollDownArrow>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/* ------------------------------------------------------------------ Item -- */

type SelectItemProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Item>,
  "className" | "style"
>

function SelectItem({ children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text">
        {children}
      </SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator data-slot="select-item-indicator">
          <Check aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

/* -------------------------------------------------------- Group heading -- */

function SelectGroupLabel(
  props: Omit<
    React.ComponentProps<typeof SelectPrimitive.GroupLabel>,
    "className" | "style"
  >
) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs font-medium")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- Separator -- */

function SelectSeparator(
  props: Omit<
    React.ComponentProps<typeof SeparatorPrimitive>,
    "className" | "style"
  >
) {
  return (
    <SeparatorPrimitive
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px")}
      {...props}
    />
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
}
