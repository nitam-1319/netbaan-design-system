import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/ui/otp-input"

/**
 * AEGIS — 2FA / OTP Verification
 *
 * A verification panel for the second step of authentication: a title +
 * description, the code entry (composing the AEGIS `OTPInput`), a resend control
 * with a cooldown timer, and an optional verify button. The code is reported via
 * `onComplete` as soon as every slot is filled, and via `onChange` on each edit.
 *
 * Public API is CLOSED — no `className` / `style`. Configure through the semantic
 * props; colour and spacing are token-only. See `.agent/rules/API_RULES.md`.
 */

const panelVariants = cva("flex flex-col", {
  variants: {
    size: {
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-5",
    },
  },
  defaultVariants: { size: "md" },
})

type TwoFactorVerificationProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "onChange"
> &
  VariantProps<typeof panelVariants> & {
    /** Number of code slots. Default `6`. */
    length?: number
    /** Panel heading. Default "Two-factor authentication". */
    title?: React.ReactNode
    /**
     * Supporting copy under the title. Defaults to a sentence referencing
     * `channel` (e.g. "Enter the 6-digit code we sent to your phone.").
     */
    description?: React.ReactNode
    /** Where the code was sent, woven into the default description. */
    channel?: string
    /** Controlled code value. */
    value?: string
    /** Fired on each edit with the current code. */
    onChange?: (code: string) => void
    /** Fired when every slot is filled. */
    onComplete?: (code: string) => void
    /** Fired when the user requests a new code; restarts the cooldown. */
    onResend?: () => void
    /** Seconds to disable resend after mount / a resend. Default `30`. */
    resendCooldown?: number
    /**
     * When provided, renders a Verify button that calls it with the code.
     * Omit to rely on `onComplete` (auto-verify).
     */
    onSubmit?: (code: string) => void
    /** Verify button label. Default "Verify". */
    submitLabel?: React.ReactNode
    /** Validation message; paints the error state on the code field. */
    error?: React.ReactNode
    /** Shows the verify button's loading state and locks the inputs. */
    verifying?: boolean
    /** Disables the whole panel. */
    disabled?: boolean
    /** Autofocus the first slot on mount. */
    autoFocus?: boolean
  }

function TwoFactorVerification({
  length = 6,
  title = "Two-factor authentication",
  description,
  channel = "your device",
  value,
  onChange,
  onComplete,
  onResend,
  resendCooldown = 30,
  onSubmit,
  submitLabel = "Verify",
  error,
  verifying = false,
  disabled = false,
  autoFocus,
  size = "md",
  ...props
}: TwoFactorVerificationProps) {
  const titleId = React.useId()
  const [internal, setInternal] = React.useState("")
  const code = value ?? internal
  const [cooldown, setCooldown] = React.useState(resendCooldown)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const handleValueChange = (next: string) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const handleResend = () => {
    onResend?.()
    setCooldown(resendCooldown)
  }

  const resolvedDescription =
    description ??
    `Enter the ${length}-digit code we sent to ${channel}.`

  return (
    <div
      data-slot="two-factor-verification"
      role="group"
      aria-labelledby={titleId}
      className={cn(panelVariants({ size }))}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <span
          id={titleId}
          data-slot="two-factor-title"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {title}
        </span>
        <p
          data-slot="two-factor-description"
          className="text-sm text-muted-foreground text-pretty"
        >
          {resolvedDescription}
        </p>
      </div>

      <OTPInput
        length={length}
        value={code}
        onValueChange={handleValueChange}
        onValueComplete={(v) => onComplete?.(v)}
        error={error}
        disabled={disabled || verifying}
        autoFocus={autoFocus}
        aria-label="Verification code"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          data-slot="two-factor-resend"
          className="text-sm text-muted-foreground"
        >
          {cooldown > 0 ? (
            <>
              Didn&apos;t get a code?{" "}
              <span className="text-text-faint tabular-nums">
                Resend in {cooldown}s
              </span>
            </>
          ) : (
            <>
              Didn&apos;t get a code?{" "}
              <Button
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={disabled}
              >
                Resend code
              </Button>
            </>
          )}
        </span>

        {onSubmit && (
          <Button
            variant="primary"
            onClick={() => onSubmit(code)}
            loading={verifying}
            disabled={disabled || code.length < length}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export { TwoFactorVerification }
export type { TwoFactorVerificationProps }
