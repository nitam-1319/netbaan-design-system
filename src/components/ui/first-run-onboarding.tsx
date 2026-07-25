import * as React from "react"
import { Rocket } from "lucide-react"

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — First-run Onboarding (Empty & Loading States, closed API)
 *
 * The welcoming first-run surface shown where content will eventually live but
 * the user hasn't done anything yet — an empty workspace, a fresh project, a
 * brand-new inbox. Distinct from **Empty State** ("nothing here yet", neutral)
 * and **No Results** ("your search matched nothing"): this is an intentional,
 * encouraging *get started* screen with a short list of next steps and a primary
 * call to action.
 *
 * It's a config-driven convenience over `EmptyState`: a default rocket glyph,
 * a welcome title/description, an ordered `steps` checklist, and primary /
 * secondary action buttons composed from AEGIS `Button`.
 *
 * Public API is CLOSED — no `className` / `style`. Scale via `size`; content via
 * the semantic props; extra actions via `children`. Colours are token-only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

interface OnboardingStep {
  /** The step's headline, e.g. "Create your first project". */
  title: React.ReactNode
  /** Optional supporting line under the step title. */
  description?: React.ReactNode
  /** Optional leading glyph; falls back to the step number. */
  icon?: React.ReactNode
}

type FirstRunOnboardingProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "title"
> & {
  /** Scale, forwarded to the underlying `EmptyState`. */
  size?: "sm" | "default" | "lg"
  /** Heading. Defaults to "Welcome". */
  title?: React.ReactNode
  /** Supporting text under the title. */
  description?: React.ReactNode
  /** Icon glyph. Defaults to a rocket. */
  icon?: React.ReactNode
  /** An ordered list of getting-started steps. */
  steps?: OnboardingStep[]
  /** Primary call to action handler. Renders the primary button when set. */
  onPrimary?: () => void
  /** Primary button label. Default "Get started". */
  primaryLabel?: React.ReactNode
  /** Secondary action handler (e.g. "Skip", "Take a tour"). */
  onSecondary?: () => void
  /** Secondary button label. Default "Skip for now". */
  secondaryLabel?: React.ReactNode
  /** Extra action(s) rendered after the primary / secondary buttons. */
  children?: React.ReactNode
}

function FirstRunOnboarding({
  size = "default",
  title = "Welcome",
  description,
  icon,
  steps,
  onPrimary,
  primaryLabel = "Get started",
  onSecondary,
  secondaryLabel = "Skip for now",
  children,
  ...props
}: FirstRunOnboardingProps) {
  const hasSteps = steps != null && steps.length > 0
  const hasActions =
    onPrimary != null || onSecondary != null || children != null

  return (
    <EmptyState data-slot="first-run-onboarding" size={size} {...props}>
      <EmptyStateIcon>{icon ?? <Rocket />}</EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {description != null && (
        <EmptyStateDescription>{description}</EmptyStateDescription>
      )}

      {hasSteps && (
        <ol
          data-slot="first-run-onboarding-steps"
          className="mt-2 flex w-full max-w-sm flex-col gap-3 text-start"
        >
          {steps.map((step, i) => (
            <li
              key={i}
              data-slot="first-run-onboarding-step"
              className="flex items-start gap-3"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground [&>svg]:size-3.5"
              >
                {step.icon ?? i + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {step.title}
                </span>
                {step.description != null && (
                  <span className="text-xs text-muted-foreground text-pretty">
                    {step.description}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}

      {hasActions && (
        <EmptyStateActions>
          {onPrimary != null && (
            <Button variant="default" size="lg" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          )}
          {onSecondary != null && (
            <Button variant="outline" size="lg" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          {children}
        </EmptyStateActions>
      )}
    </EmptyState>
  )
}

export { FirstRunOnboarding }
export type { FirstRunOnboardingProps, OnboardingStep }
