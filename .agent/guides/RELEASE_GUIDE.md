# RELEASE_GUIDE.md — Release process (RELEASE mode)

## Versioning
- Semantic Versioning. Breaking API change → major; additive component/prop → minor; fix → patch.
- Release notes are **generated** from Conventional Commits (e.g. `changesets` or
  `conventional-changelog`) into the root `CHANGELOG.md`. Confirm which tool the repo uses first.

## Changelog reconciliation
`CHANGELOG.md` has two layers (see its header): generated release notes + **curated** migration
notes for breaking changes. Before release, verify every breaking change in the generated notes has
a matching Migration entry. Do not let a hand-written and a generated changelog drift apart.

## Pre-release gates
1. All machine gates green on `aegis/build` (`tsc --noEmit`, `build`, `lint`).
2. Storybook builds; play tests pass (or are explicitly `human-verify` with reason).
3. **Visual regression** review passes (Chromatic or equivalent). Table stakes at this tier — a
   component can pass unit/a11y checks and still regress visually.
   **Sample, don't take the full cartesian product.** Theme × direction × breakpoint × state across
   hundreds of components is a snapshot explosion that produces diff-fatigue and gets rubber-stamped.
   Snapshot a representative matrix per component: the default state in {Light, Dark} × {LTR, RTL},
   plus each *distinct* layout-affecting state (loading/empty/error) once, and one small + one large
   breakpoint. Add more snapshots only where a component has known direction/theme-sensitive layout.
   If no VR tooling is wired up yet, flag it as a blocker to set up; record the gap, don't skip it.
4. `checklists/COMPONENTS_STATUS.md` reconciles with the filesystem
   (`node .agent/scripts/verify-inventory.mjs` reports no drift).

## Release steps
1. Bump version + generate changelog.
2. Tag the release.
3. Publish per repo convention.
4. Record released component set and version in the run report.

## Human checkpoint
A release is a human-gated event. Prepare everything, produce the report, and **request sign-off**
before publishing. Do not auto-publish.
