import * as React from "react"
import { Eye, EyeOff, KeyRound, Trash2 } from "lucide-react"

import { List, ListItem, ListItemContent } from "@/components/ui/list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/ui/copy-to-clipboard"

/**
 * AEGIS — API Key Manager (Auth & Security)
 *
 * The list panel for a user's API keys: each row shows the key name, its scopes,
 * a masked secret with a reveal toggle and one-press copy, metadata (created /
 * last used), and a revoke action. It composes the AEGIS `List` / `ListItem`,
 * `Button`, `Badge`, and the `CopyButton` from Copy-to-Clipboard, so it inherits
 * the system's affordances.
 *
 * Secrets are masked by default and revealed per-row on demand; the reveal state
 * is local and never leaves the component. Public API is CLOSED — no `className` /
 * `style`; everything is a semantic prop. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type ApiKey = {
  /** Stable id passed back to `onRevoke`. */
  id: string
  /** Human-readable key name, e.g. "Production". */
  name: React.ReactNode
  /** The secret value (copied verbatim; masked until revealed). */
  value: string
  /** Non-secret display prefix shown while masked (e.g. "sk_live_a1b2"). */
  prefix?: string
  /** Scopes / permissions → small badges. */
  scopes?: string[]
  /** Created label, e.g. "Created Apr 2". */
  created?: React.ReactNode
  /** Last-used label, e.g. "Last used 2h ago". */
  lastUsed?: React.ReactNode
}

/** Build a masked representation: visible prefix + fixed bullet run. */
function maskValue(key: ApiKey): string {
  const head = key.prefix ?? key.value.slice(0, 6)
  return `${head}${"•".repeat(12)}`
}

function ApiKeyRow({
  apiKey,
  onRevoke,
  revealable,
  revokeLabel,
}: {
  apiKey: ApiKey
  onRevoke?: (id: string) => void
  revealable: boolean
  revokeLabel: React.ReactNode
}) {
  const [revealed, setRevealed] = React.useState(false)
  const display = revealed ? apiKey.value : maskValue(apiKey)
  const nameStr = typeof apiKey.name === "string" ? apiKey.name : undefined

  return (
    <ListItem
      data-slot="api-key-manager-item"
      data-revealed={revealed || undefined}
      density="comfortable"
    >
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-3 text-muted-foreground [&>svg]:size-4.5"
      >
        <KeyRound />
      </span>

      <ListItemContent>
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {apiKey.name}
          </span>
          {apiKey.scopes?.map((scope) => (
            <Badge key={scope} tone="neutral" variant="soft" size="sm">
              {scope}
            </Badge>
          ))}
        </span>

        <span className="flex items-center gap-1.5">
          <code
            data-slot="api-key-manager-value"
            dir="ltr"
            className="min-w-0 truncate font-mono text-xs text-muted-foreground"
          >
            {display}
          </code>
        </span>

        {(apiKey.created != null || apiKey.lastUsed != null) && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-faint">
            {apiKey.created != null ? <span>{apiKey.created}</span> : null}
            {apiKey.created != null && apiKey.lastUsed != null ? (
              <span aria-hidden>·</span>
            ) : null}
            {apiKey.lastUsed != null ? <span>{apiKey.lastUsed}</span> : null}
          </span>
        )}
      </ListItemContent>

      <span className="ms-auto flex shrink-0 items-center gap-1">
        {revealable ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRevealed((r) => !r)}
            aria-label={
              revealed
                ? nameStr
                  ? `Hide ${nameStr}`
                  : "Hide key"
                : nameStr
                  ? `Reveal ${nameStr}`
                  : "Reveal key"
            }
          >
            {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        ) : null}
        <CopyButton
          value={apiKey.value}
          variant="ghost"
          size="sm"
          aria-label={nameStr ? `Copy ${nameStr}` : "Copy key"}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRevoke?.(apiKey.id)}
          aria-label={nameStr ? `${revokeLabel} ${nameStr}` : "Revoke key"}
        >
          <Trash2 aria-hidden className="text-destructive-ink" />
        </Button>
      </span>
    </ListItem>
  )
}

type ApiKeyManagerProps = Omit<
  React.ComponentProps<typeof List>,
  "children" | "variant" | "ordered"
> & {
  /** The API keys to list. */
  keys: ApiKey[]
  /** Fired with a key id when its revoke button is pressed. */
  onRevoke?: (id: string) => void
  /** Show the per-row reveal toggle. Default `true`. */
  revealable?: boolean
  /** Revoke button label (used in the accessible name). Default "Revoke". */
  revokeLabel?: React.ReactNode
  /** Message shown when there are no keys. Default "No API keys yet." */
  emptyLabel?: React.ReactNode
}

function ApiKeyManager({
  keys,
  onRevoke,
  revealable = true,
  revokeLabel = "Revoke",
  emptyLabel = "No API keys yet.",
  ...props
}: ApiKeyManagerProps) {
  if (!keys || keys.length === 0) {
    return (
      <div
        data-slot="api-key-manager-empty"
        className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground"
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <List data-slot="api-key-manager" variant="bordered" {...props}>
      {keys.map((apiKey) => (
        <ApiKeyRow
          key={apiKey.id}
          apiKey={apiKey}
          onRevoke={onRevoke}
          revealable={revealable}
          revokeLabel={revokeLabel}
        />
      ))}
    </List>
  )
}

export { ApiKeyManager, maskValue }
export type { ApiKeyManagerProps, ApiKey }
