# references/ — Gold-standard reference implementations

Three tiers, each teaching patterns that do **not** generalize from the tier below:

| Tier | Reference | Teaches |
|------|-----------|---------|
| Primitive | `PRIMITIVE.button.md` | CVA variants, strict typing, tokens, basic states, API shape |
| Interactive | `INTERACTIVE.dialog.md` | focus management, keyboard, open/close, controlled/uncontrolled |
| Data | `DATA.datatable.md` | composition, large-data rendering, loading/empty/error, perf |

**These are the executable spec.** When a rule changes, the affected reference is updated **first**;
otherwise it stops being a reference. New components copy the closest-tier reference's structure.
