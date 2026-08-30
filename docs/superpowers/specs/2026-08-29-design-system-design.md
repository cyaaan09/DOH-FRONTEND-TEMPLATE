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

- **Chip row gaps differ by context.** The tone-chip rows use `gap 7px`; the filter-chip row uses
  `gap 8px`. The conformance pass set `ChipGroup` to 7px globally.
- **`FilterChip` has no mark.** The artifact's filter chips carry a checkbox-style mark glyph inside
  the chip; ours renders the label alone.
- **Two Chip variants are missing** that the artifact shows: count badges (`13`, `8`, `+4 more`) and
  overflow/expiry pills (`128 days left`, `36 days left`).
- **2026-08-30 — `MultiSelect`'s filter input and footer buttons are children of `role="listbox"`.**
  Zag's `getContentProps()` sets `role: "listbox"` when `composite` (the default, verified against
  the installed `@zag-js/select` source), and ARIA 1.2 allows only `option`/`group` as listbox
  children. This is the structural cost of putting the redlined filter and footer inside the panel.
  Recorded as a known limitation, not scheduled for a fix: `composite: false` (role `dialog`) is the
  escape hatch if screen-reader testing shows a real problem.
- **2026-08-30 — Appendix D.1's Dropdowns grid conflicts with §17.1's generic `DemoBlocks` chrome.**
  D.1 records `minmax(260px,1fr)`, `gap: 20px 24px`, padding `18px 24px 24px`; `DemoBlocks` (§17.1)
  implements `minmax(268px,1fr)`, `gap: 24px`, padding `18px 24px 6px`. The visible difference is the
  card's bottom edge, 6px vs 24px. The shared chrome deliberately wins for now — `DemoBlocks` is
  reused across every section, so changing it to match Dropdowns exactly would move every other
  section's grid too. D.1 is the more specific authority if this is revisited.

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

### App shell — sidebar & header

_rail 244px · item 9px radius · header 12px 32px sticky_

| Property | Value |
|---|---|
| Rail width | 244px expanded · 62px collapsed (transition 160ms ease) |
| Rail surface | #FFF · 1px right #E4E8EF · sticky top 0 · h 100vh |
| Brand block | pad 16px 16px 13px · 1px bottom #EEF1F6 · gap 10px |
| Logo tile | 30×30px · radius 9px · #14532D · #D9F2C4 10.5px / 700 |
| Group header | pad 14px 8px 7px · 10.5px / 700 / 0.1em · #5A6577 |
| Nav item | pad 8px 10px · radius 9px · gap 10px · 13.5px / 400 #4B5565 |
| Nav active | linear-gradient(180deg,#177236,#125A2B) · #FFF / 700 = 6.01:1 at the lightest stop |
| Nav hover | #F4F6FA bg · #1E2532 text |
| Item mark | 13px · 1.8px #B3BDCD — square PTC, circle LTO, diamond config |
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
| Min table width | 1020–1180px inside overflow-x:auto |
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
