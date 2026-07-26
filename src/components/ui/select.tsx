import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Select (Interactive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Select.dc.html`: the outline / filled / flush
 * variants (default outline), the sm/md/lg size scale (32 / 42 / 48px, default
 * md), the resting / placeholder / hover / open-focus / error / disabled states,
 * a chevron that rotates 180° while open, a selected-row accent tint + check, and
 * a floating menu that enters with the signature `animate-menu-in` and carries the
 * shared `shadow-elevated` elevation. Built on the Base UI Select primitive —
 * portalling, floating-engine positioning, typeahead, roving focus, modal focus
 * management, native form integration and dismissal come from the primitive.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Trigger treatment is
 * the semantic `variant` / `size` props; placement is semantic on `SelectContent`;
 * layout inside the surface belongs in `Box` / `Stack`. Element polymorphism stays
 * available through Base UI's `render` prop. Tokens only.
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
    "group/select-trigger flex w-full cursor-pointer items-center justify-between gap-2.5 text-start whitespace-nowrap text-foreground bg-clip-padding outline-none select-none transition-[color,background-color,border-color,box-shadow] duration-150",
    "hover:border-accent-strong",
    "focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "data-[popup-open]:border-primary data-[popup-open]:bg-surface data-[popup-open]:ring-[3px] data-[popup-open]:ring-accent-soft",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
    "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    "data-[placeholder]:text-muted-foreground",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "h-8 rounded-[8px] px-3 text-xs",
        md: "h-[42px] rounded-[9px] px-3.5 text-sm",
        lg: "h-12 rounded-[11px] px-4 text-base",
      },
      variant: {
        outline: "border border-border-strong bg-surface-2",
        filled: "border border-transparent bg-surface-3",
        flush:
          "rounded-none border-0 border-b border-border-strong bg-transparent px-0.5",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
)

type SelectTriggerProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Trigger>,
  "className" | "style"
> &
  VariantProps<typeof selectTriggerVariants>

function SelectTrigger({ variant, size, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ variant, size }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="text-muted-foreground transition-transform duration-150 group-data-[popup-open]/select-trigger:rotate-180 group-data-[popup-open]/select-trigger:text-accent-strong [&_svg]:size-4"
      >
        <ChevronDown aria-hidden />
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
          className="bg-popover text-muted-foreground flex h-6 cursor-default items-center justify-center rounded-t-[11px]"
        >
          <ChevronUp aria-hidden className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[11px] p-1.5 text-sm shadow-elevated ring-1 outline-none",
            "animate-menu-in origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
        <SelectPrimitive.ScrollDownArrow
          data-slot="select-scroll-down"
          className="bg-popover text-muted-foreground flex h-6 cursor-default items-center justify-center rounded-b-[11px]"
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

function SelectItem({ children, label, ...props }: SelectItemProps) {
  // Base UI resolves the trigger's displayed label from the mounted items, which
  // unmount when the popup closes — so a string child is promoted to an explicit
  // `label` to keep the selected label visible after selection.
  const resolvedLabel =
    label ?? (typeof children === "string" ? children : undefined)
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      label={resolvedLabel}
      className={cn(
        "text-muted-foreground relative flex w-full cursor-default items-center justify-between gap-2.5 rounded-[7px] py-2 pr-2 pl-2.5 text-[0.8rem] font-medium outline-none transition-colors select-none",
        "data-[highlighted]:bg-accent-soft data-[highlighted]:text-foreground",
        "data-[selected]:bg-accent-soft data-[selected]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text">
        {children}
      </SelectPrimitive.ItemText>
      <span className="flex size-4 shrink-0 items-center justify-center text-accent-strong">
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
      className={cn("text-muted-foreground px-2.5 py-1.5 text-xs font-medium")}
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
  selectTriggerVariants,
}
