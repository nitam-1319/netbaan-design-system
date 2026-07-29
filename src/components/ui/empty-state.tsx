"use client";

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
  "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-9 [&>svg]:size-4",
        default: "size-12 [&>svg]:size-6",
        lg: "size-16 [&>svg]:size-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type EmptyStateContextValue = { size: "sm" | "default" | "lg" }
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

function EmptyStateIcon({
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  const { size } = React.useContext(EmptyStateContext)
  return (
    <div
      data-slot="empty-state-icon"
      aria-hidden
      className={cn(emptyStateIconVariants({ size }))}
      {...props}
    >
      {children}
    </div>
  )
}

function EmptyStateTitle({
  ...props
}: Omit<React.ComponentProps<"h3">, "className" | "style">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn("text-base font-semibold text-foreground")}
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
      className={cn("max-w-sm text-sm text-muted-foreground text-pretty")}
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
}
