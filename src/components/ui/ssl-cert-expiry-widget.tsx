import * as React from "react"
import { ShieldCheck, ShieldX } from "lucide-react"

import { RadialGauge, type RadialGaugeProps } from "@/components/ui/radial-gauge"

/**
 * AEGIS — SSL / Cert Expiry Widget (Domain / ASM)
 *
 * A compact readout of how long a TLS certificate has left before it expires. It
 * composes the AEGIS `RadialGauge` (`shape="ring"`) — the ring depletes as the
 * remaining days fall through the validity window — with a centre "Nd" readout, a
 * humanised status line, and the certificate's host. Urgency tone escalates as
 * expiry nears (healthy → success, ≤warn → warning, ≤critical or expired →
 * danger).
 *
 * Days remaining and status are always spelled out as text (announced via the
 * meter's `aria-valuetext`), so urgency never depends on colour. Public API is
 * CLOSED — no `className` / `style`; everything is a semantic prop. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type SslCertExpiryWidgetProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Days until expiry. Negative means already expired. Required. */
  daysRemaining: number
  /** The validity window used for the ring's full scale (days). Default 90. */
  windowDays?: number
  /** Certificate host / subject (e.g. "api.example.com"). */
  domain?: React.ReactNode
  /** Label / meter accessible name. Default "Certificate expiry". */
  label?: React.ReactNode
  /** Days remaining at/under which tone → warning. Default 30. */
  warnDays?: number
  /** Days remaining at/under which tone → danger. Default 7. */
  criticalDays?: number
  /** Gauge scale. Default "md". */
  size?: RadialGaugeProps["size"]
  /** Arc weight. Default "regular". */
  thickness?: RadialGaugeProps["thickness"]
}

function SslCertExpiryWidget({
  daysRemaining,
  windowDays = 90,
  domain,
  label = "Certificate expiry",
  warnDays = 30,
  criticalDays = 7,
  size = "md",
  thickness = "regular",
  ...props
}: SslCertExpiryWidgetProps) {
  const expired = daysRemaining <= 0
  const window = windowDays > 0 ? windowDays : 90
  const fraction = Math.min(1, Math.max(0, daysRemaining / window))

  const tone: RadialGaugeProps["tone"] = expired
    ? "danger"
    : daysRemaining <= criticalDays
      ? "danger"
      : daysRemaining <= warnDays
        ? "warning"
        : "success"

  const status = expired
    ? `Expired ${Math.abs(daysRemaining)}d ago`
    : `Expires in ${daysRemaining}d`
  const labelText = typeof label === "string" ? label : "Certificate expiry"
  const StatusIcon = expired ? ShieldX : ShieldCheck

  return (
    <div
      data-slot="ssl-cert-expiry-widget"
      data-tone={tone}
      data-expired={expired || undefined}
      role="group"
      className="flex flex-col items-center gap-2"
      {...props}
    >
      {label != null ? (
        <span
          data-slot="ssl-cert-expiry-widget-label"
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </span>
      ) : null}

      <RadialGauge
        data-slot="ssl-cert-expiry-widget-meter"
        value={Math.round(fraction * 100)}
        min={0}
        max={100}
        tone={tone}
        shape="ring"
        size={size}
        thickness={thickness}
        label={labelText}
        valueLabel={status}
      >
        <span className="flex flex-col items-center leading-none">
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {expired ? "0" : daysRemaining}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-faint">
            days
          </span>
        </span>
      </RadialGauge>

      <span
        data-slot="ssl-cert-expiry-widget-status"
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <StatusIcon aria-hidden className="size-3.5 shrink-0" />
        {status}
      </span>

      {domain != null ? (
        <span
          data-slot="ssl-cert-expiry-widget-domain"
          className="max-w-full truncate font-mono text-xs text-text-faint"
        >
          {domain}
        </span>
      ) : null}
    </div>
  )
}

export { SslCertExpiryWidget }
export type { SslCertExpiryWidgetProps }
