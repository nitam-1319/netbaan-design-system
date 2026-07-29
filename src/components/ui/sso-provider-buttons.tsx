"use client";

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Apple, Building2, KeyRound, Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * AEGIS — SSO Provider Buttons
 *
 * Third-party / enterprise sign-in buttons for an auth surface: a single
 * `SSOProviderButton` or a stacked `SSOProviderButtons` group. Each button
 * carries a provider mark and a "Continue with …" label, and is built on the
 * same Base UI Button primitive + `buttonVariants` as the AEGIS `Button`, so
 * tokens, focus ring and states stay identical — only the width and the leading
 * mark are added.
 *
 * Provider marks are **monochrome** and inherit `currentColor`, so they read in
 * both themes and never introduce a hard-coded brand hex (token-only, closed
 * API). If a brand's guidelines require its full-colour logo, supply it via the
 * `icon` prop on a custom provider.
 *
 * Public API is CLOSED — no `className` / `style`. Use the semantic `variant`,
 * `size`, `fullWidth`, and `orientation` props; the provider set is data.
 * See `.agent/rules/API_RULES.md`.
 */

const ssoButtonVariants = cva("", {
  variants: {
    fullWidth: { true: "w-full", false: "" },
  },
  defaultVariants: { fullWidth: true },
})

type SSOVariant = "secondary" | "outline" | "ghost"
type SSOSize = "sm" | "md" | "lg"

type ProviderMark = {
  /** Accessible provider name, e.g. "Google". */
  label: string
  /** Monochrome mark (inherits currentColor). */
  icon: React.ReactNode
}

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    {children}
  </svg>
)

/** Built-in provider marks (monochrome, currentColor). */
const PROVIDERS: Record<string, ProviderMark> = {
  google: {
    label: "Google",
    icon: (
      <Svg>
        <path d="M21.35 11.1H12v2.98h5.35c-.23 1.24-.94 2.29-2 3l.02.13 2.9 2.25.2.02c1.85-1.7 2.93-4.22 2.93-7.2 0-.62-.06-1.22-.16-1.8z" />
        <path d="M12 21.5c2.64 0 4.86-.87 6.48-2.37l-3.09-2.4c-.83.58-1.94.99-3.39.99-2.6 0-4.8-1.75-5.59-4.11l-.13.01-3.01 2.33-.04.12A9.5 9.5 0 0012 21.5z" />
        <path d="M6.41 13.61a5.85 5.85 0 010-3.72V7.53l-3.06-.03A9.51 9.51 0 002.5 12c0 1.53.37 2.98 1.01 4.26l2.9-2.25z" />
        <path d="M12 6.27c1.47 0 2.46.63 3.03 1.16l2.21-2.16C15.86 4.03 13.64 3.5 12 3.5A9.5 9.5 0 003.35 7.5l3.06 2.39C7.2 8.02 9.4 6.27 12 6.27z" />
      </Svg>
    ),
  },
  github: {
    label: "GitHub",
    icon: (
      <Svg>
        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
      </Svg>
    ),
  },
  microsoft: {
    label: "Microsoft",
    icon: (
      <Svg>
        <path d="M2 2h9.2v9.2H2zM12.8 2H22v9.2h-9.2zM2 12.8h9.2V22H2zM12.8 12.8H22V22h-9.2z" />
      </Svg>
    ),
  },
  apple: {
    label: "Apple",
    icon: <Apple aria-hidden focusable="false" />,
  },
  gitlab: {
    label: "GitLab",
    icon: (
      <Svg>
        <path d="M12 21.8 8.2 10.1h7.6zM3.2 10.1l-1.1 3.4a.75.75 0 0 0 .27.84L12 21.8zM3.2 10.1h5L5.65 2.5a.4.4 0 0 0-.77 0zM20.8 10.1l1.1 3.4a.75.75 0 0 1-.27.84L12 21.8zM20.8 10.1h-5l2.55-7.6a.4.4 0 0 1 .77 0z" />
      </Svg>
    ),
  },
  email: {
    label: "email",
    icon: <Mail aria-hidden focusable="false" />,
  },
  sso: {
    label: "SSO",
    icon: <KeyRound aria-hidden focusable="false" />,
  },
  saml: {
    label: "your organization",
    icon: <Building2 aria-hidden focusable="false" />,
  },
}

type ProviderKey = keyof typeof PROVIDERS

type SSOProviderButtonProps = Omit<
  ButtonPrimitive.Props,
  "className" | "style" | "children"
> &
  VariantProps<typeof ssoButtonVariants> & {
    /** A built-in provider, or a custom `{ label, icon }` mark. */
    provider: ProviderKey | ProviderMark
    variant?: SSOVariant
    size?: SSOSize
    /**
     * Label template. `{provider}` is replaced with the provider name.
     * Default: `"Continue with {provider}"`. Pass a node to override entirely.
     */
    label?: string | React.ReactNode
  }

const contentPad: Record<SSOSize, string> = {
  sm: "gap-2 px-3",
  md: "gap-2.5 px-4",
  lg: "gap-2.5 px-5",
}

function resolveProvider(p: ProviderKey | ProviderMark): ProviderMark {
  return typeof p === "string" ? PROVIDERS[p] : p
}

function SSOProviderButton({
  provider,
  variant = "secondary",
  size = "md",
  fullWidth = true,
  label,
  disabled,
  ...props
}: SSOProviderButtonProps) {
  const mark = resolveProvider(provider)
  const pad = contentPad[size]
  const text =
    label === undefined
      ? `Continue with ${mark.label}`
      : typeof label === "string"
        ? label.replace("{provider}", mark.label)
        : label

  return (
    <ButtonPrimitive
      data-slot="sso-provider-button"
      data-provider={typeof provider === "string" ? provider : undefined}
      disabled={disabled}
      className={cn(
        buttonVariants({ variant, size }),
        ssoButtonVariants({ fullWidth })
      )}
      {...props}
    >
      <span
        className={cn(
          "relative z-10 inline-flex w-full items-center justify-center",
          pad
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-[1.15em] shrink-0 items-center justify-center [&_svg]:size-full"
        >
          {mark.icon}
        </span>
        <span className="min-w-0 truncate">{text}</span>
      </span>
    </ButtonPrimitive>
  )
}

type ProviderInput = ProviderKey | ProviderMark

type SSOProviderButtonsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Providers to render, in order. */
  providers: ProviderInput[]
  variant?: SSOVariant
  size?: SSOSize
  fullWidth?: boolean
  /** Stacking direction. Default `"vertical"`. */
  orientation?: "vertical" | "horizontal"
  /** Label template applied to every button. See `SSOProviderButton.label`. */
  label?: string
  /** Fired with the provider key (or mark) when a button is activated. */
  onSelectProvider?: (provider: ProviderInput) => void
  /** Accessible name for the group. Default `"Sign in with a provider"`. */
  groupLabel?: string
}

function SSOProviderButtons({
  providers,
  variant = "secondary",
  size = "md",
  fullWidth = true,
  orientation = "vertical",
  label,
  onSelectProvider,
  groupLabel = "Sign in with a provider",
  ...props
}: SSOProviderButtonsProps) {
  return (
    <div
      data-slot="sso-provider-buttons"
      role="group"
      aria-label={groupLabel}
      className={cn(
        "flex gap-2.5",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
      )}
      {...props}
    >
      {providers.map((provider, i) => (
        <SSOProviderButton
          key={typeof provider === "string" ? provider : `custom-${i}`}
          provider={provider}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          label={label}
          onClick={
            onSelectProvider
              ? () => onSelectProvider(provider)
              : undefined
          }
        />
      ))}
    </div>
  )
}

export { SSOProviderButton, SSOProviderButtons, PROVIDERS }
export type {
  SSOProviderButtonProps,
  SSOProviderButtonsProps,
  ProviderKey,
  ProviderMark,
}
