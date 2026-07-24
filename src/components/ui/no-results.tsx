import * as React from "react"
import { SearchX } from "lucide-react"

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — No Results
 *
 * The specific empty state for "your search / filters matched nothing" — as
 * opposed to "there's nothing here yet" (that's **Empty State**). It's a thin,
 * config-driven convenience over `EmptyState`: a default search-off icon, a
 * sensible title/description that can weave in the current `query`, and an
 * optional "Clear" action wired to `onClear`.
 *
 * Public API is CLOSED — no `className` / `style`. Scale via `size`; content via
 * the semantic props; extra actions via `children`. Colours are token-only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type NoResultsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "title"
> & {
  /** Scale, forwarded to the underlying `EmptyState`. */
  size?: "sm" | "default" | "lg"
  /** The active search term; woven into the default description when present. */
  query?: string
  /** Heading. Defaults to "No results found". */
  title?: React.ReactNode
  /** Supporting text. Defaults to a query-aware sentence. */
  description?: React.ReactNode
  /** Icon glyph. Defaults to a search-off icon. */
  icon?: React.ReactNode
  /** When provided, renders a clear-search/filters button that calls this. */
  onClear?: () => void
  /** Label for the clear button. Default "Clear search". */
  clearLabel?: React.ReactNode
  /** Extra action(s) rendered after the clear button. */
  children?: React.ReactNode
}

function NoResults({
  size = "default",
  query,
  title = "No results found",
  description,
  icon,
  onClear,
  clearLabel = "Clear search",
  children,
  ...props
}: NoResultsProps) {
  const resolvedDescription =
    description ??
    (query
      ? `No matches for “${query}”. Try a different search or clearing your filters.`
      : "Try adjusting your search terms or filters.")

  const hasActions = onClear != null || children != null

  return (
    <EmptyState data-slot="no-results" size={size} {...props}>
      <EmptyStateIcon>{icon ?? <SearchX />}</EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{resolvedDescription}</EmptyStateDescription>
      {hasActions && (
        <EmptyStateActions>
          {onClear != null && (
            <Button variant="outline" size="sm" onClick={onClear}>
              {clearLabel}
            </Button>
          )}
          {children}
        </EmptyStateActions>
      )}
    </EmptyState>
  )
}

export { NoResults }
export type { NoResultsProps }
