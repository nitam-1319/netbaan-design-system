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

/* C2: this module used to export a second `FormActions`, which the barrel had
   to alias to `FormProviderActions` to avoid a collision — two exports doing
   the same job under near-identical names. The standalone `form-actions.tsx`
   is now the single public component; its `stack` variant reproduces the
   mobile-stacking behaviour this copy provided. Import it directly:

     import { FormActions } from "@/components/ui/form-actions"   */

export { FormProvider }
export type { FormProviderProps }
