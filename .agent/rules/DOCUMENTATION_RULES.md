# DOCUMENTATION_RULES.md — Component MDX

Every component ships `src/components/ui/<name>.mdx` with:
- `title: "Components/<Name>/Guidelines"`

Sections:
- **Overview** — purpose + description
- **Usage** — when to use / when not to use
- **Anatomy** — structure
- **Variants** — all variants
- **States** — all states
- **Behavior** — controlled/uncontrolled, keyboard
- **Accessibility** — keyboard + ARIA behavior
- **Tokens** — tokens the component consumes
- **API** — complete prop table
- **Examples** — including RTL/Persian and Dark

Keep each rule's *authority* in its own rule file; MDX explains and demonstrates, it does not
redefine the rules.
