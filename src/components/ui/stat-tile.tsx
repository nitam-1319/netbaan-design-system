import * as React from "react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Stat / KPI Tile
 *
 * A compact tile for a single headline metric: a label, a large value, an
 * optional delta (trend + change), a supporting caption, and an optional inline
 * chart (a `Sparkline`). Use it in dashboards, overview grids, and summary rows
 * where a number needs to read at a glance with just enough context.
 *
 * Composition-first — assemble the tile from its slot parts so any layout works:
 *   <StatTile>
 *     <StatTileHeader>
 *       <StatTileLabel>Open findings</StatTileLabel>
 *       <StatTileIcon><ShieldAlert /></StatTileIcon>
 *     </StatTileHeader>
 *     <StatTileValue>1,284<StatTileUnit>issues</StatTileUnit></StatTileValue>
 *     <StatTileDelta trend="down" sentiment="positive">12%</StatTileDelta>
 *     <StatTileCaption>vs. last 7 days</StatTileCaption>
 *     <StatTileChart><Sparkline data={[…]} /></StatTileChart>
 *   </StatTile>
 *
 * Public API is CLOSED — no `className` / `style`. Scale is the semantic `size`
 * prop; the delta's meaning comes from `trend` (direction) and `sentiment`
 * (good/bad), never colour alone. All colour is token-driven.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

/* --------------------------------------------------------------- context -- */

type StatTileSize = "sm" | "md" | "lg"
type StatTileContextValue = { size: StatTileSize }
const StatTileContext = React.createContext<StatTileContextValue>({
  size: "md",
})
const useStatTileSize = () => React.useContext(StatTileContext).size

/* ------------------------------------------------------------------ root -- */

const statTileVariants = cva(
  "flex flex-col rounded-xl border border-border bg-card text-card-foreground glass-panel",
  {
    variants: {
      size: {
        sm: "gap-1 p-3",
        md: "gap-1.5 p-4",
        lg: "gap-2 p-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type StatTileProps = Omit<React.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof statTileVariants>

function StatTile({ size = "md", children, ...props }: StatTileProps) {
  return (
    <StatTileContext.Provider value={{ size: size ?? "md" }}>
      <div
        data-slot="stat-tile"
        role="group"
        className={cn(statTileVariants({ size }))}
        {...props}
      >
        {children}
      </div>
    </StatTileContext.Provider>
  )
}

/* ---------------------------------------------------------------- header -- */

function StatTileHeader({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="stat-tile-header"
      className={cn("flex items-start justify-between gap-2")}
      {...props}
    />
  )
}

const labelVariants = cva("font-medium text-muted-foreground", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm",
    },
  },
  defaultVariants: { size: "md" },
})

function StatTileLabel({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  const size = useStatTileSize()
  return (
    <div
      data-slot="stat-tile-label"
      className={cn(labelVariants({ size }))}
      {...props}
    />
  )
}

const iconVariants = cva(
  "flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-6 [&>svg]:size-3.5",
        md: "size-7 [&>svg]:size-4",
        lg: "size-8 [&>svg]:size-4.5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function StatTileIcon({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  const size = useStatTileSize()
  return (
    <div
      data-slot="stat-tile-icon"
      aria-hidden
      className={cn(iconVariants({ size }))}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------- value -- */

const valueVariants = cva(
  "font-heading font-semibold leading-none tracking-tight text-foreground tabular-nums",
  {
    variants: {
      size: {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function StatTileValue({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  const size = useStatTileSize()
  return (
    <div
      data-slot="stat-tile-value"
      className={cn(
        valueVariants({ size }),
        "flex items-baseline gap-1"
      )}
      {...props}
    />
  )
}

function StatTileUnit({
  ...props
}: Omit<React.ComponentProps<"span">, "className" | "style">) {
  return (
    <span
      data-slot="stat-tile-unit"
      className={cn("text-sm font-medium text-muted-foreground")}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------- delta -- */

const deltaVariants = cva(
  "inline-flex w-fit items-center gap-0.5 font-medium tabular-nums [&>svg]:size-3.5",
  {
    variants: {
      sentiment: {
        positive: "text-success",
        negative: "text-destructive",
        neutral: "text-muted-foreground",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-sm",
      },
    },
    defaultVariants: { sentiment: "neutral", size: "md" },
  }
)

type StatTileTrend = "up" | "down" | "flat"
type StatTileSentiment = "positive" | "negative" | "neutral"

type StatTileDeltaProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style"
> & {
  /** Direction of change → arrow glyph. */
  trend?: StatTileTrend
  /**
   * Whether the change is good/bad/neutral → colour. Defaults to a sensible
   * mapping from `trend` (up→positive, down→negative, flat→neutral), but a
   * rising cost is "up" yet negative — set `sentiment` explicitly for those.
   */
  sentiment?: StatTileSentiment
  /**
   * Accessible prefix announced before the value, so the trend is not conveyed
   * by the arrow/colour alone. Defaults to "Up"/"Down"/"No change".
   */
  srTrendLabel?: string
}

const trendIcon: Record<StatTileTrend, React.ElementType> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
}
const defaultSentiment: Record<StatTileTrend, StatTileSentiment> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
}
const defaultSrTrend: Record<StatTileTrend, string> = {
  up: "Up",
  down: "Down",
  flat: "No change",
}

function StatTileDelta({
  trend = "flat",
  sentiment,
  srTrendLabel,
  children,
  ...props
}: StatTileDeltaProps) {
  const size = useStatTileSize()
  const resolvedSentiment = sentiment ?? defaultSentiment[trend]
  const Icon = trendIcon[trend]
  return (
    <span
      data-slot="stat-tile-delta"
      data-trend={trend}
      data-sentiment={resolvedSentiment}
      className={cn(deltaVariants({ sentiment: resolvedSentiment, size }))}
      {...props}
    >
      <Icon aria-hidden />
      <span className="sr-only">{srTrendLabel ?? defaultSrTrend[trend]}</span>
      {children}
    </span>
  )
}

/* --------------------------------------------------------------- caption -- */

function StatTileCaption({
  ...props
}: Omit<React.ComponentProps<"p">, "className" | "style">) {
  return (
    <p
      data-slot="stat-tile-caption"
      className={cn("text-xs text-muted-foreground text-pretty")}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------- chart -- */

function StatTileChart({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="stat-tile-chart"
      className={cn("mt-1 flex items-end")}
      {...props}
    />
  )
}

export {
  StatTile,
  StatTileHeader,
  StatTileLabel,
  StatTileIcon,
  StatTileValue,
  StatTileUnit,
  StatTileDelta,
  StatTileCaption,
  StatTileChart,
  statTileVariants,
}
export type {
  StatTileProps,
  StatTileDeltaProps,
  StatTileTrend,
  StatTileSentiment,
}
