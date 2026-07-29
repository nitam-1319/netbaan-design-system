"use client";

import * as React from "react"
import { Clock } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

/**
 * AEGIS — Session Timeout Modal (Auth & Security)
 *
 * A modal that warns the user their session is about to expire and offers an
 * explicit choice: extend it, or sign out now. It composes the AEGIS `Dialog`
 * (focus trap, backdrop, ARIA), `Button` (actions), and `Progress` (a draining
 * countdown bar), and runs a per-second countdown while open — firing `onTimeout`
 * when it reaches zero so the caller can log the user out.
 *
 * The remaining time is shown as text and as a progressbar (announced via ARIA),
 * so urgency is never colour-only. Public API is CLOSED — no `className` /
 * `style`; everything is a semantic prop. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type SessionTimeoutModalProps = {
  /** Controlled open state. */
  open: boolean
  /** Fired when the modal requests to open/close. */
  onOpenChange?: (open: boolean) => void
  /** Countdown length in seconds. Default 60. */
  countdownSeconds?: number
  /** Fired when the user chooses to stay signed in. */
  onExtend?: () => void
  /** Fired when the user chooses to sign out. */
  onLogout?: () => void
  /** Fired once when the countdown reaches zero. */
  onTimeout?: () => void
  /** Heading. Default "Your session is about to expire". */
  title?: React.ReactNode
  /** Supporting copy above the countdown. */
  description?: React.ReactNode
  /** Extend button label. Default "Stay signed in". */
  extendLabel?: React.ReactNode
  /** Logout button label. Default "Log out". */
  logoutLabel?: React.ReactNode
}

/** Format a whole number of seconds as M:SS. */
function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, "0")}`
}

function SessionTimeoutModal({
  open,
  onOpenChange,
  countdownSeconds = 60,
  onExtend,
  onLogout,
  onTimeout,
  title = "Your session is about to expire",
  description = "For your security you'll be signed out automatically. Do you want to stay signed in?",
  extendLabel = "Stay signed in",
  logoutLabel = "Log out",
}: SessionTimeoutModalProps) {
  const handleExtend = () => {
    onExtend?.()
    onOpenChange?.(false)
  }
  const handleLogout = () => {
    onLogout?.()
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        showClose={false}
        data-slot="session-timeout-modal"
      >
        <div className="flex items-start gap-3 text-start">
          <span
            data-slot="session-timeout-modal-icon"
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong [&>svg]:size-5"
          >
            <Clock />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-base leading-tight font-semibold text-foreground">
              {title}
            </p>
            {description != null ? (
              <p className="text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {/* The countdown lives in a child that mounts fresh each time the dialog
            opens (the portal only renders when open), so its state initialises to
            the full duration without any effect/render-phase reset. */}
        <SessionCountdown seconds={countdownSeconds} onTimeout={onTimeout} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            {logoutLabel}
          </Button>
          <Button variant="primary" size="sm" onClick={handleExtend}>
            {extendLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SessionCountdown({
  seconds,
  onTimeout,
}: {
  seconds: number
  onTimeout?: () => void
}) {
  const [remaining, setRemaining] = React.useState(seconds)

  // Tick down once per second while mounted; the setState is inside the interval
  // callback (not the effect body), so it is event-driven, not synchronous.
  React.useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Fire onTimeout exactly once when the countdown reaches zero.
  const timedOut = React.useRef(false)
  React.useEffect(() => {
    if (remaining === 0 && !timedOut.current) {
      timedOut.current = true
      onTimeout?.()
    }
  }, [remaining, onTimeout])

  const fraction = seconds > 0 ? remaining / seconds : 0
  const tone: "default" | "warning" | "critical" =
    fraction <= 0.25 ? "critical" : fraction <= 0.5 ? "warning" : "default"

  return (
    <div
      data-slot="session-timeout-modal-countdown"
      data-tone={tone}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Signing out in
        </span>
        <span
          data-slot="session-timeout-modal-remaining"
          aria-live="polite"
          className="font-mono text-sm font-semibold tabular-nums text-foreground"
        >
          {formatDuration(remaining)}
        </span>
      </div>
      <Progress
        value={remaining}
        max={seconds}
        tone={tone}
        aria-label="Time remaining before automatic sign-out"
      />
    </div>
  )
}

export { SessionTimeoutModal, formatDuration }
export type { SessionTimeoutModalProps }
