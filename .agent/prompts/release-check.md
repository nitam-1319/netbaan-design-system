# prompt: release-check (RELEASE mode)

Read `../AGENT.md`, then `../guides/RELEASE_GUIDE.md`.

1. Confirm machine gates green on `aegis/build`.
2. Confirm runner gates (Storybook/play/a11y) + visual regression, or flag gaps.
3. Run `node .agent/scripts/verify-inventory.mjs` — tracker must reconcile with disk.
4. Bump version + generate changelog from Conventional Commits.
5. Prepare the release and **request human sign-off** before publishing. Do not auto-publish.
6. Report released set + version + any gaps.
