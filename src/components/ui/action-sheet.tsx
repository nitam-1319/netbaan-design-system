import * as React from "react"

import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  type BottomSheetContentProps,
} from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Action Sheet (Mobile-specific, closed API)
 *
 * The mobile idiom for "what do you want to do with this?" — a set of choices,
 * one of them often destructive, presented as a stack of full-width rows rising
 * from the bottom of the screen with a separated Cancel. It is a **config-driven
 * convenience over `Bottom Sheet`** (mirroring how `Confirmation Dialog` is a
 * config-driven convenience over `Dialog` — see `.agent/DECISIONS.md`,
 * 2026-07-22b): you pass an `actions` array and it renders the rows, wiring each
 * one to close the sheet and fire its handler, and composing AEGIS `Button` so
 * tokens stay consistent. The whole overlay contract — portal, backdrop, focus
 * trap, scroll lock, `role="dialog"` / `aria-modal`, Escape / outside-press —
 * comes from the Base UI `Dialog` primitive underneath `Bottom Sheet`.
 *
 *   <ActionSheet>
 *     <ActionSheetTrigger render={<Button>Options</Button>} />
 *     <ActionSheetContent
 *       title="asset-42.netbaan.io"
 *       actions={[
 *         { label: "Rescan", icon: <RefreshCw />, onClick: rescan },
 *         { label: "Delete", icon: <Trash2 />, destructive: true, onClick: remove },
 *       ]}
 *     />
 *   </ActionSheet>
 *
 * Because it has an explicit Cancel row, the sheet's corner close button is off
 * by default. A drag-to-dismiss gesture is inherited-as-deferred from
 * `Bottom Sheet` (browser-verified follow-up). Destructive rows use the
 * `destructive` Button variant so danger is signalled by token, not by colour
 * alone — the label still names the consequence.
 *
 * Public API is CLOSED: no `className` / `style`. Rows come from `actions`;
 * intent is the per-action `destructive` flag. See `.agent/rules/API_RULES.md`.
 */

/** One row in the sheet. */
type ActionSheetAction = {
  /** Row label. */
  label: React.ReactNode
  /** Fired when the row is chosen (before the sheet closes). */
  onClick?: () => void
  /** Optional leading icon. */
  icon?: React.ReactNode
  /** Style + announce this row as a dangerous action. */
  destructive?: boolean
  /** Disable this row (it won't close the sheet or fire its handler). */
  disabled?: boolean
}

function ActionSheet(props: React.ComponentProps<typeof BottomSheet>) {
  return <BottomSheet data-slot="action-sheet" {...props} />
}

function ActionSheetTrigger(
  props: React.ComponentProps<typeof BottomSheetTrigger>
) {
  return <BottomSheetTrigger data-slot="action-sheet-trigger" {...props} />
}

type ActionSheetContentProps = Omit<
  BottomSheetContentProps,
  "children" | "showClose"
> & {
  /** The rows, top to bottom. */
  actions: ActionSheetAction[]
  /** Optional heading above the rows. */
  title?: React.ReactNode
  /** Optional supporting copy under the title. */
  description?: React.ReactNode
  /** Cancel row label. */
  cancelLabel?: React.ReactNode
  /** Render the separated Cancel row. Default `true`. */
  showCancel?: boolean
  /** Fired when Cancel is chosen (before the sheet closes). */
  onCancel?: () => void
  /**
   * Accessible name used when no `title` is given (the sheet still needs a
   * label). Defaults to `"Actions"`.
   */
  "aria-label"?: string
}

function ActionSheetContent({
  actions,
  title,
  description,
  cancelLabel = "Cancel",
  showCancel = true,
  onCancel,
  showGrabber = true,
  height = "sm",
  "aria-label": ariaLabel,
  ...props
}: ActionSheetContentProps) {
  return (
    <BottomSheetContent
      data-slot="action-sheet-content"
      height={height}
      showGrabber={showGrabber}
      showClose={false}
      // Base UI warns without a Title; supply a name when the sheet is title-less.
      aria-label={title ? undefined : ariaLabel ?? "Actions"}
      {...props}
    >
      {title || description ? (
        <BottomSheetHeader>
          {title ? <BottomSheetTitle>{title}</BottomSheetTitle> : null}
          {description ? (
            <BottomSheetDescription>{description}</BottomSheetDescription>
          ) : null}
        </BottomSheetHeader>
      ) : null}

      <div data-slot="action-sheet-list" className="flex flex-col gap-2">
        {actions.map((action, i) => (
          <BottomSheetClose
            key={i}
            data-slot="action-sheet-item"
            onClick={() => action.onClick?.()}
            render={
              <Button
                variant={action.destructive ? "destructive" : "secondary"}
                size="lg"
                disabled={action.disabled}
              />
            }
          >
            {action.icon}
            {action.label}
          </BottomSheetClose>
        ))}
      </div>

      {showCancel ? (
        <BottomSheetClose
          data-slot="action-sheet-cancel"
          onClick={() => onCancel?.()}
          render={<Button variant="ghost" size="lg" />}
        >
          {cancelLabel}
        </BottomSheetClose>
      ) : null}
    </BottomSheetContent>
  )
}

export { ActionSheet, ActionSheetTrigger, ActionSheetContent }
export type { ActionSheetContentProps, ActionSheetAction }
