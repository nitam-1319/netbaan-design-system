"use client";

import * as React from "react"
import { Printer } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Print View (Utilities)
 *
 * Helpers for print output: a `PrintView` region with a screen-only toolbar and a
 * print trigger, plus `PrintOnly` / `ScreenOnly` visibility wrappers and a
 * standalone `PrintButton`. Together they let a page present a clean, printable
 * document without duplicating markup — controls disappear on paper, print-only
 * notes appear only there.
 *
 * Composes the AEGIS `Button`. Public API is CLOSED — no `className` / `style`;
 * behaviour is the semantic props. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type PrintButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "render"
> & {
  /** Fired after the print dialog is requested. */
  onPrinted?: () => void
}

function PrintButton({
  children = "Print",
  variant = "outline",
  onPrinted,
  ...props
}: PrintButtonProps) {
  return (
    <Button
      data-slot="print-button"
      variant={variant}
      onClick={() => {
        if (typeof window !== "undefined") window.print()
        onPrinted?.()
      }}
      {...props}
    >
      <Printer aria-hidden />
      {children}
    </Button>
  )
}

/** Content that appears only when printing. */
function PrintOnly(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div data-slot="print-only" className={cn("hidden print:block")} {...props} />
  )
}

/** Content that is hidden when printing (screen only). */
function ScreenOnly(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return <div data-slot="screen-only" className={cn("print:hidden")} {...props} />
}

type PrintViewProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "title"
> & {
  /** Printable content. */
  children: React.ReactNode
  /** Optional document title shown in the screen toolbar. */
  title?: React.ReactNode
  /** Show the screen-only toolbar with a print button. Default `true`. */
  showToolbar?: boolean
  /** Print button label. Default "Print". */
  printLabel?: React.ReactNode
}

function PrintView({
  children,
  title,
  showToolbar = true,
  printLabel = "Print",
  ...props
}: PrintViewProps) {
  return (
    <div data-slot="print-view" {...props}>
      {showToolbar ? (
        <div
          data-slot="print-view-toolbar"
          className={cn(
            "mb-4 flex items-center justify-between gap-3 print:hidden"
          )}
        >
          {title != null ? (
            <span className="font-heading text-base font-semibold text-foreground">
              {title}
            </span>
          ) : (
            <span aria-hidden />
          )}
          <PrintButton size="sm">{printLabel}</PrintButton>
        </div>
      ) : null}
      <div data-slot="print-view-document">{children}</div>
    </div>
  )
}

export { PrintView, PrintButton, PrintOnly, ScreenOnly }
export type { PrintViewProps, PrintButtonProps }
