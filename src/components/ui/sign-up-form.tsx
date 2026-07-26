import * as React from "react"
import { Mail, User } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormProvider } from "@/components/ui/form-provider"
import { PasswordInput } from "@/components/ui/password-input"
import {
  PasswordStrengthMeter,
  estimatePasswordStrength,
} from "@/components/ui/password-strength-meter"
import {
  SSOProviderButtons,
  type ProviderKey,
} from "@/components/ui/sso-provider-buttons"
import { TextField } from "@/components/ui/text-field"

/**
 * AEGIS — Sign-up Form
 *
 * A registration form assembled from AEGIS parts: `FormProvider`, a `TextField`
 * for name and email, a `PasswordInput` paired with the `PasswordStrengthMeter`,
 * an optional confirm-password field, a required terms checkbox, an optional SSO
 * block, and the submit `Button`. Fields are controlled internally; `onSubmit`
 * hands you the typed values once local validation passes.
 *
 * Public API is CLOSED — no `className` / `style`. Configure through the
 * semantic props; colour and spacing are token-only.
 * See `.agent/rules/API_RULES.md`.
 */

export type SignUpValues = {
  name: string
  email: string
  password: string
  acceptedTerms: boolean
}

type SignUpFormProps = {
  /** Heading. Default "Create your account". */
  title?: React.ReactNode
  /** Supporting copy under the title. */
  description?: React.ReactNode
  /** Called with the typed values once local validation passes. */
  onSubmit?: (values: SignUpValues) => void
  nameLabel?: React.ReactNode
  emailLabel?: React.ReactNode
  passwordLabel?: React.ReactNode
  confirmLabel?: React.ReactNode
  submitLabel?: React.ReactNode
  /** Shows the submit button's loading state and locks the form. */
  submitting?: boolean
  disabled?: boolean
  /** Server / external errors keyed by field, plus a form-level message. */
  errors?: {
    name?: React.ReactNode
    email?: React.ReactNode
    password?: React.ReactNode
    confirm?: React.ReactNode
    form?: React.ReactNode
  }
  /** Show the name field. Default `true`. */
  showNameField?: boolean
  /** Show the confirm-password field. Default `true`. */
  showConfirmPassword?: boolean
  /** Minimum strength score (0–4) required to submit. Default `2` (Fair). */
  minPasswordScore?: 0 | 1 | 2 | 3 | 4
  /** Terms checkbox. Default required + shown. */
  requireTerms?: boolean
  termsLabel?: React.ReactNode
  /** SSO providers to offer above the form. */
  providers?: ProviderKey[]
  onProviderSelect?: (provider: ProviderKey) => void
  dividerLabel?: React.ReactNode
  /** Footer node, e.g. a "Already have an account?" prompt. */
  footer?: React.ReactNode
}

const EMAIL_RE = /.+@.+\..+/

function SignUpForm({
  title = "Create your account",
  description,
  onSubmit,
  nameLabel = "Full name",
  emailLabel = "Email",
  passwordLabel = "Password",
  confirmLabel = "Confirm password",
  submitLabel = "Create account",
  submitting = false,
  disabled = false,
  errors,
  showNameField = true,
  showConfirmPassword = true,
  minPasswordScore = 2,
  requireTerms = true,
  termsLabel = "I agree to the Terms of Service and Privacy Policy",
  providers,
  onProviderSelect,
  dividerLabel = "or",
  footer,
}: SignUpFormProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [terms, setTerms] = React.useState(false)
  const [local, setLocal] = React.useState<{
    name?: string
    email?: string
    password?: string
    confirm?: string
    terms?: string
  }>({})

  const locked = disabled || submitting

  const handleSubmit = () => {
    const next: typeof local = {}
    if (showNameField && !name.trim()) next.name = "Please enter your name."
    if (!email.trim()) next.email = "Email is required."
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address."
    if (!password) next.password = "Password is required."
    else if (estimatePasswordStrength(password).score < minPasswordScore)
      next.password = "Please choose a stronger password."
    if (showConfirmPassword && confirm !== password)
      next.confirm = "Passwords don't match."
    if (requireTerms && !terms)
      next.terms = "You must accept the terms to continue."

    setLocal(next)
    if (Object.keys(next).length > 0) return
    onSubmit?.({ name, email, password, acceptedTerms: terms })
  }

  return (
    <div data-slot="sign-up-form" className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </span>
        {description != null && (
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>

      {providers && providers.length > 0 && (
        <>
          <SSOProviderButtons
            providers={providers}
            onSelectProvider={(p) => onProviderSelect?.(p as ProviderKey)}
          />
          <div
            aria-hidden
            className="flex items-center gap-3 text-xs text-text-faint"
          >
            <span className="h-px flex-1 bg-border" />
            {dividerLabel}
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {errors?.form != null && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <FormProvider onFormSubmit={() => handleSubmit()}>
        {showNameField && (
          <TextField
            name="name"
            label={nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors?.name ?? local.name}
            leadingIcon={<User />}
            autoComplete="name"
            placeholder="Sam Rivera"
            disabled={locked}
          />
        )}

        <TextField
          name="email"
          type="email"
          label={emailLabel}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors?.email ?? local.email}
          leadingIcon={<Mail />}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={locked}
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            label={passwordLabel}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors?.password ?? local.password}
            autoComplete="new-password"
            disabled={locked}
          />
          {password.length > 0 && (
            <PasswordStrengthMeter value={password} showRequirements />
          )}
        </div>

        {showConfirmPassword && (
          <PasswordInput
            label={confirmLabel}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors?.confirm ?? local.confirm}
            autoComplete="new-password"
            disabled={locked}
          />
        )}

        {requireTerms && (
          <div className="flex flex-col gap-1.5">
            <Checkbox
              label={termsLabel}
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
              disabled={locked}
            />
            {local.terms != null && (
              <p className="text-destructive text-xs font-medium">
                {local.terms}
              </p>
            )}
          </div>
        )}

        <Button type="submit" variant="primary" loading={submitting} disabled={disabled}>
          {submitLabel}
        </Button>
      </FormProvider>

      {footer != null && (
        <div className="text-center text-sm text-muted-foreground">{footer}</div>
      )}
    </div>
  )
}

export { SignUpForm }
export type { SignUpFormProps }
