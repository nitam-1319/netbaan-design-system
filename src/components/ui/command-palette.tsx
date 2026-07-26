import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * AEGIS — Command Palette (Navigation, closed API)
 *
 * The ⌘K launcher: a modal search box over your app's commands. Type to filter by
 * label or keywords, arrow through the results, press Enter to run one. It pairs
 * the AEGIS `Dialog` (modal, focus trap, Esc, backdrop) with the Base UI Combobox
 * primitive in **inline** mode (`role="combobox"` input + always-visible `listbox`,
 * `aria-activedescendant`, roving highlight, built-in filtering) so the two
 * behaviours compose without re-implementing either.
 *
 * v1 renders a flat command list; heading groups are a documented follow-up
 * (`.agent/DECISIONS.md`). An optional built-in ⌘K / Ctrl-K hotkey toggles it.
 * Public API is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type CommandPaletteItem = {
  /** Stable value passed to the select handlers. */
  value: string
  /** Visible label. */
  label: string
  /** Optional leading icon (decorative). */
  icon?: React.ReactNode
  /** Optional trailing shortcut hint text (e.g. "⌘P"). */
  shortcut?: string
  /** Extra terms to match on beyond the label. */
  keywords?: string[]
  /** Disable this command. */
  disabled?: boolean
  /** Run when this command is chosen. */
  onSelect?: (value: string) => void
}

type CommandPaletteProps = {
  /** The commands to show. */
  items: CommandPaletteItem[]
  /** Controlled open state. */
  open?: boolean
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void
  /** Fires with the chosen command's value (after its own `onSelect`). */
  onSelect?: (value: string) => void
  /** Input placeholder. Default "Type a command or search…". */
  placeholder?: string
  /** Message when nothing matches. Default "No results found.". */
  emptyMessage?: string
  /** Accessible name for the dialog + input. Default "Command palette". */
  label?: string
  /** Enable the built-in ⌘K / Ctrl-K toggle. Default `true`. */
  hotkey?: boolean
}

function CommandPalette({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  label = "Command palette",
  hotkey = true,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const openRef = React.useRef(isOpen)
  React.useEffect(() => {
    openRef.current = isOpen
  }, [isOpen])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    if (!hotkey || typeof window === "undefined") return
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(!openRef.current)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [hotkey, setOpen])

  function handleSelect(item: CommandPaletteItem | null) {
    if (!item || item.disabled) return
    item.onSelect?.(item.value)
    onSelect?.(item.value)
    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent size="lg" showClose={false} aria-label={label}>
        <ComboboxPrimitive.Root
          data-slot="command-palette"
          inline
          open
          items={items}
          value={null}
          itemToStringLabel={(item: CommandPaletteItem) =>
            [item.label, ...(item.keywords ?? [])].join(" ")
          }
          onValueChange={(value) => handleSelect(value as CommandPaletteItem | null)}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <ComboboxPrimitive.Input
                data-slot="command-palette-input"
                autoFocus
                aria-label={label}
                placeholder={placeholder}
                className={cn(
                  "w-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none",
                  "placeholder:text-muted-foreground"
                )}
              />
            </div>

            <ComboboxPrimitive.Empty
              data-slot="command-palette-empty"
              className="px-2 py-8 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List
              data-slot="command-palette-list"
              className="-mx-1 max-h-80 overflow-y-auto px-1"
            >
              {(item: CommandPaletteItem) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  disabled={item.disabled}
                  data-slot="command-palette-item"
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm text-popover-foreground outline-none transition-colors select-none",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  )}
                >
                  {item.icon ? (
                    <span aria-hidden className="text-muted-foreground">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.shortcut ? (
                    <span
                      aria-hidden
                      className="ms-auto text-xs tracking-widest text-muted-foreground"
                    >
                      {item.shortcut}
                    </span>
                  ) : null}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </div>
        </ComboboxPrimitive.Root>
      </DialogContent>
    </Dialog>
  )
}

export { CommandPalette }
export type { CommandPaletteProps, CommandPaletteItem }
