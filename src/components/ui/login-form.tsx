import * as React from "react"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FormProvider } from "@/components/ui/form-provider"
import { PasswordInput } from "@/components/ui/password-input"
import {
  SSOProviderButtons,
  type ProviderKey,
} from "@/components/ui/sso-provider-buttons"
import { TextField } from "@/components/ui/text-field"

/**
 * AEGIS — Login Form
 *
 * A complete credential sign-in form composed from AEGIS parts: `FormProvider`
 * (a real `<form>`, Enter-to-submit), a `TextField` for the identifier, a
 * `PasswordInput`, an optional remember/forgot row, the submit `Button`, and an
 * optional set of `SSOProviderButtons` above a divider. Fields are controlled
 * internally; `onSubmit` hands you the typed values.
 *
 * Public API is CLOSED — no `className` / `style`. Configure through the
 * semantic props; colour and spacing are token-only.
 * See `.agent/rules/API_RULES.md`.
 */

export type LoginValues = {
  email: string
  password: string
  remember: boolean
}

type LoginFormProps = {
  /** Heading. Default "Sign in". */
  title?: React.ReactNode
  /** Supporting copy under the title. */
  description?: React.ReactNode
  /** Called with the typed values once local validation passes. */
  onSubmit?: (values: LoginValues) => void
  /** Prefill the email field. */
  defaultEmail?: string
  emailLabel?: React.ReactNode
  passwordLabel?: React.ReactNode
  submitLabel?: React.ReactNode
  /** Shows the submit button's loading state and locks the form. */
  submitting?: boolean
  /** Disable the whole form. */
  disabled?: boolean
  /** Server / external errors keyed by field, plus a form-level message. */
  errors?: { email?: React.ReactNode; password?: React.ReactNode; form?: React.ReactNode }
  /** SSO providers to offer above the credential form. */
  providers?: ProviderKey[]
  /** Fired when an SSO provider is chosen. */
  onProviderSelect?: (provider: ProviderKey) => void
  /** Divider label between SSO and the form. Default "or". */
  dividerLabel?: React.ReactNode
  /** Remember-me row. Default shown. */
  showRemember?: boolean
  rememberLabel?: React.ReactNode
  /** Forgot-password affordance. */
  onForgotPassword?: () => void
  forgotHref?: string
  forgotLabel?: React.ReactNode
  /** Footer node, e.g. a "Don't have an account?" prompt. */
  footer?: React.ReactNode
}

function LoginForm({
  title = "Sign in",
  description,
  onSubmit,
  defaultEmail = "",
  emailLabel = "Email",
  passwordLabel = "Password",
  submitLabel = "Sign in",
  submitting = false,
  disabled = false,
  errors,
  providers,
  onProviderSelect,
  dividerLabel = "or",
  showRemember = true,
  rememberLabel = "Remember me",
  onForgotPassword,
  forgotHref,
  forgotLabel = "Forgot password?",
  footer,
}: LoginFormProps) {
  const pwId = React.useId()
  const [email, setEmail] = React.useState(defaultEmail)
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(false)
  const [local, setLocal] = React.useState<{ email?: string; password?: string }>({})

  const locked = disabled || submitting

  const handleSubmit = () => {
    const next: { email?: string; password?: string } = {}
    if (!email.trim()) next.email = "Email is required."
    if (!password) next.password = "Password is required."
    setLocal(next)
    if (Object.keys(next).length > 0) return
    onSubmit?.({ email, password, remember })
  }

  const emailError = errors?.email ?? local.email
  const passwordError = errors?.password ?? local.password

  const hasForgot = onForgotPassword != null || forgotHref != null

  return (
    <div data-slot="login-form" className="flex w-full flex-col gap-6">
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
        <TextField
          name="email"
          type="email"
          label={emailLabel}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          leadingIcon={<Mail />}
          autoComplete="username"
          placeholder="you@example.com"
          disabled={locked}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={pwId}
              className="text-sm font-medium text-foreground select-none"
            >
              {passwordLabel}
            </label>
            {hasForgot &&
              (forgotHref != null ? (
                <a
                  href={forgotHref}
                  aria-disabled={locked || undefined}
                  tabIndex={locked ? -1 : undefined}
                  className={cn(
                    "text-xs font-medium text-accent-strong underline underline-offset-[3px] outline-none hover:brightness-110 focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-accent-soft",
                    locked && "pointer-events-none opacity-45"
                  )}
                >
                  {forgotLabel}
                </a>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onForgotPassword}
                  disabled={locked}
                >
                  {forgotLabel}
                </Button>
              ))}
          </div>
          <PasswordInput
            id={pwId}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            autoComplete="current-password"
            disabled={locked}
          />
        </div>

        {showRemember && (
          <Checkbox
            label={rememberLabel}
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            disabled={locked}
          />
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

export { LoginForm }
export type { LoginFormProps }
