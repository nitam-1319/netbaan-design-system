# prompt: component-review (REVIEW mode — read-only)

Read `../AGENT.md`, then load `../checklists/REVIEW_CHECKLIST.md` and the relevant rule files.

Audit the named component(s) against current standards. Produce a **findings report only**:
- what fails (API, a11y, RTL, tokens, dark mode, tests, escape hatches)
- severity + suggested fix
Do **not** modify any code in this mode. Findings feed REFACTOR/UPGRADE.
