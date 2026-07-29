"use client";

import * as React from "react"
import { Bell, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
} from "@/components/ui/drawer"
import { List, ListItem, ListItemContent } from "@/components/ui/list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Notification Center (Feedback)
 *
 * An edge-anchored panel that lists a user's notifications — unread first, each
 * with a title, optional description, timestamp, and a dismiss control — plus a
 * header unread count and a "mark all read" action. It composes the AEGIS
 * `Drawer` (portal, focus trap, ARIA), `List` / `ListItem`, `Badge` (count), and
 * `Button`, so it inherits the system's overlay and list affordances.
 *
 * Unread state is conveyed by a dot **and** stronger text weight (never colour
 * alone). Controlled via `open` + `onOpenChange`, with an optional `trigger`.
 * Public API is CLOSED — no `className` / `style`; everything is a semantic prop.
 * All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type Notification = {
  /** Stable id passed to the row callbacks. */
  id: string
  /** Notification title / headline. */
  title: React.ReactNode
  /** Supporting description. */
  description?: React.ReactNode
  /** Relative time label, e.g. "2m ago". */
  time?: React.ReactNode
  /** Whether the notification has been read. */
  read?: boolean
}

type NotificationCenterProps = {
  /** The notifications to show. */
  notifications: Notification[]
  /** Controlled open state. */
  open?: boolean
  /** Open/close callback. */
  onOpenChange?: (open: boolean) => void
  /** An element that opens the panel (wrapped as the drawer trigger). */
  trigger?: React.ReactElement
  /** Panel title. Default "Notifications". */
  title?: React.ReactNode
  /** Fired with a notification id when its row is activated. */
  onNotificationClick?: (id: string) => void
  /** Fired with a notification id when its dismiss button is pressed. */
  onDismiss?: (id: string) => void
  /** Fired when "mark all read" is pressed. Button hidden when omitted. */
  onMarkAllRead?: () => void
  /** Side the panel slides from. Default "right". */
  side?: React.ComponentProps<typeof DrawerContent>["side"]
  /** Message shown when there are no notifications. */
  emptyLabel?: React.ReactNode
}

function NotificationCenter({
  notifications,
  open,
  onOpenChange,
  trigger,
  title = "Notifications",
  onNotificationClick,
  onDismiss,
  onMarkAllRead,
  side = "right",
  emptyLabel = "You're all caught up.",
}: NotificationCenterProps) {
  const unread = notifications.filter((n) => !n.read).length
  const isEmpty = notifications.length === 0

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger render={trigger} /> : null}
      <DrawerContent side={side} data-slot="notification-center">
        <DrawerHeader>
          <DrawerTitle>
            <span className="flex items-center gap-2">
              <Bell aria-hidden className="size-4 shrink-0" />
              {title}
              {unread > 0 ? (
                <Badge
                  tone="accent"
                  variant="soft"
                  size="sm"
                  count={unread}
                  data-slot="notification-center-unread-count"
                />
              ) : null}
            </span>
          </DrawerTitle>
          {onMarkAllRead && unread > 0 ? (
            <span>
              <Button variant="link" size="sm" onClick={onMarkAllRead}>
                Mark all read
              </Button>
            </span>
          ) : null}
        </DrawerHeader>

        <DrawerBody>
          {isEmpty ? (
            <div
              data-slot="notification-center-empty"
              className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground"
            >
              <Bell aria-hidden className="size-6 text-text-faint" />
              {emptyLabel}
            </div>
          ) : (
            <List variant="divided">
              {notifications.map((n) => {
                const interactive = onNotificationClick != null
                return (
                  <ListItem
                    key={n.id}
                    data-slot="notification-center-item"
                    data-read={n.read || undefined}
                    interactive={interactive}
                    onClick={
                      interactive ? () => onNotificationClick?.(n.id) : undefined
                    }
                    density="comfortable"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-primary"
                      )}
                    />
                    <ListItemContent>
                      <span
                        className={cn(
                          "text-sm",
                          n.read
                            ? "font-normal text-muted-foreground"
                            : "font-medium text-foreground"
                        )}
                      >
                        {n.title}
                      </span>
                      {n.description != null ? (
                        <span className="text-xs text-muted-foreground text-pretty">
                          {n.description}
                        </span>
                      ) : null}
                      {n.time != null ? (
                        <span className="text-xs text-text-faint">{n.time}</span>
                      ) : null}
                    </ListItemContent>
                    {onDismiss ? (
                      <button
                        type="button"
                        data-slot="notification-center-dismiss"
                        aria-label="Dismiss notification"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDismiss(n.id)
                        }}
                        className={cn(
                          "ms-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md text-text-faint outline-none transition-colors",
                          "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft [&>svg]:size-3.5"
                        )}
                      >
                        <X aria-hidden />
                      </button>
                    ) : null}
                  </ListItem>
                )
              })}
            </List>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export { NotificationCenter }
export type { NotificationCenterProps, Notification }
