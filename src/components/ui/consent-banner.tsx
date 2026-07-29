"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Cookie, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Consent / Cookie Banner
 *
 * A privacy/cookie consent notice. It shares the AEGIS **Alert / Banner** design
 * language (a token-surfaced region with an optional leading glyph) and adds a
 * consent action row: Accept all, Reject all, and an optional Manage preferences
 * control, plus an optional policy link. Render it `inline`, or pin it to the
 * `bottom` of the viewport, or as a `floating` card.
 *
 * Public API is CLOSED — no `className` / `style`. Configure via the semantic
 * props; colour, elevation, and spacing are token-only.
 * See `.agent/rules/API_RULES.md`.
 */

const bannerVariants = cva(
  "flex gap-3 border border-border bg-card text-card-foreground shadow-elevated",
  {
    variants: {
      placement: {
        inline: "rounded-xl p-4",
        bottom:
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-x-0 border-b-0 p-4 sm:inset-x-4 sm:bottom-4 sm:rounded-xl sm:border",
        top: "fixed inset-x-0 top-0 z-50 rounded-b-xl border-x-0 border-t-0 p-4 sm:inset-x-4 sm:top-4 sm:rounded-xl sm:border",
        floating:
          "fixed start-4 bottom-4 z-50 max-w-sm rounded-xl p-4",
      },
    },
    defaultVariants: { placement: "inline" },
  }
)

type ConsentBannerProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "title"
> &
  VariantProps<typeof bannerVariants> & {
    /** Heading. Default "We value your privacy". */
    title?: React.ReactNode
    /** Body copy. Falls back to a standard cookie notice. */
    description?: React.ReactNode
    /** Accept-all handler + label. */
    onAccept?: () => void
    acceptLabel?: React.ReactNode
    /** Reject-all handler + label. */
    onReject?: () => void
    rejectLabel?: React.ReactNode
    /** Optional "manage preferences" handler + label. */
    onManage?: () => void
    manageLabel?: React.ReactNode
    /** Optional policy link. */
    policyHref?: string
    policyLabel?: React.ReactNode
    /** Show the leading cookie glyph. Default `true`. */
    showIcon?: boolean
    /**
     * Show a dismiss (×) button. It calls `onDismiss` if given, else `onReject`.
     */
    onDismiss?: () => void
  }

function ConsentBanner({
  placement = "inline",
  title = "We value your privacy",
  description,
  onAccept,
  acceptLabel = "Accept all",
  onReject,
  rejectLabel = "Reject all",
  onManage,
  manageLabel = "Manage preferences",
  policyHref,
  policyLabel = "Privacy Policy",
  showIcon = true,
  onDismiss,
  ...props
}: ConsentBannerProps) {
  const titleId = React.useId()
  const descId = React.useId()
  const dismiss = onDismiss ?? onReject

  const resolvedDescription = description ?? (
    <>
      We use cookies to enhance your experience, analyze traffic, and personalize
      content. You can accept all cookies or manage your preferences.
    </>
  )

  return (
    <div
      data-slot="consent-banner"
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(bannerVariants({ placement }))}
      {...props}
    >
      {showIcon && (
        <span
          aria-hidden
          className="mt-0.5 hidden size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong sm:inline-flex"
        >
          <Cookie className="size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span
            id={titleId}
            data-slot="consent-title"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {title}
          </span>
          <p
            id={descId}
            data-slot="consent-description"
            className="text-sm text-muted-foreground text-pretty"
          >
            {resolvedDescription}
            {policyHref && (
              <>
                {" "}
                <a
                  href={policyHref}
                  className="font-medium text-accent-strong underline underline-offset-[3px] outline-none hover:brightness-110 focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-accent-soft"
                >
                  {policyLabel}
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={onAccept}>
            {acceptLabel}
          </Button>
          <Button variant="outline" size="sm" onClick={onReject}>
            {rejectLabel}
          </Button>
          {onManage && (
            <Button variant="ghost" size="sm" onClick={onManage}>
              {manageLabel}
            </Button>
          )}
        </div>
      </div>

      {dismiss && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X />
        </Button>
      )}
    </div>
  )
}

export { ConsentBanner, bannerVariants as consentBannerVariants }
export type { ConsentBannerProps }
