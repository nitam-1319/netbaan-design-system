"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Empty State (Feedback tier, closed API)
 *
 * A centered placeholder for a region that has no content yet — an empty list,
 * a cleared queue, a first-run surface, or a filtered view with no matches. It
 * composes an optional icon, a title, supporting text, and an action row so a
 * dead-end reads as intentional guidance rather than a broken screen.
 *
 * Public API is CLOSED: no `className` / `style`. Scale is the semantic `size`
 * prop; the action row is composed from AEGIS `Button`s. Colors are token-only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        /**
         * The in-card empty: a 40px plate and a 13.5px title, sized to sit
         * inside a panel rather than to fill a page.
         */
        compact: "gap-2 p-6",
        sm: "gap-2 p-6",
        default: "gap-3 p-10",
        lg: "gap-4 p-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const emptyStateIconVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground",
  {
    variants: {
      size: {
        compact: "size-10 [&>svg]:size-[18px]",
        sm: "size-9 [&>svg]:size-4",
        default: "size-12 [&>svg]:size-6",
        lg: "size-16 [&>svg]:size-8",
      },
      /**
       * `circle` is the feedback plate. `squircle` is the tinted-glyph plate
       * the rest of the app uses (12px radius), so an empty state inside a card
       * matches the icons around it instead of introducing a second shape.
       */
      shape: {
        circle: "rounded-full",
        squircle: "rounded-xl",
      },
      /** Which surface the plate sits on. */
      surface: {
        muted: "bg-muted",
        raised: "bg-surface-2",
        none: "bg-transparent",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
      surface: "muted",
    },
  }
)

type EmptyStateSize = "compact" | "sm" | "default" | "lg"
type EmptyStateContextValue = { size: EmptyStateSize }
const EmptyStateContext = React.createContext<EmptyStateContextValue>({
  size: "default",
})

type EmptyStateProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof emptyStateVariants>

function EmptyState({ size = "default", children, ...props }: EmptyStateProps) {
  return (
    <EmptyStateContext.Provider value={{ size: size ?? "default" }}>
      <div
        data-slot="empty-state"
        role="status"
        className={cn(emptyStateVariants({ size }))}
        {...props}
      >
        {children}
      </div>
    </EmptyStateContext.Provider>
  )
}

type EmptyStateIconProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  Pick<VariantProps<typeof emptyStateIconVariants>, "shape" | "surface">

function EmptyStateIcon({
  shape,
  surface,
  children,
  ...props
}: EmptyStateIconProps) {
  const { size } = React.useContext(EmptyStateContext)
  return (
    <div
      data-slot="empty-state-icon"
      aria-hidden
      className={cn(
        emptyStateIconVariants({
          size,
          shape: shape ?? (size === "compact" ? "squircle" : "circle"),
          surface: surface ?? (size === "compact" ? "raised" : "muted"),
        })
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyStateTitle({
  ...props
}: Omit<React.ComponentProps<"h3">, "className" | "style">) {
  const { size } = React.useContext(EmptyStateContext)
  return (
    <h3
      data-slot="empty-state-title"
      className={cn(
        "font-semibold text-foreground",
        size === "compact" ? "text-[13.5px]" : "text-base"
      )}
      {...props}
    />
  )
}

function EmptyStateDescription({
  ...props
}: Omit<React.ComponentProps<"p">, "className" | "style">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("max-w-sm text-sm text-pretty text-muted-foreground")}
      {...props}
    />
  )
}

function EmptyStateActions({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn("mt-2 flex flex-wrap items-center justify-center gap-2")}
      {...props}
    />
  )
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  emptyStateVariants,
  emptyStateIconVariants,
}
