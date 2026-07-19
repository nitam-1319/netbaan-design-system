# Reference — Dialog (Complex Interactive tier)

Target source: `src/components/ui/dialog.tsx`. Built on Base UI `Dialog`
(`@base-ui/react/dialog` — verify path per `../DECISIONS.md`).

## Patterns this reference locks in (do not re-derive these from Button)
- **Composition, not a monolith**: `Dialog.Root / Trigger / Portal / Backdrop / Popup / Title /
  Description / Close`. Consumers assemble; no giant prop bag.
- **Controlled + uncontrolled**: `defaultOpen` (uncontrolled) vs `open` + `onOpenChange`
  (controlled). Mirror Base UI's contract exactly; do not reinvent.
- **Focus management**:
  - focus moves into the dialog on open (first focusable or an explicit `initialFocus`),
  - focus is **trapped** while open,
  - focus is **restored** to the trigger on close.
  Prefer Base UI's built-in focus handling over hand-rolled traps.
- **Keyboard**: `Escape` closes (unless explicitly disabled), `Tab`/`Shift+Tab` cycle within,
  trigger opens on `Enter`/`Space`.
- **ARIA**: `role="dialog"`, `aria-modal`, `aria-labelledby`→Title, `aria-describedby`→Description
  (mostly provided by the primitive — verify, don't assume).
- **RTL/LTR**: backdrop + positioning correct in both; close-icon placement uses logical properties.
- **Tokens**: elevation/backdrop/spacing all tokenized.

## Required stories
Open/close (controlled + uncontrolled), Escape-to-close, focus-trap play test, RTL, Persian, Dark.

## Play test sketch
```ts
import { expect, userEvent, screen } from "storybook/test";
// open → assert focus inside → Tab cycles within → Escape → assert focus back on trigger
```
