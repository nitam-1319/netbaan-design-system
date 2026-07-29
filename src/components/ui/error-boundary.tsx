"use client";

import * as React from "react"

import { ErrorState } from "@/components/ui/error-state"

/**
 * AEGIS — Error Boundary (Utilities, closed API)
 *
 * A React error boundary that catches render-time errors in its subtree and, in
 * their place, shows the AEGIS `Error State` wired to a **reset** — so a broken
 * widget degrades to a recoverable "Something went wrong · Try again" surface
 * instead of tearing down the whole app. Error boundaries must be class
 * components (there is no Hook equivalent for `componentDidCatch`), so this is
 * the one deliberately class-based part in the system; its public surface stays
 * declarative and closed.
 *
 *   <ErrorBoundary onReset={refetch} resetKeys={[query]}>
 *     <Widget />
 *   </ErrorBoundary>
 *
 * The default fallback is `Error State` with its Retry button calling `reset()`.
 * Provide a custom `fallback` — a node, or a render function given
 * `{ error, reset }` — to replace it. `resetKeys` clears the boundary whenever
 * any key changes (e.g. a new route or query), which is how you recover after
 * fixing the cause. Caught errors are reported through `onError` for logging.
 *
 * Public API is CLOSED: no `className` / `style`. The fallback is token-only via
 * `Error State`. See `.agent/rules/API_RULES.md`.
 */

type ErrorBoundaryFallbackProps = {
  /** The error that was caught. */
  error: Error
  /** Clears the boundary and re-renders the subtree. */
  reset: () => void
}

type ErrorBoundaryProps = {
  /** The protected subtree. */
  children?: React.ReactNode
  /**
   * What to show once an error is caught. A node, or a render function given
   * `{ error, reset }`. Omit for the default `Error State` fallback.
   */
  fallback?:
    | React.ReactNode
    | ((props: ErrorBoundaryFallbackProps) => React.ReactNode)
  /** Reported when an error is caught (logging / telemetry). */
  onError?: (error: Error, info: React.ErrorInfo) => void
  /** Called when the boundary resets (fix the cause here — e.g. refetch). */
  onReset?: () => void
  /** Any change (by `Object.is`) to a key clears the boundary. */
  resetKeys?: readonly unknown[]
  /** Heading for the default fallback. Defaults to Error State's default. */
  title?: React.ReactNode
  /** Supporting text for the default fallback. */
  description?: React.ReactNode
  /**
   * Show the caught error's message as the fallback's technical detail. Off by
   * default so internal messages aren't leaked to end users.
   */
  showErrorDetail?: boolean
}

type ErrorBoundaryState = {
  error: Error | null
}

function hasKeyChanged(
  a: readonly unknown[] | undefined,
  b: readonly unknown[] | undefined
): boolean {
  if (a === b) return false
  if (a == null || b == null) return a !== b
  if (a.length !== b.length) return true
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return true
  }
  return false
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Once errored, a change to any reset key clears the boundary — the idiom
    // for "the thing that failed has changed, try rendering again".
    if (
      this.state.error != null &&
      hasKeyChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ error: null })
    }
  }

  reset() {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const {
      children,
      fallback,
      title,
      description,
      showErrorDetail = false,
    } = this.props

    if (error != null) {
      if (typeof fallback === "function") {
        return (
          <>
            {(fallback as (p: ErrorBoundaryFallbackProps) => React.ReactNode)({
              error,
              reset: this.reset,
            })}
          </>
        )
      }
      if (fallback !== undefined) {
        return <>{fallback}</>
      }
      return (
        <ErrorState
          data-slot="error-boundary"
          title={title}
          description={description}
          detail={showErrorDetail ? error.message : undefined}
          onRetry={this.reset}
        />
      )
    }

    return children
  }
}

export { ErrorBoundary }
export type { ErrorBoundaryProps, ErrorBoundaryFallbackProps }
