import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  selectTriggerVariants,
} from "@/components/ui/select"

/**
 * AEGIS — Model / Agent Selector
 *
 * A Select specialised for choosing an AI model or agent: each option carries a
 * label plus optional icon, one-line description, and a short badge (e.g. "Pro",
 * "New"), and options can be grouped (e.g. by provider or tier). The trigger
 * shows the chosen model's icon + name; the menu shows the full detail.
 *
 * Config-driven convenience over Select (dep Select) — pass a `models` array and
 * it builds the trigger, grouped menu, per-row detail, and selected-state check.
 * The public API is CLOSED — no `className` / `style`; treatment is the semantic
 * `variant` / `size` props inherited from Select. Colour, radius, and motion come
 * from tokens. See `.agent/rules/API_RULES.md`.
 */

type ModelOption = {
  /** Stable value submitted / reported on selection. */
  value: string
  /** Display name shown in the trigger and menu row. */
  label: string
  /** One-line description shown beneath the label in the menu. */
  description?: string
  /** Leading glyph (shown in trigger and menu). */
  icon?: React.ReactNode
  /** Short qualifier chip, e.g. "Pro", "New", "Beta". */
  badge?: React.ReactNode
  /** Disable this option. */
  disabled?: boolean
  /** Optional group heading; options sharing a group are shown together. */
  group?: string
}

type ModelSelectorProps = Pick<
  VariantProps<typeof selectTriggerVariants>,
  "variant" | "size"
> & {
  /** The selectable models / agents. */
  models: ModelOption[]
  /** Controlled selected value. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Fires with the newly-selected value. */
  onValueChange?: (value: string) => void
  /** Trigger placeholder when nothing is selected. */
  placeholder?: React.ReactNode
  /** Accessible name for the trigger. */
  label?: string
  /** Disable the whole selector. */
  disabled?: boolean
  /** Native form field name. */
  name?: string
  /** Menu placement side. */
  side?: React.ComponentProps<typeof SelectContent>["side"]
  /** Menu alignment. */
  align?: React.ComponentProps<typeof SelectContent>["align"]
}

function ModelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="model-selector-badge"
      className={cn(
        "bg-surface-3 text-muted-foreground shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wide uppercase"
      )}
    >
      {children}
    </span>
  )
}

function ModelRow({ model }: { model: ModelOption }) {
  return (
    <span className={cn("flex min-w-0 flex-1 items-center gap-2.5")}>
      {model.icon != null ? (
        <span
          data-slot="model-selector-item-icon"
          className={cn(
            "text-muted-foreground flex size-5 shrink-0 items-center justify-center [&_svg]:size-4"
          )}
        >
          {model.icon}
        </span>
      ) : null}
      <span className={cn("flex min-w-0 flex-col")}>
        <span className={cn("flex items-center gap-2")}>
          <span className={cn("text-foreground truncate font-medium")}>
            {model.label}
          </span>
          {model.badge != null ? <ModelBadge>{model.badge}</ModelBadge> : null}
        </span>
        {model.description != null ? (
          <span
            className={cn(
              "text-muted-foreground truncate text-xs font-normal"
            )}
          >
            {model.description}
          </span>
        ) : null}
      </span>
    </span>
  )
}

function ModelSelector({
  models,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select a model",
  label = "Model",
  disabled,
  name,
  variant = "outline",
  size = "md",
  side = "bottom",
  align = "start",
}: ModelSelectorProps) {
  const byValue = React.useMemo(
    () => new Map(models.map((m) => [m.value, m])),
    [models]
  )

  // Preserve first-seen order of both groups and their members.
  const groups = React.useMemo(() => {
    if (!models.some((m) => m.group)) return null
    const map = new Map<string, ModelOption[]>()
    for (const m of models) {
      const key = m.group ?? "Other"
      const list = map.get(key)
      if (list) list.push(m)
      else map.set(key, [m])
    }
    return Array.from(map, ([heading, items]) => ({ heading, items }))
  }, [models])

  const renderItem = (m: ModelOption) => (
    <SelectItem key={m.value} value={m.value} disabled={m.disabled}>
      <ModelRow model={m} />
    </SelectItem>
  )

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={
        onValueChange as React.ComponentProps<typeof Select>["onValueChange"]
      }
      disabled={disabled}
      name={name}
    >
      <SelectTrigger
        data-slot="model-selector"
        variant={variant}
        size={size}
        aria-label={label}
      >
        <SelectValue placeholder={placeholder}>
          {(selected: unknown) => {
            const m = byValue.get(selected as string)
            if (!m) return placeholder
            return (
              <span className={cn("flex min-w-0 items-center gap-2")}>
                {m.icon != null ? (
                  <span
                    className={cn(
                      "text-muted-foreground flex size-4 shrink-0 items-center justify-center [&_svg]:size-4"
                    )}
                  >
                    {m.icon}
                  </span>
                ) : null}
                <span className={cn("truncate")}>{m.label}</span>
              </span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent side={side} align={align}>
        {groups
          ? groups.map((g, gi) => (
              <React.Fragment key={g.heading}>
                {gi > 0 ? <SelectSeparator /> : null}
                <SelectGroup>
                  <SelectGroupLabel>{g.heading}</SelectGroupLabel>
                  {g.items.map(renderItem)}
                </SelectGroup>
              </React.Fragment>
            ))
          : models.map(renderItem)}
      </SelectContent>
    </Select>
  )
}

export { ModelSelector }
export type { ModelSelectorProps, ModelOption }
