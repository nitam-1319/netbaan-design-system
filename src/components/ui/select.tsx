"use client"

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
 * shared `shadow-elevation-3` elevation. Built on the Base UI Select primitive —
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

/**
 * Carries the ids of the field chrome down to the trigger, so a labelled
 * `Select` is labelled the way every other AEGIS field is — a real `<label>`
 * element, not a caller-supplied `aria-label` that leaves the control visually
 * unlabelled.
 */
const SelectFieldContext = React.createContext<{
  labelId?: string
  describedBy?: string
  invalid?: boolean
}>({})

type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root> & {
  /**
   * The field's visible label, rendered in the field-label role and wired to
   * the trigger. `SearchInput`, `TextField` and `Checkbox` all take one; the
   * compound `Select` had no equivalent, so every labelled select in an app
   * hand-rolled the label — or reached for a bare `aria-label` and shipped a
   * control with no visible name.
   */
  label?: React.ReactNode
  /** Supporting text under the control. */
  description?: React.ReactNode
  /** Error message under the control; also marks the trigger invalid. */
  error?: React.ReactNode
}

function Select({
  label,
  description,
  error,
  children,
  ...props
}: SelectProps) {
  const base = React.useId()
  const labelId = label ? `${base}-label` : undefined
  const descriptionId = description ? `${base}-description` : undefined
  const errorId = error ? `${base}-error` : undefined
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  const root = (
    <SelectPrimitive.Root data-slot="select" {...props}>
      {children}
    </SelectPrimitive.Root>
  )

  if (!label && !description && !error) return root

  return (
    <SelectFieldContext.Provider
      value={{ labelId, describedBy, invalid: error != null }}
    >
      <div
        data-slot="select-field"
        className={cn("flex w-full flex-col gap-1.5")}
      >
        {label ? (
          <span
            id={labelId}
            data-slot="select-label"
            className={cn(
              "text-sm font-medium text-foreground",
              props.disabled && "opacity-50"
            )}
          >
            {label}
          </span>
        ) : null}
        {root}
        {description ? (
          <span
            id={descriptionId}
            data-slot="select-description"
            className={cn("text-xs text-muted-foreground")}
          >
            {description}
          </span>
        ) : null}
        {error ? (
          <span
            id={errorId}
            data-slot="select-error"
            className={cn("text-xs text-destructive-ink")}
          >
            {error}
          </span>
        ) : null}
      </div>
    </SelectFieldContext.Provider>
  )
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
    "group/select-trigger flex w-full cursor-pointer items-center justify-between gap-2.5 bg-clip-padding text-start whitespace-nowrap text-foreground transition-[color,background-color,border-color,box-shadow] duration-150 outline-none select-none",
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

function SelectTrigger({
  variant,
  size,
  children,
  ...props
}: SelectTriggerProps) {
  const field = React.useContext(SelectFieldContext)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      {...props}
      aria-labelledby={
        field.labelId
          ? [field.labelId, props["aria-labelledby"]].filter(Boolean).join(" ")
          : props["aria-labelledby"]
      }
      aria-describedby={props["aria-describedby"] ?? field.describedBy}
      aria-invalid={props["aria-invalid"] ?? (field.invalid || undefined)}
      className={cn(selectTriggerVariants({ variant, size }))}
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
          className="flex h-6 cursor-default items-center justify-center rounded-t-[11px] bg-popover text-muted-foreground"
        >
          <ChevronUp aria-hidden className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-[min(24rem,var(--available-height))] max-w-[calc(100vw-2rem)] min-w-[var(--anchor-width)] overflow-y-auto rounded-[11px] bg-popover p-1.5 text-sm text-popover-foreground shadow-elevation-3 ring-1 ring-border-strong outline-none",
            "origin-[var(--transform-origin)] animate-menu-in transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:motion-exit"
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
        <SelectPrimitive.ScrollDownArrow
          data-slot="select-scroll-down"
          className="flex h-6 cursor-default items-center justify-center rounded-b-[11px] bg-popover text-muted-foreground"
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
        "relative flex w-full cursor-default items-center justify-between gap-2.5 rounded-[7px] py-2 ps-2.5 pe-2 text-[0.8rem] font-medium text-muted-foreground transition-colors outline-none select-none",
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
      className={cn("px-2.5 py-1.5 text-xs font-medium text-muted-foreground")}
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
      className={cn("-mx-1 my-1 h-px bg-border")}
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

export type { SelectProps }
