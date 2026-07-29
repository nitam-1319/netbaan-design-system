"use client";

import * as React from "react"
import { Monitor, Smartphone, Tablet, MapPin } from "lucide-react"

import { List, ListItem, ListItemContent } from "@/components/ui/list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Device / Session List (Auth & Security)
 *
 * The "where you're signed in" panel: a list of active sessions across a user's
 * devices, each showing the device, browser/OS, location, last-active time, a
 * "Current" marker for this session, and a per-row revoke action. It composes the
 * AEGIS `List` / `ListItem` (spacing, dividers), `Badge` (the current marker),
 * and `Button` (revoke), so it inherits the system's affordances.
 *
 * The current session is marked with text (not colour alone) and cannot be
 * revoked from its own row. Public API is CLOSED — no `className` / `style`;
 * everything is a semantic prop. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type DeviceType = "desktop" | "mobile" | "tablet"

type DeviceSession = {
  /** Stable id passed back to `onRevoke`. */
  id: string
  /** Device name, e.g. "MacBook Pro". */
  device: React.ReactNode
  /** Device form factor → leading glyph. Default "desktop". */
  type?: DeviceType
  /** Browser / OS string, e.g. "Chrome on macOS". */
  browser?: React.ReactNode
  /** Approximate location, e.g. "Tehran, IR". */
  location?: React.ReactNode
  /** Last-active label, e.g. "Active now", "2h ago". */
  lastActive?: React.ReactNode
  /** Marks this row as the current session (no revoke). */
  current?: boolean
}

const DEVICE_ICON: Record<DeviceType, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

type DeviceSessionListProps = Omit<
  React.ComponentProps<typeof List>,
  "children" | "variant" | "ordered"
> & {
  /** The active sessions to list. */
  sessions: DeviceSession[]
  /** Fired with a session id when its revoke button is pressed. */
  onRevoke?: (id: string) => void
  /** Label for the current-session marker. Default "Current". */
  currentLabel?: React.ReactNode
  /** Label for the revoke button. Default "Revoke". */
  revokeLabel?: React.ReactNode
  /** Message shown when there are no sessions. Default "No active sessions." */
  emptyLabel?: React.ReactNode
}

function DeviceSessionList({
  sessions,
  onRevoke,
  currentLabel = "Current",
  revokeLabel = "Revoke",
  emptyLabel = "No active sessions.",
  ...props
}: DeviceSessionListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div
        data-slot="device-session-list-empty"
        className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <List data-slot="device-session-list" variant="bordered" {...props}>
      {sessions.map((session) => {
        const Icon = DEVICE_ICON[session.type ?? "desktop"]
        return (
          <ListItem
            key={session.id}
            data-slot="device-session-list-item"
            data-current={session.current || undefined}
            density="comfortable"
          >
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-3 text-muted-foreground [&>svg]:size-4.5"
            >
              <Icon />
            </span>

            <ListItemContent>
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {session.device}
                </span>
                {session.current ? (
                  <Badge
                    tone="success"
                    variant="soft"
                    size="sm"
                    dot
                    data-slot="device-session-list-current"
                  >
                    {currentLabel}
                  </Badge>
                ) : null}
              </span>

              {session.browser != null ? (
                <span className="truncate text-xs text-muted-foreground">
                  {session.browser}
                </span>
              ) : null}

              {(session.location != null || session.lastActive != null) && (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-faint">
                  {session.location != null ? (
                    <span className="flex items-center gap-1">
                      <MapPin aria-hidden className="size-3 shrink-0" />
                      {session.location}
                    </span>
                  ) : null}
                  {session.location != null && session.lastActive != null ? (
                    <span aria-hidden>·</span>
                  ) : null}
                  {session.lastActive != null ? (
                    <span>{session.lastActive}</span>
                  ) : null}
                </span>
              )}
            </ListItemContent>

            {!session.current ? (
              <span className="ms-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRevoke?.(session.id)}
                  aria-label={
                    typeof session.device === "string"
                      ? `${revokeLabel} — ${session.device}`
                      : undefined
                  }
                >
                  {revokeLabel}
                </Button>
              </span>
            ) : null}
          </ListItem>
        )
      })}
    </List>
  )
}

export { DeviceSessionList }
export type { DeviceSessionListProps, DeviceSession, DeviceType }
