import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Form Section
 *
 * A titled region that groups related fields within a longer form — "Profile",
 * "Notifications", "Danger zone". Distinct from `Fieldset`: Fieldset is a
 * semantic `<fieldset>`/`<legend>` control group with a native disabled
 * cascade; Form Section is a *layout* region with a heading + description that
 * can hold any content (including one or more Fieldsets). Two layouts: `stacked`
 * (header above the fields) and `aside` (header beside the fields on wide
 * screens — the classic settings layout).
 *
 * A titled section renders `<section aria-labelledby>` so it becomes a labelled
 * landmark; the heading level is configurable for a correct document outline.
 *
 * Public API is CLOSED — no `className` / `style`. Layout via `layout`, heading
 * depth via `headingLevel`. All spacing/colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

const sectionVariants = cva("min-w-0", {
  variants: {
    layout: {
      stacked: "flex flex-col",
      aside:
        "grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-[minmax(0,18rem)_1fr]",
    },
  },
  defaultVariants: { layout: "stacked" },
})

type HeadingLevel = 2 | 3 | 4

const HEADING_TAG: Record<HeadingLevel, "h2" | "h3" | "h4"> = {
  2: "h2",
  3: "h3",
  4: "h4",
}

type FormSectionProps = Omit<
  React.ComponentProps<"section">,
  "className" | "style" | "title"
> &
  VariantProps<typeof sectionVariants> & {
    /** Section title, rendered as the heading and the region's accessible name. */
    title?: React.ReactNode
    /** Supporting text shown under the title. */
    description?: React.ReactNode
    /** Heading element for a correct document outline. Default `3` (`<h3>`). */
    headingLevel?: HeadingLevel
  }

function FormSection({
  layout = "stacked",
  title,
  description,
  headingLevel = 3,
  children,
  ...props
}: FormSectionProps) {
  const reactId = React.useId()
  const titleId = `${reactId}-title`
  const hasHeader = title != null || description != null
  const Heading = HEADING_TAG[headingLevel]

  return (
    <section
      data-slot="form-section"
      data-layout={layout}
      aria-labelledby={title != null ? titleId : undefined}
      className={cn(sectionVariants({ layout }))}
      {...props}
    >
      {hasHeader ? (
        <div data-slot="form-section-header" className="min-w-0">
          {title != null ? (
            <Heading
              id={titleId}
              data-slot="form-section-title"
              className="text-base font-semibold text-foreground text-pretty"
            >
              {title}
            </Heading>
          ) : null}
          {description != null ? (
            <p
              data-slot="form-section-description"
              className="mt-1 text-sm text-muted-foreground text-pretty"
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        data-slot="form-section-body"
        className={cn(
          "flex min-w-0 flex-col gap-4",
          // In stacked layout the body sits below the header; in aside the
          // grid gap already separates the two columns.
          hasHeader && layout === "stacked" && "mt-5"
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { FormSection, sectionVariants as formSectionVariants }
export type { FormSectionProps, HeadingLevel }
