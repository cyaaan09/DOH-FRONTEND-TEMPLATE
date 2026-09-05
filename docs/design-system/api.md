<!-- GENERATED from the component sources — do not hand-edit.
     Regenerate with `node scripts/build-api-docs.mjs`.
     Prose that needs judgment lives in ./README.md, which is hand-written. -->

# Component API reference

80 components, every one exported from `@/design-system`.
Each entry lists only what a consumer passes in: props, events and slots.
Anything undocumented here is internal and may change.

For how to install, theme and compose these, start with [README.md](./README.md).

## Contents

- [charts](#charts) — ChartEmpty, ChartLoading, ChartPanel, ChartReadout, ChartStatCard, DeltaPill, DonutChart, HorizontalBars, LineChart, Sparkline, StackedBars
- [Data](#data) — DataTable, Pagination
- [Date picker](#date-picker) — DatePicker
- [Disclosure](#disclosure) — Accordion
- [Feedback](#feedback) — Chip, ChipGroup, DismissibleChip, EmptyState, FilterChip, Notice, Skeleton
- [File inputs](#file-inputs) — FileInput, FileInputCompact, FileList
- [Forms](#forms) — Button, ConsentRow, Fieldset, FormField, FormShell, SearchField, Textarea, TextField, TokenField
- [Layout primitives](#layout-primitives) — AutoGrid, Cluster, Column, Grid, GridItem, Page, Row, Section, Sidebar, Split
- [Notifications](#notifications) — ActivityFeed, NotificationCentre
- [Overlays](#overlays) — ConfirmDialog, Dialog, HintedText, Popover, Toast, ToastRegion, Tooltip
- [Print](#print) — PrintPreview
- [Search](#search) — SearchResults
- [Selection controls](#selection-controls) — BulkActionBar, Checkbox, CheckboxCard, Radio, RadioCard, Switch
- [Dropdowns](#dropdowns) — InlineFilter, MultiSelect, RowMenu, Select
- [App shell](#app-shell) — AppHeader, AppShell, AppSidebar
- [Shortcuts](#shortcuts) — ShortcutSheet
- [Stepper](#stepper) — Stepper
- [Surfaces](#surfaces) — Card, CardBody, CardFooter, CardHeader, DividedCard, Meter, StatCard
- [Tabs](#tabs) — SegmentedTabs, StageTabs, Tabs

## charts

### ChartEmpty

Redline "Empty · 1px dashed --border-dashed on --surface, radius 12px, pad 28px 18px · says why in 13px / 700 + a 12px reason + a 34px reset button. Never an empty gridded frame, never a zero line." The two nevers are the point. An empty axis with a flat line at zero is a chart claiming the answer is nought; this says there is no data and why.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | String | (required) |  |
| `reason` | String | `''` | Why it is empty — a fact, not an apology. |
| `actionLabel` | String | `''` |  |

**Emits:** `action`

### ChartLoading

Redline "Loading · the plot area becomes one --chart-grid block at the chart's height — never animated bars growing from zero". The never matters: bars that animate up from zero read as real values arriving, so a user starts interpreting a chart that has no data in it yet.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `height` | Number | `108` |  |
| `label` | String | `'Loading chart'` |  |

### ChartPanel

The shell every chart sits in. Redline "Figure first · label 12px · figure 26px mono / 700 / -0.03em / line-height 1 · period meta 11.5px right-aligned. The header answers the question; the plot adds shape." That ordering is the section's first rule card, so the header is the component and the plot is a slot — not the other way round.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) | What the figure counts — "Licences issued". |
| `figure` | [String, Number] | (required) | The answer, in mono. "88", "122", "84%". |
| `period` | String | `''` | Right-hand meta, first line — "This month". |
| `note` | String | `''` | Right-hand meta, second line — "744 in 12 months". |
| `delta` | String | `''` | Passed straight to DeltaPill; omitted together, the pill does not render. |
| `deltaDirection` | String | `''` |  |
| `deltaTone` | String | `'good'` |  |
| `tableHref` | String | `''` | Redline "A11y · each chart names the table view holding the same data". A chart is a picture; this is where a keyboard user is sent instead. |
| `tableLabel` | String | `'View as table'` |  |

**Slots:** `default`, `footer`

### ChartReadout

Redline "Hover readout · --readout-bg · radius 11px · pad 11px 13px · shadow 0 10px 28px rgba(16,24,40,.26) · period 10.5px / 700 / 0.07em --ink-300 · every series in stack order + a total row above a 1px --readout-rule rule · 12px pointer offset" and "Touch · readout pins under the tapped column instead of following a pointer". Every series, always — including the ones at zero. A readout that hides empty series changes shape between columns, and the row you are looking for moves.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `period` | String | (required) | The column being read — "DECEMBER 2026". |
| `rows` | Array | (required) | [{ label, value, tone }] in stack order. |
| `totalLabel` | String | `'Total'` |  |

### ChartStatCard

Redline "Stat card · pad 15px 16px 12px · radius 14px · 1px --border-card · label 11.5px --text-meta · figure 24px mono / 700 / -0.03em with the delta baseline-aligned right · spark 12px below". Distinct from the StatCard in Surfaces: that one carries a status dot and an urgency treatment, this one carries a trend. Same redline group, different rows, and merging them would give each half the other's props.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) |  |
| `figure` | [String, Number] | (required) |  |
| `delta` | String | `''` |  |
| `deltaDirection` | String | `''` |  |
| `deltaTone` | String | `'good'` |  |
| `values` | Array | `() => []` |  |
| `tone` | String | `'var(--chart-ok)'` |  |

### DeltaPill

The tinted pill beside a chart's figure. Redline "Direction, not sign · the pill's tone follows whether the movement is GOOD, not whether the number rose — overdue renewals falling is green with a ▼". So `tone` and `direction` are separate props and neither is derived from the other: this component cannot know that fewer overdue renewals is an improvement, and a component that guessed would paint half a dashboard the wrong colour with nothing to catch it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) | The text inside the pill — "15.8%", "4", "36 at risk", "In good standing". |
| `direction` | String | `''` | Arrow prefix. Omit for a pill that states a condition rather than a change. |
| `tone` | String | `'good'` | Redline "Delta pill" — good --green-100/--green-text, watch --amber, bad --red. |

### DonutChart

Redline "Donut · 120px · r 46 · stroke 11 · BUTT caps, 2px gap taken out of each dash · a --chart-track full-circle track sits under the arcs so a small total still reads as a ring". The cap rule is the one to leave alone. Round caps add stroke/2 at BOTH ends, so at stroke 11 every slice paints 11px longer than its arc — this chart's own "Overdue 8" of 211 would read as 6.9% instead of 3.8% and lap the slice next to it. geometry.spec.js asserts both numbers.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `slices` | Array | (required) | [{ label, value, tone }] — at most four, per the sub-block's own title. |
| `centreValue` | [String, Number] | `''` | Big number in the hole, and the word under it. |
| `centreLabel` | String | `''` |  |
| `size` | Number | `120` |  |

### HorizontalBars

Redline "Horizontal bars · 7px track --chart-track radius 999 · label 12.5px clipping left · value 12px mono / 700 + share 10.5px --text-meta in a 30px right column". Bars are scaled against the LARGEST row, not the total: this chart ranks, and scaling to the total would leave every bar short and the ranking hard to read. The share column still carries the proportion in text.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `rows` | Array | (required) | [{ label, value, tone? }] in the order they should rank. |
| `total` | Number | `0` | Total for the share column; defaults to the sum of the rows. |

### LineChart

Redline "Line · 2.25px, smooth cubic through midpoints, round joins, vector-effect non-scaling-stroke" plus "Area fill", "Latest point", "Gridlines" and "Axis geometry". The gridlines are DIVs behind the SVG, not SVG lines, and the latest point is a positioned span in front of it. Both are deliberate: `preserveAspectRatio ="none"` stretches the viewBox horizontally, which would smear an SVG hairline and squash a circle into an ellipse. `vector-effect` saves the path itself; everything that must stay round or 1px thick lives in CSS.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `values` | Array | (required) | One number per period. |
| `labels` | Array | `() => []` | Labels for the x axis — one per value; only every third is drawn. |
| `tone` | String | `'var(--chart-ok-strong)'` | Any chart token: --chart-ok-strong for the emphasised single series. |
| `height` | Number | `108` |  |
| `fill` | Boolean | `false` | Stretch the plot to whatever height the panel gives it, instead of pinning it to `height`. Opt-in, because the artifact's own line panel does NOT do this — its plot box flexes while the chart inside stays 108px, which is where the ~90px of dead space under the line comes from when a taller panel sits beside it. Faithful in the design-system section, better on a real dashboard, and the difference is recorded rather than silently applied to both. |

### Sparkline

Redline "Sparkline · 30px tall · 1.75px smooth stroke in the figure's own tone + a 0.14→0 gradient fill · no axis, no dots, no labels". Deliberately not LineChart with smaller numbers: everything that makes a chart readable on its own — axis, gridlines, the latest point — is absent here, because a sparkline is punctuation inside a figure, not a chart.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `values` | Array | (required) |  |
| `tone` | String | `'var(--chart-ok)'` |  |
| `height` | Number | `30` |  |

### StackedBars

Redline "Bars · gap 12px · max-width 34px · radius 5px on the outer end only · 2px between stack segments · value 11px mono / 700 above, --ink-900 on the emphasised column and --text-meta elsewhere". "Outer end only" is the detail that makes a stack read as one bar: rounding every segment would draw a column of separate pills.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | Array | (required) | [{ label, segments: [{ key, value }] }] — segments run bottom-up. |
| `series` | Array | (required) | [{ key, label, tone }] in stack order; the tone is any chart token. |
| `emphasis` | String | `''` | Column label to draw at full weight — the redline allows exactly one. |
| `height` | Number | `112` |  |

## Data

### DataTable

Redline group "Tables" — 30 rows, rebuilt in the 2026-08-31 artifact update around three ideas the section states outright: a 3px state stripe replaces reading the status column, the count column carries its own meter, and the toolbar holds saved views rather than a second row of filters. §7 plans this on TanStack. It is hand-built for now — see §17.3: every row in the redline is presentation, and the props below are shaped so a row model can drive them later without the markup changing.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | Array | (required) | Array<{ key, label, width, align?, sortable? }> — data columns only. |
| `rows` | Array | (required) | Array<{ id, stripe?: 'green'\|'amber'\|'red'\|'closed', cells, expand? }>. `cells` is keyed by column key; the section renders them through slots. |
| `selected` | Array | `() => []` | Selected row ids. |
| `expanded` | String | `''` | Expanded row id, or ''. One at a time — the panel is tall. |
| `sort` | Object | `() => ({ key: '', dir: 'desc' })` |  |
| `selectAllLabel` | String | `'Select all rows'` |  |
| `actionsLabel` | String | `'Row actions'` |  |
| `label` | String | `''` | Accessible name for the <table>. Optional: not every table needs one. |

**Emits:** `update:selected`, `update:expanded`, `sort`

**Slots:** `toolbar`, `bulk`, `expand`, `footer`

### Pagination

Redline "Pagination · 34x32px · radius --r-control · active --green-fill / --green-on-fill · idle 1px --border-field", plus the footer's rows-per-page control and result pill. Ark ships a `pagination` machine and §7 plans it there. This is hand-built for the same reason DataTable is — see the §17.3 entry — and its props are shaped so a machine can drive it later without the markup changing.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | Number | (required) |  |
| `pageCount` | Number | (required) |  |
| `perPage` | Number | `25` |  |
| `perPageOptions` | Array | `() => [25, 50, 100]` |  |
| `total` | Number | `0` | Total rows, for the result pill. |
| `prevLabel` | String | `'Previous page'` |  |
| `nextLabel` | String | `'Next page'` |  |

**Emits:** `update:page`, `update:perPage`

## Date picker

### DatePicker

Redline "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 · normalised on blur · calendar is never the only path" — which is the whole argument for this component over a bare calendar: typing beats clicking for a date three years out, so the field stays editable and the popover is the assist.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `selectionMode` | String | `'single'` | `single` for one date, `range` for a reporting period. |
| `label` | String | (required) |  |
| `numOfMonths` | Number | `1` | Redline "Range · two months side by side". |
| `constraint` | String | `''` | Redline "Footer · constraint note right". |
| `min` | String | `''` | ISO date. Parsed to a DateValue — Zag rejects a raw string. |
| `max` | String | `''` |  |
| `todayLabel` | String | `'Today'` |  |
| `openLabel` | String | `'Open calendar'` |  |
| `dateOrder` | String | `'dmy'` | How a purely numeric date is read. Appendix C's three examples — `04/09/2026`, `4 Sep 26`, `2026-09-04` — all denote 4 September 2026, which makes the slash form DAY-first, and that is the default. But the same page draws a Sunday-first calendar, so the artifact is not self-consistent, and the reading that matters is the one the people entering records actually use. One prop, and the mask's auto-advance thresholds follow it: pass `mdy` and the field becomes month-first everywhere, including the placeholder. Whichever way it is set, `format` normalises to `04 Sep 2026` on blur, so a misread date is visible immediately rather than silently stored. |

**Emits:** `valueChange`

**Slots:** `presets`, `actions`

## Disclosure

### Accordion

Redline "When · one long record read top to bottom — tabs swap views, accordion reveals sections of the same thing". The section's own rule card is blunter: "a tabbed accordion means the information architecture is unresolved". Redline "Header · the whole row is the button (aria-expanded)" — not the chevron. A 22px hit area for a section header is the kind of thing that tests fine with a mouse and fails every other way in.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | Array | (required) | Array<{ value, title, summary?, badge?: { label, tone } }>. Bodies come through the `body` slot, keyed by value. |
| `modelValue` | Array | `() => []` | Redline "Default state · first section open, rest collapsed". |
| `title` | String | `''` | Record title in the toolbar. |
| `expandAllLabel` | String | `'Expand all'` |  |

**Emits:** `update:modelValue`

**Slots:** `item.value`

## Feedback

### Chip

A status or category pill. The TONE carries the meaning and the word repeats it — colour is never the only signal, and no row shows two chips of the same tone.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | String | `DEFAULT_TONE` |  |
| `variant` | String | `'tint'` |  |
| `dot` | Boolean | `false` |  |

**Slots:** `default`

### ChipGroup

A wrapping row of chips at the redlined 7px gap. Chips never wrap mid-phrase, so overflow collapses into a "+n more" rather than breaking a label across lines.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | String | `'7px'` | Appendix C's Chips group says 7px, and that governs the tone rows; the artifact's FILTER chip row runs 8px. Recorded in §17.3 as "chip row gaps differ by context" — this is the context. |

**Slots:** `default`

### DismissibleChip

An applied-filter chip whose × is a real <button> with its own aria-label, not a glyph. Emits the filter's key so the caller removes it by identity rather than by index.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `chipKey` | String | (required) |  |
| `value` | String | (required) |  |

**Emits:** `dismiss`

### EmptyState

The dashed panel shown where content would be. It states what is missing and what to do about it — an empty region with no explanation reads as a broken one.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | String | (required) | What is absent, in the user's terms. |
| `description` | String | `''` | What to do about it. |

**Slots:** `default`

### FilterChip

A toggle chip with a checkbox-style mark. Both states carry a border, so selecting one does not change its width and reflow the row.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `selected` | Boolean | `false` |  |

**Emits:** `toggle`

**Slots:** `default`

### Notice

An inline banner carrying a tone label and a message. role=status, or role=alert when the tone is error, so a failure interrupts rather than waits.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | String | `DEFAULT_TONE` |  |
| `label` | String | (required) |  |

**Slots:** `default`

### Skeleton

Loading placeholder bars, three rows at most. The bars are hidden from assistive tech inside an aria-busy region, so the wait is announced once instead of read as content.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `rows` | Number | `3` |  |
| `columns` | Array | `() => []` | CSS grid track sizes, one per bar in a row — Appendix D.1's table skeleton is `['1.6fr', '0.7fr', '1fr']`. Left empty (the default) the component stays the plain stack of full-width bars Appendix C redlines; a consumer loading a TABLE wants row-shaped placeholders, and that is the artifact's only use of it. |
| `busyLabel` | String | `'Loading'` | What the region will hold once it loads — announced while it is busy. |

## File inputs

### FileInput

The dashed dropzone: drag or browse, with the accepted types and size limit stated up front rather than discovered on rejection.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) | Field name above the dropzone — Appendix D.1's `PNPKI certificate`. |
| `title` | String | `'Drop a file or click to browse'` | First line inside the zone. |
| `constraint` | String | `''` | Second line inside the zone — the artifact's `.p12 · up to 5 MB`. |
| `hint` | String | `''` | Note below the zone, same slot a TextField hint occupies. |
| `accept` | String | `''` | Passed to the native input, e.g. `.p12`. |
| `maxFiles` | Number | `1` |  |

**Emits:** `fileAccept`

### FileInputCompact

The same upload in a 38px field row, for forms too dense for a dropzone.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) | Field name above the row — Appendix D.1's `Compact · inside a form row`. |
| `placeholder` | String | `'No file selected'` | Shown while nothing is chosen. |
| `fileName` | String | `''` | The chosen file's name, when there is one. |
| `hint` | String | `''` | Note below the row. |
| `triggerLabel` | String | `'Browse'` |  |
| `accept` | String | `''` |  |
| `maxFiles` | Number | `1` |  |

**Emits:** `fileAccept`

### FileList

Rows for files that are uploading, done, or failed. Hand-built rather than Ark's `FileUploadItem` family: those parts render the machine's OWN accepted-file list, and Ark's file-upload has no upload state or progress model at all (verified against @zag-js/file-upload — it tracks accepted/rejected, nothing about transfer). The artifact's list carries a percentage, a success note and a failure note, all of which are the consumer's data, so the rows arrive as a prop. Recorded in spec §17.3.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `files` | Array | (required) | Array<{ id, name, size, ext, state: 'uploading' \| 'done' \| 'failed', pct?: number }>, in display order. |
| `emptyText` | String | `'No files attached yet.'` | Shown in place of the rows when `files` is empty. |
| `doneNote` | String | `'Uploaded · virus scan passed'` |  |
| `failedNote` | String | `'Over the 10 MB limit — compress or split the file.'` |  |
| `removeLabel` | String | `'Remove'` |  |

**Emits:** `remove`

## Forms

### Button

The system's only button. Five variants and three sizes; `busy` shows a spinner and disables the control so a slow submit cannot be double-fired.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | String | `'primary'` | The validator only warns on a typo in dev; it must not change runtime |
| `size` | String | `'default'` |  |
| `busy` | Boolean | `false` |  |
| `disabled` | Boolean | `false` |  |
| `type` | String | `'button'` |  |

**Slots:** `default`

### ConsentRow

Redline "Consent row · --surface-card-muted · 1px --divider · radius 10px · pad 12px 14px · 17px checkbox + 13px copy". Its own sunken block rather than another field in the grid: a certification is a different kind of act from filling a value in, and the surface says so before the copy does.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` |  |
| `label` | String | (required) |  |
| `hint` | String | `''` |  |

**Emits:** `update:modelValue`

### Fieldset

Redline "Fieldset label · 10.5px / 700 / 0.08em --text-header + 1px --divider rule · 24px above, 14px below". A rule, not a card — the Containers group forbids nesting, so a form's sections divide rather than stacking cards inside a card. The section's own rule card says so: "Sections are rules, not cards".

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) |  |
| `first` | Boolean | `false` | The first fieldset in a form sits flush; the rest take the 24px above. |

**Slots:** `default`

### FormField

A field in a form grid: its label, its required/optional mark, its control, and ONE message slot shared by help text and the error. Redline "Help/error slot · one shared slot per field: 5px below the control, min-height 32px, line-height 1.35 — reserved for two lines so validating never reflows the row". The reservation is the point: a form that grows when a field goes invalid pushes everything below it down, and the user loses their place at exactly the moment they need it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) |  |
| `hint` | String | `''` | Help text, shown while there is no error. |
| `error` | String | `''` | REPLACES the hint in the shared slot — never appears beside it. |
| `required` | Boolean | `false` | Redline "Required mark · used on required fields only" and "Optional mark". Most fields are required, so the grey `optional` marks the few that are not and the asterisk carries the rest. |
| `optional` | Boolean | `false` |  |

**Slots:** `default`

### FormShell

Redline "Shell · one card per form" — header, body, footer, and one progress meter. The footer "owns every action", so a form has exactly one place a user looks for Back and Continue.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | String | (required) |  |
| `subtitle` | String | `''` |  |
| `progress` | Number | `-1` | 0–100. Omitted, the header draws no meter. |
| `autosave` | String | `''` | Redline "Autosave note · 12px --text-meta + 6px --amber-400 dot". |

**Slots:** `default`, `actions`

### SearchField

A text field with a leading search glyph. The clear action appears only once there is a value.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | String | `''` |  |
| `placeholder` | String | `'Search'` |  |
| `label` | String | `'Search'` |  |

**Emits:** `update:modelValue`

### Textarea

A multi-line field carrying the same label, hint and error contract as TextField, plus an optional character counter.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | String | `''` |  |
| `label` | String | (required) |  |
| `hint` | String | `''` |  |
| `error` | String | `''` |  |
| `placeholder` | String | `''` |  |
| `disabled` | Boolean | `false` |  |
| `readonly` | Boolean | `false` |  |
| `rows` | Number | `3` |  |
| `maxlength` | Number | `0` |  |
| `bare` | Boolean | `false` | Render the control alone — no label, no message. `FormField` owns both inside a form grid, where the message slot is a RESERVED two-line box shared with the error and the error badge is filled rather than an outline ring. Drawing either here as well would double them. |

**Emits:** `update:modelValue`

### TextField

The single-line field. One shared slot holds either the hint or the error, never both, so validating a form never changes its height.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | String | `''` |  |
| `label` | String | (required) |  |
| `hint` | String | `''` |  |
| `error` | String | `''` |  |
| `placeholder` | String | `''` |  |
| `disabled` | Boolean | `false` |  |
| `readonly` | Boolean | `false` |  |
| `type` | String | `'text'` |  |
| `mono` | Boolean | `false` |  |
| `suffix` | String | `''` | A unit shown inside the field, after the value — Appendix D.1's `beds`. 12px/400 in the meta grey. NOT the redlined "Trailing action", which this prop was previously styled as: that row (11.5/700, pad 6px) describes the interactive `action` button below, and applying it here made a static unit look like a control. |
| `badge` | String | `''` | A static trailing status word — Appendix D.1's `SYNCED` on the read-only field. 11px/700 in the meta grey, the chip type step. |
| `action` | String | `''` | Label for a trailing text button — Appendix D.1's `SHOW` / `HIDE` on the password field. This is the redlined "Trailing action": 11.5/700, the meta grey, pad 6px. Emits `action` when clicked; the parent owns what it does, so the same button serves reveal, clear, or unlock. |
| `qualifier` | String | `''` | A muted qualifier after the label — Appendix D.1's `· with leading icon` and `· read only`. Rendered inside the <label> so it stays part of the field's accessible name, which is how the artifact reads it. |
| `bare` | Boolean | `false` | Render the control alone — no label, no message. `FormField` owns both inside a form grid, where the message slot is a RESERVED two-line box shared with the error and the error badge is filled rather than an outline ring. Drawing either here as well would double them. |

**Emits:** `update:modelValue`, `action`

### TokenField

Redline "Token field · min-height 38px · pad 5px 8px · chips 26px --green-100 / --green-text with × at .75 opacity". Grows with its contents rather than scrolling: a facility's service list is the thing being edited, and hiding half of it behind a scrollbar inside a 38px shell is how services get missed at inspection.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Array | `() => []` | Array<string> — the chosen tokens. |
| `placeholder` | String | `'Add…'` |  |
| `removeLabel` | String | `'Remove'` |  |

**Emits:** `remove`

## Layout primitives

### AutoGrid

Redline "AutoGrid · repeat(auto-fit, minmax(min,1fr)) · gap 12 · min 190px stats, 240–300px panels". Reflows without a media query, which is why every stat and panel grid on the page is one of these.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `min` | String | `'240px'` | The auto-fit track minimum. 190px for stat cards, 240–300px for panels. |
| `gap` | [Number, String] | `12` | One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev. |

**Slots:** `default`

### Cluster

Redline "Cluster · Row with wrap on · gap 7–8 — chips, tags, filter pills, service lists". A group whose COUNT you do not control: it must wrap, and the caller must not have to remember to say so. The redline gives 7–8 rather than one value because the Chips group settles it per context (7px tone rows, 8px filter rows) — 8 is the scale value and the default; ChipGroup owns the 7px case.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | [Number, String] | `8` | One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev. |
| `align` | String | `'center'` |  |

**Slots:** `default`

### Column

Redline "Column · flex column · align stretch · gap 12 default — stacked fields, card bodies". The workhorse of the system.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | [Number, String] | `12` | One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev. |
| `align` | String | `'stretch'` |  |

**Slots:** `default`

### Grid

Redline "Grid · repeat(12, minmax(0,1fr)) · gap 16 row / 24 col · children span 4 / 6 / 8 / 12, floor 172px" — the form grid. minmax(0,1fr), not 1fr: a bare 1fr track has an `auto` minimum, so one long unbroken string widens the whole grid instead of ellipsising. That is the same failure the "Flex children · min-width: 0" redline names for flex, and it is baked in here rather than left to the caller. Children carry their span with `GridItem`; the redline's floor keeps a 4-span cell from collapsing below a usable field width on a narrow card.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cols` | Number | `12` |  |
| `gapY` | [Number, String] | `16` | Row gap. |
| `gapX` | [Number, String] | `24` | Column gap — wider than the row gap, per the redline. |

**Slots:** `default`

### GridItem

A `Grid` child and its span. The redline names the spans ("children span 4 / 6 / 8 / 12, floor 172px") but not a component, because the source is a static document — something has to carry the value, and a prop keeps it out of the caller's class strings. Below the floor the cell drops to the full width rather than shrinking past a usable field: `min-width: 172px` alone would overflow the track.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `span` | Number | `12` |  |

**Slots:** `default`

### Page

Redline "Page · max-w 1320px detail / 1560px tables · pad 26px 32px · canvas" — the canvas colour is --canvas, via the bg-canvas utility. Page and Section are the two primitives that DO own colour and padding — the "Rule" row governs Row/Column/Grid and friends, which compose inside them. They are containers, not spacing helpers.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `width` | String | `'detail'` | `detail` caps at 1320px; `table` at 1560px for a wide data table. |

**Slots:** `default`

### Row

Redline "Row · flex · align center · gap 12 default · wrap off — toolbars, button pairs, label rows". Redline "Rule": a primitive sets direction, gap and alignment ONLY. It carries no colour, border or padding of its own, so a screen is composed rather than hand-measured. A test asserts that.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | [Number, String] | `12` | One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev. |
| `align` | String | `'center'` |  |
| `justify` | String | `'flex-start'` |  |
| `wrap` | Boolean | `false` |  |

**Slots:** `default`

### Section

Redline "Section · one card + 22px below · cards never nest — divide (1px --divider) or sink (--surface-sunken) instead". The no-nesting rule is the reason this exists as a primitive rather than a div: a Section IS the card, so there is no way to put one inside another without it reading as a mistake. `DividedCard` and the sunken strip are the two sanctioned alternatives.

**Slots:** `default`

### Sidebar

Redline "Sidebar · 244px rail + flex:1 main · 62px under 1024px · off-canvas under 768px · one per page" — the app shell's own frame. The two widths are tokens already: --rail-w (244px) and --rail-w-collapsed (62px), defined in Phase 1 and unused until now.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `side` | String | `'left'` |  |
| `collapsed` | Boolean | `false` | Force the collapsed rail regardless of width — the demo shows both. |
| `open` | Boolean | `false` | Off-canvas rails are hidden until opened; the shell owns that state. |

**Slots:** `default`, `rail`

### Split

Redline "Split · Row with a flex:1 spacer — content left, actions right · wraps at 640px". Two slots rather than a spacer the caller inserts: the spacer is the whole point of the primitive, and a caller who forgets it gets a Row. Below 640px the two groups stack, so a card header does not squeeze its actions into an unreadable strip.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | [Number, String] | `12` | One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev. |
| `align` | String | `'center'` |  |

**Slots:** `default`, `end`

## Notifications

### ActivityFeed

Redline "Feed rules · append-only — corrections are new entries, the wrong one stays visible". That is the whole difference from the notification centre: there is nothing to dismiss and nothing to mark read, because the feed is a record rather than a queue.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `events` | Array | (required) | Array<{ id, actor?, initials?, tone?, glyph?, body, time, detail? }>. |
| `label` | String | `'Activity'` |  |

**Slots:** `detail`

### NotificationCentre

Redline "Split · centre is addressed to you and dismissible; the feed is append-only and never marked read". Two components, because they are two jobs — merging them is how a record's history ends up with a "mark read" button on it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | Array | (required) | Array<{ id, tone, glyph, subject?, body, time, action?, unread? }>. |
| `title` | String | `'Notifications'` |  |
| `markAllLabel` | String | `'Mark all read'` |  |
| `seeAllLabel` | String | `''` |  |

**Emits:** `markAllRead`, `action`, `seeAll`

## Overlays

### ConfirmDialog

Redline's three levels, chosen by how bad the mistake is: 1 reversible — no dialog at all, a toast with Undo (not this component) 2 serious — plain dialog, destructive OUTLINE button 3 irreversible — type-to-confirm, primary disabled until the string matches Redline "Focus · opens on Cancel (never the destructive button)". A dialog that opens focused on Revoke turns a reflexive Enter into a revocation.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` |  |
| `title` | String | (required) | Redline "Header · title ending in a question mark". |
| `body` | String | `''` | Redline "Body · what happens, to whom, and whether it can be undone. Never "Are you sure"." |
| `impact` | String | `''` | Redline "Impact strip · the count of affected things". |
| `confirmLabel` | String | `'Confirm'` |  |
| `cancelLabel` | String | `'Cancel'` |  |
| `confirmPhrase` | String | `''` | Level 3 only. Redline "Confirm label · the identifier inline in mono — the LTO number, never the word DELETE": typing DELETE is muscle memory, typing the licence number means reading the licence number. |
| `mismatchLabel` | String | `'Does not match yet.'` |  |

**Emits:** `update:modelValue`, `confirm`

### Dialog

A modal over a scrim. Focus moves in on open, is trapped while open, and returns to the trigger on close; Esc cancels and never confirms.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` | v-model — whether the dialog is open. |
| `title` | String | (required) |  |
| `description` | String | `''` | The consequence, not the action. Appendix D's own rule for this pattern. |
| `confirmLabel` | String | `'Confirm'` | Label for the button that goes through with it. |
| `cancelLabel` | String | `'Cancel'` | Label for the button that backs out — the safe one, so it sits first. |
| `destructive` | Boolean | `true` | Renders the destructive dress: a red icon tile and a filled red confirm. The only variant the artifact shows, and the only one Appendix C redlines, but a non-destructive confirmation should not borrow it. |

**Emits:** `update:modelValue`, `confirm`

### HintedText

Redline "Hinted trigger · inline text that owns a tooltip takes a 1px dashed underline in its own tone + cursor help". The underline is the whole point: a tooltip that only appears on hover with no visible affordance is invisible to anyone who does not happen to hover there. Pair it with `Tooltip`, which supplies the keyboard path.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | String | `'neutral'` | Matches the text's own tone, so the underline never introduces a colour. |

**Slots:** `default`

### Popover

Redline "Popover a11y · focus trapped, Esc closes, focus returns to the trigger · it is a dialog without a scrim" — Ark's machine provides all of that, which is the whole reason a popover is not a styled tooltip. Redline "Popover actions · dismiss reads Got it, not Close": the dismiss acknowledges the explanation rather than describing the widget, so it is the default here and a caller has to work to make it worse.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | String | (required) |  |
| `body` | String | `''` |  |
| `action` | String | `''` | Optional confirming action, left of the dismiss. |
| `dismissLabel` | String | `'Got it'` |  |
| `closeLabel` | String | `'Close'` |  |
| `placement` | String | `'bottom'` |  |

**Emits:** `action`

**Slots:** `default`, `body`

### Toast

One toast in the stack: a tone-coloured icon, the message, an optional action, and a timer bar. Rendered by ToastRegion, not mounted directly.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `toast` | Object | (required) | The toast object Ark's <Toaster> hands to its default slot. |
| `dismissLabel` | String | `'Dismiss'` | Label for the secondary text dismiss beside the action. |
| `closeLabel` | String | `'Close notification'` | Accessible name for the × in the corner. |

### ToastRegion

The live region that positions the toast stack. Takes the store from Ark's `createToaster` — the artifact's settings are bottom-end, gap 10, 5s, three at most.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `toaster` | Object | (required) | The store from Ark's `createToaster`. The artifact's numbers are `{ placement: 'bottom-end', gap: 10, offsets: '16px', duration: 5000, max: 3 }` — bottom-right, newest on top, 5s auto-dismiss, and the "Three at most" rule the section itself states. |
| `contained` | Boolean | `false` | Position the region inside the nearest positioned ancestor instead of the viewport. Real apps want the default (fixed); the demo needs it contained inside its "App surface" panel. |
| `dismissLabel` | String | `'Dismiss'` |  |

### Tooltip

Redline "Rule · if it contains a button, it is a popover — a tooltip holds one line of text and nothing else". So this takes a STRING, not a slot: the constraint is the component's job to enforce, not the caller's to remember. Redline "Tooltip a11y · aria-describedby · shows on keyboard focus too · never focusable itself" — all three come from Ark's machine; the tooltip content is not a tab stop, and focusing the trigger opens it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) | One line, under 48 characters, sentence case, no full stop. |
| `openDelay` | Number | `120` | Redline "Tooltip timing · 120ms delay in, none out". |
| `closeDelay` | Number | `0` |  |
| `placement` | String | `'top'` |  |

**Slots:** `default`

## Print

### PrintPreview

Redline "Page · A4 portrait at TRUE 210:297 aspect, any scale". The aspect is enforced by aspect-ratio rather than fixed pixels, so the sheet stays honest at every width — a certificate that previews at the wrong proportions teaches the wrong thing about where the signature lands. Redline "Fidelity · preview and print share markup and stylesheet with one page box — if they can disagree, the preview is decoration".

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `signed` | Boolean | `true` | Redline "Unsigned · preview watermarked · Print disabled". |
| `blockedTitle` | String | `'Not signed yet'` | The blocking notice's copy when unsigned. |
| `blockedAction` | String | `'Sign now'` |  |
| `pageLabel` | String | `'Page 1 of 1'` |  |
| `zoom` | String | `'100%'` |  |
| `watermark` | String | `'UNSIGNED'` |  |

**Emits:** `sign`, `download`, `print`

**Slots:** `default`, `toolbar`, `footer`

## Search

### SearchResults

Redline "Scope · global find — distinct from the 34px toolbar filter, which narrows the list already shown". The distinction is why this exists at all: one crosses record types and navigates, the other stays put. Redline "ARIA · role=combobox aria-expanded + role=listbox/option · aria-activedescendant follows the arrows" — the arrows move a visual selection while focus stays in the input, so the selection has to be announced by id rather than by focus.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | String | `''` |  |
| `groups` | Array | (required) | Array<{ label, count, rows: [{ id, tile, title, meta }] }> — max 3. |
| `active` | String | `''` | The preselected row's id. Redline: "preselected but never auto-navigated". |
| `totalLabel` | String | `''` |  |
| `label` | String | `'Search'` |  |
| `placeholder` | String | `'Search'` |  |
| `rowCap` | Number | `4` | Redline "Row cap · 4 rows per group". |

**Emits:** `update:modelValue`, `select`

**Slots:** `row-end`

## Selection controls

### BulkActionBar

The bar that appears once rows are selected, holding the count and the actions that apply to the selection.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `rows` | Array | (required) | Selectable rows, in display order: { id, name, number }. |
| `modelValue` | Array | `() => []` | Selected row ids. |
| `actions` | Array | `() => []` | Bulk actions offered once something is selected: { value, label }. Appendix C has no dedicated redline for these, so they render as ordinary Secondary/Compact Buttons rather than inventing new chrome. |

**Emits:** `update:modelValue`, `action`

### Checkbox

A 17px box with its label and optional hint. Supports the indeterminate state a partial bulk selection needs.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` | Whether the box is checked. Ignored while `indeterminate` is true. |
| `label` | String | (required) | The visible row label. |
| `hint` | String | `''` | Optional second line under the label. |
| `disabled` | Boolean | `false` |  |
| `indeterminate` | Boolean | `false` | Renders the mixed state. Exposed to assistive technology through the native hidden input's `indeterminate` property, not an aria-checked attribute — see Checkbox.spec.js "exposes the mixed state...". |
| `emphasis` | Boolean | `false` | Renders the label at the card weight. Appendix D.1's per-control type table: a plain list row is 13.5/400 --ink-700, but the same control inside a CheckboxCard is 13.5/500 --ink-900. CheckboxCard composes this component rather than re-rendering Ark's parts, so the weight has to arrive as a prop — a :deep() override in the card would set font-weight and color a second time, which is exactly the two-declarations-per- property pattern this codebase keeps regressing on. |
| `hideLabel` | Boolean | `false` | Keep the label as the accessible name but take it out of the layout — a table's select column is 44px wide and the row beside it already says which row this is. §8.1: `label` is the text that names the thing; how it is presented is the component's business. NOT aria-label instead: Ark points the hidden input's aria-labelledby at this element, so removing it would leave the control unnamed. |

**Emits:** `update:modelValue`

### CheckboxCard

A checkbox presented as a selectable card, for choices that need a description rather than a single line.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` | Whether the card is chosen. Same prop shape as Checkbox. |
| `label` | String | (required) | The visible row label, relayed to the nested Checkbox. |
| `hint` | String | `''` | Optional second line under the label. |
| `disabled` | Boolean | `false` |  |

**Emits:** `update:modelValue`

### Radio

A radio group built from an options array — one control, not one per option, so the group's name and semantics stay in one place.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | Array<{ value, label, hint?, disabled? }>, in display order. |
| `modelValue` | String | `''` | The chosen option's value, or '' when nothing is chosen. |
| `label` | String | (required) | Names the group for assistive technology, via aria-label on the [role="radiogroup"] root. NOT rendered (§8.1). Ark's own RadioGroupLabel part is deliberately unused: it renders a visible element, and this component's label never draws. getRootProps() also always sets aria-labelledby to that unrendered label's id, which would otherwise dangle; the template neutralises it (see the comment there). |

**Emits:** `update:modelValue`

### RadioCard

A radio group presented as selectable cards, for a small set of choices that each need explaining.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | Array<{ value, label, hint?, disabled? }>, in display order. Same option shape as Radio. |
| `modelValue` | String | `''` | The chosen option's value, or '' when nothing is chosen. |
| `label` | String | (required) | Names the group for assistive technology, via aria-label on the [role="radiogroup"] root. NOT rendered (§8.1) — same treatment as Radio.vue, including the dangling aria-labelledby neutralised below. |

**Emits:** `update:modelValue`

### Switch

An on/off control whose label sits to its LEFT — the artifact's own footnote for this sub-block, and the opposite of the checkbox order.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` | Whether the switch is on. |
| `label` | String | (required) | The visible row label. |
| `hint` | String | `''` | Optional second line under the label. |
| `disabled` | Boolean | `false` |  |

**Emits:** `update:modelValue`

## Dropdowns

### InlineFilter

The compact 34px dropdown used inside filter bars, where a 38px field would break the row's rhythm.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | Options as `{ label, dot }`, where `dot` is a background utility class. |
| `modelValue` | String | (required) | The chosen option's label. |
| `name` | String | (required) | The field name, rendered inline before the value and used as the name. |

**Emits:** `update:modelValue`

### MultiSelect

A dropdown of checkboxes with its own filter input and Clear/Apply footer. Space toggles without closing, so several choices take one visit.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | Every option, in display order. |
| `modelValue` | Array | `() => []` | The chosen options. |
| `placeholder` | String | (required) | Shown in the trigger while nothing is chosen. |
| `label` | String | (required) | Names the control for assistive technology. NOT rendered on screen. |
| `filterPlaceholder` | String | (required) | Placeholder for the in-panel filter field. |
| `emptyText` | String | (required) | Shown in place of the list when the filter matches nothing. |

**Emits:** `update:modelValue`, `apply`

### RowMenu

The ⋯ menu for a table row. Esc and click-outside both close it and return focus to the trigger.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | Array | (required) | Items as `{ value, label, destructive? }`, destructive last. |
| `label` | String | (required) | Names the trigger for assistive technology — the glyph is decorative. |

**Emits:** `select`

### Select

A single-choice dropdown. The panel matches the trigger's width and opens 6px below it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | The options to choose between, in display order. |
| `modelValue` | String | `''` | The selected option, or '' when nothing is chosen. |
| `placeholder` | String | (required) | Shown in the trigger while nothing is chosen. |
| `label` | String | (required) | Names the control for assistive technology. NOT rendered — the page draws its own visible field label above the control. |

**Emits:** `update:modelValue`

## App shell

### AppHeader

Redline "Header · pad 12px 32px · rgba(255,255,255,.75) · blur 6px · sticky z 6" and "Breadcrumb · 13px / 500 --text-meta · separator / --separator · current --ink-900". The translucent surface is written against --surface, not white, so it follows the theme — a literal would glare across the dark canvas the way the page-shell schematic's header did before it was fixed.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `breadcrumb` | Array | `() => []` | Array<string> — the last entry is the current page. |
| `account` | Object | `null` |  |

**Slots:** `default`

### AppShell

The page frame: one rail, one sticky header, one scrolling main. Composed on the `Sidebar` layout primitive rather than reimplementing its widths — the primitive already owns 244/62/off-canvas, and the redline's "one per page" rule is about this component, not that one.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `collapsed` | Boolean | `false` |  |
| `open` | Boolean | `false` | Off-canvas state below 768px; the shell owns it, the primitive applies it. |
| `skipLabel` | String | `'Skip to main content'` |  |
| `mainId` | String | `'main-content'` |  |

**Slots:** `default`, `rail`, `header`

### AppSidebar

Redline "App shell — sidebar & header". One rail, two widths: 244px expanded, 62px collapsed, transitioning on --t-rail. The collapsed state is where the accessibility work is. Redline "Collapsed item · title + aria-label required (the label is the only name once text drops)" — with the text gone, the mark is decorative and cannot name anything, so every item carries its label as an accessible name in both states rather than gaining one on collapse.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `groups` | Array | (required) | Array<{ label, groups }> — see `groups`. |
| `active` | String | `''` | The active item's key. |
| `collapsed` | Boolean | `false` |  |
| `brand` | Object | `() => ({ mark: 'OL', name: 'OLRS', org: '' })` |  |
| `account` | Object | `null` |  |
| `collapseLabel` | String | `'Collapse navigation'` |  |

**Emits:** `select`, `toggle`

## Shortcuts

### ShortcutSheet

Redline "Contract · listed here means bound everywhere; not listed means not bound". The sheet is not documentation of the bindings — it IS the binding list, which is why it renders from data rather than prose. Redline "Separator · encodes the relationship" — `+` for a true chord, italic `then` for a sequence, italic `or` for alternatives. A single separator would flatten three different instructions into one shape.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | Boolean | `false` |  |
| `groups` | Array | (required) | Array<{ label, rows: [{ keys: [...], joiner?: 'chord'\|'then'\|'or', label }] }>. |
| `title` | String | `'Keyboard shortcuts'` |  |
| `platformNote` | String | `'⌘ is Ctrl and ⌥ is Alt on Windows.'` | Redline "Platform · stated in the footer". |
| `printLabel` | String | `'Print this sheet'` |  |
| `closeLabel` | String | `'Close'` |  |

**Emits:** `update:modelValue`, `print`

## Stepper

### Stepper

Redline "Stepper · 28px nodes · 2px connector · horizontal ≤4, vertical 5+". Three variants, one rule the redline states outright: a step is only clickable once it has been reached. `done` and `current` render as buttons; `upcoming` is plain text, so there is no forward jump past validation to disable after the fact.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `steps` | Array | (required) | Array<{ key, label, sublabel?, state: 'done'\|'current'\|'upcoming'\|'error' }>. Vertical steps may also carry `chip: { tone, label, dot }`. |
| `variant` | String | `'horizontal'` |  |
| `label` | String | (required) | Accessible name for the list — never drawn (§8.1). |
| `title` | String | `''` | Compact only: the line above the meter. |
| `note` | String | `''` | Compact only: the note under the segments. |

**Emits:** `select`

**Slots:** `chip`

## Surfaces

### Card

The system's surface: white, 14px radius, hairline border, and the one shadow the elevation scale allows. Compose it with CardHeader, CardBody and CardFooter.

**Slots:** `default`

### CardBody

A card's content region, at the body grey and the card's own 24px gutter.

**Slots:** `default`

### CardFooter

A card's action row. `spread` pushes the primary action to the far edge; `narrow` tightens the gutter for dense cards.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `narrow` | Boolean | `false` | The 20px gutter Appendix C allows for "cards under ~360px". |
| `spread` | Boolean | `false` | Push the first child left and the rest right, for a footer that pairs a caption with its action. The default keeps every child right-aligned, which is what a row of buttons wants. |

**Slots:** `default`

### CardHeader

A card's title block, with an optional subtitle and a slot for actions that belong to the whole card.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | String | (required) |  |
| `subtitle` | String | `''` |  |
| `narrow` | Boolean | `false` | The gutter Appendix C allows for "cards under ~360px": 20px sides and a tighter 15px title, which is what the Containers demo's 300px grid cell renders. The default is the full-width card header the redline gives as `pad 20px 24px 4px · title 17px / 700`. |

**Slots:** `actions`

### DividedCard

Facts split by internal rules rather than by nested cards — the "no nesting" rule Appendix D states for this pattern in so many words. Cells are ruled with `--divider` on the inside edges only; the card's own border closes the outside, so no cell draws a rule that would double it.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cells` | Array | (required) | Array<{ label, value, mono? }>, in reading order. |
| `columns` | Number | `2` | Cells per row. |

### Meter

A labelled progress bar with an optional caption. role=progressbar, so the value is available without reading the pixels.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | Number | (required) |  |
| `max` | Number | `100` |  |
| `label` | String | (required) |  |
| `caption` | String | `''` | Redline "Meter caption" — 12px/400, value at 700 weight, 7px above. |

### StatCard

A single figure with its label and hint. `urgent` and `dot` mark a number that needs attention; `muted` retires one that does not.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | String | (required) |  |
| `value` | String | (required) |  |
| `hint` | String | `''` |  |
| `muted` | Boolean | `false` |  |
| `dot` | String | `''` | Redline "Label" — an optional status dot, 8px, gap 7px. |
| `urgent` | Boolean | `false` | Redline "Hint" — urgent variant renders at 700 weight. |
| `selected` | Boolean | `false` | Redline "Card selected" — green border + ring shadow. |

## Tabs

### SegmentedTabs

The segmented control used to narrow what is already on screen. Radiogroup semantics — this filters a view, it does not swap one.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | Array | (required) | The options to choose between, in display order. |
| `modelValue` | String | (required) | The selected option. |
| `label` | String | (required) | Names the group for assistive technology. NOT rendered on screen — a segmented control sits under a heading that already says what it filters. |

**Emits:** `update:modelValue`

### StageTabs

The pipeline stage cards. Each carries its count and what is waiting, and only a genuinely urgent stage is red.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `stages` | Array | (required) | Stages: `{ key, step, label, count, hint, urgent?, muted? }`. |
| `modelValue` | String | (required) | The active stage's key. |

**Emits:** `update:modelValue`

**Slots:** `default`

### Tabs

Underline tabs that swap what the panel shows. Counts ride inside the tab so the label does not shift when a number changes.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tabs` | Array | (required) | Tabs to render: `{ key, label, count? }`. |
| `modelValue` | String | (required) | The active tab's key. |

**Emits:** `update:modelValue`

**Slots:** `default`
