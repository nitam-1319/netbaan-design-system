import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

/**
 * AEGIS — Theme Toggle (Utilities, closed API)
 *
 * A one-tap control that flips the app between light and dark. It reads the
 * currently *applied* appearance from the document (so it stays correct even
 * when the active theme is `system`) and calls the `ThemeProvider`'s `setTheme`
 * to switch. It shows the icon of the theme it will switch **to** (a sun when
 * dark, a moon when light) and announces that action.
 *
 * Must be rendered inside a `ThemeProvider` (it consumes `useTheme`). For a
 * three-way light / dark / system picker, compose `useTheme` with a
 * `SegmentedControl` instead — this atom is the common binary switch.
 *
 * Built as an AEGIS-conformant control: `border-strong` outline, 3px
 * `accent-soft` focus ring, no shadcn defaults. Public API is CLOSED — no
 * `className` / `style`; customise via the semantic `variant` / `size` props.
 * All colour comes from AEGIS tokens. See `.agent/rules/API_RULES.md`.
 */

const themeToggleVariants = cva(
  cn(
    "group/theme-toggle inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors select-none",
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

/**
 * Tracks whether the document currently shows the dark theme by reading (and
 * observing) the `dark` class on `<html>`. This reflects whatever `ThemeProvider`
 * applied — including `system` and live system changes — not just the stored
 * setting. SSR-safe: stays `false` until the browser effect runs.
 */
function useDocumentIsDark(theme: string): boolean {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const read = () => setIsDark(root.classList.contains("dark"))
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [theme])

  return isDark
}

type ThemeToggleProps = Omit<
  React.ComponentProps<"button">,
  "className" | "style" | "children" | "onClick"
> &
  Omit<VariantProps<typeof themeToggleVariants>, "iconOnly"> & {
    /** Optional visible label beside the icon; omit for an icon-only button. */
    children?: React.ReactNode
  }

function ThemeToggle({
  variant = "outline",
  size = "md",
  children,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = useDocumentIsDark(theme)
  const hasLabel = children != null

  const targetLabel = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <button
      type="button"
      data-slot="theme-toggle"
      data-theme={isDark ? "dark" : "light"}
      disabled={disabled}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={ariaLabel ?? (hasLabel ? undefined : targetLabel)}
      title={ariaLabel ?? targetLabel}
      className={cn(themeToggleVariants({ variant, size, iconOnly: !hasLabel }))}
      {...props}
    >
      {isDark ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
      {hasLabel && <span data-slot="theme-toggle-label">{children}</span>}
    </button>
  )
}

export { ThemeToggle, themeToggleVariants }
export type { ThemeToggleProps }
