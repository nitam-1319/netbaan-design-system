import * as React from "react"
import { Languages } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Locale / RTL Switcher (Utilities, closed API)
 *
 * A one-tap control that switches the application's active locale and, with it,
 * the document writing direction — English (LTR) ↔ فارسی (RTL) by default. It
 * writes `lang` and `dir` onto `<html>` so every component below re-flows via
 * logical properties (no per-component RTL wiring needed), and it reads the
 * currently *applied* locale back from the document so it stays correct even if
 * something else changed the direction.
 *
 * Works standalone (no provider required): point it at the `locales` you support
 * and it cycles to the next one on activation — for the common two-locale case
 * that is a simple EN⇄FA toggle. Controlled (`locale` + `onLocaleChange`) and
 * uncontrolled (`defaultLocale`) usage are both supported.
 *
 * Built as an AEGIS-conformant control: `border-strong` outline, 3px
 * `accent-soft` focus ring, no shadcn defaults. Public API is CLOSED — no
 * `className` / `style`; customise via the semantic `variant` / `size` props.
 * All colour comes from AEGIS tokens. See `.agent/rules/API_RULES.md`.
 */

const localeSwitcherVariants = cva(
  cn(
    "group/locale-switcher inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors select-none",
    "outline-none focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        outline: "border-border-strong bg-background text-foreground hover:bg-muted",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        soft: "border-transparent bg-muted text-foreground hover:bg-border",
      },
      size: {
        sm: "h-8 px-2.5 text-[0.8rem] [&_svg]:size-3.5",
        md: "h-10 px-3 text-sm [&_svg]:size-4",
        lg: "h-12 px-4 text-base [&_svg]:size-5",
      },
      iconOnly: {
        true: "aspect-square px-0",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", size: "md", iconOnly: false },
  }
)

type Locale = {
  /** BCP-47 code written to `<html lang>` (e.g. "en", "fa"). */
  code: string
  /** Human-readable name shown as the label (usually endonymic). */
  name: string
  /** Writing direction applied to `<html dir>`. */
  dir: "ltr" | "rtl"
}

const DEFAULT_LOCALES: Locale[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "fa", name: "فارسی", dir: "rtl" },
]

/**
 * Apply a locale to the document root and observe outside changes so the control
 * always reflects what is actually applied. Returns the applied locale code.
 */
function useAppliedLocale(locales: Locale[], desired: string): string {
  const [applied, setApplied] = React.useState(desired)

  React.useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const read = () => {
      const lang = root.getAttribute("lang")
      const match = locales.find((l) => l.code === lang)
      if (match) setApplied(match.code)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ["lang", "dir"] })
    return () => observer.disconnect()
  }, [locales])

  return applied
}

type LocaleSwitcherProps = Omit<
  React.ComponentProps<"button">,
  "className" | "style" | "children" | "onClick"
> &
  Omit<VariantProps<typeof localeSwitcherVariants>, "iconOnly"> & {
    /** The locales to cycle through. Defaults to English (LTR) + فارسی (RTL). */
    locales?: Locale[]
    /** Controlled active locale code. */
    locale?: string
    /** Initial locale code when uncontrolled. Defaults to the first entry. */
    defaultLocale?: string
    /** Fired with the next locale after each switch. */
    onLocaleChange?: (locale: Locale) => void
    /** Show the active locale's name beside the icon. Omit for icon-only. */
    showLabel?: boolean
  }

function LocaleSwitcher({
  variant = "outline",
  size = "md",
  locales = DEFAULT_LOCALES,
  locale,
  defaultLocale,
  onLocaleChange,
  showLabel = true,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: LocaleSwitcherProps) {
  const list = locales.length > 0 ? locales : DEFAULT_LOCALES
  const isControlled = locale != null
  const [internal, setInternal] = React.useState(
    defaultLocale ?? list[0].code
  )
  const desired = isControlled ? locale : internal
  const appliedCode = useAppliedLocale(list, desired)

  // Keep the document in sync with the desired locale (controlled or initial).
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const current = list.find((l) => l.code === desired) ?? list[0]
    const root = document.documentElement
    root.setAttribute("lang", current.code)
    root.setAttribute("dir", current.dir)
  }, [desired, list])

  const activeIndex = Math.max(
    0,
    list.findIndex((l) => l.code === appliedCode)
  )
  const active = list[activeIndex] ?? list[0]
  const next = list[(activeIndex + 1) % list.length]

  const handleClick = () => {
    if (!isControlled) setInternal(next.code)
    onLocaleChange?.(next)
  }

  const switchLabel = `Switch language to ${next.name}`

  return (
    <button
      type="button"
      data-slot="locale-switcher"
      data-locale={active.code}
      data-dir={active.dir}
      disabled={disabled}
      onClick={handleClick}
      aria-label={ariaLabel ?? (showLabel ? undefined : switchLabel)}
      title={ariaLabel ?? switchLabel}
      className={cn(
        localeSwitcherVariants({ variant, size, iconOnly: !showLabel })
      )}
      {...props}
    >
      <Languages aria-hidden="true" />
      {showLabel && (
        <span data-slot="locale-switcher-label">{active.name}</span>
      )}
    </button>
  )
}

export { LocaleSwitcher, localeSwitcherVariants, DEFAULT_LOCALES }
export type { LocaleSwitcherProps, Locale }
