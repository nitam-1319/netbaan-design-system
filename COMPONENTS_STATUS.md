# AEGIS × netbaan — Component build status

> Source of truth for the daily build task. Each run: pick the next unchecked
> components (Essential first, then Recommended, then Advanced), build the full
> package for each, tick them here, and commit. Generated from the approved
> `Component Inventory`.

**Progress: 23 / 219 components complete.**

## 01 · Foundations

- [x] **Color Tokens** — 🟢 Essential  
  Semantic palette — surfaces, text, accent, and severity (critical→info) scales. _(realized in `src/index.css` `@theme` + `:root`/`.dark` vars.)_
- [x] **Typography Scale** — 🟢 Essential  
  Space Grotesk / IBM Plex Sans / IBM Plex Mono ramp with sizes and weights. _(font vars + heading rules in `src/index.css`.)_
- [x] **Spacing Scale** — 🟢 Essential  
  Consistent spacing steps for padding, gaps, and layout rhythm. _(Tailwind v4 default `--spacing` scale.)_
- [x] **Elevation & Shadows** — 🟢 Essential  
  Layered shadow tokens for cards, overlays, and popovers. _(component-level shadow utilities; see Card/Tooltip.)_
- [x] **Radius Tokens** — 🟢 Essential  
  Corner-radius scale (chips 6px → cards 18px). _(`--radius-sm…4xl` in `src/index.css` `@theme`.)_
- [x] **Iconography** — 🟢 Essential  
  Geometric, minimal icon set with sizing and stroke rules. _(lucide-react, sized via `[&_svg]` utilities.)_
- [x] **Grid & Breakpoints** — 🟢 Essential  
  Responsive column grid and breakpoint definitions. _(Tailwind v4 default breakpoints + `grid` utilities.)_
- [x] **Motion Tokens** — 🟢 Essential  
  Standard durations, easings, and reduced-motion fallbacks. _(`tw-animate-css` + `@keyframes` in `src/index.css`.)_
- [x] **Z-index / Layering Scale** — 🟣 Recommended  
  Ordered stacking tokens for overlays and portals. _(Tailwind `z-*` utilities; see Tooltip/Tabs positioners.)_
- [x] **Theme Provider** — 🟢 Essential  
  Runtime dark / light / RTL context with CSS-variable output. _(`src/components/theme-provider.tsx`.)_
- [x] **Focus Ring Token** — 🟢 Essential  
  Consistent visible-focus treatment across interactive elements. _(`--ring` + `focus-visible:ring-*` utilities.)_

## 02 · Layout

- [ ] **Box** — 🟢 Essential  
  Style-prop primitive underpinning all layout components.
- [ ] **Stack** — 🟢 Essential  
  Vertical / horizontal auto-spaced flex container.
- [ ] **Grid** — 🟢 Essential  
  Responsive CSS-grid layout wrapper.
- [ ] **Container** — 🟢 Essential  
  Max-width, centered content wrapper.
- [x] **Divider** — 🟢 Essential  
  Horizontal or vertical rule with optional label.
- [ ] **Spacer** — 🟣 Recommended  
  Flexible whitespace element for flex layouts.
- [ ] **Aspect Ratio** — 🟣 Recommended  
  Locks child to a fixed width:height ratio.
- [ ] **Scroll Area** — 🟣 Recommended  
  Custom-styled, themable scroll container.
- [ ] **Resizable Panels** — 🟡 Advanced  
  Draggable split-view / resizable regions.
- [ ] **App Shell** — 🟢 Essential  
  Sidebar + topbar + content scaffold for full apps.
- [ ] **Masonry** — 🟡 Advanced  
  Variable-height staggered grid layout.

## 03 · Navigation

- [ ] **Navbar / Top Bar** — 🟢 Essential  
  Primary app header with brand, actions, and status.
- [ ] **Sidebar** — 🟢 Essential  
  Collapsible vertical navigation with sections.
- [x] **Tabs** — 🟢 Essential  
  In-view switch between related panels.
- [ ] **Breadcrumbs** — 🟢 Essential  
  Hierarchical path trail to current location.
- [ ] **Pagination** — 🟢 Essential  
  Page-by-page navigation for lists and tables.
- [ ] **Menu** — 🟢 Essential  
  Dropdown action / navigation list.
- [ ] **Navigation Menu** — 🟣 Recommended  
  Multi-column mega-menu for large apps.
- [ ] **Stepper** — 🟣 Recommended  
  Sequential progress indicator for flows.
- [ ] **Segmented Control** — 🟣 Recommended  
  Compact single-choice switch between few options.
- [ ] **Toolbar** — 🟣 Recommended  
  Grouped action bar for editors and views.
- [ ] **Command Palette** — 🟡 Advanced  
  Keyboard-driven fuzzy action launcher.
- [ ] **Scrollspy Nav** — 🟡 Advanced  
  Anchor nav that tracks scroll position.

## 04 · Inputs

- [ ] **Text Field** — 🟢 Essential  
  Single-line text entry with label and states.
- [ ] **Textarea** — 🟢 Essential  
  Multi-line auto-growing text input.
- [ ] **Number Input** — 🟣 Recommended  
  Numeric field with steppers and constraints.
- [ ] **Password Input** — 🟣 Recommended  
  Masked field with reveal toggle.
- [ ] **Search Input** — 🟣 Recommended  
  Query field with clear and hint affordances.
- [ ] **Input Group** — 🟣 Recommended  
  Field with leading/trailing addons or buttons.
- [ ] **Select** — 🟢 Essential  
  Single-choice dropdown from a fixed list.
- [ ] **Combobox** — 🟣 Recommended  
  Type-ahead select with filtering.
- [ ] **Multi-select** — 🟡 Advanced  
  Token-based selection of many options.
- [ ] **Date Picker** — 🟣 Recommended  
  Calendar-based single-date selection.
- [ ] **Date Range Picker** — 🟡 Advanced  
  Two-ended range selection over a calendar.
- [ ] **Time Picker** — 🟣 Recommended  
  Hour/minute selection control.
- [ ] **Color Picker** — 🟡 Advanced  
  Swatch + hue/alpha color selection.
- [ ] **Slider** — 🟣 Recommended  
  Draggable single or range value along a track.
- [ ] **Rating** — 🟣 Recommended  
  Star / segmented qualitative score input.
- [ ] **OTP Input** — 🟣 Recommended  
  Segmented one-time-code entry.
- [ ] **Tag Input** — 🟣 Recommended  
  Free-entry chips with add/remove.
- [ ] **Currency / Masked Input** — 🟣 Recommended  
  Format-constrained numeric or pattern entry.
- [ ] **Rich Text Editor** — 🟡 Advanced  
  WYSIWYG formatted-content editor.
- [ ] **Mention Input** — 🟡 Advanced  
  Inline @-mention autocomplete field.

## 05 · Selection Controls

- [x] **Checkbox** — 🟢 Essential  
  Independent binary selection with indeterminate state.
- [ ] **Checkbox Group** — 🟣 Recommended  
  Coordinated set of related checkboxes.
- [ ] **Radio Group** — 🟢 Essential  
  Mutually-exclusive option set.
- [x] **Switch** — 🟢 Essential  
  Instant-apply on/off toggle.
- [ ] **Toggle Button** — 🟣 Recommended  
  Pressable button with an on/off state.
- [ ] **Toggle Group** — 🟣 Recommended  
  Single or multi-select set of toggle buttons.
- [ ] **Choice Card** — 🟣 Recommended  
  Selectable card as a rich radio/checkbox.

## 06 · Data Display

- [x] **Card** — 🟢 Essential  
  Flexible content container with the surface treatment.
- [x] **Avatar** — 🟢 Essential  
  User/entity image with initials fallback.
- [ ] **Avatar Group** — 🟣 Recommended  
  Overlapping stack of avatars with overflow count.
- [x] **Badge** — 🟢 Essential  
  Small count or status marker.
- [ ] **Tag / Chip** — 🟢 Essential  
  Compact labeled token, optionally removable.
- [ ] **Status Pill** — 🟣 Recommended  
  Colored dot + label state indicator.
- [ ] **List** — 🟢 Essential  
  Vertical item collection with dividers.
- [ ] **Description List** — 🟣 Recommended  
  Key–value pair display.
- [ ] **Stat / KPI Tile** — 🟣 Recommended  
  Headline metric with trend and sparkline.
- [ ] **Accordion** — 🟢 Essential  
  Expandable / collapsible content sections.
- [ ] **Timeline** — 🟣 Recommended  
  Chronological event sequence.
- [ ] **Tree View** — 🟡 Advanced  
  Nested, expandable hierarchical list.
- [ ] **Code Block** — 🟣 Recommended  
  Syntax-styled code with copy affordance.
- [ ] **Carousel** — 🟣 Recommended  
  Swipeable / paged content slider.
- [ ] **Kbd** — 🟣 Recommended  
  Keyboard-key glyph rendering.
- [ ] **Diff Viewer** — 🟡 Advanced  
  Side-by-side or inline change comparison.

## 07 · Data Visualization

- [ ] **Chart Container** — 🟣 Recommended  
  Responsive, themable wrapper for any chart.
- [ ] **Axis** — 🟣 Recommended  
  Configurable X/Y axes with ticks and labels.
- [ ] **Chart Legend** — 🟣 Recommended  
  Series key with toggle interaction.
- [ ] **Chart Tooltip** — 🟣 Recommended  
  Hover crosshair and value readout.
- [ ] **Sparkline** — 🟣 Recommended  
  Inline miniature trend line/area.
- [ ] **Radial Gauge** — 🟣 Recommended  
  Ring-progress score dial with glow.
- [ ] **Heatmap** — 🟡 Advanced  
  Density matrix of color-coded cells.
- [ ] **Geo / Choropleth Map** — 🟡 Advanced  
  Value-shaded world/region map.
- [ ] **Treemap** — 🟡 Advanced  
  Nested proportional-area rectangles.
- [ ] **Sankey Diagram** — 🟡 Advanced  
  Weighted flow between nodes.
- [ ] **Network Graph** — 🟡 Advanced  
  Node-link relationship diagram.
- [ ] **Gantt Chart** — 🟡 Advanced  
  Time-scheduled task bars.

## 08 · Charts

- [ ] **Line Chart** — 🟣 Recommended  
  Trend of one or more series over an axis.
- [ ] **Area Chart** — 🟣 Recommended  
  Filled line chart emphasizing volume.
- [ ] **Stacked Area Chart** — 🟣 Recommended  
  Cumulative multi-series area (severity-over-time).
- [ ] **Bar / Column Chart** — 🟣 Recommended  
  Categorical value comparison.
- [ ] **Grouped / Stacked Bar** — 🟣 Recommended  
  Multi-series clustered or stacked bars.
- [ ] **Donut Chart** — 🟣 Recommended  
  Ring proportion breakdown with center label.
- [ ] **Pie Chart** — 🟣 Recommended  
  Circular part-to-whole proportions.
- [ ] **Scatter Plot** — 🟡 Advanced  
  Point distribution across two axes.
- [ ] **Bubble Chart** — 🟡 Advanced  
  Scatter with size-encoded third dimension.
- [ ] **Radar Chart** — 🟡 Advanced  
  Multi-axis comparison polygon.
- [ ] **Funnel Chart** — 🟡 Advanced  
  Stage-by-stage conversion drop-off.

## 09 · Feedback

- [ ] **Toast** — 🟢 Essential  
  Transient, stacked notification.
- [x] **Alert / Banner** — 🟢 Essential  
  Persistent inline status message.
- [ ] **Callout** — 🟣 Recommended  
  Emphasized informational block.
- [x] **Progress Bar** — 🟢 Essential  
  Linear determinate/indeterminate progress.
- [x] **Spinner** — 🟢 Essential  
  Circular indeterminate loading indicator.
- [x] **Skeleton** — 🟢 Essential  
  Content-shaped loading placeholder.
- [ ] **Status Indicator** — 🟣 Recommended  
  Live pulsing dot for connection/health state.
- [x] **Tooltip** — 🟢 Essential  
  Hover/focus contextual label.
- [ ] **Notification Center** — 🟡 Advanced  
  Aggregated, dismissible activity feed.

## 10 · Overlays

- [ ] **Portal** — 🟢 Essential  
  Renders children outside the DOM hierarchy.
- [ ] **Floating Engine** — 🟢 Essential  
  Positioning + collision handling for anchored surfaces.
- [ ] **Focus Trap** — 🟢 Essential  
  Confines focus within an open overlay.
- [ ] **Modal / Dialog** — 🟢 Essential  
  Centered, focus-trapped blocking surface.
- [ ] **Drawer / Sheet** — 🟢 Essential  
  Edge-anchored sliding panel.
- [ ] **Popover** — 🟢 Essential  
  Anchored, dismissible floating container.
- [ ] **Context Menu** — 🟣 Recommended  
  Right-click anchored action menu.
- [ ] **Hover Card** — 🟣 Recommended  
  Rich preview on hover of a trigger.
- [ ] **Confirmation Dialog** — 🟣 Recommended  
  Focused approve/cancel decision prompt.
- [ ] **Lightbox** — 🟣 Recommended  
  Full-screen media viewer.

## 11 · Forms

- [ ] **Form Provider** — 🟢 Essential  
  State, submission, and validation context.
- [ ] **Form Field** — 🟢 Essential  
  Label + control + hint + error wrapper.
- [ ] **Field Label** — 🟢 Essential  
  Accessible label with required marker.
- [ ] **Helper Text** — 🟢 Essential  
  Supplementary guidance beneath a field.
- [ ] **Validation Message** — 🟢 Essential  
  Inline error / success feedback.
- [ ] **Fieldset** — 🟣 Recommended  
  Grouped related fields with legend.
- [ ] **Form Section** — 🟣 Recommended  
  Titled block of fields with description.
- [ ] **Form Actions** — 🟣 Recommended  
  Sticky submit / cancel footer.
- [ ] **Multi-step Form** — 🟡 Advanced  
  Wizard-driven segmented form flow.
- [ ] **Field Array** — 🟡 Advanced  
  Add/remove repeatable field rows.
- [ ] **Inline Edit** — 🟡 Advanced  
  Click-to-edit in-place value field.

## 12 · Tables & Data Grid

- [ ] **Table** — 🟢 Essential  
  Static semantic table with header/body/footer.
- [ ] **Data Table** — 🟢 Essential  
  Interactive table: sort, filter, paginate.
- [ ] **Column Sort** — 🟣 Recommended  
  Header-driven ascending/descending sort.
- [ ] **Column Filter** — 🟣 Recommended  
  Per-column value filtering.
- [ ] **Row Selection** — 🟣 Recommended  
  Single/multi row checkbox selection.
- [ ] **Bulk Actions Bar** — 🟣 Recommended  
  Contextual toolbar for selected rows.
- [ ] **Expandable Rows** — 🟣 Recommended  
  Inline nested detail panels.
- [ ] **Column Visibility** — 🟣 Recommended  
  Show/hide and reorder columns.
- [ ] **Sticky Header / Column** — 🟣 Recommended  
  Pinned headers and frozen columns.
- [ ] **Editable Cell** — 🟡 Advanced  
  In-cell inline value editing.
- [ ] **Virtualized Grid** — 🟡 Advanced  
  Windowed rendering for huge datasets.

## 13 · AI Components

- [ ] **Conversation Thread** — 🟣 Recommended  
  Scrollable message history container.
- [ ] **Message Bubble** — 🟣 Recommended  
  User/assistant turn with role styling.
- [ ] **Prompt Composer** — 🟣 Recommended  
  Multiline input with send, attach, and tools.
- [ ] **Typing / Streaming Indicator** — 🟣 Recommended  
  Live token-streaming and thinking state.
- [ ] **AI Suggestion Chips** — 🟣 Recommended  
  Tappable prompt/action suggestions.
- [ ] **Model / Agent Selector** — 🟣 Recommended  
  Switch between models or agents.
- [ ] **Citation / Source Card** — 🟡 Advanced  
  Referenced-source attribution block.
- [ ] **Tool Call Block** — 🟡 Advanced  
  Structured tool/function invocation display.
- [ ] **Reasoning Trace** — 🟡 Advanced  
  Collapsible chain-of-thought panel.
- [ ] **Response Feedback** — 🟣 Recommended  
  Thumbs up/down and rating on outputs.
- [ ] **Usage / Token Meter** — 🟡 Advanced  
  Consumption and quota visualization.

## 14 · File Management

- [ ] **Dropzone** — 🟣 Recommended  
  Drag-and-drop file upload area.
- [ ] **File Uploader** — 🟣 Recommended  
  Picker + queue + validation controller.
- [ ] **Upload Progress** — 🟣 Recommended  
  Per-file transfer status and retry.
- [ ] **File Card** — 🟣 Recommended  
  Thumbnail/metadata tile for a file.
- [ ] **File List / Grid** — 🟣 Recommended  
  Browsable collection of files.
- [ ] **File Preview** — 🟣 Recommended  
  Inline document/image/media viewer.
- [ ] **Attachment Chip** — 🟣 Recommended  
  Compact attached-file token.
- [ ] **Folder Tree** — 🟡 Advanced  
  Hierarchical directory navigator.
- [ ] **Image Cropper** — 🟡 Advanced  
  Crop / zoom / rotate before upload.

## 15 · Authentication & Security

- [ ] **Login Form** — 🟣 Recommended  
  Credential sign-in with validation.
- [ ] **Sign-up Form** — 🟣 Recommended  
  Account creation with field validation.
- [ ] **SSO Provider Buttons** — 🟣 Recommended  
  Third-party identity sign-in options.
- [ ] **2FA / OTP Verification** — 🟣 Recommended  
  Second-factor code entry flow.
- [ ] **Password Strength Meter** — 🟣 Recommended  
  Live strength scoring feedback.
- [ ] **Consent / Cookie Banner** — 🟣 Recommended  
  Privacy consent capture surface.
- [ ] **Session Timeout Modal** — 🟡 Advanced  
  Idle warning with re-auth prompt.
- [ ] **Device / Session List** — 🟡 Advanced  
  Active sessions with revoke controls.
- [ ] **Role / Permission Selector** — 🟡 Advanced  
  Access-scope assignment control.
- [ ] **API Key Manager** — 🟡 Advanced  
  Create, reveal, and revoke secrets.

## 16 · Utilities

- [ ] **Visually Hidden** — 🟢 Essential  
  Screen-reader-only content wrapper.
- [ ] **Click Outside** — 🟣 Recommended  
  Detects outside interaction to dismiss.
- [ ] **Copy to Clipboard** — 🟣 Recommended  
  Copy action with confirmation feedback.
- [ ] **Theme Toggle** — 🟣 Recommended  
  Dark / light mode switcher.
- [ ] **Locale / RTL Switcher** — 🟣 Recommended  
  Language and text-direction control.
- [ ] **Keyboard Shortcut** — 🟣 Recommended  
  Register and display hotkey bindings.
- [ ] **Error Boundary** — 🟣 Recommended  
  Catches render errors with fallback UI.
- [ ] **Lazy Loader** — 🟡 Advanced  
  Intersection-based deferred rendering.
- [ ] **Print View** — 🟡 Advanced  
  Print/PDF-optimized rendering mode.

## 17 · Mobile-specific

- [ ] **Bottom Navigation** — 🟣 Recommended  
  Fixed bottom tab bar.
- [ ] **Bottom Sheet** — 🟣 Recommended  
  Draggable bottom-anchored panel.
- [ ] **Action Sheet** — 🟣 Recommended  
  Contextual bottom action list.
- [ ] **Floating Action Button** — 🟣 Recommended  
  Prominent primary touch action.
- [ ] **Mobile App Bar** — 🟣 Recommended  
  Compact top bar with back/title/actions.
- [ ] **Swipe Actions** — 🟡 Advanced  
  Reveal actions by swiping a row.
- [ ] **Pull to Refresh** — 🟡 Advanced  
  Drag-down to reload gesture.

## 18 · Accessibility

- [ ] **Skip to Content** — 🟣 Recommended  
  Bypass-navigation keyboard link.
- [ ] **Live Region** — 🟢 Essential  
  Polite/assertive dynamic announcements.
- [ ] **Visible Focus** — 🟢 Essential  
  Consistent keyboard focus indication.
- [ ] **Landmark Regions** — 🟣 Recommended  
  Semantic ARIA regions for structure.
- [ ] **Reduced Motion** — 🟣 Recommended  
  Honors prefers-reduced-motion for animation.
- [ ] **High Contrast Theme** — 🟡 Advanced  
  Elevated-contrast token variant.

## 19 · Motion

- [ ] **Animate Presence** — 🟣 Recommended  
  Enter/exit transition orchestrator.
- [ ] **Fade / Slide / Scale** — 🟣 Recommended  
  Composable transition primitives.
- [ ] **Collapse** — 🟣 Recommended  
  Height auto-animation for expand/collapse.
- [ ] **Count-up Ticker** — 🟣 Recommended  
  Animated numeric value transitions.
- [ ] **Beam / Glow Effect** — 🟣 Recommended  
  Signature animated border-beam and glow.
- [ ] **Stagger Container** — 🟡 Advanced  
  Sequenced child-animation choreography.
- [ ] **Scroll Reveal** — 🟡 Advanced  
  Reveal elements as they enter the viewport.
- [ ] **Marquee** — 🟡 Advanced  
  Continuous scrolling ticker strip.

## 20 · Empty & Loading States

- [ ] **Empty State** — 🟢 Essential  
  Guidance when a collection has no items.
- [ ] **No Results** — 🟣 Recommended  
  Search/filter returned nothing state.
- [ ] **Error State** — 🟣 Recommended  
  Failure message with retry action.
- [ ] **Loading Overlay** — 🟣 Recommended  
  Full-region blocking load indicator.
- [ ] **First-run Onboarding** — 🟣 Recommended  
  Zero-state with setup call-to-action.
- [ ] **Skeleton Templates** — 🟣 Recommended  
  Prebuilt skeletons per layout (card, table, list).

## 21 · Domain-specific (ASM)

- [ ] **Posture Score Card** — 🟡 Advanced  
  Grade ring + verdict + risk delta summary.
- [ ] **Grade Ring (A–F)** — 🟡 Advanced  
  Letter-grade radial with color coding.
- [ ] **Severity Badge** — 🟣 Recommended  
  Critical→Info severity token with palette.
- [ ] **Finding / Vulnerability Card** — 🟡 Advanced  
  CVE, severity, asset, and action row.
- [ ] **Asset Row** — 🟡 Advanced  
  Host/asset with findings sparkline.
- [ ] **Priority Action Item** — 🟡 Advanced  
  Ranked exploitability action with CTA.
- [ ] **Attack Surface Widget** — 🟡 Advanced  
  Exposed-services bar breakdown.
- [ ] **Remediation Velocity** — 🟡 Advanced  
  New vs. resolved trend with MTTR.
- [ ] **Scan Coverage Gauge** — 🟡 Advanced  
  Monitored-vs-discovered percentage dial.
- [ ] **Hosts-by-Country Map** — 🟡 Advanced  
  Choropleth of host distribution.
- [ ] **SSL / Cert Expiry Widget** — 🟡 Advanced  
  Earliest-expiry countdown indicator.
- [ ] **CVE Reference Chip** — 🟡 Advanced  
  Linked CVE identifier token.
