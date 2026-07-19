# COMPONENTS_STATUS.md — Progress tracker + build queue

This file is BOTH the queue (what to build next) and the progress tracker. Structural columns
(Impl/Story/Docs) and Overall are **computed** by `../scripts/verify-inventory.mjs` — regenerate
before trusting them; do not hand-type status. See `../DECISIONS.md` (2026-07-19e).

```
Components built:      2
Catalog (queue):       220   ← PROVISIONAL denominator (likely counts variants; see DECISIONS.md 2026-07-19f)
Variants / Stories / A11y-checks: computed by verify-inventory.mjs (separate counts, not one X/219)
```

Regenerate computed status:
```bash
node .agent/scripts/verify-inventory.mjs
```

## Status vocabulary
Use `PASS` / `FAILED` / `BLOCKED` / `HUMAN_VERIFY_REQUIRED` (see `../rules/TESTING_RULES.md`).
Never mark done anything whose runner-verified gates were not actually executed this session.

## Human checkpoint gates (STOP and request review)
- **Every 10 completed components** → stop for batch review.
- **On a category boundary** (Essential→Recommended→Advanced) → stop for sign-off.
- **On 3 consecutive components needing the same fix** → stop; that pattern belongs in a rule/token.

## Queue / tracker
Build the next `⬜` row, honoring priority (Essential → Recommended → Advanced) and dependencies
(`dep:` note). Component name maps to a kebab-case file, e.g. **Text Field → `text-field.tsx`**.
"Category" = priority tier. Group/dependency context is in Notes.

| # | Component | Category | Impl | Story | Docs | Overall | Last review | Notes |
|---|-----------|----------|------|-------|------|---------|-------------|-------|
| 1 | Button | Essential | ✅ | ✅ | ✅ | PARTIAL | 2026-07-19 | primitive reference closed API; runner axes HUMAN_VERIFY_REQUIRED — no browser runner here |
| 2 |  Color Tokens | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 3 |  Typography Scale | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 4 |  Spacing Scale | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 5 |  Elevation & Shadows | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 6 |  Radius Tokens | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 7 |  Iconography | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 8 |  Grid & Breakpoints | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 9 |  Motion Tokens | Essential | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 10 |  Z-index / Layering Scale | Recommended | ⬜ | ⬜ | ⬜ | — | — | Foundations |
| 11 |  Theme Provider | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Color Tokens |
| 12 |  Focus Ring Token | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Color Tokens |
| 13 |  Box | Essential | ⬜ | ⬜ | ⬜ | — | — | Layout |
| 14 |  Stack | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Box |
| 15 |  Grid | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Box |
| 16 |  Container | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Box |
| 17 |  Divider | Essential | ⬜ | ⬜ | ⬜ | — | — | Layout |
| 18 |  Spacer | Recommended | ⬜ | ⬜ | ⬜ | — | — | Layout |
| 19 |  Aspect Ratio | Recommended | ⬜ | ⬜ | ⬜ | — | — | Layout |
| 20 |  Scroll Area | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Box |
| 21 |  Resizable Panels | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Box |
| 22 |  App Shell | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Sidebar, Navbar |
| 23 |  Masonry | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Grid |
| 24 |  Navbar / Top Bar | Essential | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 25 |  Sidebar | Essential | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 26 |  Tabs | Essential | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 27 |  Breadcrumbs | Essential | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 28 |  Pagination | Essential | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 29 |  Menu | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 30 |  Navigation Menu | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 31 |  Stepper | Recommended | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 32 |  Segmented Control | Recommended | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 33 |  Toolbar | Recommended | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 34 |  Command Palette | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Dialog, Combobox |
| 35 |  Scrollspy Nav | Advanced | ⬜ | ⬜ | ⬜ | — | — | Navigation |
| 36 |  Text Field | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Form Field |
| 37 |  Textarea | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Form Field |
| 38 |  Number Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 39 |  Password Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 40 |  Search Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 41 |  Input Group | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 42 |  Select | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 43 |  Combobox | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Popover, Listbox |
| 44 |  Multi-select | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Combobox, Tag |
| 45 |  Date Picker | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Calendar, Popover |
| 46 |  Date Range Picker | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Date Picker |
| 47 |  Time Picker | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 48 |  Color Picker | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 49 |  Slider | Recommended | ⬜ | ⬜ | ⬜ | — | — | Inputs |
| 50 |  Rating | Recommended | ⬜ | ⬜ | ⬜ | — | — | Inputs |
| 51 |  OTP Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | Inputs |
| 52 |  Tag Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Tag |
| 53 |  Currency / Masked Input | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 54 |  Rich Text Editor | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Toolbar |
| 55 |  Mention Input | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Combobox |
| 56 |  Checkbox | Essential | ⬜ | ⬜ | ⬜ | — | — | Selection Controls |
| 57 |  Checkbox Group | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Checkbox |
| 58 |  Radio Group | Essential | ⬜ | ⬜ | ⬜ | — | — | Selection Controls |
| 59 |  Switch | Essential | ⬜ | ⬜ | ⬜ | — | — | Selection Controls |
| 60 |  Toggle Button | Recommended | ⬜ | ⬜ | ⬜ | — | — | Selection Controls |
| 61 |  Toggle Group | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Toggle Button |
| 62 |  Choice Card | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Card |
| 63 |  Card | Essential | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 64 |  Avatar | Essential | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 65 |  Avatar Group | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Avatar |
| 66 |  Badge | Essential | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 67 |  Tag / Chip | Essential | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 68 |  Status Pill | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 69 |  List | Essential | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 70 |  Description List | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 71 |  Stat / KPI Tile | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Sparkline |
| 72 |  Accordion | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Collapse |
| 73 |  Timeline | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 74 |  Tree View | Advanced | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 75 |  Code Block | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Copy to Clipboard |
| 76 |  Carousel | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 77 |  Kbd | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Display |
| 78 |  Diff Viewer | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Code Block |
| 79 |  Chart Container | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Visualization |
| 80 |  Axis | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 81 |  Chart Legend | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 82 |  Chart Tooltip | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 83 |  Sparkline | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Visualization |
| 84 |  Radial Gauge | Recommended | ⬜ | ⬜ | ⬜ | — | — | Data Visualization |
| 85 |  Heatmap | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 86 |  Geo / Choropleth Map | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 87 |  Treemap | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 88 |  Sankey Diagram | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 89 |  Network Graph | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 90 |  Gantt Chart | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 91 |  Line Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container, Axis |
| 92 |  Area Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Line Chart |
| 93 |  Stacked Area Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Area Chart |
| 94 |  Bar / Column Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container, Axis |
| 95 |  Grouped / Stacked Bar | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Bar / Column Chart |
| 96 |  Donut Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 97 |  Pie Chart | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 98 |  Scatter Plot | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container, Axis |
| 99 |  Bubble Chart | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Scatter Plot |
| 100 |  Radar Chart | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 101 |  Funnel Chart | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Chart Container |
| 102 |  Toast | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Portal |
| 103 |  Alert / Banner | Essential | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 104 |  Callout | Recommended | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 105 |  Progress Bar | Essential | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 106 |  Spinner | Essential | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 107 |  Skeleton | Essential | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 108 |  Status Indicator | Recommended | ⬜ | ⬜ | ⬜ | — | — | Feedback |
| 109 | Tooltip | Essential | ✅ | ✅ | ✅ | PARTIAL | 2026-07-19 | interactive reference closed API; runner axes HUMAN_VERIFY_REQUIRED — no browser runner here |
| 110 |  Notification Center | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Drawer, List |
| 111 |  Portal | Essential | ⬜ | ⬜ | ⬜ | — | — | Overlays |
| 112 |  Floating Engine | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Portal |
| 113 |  Focus Trap | Essential | ⬜ | ⬜ | ⬜ | — | — | Overlays |
| 114 |  Modal / Dialog | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Portal, Focus Trap |
| 115 |  Drawer / Sheet | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Portal |
| 116 |  Popover | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Floating Engine |
| 117 |  Context Menu | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Menu |
| 118 |  Hover Card | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Popover |
| 119 |  Confirmation Dialog | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Modal / Dialog |
| 120 |  Lightbox | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Portal |
| 121 |  Form Provider | Essential | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 122 |  Form Field | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Form Provider |
| 123 |  Field Label | Essential | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 124 |  Helper Text | Essential | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 125 |  Validation Message | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Form Field |
| 126 |  Fieldset | Recommended | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 127 |  Form Section | Recommended | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 128 |  Form Actions | Recommended | ⬜ | ⬜ | ⬜ | — | — | Forms |
| 129 |  Multi-step Form | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Stepper, Form Provider |
| 130 |  Field Array | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Form Provider |
| 131 |  Inline Edit | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field |
| 132 |  Table | Essential | ⬜ | ⬜ | ⬜ | — | — | Tables & Data Grid |
| 133 |  Data Table | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Table, Pagination |
| 134 |  Column Sort | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 135 |  Column Filter | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 136 |  Row Selection | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table, Checkbox |
| 137 |  Bulk Actions Bar | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Row Selection, Toolbar |
| 138 |  Expandable Rows | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 139 |  Column Visibility | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 140 |  Sticky Header / Column | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 141 |  Editable Cell | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table, Inline Edit |
| 142 |  Virtualized Grid | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Data Table |
| 143 |  Conversation Thread | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Message Bubble |
| 144 |  Message Bubble | Recommended | ⬜ | ⬜ | ⬜ | — | — | AI Components |
| 145 |  Prompt Composer | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Textarea |
| 146 |  Typing / Streaming Indicator | Recommended | ⬜ | ⬜ | ⬜ | — | — | AI Components |
| 147 |  AI Suggestion Chips | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Tag |
| 148 |  Model / Agent Selector | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Select |
| 149 |  Citation / Source Card | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Card |
| 150 |  Tool Call Block | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Code Block |
| 151 |  Reasoning Trace | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Accordion |
| 152 |  Response Feedback | Recommended | ⬜ | ⬜ | ⬜ | — | — | AI Components |
| 153 |  Usage / Token Meter | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Progress Bar |
| 154 |  Dropzone | Recommended | ⬜ | ⬜ | ⬜ | — | — | File Management |
| 155 |  File Uploader | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Dropzone |
| 156 |  Upload Progress | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Progress Bar |
| 157 |  File Card | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Card |
| 158 |  File List / Grid | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: File Card |
| 159 |  File Preview | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Lightbox |
| 160 |  Attachment Chip | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Tag |
| 161 |  Folder Tree | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Tree View |
| 162 |  Image Cropper | Advanced | ⬜ | ⬜ | ⬜ | — | — | File Management |
| 163 |  Login Form | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Form Provider |
| 164 |  Sign-up Form | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Form Provider |
| 165 |  SSO Provider Buttons | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Button |
| 166 |  2FA / OTP Verification | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: OTP Input |
| 167 |  Password Strength Meter | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Progress Bar |
| 168 |  Consent / Cookie Banner | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Alert / Banner |
| 169 |  Session Timeout Modal | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Modal / Dialog |
| 170 |  Device / Session List | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: List |
| 171 |  Role / Permission Selector | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Combobox |
| 172 |  API Key Manager | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Text Field, Copy to Clipboard |
| 173 |  Visually Hidden | Essential | ⬜ | ⬜ | ⬜ | — | — | Utilities |
| 174 |  Click Outside | Recommended | ⬜ | ⬜ | ⬜ | — | — | Utilities |
| 175 |  Copy to Clipboard | Recommended | ⬜ | ⬜ | ⬜ | — | — | Utilities |
| 176 |  Theme Toggle | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Theme Provider |
| 177 |  Locale / RTL Switcher | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Theme Provider |
| 178 |  Keyboard Shortcut | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Kbd |
| 179 |  Error Boundary | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Error State |
| 180 |  Lazy Loader | Advanced | ⬜ | ⬜ | ⬜ | — | — | Utilities |
| 181 |  Print View | Advanced | ⬜ | ⬜ | ⬜ | — | — | Utilities |
| 182 |  Bottom Navigation | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Tabs |
| 183 |  Bottom Sheet | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Drawer / Sheet |
| 184 |  Action Sheet | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Bottom Sheet |
| 185 |  Floating Action Button | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Button |
| 186 |  Mobile App Bar | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Navbar / Top Bar |
| 187 |  Swipe Actions | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: List |
| 188 |  Pull to Refresh | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Scroll Area |
| 189 |  Skip to Content | Recommended | ⬜ | ⬜ | ⬜ | — | — | Accessibility |
| 190 |  Live Region | Essential | ⬜ | ⬜ | ⬜ | — | — | Accessibility |
| 191 |  Visible Focus | Essential | ⬜ | ⬜ | ⬜ | — | — | dep: Focus Ring Token |
| 192 |  Landmark Regions | Recommended | ⬜ | ⬜ | ⬜ | — | — | Accessibility |
| 193 |  Reduced Motion | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Motion Tokens |
| 194 |  High Contrast Theme | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Theme Provider |
| 195 |  Animate Presence | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Motion Tokens |
| 196 |  Fade / Slide / Scale | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Motion Tokens |
| 197 |  Collapse | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Motion Tokens |
| 198 |  Count-up Ticker | Recommended | ⬜ | ⬜ | ⬜ | — | — | Motion |
| 199 |  Beam / Glow Effect | Recommended | ⬜ | ⬜ | ⬜ | — | — | Motion |
| 200 |  Stagger Container | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Animate Presence |
| 201 |  Scroll Reveal | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Lazy Loader |
| 202 |  Marquee | Advanced | ⬜ | ⬜ | ⬜ | — | — | Motion |
| 203 |  Empty State | Essential | ⬜ | ⬜ | ⬜ | — | — | Empty & Loading States |
| 204 |  No Results | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Empty State |
| 205 |  Error State | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Empty State |
| 206 |  Loading Overlay | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Spinner |
| 207 |  First-run Onboarding | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Empty State |
| 208 |  Skeleton Templates | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Skeleton |
| 209 |  Posture Score Card | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Radial Gauge |
| 210 |  Grade Ring (A–F) | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Radial Gauge |
| 211 |  Severity Badge | Recommended | ⬜ | ⬜ | ⬜ | — | — | dep: Badge |
| 212 |  Finding / Vulnerability Card | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Card, Severity Badge |
| 213 |  Asset Row | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Sparkline |
| 214 |  Priority Action Item | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: List, Severity Badge |
| 215 |  Attack Surface Widget | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Bar / Column Chart |
| 216 |  Remediation Velocity | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Grouped / Stacked Bar |
| 217 |  Scan Coverage Gauge | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Radial Gauge |
| 218 |  Hosts-by-Country Map | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Geo / Choropleth Map |
| 219 |  SSL / Cert Expiry Widget | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Radial Gauge |
| 220 |  CVE Reference Chip | Advanced | ⬜ | ⬜ | ⬜ | — | — | dep: Tag / Chip |
