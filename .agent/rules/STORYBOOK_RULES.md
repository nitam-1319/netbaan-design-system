# STORYBOOK_RULES.md — Storybook standards

Storybook is a first-class deliverable. Every component ships:
```
src/components/ui/<name>.stories.tsx
src/components/ui/<name>.mdx   (see ../rules/DOCUMENTATION_RULES.md)
```

## Story file
- `title: "Components/<Name>"`
- `tags: ["autodocs"]`

## Controls
Expose every configurable prop: `variant`, `size`, `disabled`, `loading`, `value`, `checked`,
`orientation`, `density`, `placement`, etc. Do not hide meaningful behavior.

## Actions
Wire every event: `onClick`, `onChange`, `onOpenChange`, `onValueChange`, `onSelect`, `onFocus`,
`onBlur`, `onSubmit`.

## Coverage — every component demonstrates
- **Variants:** all of them.
- **Sizes:** all of them.
- **States:** Default, Hover, Focus, Active, Disabled, Loading, Error, Success, Warning, Selected,
  Empty, Filled, Readonly, Invalid (only those that apply to the component).
- **Environments:** Light, Dark, RTL, LTR, Persian, English.

## Play tests (interactive components)
```ts
import { expect, userEvent, screen } from "storybook/test";
```
Cover: click, type, open, close, select, keyboard interaction, focus behavior, validation.

Execution & honesty: whether play tests / a11y checks count as "passing" is governed by
`../rules/TESTING_RULES.md`. Do not report unexecuted runners as green.
