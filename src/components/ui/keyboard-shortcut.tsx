"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Kbd } from "@/components/ui/kbd"

/**
 * AEGIS — Keyboard Shortcut
 *
 * Renders a key chord from a combo string (or array) as a row of `Kbd` chips —
 * e.g. `keys="Mod+K"` → ⌘ K on macOS, Ctrl K elsewhere. It resolves the
 * platform "meta" key (`Mod`), maps common named keys to their glyphs
 * (`Shift` → ⇧, `Enter` → ↵, arrows → ↑↓←→), and joins them with a separator.
 *
 * The visible glyphs are `aria-hidden` and paired with a spelled-out,
 * screen-reader-only label (e.g. "Command K"), so the shortcut is announced
 * clearly rather than as ambiguous symbols.
 *
 * Public API is CLOSED — no `className` / `style`. Keys via `keys`, platform via
 * `platform`, scale via `size`. Built on the `Kbd` primitive.
 * See `.agent/rules/API_RULES.md`.
 */

type Platform = "mac" | "pc" | "auto"
type KbdSize = "sm" | "md" | "lg"

/** Glyphs for macOS. */
const GLYPH_MAC: Record<string, string> = {
  mod: "⌘",
  meta: "⌘",
  cmd: "⌘",
  command: "⌘",
  ctrl: "⌃",
  control: "⌃",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  enter: "↵",
  return: "↵",
  backspace: "⌫",
  delete: "⌦",
  del: "⌦",
  escape: "esc",
  esc: "esc",
  tab: "⇥",
  space: "␣",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  pageup: "PgUp",
  pagedown: "PgDn",
  home: "Home",
  end: "End",
  plus: "+",
}

/** Labels for non-mac platforms. */
const LABEL_PC: Record<string, string> = {
  mod: "Ctrl",
  meta: "Win",
  cmd: "Ctrl",
  command: "Ctrl",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: "Alt",
  option: "Alt",
  shift: "Shift",
  enter: "Enter",
  return: "Enter",
  backspace: "Backspace",
  delete: "Delete",
  del: "Delete",
  escape: "Esc",
  esc: "Esc",
  tab: "Tab",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  pageup: "PgUp",
  pagedown: "PgDn",
  home: "Home",
  end: "End",
  plus: "+",
}

/** Spelled-out names for the screen-reader label. */
const SPOKEN: Record<string, { mac: string; pc: string }> = {
  mod: { mac: "Command", pc: "Control" },
  meta: { mac: "Command", pc: "Windows" },
  cmd: { mac: "Command", pc: "Control" },
  command: { mac: "Command", pc: "Control" },
  ctrl: { mac: "Control", pc: "Control" },
  control: { mac: "Control", pc: "Control" },
  alt: { mac: "Option", pc: "Alt" },
  option: { mac: "Option", pc: "Alt" },
  shift: { mac: "Shift", pc: "Shift" },
  enter: { mac: "Enter", pc: "Enter" },
  return: { mac: "Return", pc: "Enter" },
  escape: { mac: "Escape", pc: "Escape" },
  esc: { mac: "Escape", pc: "Escape" },
}

function detectMac(): boolean {
  if (typeof navigator === "undefined") return false
  const s = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`
  return /mac|iphone|ipad|ipod/i.test(s)
}

// A stable "no updates" subscription; the platform never changes at runtime.
const noopSubscribe = () => () => {}

/**
 * SSR-safe platform read: `false` on the server and first paint, the detected
 * value on the client. `useSyncExternalStore` reconciles the difference without
 * a hydration warning and without setting state inside an effect.
 */
function useIsMac(): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => detectMac(),
    () => false
  )
}

function tokenize(keys: string | string[]): string[] {
  const list = Array.isArray(keys) ? keys : keys.split("+")
  return list.map((k) => k.trim()).filter(Boolean)
}

function glyphFor(token: string, mac: boolean): string {
  const key = token.toLowerCase()
  const map = mac ? GLYPH_MAC : LABEL_PC
  if (key in map) return map[key]
  // Single letters/digits read best uppercased; longer literals title-cased.
  return token.length === 1
    ? token.toUpperCase()
    : token.charAt(0).toUpperCase() + token.slice(1)
}

function spokenFor(token: string, mac: boolean): string {
  const key = token.toLowerCase()
  if (key in SPOKEN) return mac ? SPOKEN[key].mac : SPOKEN[key].pc
  return token.length === 1 ? token.toUpperCase() : token
}

type KeyboardShortcutProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style" | "children"
> & {
  /** The chord — a string like `"Mod+K"` or an array like `["Mod", "K"]`. */
  keys: string | string[]
  /** Which platform's keys to show. `auto` (default) detects at runtime. */
  platform?: Platform
  /** Chip size, forwarded to `Kbd`. Default `md`. */
  size?: KbdSize
  /** Separator drawn between chips. Default `"+"`. */
  separator?: React.ReactNode
}

function KeyboardShortcut({
  keys,
  platform = "auto",
  size = "md",
  separator = "+",
  ...props
}: KeyboardShortcutProps) {
  // Deterministic on the server / first paint, corrected to the detected
  // platform on the client — no hydration mismatch, no set-state-in-effect.
  const detectedMac = useIsMac()
  const mac =
    platform === "mac" ? true : platform === "pc" ? false : detectedMac

  const tokens = tokenize(keys)
  if (tokens.length === 0) return null

  const spokenLabel = tokens.map((t) => spokenFor(t, mac)).join(" ")

  return (
    <span
      data-slot="keyboard-shortcut"
      className={cn("inline-flex w-fit items-center gap-1 align-middle")}
      {...props}
    >
      <span
        aria-hidden
        dir="ltr"
        className="inline-flex items-center gap-1"
      >
        {tokens.map((token, i) => (
          <React.Fragment key={`${token}-${i}`}>
            {i > 0 ? (
              <span
                data-slot="keyboard-shortcut-separator"
                className="text-xs text-text-faint select-none"
              >
                {separator}
              </span>
            ) : null}
            <Kbd size={size}>{glyphFor(token, mac)}</Kbd>
          </React.Fragment>
        ))}
      </span>
      <span className="sr-only">{spokenLabel}</span>
    </span>
  )
}

export { KeyboardShortcut }
export type { KeyboardShortcutProps }
