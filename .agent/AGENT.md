# AGENT.md — AEGIS × NetBaan Design System Agent (Router)

> **This is the only document you are required to read on every run.**
> It routes you to the task-specific documents you actually need.
> Do **not** load all rule files up front. Load only the set your current mode requires.
> Reason: front-loading every rule dilutes attention and degrades adherence to any single rule
> (long-context "lost-in-the-middle"). Modular docs only pay off when loaded on demand.

---

## 1. Purpose

You continuously **build, review, refactor, and release** components for the AEGIS Design System
without quality degradation over time. You operate against a single, versioned source of truth:
the docs under `.agent/`.

The Design System is the source of truth. Application developers **consume** it; they must never
need to bypass it. Any change that creates visual or behavioral inconsistency is a violation.

---

## 2. Repository facts (verify, don't assume)

- Stack: React 19 + TypeScript (strict), Tailwind v4, **shadcn/ui on Base UI** (`@base-ui/react`),
  CVA variants, `cn()` utility, Storybook 10.
- Base UI package: this repo uses **`@base-ui/react`** (v1.x) — the current MUI Base UI package,
  whose primitive API is `render` + `className` (NOT the older `@base-ui-components/react`, and NOT
  `slotProps`). Always confirm before coding: `grep -m1 base-ui package-lock.json` and inspect
  `node_modules/@base-ui/react/<primitive>/`. If the directory is empty or missing, **stop and
  report** — never guess a primitive API. See `DECISIONS.md` (Base UI package path).
- Design tokens: AEGIS palette mapped onto shadcn semantic CSS variables in `src/index.css`
  (dark-first). See `rules/TOKEN_RULES.md`.
- Public component API is **closed** (no `className`/`style`). See `rules/API_RULES.md`.

---

## 3. Safety rules (always in force)

1. Do **not** change application functionality, business logic, or existing runtime behavior.
2. Do **not** rewrite an existing component while in CREATE mode. Upgrades happen only in
   REFACTOR/UPGRADE mode, which is **invoked explicitly** — never triggered implicitly mid-build.
3. Never report a quality gate as "passing" unless you actually executed it in this run and saw it
   pass. If a gate cannot be executed in this environment, mark it `human-verify` and say so.
   A tracker that lies is worse than no tracker. See `rules/TESTING_RULES.md`.
4. Finish one component fully before starting the next (see completion definition in
   `checklists/REVIEW_CHECKLIST.md`).
5. Never push to `main`. All work lands on `aegis/build`. See `guides/BUILD_GUIDE.md`.
6. **Consult `DECISIONS.md` before any architectural choice.** If your choice contradicts an
   `accepted` decision, follow it or add a superseding entry — do not silently diverge. This log is
   the memory you lack across runs.
7. When implementing a new component, copy the closest-tier gold-standard reference in
   `references/` (Primitive → Button, Interactive → Dialog, Data → DataTable).
8. **Reference fidelity is mandatory and machine-gated.** A component must match its AEGIS
   reference in `references/spec/<Name>.dc.html` exactly — structure, visuals, interactions,
   animations, shadows, borders, behavior — not just colors. Components with no reference page
   still follow the same design language + signature motifs. This is enforced by
   `scripts/verify-conformance.mjs` (a hard gate). See `rules/REFERENCE_FIDELITY.md`.

---

## 4. Modes and required reading (lazy loading)

Pick your mode from the task, then load **only** the listed documents.

### MODE: CREATE — build the next new component
**Before coding, open the component's reference and build to it exactly:**
`references/spec/<Name>.dc.html` (spec arrays in its `<script type="text/x-dc">`) and its entry in
`references/spec-manifest.json`. Non-reference components follow the same design language. See
`rules/REFERENCE_FIDELITY.md`.
Load, in order:
1. `guides/BUILD_GUIDE.md`
2. `guides/COMPONENT_ARCHITECTURE.md`
3. `rules/REFERENCE_FIDELITY.md`
4. `rules/API_RULES.md`
5. `rules/TOKEN_RULES.md`
6. `rules/DESIGN_RULES.md`
7. `rules/RTL_I18N_RULES.md`
8. `rules/RESPONSIVE_RULES.md`
9. `rules/STORYBOOK_RULES.md`
10. `rules/ACCESSIBILITY_RULES.md`
11. `rules/DOCUMENTATION_RULES.md`
12. `rules/TESTING_RULES.md`
13. `checklists/REVIEW_CHECKLIST.md`
14. `checklists/COMPONENTS_STATUS.md`
Prompt: `prompts/component-create.md`

### MODE: REVIEW — audit an existing component against current standards (read-only)
Load: `checklists/REVIEW_CHECKLIST.md`, plus whichever rule files the audit touches
(`rules/API_RULES.md`, `rules/ACCESSIBILITY_RULES.md`, `rules/RTL_I18N_RULES.md`, `rules/TOKEN_RULES.md`).
Output: a findings report only. Do **not** modify code in this mode.
Prompt: `prompts/component-review.md`

### MODE: REFACTOR / UPGRADE — bring an existing component up to standard
Only enter this mode when **explicitly** asked, or when acting on a REVIEW report.
Load the same set as CREATE, plus the REVIEW findings you are resolving.
Never silently start this during a CREATE run.
Prompt: `prompts/component-refactor.md`

### MODE: RELEASE — cut a release
Load: `guides/RELEASE_GUIDE.md`, `checklists/REVIEW_CHECKLIST.md`, `checklists/COMPONENTS_STATUS.md`.
Prompt: `prompts/release-check.md`

### MODE: RECURRING BUILD — autonomous loop of CREATE runs
Load: `prompts/recurring-build.md` (which enters CREATE mode per component). This loop is UNATTENDED:
it does NOT stop at the "every 10" / category-boundary checkpoints in `checklists/COMPONENTS_STATUS.md`
(those are for attended review) — it builds continuously until the token budget or the queue is
exhausted, stopping only on a genuine blocker (see that file's "Checkpoint gates").

---

## 5. Documentation map

```
.agent/
├── AGENT.md                       ← you are here (router, only mandatory read)
├── DECISIONS.md                   append-only ADR log (consult before deciding)
├── references/                    gold-standard reference implementations (3 tiers)
│   ├── PRIMITIVE.button.md
│   ├── INTERACTIVE.dialog.md
│   └── DATA.datatable.md
├── guides/
│   ├── BUILD_GUIDE.md             workflow, branches, install, commits, gates
│   ├── COMPONENT_ARCHITECTURE.md  technical shape of a component
│   └── RELEASE_GUIDE.md           versioning, changelog, visual regression, release
├── rules/
│   ├── DESIGN_RULES.md            consistency + visual quality bar
│   ├── REFERENCE_FIDELITY.md      match the reference EXACTLY (machine-gated)
│   ├── API_RULES.md               prop naming, escape-hatch policy
│   ├── TOKEN_RULES.md             tokens: source, generation, usage
│   ├── STORYBOOK_RULES.md         stories, mdx, controls, actions, play tests
│   ├── ACCESSIBILITY_RULES.md     WCAG 2.2 AA
│   ├── TESTING_RULES.md           gates + machine-verifiable vs human-verify
│   ├── RTL_I18N_RULES.md          EN/FA, Vazirmatn, RTL/LTR, icon mirroring
│   ├── RESPONSIVE_RULES.md        breakpoints, touch targets
│   └── DOCUMENTATION_RULES.md     MDX structure
├── checklists/
│   ├── REVIEW_CHECKLIST.md        completion definition (machine vs human)
│   ├── COMPONENT_INVENTORY.md     catalog + scope note + inventory verification
│   └── COMPONENTS_STATUS.md       progress tracker + human checkpoint gates
├── prompts/
│   ├── recurring-build.md
│   ├── component-create.md
│   ├── component-review.md
│   ├── component-refactor.md
│   └── release-check.md
└── scripts/
    └── verify-inventory.mjs       reconciles trackers vs filesystem AND computes per-component status
    └── verify-conformance.mjs     reference-fidelity gate (vs references/spec-manifest.json)

(repo root)
└── CHANGELOG.md                   consumer-facing; generated release notes + curated migration notes
```

**Single-source rule for docs:** each rule lives in exactly one file. Other files cross-reference it
rather than restating it. If you find the same rule in two files, that is a bug — report it.

---

## 6. Every run ends with a report

- Mode run and component(s) touched.
- Gate results, each tagged with exactly one status: `PASS` / `FAILED` / `BLOCKED` /
  `HUMAN_VERIFY_REQUIRED` (with the command you ran). `BLOCKED` = cannot proceed (missing dep,
  broken env); `HUMAN_VERIFY_REQUIRED` = ran or n/a but needs human judgment. These are different
  actions — do not conflate them. See `rules/TESTING_RULES.md`.
- Progress line copied from `checklists/COMPONENTS_STATUS.md`.
- Any blocker: exact step, error, cause, required action.
- Any doc inconsistency or duplicated rule you noticed.
