# Design System Implementation — Design Spec

**Date:** 2026-08-29
**Source:** Claude Design canvas artifact `b6eec549-cf5c-4c8b-8968-d5ed790304b1` ("Facility details design improvements") — 16 sections, self-described as "the source of truth"
**Target:** `frontend-template` — Vue 3.5, Vite 8, Tailwind v4, Pinia, unplugin-vue-router, vite-plugin-vue-layouts-next

## 1. Goal

Port the complete design system into this template as the durable foundation that every project built from the template inherits. The system is the part that survives per-project churn, so it lives behind one boundary and is consumed through one import.

The source document's own governing rule drives the architecture: **build against the CSS variables, never raw hex**, and **dark mode is a palette swap — geometry never changes between themes**. Both are enforced mechanically (§13), not by convention.

## 2. Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Scope | Full port, all 16 sections | Requested. Nothing deferred. |
| 2 | Naming | Neutral file names, CSS vars verbatim, unprefixed components | Every redline in the source doc transfers 1:1 with no translation. The vars were already generic (`--surface`, `--ink-900`); only file names carried the old project name. |
| 3 | Tailwind relationship | `@theme inline` bridge | Utilities resolve *through* the vars, so a theme swap needs no `dark:` variant anywhere — matches the doc's stated architecture. |
| 4 | Primitive library | Ark UI (`@ark-ui/vue` 5.39.1) | Covers four components a Radix-style library does not: `FileUpload`, `Steps`, `SegmentGroup`, `PasswordInput`. Zag.js state machines underneath. Verified present in the published package. |
| 5 | Table logic | TanStack Table (`@tanstack/vue-table` 9.2.4) | No primitive library does tables. TanStack is pure logic with zero DOM, so the doc's exact markup is preserved. |
| 6 | Redlines are the authority | Appendix C, 310 rows | Phase 2 components were built from this spec's prose summary rather than the source document's per-component redlines, and drifted. Appendix C captures every literal value; components are built and reviewed against it, not against §7's inventory. |
| 7 | Missing colours | Added to `tokens.css` and Appendix A | The source document uses 23 colours its own token block never defines (notice borders, toast borders, dashed panels, disabled surfaces, shell greys). Extending `tokens.css` was chosen over a second file or raw hex. Appendix A marks each addition with the redline it came from, so the parity test stays strict rather than relaxed. |
| 8 | Chips row gap contradiction | Appendix C's 7px wins; `tokens.css` keeps `--gap-chip-row: 8px` untouched | Appendix C ("Gap in row · 7px") and the source's own verbatim token block (`--gap-chip-row: 8px`, reproduced byte-for-byte in `tokens.css` under a parity test) genuinely disagree — not drift, a contradiction in the source document itself. Decision 6 above states Appendix C wins where the two disagree, so `ChipGroup.vue` sets the row gap directly via a scoped style rather than the token. `tokens.css` stays byte-verbatim and `--gap-chip-row` remains defined but unused by `ChipGroup`; a future consumer of that token would need the same treatment. |

Rejected: **Reka UI** (excellent, but hand-rolling `FileInput`/`FileList` is the single largest hand-built component in the system); **Headless UI Vue** (stalled on 1.7.x while React moved to v2 — no Checkbox, no Toast, no Pagination); **PrimeVue unstyled** (pass-through API fights precise redlines).

## 3. Repo layout

The design system is self-contained so it can later be lifted into a package without untangling imports. `src/components/` stays for app-specific composites each project builds on top.

```
src/design-system/
  index.js                    barrel export — the only public import path
  styles/
    fonts.css                 @fontsource imports, weights 400/500/700
    tokens.css                :root  — verbatim, Appendix A
    tokens.dark.css           [data-theme="dark"] — verbatim, Appendix B
    theme.css                 @theme inline bridge → Tailwind namespaces
    base.css                  body/a/input resets + spin & toastTimer keyframes
  components/                 ~35 SFCs, grouped by §7 family
    surfaces/  forms/  selects/  selection/  tabs/
    overlays/  files/  feedback/  data/  shell/
  demo/                       kitchen-sink sections (§12)
  composables/
    useTheme.js               data-theme swap, VueUse-backed
    useToast.js               queue + auto-dismiss, Pinia-backed
```

Grouping is invisible to consumers — `index.js` re-exports every component flat, so app code always writes `import { Button, TextField } from '@/design-system'` regardless of which family folder a component lives in.

### 3.1 The app boundary

`src/components/` holds components for **one app**; `src/design-system/components/` holds components that could ship in **any** project built from this template. The test is whether the component knows anything about a business domain:

| `src/components/` (app) | `design-system/components/` |
|---|---|
| `LicenceStatusChip` — maps `expiring` → amber | `Chip` — takes a `tone` prop |
| `FacilitySearchBar` — wired to facility filters | `SearchField`, `InlineFilter` |
| `FacilityTable` — your columns and API shape | `DataTable` — takes columns and rows |

A domain component is typically a thin wrapper that encodes a policy decision (*"expiring licences are amber"*), which has no place in a reusable template.

**Dependency direction is one-way and enforced by test (§13):** app components may import design-system components freely; design-system components must never import from `src/components/`. Violating it makes the system un-liftable — you could not extract it into a package without dragging one app's domain concepts along.

The template ships `src/components/` empty apart from a `README.md` stating this rule.

`src/assets/main.css` becomes an ordered import manifest:

```css
@import './design-system/styles/fonts.css';
@import 'tailwindcss';
@import './design-system/styles/tokens.css';
@import './design-system/styles/tokens.dark.css';
@import './design-system/styles/theme.css';
@import './design-system/styles/base.css';
```

Order matters: tokens must be defined before `theme.css` bridges them, and `base.css` last so its element rules win over Tailwind preflight.

## 4. Token layer

`tokens.css` and `tokens.dark.css` are **verbatim pastes** from the source document (Appendices A and B). They are never hand-edited to "fit" Tailwind — the bridge adapts to them, not the reverse. 50 light tokens, 49 dark overrides.

`theme.css` maps them into Tailwind v4 namespaces using `@theme inline`, which inlines the `var()` reference into generated utilities rather than snapshotting the value — this is what makes a theme swap work without `dark:` variants:

```css
@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-sunken: var(--surface-sunken);
  --color-ink-900: var(--ink-900);
  --color-green-fill: var(--green-fill);
  --radius-field: var(--r-field);       /* → rounded-field  */
  --radius-card: var(--r-card);         /* → rounded-card   */
  --spacing-field: var(--h-field);      /* → h-field = 38px */
  --shadow-card: var(--sh-card);        /* → shadow-card    */
}
```

### 4.1 Namespace collision — `--font-sans` / `--font-mono`

These two names exist in **both** the source `:root` and Tailwind's own theme namespace. Bridging them would emit `--font-sans: var(--font-sans)` — circular, and it fails silently with no build error.

**Resolution:** for these two names only, the `@theme` block owns the literal stack and `tokens.css` does **not** redeclare them. Every other token is collision-free by construction: `--green-fill` → `--color-green-fill`, `--r-field` → `--radius-field`, `--sh-card` → `--shadow-card`, `--h-field` → `--spacing-field`.

### 4.2 Tokens with no Tailwind namespace

`--z-header`, `--z-popover`, `--z-dialog`, `--t-fast`, `--t-control`, `--t-rail`, `--grad-primary`, `--grad-meter`, `--ring-focus`, `--ring-select`, `--scrim`, `--chip-pad` have no utility namespace. They are consumed as `var()` directly inside component `<style>` blocks. This is expected, not a workaround.

## 5. Theming

The template currently uses class-based dark mode (`.dark` on `<html>`, via VueUse `useDark`), but the design system is authored against `[data-theme="dark"]`. The system's selector wins, so the doc's dark block pastes in unmodified:

```js
useDark({ selector: 'html', attribute: 'data-theme', valueDark: 'dark', valueLight: 'light' })
```

`main.css`'s existing custom variant re-aims at the same selector so any `dark:` utility already in app code keeps working:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

**Invariant:** no file under `design-system/components/` may contain a `dark:` variant or a raw hex value. Dark mode is one file. Enforced by test (§13).

## 6. Fonts

Self-hosted via `@fontsource-variable/dm-sans` and `@fontsource/jetbrains-mono`, imported in `fonts.css`. No third-party network requests at runtime — appropriate for a government deployment target and for offline/air-gapped environments.

Weights required by the type scale: 400 (body), 500 (labels, mono), 700 (anything that titles something).

### Type scale

The source document states the scale as literal values and never tokenised it, so `tokens.css` has no size tokens. Rather than relax the verbatim-tokens constraint, the scale is defined in `theme.css` under Tailwind's `--text-*` namespace — the same layer that already owns `--font-sans`/`--font-mono` as literals and renames `--r-field` → `--radius-field`. `tokens.css` is not touched.

Tailwind v4 carries line-height, letter-spacing and weight on the same name (`--text-body--line-height`), so one utility sets all of a style's properties:

| Utility | Size | Weight | Extra |
|---|---|---|---|
| `text-page-title` | 26px | 700 | tracking -0.015em |
| `text-card-figure` | 23px | 700 | tracking -0.01em |
| `text-section-title` | 17px | 700 | — |
| `text-row-title` | 14px | 700 | — |
| `text-body` | 13.5px | 400 | leading 1.55 |
| `text-field-label` | 12.5px | 500 | — |
| `text-hint` | 12px | 400 | — |
| `text-column-header` | 10.5px | 700 | tracking 0.08em |
| `text-mono` | 12.5px | 500 | — |

Named `text-hint`, not `text-meta` as the source document's row label reads: `tokens.css` already defines a *colour* token `--text-meta`, bridged to `--color-text-meta`. A type-scale utility of the same name would give the confusing pair `text-meta` (size) and `text-text-meta` (colour), so the size utility is renamed to `text-hint` — see the rationale comment in `theme.css`.

`--text-*` cannot carry `font-family`, so the Mono style is the only two-class case: `text-mono font-mono`. Components must never write an arbitrary size (`text-[13.5px]`) — a review point, since no static guard can distinguish a correct 13.5px from a typo'd 13px.

## 7. Component inventory

All names verified present in `@ark-ui/vue@5.39.1`.

| Group | Components | Backing |
|---|---|---|
| Surfaces | `Card` + `CardHeader`/`CardBody`/`CardFooter`, `StatCard`, `Meter` | hand / Ark `progress` |
| Chips | `Chip`, `ChipGroup`, `DismissibleChip` | hand |
| Buttons | `Button` — primary / secondary / destructive / ghost, 3 sizes, busy state | hand |
| Fields | `TextField`, `Textarea`, `SearchField` | hand + Ark `field` |
| | `PasswordField` | Ark `password-input` |
| Selects | `Select`, `MultiSelect` (inline filter + sticky footer), `InlineFilter` | Ark `select` / `combobox` |
| | `RowMenu` (destructive item last, hairline-separated) | Ark `menu` |
| Selection | `Checkbox` (incl. indeterminate), `Radio`, `Switch` | Ark `checkbox` / `radio-group` / `switch` |
| | `CheckboxCard`, `RadioCard` | Ark, card-styled |
| Tabs | `Tabs` (underline) | Ark `tabs` |
| | `SegmentedTabs` | Ark `segment-group` |
| | `StageTabs` (numbered workflow, counts, one urgent tone) | Ark `steps` |
| Overlays | `Dialog` (confirmation, names the consequence) | Ark `dialog` |
| | `Toast`, `ToastRegion` | Ark `toast` |
| Files | `FileInput` (dropzone + compact), `FileList` (uploading/done/failed) | Ark `file-upload` |
| Feedback | `Notice`, `EmptyState`, `Skeleton` | hand |
| Data | `DataTable`, `BulkActionBar` | TanStack (§9) |
| | `Pagination` | Ark `pagination` |
| Shell | `AppShell`, `AppSidebar` (244px / 62px collapsed), `AppHeader` (sticky, z 6) | hand |

## 8. Component API conventions

- **Props, not class overrides.** `variant`, `tone` (`neutral | green | amber | red | blue | violet`), `size` (`default` 38px / `compact` 34px / `touch` 44px).
- **`v-model`** on every input component; emit `update:modelValue`.
- **Geometry is theme-invariant.** If a size differs between light and dark, that is a bug.
- **One filled green button per screen region** — documented in the component's JSDoc, not enforced.
- Components forward attrs and expose their root element.
- No component hardcodes a hex value.

### 8.1 What `label` means

**`label` is the short text that names the thing. How it is presented is the component's business.**

This looked like three inconsistent meanings across the built components; it is one meaning with
three presentations:

| Component | `label` names | Presented as |
|---|---|---|
| `TextField`, `Textarea` | the input | a visible `<label>` |
| `SearchField`, `Meter` | the control | `aria-label`, invisible by design |
| `Notice` | the notice's kind | the tone pill |
| `StatCard` | the figure | the caption above it |

Every component whose `label` is **not** visible must say so in its JSDoc, so a consumer knows
without reading the template. Phase 3's ~20 components follow this rule rather than inventing
`name`, `title`, `caption` or `kind` variants.

`Notice.label` in particular keeps its name because the source document's own redline row is
called "Notice label" — diverging from the source's vocabulary to chase a consistency that
already exists would be the wrong trade.

## 18. Accessibility baseline

**This design system targets WCAG 2.1 Level AA.**

The source document is meticulous about accessibility: it cites contrast ratios on nearly every
colour and explicitly rejects `#667085` (4.39:1) and `#A16207` (4.45:1) as failing AA. It was
written by someone tracking WCAG closely — and it still specifies a 17px dismiss target and a 20px
clear button. Those are considered decisions made against 2.1, not oversights, and overriding them
would break the exact-mirror requirement.

### 18.1 Known gap against WCAG 2.2

Two controls fail **SC 2.5.8 Target Size (Minimum)**, which requires 24×24 CSS px at Level AA in
WCAG 2.2:

| Control | Size | Redline |
|---|---|---|
| `DismissibleChip`'s remove button | 17px | Chips · "Dismiss × · 17px circle" |
| `SearchField`'s clear button | 20px | — |

The **Spacing** exception is unlikely to rescue the dismiss button: chips sit 7–8px apart, so a
24px circle centred on one remove target would overlap its neighbour. No **Equivalent** control
exists — the chip body is not clickable.

If this project adopts 2.2, the remediation is localised to those two components — but the source
document would need updating too, since 17px is its own specification. That is a design decision
for the document's author, not a unilateral fix.

## 9. DataTable architecture

`@tanstack/vue-table@9.2.4` — note this is the **v9 API**, which differs from v8: `useTable` (not `useVueTable`), explicit feature opt-in (no `getCoreRowModel()` calls), and reactivity backed by `@tanstack/store` atoms.

```js
import { useTable, FlexRender } from '@tanstack/vue-table'
import {
  coreRowModelsFeature, rowSortingFeature, rowSelectionFeature,
  rowPaginationFeature, columnVisibilityFeature, columnFilteringFeature,
} from '@tanstack/table-core'

const features = {
  ...coreRowModelsFeature,
  ...rowSortingFeature,
  ...rowSelectionFeature,
  ...rowPaginationFeature,
  ...columnVisibilityFeature,
  ...columnFilteringFeature,
}

const table = useTable({ features, columns, data })
```

`DataTable` owns markup only — column header (10.5px/700/0.08em), row hover `--row-hover`, row rules `--divider-row`. Sorting, selection, indeterminate parent state, pagination and column visibility come from the table instance. `BulkActionBar` reads `rowSelectionFeature` state and renders the header checkbox's tri-state glyph.

Reactive reads use `table.Subscribe` or `computed()` around `table.atoms.<slice>.get()` so Vue tracks only the atoms actually read.

## 10. Toast architecture

Pinia store holds the queue (`useToastStore`); `<ToastRegion>` renders Ark `toast` roots. Bottom-right, newest on top, 5s auto-dismiss with the `toastTimer` keyframe as the progress rail. Toasts confirm something that just happened and leave; `Notice` is the persistent in-flow counterpart and never floats.

## 11. App shell

`layouts/default.vue` is rewired to `AppShell`: 244px sidebar collapsing to 62px on `--t-rail` (160ms ease), sticky header at `--z-header`, content on `--canvas`, cards `--gap-section` (22px) apart at max-width 1320/1560px.

## 12. Verification surface

A `/design-system` route reproducing every section of the source canvas — **15**, enumerated in Appendix D. (An earlier draft of this section said 16; Appendix D is the count.) This is the acceptance test — checked side-by-side against the artifact in **both** themes. Each phase appends its own sections, so the page grows with the system.

The route is a single `src/pages/design-system.vue`; its section components live in `src/design-system/demo/`, **not** under `src/pages/`. Anything under `pages/` becomes a route with the file-based router, so a `sections/` subfolder there would silently generate a dozen junk routes. Keeping the demo beside the system also means both lift out together. The existing indigo/gray demo styling in `src/pages/index.vue` and `src/pages/about.vue` is replaced with token-based markup, since it currently contradicts the system.

**Assumption:** the kitchen sink uses neutral placeholder content, not the source document's domain-specific facility names, licence numbers, or office footer. Reversible if the real samples are wanted.

**Fourth gate:** `npm run test:e2e` runs a Playwright suite (`e2e/`) against the built page in a real Chromium layout, checked once per section rather than per edit because each run does a full production build. It exists because jsdom computes no layout, and three defects reached this branch that only a human eye on the rendered page caught: the stat block rendering flush to the card edge instead of inset by `px-card-x`, StageTabs' five cards collapsing into a vertical stack instead of one row at the page's real column width, and MultiSelect's panel sizing to its longest option instead of its trigger's width. Every assertion in the suite must wait on a locator (`toHaveCount`, `boundingBox`, `toBeVisible`, or equivalent) before reading the DOM, because `page.goto` resolves on the `load` event -- which on a warm cache can fire before Vue finishes mounting -- and neither `page.evaluate` nor `locator.count()` auto-wait the way those do; skipping that wait lets a guard pass while checking nothing.

## 13. Testing

| Test | Asserts |
|---|---|
| Token parity | Parse both token files; the dark file overrides a known subset and introduces no orphan names |
| Raw-hex guard | No file under `design-system/components/` contains a hex literal |
| Dark-variant guard | No file under `design-system/components/` contains a `dark:` variant |
| Bridge integrity | Every `@theme inline` mapping points at a var that exists in `tokens.css`, and every token is bridged or explicitly allowlisted as unbridged |
| Import direction | No file under `src/design-system/` imports from `src/components/` (§3.1) |
| Behavior | Select keyboard nav; Dialog focus trap + restore; toast auto-dismiss at 5s; checkbox indeterminate; bulk-select tri-state |

The first five are cheap static checks and are the mechanical enforcement of §1's and §3.1's governing rules.

`src/design-system/demo/` is deliberately **not** covered by the raw-hex guard: the swatch tables legitimately display values like `#177236` as visible text. Demo markup is a manual review point instead.

## 14. Sequencing

1. **Foundations** — fonts, tokens, `@theme` bridge, `data-theme` swap, base resets, the four guard tests. Nothing visual ships until the guards are green.
2. **Primitives** — Button, Chip, TextField, Textarea, SearchField, Card family, Notice, Skeleton, StatCard, Meter.
3. **Ark-backed** — Select, MultiSelect, InlineFilter, RowMenu, Checkbox/Radio/Switch (+ card variants), Tabs/SegmentedTabs/StageTabs, PasswordField, Dialog, Toast + ToastRegion, Pagination, FileInput/FileList.
4. **Composites** — DataTable, BulkActionBar, EmptyState, AppShell/AppSidebar/AppHeader.
5. **Documentation** — `/design-system` kitchen sink, demo-page rewrite, README section on consuming the system.

## 15. Risks

| Risk | Mitigation |
|---|---|
| `@theme inline` self-reference on `--font-sans`/`--font-mono` fails silently | §4.1; bridge-integrity test |
| TanStack v9 API is recent; examples online are mostly v8 | API surface verified directly against the published package, not recalled |
| Ark's rendered DOM may not match a redline exactly | `asChild` where the DOM must be ours; deviations recorded in the component's JSDoc |
| Ark 5.x ships frequently | Pin exact versions; upgrades are deliberate |
| Kitchen sink drifts from the source canvas | It is the acceptance test; reviewed in both themes at each phase boundary |

## 16. Out of scope

Backend integration, form validation library, i18n, and any application screen. The template ships the system and a kitchen sink demonstrating it — not a working application.

---

## 17. Demo page architecture

**The `/design-system` page mirrors the source artifact's page structure exactly.** Same sections in
the same order, same headings, same descriptions, same labelled sub-blocks, same rule-card footers,
same sample content. The point is comparison: with an identical layout and identical words, any
visual difference is a real defect rather than something to interpret. This is what made the last
round of drift expensive to spot — our page and the artifact's shared no structure, so every
comparison was an act of translation.

Appendix D is the content authority for this page, the way Appendix C is for component values.

### 17.1 Chrome

Six demo-only components under `src/design-system/demo/chrome/`. They are not part of the design
system and are never exported from the barrel — they are the page's furniture.

| Component | Redlined values |
|---|---|
| `DemoCard` | radius 14, 1px hairline, `--sh-card`; header pad `20px 24px 4px`; title 17/700; description 13.5/400 in `--text-meta` |
| `DemoBlocks` | `repeat(auto-fit, minmax(268px, 1fr))`, gap 24px, pad `18px 24px 6px` |
| `DemoBlock` | label 10.5/700/0.08em in `--text-header`, `margin-bottom 4px`; note 12.5/1.5 in `--text-meta`, `margin-bottom 10px` |
| `DemoStrip` | `border-top 1px --divider`, `background --surface-sunken`, pad `18px 24px 22px` |
| `DemoRules` | `border-top 1px --divider`; grid `repeat(auto-fit, minmax(240px, 1fr))`; each card pad `16px 24px`, `border-right 1px --divider`, `margin-right -1px`; title 13/700; body 12.5/1.5 in `--text-meta` |
| `DemoGap` | the not-built marker — dashed `--border-dashed` at 1.6px, radius 10-12, naming the missing component and the Appendix C group that governs it |

Two type entries this needs and the scale lacks: `--text-note` (12.5px, line-height 1.5, weight 400)
for sub-block notes and rule bodies, and the rule-card title at 13/700, which `text-notice font-bold`
already covers.

### 17.2 Gaps are visible, not implied

Every sub-block the artifact shows exists on our page from the start. Where the component behind it
is not built, the slot renders a `DemoGap` naming what is missing. The page is therefore a live
checklist: open it and every remaining gap is visible, in place, at roughly the right size.

A manifest lists which sections are complete. A test asserts that a section marked complete contains
zero `DemoGap`s, so a section cannot be declared done while a slot is still empty.

### 17.3 Confirmed conformance gaps in built components

Found while extracting the page structure; each is scheduled into the phase that touches its section:

- **2026-08-30 — `MultiSelect`'s filter input and footer buttons are children of `role="listbox"`.**
  Zag's `getContentProps()` sets `role: "listbox"` when `composite` (the default, verified against
  the installed `@zag-js/select` source), and ARIA 1.2 allows only `option`/`group` as listbox
  children. This is the structural cost of putting the redlined filter and footer inside the panel.
  Recorded as a known limitation, not scheduled for a fix: `composite: false` (role `dialog`) is the
  escape hatch if screen-reader testing shows a real problem.
- **2026-08-31 — "aria-checked=mixed" is expressed as an IDL property, not an attribute.**
  Appendix C's *Keyboard & focus* group says `Bulk select | header checkbox is aria-checked=mixed
  when partial`. Ark's checkbox exposes semantics through a hidden native `<input
  type="checkbox">` and never emits an `aria-checked` attribute anywhere — the mixed state lives
  on that input's `indeterminate` IDL property, which is how native checkboxes convey it and what
  assistive technology reads. The same applies to `Switch`: `role` appears nowhere in
  `@zag-js/switch`, whose hidden input is a plain checkbox with `defaultChecked`.
  Recorded as wording, not a gap: the requirement — a partial selection must announce as mixed —
  **is** met, and tests assert `input.element.indeterminate`. A future reader should not "fix"
  this by adding an `aria-checked` attribute onto a native input, which would conflict with its
  implicit state rather than clarify it.

- **2026-08-31 — the `Counts` ARIA row is deliberately unimplemented on `Tabs` and `StageTabs`.**
  Appendix C's *ARIA & semantics* group specifies `Counts | badge text needs context:
  aria-label='10 applications for checking'`. Both components carried exactly that and it was
  **removed**, because the badge sits inside the element carrying `role="tab"`: when a browser
  computes a name from content, a child with its own `aria-label` contributes that label instead
  of its text, so each tab announced its own label twice — `"Active LTOs 211 Active LTOs"` and
  `"Review 2 Review 2 returned"`. The redline row is written for a badge that stands alone; inside
  a tab the surrounding label already supplies the context it asks for. The bare number is
  therefore the correct contribution, and `StageTabs`' decorative step marker carries
  `aria-hidden="true"` for the same reason.
  Recorded as a deliberate deviation, not a gap: the row still stands for any future standalone
  count badge (a sidebar nav item, a filter pill), and only the nested-inside-a-tab case is
  exempt. Do not "restore" the labels — that reintroduces the defect. See the comments at
  `Tabs.vue`'s count span and `StageTabs.vue`'s figure span, which state this at the call site.

- **2026-08-31 — a disabled-and-chosen radio card has no governing row.** Appendix C's Selection
  controls group gives cards exactly two states, `Card` and `Card selected` — neither is a disabled
  variant, so a disabled-and-chosen option (the selected green surface wrapped around a greyed-out
  control) is unreachable in the shipped demo: no `RADIO CARDS · SINGLE` option is both disabled and
  chosen. `RadioCard.vue`'s `cardClass` has only the two redlined branches for exactly this reason —
  Appendix C does not specify a third.

- **2026-08-31 — `Selected row` governs the selected state only.** Appendix C's Selection controls
  group has one row, `Selected row | #F7FCF9 bg · 1px top #F5F7FA`, covering both the background and
  the top rule together, with no separate row for an idle one. `BulkActionBar.vue` therefore gives an
  unselected row neither class rather than a guessed one — nothing is ever left to compete with the
  selected branch for the same property.

- **2026-08-31 — two Selection controls values are inferred, not redlined.** `Radio`'s **unchosen**
  control border reuses the `Checkbox off` row's exact hex (`Checkbox off | #FFF fill · 1.8px
  #C3CAD6`), and its **chosen** border reuses the fill green `#177236` from `Checkbox on` —
  Appendix C's own `Radio` row specifies only the inner dot's colour, not the control's border in
  either state. `RadioCard`'s "Selected" marker typography (12px at weight 700, in the green text
  colour — the `--text-hint` step, not `Label`'s 13.5px/400) is likewise an inference: Appendix D.1
  records that the chosen card carries a "Selected" marker at all, not what type styles it, and no
  Type scale row covers it either.

## Appendix A — `tokens.css`

```css
:root {
  /* type */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --w-regular: 400; --w-medium: 500; --w-bold: 700;

  /* brand green */
  --green-900: #14532D;
  --green-fill: #177236;        /* white text on it = 6.01:1 — buttons, active nav, filled chips */
  --green-fill-hover: #125A2B;  /* 8.35:1 */
  --green-600: #1D8F42;         /* 4.15:1 with white — borders, dots, meters only, never white text */
  --green-500: #25A94E;  --green-text: #15803D; --green-100: #E8F6EC;
  --green-on-fill: #FFFFFF;     /* label colour on --green-fill (dark theme flips it to #0B1017) */
  --green-50:  #ECFDF3;  --green-tint: #F2FAF4; --green-tint-2: #F7FCF9;

  /* neutrals */
  /* text greys — AA on #FFF: 900 = 15.37:1, 700 = 10.46:1, 600 = 7.69:1, 500 = 4.97:1 */
  --ink-900: #1E2532; --ink-700: #344054; --ink-600: #475467; --ink-500: #667085;
  --text-header: #5A6577;  /* 5.89:1 on #FFF · 5.21:1 on canvas — column headers AND any text on a tinted surface */
  --text-meta: #667085;    /* 4.97:1 on #FFF only — hints and captions INSIDE white cards */
  --placeholder: #667085;  /* 4.97:1 — placeholder text is in scope for 1.4.3 */
  /* decorative only — below 4.5:1, never for readable text */
  --ink-400: #8A94A6; /* 3.06:1 — icon strokes, dot fills */
  --ink-300: #98A2B3; /* 2.58:1 — carets, ⋯ glyphs, decorative marks */
  --ink-200: #B9C1D1; /* 1.81:1 — disabled text (1.4.3 exempt) */
  --ink-100: #C3CAD6; /* 1.66:1 — em-dash placeholders in tables */
  --border-field: #D5DBE6; --border-card: #E4E8EF; --border-soft: #DDE2EA;
  --divider: #EEF1F6; --divider-row: #F5F7FA;
  --surface: #FFFFFF; --surface-sunken: #FAFBFD; --surface-input: #F7F9FC;
  --surface-muted: #F4F6FA; --canvas: #EEF1F6;
  --surface-card-muted: #FBFCFE; /* closed / archived card */
  --row-hover: #FAFBFD;          /* table row hover */
  --neutral-100: #EEF1F6;        /* neutral chip tint */

  /* status tones */
  --amber-text: #8A5206;  /* 5.77:1 on #FEF2E0 — the only amber for text */
  --amber-400: #D9A13B;   /* dots only */ --amber-100: #FEF2E0; --amber-50: #FFFAEB;
  /* #A16207 is deprecated: 4.45:1 on #FEF2E0 — fails AA, do not use */
  --red-700: #B42318;   --red-500: #E5484D;   --red-100: #FEE2E2;   --red-50: #FEF3F2;
  --red-border: #F5CDC7; --red-border-btn: #E4A49C;
  --blue-700: #175CD3;  --blue-100: #EAF2FE;  --blue-50: #EFF8FF;
  --violet-700: #6941C6; --violet-100: #F0ECFE;

  /* radius */
  --r-pill: 999px; --r-notice: 16px; --r-card: 14px; --r-panel: 12px;
  --r-field: 9px;  --r-control: 8px; --r-tile: 7px;  --r-check: 5px;

  /* sizing */
  --h-touch: 44px; --h-field: 38px; --h-compact: 34px;
  --h-notice: 32px; --size-check: 17px; --rail-w: 244px; --rail-w-collapsed: 62px;
  /* chips are height:auto — padding 3px 9px on 11px type renders 20px */
  --chip-pad: 3px 9px;

  /* spacing */
  --pad-card-x: 24px; --gap-section: 22px; --gap-card: 12px;
  --gap-btn-row: 10px; --gap-chip-row: 8px; --gap-control: 10px;

  /* elevation */
  --sh-card: 0 1px 2px rgba(16,24,40,.04);
  --sh-primary: 0 1px 2px rgba(20,80,40,.25);
  --sh-toast: 0 8px 24px rgba(16,24,40,.12);
  --sh-panel: 0 12px 28px rgba(16,24,40,.14);
  --sh-dialog: 0 24px 60px rgba(16,24,40,.28);
  --ring-focus: 0 0 0 3px rgba(37,169,78,.15);
  --ring-select: 0 0 0 3px rgba(37,169,78,.12);
  --scrim: rgba(23,30,44,.42);

  /* gradients */
  --grad-primary: linear-gradient(180deg,#177236,#125A2B);
  --grad-meter: linear-gradient(90deg,#25A94E,#7BC96F);

  /* motion */
  --t-fast: 120ms; --t-control: 140ms; --t-rail: 160ms ease;

  /* z-index */
  --z-header: 6; --z-popover: 12; --z-dialog: 40;
}
```

### Appendix A.1 — additions beyond the source token block

The source document uses these colours in its component redlines and demo markup but never
tokenised them. They are appended to `tokens.css` after the verbatim block, each with the
redline that justifies it. Everything above this point in `tokens.css` remains byte-verbatim
from the source.

```css
/* --- additions: colours the source document uses but never tokenised --- */
:root {
  /* Notice borders — redline "Notice label · 1px tone/200" */
  --notice-border-green: #A6E7C3;
  --notice-border-blue:  #B2DDFF;
  --notice-border-amber: #F7D9A0;
  --notice-border-red:   #F9C4BE;

  /* Toast borders and fills — redline "Success/Error/Warning/Info tone" */
  --toast-border-green: #CDEAD6;
  --toast-border-amber: #F2E0BD;
  --toast-border-blue:  #D5E4FA;
  --toast-bg-amber:     #FFFBF2;
  --toast-bg-blue:      #F5F9FF;
  /* toast error border is #F5CDC7 — already tokenised as --red-border */

  /* Status dot — redline "Success tone · dot #17A34A"; also the Active status dot.
     Never used behind white text: the redline warns it is 3.29:1. */
  --dot-green: #17A34A;

  /* Dashed panel — redline "Dashed panel · 1.6px dashed #CDD5E2" (dropzones, empty states) */
  --border-dashed: #CDD5E2;

  /* Dropzone hover fill — redline "Dropzone hover · border #25A94E · bg #F7FCF8".
     Note this is ONE DIGIT off --green-tint-2 (#F7FCF9) and is very likely a typo in the
     source document. Kept literal to match the source exactly; revisit if it ever matters. */
  --dropzone-hover: #F7FCF8;

  /* Selection controls — redline "Disabled · #E9EDF3" (checkbox/radio disabled fill) */
  --surface-disabled: #E9EDF3;

  /* Destructive confirm hover — redline "Confirm button · #B42318 → hover #96190F" */
  --red-800: #96190F;

  /* Label colour on --red-700, mirroring --green-on-fill. Its own token
     rather than a reuse of the green one: the dark theme flips the green
     fill's foreground, and there is no reason the red must follow it. */
  --red-on-fill: #FFFFFF;

  /* Link hover — the source's base CSS uses a:hover { color: #166534 }.
     Phase 1 substituted --green-900; this is the real value. */
  --green-link-hover: #166534;

  /* App shell — redlines "Nav item", "Item mark", "Avatar", "Logo tile", "Breadcrumb" */
  --nav-ink:      #4B5565;
  --item-mark:    #B3BDCD;
  --avatar-bg:    #DBE4F0;
  --logo-ink:     #D9F2C4;
  --separator:    #CBD3E0;
  --row-hover-strong: #E0E5EE;

  /* Radius — redlines "Skeleton bar · radius 6px" and "Stage number · radius 6px".
     6px sits between --r-check (5px) and --r-tile (7px) and had no token. */
  --r-bar: 6px;
}
```

Dark-mode counterparts (`--green-on-fill-red`, `--red-fill-hover`, for dark-mode destructive
buttons) are deferred to the phase that first consumes them. Nothing in the conformance pass
reads them yet, so they do not belong in `tokens.dark.css` until then — do not re-add them here.

## Appendix B — `tokens.dark.css`

```css
[data-theme="dark"] {
  /* surfaces — depth by lightness, not shadow */
  --canvas: #0F141C;            /* page */
  --surface: #161C26;           /* card */
  --surface-sunken: #1C242F;    /* header, footer, expanded row */
  --surface-input: #10161F;     /* field well */
  --surface-muted: #222B38;     /* control shell, icon tile */
  --surface-card-muted: #141A23;/* closed / archived card */
  --row-hover: #1A212B;
  --border-card: #2A3441;       /* hairline */
  --border-field: #384556;
  --divider: #222B38;  --divider-row: #222B38;

  /* text — ratios on --surface #161C26 */
  --ink-900: #E8ECF3;  /* 14.43:1 */
  --ink-700: #C3CCDA;  /* 10.56:1 */
  --ink-600: #C3CCDA;
  --ink-500: #9AA5B5;  /* 6.86:1 — hints, meta */
  --text-header: #9AA5B5;
  --text-meta: #9AA5B5;
  --placeholder: #9AA5B5;
  --ink-400: #6F7B8C;  /* 3.98:1 — decorative only */
  --ink-200: #55606F;  /* disabled text — 1.4.3 exempt */

  /* green — the fill carries DARK text on dark */
  --green-fill: #2FB25F;        /* #0B1017 on it = 6.95:1 (white would be 2.74:1) */
  --green-fill-hover: #3FC26E;
  --green-on-fill: #0B1017;     /* light mode uses #FFF here */
  --green-text: #6FDC96;        /* 10.06:1 on --surface */
  --green-100: rgba(47,178,95,.16);
  --green-50:  rgba(47,178,95,.14);   /* notice fill — matches the preview */
  --green-tint: rgba(47,178,95,.12);   /* selected option row */
  --green-tint-2: #1C242F;             /* selected card surface */
  --grad-primary: linear-gradient(180deg,#2FB25F,#249A4F);
  --grad-meter: linear-gradient(90deg,#2FB25F,#6FDC96);
  --ring-focus: 0 0 0 3px rgba(47,178,95,.18);
  --ring-select: 0 0 0 3px rgba(47,178,95,.14);

  /* status tones — tint = tone over surface, text = light tone */
  --amber-text: #F0C070; --amber-100: rgba(217,161,59,.18);
  --red-700: #FF9B95;    --red-100:   rgba(229,72,77,.18);
  --red-border: rgba(255,155,149,.45);
  --blue-700: #8FB8FF;   --blue-100:  rgba(23,92,211,.24);
  --violet-700: #C4B2FF; --violet-100: rgba(140,110,240,.22);
  --neutral-100: rgba(255,255,255,.07);
  --amber-50: rgba(217,161,59,.14);
  --red-50:   rgba(229,72,77,.16);
  --blue-50:  rgba(23,92,211,.16);
  --border-soft: #384556;              /* service chip, inline filter */
  --red-border-btn: rgba(255,155,149,.45);

  /* elevation — shadows go darker and stay for layers only */
  --sh-card: none;
  --sh-primary: none;
  --sh-toast:  0 8px 24px rgba(0,0,0,.50);
  --sh-panel:  0 12px 28px rgba(0,0,0,.45);
  --sh-dialog: 0 24px 60px rgba(0,0,0,.60);
  --scrim: rgba(4,7,12,.62);
}
```

---

## Appendix C — component redlines

**This appendix is the authority for every component's literal values.** It is extracted verbatim
from the source document's "Component specs" section — 310 rows across 19 groups, described there
as "Redlines for everything above — geometry, type, and the exact colour per state. Values are
literal CSS."

Phase 2 was built from §7's inventory and §8's conventions without these rows, and drifted. Any
component built or reviewed from here on is checked against the group below that covers it. Where
this appendix and the prose sections disagree, this appendix wins.

### Containers & surfaces

_canvas #EEF1F6 · card #FFF radius 14 · sunken #FAFBFD_

| Property | Value |
|---|---|
| Canvas | #EEF1F6 — page background; text on it uses #5A6577 |
| Card | #FFF · radius 14px · 1px #E4E8EF · shadow 0 1px 2px rgba(16,24,40,.04) |
| Card gutter | 24px x · 20px on cards under ~360px |
| Card header | pad 20px 24px 4px · title 17px / 700 · sub 13.5px / 400 #667085 |
| Card footer | #FAFBFD · 1px top #EEF1F6 · pad 13–16px 20–24px |
| Internal rule | 1px #EEF1F6 (rows use #F5F7FA) |
| Sunken strip | #FAFBFD — expanded rows, headers, footers |
| Input well | #F7F9FC — read-only fields, in-panel search |
| Control shell | #F4F6FA — segmented tabs, row hover in nav |
| Muted card | #FBFCFE — closed / archived stat cards |
| Dashed panel | 1.6px dashed #CDD5E2 · radius 10–12px — dropzones, empty states only |
| Selected surface | #F7FCF9 + 1px #25A94E + ring 0 0 0 3px rgba(37,169,78,.10–.12) |
| Popover panel | #FFF · radius 12px · pad 6px · shadow 0 12px 28px rgba(16,24,40,.14) |
| Dialog surface | #FFF · radius 14px · max-w 428px · shadow 0 24px 60px rgba(16,24,40,.28) |
| Section gap | 22px between cards · 12px in stat grids · 20px between sub-blocks |
| Content width | detail pages max-w 1320px · table pages 1560px · page pad 26px 32px, both |
| Nesting | cards never nest — divide or sink instead |
| Overflow | cards clip with overflow:hidden; popover parents need overflow:visible |

### Chips

_auto height (20px) · radius 999 · 11px/700 · tint + matching text_

| Property | Value |
|---|---|
| Height | auto — padding 3px 9px renders 20px at 11px type |
| Radius | 999px |
| Type | 11px / 700 / nowrap |
| Dot | 6px circle, gap 6px, left pad 7px |
| Gap in row | 7px |
| Approved | #E8F6EC bg · #15803D text |
| Active (filled) | #177236 bg · #FFFFFF text = 6.01:1 (never #17A34A — 3.29:1) |
| Pending | #FEF2E0 bg · #8A5206 text = 5.77:1 (#A16207 is 4.45:1 — fails) |
| Returned | #FEE2E2 bg · #B42318 text = 5.38:1 |
| Closed | #EEF1F6 bg · #5A6577 text = 5.21:1 (#667085 is 4.39:1 — fails) |
| Online | #EAF2FE bg · #175CD3 text |
| Add / Modify | #F0ECFE bg · #6941C6 text |
| Service chip | 12px/400 · 5px 12px · #FFF bg · 1px #DDE2EA · #475467 |
| Filter chip on | #177236 bg · #FFF text = 6.01:1 · 7px 13px · shadow 0 1px 2px rgba(20,80,40,.24) |
| Filter chip off | #FFF bg · 1px #D5DBE6 · #475467 / 500 |
| Dismiss × | 17px circle · #E4E8EF bg → #D5DBE6 hover · glyph #475467 (4.05:1 at #667085 fails) |

### Tabs

_underline 2.5px · segmented 3px inset · stage cards 12px radius_

| Property | Value |
|---|---|
| Underline pad | 14px 2px · row gap 22px |
| Underline type | 13.5px / 700 |
| Marker | 2.5px solid #177236 |
| Active text | #15803D |
| Idle tab text | #5A6577 (5.89:1) |
| Tab count | mono 11.5px/500 · pad 2px 7px · radius 9px |
| Count active | #E8F6EC bg · #15803D |
| Count idle | #F4F6FA bg · #5A6577 |
| Segmented shell | #F4F6FA · radius 9px · pad 3px · gap 6px |
| Segment on | #FFF · radius 7px · 12.5px/700 · shadow 0 1px 2px rgba(16,24,40,.08) |
| Segment off | transparent · #667085 / 500 |
| Stage card | radius 12px · pad 13px 15px 14px · 1px #E4E8EF |
| Stage active | 1px #25A94E + ring 0 0 0 3px rgba(37,169,78,.12) |
| Stage figure | 25px / 700 / -0.02em |
| Stage urgent | 11.5px / 700 · #B42318 |

### Text fields

_38px · radius 9 · 1px #D5DBE6 · green focus ring_

| Property | Value |
|---|---|
| Height | 38px · pad 0 12px |
| Radius | 9px |
| Border | 1px solid #D5DBE6 |
| Value type | 13.5px / 400 · #1E2532 |
| Placeholder | #667085 |
| Label | 12.5px / 500 · #344054 · 6px below |
| Hint | 12px / 400 · #667085 · 5px above |
| Focus | border #25A94E + 0 0 0 3px rgba(37,169,78,.15) |
| Error | border #B42318 · hint #B42318 |
| Read only | bg #F7F9FC · border #E4E8EF · text #8A94A6 |
| Leading icon | 12px ring · gap 8px |
| Trailing action | 11.5px / 700 · #667085 · pad 6px |
| Textarea | pad 11px 12px · line-height 1.55 · resize vertical |
| Mono values | JetBrains Mono 13.5px / 400 |

### Dropdowns

_38px trigger · panel radius 12 · option 9px 10px_

| Property | Value |
|---|---|
| Trigger | 38px · radius 9px · 1px #D5DBE6 · gap 8px |
| Open trigger | 1px #25A94E + ring rgba(37,169,78,.15) |
| Value | 13.5px / 500 · #1E2532 · ellipsis |
| Placeholder | 13.5px / 400 · #667085 |
| Caret | 9px ▾ · #98A2B3 (decorative) |
| Panel | top 44px · radius 12px · pad 6px · 1px #E4E8EF |
| Panel shadow | 0 12px 28px rgba(16,24,40,.14) |
| Panel max-h | 246px (214px with filter) |
| Option | pad 9px 10px · radius 8px · 13.5px / 400 |
| Option selected | #F2FAF4 bg · #15803D / 700 · ✓ 12px |
| Checkbox in list | 15px · radius 4px · #177236 when on (white ✓) |
| Panel filter | 32px field · #F7F9FC · radius 8px |
| Panel footer | #FAFBFD · 1px top #EEF1F6 · pad 9px 12px |
| Inline variant | 34px · radius 8px · 1px #DDE2EA · 12.5px / 700 |
| Menu item | 13.5px / 400 · destructive #B42318 / 700 last |

### Buttons

_38 / 34 / 44px · radius 9 (8 compact) · one filled green per region_

| Property | Value |
|---|---|
| Default | 38px · pad 0 16px · radius 9px · 13.5px / 700 |
| Compact | 34px · pad 0 14px · radius 8px · 12.5px |
| Icon only | 34×34px · radius 8px |
| Primary | #177236 bg · #FFF text = 6.01:1 · shadow 0 1px 2px rgba(20,80,40,.25) |
| Primary hover | #125A2B (8.35:1) |
| Secondary | #FFF bg · 1px #D5DBE6 · #344054 / 500 |
| Secondary hover | #F4F6FA |
| Destructive | #FFF bg · 1px #E4A49C · #B42318 · hover #FEF3F2 |
| Ghost | transparent · #15803D / 700 · hover #F2FAF4 |
| Disabled | #F7F9FC bg · 1px #E4E8EF · #B9C1D1 |
| Pending | #125A2B + 12px spinner, 2px track rgba(255,255,255,.4) |
| Row gap | 10px (8px in dialogs and cards) |

### File inputs

_dashed 1.6px dropzone · file row 10px radius_

| Property | Value |
|---|---|
| Dropzone | pad 16px · radius 10px · 1.6px dashed #CDD5E2 |
| Dropzone hover | border #25A94E · bg #F7FCF8 |
| Icon tile | 36×36px · radius 8px · #EEF1F6 · #667085 |
| Primary line | 13.5px / 700 |
| Constraint line | 12px / 400 · #667085 |
| Compact variant | 38px shell · Browse 28px · radius 7px |
| File row | pad 12px 14px · radius 10px · 1px #E4E8EF · gap 12px |
| Type mark | 34×34px · radius 8px · #EEF1F6 · #5A6577 10px / 700 |
| Progress track | 5px · radius 999px · #EEF1F6 |
| Progress fill | linear-gradient(90deg,#25A94E,#7BC96F) |
| Done note | 12px / 400 · #15803D |
| Failed row | #FEF3F2 bg · 1px #F5CDC7 · mark #FEE2E2/#B42318 |
| Remove | 26px · radius 7px · #667085 → #B42318 hover |

### Toasts & notices

_toast 12px radius, 5s timer · notice 32px pill_

| Property | Value |
|---|---|
| Toast width | 372px · stack gap 10px · bottom-right 16px |
| Toast shell | radius 12px · pad 13px 12px 15px 13px · #FFF |
| Toast shadow | 0 8px 24px rgba(16,24,40,.12) |
| Icon tile | 26×26px · radius 8px · #FFF glyph on the tone TEXT colour (#15803D / #B42318 / #8A5206 / #175CD3) — the lighter dot tones fail with white |
| Title / body | 13.5px / 700 · 12.5px / 400 #667085 |
| Timer bar | 3px · scaleX 1→0 over 5s · tone fill |
| Success tone | dot #17A34A · border #CDEAD6 · text/icon #15803D |
| Error tone | dot #E5484D · border #F5CDC7 · text/icon #B42318 |
| Warning tone | dot #D9A13B · border #F2E0BD · text/icon #8A5206 |
| Info tone | dot #175CD3 · border #D5E4FA · text/icon #175CD3 |
| Max stack | 3 toasts, newest first |
| Notice shell | min-h 32px · radius 16px · pad 4px 10px 4px 4px · gap 12px |
| Notice label | 24px · radius 16px · pad 0 12px · 12.5px / 400 · 1px tone/200 |
| Notice text | 13px / 400 in tone colour on tone/50 — all four ≥ 4.5:1 |
| Notice fills | #ECFDF3 · #EFF8FF · #FFFAEB · #FEF3F2 |

### Selection controls

_17px targets · gap 10px · cards radius 11_

| Property | Value |
|---|---|
| Checkbox | 17×17px · radius 5px · 1.8px border |
| Checkbox on | #177236 fill + border · ✓ 10px / 700 #FFF (6.01:1) |
| Checkbox off | #FFF fill · 1.8px #C3CAD6 |
| Indeterminate | same fill, glyph – (dash) |
| Disabled | #E9EDF3 fill · 1.8px #DDE2EA · glyph #B9C1D1 |
| Radio | 17×17px circle · 1.8px · inner dot 8px #177236 |
| Label | 13.5px / 400 · #344054 · gap 10px |
| Row gap | 11px (14px for switches) |
| Card | pad 13px 14px · radius 11px · 1px #E4E8EF · gap 11px |
| Card selected | 1px #25A94E · bg #F7FCF9 · ring rgba(37,169,78,.10) |
| Switch track | 38×22px · radius 999px · pad 2px |
| Track on / off | #177236 / #D5DBE6 · disabled #C3CAD6 |
| Knob | 18px circle #FFF · shadow 0 1px 2px rgba(16,24,40,.2) |
| Bulk bar | pad 11px 16px · #FAFBFD idle · #F2FAF4 active |
| Selected row | #F7FCF9 bg · 1px top #F5F7FA |

### Dialog, empty & loading

_dialog 428px · scrim 42% ink · skeleton 11px bars_

| Property | Value |
|---|---|
| Scrim | rgba(23,30,44,.42) · pad 24px |
| Dialog | max-w 428px · radius 14px · #FFF |
| Dialog shadow | 0 24px 60px rgba(16,24,40,.28) |
| Body pad | 22px 24px 18px |
| Icon tile | 30×30px · radius 9px · #FEF3F2 · 1px #F5CDC7 · #B42318 |
| Title / body | 16.5px / 700 · 13.5px / 400 line-height 1.55 |
| Footer | #FAFBFD · 1px top #EEF1F6 · pad 14px 24px · gap 8px |
| Confirm button | #B42318 → hover #96190F |
| Empty state | pad 30px 20px · 1px dashed #DDE2EA · radius 12px |
| Empty title | 14.5px / 700 · sub 13px #667085 |
| Skeleton bar | 11px · radius 6px · #EEF1F6 · 3 rows max |

### Layout primitives

_Row · Column · Grid · AutoGrid · Split · Cluster · Sidebar · Page_

| Property | Value |
|---|---|
| Rule | primitives set direction, gap and alignment only — no colour, border, or padding of their own |
| Gap scale | 6 · 8 · 12 · 14 · 16 · 22 · 24 · 32 — no 10, 18, or 20 |
| Row | flex · align center · gap 12 default · wrap off — toolbars, button pairs, label rows |
| Column | flex column · align stretch · gap 12 default — stacked fields, card bodies |
| Grid | repeat(12, minmax(0,1fr)) · gap 16 row / 24 col · children span 4 / 6 / 8 / 12, floor 172px |
| AutoGrid | repeat(auto-fit, minmax(min,1fr)) · gap 12 · min 190px stats, 240–300px panels |
| Split | Row with a flex:1 spacer — content left, actions right · wraps at 640px |
| Cluster | Row with wrap on · gap 7–8 — chips, tags, filter pills, service lists |
| Sidebar | 244px rail + flex:1 main · 62px under 1024px · off-canvas under 768px · one per page |
| Page | max-w 1320px detail / 1560px tables · pad 26px 32px · canvas #EEF1F6 |
| Section | one card + 22px below · cards never nest — divide (1px #EEF1F6) or sink (#FAFBFD) instead |
| Divider | 1px #EEF1F6 between sections · 1px #F5F7FA between rows |
| Flex children | min-width: 0 on any child whose text must clip, or the ellipsis silently fails |
| Spacing owner | always the container's gap, never a child's margin |

### Stepper

_28px nodes · 2px connector · horizontal ≤4, vertical 5+_

| Property | Value |
|---|---|
| Node | 28px circle · 12px / 700 label · connector 2px radius 999px, trailing each node except the last |
| Connector rule | a step's trailing connector is green only when that step is DONE — the current step's is #EEF1F6, so the fill stops at the node you are on |
| Done | #177236 fill, 1.8px #177236, ✓ #FFF · connector behind it #177236 |
| Current | --grad-primary fill, #FFF number, 0 0 0 4px rgba(23,114,54,.12) halo |
| Upcoming | #FFF fill, 1.8px #D5DBE6, #98A2B3 number · connector #EEF1F6 |
| Error | #B42318 fill with #FFF ! · sub-label 11.5px / 500 #B42318 · connector stays unfilled |
| Step label | 13px / 700 · #1E2532 current, #344054 done, #667085 upcoming · clips, never wraps |
| Sub-label | 11.5px · done = date + actor, current = what remains (500 weight #177236), upcoming = requirement |
| Horizontal | grid repeat(n, minmax(0,1fr)) · gap 12 · node row then labels · 4 steps max |
| Vertical | grid 28px / 1fr · gap 12 · 2px spine · 18px below each step except the last |
| Compact | title 13px / 700 + mono % · 5px meter --grad-meter · 4px segments for ≤4 steps |
| Container | pad 18px 20px · 1px #EEF1F6 · radius 12px · #FBFCFE — a sunken block, not a card |
| Interaction | done and current are buttons; upcoming is plain text — no forward jumps past validation |
| ARIA | ol/li with aria-current=step on the current node; state also in the sub-label text, not colour alone |

### Forms & validation

_12-col grid · 16px/24px gutter · error replaces help text in place_

| Property | Value |
|---|---|
| Shell | one card per form · 1px #E4E8EF · radius 14px · header/footer rules #EEF1F6 |
| Header | pad 18px 24px 14px · title 16px/700 · sub 12.5px #667085 · progress 5px #EEF1F6 fill --grad-meter |
| Body | pad 20px 24px · grid repeat(12, minmax(0,1fr)) · gap 16px row / 24px col · fields span 4 / 8 / 12 · a span-4 cell floors at 172px (one line of 13.5px text) and drops to span 6 below that |
| Fieldset label | 10.5px / 700 / 0.08em #5A6577 + 1px #EEF1F6 rule · 24px above, 14px below |
| Field label | 12.5px / 500 #344054 · 6px above the control · 38px shells clip with ellipsis, never wrap |
| Required mark | * #B42318 (dark #FF9B95) · 4px gap — used on required fields only |
| Optional mark | 11.5px #98A2B3 lowercase \\ |
| Help/error slot | one shared slot per field: 5px below the control, min-height 32px, line-height 1.35 — reserved for two lines so validating never reflows the row |
| Error text | 11.5px / 500 #B42318 + 13px round ! badge, align-items flex-start · REPLACES help text in the shared slot |
| Error field | 1px #E5484D + 0 0 0 3px rgba(229,72,77,.14) · dark #FF9B95 / .18 |
| Read-only | background #F4F6FA · 1px #EEF1F6 · text #98A2B3 · never a disabled input |
| Textarea | min-height 76px · pad 10px 12px · line-height 1.5 · counter 11.5px mono right |
| Token field | min-height 38px · pad 5px 8px · chips 26px --green-100 / --green-text with × at .75 opacity |
| Consent row | #FBFCFE · 1px #EEF1F6 · radius 10px · pad 12px 14px · 17px checkbox + 13px copy |
| Footer | pad 14px 24px · 1px top #EEF1F6 · #FAFBFD · autosave note left, actions right |
| Actions | 38px · primary --grad-primary / #FFF 700 · secondary 1px #D5DBE6 on #FFF · order Back then Continue |
| Autosave note | 12px #667085 + 6px #D9A13B dot |
| Validation timing | on blur, then on every change once errored · never on first keystroke |
| Submit failure | focus the first errored field, scroll it under the sticky header, announce the count via aria-live |
| Mobile | grid collapses to 1 col · gutter 20px · footer becomes sticky, buttons full-width stacked |

### App shell — sidebar & header

_rail 244px · item 9px radius · header 12px 32px sticky_

| Property | Value |
|---|---|
| Rail width | 244px expanded · 62px collapsed (transition 160ms ease) |
| Rail surface | #FFF · 1px right #E4E8EF · sticky top 0 · h 100vh |
| Brand block | pad 16px 16px 13px · 1px bottom #EEF1F6 · gap 10px |
| Logo tile | 30×30px · radius 9px · --logo-tile #14532D · --logo-tile-on #D9F2C4 10.5px / 700 |
| Group header | pad 14px 8px 7px · 10.5px / 700 / 0.1em · #5A6577 |
| Nav item | pad 8px 10px · radius 9px · gap 10px · 13.5px / 400 #4B5565 |
| Nav active | linear-gradient(180deg,#177236,#125A2B) · #FFF / 700 = 6.01:1 at the lightest stop |
| Nav hover | #F4F6FA bg · #1E2532 text |
| Item mark | 13px · 1.8px #B3BDCD — square PTC, circle LTO, diamond config · decorative, 1.4.11 exempt beside its label |
| Icon-only control | collapse chevron and account ⋯ use #667085 (4.83:1) with an aria-label + title — never the #98A2B3 caret grey, which is decorative only |
| Collapsed item | 34px tile · title + aria-label required (the label is the only name once text drops) |
| Nav badge | min-w 20px h 20px · radius 10px · #FEE2E2 / #B42318 11px / 700 |
| Badge on active | rgba(255,255,255,.25) bg · #FFF text |
| Collapsed badge | 7px dot #E5484D · 2px #FFF ring · top/right 5px |
| Rail footer | pad 12px 14px · #FBFCFE · 1px top #EEF1F6 |
| Header | pad 12px 32px · rgba(255,255,255,.75) · blur 6px · sticky z 6 |
| Breadcrumb | 13px / 500 #667085 · separator / #CBD3E0 · current #1E2532 |
| Avatar | 34px circle · #DBE4F0 · 2px #FFF · ring 1px #E4E8EF |

### Tables

_header 11px 20px · row 13px 20px · expand panel #FAFBFD_

| Property | Value |
|---|---|
| Column header | pad 11px 20px · #FAFBFD · 10.5px / 700 / 0.08em #5A6577 |
| Header rule | 1px bottom #EEF1F6 |
| Row | pad 13px 20px · 1px bottom #F5F7FA · grid gap 14px |
| Row hover | #FAFBFD · cursor pointer when expandable |
| Row title | 14px / 700 / -0.005em · ellipsis single line |
| Row sub | 12px / 400 #667085 · 3px above |
| Numeric cell | mono 12.5px / 400 · #15803D for LTO numbers |
| Caret cell | 44px wide · 13px ▸/▾ · #98A2B3 (decorative) · right aligned |
| Expanded panel | #FAFBFD · pad 16px 20px 20px · auto-fit minmax(260px,1fr) gap 22px |
| Panel label | 10.5px / 700 / 0.08em #5A6577 · 8px below |
| Grid template | 44px · minmax(240px,2.4fr) · 148px · 132px · 116px · 136px · 44px · gap 14px · min-width 1040px |
| Select column | 44px centred · 17px checkbox · header is aria-checked=mixed when partial |
| Identity cell | 13.5px/700 #1E2532 + 12px #667085 sub · both clip with ellipsis, never wrap |
| Mono cell | 12px JetBrains Mono #15803D for live codes · #C3CAD6 em-dash when absent |
| Numeric cell | 12.5px mono / 700 right-aligned + 10.5px #98A2B3 unit + 3px meter (track #EEF1F6, fill = the tone) 5px below |
| State stripe | 3px absolute left, full row height · green #177236 · amber #D9A13B · red #E5484D · closed #EEF1F6 · never the only status cue |
| Row padding | 12px 20px default · 8px 20px compact · header 10px 20px |
| Saved views | pills 5px 11px · active #14532D / #D9F2C4 · idle 1px #DDE2EA · + is 26px dashed #CBD3E0 |
| Bulk bar | 8px 20px · #F7FCF9 · 1px bottom #E4F1E8 · 12.5px #15803D with a select-all link |
| Rows-per-page | 30px · 1px #D5DBE6 · radius 8px · sits left of pagination in the footer |
| Actions cell | 44px centred · 26px ⋯ hit area, aria-label + title required |
| Sort caret | 8px · active #177236 · idle #B3BDCD · header cell is the button |
| Selected row | #F7FCF9 · bulk bar #E8F6EC with 1px #D3EBDB under the toolbar |
| Toolbar | pad 12px 20px · 34px search and segmented · density toggle right |
| Empty cell | em-dash #C3CAD6 in the cell's own alignment — never blank, never N/A |
| Expand indent | panel content starts at 78px (select 44 + gap 14 + 20 pad) |
| Min table width | 1040–1180px inside overflow-x:auto |
| Footer bar | pad 13px 20px · #FAFBFD · 12.5px #667085 |
| Pagination | 34×32px · radius 8px · active #177236/#FFF · idle 1px #D5DBE6 |
| Result pill | pad 8px 12px · radius 999px · #E8F6EC / #15803D 12.5px / 700 (4.50:1) |

### Stat cards & meters

_card 12px radius · dot 8px · meter 6px track_

| Property | Value |
|---|---|
| Grid | auto-fit minmax(190px,1fr) · gap 12px |
| Card | pad 14px 16px · radius 12px · #FFF · 1px #E4E8EF |
| Card selected | 1px #25A94E + 0 0 0 3px rgba(37,169,78,.12) |
| Muted card | #FBFCFE bg · figure #5A6577 (data, so AA applies) |
| Label | 12px / 500 #667085 · dot 8px · gap 7px |
| Figure | 23px / 700 / -0.01em · 5px above |
| Hint | 11.5px / 400 #667085 · urgent 700 #B42318 |
| Stage number | 19×19px · radius 6px · idle #EEF1F6/#5A6577 · active #177236/#FFF |
| Meter track | 6px · radius 999px · #EEF1F6 |
| Meter fill | linear-gradient(90deg,#25A94E,#7BC96F) |
| Meter caption | 12px / 400 #667085 · value 700 #15803D · 7px above |
| Expiry pill | ≤60d #FEE2E2/#B42318 · ≤180d #FEF2E0/#A16207 · else #EEF1F6/#667085 |

### Motion, states & z-index

_120–160ms · one focus ring · z 6/12/40_

| Property | Value |
|---|---|
| Hover / fill | transition background 120ms |
| Border change | transition border-color 120ms |
| Switch | transition background 140ms + justify-content 140ms |
| Rail collapse | transition width 160ms ease |
| Toast timer | @keyframes toastTimer scaleX 1→0, 5s linear forwards |
| Spinner | @keyframes spin 700ms linear infinite |
| Focus ring | 0 0 0 3px rgba(37,169,78,.15) + border #25A94E — every focusable |
| Disabled | surface #F7F9FC · border #E4E8EF · text #B9C1D1 (--ink-200, the only disabled text value) · cursor not-allowed |
| Empty value | em dash — in #C3CAD6 (decorative, has a text equivalent in the header) |
| Sticky header | z-index 6 |
| Dropdown / menu | z-index 12 · top 44px (40px for 34px triggers) |
| Dialog + scrim | z-index 40 · position fixed inset 0 |
| Reduced motion | drop timer + spinner animations, keep state colours |

### Keyboard & focus

_every control reachable · one visible ring · Esc always closes_

| Property | Value |
|---|---|
| Focus ring | :focus-visible → border #25A94E + 0 0 0 3px rgba(37,169,78,.15) |
| Never | outline:none without replacing the ring |
| Tab order | DOM order = visual order; no positive tabindex anywhere |
| Chips (filter) | role=button tabindex=0 · Space/Enter toggles |
| Chips (dismiss) | × is a real <button> with aria-label='Remove {filter}' |
| Underline tabs | ←/→ moves and selects · Home/End jumps · only active tab tabbable |
| Segmented | radiogroup semantics · ←/→ changes selection |
| Stage cards | tabbable buttons · Enter/Space selects · ←/→ optional |
| Dropdown open | Enter/Space/↓ opens and focuses first option |
| Dropdown nav | ↑/↓ moves · Enter picks · Esc closes and returns focus to trigger |
| Multi-select | Space toggles without closing · Tab reaches Clear/Apply |
| Typeahead | typing in an open panel filters, does not jump-select |
| Row menu | Esc closes · click-outside closes · focus returns to ⋯ |
| Dialog | focus moves to dialog on open, traps inside, returns to trigger on close |
| Dialog keys | Esc = cancel · Enter on focused button only (never auto-confirm) |
| Toast focus | never steals focus · action reachable by Tab while visible |
| Toast timing | pause auto-dismiss on hover/focus-within; resume on leave |
| Table rows | expandable row = button with aria-expanded; caret is decorative |
| Bulk select | header checkbox is aria-checked=mixed when partial |
| Skip link | first tab stop jumps past the rail to <main> |

### ARIA & semantics

_native elements first · aria only where markup can't say it_

| Property | Value |
|---|---|
| Buttons | <button type=button> — never a div with onClick |
| Fields | <label for> or aria-label; hint via aria-describedby |
| Error state | aria-invalid=true + aria-describedby pointing at the error text |
| Required | required attr; asterisk optional, never the only signal |
| Tabs | role=tablist / tab / tabpanel · aria-selected · aria-controls |
| Segmented | role=radiogroup with role=radio children + aria-checked |
| Dropdown | role=combobox aria-expanded aria-haspopup=listbox + role=listbox/option |
| Multi-select | aria-multiselectable=true · aria-selected per option |
| Row menu | aria-haspopup=menu · role=menu / menuitem |
| Dialog | role=dialog aria-modal=true aria-labelledby + aria-describedby |
| Toast region | aria-live=polite (assertive for error) · role=status · aria-atomic=true |
| Inline notice | role=status; error notice role=alert |
| Switch | role=switch aria-checked — not a checkbox |
| Chips as status | plain text, no role; the word carries the meaning, colour never alone |
| Counts | badge text needs context: aria-label='10 applications for checking' |
| Progress | role=progressbar aria-valuenow/min/max on upload + expiry meters |
| Skeletons | aria-hidden=true inside an aria-busy=true container |
| Icon-only | aria-label required (⋯ = 'Row actions', × = 'Dismiss') |
| Nav | <nav aria-label='Primary'> · active item aria-current=page |
| Tables | real <table> with <th scope=col>; grid CSS is fine, faked headers are not |

### Responsive & touch

_single rail breakpoint · tables scroll · 44px on touch_

| Property | Value |
|---|---|
| ≥1280px | full layout · content max-w 1280px (tables 1560px) |
| 1024–1279px | stat grids reflow via auto-fit minmax(190px,1fr) |
| <1024px | rail collapses to 62px; two-column detail becomes one |
| <768px | rail off-canvas behind a 44px toggle; header stays sticky |
| Tables | never reflow — overflow-x:auto with min-width 1020–1180px |
| Table on mobile | row becomes a stacked card: title, chips, then key/value pairs |
| Filter bar | wraps: search 1 1 280px, segmented and sort drop to a second line |
| Toasts | width 372px desktop · calc(100% - 32px) below 420px |
| Dialog | max-w 428px · full-width minus 24px scrim padding on mobile |
| Touch targets | 44×44px minimum — 34px controls get padding, not a smaller box |
| Checkbox / radio | 17px box inside a 44px tappable row on touch |
| Hover styles | guard with @media (hover:hover) so touch doesn't stick them |
| Reduced motion | @media (prefers-reduced-motion:reduce) → animation/transition none; toast timer becomes a static bar |
| Zoom | layout holds to 200% zoom; no fixed heights on text containers |
| Dark on white | #1E2532 15.37:1 · #344054 10.46:1 · #475467 7.69:1 · #667085 4.97:1 — all pass |
| Column headers | #5A6577 = 5.89:1 on #FFF (10.5px is normal text — the large-text exemption needs ≥18.66px bold) |
| On tinted surfaces | canvas #EEF1F6 costs ~0.6 — #667085 drops to 4.39:1 and FAILS there; use #5A6577 (5.21:1) for page subtitles, breadcrumbs, footers, and text on #EEF1F6 tiles |
| Hints & meta | #667085 inside white cards only — 12px meta is still normal text |
| Muted figures | 25px/700 muted stat = #5A6577; #98A2B3 is 2.51:1 on #FBFCFE and misses even the 3:1 large-text bar |
| Placeholder | #667085 — placeholder is in scope for 1.4.3 |
| Decorative greys | #8A94A6 3.06:1 · #98A2B3 2.58:1 · #C3CAD6 1.66:1 — icons, carets, dots, em-dashes only; never readable text |
| Disabled | #B9C1D1 1.81:1 — allowed, 1.4.3 exempts disabled controls |
| White on green | only on #177236 (6.01:1) or darker — #1D8F42 is 4.15:1, #17A34A 3.29:1, #25A94E 3.06:1 and all fail with white text |
| Tone text on tint | #8A5206/#FEF2E0 5.77 · #B42318/#FEE2E2 5.38 · #175CD3/#EAF2FE 5.31 · #5A6577/#EEF1F6 5.21 · #15803D/#E8F6EC 4.50 — passes with zero headroom, so never lighten either side |
| Colour alone | never the only signal — every tone pairs with a word (Approved, Legacy, Returned) |
| Focus ring | #25A94E on #FFF = 3.06:1 · #2FB25F on #161C26 = 6.23:1 — both meet 1.4.11 |
| 1.4.11 exception | resting control BORDERS do not reach 3:1 in either theme — light #C3CAD6/#FFF 1.65, #D5DBE6/#FFF 1.39; dark #55606F/#161C26 2.68, #384556 1.75. Known, deliberate: state is carried by the filled/focused state (both ≥ 3:1) and by an always-visible label, never by the resting border alone |

### Dark mode

_data-theme=\"dark\" · same geometry · dark text on the green fill_

| Property | Value |
|---|---|
| Canvas | #0F141C |
| Card | #161C26 · 1px #2A3441 · shadow none |
| Sunken strip | #1C242F — header, footer, expanded row |
| Field well | #10161F · 1px #384556 |
| Control shell | #222B38 · segmented active #2A3441 |
| Muted card | #141A23 · row hover #1A212B |
| Divider | 1px #222B38 (card border #2A3441) |
| Text | #E8ECF3 14.43:1 · #C3CCDA 10.56:1 · #9AA5B5 6.86:1 — all on #161C26 |
| Decorative | #6F7B8C 3.98:1 · disabled #55606F 2.36:1 (exempt) |
| Green fill | #2FB25F with #0B1017 text = 6.95:1 (white would be 2.74:1) — read --green-on-fill |
| Green hover | #3FC26E |
| Green text | #6FDC96 = 10.06:1 — links, active tab, mono numbers |
| Focus ring | 1px #2FB25F + 0 0 0 3px rgba(47,178,95,.18) |
| Amber | text #F0C070 · tint rgba(217,161,59,.18) |
| Red | text #FF9B95 · tint rgba(229,72,77,.18) |
| Blue | text #8FB8FF · tint rgba(23,92,211,.24) |
| Violet | text #C4B2FF · tint rgba(140,110,240,.22) |
| Neutral tint | rgba(255,255,255,.07) with #C3CCDA text |
| Elevation | card/button none · toast 0 8px 24px rgba(0,0,0,.50) · panel .45 · dialog .60 |
| Scrim | rgba(4,7,12,.62) |
| Selected surfaces | option row rgba(47,178,95,.12) · selected card #1C242F (light #F2FAF4 / #F7FCF9 have no place on dark) |
| Notice fills | green .14 · amber .14 · red .16 · blue .16 over the surface |
| Soft border | #384556 — service chips and inline filters (light #DDE2EA) |
| Destructive | outline border rgba(255,155,149,.45) · filled #FF9B95 with #2A0806 text |
| Dialog | #161C26 · 1px #2A3441 · shadow 0 24px 60px rgba(0,0,0,.60) · scrim rgba(4,7,12,.62) |
| Empty state | 1px dashed #384556 · title #E8ECF3 · sub #9AA5B5 (1.6px dashed is the dropzone only) |
| Skeleton | 11px bars #222B38 on #161C26 · 3 rows max |
| Pagination | active #2FB25F/#0B1017 · idle 1px #384556/#C3CCDA · disabled #6F7B8C |
| Unchanged | every height, radius, padding, gap, weight and font — palette only |

### Type & layout

_DM Sans 400/500/700 · JetBrains Mono for copyable values_

| Property | Value |
|---|---|
| Family | 'DM Sans', system-ui, sans-serif |
| Mono | 'JetBrains Mono', monospace |
| Page title | 26px / 700 / -0.015em |
| Section title | 17px / 700 |
| Card figure | 23px / 700 / -0.01em |
| Row title | 14px / 700 |
| Body | 13.5px / 400 / 1.55 · #475467 (7.69:1) |
| Field label | 12.5px / 500 · #344054 |
| Meta | 12px / 400 · #667085 |
| Column header | 10.5px / 700 / 0.08em uppercase · #5A6577 |
| Page canvas | #EEF1F6 |
| Card | #FFF · 1px #E4E8EF · radius 14px · shadow 0 1px 2px rgba(16,24,40,.04) |
| Section gutter | 24px x · 22px between cards |
| Content max-w | 1320px detail · 1560px tables · gutter 32px |
| Table row | pad 13px 20px · 1px #F5F7FA · hover #FAFBFD |
---

- **2026-08-31 — the `BULK SELECTION` strip keeps §17.1's padding, not the artifact's.** The
  artifact pads this one strip `16px 20px` with a 4px inset on its label; §17.1's `DemoStrip` — the
  page-wide strip treatment, already carrying five other strips — pads `18px 24px 22px` with no
  inset. Following the artifact here would make this the only strip on the page at a different
  gutter, a worse inconsistency than the 2–4px it fixes. Deliberate; the label's own
  `margin-bottom: 10px` already matches `DemoStrip`.
- **2026-08-31 — the `LTO number` field is not permanently focused.** The artifact renders that one
  demo with the focus ring always on, to show it; its hint says so (`Focus · 3px ring at 15%
  green`). Reproducing that needs a `focused` prop on a production field component whose only
  purpose is to lie about a browser state, so ours shows the ring on real focus instead. The hint
  text is the artifact's, unchanged.
- **2026-08-31 — `SearchField` takes its visible label, qualifier and hint from section chrome.**
  It draws neither label nor hint of its own, because its other use is a filter bar where no label
  is drawn; its `label` prop is the aria-label. `DropdownsSection` wraps `Select` and `RowMenu` the
  same way for the same reason. Inside Text fields this means one demo's label comes from a
  sibling div while six come from the component, though both render identically.

- **2026-08-31 — `FileList` is hand-built, not Ark's `FileUploadItem` family.** Those parts render
  the machine's OWN accepted files, and `@zag-js/file-upload` has no upload-state or progress model
  at all. The artifact's list carries a percentage, a success note and a failure note — consumer
  data — so the rows arrive as a prop. `FileInput` and `FileInputCompact` are Ark.
- **2026-08-31 — `ToastRegion` overrides Ark's inline positioning with `!important`.**
  `getGroupPlacementStyle` writes `position: fixed` and `MAX_Z_INDEX` as inline styles, which no
  amount of specificity can beat. The default is left alone (fixed is right for a real app); the
  demo passes `contained` to position the region inside its app-surface panel, which is what the
  artifact shows. An e2e test measures the toast against that panel's box, because this is exactly
  the kind of override that fails silently.
- **2026-08-31 — the toast store publishes events, not the toast array.** `subscribe`'s TypeScript
  says `(toasts: Options[]) => void`; the runtime calls `subscriber(data)` with a single toast, and
  `{ id, dismiss: true }` on removal. `getCount()` cannot be used inside the callback either —
  `publish()` runs before the store mutates its array, so it reads stale by one in both directions.
  A live count means tracking ids. Wired the other way first, `Dismiss all` and the empty state
  were both dead, and only the e2e test caught it.

- **2026-08-31 — `Button` forced 700 on every variant.** `.btn` carried a blanket `font-bold`, so
  Secondary, Destructive and Disabled all rendered at 700 against Appendix C's `#344054 / 500`.
  Nothing competed for the property, so there was no two-declarations smell to catch it; weight now
  lives once per variant beside that variant's colours. Found while adding the filled destructive.
- **2026-08-31 — `EmptyState`'s action is a 34px compact secondary.** The artifact's own button is
  34px at `13px / 500` with `pad 0 16px`; `Button`'s compact size is `12.5px` with `pad 0 14px`.
  Using the real component for a real control beats reproducing a button inside `EmptyState` for a
  0.5px type difference and 2px of padding.
- **2026-08-31 — `Dialog` sets `lazyMount` and `unmountOnExit`.** Ark otherwise keeps a closed
  dialog's content mounted and merely hidden, leaving its heading and both buttons in the document
  at all times. The artifact renders the dialog only while open.

- **2026-08-31 — the Dark mode previews are real components, not the artifact's drawings.** The
  artifact hand-draws six dark miniatures with literal hexes because it has no theme system. Ours
  puts `data-theme="dark"` on the preview panel — an attribute selector, so it re-scopes every
  token for that subtree — and renders the actual components inside. That is far less markup and a
  genuine check: a drawing would keep looking right after the dark palette broke. An e2e test reads
  the computed background and ink, since jsdom computes no styles.
- **2026-08-31 — the dark previews omit pagination and a table.** Two sub-block labels name them
  (`DIALOG, EMPTY, SKELETON & PAGINATION`, `TOASTS, NOTICES & TABLE`) and neither component exists;
  the labels are D.1 content and stay verbatim. Tied to the open `DataTable` / `Pagination`
  decision — those two, plus `PasswordField`, `AppShell`, `AppSidebar` and `AppHeader`, are
  redlined or planned in §7 with **no section on the page rendering them**.
- **2026-08-31 — the Tokens block is a generated module, not Vite's `?raw`.** `?raw` on a `.css`
  file returns an **empty string** under Vitest, whose CSS stubbing beats the raw query: the block
  would have rendered correctly in the browser while every test saw nothing, and would have kept
  passing if it broke. `scripts/build-demo-data.mjs` emits it, and a test asserts it matches the
  file byte for byte.

- **2026-08-31 — Ark's toast stack needs CSS the consumer has to write.** `getToastProps` sets
  `position: absolute; bottom: 0` on every toast plus `--offset` (the cumulative height-and-gap of
  the toasts below it) and `--y: calc(var(--lift) * var(--offset))` — and nothing applies `--y`.
  Without `transform: translateY(var(--y))` every toast renders at `bottom: 0`, piled on the
  others. It looked FINE whenever the toasts differed in height, because a taller one still pokes
  out above a shorter, so both existing toast tests passed and only a narrower viewport — where the
  body text wrapped to an extra line — exposed it. `Toast.vue` now applies it; an e2e test measures
  the gap between consecutive toasts rather than trusting the picture.
- **2026-08-31 — the toast demo panel is 340px, not D.1's 316px.** The section advertises "Three at
  most" and sets `max: 3`, and three toasts run 307px of stack (71 + 117 + 99 plus two 10px gaps)
  sitting 16px off the bottom edge — 323px, against a panel of 316px with `overflow: hidden`, so
  the top toast was clipped. The artifact's own value cannot hold the maximum its own rule card
  states. 340px covers it with headroom for the taller wrapping a narrower viewport produces.

- **2026-08-31 — 29 colour tokens kept their light value under `[data-theme="dark"]`.** An unthemed
  token is silent: nothing errors, the page simply paints a light-mode colour on a dark surface.
  Sixteen were fixed against the Dark mode group's own rows — `--green-500` (the BORDER half of the
  focus-ring row, whose ring half was already flipped), `--border-dashed`, `--red-on-fill`, the four
  notice borders and three toast borders, plus `--ink-300`/`--ink-100`/`--surface-disabled`/
  `--dropzone-hover`/`--red-800` inferred from the file's own patterns and commented as inferred.
  Fourteen are allowlisted with reasons in `tokens.spec.js` — status dots, which stay saturated on
  both surfaces, and app-shell tokens with no consumer. A guard now requires every colour token to
  be overridden or allowlisted, and a second one keeps the allowlist from going stale.
- **2026-08-31 — the raw-colour guard was hex-only, so `rgb()`/`rgba()` walked past it.** That is
  how a white schematic header, a white spinner track and a white chip mark all reached the dark
  theme. The guard now also scans `background`/`border`/`outline`/`color`/`fill`/`stroke`
  declarations; `box-shadow` is deliberately out of scope, since a neutral dark shadow reads as
  nothing on a dark surface rather than as the wrong colour. Two demo files are allowlisted: their
  hairlines sit OVER an arbitrary swatch colour and must be neutral-translucent in both themes.
- **2026-08-31 — a hand-set `data-theme` does not stick.** `useTheme()` wraps VueUse's `useDark`,
  whose watcher rewrites the attribute back within a tick. The first dark e2e spec set it directly
  and therefore measured the LIGHT theme while reporting on the dark one; it now clicks the real
  toggle and polls for the attribute. Any future dark test must do the same.

## Appendix D — demo page content

Extracted verbatim from the source artifact. This is the content authority for the
`/design-system` page: section descriptions, sub-block labels, and rule-card footers.

**Known limitation.** This appendix does NOT capture the inline content or markup structure of
every sub-block — only its label and note. Where a sub-block's content is components, that is
fine: the components are specified in Appendix C. Where a sub-block's content is bespoke markup
(a swatch table, a labelled tint list), it is NOT here, and an implementer with no access to the
source artifact will invent a plausible structure instead of reproducing the real one. That
happened once already, in `INNER SURFACES`. **D.1 records the bespoke blocks explicitly; when a
phase needs one that is not in D.1, extract it into D.1 first rather than guessing.**

### D.1 — bespoke sub-block markup

#### Sections with NO uppercase sub-blocks

Verified against the artifact. These sections lay their content out inline, under the section
description, with no `DemoBlock` headings at all:

| Section | Uppercase sub-blocks | Notes |
|---|---|---|
| `Dropdowns` | **none** | all four dropdown demos sit inline |
| `Component specs` | **none** | the redline tables sit inline |
| `Tokens for handoff` | **none** | the token block sits inline |
| `File inputs` | **one**: `FILE LIST — UPLOADING, DONE, FAILED` | the dropzone and compact demos carry 12.5px/500 **field labels** — `PNPKI certificate` and `Compact · inside a form row` — not uppercase sub-block headings |

An earlier plan invented eight uppercase labels across these four sections (`SINGLE SELECT`,
`MULTI SELECT`, `INLINE FILTER — TABLE BAR`, `ROW MENU — ACTIONS`, `PNPKI CERTIFICATE`,
`COMPACT · INSIDE A FORM ROW`, `REDLINES`, `TOKENS`). None exists in the source. Rendering
headings the artifact does not have breaks the mirror as surely as omitting ones it does.

#### Gap citations where Appendix C has no group

`Foundations` and `Tokens for handoff` describe token scales, not components, so **no Appendix C
group governs them** — Appendix C has 19 groups and neither is among them. Their gap markers must
cite **Appendix A** (the token block) instead. `DemoGap` therefore takes an optional `source` prop
defaulting to `Appendix C`.

#### Chips → the five tone sub-blocks

Data-driven in the artifact (`{{ set.label }}`), so the original extraction captured only the two
static strips. Labels and notes verbatim:

| Label | Note |
|---|---|
| `STATUS` | A dot plus a word. Green for good, amber for waiting, red for blocked, grey for closed. |
| `APPLICATION TYPE` | Flat tint, no dot — a category, not a state. Purple is reserved for Add / Modify. |
| `SERVICE` | Outline only — a licence can carry six of these, so tint would drown the row. 12px / 400, white surface, hairline border. |
| `SOURCE` | Where the record came from. Blue for portal-filed, amber for migrated paper records. |
| `COUNT & OVERFLOW` | Numeric badges in nav and tables. Red only when the count is work waiting on you. |

#### Foundations → the six scale groups

Also data-driven (`{{ group.label }}`). Three colour groups carry a note; the three geometry
groups do not:

| Label | Note |
|---|---|
| `BRAND GREEN` | actions, active state, anything issued |
| `NEUTRALS` | text, borders, surfaces |
| `STATUS TONES` | one meaning each — never decorative |
| `RADIUS` | *(none)* |
| `SIZE & SPACING` | *(none)* |
| `ELEVATION & BORDERS` | *(none)* |

#### Selection controls → the six sub-blocks' data

Extracted from the artifact on 2026-08-31. Appendix D names this section's six uppercase
sub-blocks but carries none of their content; this records it. Every label and hint below is
verbatim, **including the em dashes** in `Clinical Laboratory — Limited` and
`Enforced by policy — cannot be turned off`.

**`CHECKBOX · STATES`** — four rows, one per state. The third is indeterminate, the fourth
disabled:

| Label | Hint | State |
|---|---|---|
| `Include legacy records` | `Migrated paper licences with no service list` | off |
| `Only facilities I signed` | *(none)* | on |
| `All Caraga provinces` | `3 of 5 provinces selected` | **indeterminate** |
| `Archived facilities` | `Unavailable to signatories` | **disabled**, checked |

**`RADIO · LIST`** — `As-plan`, `As-built`, `Not applicable` (disabled). No hints.

**`SWITCH · TAKES EFFECT AT ONCE`** — three rows, the last disabled:

| Label | Hint |
|---|---|
| `Email me on returns` | `Digest at 6 PM, weekdays only` |
| `Maintenance mode` | `Blocks new online filings immediately` |
| `Audit logging` | `Enforced by policy — cannot be turned off` *(disabled)* |

**`CHECKBOX CARDS · MULTI`** — `Pharmacy` / `Requires a licensed pharmacist on duty`;
`Clinical Laboratory — Limited` / `Routine chemistry and hematology only`; `X-ray Facility` /
`Needs a separate FDA radiation permit`.

**`RADIO CARDS · SINGLE`** — `Initial` / `First licence for a newly built facility`; `Renewal` /
`Same services, new validity period`; `Add / Modify` / `Changes the services on an active
licence`. The chosen card carries a `Selected` marker.

**`BULK SELECTION — TABLE HEADER + ACTION BAR`** — a header row with a tri-state box whose label
reads `Select all` at zero and `<n> selected` otherwise. Two action buttons appear **only when at
least one row is selected**: `Send renewal notice` and `Export`. Three rows follow, each a
checkbox, a facility name and a mono licence number:

| Name | Number |
|---|---|
| `Trento Primary Care Facility` | `16-015-2527-PCF-1` |
| `Hipol Family Hospital` | `16-19-26-I-2` |
| `Socorro Birthing Clinic` | `16-72-26-BH-1` |


##### Selection controls → arrangement, footnotes and per-control type

Extracted from the artifact on 2026-08-31 after a visual diff showed the built section
disagreeing with the source in fifteen places. The sub-block *data* above was right; none of
what follows had been extracted, so the phase was planned without it.

**The section is three stacked wrappers, not one grid.** `DemoBlocks`' single
`minmax(268px,1fr)` grid put all six sub-blocks in one auto-fit flow, which floated
`BULK SELECTION` up as a third column beside the two card blocks:

| # | Wrapper | Contents |
|---|---|---|
| 1 | `padding: 18px 24px 6px; display:grid; grid-template-columns: repeat(auto-fit, minmax(268px,1fr)); gap:24px` | `CHECKBOX · STATES`, `RADIO · LIST`, `SWITCH · TAKES EFFECT AT ONCE` |
| 2 | `padding: 6px 24px 22px; display:grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap:24px` | `CHECKBOX CARDS · MULTI`, `RADIO CARDS · SINGLE` |
| 3 | `border-top: 1px solid #EEF1F6; padding: 16px 20px; background: #FAFBFD` | `BULK SELECTION — TABLE HEADER + ACTION BAR`, full width |

Wrapper 3 is a **tinted strip**, not a grid cell: `--divider` top rule on `--surface-sunken`.
Its uppercase label is the only one on the page at `margin-bottom: 10px` **and**
`padding-left: 4px`; the other five sit at `margin-bottom: 12px` with no inset.

**Three trailing footnotes, one per first-row sub-block.** Each is `12px`, `#667085`,
`line-height: 1.5`, `margin-top: 12px`, and sits **after** its list of rows — not before it.
`DemoBlock`'s existing `note` prop renders *above* the slot (correct for `Foundations` and
`Chips`, which do lead with their notes), so these need a separate trailing slot:

| Sub-block | Footnote |
|---|---|
| `CHECKBOX · STATES` | `Parent rows show a dash when only some children are picked.` |
| `RADIO · LIST` | `Three or fewer short options; more than that becomes a dropdown.` |
| `SWITCH · TAKES EFFECT AT ONCE` | `Switch sits right of its label — nothing to submit, so nothing to scan back to.` |

**The switch's label sits left of its track.** The row is
`display:flex; align-items:flex-start; gap:14px; user-select:none` with the **text span first**
and the track second; the track carries `margin-top: 1px`. The footnote above states this rule
in so many words, which is how the inversion was caught. Appendix C's `Label` row —
"13.5/400 ink-700, 10px from the control" — describes the **plain checkbox and radio lists
only**; it does not govern the switch or either card, and reusing it there was the error.

**Label type differs by control**, which no single redline row captures:

| Control | Size / weight | Colour | Disabled colour | Gap to control |
|---|---|---|---|---|
| `Checkbox`, `Radio` (plain lists) | 13.5 / **400** | `--ink-700` | `--ink-200` | 10px |
| `Switch` | 13.5 / **500** | `--ink-900` | `--ink-200` | **14px**, and on the *right* |
| `CheckboxCard`, `RadioCard` | 13.5 / **500** | `--ink-900` | `--ink-200` | 11px, the card's own flex `gap` |

There is no 13.5/500 step in the `@theme` scale — `--text-body` is 13.5/400. The 500 rows use
`text-body font-medium`; Tailwind orders `font-weight` utilities after `font-size` utilities, so
the pairing is the documented override, not this project's two-competing-classes defect.

**Row gaps between siblings** — 11px for the plain lists, 14px between switches, **8px between
cards**. The built section reused 11px for the card lists.

**The card is one flex row, not a column.** `selectCardStyle` is
`display:flex; align-items:flex-start; gap:11px; padding:13px 14px; border-radius:11px;
cursor:pointer; user-select:none; transition:border-color 120ms`, with three children: the
control, a `flex:1; min-width:0` text span, and — on the chosen radio card only — the `Selected`
marker. So the control-to-text gap is the card's own `gap`, never a `margin-left` on the text.

**`Selected` is an inline pill at the card's right edge**, a third flex child at `flex: none`:
`padding: 3px 9px; border-radius: 999px; background: #E8F6EC; color: #15803D; font-size: 11px;
font-weight: 700` — i.e. `--green-100` on `--green-text` at the chip step. It was built as a
block *below* the hint, which is what put it under the text in the screenshot.


#### Text fields → the seven demos

Extracted from the artifact on 2026-08-31 during the carry-forward audit. The section had been
built from Appendix C's redlines alone: six demos in a different order, every hint rewritten to a
fragment, and the password demo absent. Section body is a grid — `repeat(auto-fit, minmax(280px,
1fr))`, `gap: 20px 24px`, padding `18px 24px 24px`.

Each demo is `label (12.5/500 #344054, margin-bottom 6px)` → control → `hint (12px #667085,
margin-top 5px)`. Two labels carry a muted `#667085` qualifier after a space. The hint slot is the
only message slot: a demo shows a hint **or** an error, never both.

| # | Label | Qualifier | Control state | Hint / error |
|---|---|---|---|---|
| 1 | `Facility name` | — | placeholder `e.g. Carmen RHU` | `Default · rests on a hairline border.` |
| 2 | `LTO number` | — | **focused**, mono, value `16-015-2527-PCF-1` | `Focus · 3px ring at 15% green. Mono for reference numbers.` |
| 3 | `Search` | `· with leading icon` | leading 12px ring, gap 8px, placeholder `Search facility or LTO number`, clear button at 18px | `Clear button appears only once there's a value.` |
| 4 | `Certificate password` | — | placeholder `Required to unlock the .p12`, trailing action, pad `0 10px 0 12px` | `Trailing text action instead of an eye icon.` |
| 5 | `Bed capacity` | — | **error**, value `0`, unit `beds` | **error** `Must be at least 1 for an infirmary.` |
| 6 | `NHFR code` | `· read only` | readonly, mono, value `37720`, badge `SYNCED` | `Disabled fields lose their white surface, never their border.` |
| 7 | `Reviewer remarks` | — | `grid-column: 1 / -1`, 3 rows, counter `<n> / 400`, placeholder `Explain what the facility needs to correct before resubmitting.` | `Textarea keeps the field radius; min 3 rows, resizable vertically only.` |

**Three distinct trailing treatments**, which the build had collapsed into one. Appendix C carries
only the third:

| Treatment | Type | Element | Example |
|---|---|---|---|
| Unit | 12px / 400 `#667085` | static span | `beds` |
| Badge | 11px / 700 `#667085` | static span | `SYNCED` |
| **Trailing action** (Appendix C) | 11.5px / 700 `#667085`, pad 6px | **button** | `SHOW` / `HIDE` |

`suffix` had been styled to the Trailing-action row and used for `beds`, so a static unit rendered
as though it were a control. The password button toggles `showPw`, which drives both the label
(`HIDE` when open, else `SHOW`) and the input type (`text` when open, else `password`).

**An error carries a glyph; a hint does not.** The error row is
`display: flex; gap: 7px; margin-top: 5px` holding a 13px ring (`1.6px solid #B42318`,
`margin-top: 1px`) and then the text at `12px / 1.45` in the same red. Built as one `<p>` serving
both messages, the glyph was absent.

#### The other four audited sections → arrangement

Extracted 2026-08-31 in the same carry-forward audit that produced the Text-fields entry above.
Each of these was built from Appendix C's redlines with no arrangement extraction.

**Tabs — three plain blocks, not sunken strips.** The page uses this block in two dresses. Chips,
Toasts and Selection controls tint theirs on `--surface-sunken` (§17.1's `DemoStrip` default,
correct). Tabs runs three on the card surface with no tint, their own padding, and a `margin-top`
above the rule; the first opens the card body and carries **no top rule at all**:

| Block | Wrapper | Leading note |
|---|---|---|
| `UNDERLINE — PRIMARY, SITS ON A CARD EDGE` | `padding: 20px 24px 4px` — no rule, no margin | `Use at the top of a table card. Counts ride inside the label.` |
| `SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS` | `padding: 22px 24px 4px; border-top; margin-top: 14px` | `Sits in a filter bar next to the search field. Never more than four.` |
| `STAGE TABS — A WORKFLOW WITH VOLUME PER STEP` | `padding: 22px 24px 24px; border-top; margin-top: 18px` | `The pipeline pattern from LTO Applications: numbered, countable, one urgent tone allowed.` |

The note is **leading**, unlike Selection controls' trailing footnotes: label at `margin-bottom:
2px`, then a 12.5px `#667085` note at `margin-bottom: 8px`, then the content. Where a block has no
note the label keeps §17.1's 10px.

**Buttons — a flex column of two rows, no grid.** Body is `padding: 18px 24px 22px; display: flex;
flex-direction: column; gap: 16px`; each row is `display: flex; flex-wrap: wrap; gap: 10px;
align-items: center`.

| Row | Contents |
|---|---|
| 38px | `Verify & save` primary · `Export CSV` secondary · `Revoke licence` destructive · `View logs` ghost · `Sign document` secondary **disabled** |
| 34px compact | `Apply` **primary** · `Reset filters` **secondary** · `⋯` 34×34 icon · the busy button (primary, `Sign document` → `Signing…`) · then a 12px `#667085` note, `Compact 34px row · click the last one for the pending state` |

`Sign document` appears twice on purpose — disabled at 38px in row one, and as the busy control in
row two. The build had three rows, `Apply` secondary and `Reset filters` ghost, which left the
compact row with no filled button at all.

**Type scale — a full-bleed three-column table.** Header and rows share
`grid-template-columns: 132px 1fr 210px; gap: 20px`. Header: `padding: 12px 24px`, `--surface-sunken`,
rules above and below in `--divider`, cells `TOKEN` / `SAMPLE` / `SPEC` at the column-header step.
Rows: `padding: 15px 24px`, `align-items: baseline`, `border-bottom: 1px solid #F5F7FA`
(`--divider-row`); column one is 12.5/700 `--ink-600`, column three 12px mono in `--text-meta`.

| Token | Sample | Spec |
|---|---|---|
| `Page title` | `Issued LTO` | `26px / 700 / -0.015em` |
| `Section title` | `Application history` | `17px / 700` |
| `Card figure` | `211` | `23px / 700 / -0.01em` |
| `Row title` | `Buenavista Primary Health Care Center` | `14px / 700` |
| `Body` | `Your PNPKI certificate and its password are stored encrypted.` | `13.5px / 400 / 1.55` |
| `Field label` | `Certificate password` | `12.5px / 500` |
| `Meta / hint` | `Updated 8 minutes ago` | `12px / 400` |
| `Column header` | `FACILITY TYPE` | `10.5px / 700 / 0.08em` |
| `Mono` | `16-015-2527-PCF-1` | `12.5px / 500 mono` |

**Dropdowns — the recorded values were never built.** D.1 already carried
`repeat(auto-fit, minmax(260px,1fr))`, `gap: 20px 24px`, `align-items: start`, padding
`18px 24px 24px` when the section was planned, and the build used §17.1's 268px/24px default
regardless. This is the one case in the audit where extraction was not the failure — carrying the
extracted value into the plan was.

#### File inputs → the three demos

Extracted 2026-08-31. Section body is a grid — `repeat(auto-fit, minmax(320px,1fr))`,
`gap: 22px 24px`, `align-items: start`, padding `18px 24px 24px`. The first two demos carry
12.5/500 field labels; the file list is the one uppercase sub-block and spans the grid with
`grid-column: 1 / -1`. **There is no tinted strip in this section** — the skeleton had put the list
in one.

| Demo | Label | Detail | Note |
|---|---|---|---|
| Dropzone | `PNPKI certificate` | `1.6px dashed --border-dashed`, radius 10, pad 16, gap 12; hover swaps to `--green-500` on `--dropzone-hover`. 36px `--neutral-100` tile with `↑` at 15/700, then `Drop a file or click to browse` (13.5/700) over `.p12 · up to 5 MB` | `Click it — files land in the list beside this.` |
| Compact | `Compact · inside a form row` | the 38px field shell padded `0 6px 0 12px`; name at 13px in `--text-meta`, then a 28px `Browse` at radius `--r-tile` | `Use when the field sits in a dense two-column form.` |
| List | `FILE LIST — UPLOADING, DONE, FAILED` | rows 8px apart | — |

**File row** — `pad 12px 14px`, radius 10, gap 12. A failed row takes `--red-50` on `--red-border`;
every other row is `--surface` on `--border-card`. The 34px type mark is 10/700 at `0.04em`,
`--neutral-100`/`--text-header` normally and `--red-100`/`--red-700` when failed. Name 13.5/500
ellipsised, size 12px meta. **Uploading** shows a 5px `--neutral-100` track filled with
`--grad-meter` (the same gradient `Meter` uses), 7px under the name. **Done** and **failed** show a
note 4px under it instead: `Uploaded · virus scan passed` at 400 in `--green-text`, or
`Over the 10 MB limit — compress or split the file.` at 500 in `--red-700`. The remove button is a
26px ghost tile at radius `--r-tile` that turns destructive on hover. Empty:
`No files attached yet.` in a dashed `--border-card` panel, pad `14px 16px`.

The three seeded rows are `matangcas-pnpki.p12` / `3.2 KB` / `P12` / done;
`floorplan-carmen-rhu.pdf` / `8.4 MB` / `PDF` / uploading at 62%; `annex-b2-equipment.xlsx` /
`12.8 MB` / `XLS` / failed.

#### Toasts & inline notices → the toast demo

Extracted 2026-08-31. The toast block is a plain padded body (`18px 24px 22px`), not a grid, and
holds three things in order: a trigger row, a contained "app surface", and its own rule cards.

**Trigger row** — `flex wrap`, gap 8px, `margin-bottom: 14px`: four 34px buttons at radius
`--r-control`, 12.5/500 on `--surface` with the tone's own toast border and an 8px dot; then a flex
spacer; then `Dismiss all`, shown only while the stack is non-empty.

**App surface** — `min-height: 316px`, pad 16, `1px dashed --border-dashed` on `--surface-input`,
radius `--r-panel`, `position: relative; overflow: hidden`, captioned
`App surface — toasts stack bottom-right, newest on top, 5s auto-dismiss`. The toast region sits
`right: 16px; bottom: 16px`, 372px wide, `max-width: calc(100% - 32px)`, 10px between toasts, at
`--z-popover`. Empty: `Fire one above to see the stack.` in a dashed panel at radius 11.

**Toast** — `position: relative; overflow: hidden`, pad `13px 12px 15px 13px`, gap 11, radius
`--r-panel`, `--surface` on a 1px tone border under `--sh-toast`. A 26px icon tile filled with the
tone's link colour carries a white 12/700 glyph; title 13.5/700 `--ink-900`; body 12.5/1.45 meta
2px under it; actions 9px below at gap 14 (the tone-coloured action at 700, then `Dismiss` at 500
meta); a 22px × in the corner; and a 3px timer bar draining `scaleX(1)→0` over 5s.

| Type | Border | Icon / action | Timer dot | Glyph |
|---|---|---|---|---|
| success | `--toast-border-green` | `--green-text` | `--dot-green` | `✓` |
| error | `--red-border` | `--red-700` | `--red-500` | `!` |
| warning | `--toast-border-amber` | `--amber-text` | `--amber-400` | `!` |
| info | `--toast-border-blue` | `--blue-700` | `--blue-700` | `i` |

Copy: `Licence issued` / `16-015-2527-PCF-1 is now active until Dec 31, 2027.` / `View`;
`Upload failed` / `annex-b2-equipment.xlsx exceeds the 10 MB limit.` / `Retry`;
`3 licences expire soon` / `They fall within 90 days — send renewal notices.` / `Review`;
`Draft saved` / `Your remarks were saved but not submitted.` / no action. The page opens with
`Certificate saved` / `Password verified and stored encrypted.` / `Undo` already on screen.

**Rule cards live inside the toast block**, on their own `repeat(auto-fit, minmax(230px,1fr))` grid
at gap 18, `margin-top: 16px` — no top rule, no card borders, no sunken surface, unlike §17.1's
`DemoRules`. The notices strip below is the standard tinted strip, but stacks at **10px**, and
closes with a trailing note: `One line, one pill: the outlined tone label carries the meaning, so
the surface stays almost white.`

#### Dialog, empty state & loading → the three demos

Extracted 2026-08-31. Section body is a grid — `repeat(auto-fit, minmax(300px,1fr))`,
`gap: 22px 24px`, `align-items: start`, padding `18px 24px 24px`. Three uppercase sub-blocks at
`margin-bottom: 10px`; two close with a 12px meta note 8px below.

| Sub-block | Content | Trailing note |
|---|---|---|
| `CONFIRMATION DIALOG` | a 34px outlined-destructive `Revoke certificate` | `Destructive confirmations name the consequence, not the action.` |
| `EMPTY STATE` | the panel below | — |
| `SKELETON ROWS` | the table below | `Three rows only — never a full page of shimmer.` |

**The dialog** is a modal the first block opens. Scrim `--scrim` at `--z-dialog`, `place-items:
center`, pad 24. Content `max-width: 428px`, radius `--r-card`, `--sh-dialog`, `overflow: hidden`.
Body pad `22px 24px 18px`: a header row at gap 10 holding a 30px icon tile (radius `--r-field`,
`--red-50` on `--red-border`, `--red-700`, `!` at 14/700) and the title at **16.5/700**; then the
description at 13.5/1.55 meta, 12px below. Footer: `--surface-sunken` under a 1px `--divider`, pad
`14px 24px`, gap 8, right-aligned — `Keep certificate` (38px secondary) then `Revoke`, which is the
**filled** destructive from Appendix C's `Confirm button` row.

Copy: `Revoke this certificate?` / `You will not be able to sign documents until a new PNPKI
certificate is uploaded and verified. Documents already signed stay valid.`

**Empty state** — pad `30px 20px`, `1px dashed --border-dashed`, radius `--r-panel`, centred: title
`Nothing matches those filters` at **14.5/700**, sub `Clear the search or switch back to all types.`
at 13px meta 4px below, then a 34px secondary `Reset filters` 14px below.

**Skeleton rows** — a bordered card (1px `--divider`, radius `--r-panel`, `overflow: hidden`) of
three rows, each `grid-template-columns: 1.6fr 0.7fr 1fr`, gap 12, pad `14px 16px`, ruled with
`--divider-row`. The bars are deliberately uneven — row 1 `88/64/76%`, row 2 `72/64/76%`, row 3
`88/64/50%` — so the block does not read as a grid of identical strips. Appendix C's
`Skeleton bar` row describes the bar alone; this table shape is D.1 only.

#### Dropdowns → the four inline demos

Extracted from the artifact on 2026-08-30, per the Known limitation above: this section has no
uppercase sub-blocks, so D.1 must carry its markup before the phase can be planned. The section
body is a grid — `repeat(auto-fit, minmax(260px,1fr))`, `gap: 20px 24px`, `align-items: start`,
padding `18px 24px 24px`.

Each of the four demos is named by a **12.5px/500 `#344054` field label** carrying a muted
`#667085` qualifier after a middot, and closed by a **12px `#667085` note** 5px below. These are
field labels, not uppercase sub-block headings — the same treatment `File inputs` uses.

| Demo | Field label | Qualifier | Note beneath |
|---|---|---|---|
| `Select` | `Facility type` | `· single select` | `Placeholder greys out until a value is picked.` |
| `MultiSelect` | `Services` | `· multi select` | `Long lists get an inline filter and a sticky footer.` |
| `InlineFilter` | `Inline filter` | `· table bar` | `34px variant for filter bars, with the field name inline.` |
| `RowMenu` | `Row menu` | `· actions` | `Destructive item sits last, separated by a hairline.` |

**Select** — placeholder `Select a facility type`, shown until a value is picked (initial state is
empty). Options, in order: `Hospital · Level 1`, `Hospital · Level 2`, `Infirmary`,
`Primary Care Facility`, `Birthing Home`, `Clinical Laboratory`, `X-ray Facility`. The selected
option carries a `✓` at 12px/700 `#15803D`.

**MultiSelect** — panel filter input placeholder `Filter services`, 12.5px, borderless on a
transparent background inside the 32px filter field. Options, in order:
`Ambulance Service — Type I`, `Birthing Home`, `Clinical Laboratory — Limited`,
`Clinical Laboratory — Secondary`, `Dental Clinic`, `Pharmacy`, `X-ray Facility` — note the em
dashes. `Pharmacy` and `Birthing Home` start checked. The scroll area is `max-height: 214px`.
When the filter matches nothing, the list is replaced by `No service matches that.` at 12.5px
`#667085`, padding `14px 10px`. The sticky footer is `padding: 9px 12px`, `border-top: 1px #EEF1F6`,
background `#FAFBFD`, holding `Clear` (borderless, transparent, 12.5px/700 `#667085`) at the left
and `Apply` (`padding: 7px 14px`, radius 8px, `#177236` on `#FFF`, 12.5px/700, hover `#125A2B`) at
the right.

**MultiSelect trigger, extracted 2026-08-30 (second pass).** The trigger does **not** show a
count sentence. It shows the **first two selected labels, comma-joined** — `picked.slice(0, 2)
.join(", ")` — ellipsis-truncated by the value span (`flex:1; min-width:0; overflow:hidden;
text-overflow:ellipsis; white-space:nowrap`), falling back to the placeholder `Select services`
when nothing is picked. Beside it, and only when at least one option is picked, sits a **count
badge**: `min-width: 20px`, `height: 20px`, `padding: 0 6px`, `border-radius: 10px`, background
`#E8F6EC`, colour `#15803D`, `11px/700`, grid-centred, `flex: none`. The caret follows.

**MultiSelect panel filter, same pass.** The filter is not a bare input. It sits in its own
section — `padding: 8px 10px`, `border-bottom: 1px #EEF1F6` — holding a bordered field:
`height: 32px`, `padding: 0 10px`, `border: 1px #E4E8EF`, `border-radius: 8px`, background
`#F7F9FC`, `display:flex`, `gap: 8px`. Inside it, a decorative leading glyph — an 11×11px circle,
`border: 1.8px solid #98A2B3`, `border-radius: 50%`, `flex: none` — precedes the input, which is
borderless and transparent at `12.5px` `#1E2532`.

**Option rows in all three select-based dropdowns** share one style function. Unselected:
`#344054` at weight 400. Selected: background `#F2FAF4`, colour `#15803D`, weight 700 — and this
applies to **MultiSelect's checked rows too**, not only to the single selects. The checkbox does
not replace the row tint; both are present.

**InlineFilter** — the trigger shows the field name inline as a `Status:` prefix followed by the
value. Options carry a leading dot: `Active` `#17A34A`, `Expiring soon` `#D9A13B`, `Expired`
`#E5484D`, `All` `#B9C1D1`.

**RowMenu** — the trigger is a 34×34px square, radius 8px, `1px #D5DBE6`, glyph `⋯` at 14px/700
`#667085`, hover background `#F4F6FA`. Its panel sits at `top: 40px`, `min-width: 196px`,
padding 6px, radius 12px. Items, in order: `View LTO document`, `Facility details`, `View logs`,
`Revoke licence`. The first three are 13.5px/400 `#344054`; the last is destructive and separated —
`margin-top: 6px`, `padding-top: 13px`, `border-top: 1px #EEF1F6`, `#B42318`, weight 700.

#### Containers & surfaces → INNER SURFACES

A white card (radius 14, 1px hairline, card shadow, padding `16px 20px 18px`) holding four tint
rows in a `flex-column` with `gap: 10px`. Each row is a filled box of `padding: 11px 13px`,
`border-radius: 10px`, `font-size: 12.5px`, with the caption **inside** it — not a swatch square
beside a label:

| Row | Background | Border | Text colour | Caption |
|---|---|---|---|---|
| 1 | `--surface-sunken` | 1px `--divider` | `--ink-600` | `Sunken strip #FAFBFD — expanded row, footer` |
| 2 | `--surface-input` | 1px `--border-card` | `--ink-600` | `Input well #F7F9FC — read-only fields, panel search` |
| 3 | `--surface-muted` | none | `--ink-600` | `Control shell #F4F6FA — segmented tabs, hover` |
| 4 | none | 1.6px dashed `--border-dashed` | `--text-meta` | `Dashed #CDD5E2 — dropzones and empty states only` |

Below the card, a closing line at 12px in `--text-meta` with `margin-top: 8px`:
`Four tints, each with one job. No new greys.`

The hex values appear as literal text inside the captions — that is content, not styling, and the
demo folder is exempt from the raw-hex guard precisely so blocks like this can quote them.

#### Foundations

**Description:** Every value used anywhere below comes from these four scales. Nothing in the licensing screens introduces a colour, radius, or size that isn't here.


#### Containers & surfaces

**Description:** Three surfaces, and nothing else: the canvas #EEF1F6 that everything sits on, the card #FFF that holds content, and the sunken strip #FAFBFD for headers, footers, and expanded rows inside a card. Cards never nest inside cards — a card divides instead.

**Sub-blocks:**

- `PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT`
- `CARD — HEADER, BODY, FOOTER`
- `DIVIDED CARD — NO NESTING`
- `INNER SURFACES`

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Chips

**Description:** Height auto (20px at 11px type), radius 999, 11px / 700, padding 3px 9px. Tone comes from the meaning, never from decoration.

**Sub-blocks:**

- `INTERACTIVE — FILTER CHIPS`
- `DISMISSIBLE — APPLIED FILTERS`

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Tabs

**Description:** Three variants, one rule: the active item is the only green thing in the row.

**Sub-blocks:**

- `UNDERLINE — PRIMARY, SITS ON A CARD EDGE`
- `SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS`
- `STAGE TABS — A WORKFLOW WITH VOLUME PER STEP`

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Text fields

**Description:** Label 12.5px/500 above, hint or error 12px below. The green ring is the only focus signal.


#### Dropdowns

**Description:** Same 38px shell as a text field. The caret is the only affordance; the panel is a 12px-radius card on a soft shadow.


#### Buttons

**Description:** 38px default, 34px compact, 44px for the one primary action on a mobile-width form. One filled green button per screen region.


#### File inputs

**Description:** Dashed 1.6px border at rest, green on hover. Every uploaded file becomes a row with a type mark, size, and a single destructive action.

**Sub-blocks:**

- `FILE LIST — UPLOADING, DONE, FAILED`


#### Toasts & inline notices

**Description:** Toasts confirm something you just did and leave. Notices explain a state that stays — they live in the layout, never float.

**Sub-blocks:**

- `INLINE NOTICES — PERSISTENT, IN-FLOW`

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Selection controls

**Description:** Checkbox for many, radio for one, switch for something that takes effect the moment you touch it. 17px targets, 10px gap to the label, whole row clickable.

**Sub-blocks:**

- `CHECKBOX · STATES`
- `RADIO · LIST`
- `SWITCH · TAKES EFFECT AT ONCE`
- `CHECKBOX CARDS · MULTI`
- `RADIO CARDS · SINGLE`
- `BULK SELECTION — TABLE HEADER + ACTION BAR`


#### Dialog, empty state & loading

**Description:** The three states a table can be in besides full, plus the one modal pattern — confirmation before an irreversible action.

**Sub-blocks:**

- `CONFIRMATION DIALOG`
- `EMPTY STATE`
- `SKELETON ROWS`


#### Layout primitives — Row, Column & containers

**Description:** Eight primitives cover every screen in OLRS. They own spacing and direction only — never colour, border, or padding of their own — so a screen is composed, not hand-measured. Gaps come from one 4px-based scale: 6, 8, 12, 14, 16, 22, 24, 32.

**Rule cards:**

- **Primitives own spacing only** — A Row sets direction, gap, and alignment. The moment one grows a background or a border it stops being a primitive and becomes a card — put that in Section instead.
- **One gap scale** — 6 and 8 inside a control, 12 between siblings, 14 in table rows, 16 in form rows, 22 between cards, 24 form columns and card padding, 32 page gutter. No 10, no 18, no 20.
- **Gap, never margin** — Spacing lives on the container so drag-reorder, delete, and duplicate keep working. A child with its own margin breaks the rhythm the moment it moves.
- **min-width: 0 on flex children** — Any Row or Grid child holding text that must clip needs it, or the ellipsis silently stops working and the layout widens instead.


#### Stepper

**Description:** Three forms, one rule: a step is only clickable once it has been reached. Horizontal for a form the user is filling, vertical for a record whose history matters, compact where the header has no room.

**Sub-blocks:**

- `HORIZONTAL — A FORM IN PROGRESS`
- `VERTICAL — A RECORD WITH HISTORY`
- `COMPACT — INSIDE A CARD HEADER`
- `ERROR STATE`


#### Form layout

**Description:** A 12-column grid on a 24px gutter, fieldsets separated by a rule rather than a card, and one sticky footer that owns every action. Errors replace help text in place — the row never grows.

**Sub-blocks:**

- `IDENTIFICATION`
- `LOCATION & SERVICES`
- `DARK`


#### App shell — side navigation

**Description:** One rail, two widths. Group headers carry the section, the active item is the only gradient on screen, and a count badge only appears where a number changes what you do next.

**Sub-blocks:**

- `LICENSING`
- `CONFIGURATION`


#### Data table

**Description:** Rebuilt around three ideas: a 3px state stripe replaces reading the status column, the count column carries its own meter so urgency is visible without comparing digits, and the toolbar holds saved views instead of a second row of filters.

**Sub-blocks:**

- `TOOLBAR — SAVED VIEWS`
- `TABLE`
- `FOOTER — ROWS PER PAGE`

#### Type scale

**Description:** DM Sans at three weights — 400 body, 500 labels, 700 anything that titles something. JetBrains Mono for numbers you might copy.

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Component specs

**Description:** Redlines for everything above — geometry, type, and the exact colour per state. Values are literal CSS.


#### Dark mode

**Sub-blocks:**

- `CHIPS & TONES`
- `TABS & STAGE CARDS`
- `FIELDS & DROPDOWN`
- `SELECTION & FILES`
- `DIALOG, EMPTY, SKELETON & PAGINATION`
- `TOASTS, NOTICES & TABLE`

**Rule cards:**

- **Depth by surface, not shadow** — --sh-card and --sh-primary become none; a card reads as raised because #161C26 sits on #0F141C. Only toasts, panels, and dialogs keep a shadow, and it goes darker rather than softer.
- **The fill flips its text** — White on a dark-mode green never clears 4.5:1 at a usable brightness, so the filled green lightens to #2FB25F and takes #0B1017 text (6.95:1). Read it from --green-on-fill so one button component serves both themes.
- **Tints become translucent** — Every status tint is the tone at 14–24% over whatever surface it lands on — 7% for neutral chips and row hover — paired with the light tone as text — so a chip works on a card, a sunken strip, and a hovered row without a third value.
- **Geometry never changes** — Same 38px fields, 9px radius, 22px chips, 32px notices, 24px gutters. Dark mode is a palette swap — if a size changes between themes, it is a bug.


#### Tokens for handoff

**Description:** Paste this block into your stylesheet first, then build components against the variables — not raw hex. Every value above resolves to one of these.

**Rule cards:**

- **{{ rule.title }}** — {{ rule.body }}


#### Rule-card data

#### toastRules

- **One line, one consequence** — Title names what happened, body carries the detail a user would otherwise go looking for.
- **Actions live in the toast** — Undo, Retry, and View belong here — a toast with no action and no detail should have been a quiet state change.
- **Three at most** — Older toasts drop off the bottom of the stack; a fourth event means the page itself should say something.

#### handoffRules

- **Tokens first, components second** — Land olrs-tokens.css before any component work, then let every rule reference a variable. Raw hex in a component file is the bug.
- **Height is the contract** — 38px fields and 34px compact controls line up across filter bars, forms, and table toolbars. If a control does not fit one of those two heights, it is the wrong control.
- **One green per region** — A screen region gets exactly one filled green button. Everything else is outline, ghost, or destructive outline.
- **Tone means state, never decoration** — Green issued, amber waiting or legacy, red blocked or overdue, blue portal-filed, violet modification, grey closed. No other pairings.

#### containerRules

- **Cards never nest** — A card that needs internal structure divides with 1px #EEF1F6 rules or drops to a sunken strip. Two stacked shadows means the layout is wrong.
- **22px between cards, 24px inside** — Section gap 22px, card gutter 24px (20px on narrow cards), 12px between cards in a stat grid. Nothing else.
- **One elevation per layer** — Cards 0 1px 2px, popovers 0 12px 28px, dialogs 0 24px 60px. Elevation signals layer, never importance.

#### chipRules

- **One tone per meaning** — Green = good or issued, amber = waiting or legacy, red = blocked or overdue, grey = neutral, purple = modification.
- **Never two chips of the same tone** — If a row needs two amber chips, one of them is really a field, not a chip. Move it into the label line.
- **Chips never wrap mid-phrase** — white-space: nowrap, and overflow collapses into a grey “+n more” that expands the row.

#### typeRules

Missed by the original rule-card extraction — its regex did not match this array's shape, so
Appendix D showed a `**Rule cards:**` heading under `Type scale` with nothing beneath it.

- **Three weights only** — 400 for prose, 500 for field labels and values, 700 for titles and figures. No 600 — DM Sans's 500 already reads as emphasis.
- **Tighten as you scale up** — Anything above 20px takes -0.015em; anything under 12px takes +0.08em and uppercase. Body text stays at 0.
- **Mono earns its place** — JetBrains Mono only for values a user might copy or compare digit by digit — LTO numbers, serials, dates in tables.

#### tabRules

- **Underline for content, segmented for filters** — Underline tabs swap what the table shows. Segmented chips narrow what's already shown.
- **Counts belong on tabs, not beside them** — A mono count inside the tab keeps the row scannable and stops the label from shifting when numbers change.
- **Never nest two tab rows** — If a view needs a second axis, that axis is a filter — put it in the bar below.
