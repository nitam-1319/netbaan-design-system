"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Table (Data tier, closed API)
 *
 * A semantic data table composed of slot parts (`Table`, `TableHeader`,
 * `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`,
 * `TableCaption`). It renders native `<table>` elements, so the accessible
 * table/row/columnheader semantics come for free; screen readers announce it
 * as a data table without any ARIA scaffolding.
 *
 * Public API is CLOSED: no `className` / `style`. Colors are AEGIS-token only.
 * Cells align with logical `text-start`, so the table mirrors correctly in RTL.
 * The root wraps the table in a horizontally scrollable region so wide tables
 * never overflow their container. See `.agent/rules/API_RULES.md`.
 */

type TableProps = Omit<React.ComponentProps<"table">, "className" | "style"> & {
  /**
   * Row height and cell inset. `compact` is the console rung — a security list
   * is read by scanning many rows, and the default spacing fits about half as
   * many on a screen.
   */
  density?: "default" | "compact"
  /**
   * Give the header an eyebrow treatment: uppercase, tracked, on `--surface-2`.
   * A dense list wants its header to read as a rule with labels on it rather
   * than as a first row.
   */
  headerVariant?: "default" | "eyebrow"
  /**
   * `fixed` honours `<colgroup>` widths instead of letting content size the
   * columns — which is the only way to stop a long hostname from starving
   * every other column in the row.
   */
  layout?: "auto" | "fixed"
}

function Table({
  density = "default",
  headerVariant = "default",
  layout = "auto",
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto")}
    >
      <table
        data-slot="table"
        // The slots below read these from the table root, so one prop sets the
        // whole grid rather than every cell agreeing by hand.
        data-density={density}
        data-header={headerVariant}
        className={cn(
          "group/table w-full caption-bottom border-collapse text-sm",
          layout === "fixed" && "table-fixed"
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  ...props
}: Omit<React.ComponentProps<"thead">, "className" | "style">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-border",
        "group-data-[header=eyebrow]/table:bg-surface-2 group-data-[header=eyebrow]/table:[&_th]:text-[10.5px] group-data-[header=eyebrow]/table:[&_th]:font-semibold group-data-[header=eyebrow]/table:[&_th]:uppercase group-data-[header=eyebrow]/table:[&_th]:tracking-[0.06em]"
      )}
      {...props}
    />
  )
}

function TableBody({
  ...props
}: Omit<React.ComponentProps<"tbody">, "className" | "style">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0")}
      {...props}
    />
  )
}

function TableFooter({
  ...props
}: Omit<React.ComponentProps<"tfoot">, "className" | "style">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border bg-muted/50 font-medium text-foreground [&>tr]:last:border-b-0"
      )}
      {...props}
    />
  )
}

function TableRow({
  ...props
}: Omit<React.ComponentProps<"tr">, "className" | "style">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-accent-soft"
      )}
      {...props}
    />
  )
}

function TableHead({
  ...props
}: Omit<React.ComponentProps<"th">, "className" | "style">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-3 text-start align-middle font-medium text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        "h-10 group-data-[density=compact]/table:h-8 group-data-[density=compact]/table:px-2.5"
      )}
      {...props}
    />
  )
}

function TableCell({
  ...props
}: Omit<React.ComponentProps<"td">, "className" | "style">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle text-foreground [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        "group-data-[density=compact]/table:px-2.5 group-data-[density=compact]/table:py-1.5"
      )}
      {...props}
    />
  )
}

function TableCaption({
  ...props
}: Omit<React.ComponentProps<"caption">, "className" | "style">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
