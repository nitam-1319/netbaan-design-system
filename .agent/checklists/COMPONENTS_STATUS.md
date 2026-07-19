# COMPONENTS_STATUS.md — Progress tracker + build queue

Structural columns (Impl/Story/Docs) and Overall are **computed** by
`../scripts/verify-inventory.mjs` from the filesystem — regenerate before trusting them, never
hand-type status (see `../DECISIONS.md`, 2026-07-19e). Built rows are honestly `PARTIAL`: the
runner axes (play tests, axe, visual regression) are `HUMAN_VERIFY_REQUIRED` because the sandbox has
no browser runner (Playwright build mismatch) — they run in CI. No row is `PASS` yet.

```
Components built:      18
Catalog (roadmap):     220   ← PROVISIONAL denominator (likely counts variants; DECISIONS.md 2026-07-19f)
Variants / Stories / A11y-checks: computed by verify-inventory.mjs (separate counts, not one X/219)
```

Regenerate: `node .agent/scripts/verify-inventory.mjs`

## Status vocabulary
`PASS` / `FAILED` / `BLOCKED` / `HUMAN_VERIFY_REQUIRED` (see `../rules/TESTING_RULES.md`).

## Human checkpoint gates (STOP and request review)
- Every 10 completed components → batch review.
- On a category boundary (Essential→Recommended→Advanced) → sign-off.
- On 3 consecutive components needing the same fix → stop; fold it into a rule/token.

## Built (18) — closed API, on disk
| # | Component (file) | Impl | Story | Docs | Overall | Notes |
|---|------------------|------|-------|------|---------|-------|
| 1 | alert | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 2 | app-shell | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 3 | avatar | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 4 | badge | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 5 | box | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 6 | button | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 7 | card | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 8 | checkbox | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 9 | container | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 10 | divider | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 11 | grid | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 12 | progress | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 13 | skeleton | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 14 | spinner | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 15 | stack | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 16 | switch | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 17 | tabs | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |
| 18 | tooltip | ✅ | ✅ | ✅ | PARTIAL | runner axes HUMAN_VERIFY_REQUIRED |

## Queue (roadmap — build next)
Pick the next item NOT already built (map its name to a kebab file, e.g. **Text Field → `text-field.tsx`**;
**App Shell → `app-shell.tsx`**) and confirm it is not in the Built list / not on disk (run
verify-inventory). Honor priority (Essential → Recommended → Advanced) and `dep:` dependencies.
"Category" = priority tier.

| # | Component | Category | Group | Depends on |
|---|-----------|----------|-------|-----------|
| 0 | Button | Essential | Foundations | — |
| 1 | Color Tokens | Essential | Foundations | — |
| 2 | Typography Scale | Essential | Foundations | — |
| 3 | Spacing Scale | Essential | Foundations | — |
| 4 | Elevation & Shadows | Essential | Foundations | — |
| 5 | Radius Tokens | Essential | Foundations | — |
| 6 | Iconography | Essential | Foundations | — |
| 7 | Grid & Breakpoints | Essential | Foundations | — |
| 8 | Motion Tokens | Essential | Foundations | — |
| 9 | Z-index / Layering Scale | Recommended | Foundations | — |
| 10 | Theme Provider | Essential | Foundations | Color Tokens |
| 11 | Focus Ring Token | Essential | Foundations | Color Tokens |
| 12 | Box | Essential | Layout | — |
| 13 | Stack | Essential | Layout | Box |
| 14 | Grid | Essential | Layout | Box |
| 15 | Container | Essential | Layout | Box |
| 16 | Divider | Essential | Layout | — |
| 17 | Spacer | Recommended | Layout | — |
| 18 | Aspect Ratio | Recommended | Layout | — |
| 19 | Scroll Area | Recommended | Layout | Box |
| 20 | Resizable Panels | Advanced | Layout | Box |
| 21 | App Shell | Essential | Layout | Sidebar, Navbar |
| 22 | Masonry | Advanced | Layout | Grid |
| 23 | Navbar / Top Bar | Essential | Navigation | — |
| 24 | Sidebar | Essential | Navigation | — |
| 25 | Tabs | Essential | Navigation | — |
| 26 | Breadcrumbs | Essential | Navigation | — |
| 27 | Pagination | Essential | Navigation | — |
| 28 | Menu | Essential | Navigation | Popover |
| 29 | Navigation Menu | Recommended | Navigation | Popover |
| 30 | Stepper | Recommended | Navigation | — |
| 31 | Segmented Control | Recommended | Navigation | — |
| 32 | Toolbar | Recommended | Navigation | — |
| 33 | Command Palette | Advanced | Navigation | Dialog, Combobox |
| 34 | Scrollspy Nav | Advanced | Navigation | — |
| 35 | Text Field | Essential | Inputs | Form Field |
| 36 | Textarea | Essential | Inputs | Form Field |
| 37 | Number Input | Recommended | Inputs | Text Field |
| 38 | Password Input | Recommended | Inputs | Text Field |
| 39 | Search Input | Recommended | Inputs | Text Field |
| 40 | Input Group | Recommended | Inputs | Text Field |
| 41 | Select | Essential | Inputs | Popover |
| 42 | Combobox | Recommended | Inputs | Popover, Listbox |
| 43 | Multi-select | Advanced | Inputs | Combobox, Tag |
| 44 | Date Picker | Recommended | Inputs | Calendar, Popover |
| 45 | Date Range Picker | Advanced | Inputs | Date Picker |
| 46 | Time Picker | Recommended | Inputs | Popover |
| 47 | Color Picker | Advanced | Inputs | Popover |
| 48 | Slider | Recommended | Inputs | — |
| 49 | Rating | Recommended | Inputs | — |
| 50 | OTP Input | Recommended | Inputs | — |
| 51 | Tag Input | Recommended | Inputs | Tag |
| 52 | Currency / Masked Input | Recommended | Inputs | Text Field |
| 53 | Rich Text Editor | Advanced | Inputs | Toolbar |
| 54 | Mention Input | Advanced | Inputs | Combobox |
| 55 | Checkbox | Essential | Selection Controls | — |
| 56 | Checkbox Group | Recommended | Selection Controls | Checkbox |
| 57 | Radio Group | Essential | Selection Controls | — |
| 58 | Switch | Essential | Selection Controls | — |
| 59 | Toggle Button | Recommended | Selection Controls | — |
| 60 | Toggle Group | Recommended | Selection Controls | Toggle Button |
| 61 | Choice Card | Recommended | Selection Controls | Card |
| 62 | Card | Essential | Data Display | — |
| 63 | Avatar | Essential | Data Display | — |
| 64 | Avatar Group | Recommended | Data Display | Avatar |
| 65 | Badge | Essential | Data Display | — |
| 66 | Tag / Chip | Essential | Data Display | — |
| 67 | Status Pill | Recommended | Data Display | — |
| 68 | List | Essential | Data Display | — |
| 69 | Description List | Recommended | Data Display | — |
| 70 | Stat / KPI Tile | Recommended | Data Display | Sparkline |
| 71 | Accordion | Essential | Data Display | Collapse |
| 72 | Timeline | Recommended | Data Display | — |
| 73 | Tree View | Advanced | Data Display | — |
| 74 | Code Block | Recommended | Data Display | Copy to Clipboard |
| 75 | Carousel | Recommended | Data Display | — |
| 76 | Kbd | Recommended | Data Display | — |
| 77 | Diff Viewer | Advanced | Data Display | Code Block |
| 78 | Chart Container | Recommended | Data Visualization | — |
| 79 | Axis | Recommended | Data Visualization | Chart Container |
| 80 | Chart Legend | Recommended | Data Visualization | Chart Container |
| 81 | Chart Tooltip | Recommended | Data Visualization | Chart Container |
| 82 | Sparkline | Recommended | Data Visualization | — |
| 83 | Radial Gauge | Recommended | Data Visualization | — |
| 84 | Heatmap | Advanced | Data Visualization | Chart Container |
| 85 | Geo / Choropleth Map | Advanced | Data Visualization | Chart Container |
| 86 | Treemap | Advanced | Data Visualization | Chart Container |
| 87 | Sankey Diagram | Advanced | Data Visualization | Chart Container |
| 88 | Network Graph | Advanced | Data Visualization | Chart Container |
| 89 | Gantt Chart | Advanced | Data Visualization | Chart Container |
| 90 | Line Chart | Recommended | Charts | Chart Container, Axis |
| 91 | Area Chart | Recommended | Charts | Line Chart |
| 92 | Stacked Area Chart | Recommended | Charts | Area Chart |
| 93 | Bar / Column Chart | Recommended | Charts | Chart Container, Axis |
| 94 | Grouped / Stacked Bar | Recommended | Charts | Bar / Column Chart |
| 95 | Donut Chart | Recommended | Charts | Chart Container |
| 96 | Pie Chart | Recommended | Charts | Chart Container |
| 97 | Scatter Plot | Advanced | Charts | Chart Container, Axis |
| 98 | Bubble Chart | Advanced | Charts | Scatter Plot |
| 99 | Radar Chart | Advanced | Charts | Chart Container |
| 100 | Funnel Chart | Advanced | Charts | Chart Container |
| 101 | Toast | Essential | Feedback | Portal |
| 102 | Alert / Banner | Essential | Feedback | — |
| 103 | Callout | Recommended | Feedback | — |
| 104 | Progress Bar | Essential | Feedback | — |
| 105 | Spinner | Essential | Feedback | — |
| 106 | Skeleton | Essential | Feedback | — |
| 107 | Status Indicator | Recommended | Feedback | — |
| 108 | Tooltip | Essential | Feedback | Popover |
| 109 | Notification Center | Advanced | Feedback | Drawer, List |
| 110 | Portal | Essential | Overlays | — |
| 111 | Floating Engine | Essential | Overlays | Portal |
| 112 | Focus Trap | Essential | Overlays | — |
| 113 | Modal / Dialog | Essential | Overlays | Portal, Focus Trap |
| 114 | Drawer / Sheet | Essential | Overlays | Portal |
| 115 | Popover | Essential | Overlays | Floating Engine |
| 116 | Context Menu | Recommended | Overlays | Menu |
| 117 | Hover Card | Recommended | Overlays | Popover |
| 118 | Confirmation Dialog | Recommended | Overlays | Modal / Dialog |
| 119 | Lightbox | Recommended | Overlays | Portal |
| 120 | Form Provider | Essential | Forms | — |
| 121 | Form Field | Essential | Forms | Form Provider |
| 122 | Field Label | Essential | Forms | — |
| 123 | Helper Text | Essential | Forms | — |
| 124 | Validation Message | Essential | Forms | Form Field |
| 125 | Fieldset | Recommended | Forms | — |
| 126 | Form Section | Recommended | Forms | — |
| 127 | Form Actions | Recommended | Forms | — |
| 128 | Multi-step Form | Advanced | Forms | Stepper, Form Provider |
| 129 | Field Array | Advanced | Forms | Form Provider |
| 130 | Inline Edit | Advanced | Forms | Text Field |
| 131 | Table | Essential | Tables & Data Grid | — |
| 132 | Data Table | Essential | Tables & Data Grid | Table, Pagination |
| 133 | Column Sort | Recommended | Tables & Data Grid | Data Table |
| 134 | Column Filter | Recommended | Tables & Data Grid | Data Table |
| 135 | Row Selection | Recommended | Tables & Data Grid | Data Table, Checkbox |
| 136 | Bulk Actions Bar | Recommended | Tables & Data Grid | Row Selection, Toolbar |
| 137 | Expandable Rows | Recommended | Tables & Data Grid | Data Table |
| 138 | Column Visibility | Recommended | Tables & Data Grid | Data Table |
| 139 | Sticky Header / Column | Recommended | Tables & Data Grid | Data Table |
| 140 | Editable Cell | Advanced | Tables & Data Grid | Data Table, Inline Edit |
| 141 | Virtualized Grid | Advanced | Tables & Data Grid | Data Table |
| 142 | Conversation Thread | Recommended | AI Components | Message Bubble |
| 143 | Message Bubble | Recommended | AI Components | — |
| 144 | Prompt Composer | Recommended | AI Components | Textarea |
| 145 | Typing / Streaming Indicator | Recommended | AI Components | — |
| 146 | AI Suggestion Chips | Recommended | AI Components | Tag |
| 147 | Model / Agent Selector | Recommended | AI Components | Select |
| 148 | Citation / Source Card | Advanced | AI Components | Card |
| 149 | Tool Call Block | Advanced | AI Components | Code Block |
| 150 | Reasoning Trace | Advanced | AI Components | Accordion |
| 151 | Response Feedback | Recommended | AI Components | — |
| 152 | Usage / Token Meter | Advanced | AI Components | Progress Bar |
| 153 | Dropzone | Recommended | File Management | — |
| 154 | File Uploader | Recommended | File Management | Dropzone |
| 155 | Upload Progress | Recommended | File Management | Progress Bar |
| 156 | File Card | Recommended | File Management | Card |
| 157 | File List / Grid | Recommended | File Management | File Card |
| 158 | File Preview | Recommended | File Management | Lightbox |
| 159 | Attachment Chip | Recommended | File Management | Tag |
| 160 | Folder Tree | Advanced | File Management | Tree View |
| 161 | Image Cropper | Advanced | File Management | — |
| 162 | Login Form | Recommended | Authentication & Security | Form Provider |
| 163 | Sign-up Form | Recommended | Authentication & Security | Form Provider |
| 164 | SSO Provider Buttons | Recommended | Authentication & Security | Button |
| 165 | 2FA / OTP Verification | Recommended | Authentication & Security | OTP Input |
| 166 | Password Strength Meter | Recommended | Authentication & Security | Progress Bar |
| 167 | Consent / Cookie Banner | Recommended | Authentication & Security | Alert / Banner |
| 168 | Session Timeout Modal | Advanced | Authentication & Security | Modal / Dialog |
| 169 | Device / Session List | Advanced | Authentication & Security | List |
| 170 | Role / Permission Selector | Advanced | Authentication & Security | Combobox |
| 171 | API Key Manager | Advanced | Authentication & Security | Text Field, Copy to Clipboard |
| 172 | Visually Hidden | Essential | Utilities | — |
| 173 | Click Outside | Recommended | Utilities | — |
| 174 | Copy to Clipboard | Recommended | Utilities | — |
| 175 | Theme Toggle | Recommended | Utilities | Theme Provider |
| 176 | Locale / RTL Switcher | Recommended | Utilities | Theme Provider |
| 177 | Keyboard Shortcut | Recommended | Utilities | Kbd |
| 178 | Error Boundary | Recommended | Utilities | Error State |
| 179 | Lazy Loader | Advanced | Utilities | — |
| 180 | Print View | Advanced | Utilities | — |
| 181 | Bottom Navigation | Recommended | Mobile-specific | Tabs |
| 182 | Bottom Sheet | Recommended | Mobile-specific | Drawer / Sheet |
| 183 | Action Sheet | Recommended | Mobile-specific | Bottom Sheet |
| 184 | Floating Action Button | Recommended | Mobile-specific | Button |
| 185 | Mobile App Bar | Recommended | Mobile-specific | Navbar / Top Bar |
| 186 | Swipe Actions | Advanced | Mobile-specific | List |
| 187 | Pull to Refresh | Advanced | Mobile-specific | Scroll Area |
| 188 | Skip to Content | Recommended | Accessibility | — |
| 189 | Live Region | Essential | Accessibility | — |
| 190 | Visible Focus | Essential | Accessibility | Focus Ring Token |
| 191 | Landmark Regions | Recommended | Accessibility | — |
| 192 | Reduced Motion | Recommended | Accessibility | Motion Tokens |
| 193 | High Contrast Theme | Advanced | Accessibility | Theme Provider |
| 194 | Animate Presence | Recommended | Motion | Motion Tokens |
| 195 | Fade / Slide / Scale | Recommended | Motion | Motion Tokens |
| 196 | Collapse | Recommended | Motion | Motion Tokens |
| 197 | Count-up Ticker | Recommended | Motion | — |
| 198 | Beam / Glow Effect | Recommended | Motion | — |
| 199 | Stagger Container | Advanced | Motion | Animate Presence |
| 200 | Scroll Reveal | Advanced | Motion | Lazy Loader |
| 201 | Marquee | Advanced | Motion | — |
| 202 | Empty State | Essential | Empty & Loading States | — |
| 203 | No Results | Recommended | Empty & Loading States | Empty State |
| 204 | Error State | Recommended | Empty & Loading States | Empty State |
| 205 | Loading Overlay | Recommended | Empty & Loading States | Spinner |
| 206 | First-run Onboarding | Recommended | Empty & Loading States | Empty State |
| 207 | Skeleton Templates | Recommended | Empty & Loading States | Skeleton |
| 208 | Posture Score Card | Advanced | Domain-specific (ASM) | Radial Gauge |
| 209 | Grade Ring (A–F) | Advanced | Domain-specific (ASM) | Radial Gauge |
| 210 | Severity Badge | Recommended | Domain-specific (ASM) | Badge |
| 211 | Finding / Vulnerability Card | Advanced | Domain-specific (ASM) | Card, Severity Badge |
| 212 | Asset Row | Advanced | Domain-specific (ASM) | Sparkline |
| 213 | Priority Action Item | Advanced | Domain-specific (ASM) | List, Severity Badge |
| 214 | Attack Surface Widget | Advanced | Domain-specific (ASM) | Bar / Column Chart |
| 215 | Remediation Velocity | Advanced | Domain-specific (ASM) | Grouped / Stacked Bar |
| 216 | Scan Coverage Gauge | Advanced | Domain-specific (ASM) | Radial Gauge |
| 217 | Hosts-by-Country Map | Advanced | Domain-specific (ASM) | Geo / Choropleth Map |
| 218 | SSL / Cert Expiry Widget | Advanced | Domain-specific (ASM) | Radial Gauge |
| 219 | CVE Reference Chip | Advanced | Domain-specific (ASM) | Tag / Chip |
