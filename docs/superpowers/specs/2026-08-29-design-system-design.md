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
| `text-meta` | 12px | 400 | — |
| `text-column-header` | 10.5px | 700 | tracking 0.08em |
| `text-mono` | 12.5px | 500 | — |

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

A `/design-system` route reproducing all 16 sections of the source canvas. This is the acceptance test — checked side-by-side against the artifact in **both** themes. Each phase appends its own sections, so the page grows with the system.

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
