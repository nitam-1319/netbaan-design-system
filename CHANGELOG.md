# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

---

## [0.7.2]

Patch: **`FilterBar` numbers followed the browser, not the app.**

The bar renders three figures on its own account — an option's `count`, the
active-facet badge, and the count in the summary sentence. The first went
through a bare `toLocaleString()`, which reads the RUNTIME's locale
(`navigator.language`); the other two were interpolated raw. For an app whose
language is a *user preference* all three are wrong: a Persian page in an
`en-US` browser printed `1,234` beside Persian option labels, and the badge and
summary stayed Latin even where the runtime agreed.

- **`FilterBar`** — new `formatCount?: (value: number) => string`, applied to all
  three. Defaults to `value.toLocaleString()`, so nothing changes for an app that
  does not pass it.

A function rather than a `locale` string, for the same reason `labels` is a bag
of strings rather than a locale code: the library stays free of locale data, and
an app that already owns one number formatter uses it here too. See the
**Formatted Counts** story.

---

## [0.7.1]

Patch: **screen-reader copy that no app could translate.** Six components
announced hardcoded English. It was invisible to review — the words are never
painted, so nothing on the page showed that a Persian build was reading English
aloud — and the consuming product's page audit is what surfaced it.

The rule is the one `Pagination` and `DataTable` already followed: English
DEFAULTS, suppliable strings, no locale dependency in the library.

- **`Stepper`** — `statusLabels` for the per-step "(completed)" / "(current
  step)" / "(upcoming)".
- **`PasswordStrengthMeter`** — `metLabel` / `notMetLabel` for each requirement.
- **`FieldLabel`** — `requiredLabel` / `optionalLabel`. `(optional)` is VISIBLE,
  so that one was mistranslatable in plain sight.
- **`Lightbox`** — `announceLabel` for the live-region sentence and `emptyLabel`
  for the empty case. `label` was already suppliable; the sentence announced on
  every slide change was not.
- **`BottomNavigation`** — `newLabel` / `notificationsLabel` for badge copy.
- **`Breadcrumb`** — the ellipsis carried an sr-only "More" inside a span that is
  `role="presentation"` and `aria-hidden`, so it could never be announced at
  all. Removed rather than made suppliable: the collapsed crumbs are reachable
  through the menu the ellipsis opens, and that is where the name belongs.

### The guard
`npm run verify` now runs **`verify:sr-copy`**, which fails on a hardcoded
literal — or bare JSX text — inside `sr-only` / `VisuallyHidden` where no prop
can replace it.

Worth recording how it was built, because the first version was worse than
nothing: it passed on a tree with all six defects still present. Its literal
regex allowed newlines, so it paired the CLOSING quote of one string with the
OPENING quote of the next and never saw a real string. It is now tested by
reintroducing each fixed defect and asserting the check fails — and that test
is what found the last two (`BottomNavigation`, `Breadcrumb`), which the
hand-read had missed.

---

## [0.7.0]

Minor: the **queue-clearing** release. Every design-system defect the consuming
product's page audit had filed — 63 of the 66 still open after 0.6.0 — is
addressed here, plus one build defect the release found on its way out.
**No breaking changes — no migration required.** Component count 223 → 227.

### New components
- **`TextLink`** — a link that IS a value: phrasing content, no control box, so
  a linked IP inside a 10px/4px row stops inflating the row by ~12px (DS-061).
- **`DistributionBar`** — the proportional runway whose parts are controls: one
  segment per bucket sized by count, over a key of tiles, both halves toggling
  the same filter. Label ink is lifted toward `--foreground` because the
  categorical palette is a FILL palette and does not clear AA as small text,
  and slot assignment here is frequency-driven so a per-colour exception cannot
  work (DS-023).
- **`NavigationDrawer`** — the overlay nav surface `Drawer` was never meant to
  be (DS-062, shipped in 0.6.0's tail).
- **`IconPicker`** — a searchable glyph grid with a live preview at the size the
  glyph will be used, and real `radiogroup` semantics. The glyph set stays
  DATA: the library ships no icons, and hard-coding one vendor's would make the
  picker useless to an app drawing from another (DS-029).
- **`useVirtualRows`** — the windowing arithmetic behind `VirtualizedGrid`, on
  its own, so a list that needs its own row markup does not have to give up
  windowing to get it (DS-078).

### Charts
- `--chart-6` is a success green, and the severity ramp now auto-assigns from
  its first five slots only, so a series lands on green by asking rather than by
  position (DS-009).
- A semantic `tone` on every chart series, beating the palette slot — neither
  palette contains a green, so "this is the good direction" had no colour
  (DS-026).
- Per-series `area` on `LineChart` (DS-012); `yScale="log"` on `AreaChart`, via
  `log1p` so a zero is still a position (DS-011); `scale="sqrt"` on
  `GeoChoroplethMap`, continuous with a 0.3 floor, so a skewed domain stops
  rendering as one bright country on an empty world (DS-013).
- `RadialGauge` takes a continuous `diameter` and a `fluid` mode and completes
  the five-step grade tone ramp; `Sparkline` can be fluid; `BreakdownDonut`
  gains an `lg` rung and a continuous diameter (DS-017, DS-046, DS-048).
- `TrendBars` distinguishes an EMPTY period from an ABSENT one, hatches a
  provisional final period, and carries a second series (DS-050).
- `SeverityDonut` takes a `centerLabel`, so one ring can answer "how bad" and
  "how much" at once (DS-008).

### Tables, lists and panels
- `DataTable`: per-column `width`/`minWidth`, a table-level `minWidth`, a
  `flush` variant that can be a `Card`'s body, an eyebrow header band, and a
  row-activation API that owns the keyboard and ARIA wiring — so a row can be
  ONE control instead of a button inside one cell (DS-022).
- `VirtualizedGrid`: `headerHeight`, `variant="flush"`, `renderRow`,
  `onEndReached` (DS-078).
- `Timeline`: `orientation="horizontal"` and selectable items (DS-025).
- `FilterBar`: `search` is optional (a surface with no list to search now gets
  no field rather than a dead control), an opt-in chip row, and an in-flow
  panel that reflows with its container (DS-067).
- `DetailSidebarHeader`: `sticky={false}` and `showClose={false}` (DS-037).
- `BottomSheet`: a resizable grabber with min/max clamps, and `zIndex` (DS-030).

### Fields, controls and chrome
- `Select` takes `label` / `description` / `error` and wires them to the
  trigger, like every other AEGIS field (DS-069).
- `Stepper` steps can be activated (`onStepSelect`, per-step `disabled`) and can
  keep their numerals (DS-020, DS-068).
- `ChoiceCard` gains a stacked layout, a `meta` slot, an icon chip, a check
  mark, and an `actions` slot rendered OUTSIDE the radio's activation target
  (DS-021, DS-081).
- `Toggle`/`ToggleGroup` take a tone, so a filter chip can wear the colour of
  the thing it filters (DS-052). `Tag` takes a `count` and a pill shape
  (DS-033). `StatTileValue` takes a tone, so a stats band can say which of six
  numbers is the alarming one (DS-082).
- `PromptComposer`: `onSubmit` no longer intersects the textarea's own — the
  prop was unsatisfiable — plus a labelled send button and a surface variant
  (DS-027, DS-042).
- `EmptyState` gains a compact rung, a squircle plate and a surface (DS-034);
  `CodeBlock` can cap its own height (DS-038); `MessageBubble` gains a `prose`
  reading view, a `soft` user turn and a `ch` measure (DS-040);
  `PriorityActionItem` gains a title tooltip and stops hard-coding "assets"
  (DS-051); `RemediationVelocity` gains action/footer slots and translatable
  labels (DS-007); `ScrollspyNav` gains item icons, a pill active treatment, a
  compact density and `wrap={false}` (DS-072); `SidebarItem` gains the rail's
  own active start-marker and tint (DS-064).

### Fixes
- **`RecordCard`'s caret pointed UP in Persian whenever the card was open.**
  Tailwind v4 writes `rotate` and `scale` as separate transform properties and
  CSS composes them `translate → rotate → scale`, so `rtl:-scale-x-100` mirrored
  the already-rotated caret. Both it and `ExpandableRows`, which had the same
  pair, now use a single rotation (DS-045).
- **`npm run typecheck` typechecked nothing.** It ran `tsc --noEmit` against the
  root tsconfig, whose `files` is `[]` and whose `references` tsc does not
  follow without `--build`; it had passed for as long as it existed. Pointed at
  `tsconfig.app.json` it surfaced three real errors, all fixed here — the worst
  being `ScanSwitcher` passing raw string ids as Base UI's `items`, so a closed
  `Select` showed the scan's id instead of its date.

### Not shipped
- **DS-049 (the severity ramp).** Severity is ordinal but the `--sev-*` tokens
  are five unrelated hues, and High → Medium is ΔE 8.1 for a deuteranope —
  below the threshold at which two colours stop being separable. A measured
  single-hue replacement was put to the product owner on 2026-09-07 and
  declined, so the tokens are unchanged. Consequence to hold onto: every
  five-rung surface must keep pairing the hue with the rung's WORD (or a
  worst-first order). That redundancy is now the only thing separating High from
  Medium for those readers.

---

## [0.6.0]

Minor: an **accessibility and localisation** pass, driven by a full-app page
audit of the consuming product — every item here was measured on a rendered
page rather than reviewed by eye. **No breaking changes — no migration
required.** Component count unchanged at 223; everything new is additive.

### Fixed

- **`Avatar`** *(DS-086)* — the initials were unreadable on the swatch the
  component picks for them. Each seed ramped from its token toward **white**,
  which put white ink on a pastel: measured on a live page, `NK` sat at
  **1.73:1**, and the whole palette fell between **1.47 and 2.88** against the
  4.5:1 that text needs. The ramp now mixes toward **black**, which keeps each
  person's seeded hue — the point of the seeding — while moving every swatch
  into a band where the ink is legible. The lighter stop is the worst case; at
  58% of the token the weakest seed (`--warning`) measures **5.22:1**, and no
  entry falls below it.

  Choosing the ink per swatch instead could not have worked: the old gradient
  spanned both bands, and white fails on the pale half while dark ink fails on
  `--primary` and `--accent-strong`, which are dark to begin with. Narrowing the
  ramp is what makes one ink correct everywhere. 169 findings across the audit
  trace to this one component.

- **`--font-mono`** *(DS-044)* — the mono stack named no Persian face, so every
  Persian string in a mono context left the webfont stack entirely and rendered
  in the platform monospace beside Vazirmatn text. Measured at **51 of 180**
  Persian-bearing elements on one board, including the Persian-Indic digits in
  stat tiles and axis labels. `Vazirmatn` now sits after `IBM Plex Mono`, so a
  Latin payload — hostname, CVE id, hash — still resolves to Plex Mono and never
  reaches it. The `:lang(fa)` mono rule also covers the `.font-mono` utility,
  not only `code`/`pre`/`kbd`/`samp`.

- **`TextField`** *(DS-074)* — an `error` message printed without painting the
  field, so a caller could say "this is wrong" and have the control still look
  resting. `aria-invalid` now defaults to whether `error` is set; an explicit
  `aria-invalid` still wins, which is what a field driven by native validity
  needs.

- **`Card interactive`** *(DS-079)* — the hover lift never animated. Tailwind v4
  writes it as the standalone `translate` property and the transition listed
  only `transform`, so the card snapped. `translate` is now in the list, and the
  lift is *removed* under `prefers-reduced-motion` rather than merely slowed —
  clamping the duration was a no-op for a property that was never
  transitioning.

- **`Slider`** *(DS-083)* — the root was the height of the 6px track while the
  thumb is 16px, so three quarters of the target the user aims at was outside
  the control's box. The box now reserves the thumb's height, bringing the row
  to the touch floor once its padding is counted; `dense` opts out for an
  inline, undraggable readout.

### Added

- **`PaginationPrevious` / `PaginationNext`** *(DS-059, DS-075)* — accept
  `children` as the visible label, defaulting to `Previous` / `Next`. The words
  were literals inside the component and `children` was not forwarded, so a
  translated app could not use two of the four exported controls at all and
  re-implemented them from `PaginationLink`.
- **`PaginationLink`** *(DS-075)* — a `variant` prop, so an outlined control no
  longer has to be reached through `isActive`. Getting there through `isActive`
  also stamped `aria-current="page"`, which told assistive technology that a
  Previous button was the current page. Adds a `sm` size for pagers that sit
  below 38px.
- **`PaginationEllipsis`** *(DS-075)* — a `label` prop for its screen-reader
  text.
- **`Pagination`** *(DS-058)* — `width="inline"`, so the pager can share a
  footer row with a count or a page readout instead of claiming the full width.
- **`MultiStepForm`** *(DS-066)* — `progressLabel(current, total)` and
  `stepAriaLabel(current, total)`. Three of the four strings this component
  renders were already translatable; the progress line was built as
  `["Step ", n, " of ", total]` and the step region's `aria-label` was literal
  English, so a Persian form read `قبلی` / `بعدی` / `پایان` around an English
  "Step 1 of 4" — and announced the region in English too.
- **`HostsByCountryMap`** *(DS-006)* — `totalLabel` for the unit under the fleet
  total, and `summaryLabel(total, countryCount)` for the accessible summary. The
  summary was assembled from an English template with its own
  `country`/`countries` pluralisation, so a Persian board announced itself in
  English to a screen-reader user however carefully the visible labels were
  translated.
- **`Sidebar`** *(DS-063)* — `density="touch"`, read by every slot from the
  root. `SidebarItem` was `px-3 py-2`, landing a row at about 36px: right under
  a mouse, and under the 44×44px floor the responsive policy sets for touch. The
  prop sits at the root because density is a property of the surface — a rail
  with touch rows and a comfortable header is worse than either. Under `touch`
  the footer also clears `env(safe-area-inset-bottom)`.
- **`Button`** — `width="block"` *(DS-005)* to fill a constrained parent and let
  a long label truncate natively, instead of a `shrink-0` control pushing its
  siblings out; `size="xs"` and `variant="dashed"` *(DS-039)* for an inline
  "+N more" chip; `size="touch"` and `size="icon-touch"` at 40px *(DS-065)* for
  a tap row.
- **`StatusPill`** *(DS-032)* — an `accent` tone. `info` was standing in for
  in-progress work, which made a live state read the same as a note about one.
- **`Progress`** *(DS-018)* — a `size` scale. 8px was the only height, so a
  metric cell wanting a hairline under a figure had to hand-roll its own track.

### Not shipped, deliberately

- **`--sev-*` severity ramp** *(DS-049)* — the five severity hues are unrelated,
  and High and Medium sit **ΔE 8.1** apart for a deuteranope, below the ~10 at
  which two colours stop being separable at a glance. The measured
  single-hue replacement is ready in the issue. It is held back because it is a
  product-wide brand change that the queue entry itself flags for sign-off
  before shipping, and shipping it inside an accessibility patch would change
  every severity surface in the product without anyone having chosen to.

---

## [0.5.3]

Patch: two `FilterBar` fixes — one behavioural, one that had quietly disabled an
existing prop. **No breaking changes — no migration required.** Component count
unchanged at 223.

> `0.5.2` was built and consumed locally but never published; the option-scale
> work cut for it ships here.

### Fixed

- **`FilterBar`** — a `date` facet can no longer be walked into a backwards
  range. The two fields now bound **each other**: the chosen end day caps the
  start calendar and the chosen start day floors the end one, so the ordinary
  path through the control cannot produce a range that matches nothing. The
  calendar is not the only way in — a day can be typed, and a whole range
  arrives from a deep link having never passed through the component — so a pair
  that lands backwards anyway is reported rather than accepted: both fields go
  `aria-invalid`, the pair is explained beneath them, the rail entry reads
  `invalid`, and the trigger's count turns destructive so the state survives the
  panel closing. The out-of-range value is still shown; blanking what the user
  typed would leave nothing to correct.
- **`FilterBar`** — a `date` facet's `min` / `max` are narrowed to a day before
  they reach the field. They are documented as ISO bounds and the filter-options
  endpoints send full timestamps, but a native date input **drops** a `min` /
  `max` it cannot read as `YYYY-MM-DD` instead of reporting it — so the facet's
  own bounds had never actually constrained the calendar.
- **`FilterBar`** — a `multi` facet's option list is sized by the response, not
  the design: past ~60 options it windows itself, rendering only the rows near
  its viewport against a full-height scroll range, and ranking and membership
  moved to `Map` / `Set` lookups so a wide facet costs no more per keystroke
  than a narrow one. The rail scrolls inside the panel rather than stretching it
  past the viewport, and is stretched to the pane so it always meets the footer.
  Windowed rows stay direct children of the labelled `group` and are addressed
  by arrow keys (plus `Home` / `End`), so every option is reachable even though
  most are not materialised. *(Cut for 0.5.2.)*

### Added

- **`FilterBarLabels.invalidRange`** — the message shown beneath a backwards
  date range. Defaults to `"Start date must be on or before the end date."`
- **`FilterBarLabels.invalidShort`** — that facet's word in the rail, in place of
  its value summary. Defaults to `"invalid"`. Both are optional, like every other
  label; an app that overrides `labels` should add them so the state is not
  reported in English inside a translated panel.

---

## [0.5.1]

Patch: one `FilterBar` behaviour fix. **No breaking changes — no migration
required.** Component count unchanged at 223.

### Fixed

- **`FilterBar`** — the hairline between the hoisted selection and the rest of
  the options now withdraws once it would misdescribe the order, instead of
  claiming that a checked row below it is unselected. Option order is frozen for
  the duration of a panel visit, so checking an option further down deliberately
  does not move it up; the line, placed unconditionally at the first unselected
  row, then described the order as it was when the visit began rather than as it
  is. Nothing becomes ambiguous when the line goes — the row tint and the
  checkbox state carry the selection on their own.

---

## [0.5.0]

Minor: one additive component and two additive props, all aimed at the list
page — the toolbar above the table, and the two affordances that reach it from
the keyboard. **No breaking changes — no migration required.** Component count
222 → 223.

### Added

- **`FilterBar`** — the single filter toolbar for every list page. The page
  declares a `facets` array saying *what* it filters on and the bar decides its
  own controls, so list pages stop each re-improvising a chip row plus a rank of
  dropdowns. Three facet types (`multi`, `date`, `text`) cover the product's
  list surfaces. Four things about it are deliberate:
  - **The panel is portalled.** List pages render inside `Card > CardContent`,
    which clips, and the panel is taller than a short list card. Portalling plus
    collision flipping is what keeps the footer's `Clear all` and `Done`
    reachable at all — it is load-bearing, not incidental.
  - **A summary sentence replaces the chip row.** Chips cost a whole row of
    vertical space to say what one sentence says, and they push the table
    further down the page as they accumulate, so the filtered list gets harder
    to see the more you filter it.
  - **Selected-first ordering is frozen per visit.** Selected options hoist to
    the top, but the order is captured only where a visit begins — opening the
    panel, switching facets — and never on click, because re-sorting live slides
    the next row out from under the pointer as it is being checked.
  - **The active facet is resolved, never assumed.** The facet set changes under
    an open panel when the org switches or a wizard step re-filters its options;
    resolving against the live set is what keeps the pane from rendering blank
    against a stale id.

  Option rows carry their own checkbox semantics (`role="checkbox"` on the row,
  `Checkbox` rendered as a presentational span) because nesting a button inside
  a button is invalid HTML. A facet-options failure is contained to the pane, so
  a dead options endpoint never takes the list down with it. Filtering applies
  live; `Done` only closes. Every string the bar renders on its own account is
  overridable through `labels`, the same contract as `Pagination` and
  `DataTable`.
- **`SearchInput` `shortcut`** — a single-key page shortcut (conventionally
  `"/"`) that renders as a trailing `Kbd` hint and focuses the field from
  anywhere on the page, ignoring presses made while another text control already
  has focus. The hint is shown rather than revealed on hover, so the affordance
  is discoverable, and it yields the trailing edge to the clear button the moment
  the field has something to clear.
- **`Card` `spotlight`** — the pointer-tracked accent bloom on its own, without
  the affordances that say "control". `interactive` bundles four treatments: the
  bloom, a 3px hover lift, an accent border and a pointer cursor. The first says
  the surface is alive; the other three say it is clickable. A board of resting
  cards wants the first and must not have the second, because a reader who
  clicks a card that rises and lights its border and gets nothing has been lied
  to. `spotlight` composes with every variant, `beam` included — there the bloom
  belongs to the inner panel, since that is the element carrying `--card`. The
  layer parks off-surface and returns there on `mouseleave`, so a card the
  pointer has left is never left glowing where it last saw one.

---

## [0.4.0]

Minor: two additive components for the two-panel record browser — a column of
entities you pick from, beside a column of what you picked. **No breaking
changes — no migration required.** Component count 220 → 222.

### Added

- **`SelectionRail`** — the entity column. A sticky card over a bounded scroll
  box with overscroll containment, so a long rail never steals the page's
  scroll, and a "load more" control pinned under the list rather than inside
  it. The open row is marked three ways at once (`aria-current`, an accent
  edge, a marker line under the label) so the selection survives a glance, a
  screenshot and a monochrome print. Counts are each entity's own figure; the
  rail never totals them, because a sum across loaded pages describes the
  fetching, not the data. Handles its own loading, loading-more and empty
  states.
- **`RecordCard`** — the detail column's record, collapsed by default, with
  `RecordCardHeader` / `RecordCardFields` / `RecordCardField` /
  `RecordCardFooter` parts. Two things make it a component rather than a
  `Collapse` and some spans:
  - The header is a `role="button"` div, because it carries the record's own
    controls and a button inside a button is invalid HTML. That costs it a real
    button's keyboard behaviour, so it wires Enter and Space itself — with
    `preventDefault` on Space, without which a page where everything starts
    collapsed is unreachable by keyboard.
  - A `masked` field's value never reaches the DOM. `masked` renders dots
    *instead of* the children, so a screen reader, a text copy and a page
    snapshot all see what the eye sees. Masking by colour or by an overlay is
    not masking.

  Fields stack one per row against a fixed label column rather than in an
  auto-fit grid: harvested values have wildly unequal heights — an email is one
  line, a concatenated hash bundle is twenty — and in a grid every cell on a row
  stretches to the tallest of them, stranding a long value's neighbours at the
  top of an otherwise empty column.

Both are token-only with closed APIs; the count and hint chips compose `Badge`,
so their hues come from the shared tone ramp. Neither knows anything about the
domain they were built for.

---

## [0.3.0]

Minor: five additive components, one additive prop, and a build fix that
restores styling the 0.2.x releases shipped broken. **No breaking changes — no
migration required.** Component count 215 → 220.

### Fixed

#### Utility classes declared in `src/lib/` were dropped from the build
`src/styles.css` only scanned `./components/**`, so Tailwind never saw the class
names in `src/lib/media.ts`. The names still landed in the markup, so nothing
errored — the elements just rendered unstyled. In practice the asset cards' 132px
media strip collapsed to a bare caption. `styles.css` now also scans `./lib/**`.
**This affects anyone on 0.2.0 or 0.2.1 using `ScreenshotThumb`,
`MiniLocationMap` or `AssetTriageCard`** — upgrade to pick up the fix.

### Added

- **`SeverityDonut`** — the findings ring, one wedge per severity sized by its
  share with the total in the hole. One component with a `size` prop, rather
  than a separate drawing per surface. It owns the severity order, omits zero
  rungs, drops the gap when only one rung is populated, and fits the centre
  label so a four-digit total stays inside the hole instead of pushing its card
  taller.
- **`SeverityLegend`** — the five-rung tally that sits under a page title: one
  pill per severity carrying its colour, its name, and its count.
- **`PageHeaderBand`** — the console's page header: kicker, title and counts
  line on an accent-tinted hero surface, with the page's actions at the inline
  end.
- **`TrendBars`** — a findings-over-time strip, one bar per period with the
  newest emphasised. Every period's value is spelled out for assistive tech, so
  the trend is never bar-height-only.
- **`ScanSwitcher`** — makes "which scan am I looking at?" answerable on an
  asset detail page: newer/older steppers either side of the current scan, with
  a Latest/Historical pill.

#### `AssetTriageCard` — new `findingsTone` prop
Additive, defaults to `"muted"` (the previous appearance). Accepts `"muted" |
"default" | "high" | "critical"` to escalate the footer findings readout as the
count climbs. How many findings count as alarming stays the consuming app's
policy; the prop only says how each rung is drawn.

#### Theme — aurora drift for `PageHeaderBand`
`--animate-aurora` and `--animate-aurora-slow`: two blurred ellipses drifting
behind the page title on deliberately mismatched periods, one reversed, so they
never resynchronise into a visible loop. Decorative, and swept by the existing
reduced-motion rule onto the resting frame.

### Changed (no API break)

#### `AssetTriageCard` — `href` now makes the whole card the hit target
Previously only the title text was the link. With `href` set the card is now a
single stretched anchor, matching `CitationSourceCard` and
`FindingVulnerabilityCard`: the title is still the accessible name, but a click
anywhere on the card — media included — follows it. The prop and its type are
unchanged. If you relied on clicks landing only on the title, that behaviour is
gone.

Internally the card now composes `SeverityDonut` instead of `DonutChart`, and
its footer is bottom-aligned so footers in a stretched grid row share a baseline.

---

## [0.2.1]

**No package changes.** The published tarball is identical to `0.2.0` — same
components, same API, same `dist/`. Nothing to migrate, and no reason to upgrade
from `0.2.0` except to sit on the version the release pipeline last built
cleanly.

Cut as a fresh number after `v0.2.0`'s publish could not be confirmed. The only
repo change between the two tags is `.github/workflows/release.yml` (the release
actions moved to `@v5`, targeting the Node 24 runner), which is not shipped in
`files`.

---

## [0.2.0]

Minor rather than patch: eight additive components and one additive `Callout`
tone. **No breaking changes — no migration required.** Component count 207 → 215.

### Added

#### Asset triage surface (5 components)
A visual-triage grid for discovered assets, built bottom-up so the pieces are
usable on their own:

- **`ScreenshotThumb`** — website capture at a fixed media height, cropped to
  fill. With no capture it degrades to a hatched slot with a mono caption,
  never a broken image or an empty gap.
- **`MiniLocationMap`** — the IP-card counterpart: a dark regional map cropped
  around one point, with a pulsing marker and a chip naming the place.
- **`AssetTriageCard`** — one discovered asset, opened by a picture of it.
  Domain cards lead with a `ScreenshotThumb`, IP cards with a
  `MiniLocationMap`; both fill the same `media` slot, so a mixed grid reads
  uniformly.
- **`ScoreRing`** — one bounded score as a ring with the figure printed inside;
  arc length is the score's share of the scale, arc colour its severity band.
  Sized for a table cell, exposed as `role="meter"`.
- **`SummaryStatBar`** — the band that opens a list page: one card divided into
  equal cells, each summarising the same population a different way.

#### Summary primitives (2 components)
- **`AttentionTile`** — a count and the thing it counts on a tone-tinted plate
  ("218 · Critical findings open"); the smallest unit of a needs-attention strip.
- **`BreakdownDonut`** — a compact ring plus a counted key, sized for a summary
  cell rather than a chart panel. Every legend row spells out its name and its
  count, so the breakdown is never wedge-colour-only (WCAG 1.4.1).

#### Navigation (1 component)
- **`DetailSidebar`** — a detail panel docked to the inline end that overlays
  the page without taking it over: inspect one row while the list stays live.

#### `Callout` — new `accent` tone
Additive. `<Callout tone="accent">` renders a primary-tinted plate with a
`Sparkles` default icon. Existing tones are unchanged.

#### Theme — two decorative entrance animations
`--animate-donut-in` (ring settling into place) and `--animate-panel-in` (panel
arriving from the inline end, so it follows writing direction in RTL). Both are
swept entirely by the existing reduced-motion rule — the content is fully
legible without them.

### Note on version numbering
`0.1.1` and `0.1.2` were bumped locally but never tagged or published. `v0.1.0`
is the previous release; nothing is missing between it and `v0.2.0`.

---

## [0.1.0]

Minor rather than patch: this removes `FormProviderActions`, and every shadow in
the system changes value.

### Migration notes (curated)

#### Shadows all change value (no action required, but expect visual diffs)
`--glass`, `--shadow`, `--shadow-soft` and `--shadow-bloom` are now aliases onto
a new ordered elevation scale (`--elevation-0..5`), where each level is a
two-layer contact + ambient shadow. The **names** still work, so nothing breaks
at build time — but shadows across the UI shift, and attached overlays (Menu,
Popover, Tooltip, Select) deliberately sit one level lower than detached ones
(Dialog, Drawer, Toast). Prefer `shadow-elevation-*` in new code.

#### `Alert` — hue moved from `variant` to `tone`
`variant` now selects the fill treatment (`soft` | `solid` | `outline`), matching
Badge/Tag/Callout. Legacy hue names still work and are mapped automatically, with
a dev-only warning; a bare `<Alert>` is unchanged.

    <Alert variant="destructive">   ->   <Alert tone="danger">
    <Alert variant="info">          ->   <Alert tone="info">

Legacy support is removed in v0.3.0.

#### Charts — pass `palette="categorical"` for non-severity series
`--chart-1..5` is the severity ramp, so a chart of environments or owners
previously rendered in the alarm hues. `ChartContainer` now takes
`palette="severity" | "categorical"`; the latter uses the new cool-only
`--cat-1..6`. Existing charts are unchanged by default.

    <ChartContainer label="Assets by environment" palette="categorical" …>

`patternBySeverity` (opt-in) adds a hatch-density channel so severity survives
greyscale and colour-vision deficiency.

#### Fonts are now self-hosted
`@netbaan-project/ui/fonts.css` no longer reaches out to Google Fonts; woff2 ship
in `dist/fonts/`. No consumer change is needed, but if your CSP restricted
`fonts.googleapis.com` / `fonts.gstatic.com` you can drop those entries.

#### `FormProviderActions` removed
Breaking: `form-provider.tsx` exported a second `FormActions` that the barrel had to
alias to `FormProviderActions` to avoid a name collision — two exports doing the same
job under near-identical names. The standalone `form-actions.tsx` is now the single
public component.

Migration:

    import { FormProviderActions } from "@netbaan-project/ui";
    <FormProviderActions>…</FormProviderActions>

    ->

    import { FormActions } from "@netbaan-project/ui";
    <FormActions stack>…</FormActions>

`stack` reproduces the removed component's behaviour (reversed column below `sm`, so
the primary action sits on top on narrow viewports). Omit it if you want the default
single-row layout. The removed component had no other props.

<!-- Template for a breaking change:

## Button v2
Breaking: removed `color` prop in favor of `variant`.
Migration:
    <Button color="red" />   ->   <Button variant="danger" />
Deprecated: `color` (removed in v2; warned in v1.x).
-->
