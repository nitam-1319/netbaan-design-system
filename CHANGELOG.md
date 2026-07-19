# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

---

## [Unreleased]

### Migration notes (curated)
_None yet._

<!-- Template for a breaking change:

## Button v2
Breaking: removed `color` prop in favor of `variant`.
Migration:
    <Button color="red" />   ->   <Button variant="danger" />
Deprecated: `color` (removed in v2; warned in v1.x).
-->
