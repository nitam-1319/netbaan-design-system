# DESIGN_RULES.md — Consistency & visual quality

## One unified system
- Before adding a component, review its neighbors and reuse the **existing approved pattern**.
  Never introduce a new pattern when an approved one exists.
- The system converges toward one quality standard over time. A newer component being "nicer"
  than older ones is itself an inconsistency to be resolved — **but** resolve it in REFACTOR/UPGRADE
  mode, never mid-CREATE (see `../AGENT.md` §3.2). During CREATE you *record* the gap
  (as a REVIEW finding) and move on; you do not silently rewrite neighbors.

## Visual quality bar
Every component must read as production-ready: spacing, alignment, typography, hierarchy, state
transitions, responsiveness, and cross-component consistency all deliberate. Benchmark tier:
Material UI, Fluent UI, IBM Carbon, Adobe Spectrum, Shopify Polaris.

## Scope note
This is an editorial/metaphor-friendly system, not a generic SaaS clone — distinctive visual
direction is welcome **as long as** it is expressed through tokens and approved patterns, never
through per-instance overrides.
