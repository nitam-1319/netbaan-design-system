import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Combobox (Interactive tier, closed API)
 *
 * A text input that filters and selects from a list — an autocomplete. Built on
 * the Base UI Combobox primitive, which supplies the input↔list ARIA
 * (`role="combobox"` / `listbox` / `option`, `aria-activedescendant`), built-in
 * filtering of `items`, portalling, floating-engine positioning, roving
 * highlight, typeahead and outside-press / Escape dismissal.
 *
 * This build is **single-select** (see `.agent/DECISIONS.md`, 2026-07-22d):
 * multi-select with removable chips (`Chips` / `Chip` / `ChipRemove`) is a
 * documented REFACTOR backlog item, deferred rather than landed blind in a
 * no-browser sandbox. The input shell reuses the AEGIS Input tokens
 * (`border-strong`, `accent-soft` focus, 32 / 40 / 48px scale) so it sits
 * consistently beside Text Field / Search Input; the list surface mirrors
 * `Menu` / `Select` (`popover` token, `border-strong` ring).
 *
 * Public API is CLOSED: no `className` / `style` on any part. Sizing is the
 * semantic `size`; placement is semantic on `ComboboxContent`. Element
 * polymorphism stays available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function Combobox(props: React.ComponentProps<typeof ComboboxPrimitive.Root>) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />
}

/* ----------------------------------------------------------- Input shell -- */

const comboboxShellVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-accent-soft",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "h-8 text-[0.8rem]",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const comboboxAdornmentVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center text-muted-foreground transition-colors select-none outline-none",
    "hover:text-foreground focus-visible:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40"
  ),
  {
    variants: {
      size: {
        sm: "w-7 [&_svg]:size-3.5",
        md: "w-9 [&_svg]:size-4",
        lg: "w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type ComboboxInputProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Input>,
  "className" | "style" | "size"
> &
  VariantProps<typeof comboboxShellVariants> & {
    /** Hide the trailing clear button. */
    hideClear?: boolean
  }

function ComboboxInput({
  size = "md",
  hideClear = false,
  disabled,
  ...input
}: ComboboxInputProps) {
  return (
    <div
      data-slot="combobox-shell"
      data-disabled={disabled ? "" : undefined}
      className={cn(comboboxShellVariants({ size }))}
    >
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        disabled={disabled}
        className={cn(
          "w-full min-w-0 flex-1 bg-transparent px-3 outline-none",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed"
        )}
        {...input}
      />
      {!hideClear ? (
        <ComboboxPrimitive.Clear
          data-slot="combobox-clear"
          aria-label="Clear"
          className={cn(comboboxAdornmentVariants({ size }))}
        >
          <X aria-hidden />
        </ComboboxPrimitive.Clear>
      ) : null}
      <ComboboxPrimitive.Trigger
        data-slot="combobox-trigger"
        aria-label="Open"
        disabled={disabled}
        className={cn(comboboxAdornmentVariants({ size }))}
      >
        <ChevronsUpDown aria-hidden />
      </ComboboxPrimitive.Trigger>
    </div>
  )
}

/* --------------------------------------------------------------- Content -- */

type ComboboxContentProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof ComboboxPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof ComboboxPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
}

function ComboboxContent({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  children,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        data-slot="combobox-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong w-[var(--anchor-width)] max-h-[min(24rem,var(--available-height))] min-w-40 overflow-y-auto rounded-lg p-1 text-sm shadow-elevated ring-1 outline-none",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/* ------------------------------------------------------------------ List -- */

function ComboboxList(
  props: Omit<
    React.ComponentProps<typeof ComboboxPrimitive.List>,
    "className" | "style"
  >
) {
  return <ComboboxPrimitive.List data-slot="combobox-list" {...props} />
}

/* ----------------------------------------------------------------- Empty -- */

function ComboboxEmpty(
  props: Omit<
    React.ComponentProps<typeof ComboboxPrimitive.Empty>,
    "className" | "style"
  >
) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("text-muted-foreground px-2 py-6 text-center text-sm")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Item -- */

type ComboboxItemProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Item>,
  "className" | "style"
>

function ComboboxItem({ children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 px-2 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        className="text-accent-foreground ms-auto"
      >
        <Check aria-hidden />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

/* ----------------------------------------------------------------- Group -- */

function ComboboxGroup(
  props: Omit<
    React.ComponentProps<typeof ComboboxPrimitive.Group>,
    "className" | "style"
  >
) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" {...props} />
}

function ComboboxGroupLabel(
  props: Omit<
    React.ComponentProps<typeof ComboboxPrimitive.GroupLabel>,
    "className" | "style"
  >
) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs font-medium")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- Separator -- */

function ComboboxSeparator(
  props: Omit<
    React.ComponentProps<typeof SeparatorPrimitive>,
    "className" | "style"
  >
) {
  return (
    <SeparatorPrimitive
      data-slot="combobox-separator"
      className={cn("bg-border -mx-1 my-1 h-px")}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
}
