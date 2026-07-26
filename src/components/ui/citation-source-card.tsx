import * as React from "react"
import { ExternalLink, FileText } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

/**
 * AEGIS — Citation / Source Card (AI Components)
 *
 * A card that attributes an AI answer to one of its sources — the retrieved
 * document, page, or record behind a claim. It composes the AEGIS `Card`
 * (inheriting the surface, border, and — when it links — the interactive lift +
 * spotlight), and lays out an ordinal marker, the source name, the title, and an
 * optional supporting snippet.
 *
 * When `href` is set the whole card becomes a single link (a stretched anchor),
 * so the title is the accessible name and the entire surface is the hit target.
 * Public API is CLOSED — no `className` / `style`; everything is a semantic prop.
 * All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type CitationSourceCardProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The source title / headline. Required — becomes the link's accessible name. */
  title: React.ReactNode
  /** Link to the source. When set the whole card is clickable. */
  href?: string
  /** Source name / publisher / domain (e.g. "nvd.nist.gov"). */
  source?: React.ReactNode
  /** A short supporting excerpt from the source. */
  snippet?: React.ReactNode
  /** Ordinal marker shown in the corner chip (e.g. 1 → "1"). */
  index?: number
  /** Leading source glyph. Defaults to a document icon. */
  icon?: React.ReactNode
  /** Anchor target (adds `rel="noreferrer"` for `_blank`). */
  target?: string
}

function CitationSourceCard({
  title,
  href,
  source,
  snippet,
  index,
  icon,
  target,
  ...props
}: CitationSourceCardProps) {
  const isLink = href != null

  return (
    <Card
      data-slot="citation-source-card"
      variant="default"
      interactive={isLink}
      {...props}
    >
      <CardContent>
        <div className="flex gap-3">
          {index != null ? (
            <span
              data-slot="citation-source-card-index"
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-xs font-semibold tabular-nums text-accent-strong"
            >
              {index}
            </span>
          ) : (
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-3.5"
            >
              {icon ?? <FileText />}
            </span>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {source != null ? (
              <span
                data-slot="citation-source-card-source"
                className="flex items-center gap-1 truncate text-xs font-medium text-muted-foreground"
              >
                {source}
                {isLink ? (
                  <ExternalLink aria-hidden className="size-3 shrink-0" />
                ) : null}
              </span>
            ) : null}

            <span
              data-slot="citation-source-card-title"
              className="font-heading text-sm font-semibold leading-snug tracking-tight text-foreground text-pretty"
            >
              {isLink ? (
                <a
                  href={href}
                  target={target}
                  rel={target === "_blank" ? "noreferrer" : undefined}
                  className="outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-accent-soft"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </span>

            {snippet != null ? (
              <p
                data-slot="citation-source-card-snippet"
                className="line-clamp-3 text-xs leading-relaxed text-muted-foreground text-pretty"
              >
                {snippet}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { CitationSourceCard }
export type { CitationSourceCardProps }
