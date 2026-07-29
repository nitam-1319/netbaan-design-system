"use client";

import * as React from "react"
import { Form as FormPrimitive } from "@base-ui/react/form"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Form Provider (Forms tier, closed API)
 *
 * The coordinating root for a form. Renders a native `<form>` and consolidates
 * validation across the `FormField` parts: it decides when fields validate
 * (`validationMode`), threads server / action errors back to the right field
 * (`errors`, keyed by each field's `name`), and hands you typed values on
 * submit (`onFormSubmit`). Because it's a real `<form>`, native submission,
 * `required`, and Enter-to-submit all work.
 *
 * Public API is CLOSED: no `className` / `style`. Fields are spaced by a
 * sensible default vertical rhythm; deeper layout belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type FormProviderProps<
  FormValues extends Record<string, unknown> = Record<string, unknown>,
> = Omit<FormPrimitive.Props<FormValues>, "className" | "style">

function FormProvider<
  FormValues extends Record<string, unknown> = Record<string, unknown>,
>({ children, ...props }: FormProviderProps<FormValues>) {
  return (
    <FormPrimitive
      data-slot="form"
      className={cn("flex flex-col gap-5")}
      {...props}
    >
      {children}
    </FormPrimitive>
  )
}

/** Optional grouping: an actions row (submit / cancel) pinned after the fields. */
function FormActions({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="form-actions"
      className={cn("mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}
      {...props}
    />
  )
}

export { FormProvider, FormActions }
export type { FormProviderProps }
