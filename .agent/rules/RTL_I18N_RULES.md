# RTL_I18N_RULES.md — Internationalization & direction

## Languages
Every component works in **English** and **Persian (Farsi)**, including mixed EN/FA content.

## Persian typography
When language is Persian, use `Vazirmatn`. Requirements: correct font loading, correct weights,
proper line-height, no overflow, no broken alignment.

## Direction
Support both `direction: ltr` (English) and `direction: rtl` (Persian).
Verify per component: spacing direction, icon placement, animation direction, dropdown/popover
positioning, alignment, keyboard navigation, and focus movement.

Use logical CSS properties (`margin-inline-start`, `padding-inline-end`, `inset-inline`) rather than
physical `left/right` so RTL is correct by construction.

## Icon mirroring
Directional icons (arrows, chevrons, navigation) must mirror in RTL. Non-directional icons
(search, settings) must **not** mirror. Review every icon explicitly.
