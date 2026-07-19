# ACCESSIBILITY_RULES.md — WCAG 2.2 AA

Target: **WCAG 2.2 AA** for every component.

## Keyboard
Verify Tab order, Enter, Space, Escape, Arrow keys, and focus movement.

## ARIA
Verify roles, labels, descriptions, states, and relationships. Prefer semantic HTML and Base UI's
built-in ARIA over hand-rolled attributes.

## Focus
Every interactive element has a visible focus state, a logical focus order, and correct focus
management (traps for dialogs, restore on close).

## Screen readers
Semantic HTML, accessible names, meaningful descriptions.

## Color & contrast
Verify contrast ratios for default, disabled, error, and dark-mode states.

Automated checks (axe via Storybook a11y) supplement but do not replace manual keyboard/SR review.
See `../rules/TESTING_RULES.md` for how a11y-runner results are reported.
