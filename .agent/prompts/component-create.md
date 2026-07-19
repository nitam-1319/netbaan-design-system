# prompt: component-create (CREATE mode)

Read `../AGENT.md`, then load the CREATE document set it lists.

Steps:
1. Select next component (`../checklists/COMPONENTS_STATUS.md`), respect priority + dependencies.
2. Verify the Base UI primitive path (`../guides/COMPONENT_ARCHITECTURE.md`); stop if missing.
3. Implement `src/components/ui/<name>.tsx` (CVA, `cn()`, `data-slot`, tokens only, canonical API,
   controlled+uncontrolled, forwardRef where needed).
4. Add `.stories.tsx` and `.mdx` per `../rules/STORYBOOK_RULES.md` and
   `../rules/DOCUMENTATION_RULES.md`.
5. Run machine gates; run runner gates if available, else tag `human-verify`
   (`../rules/TESTING_RULES.md`).
6. Update the tracker; commit + push.
7. Report.

Do not rewrite neighboring components. Record any inconsistency as a REVIEW finding.
