import * as React from "react"
import { RotateCw, TriangleAlert } from "lucide-react"

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Error State
 *
 * The empty state for "we couldn't load / do this" — a failed fetch, a broken
 * widget, a rejected action. It is a config-driven convenience over
 * `EmptyState`: a warning glyph tinted with the `destructive` token, a
 * title/description, an optional collapsed error `detail`, and a primary
 * **Retry** action wired to `onRetry`.
 *
 * Distinct from **No Results** (a search matched nothing) and **Empty State**
 * (there's nothing here yet) — this one signals a *failure* the user can retry.
 *
 * Public API is CLOSED — no `className` / `style`. Scale via `size`; content via
 * semantic props; extra actions via `children`. Colours are token-only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type ErrorStateProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "title"
> & {
  /** Scale, forwarded to the underlying `EmptyState`. */
  size?: "sm" | "default" | "lg"
  /** Heading. Defaults to "Something went wrong". */
  title?: React.ReactNode
  /** Supporting text. Defaults to a retry-oriented sentence. */
  description?: React.ReactNode
  /** Icon glyph. Defaults to a warning triangle (destructive-tinted). */
  icon?: React.ReactNode
  /** Optional technical detail (error message) shown in a muted mono chip. */
  detail?: React.ReactNode
  /** When provided, renders a primary Retry button that calls this. */
  onRetry?: () => void
  /** Label for the retry button. Default "Try again". */
  retryLabel?: React.ReactNode
  /** Extra action(s) rendered after the retry button. */
  children?: React.ReactNode
}

function ErrorState({
  size = "default",
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  icon,
  detail,
  onRetry,
  retryLabel = "Try again",
  children,
  ...props
}: ErrorStateProps) {
  const hasActions = onRetry != null || children != null

  return (
    <EmptyState data-slot="error-state" role="alert" size={size} {...props}>
      <EmptyStateIcon>
        {icon ?? <TriangleAlert className="text-destructive" />}
      </EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
      {detail != null && (
        <p
          data-slot="error-state-detail"
          className="max-w-sm truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
        >
          {detail}
        </p>
      )}
      {hasActions && (
        <EmptyStateActions>
          {onRetry != null && (
            <Button variant="primary" size="sm" onClick={onRetry}>
              <RotateCw />
              {retryLabel}
            </Button>
          )}
          {children}
        </EmptyStateActions>
      )}
    </EmptyState>
  )
}

export { ErrorState }
export type { ErrorStateProps }
