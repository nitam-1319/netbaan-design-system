# COMPONENT_INVENTORY.md — Catalog

## Categories
- **Essential** — primitives & foundations (Button, Input, Icon, Text, Box/Stack, Tooltip, ...).
- **Recommended** — common product components (Select, Dialog, Tabs, Table, Toast, ...).
- **Advanced** — complex/enterprise (DataGrid, Combobox, DatePicker, Command palette, ...).

For each component track: name, category, dependencies, implementation status, docs status,
test status, and **last-review date**.

**No separate "ownership metadata" file.** A dedicated metadata file would just duplicate these
fields (name, category, dependencies, status). The only field that isn't already here is the
last-review date — so it lives in this table, not in a parallel file that would drift. ("Ownership"
was also a misnomer; there is no human owner field.)

## Scope note on the "219" target
219 is very large — larger than the count of *distinct* components in Material UI, Carbon, or
Polaris. It almost certainly counts variants/states/sub-parts as separate items. Before treating
219 as a fixed contract:
1. Decide the unit ("component" vs "variant") and record it here.
2. Split the list into the three categories above so priority is real, not nominal.
At the stated quality bar, each true component is substantial work; an inflated denominator makes
`Progress` misleading.

## Keeping the catalog honest
The catalog and `COMPONENTS_STATUS.md` must reconcile with the filesystem. Run:
```bash
node .agent/scripts/verify-inventory.mjs
```
It scans `src/components/ui/` and reports components on disk that are missing from the tracker (and
vice-versa). Trackers are trust-based only until this passes.
