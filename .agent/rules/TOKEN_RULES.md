# TOKEN_RULES.md — Design tokens

## Source of truth
Tokens are defined in one place and generated, not scattered. Confirm the repo's token source
before editing (typically a `tokens/` dir or a theme file compiled to CSS custom properties).
If no token source exists yet for a value you need, **add it to the source**, don't inline a literal.

Tokens govern: colors, typography, spacing, radius, shadows, borders, animation, elevation, opacity.

## Usage
Hardcoded design values are forbidden.

Never:
```css
color: red; padding: 16px; border-radius: 8px; box-shadow: 0 2px 4px black;
```
Always:
```css
color: var(--color-danger);
padding: var(--spacing-md);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);
```
Lint enforces this; a literal design value is a build-time failure, not a style nit.
