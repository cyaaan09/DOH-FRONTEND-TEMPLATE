# Using the design system

69 components, one token palette, two themes. This page is how to use them; the
generated [API reference](./api.md) is what each one takes.

Everything here is already wired into this template — if you started from it,
there is nothing to install.

## The short version

```vue
<script setup>
import { Card, CardHeader, CardBody, Button, TextField } from '@/design-system'
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <Card>
    <CardHeader title="Facility" subtitle="Basic details" />
    <CardBody>
      <TextField v-model="name" label="Facility name" hint="As registered with the LGU." />
      <Button variant="primary">Save</Button>
    </CardBody>
  </Card>
</template>
```

Every component comes from the one entry point:

```js
import { Button, DataTable, useTheme, GAPS } from '@/design-system'
```

There is no deep-import path. If something is not exported from
`src/design-system/index.js`, it is internal and will change without notice.

## See it running

`npm run dev`, then open **`/design-system`**. That page renders all 28
sections of the source design — every component in every state, with the
redlines it was built from in the "Component specs" section at the bottom.

It is the fastest way to answer "what does this look like" and "which variant do
I want", and it is generated from the same spec the components were built
against, so it cannot drift from them silently.

## Tokens, not values

**Never write a literal colour, radius, height or duration in application
code.** The palette is a single source of truth, and a hardcoded `#25A94E` is
invisible to the dark theme — it will stay bright green on a dark card.

Four stylesheets, imported in this order by `src/assets/main.css`:

| File | What it holds |
| --- | --- |
| `styles/tokens.css` | the light palette on `:root` — every colour, radius, height, gap, shadow, duration |
| `styles/tokens.dark.css` | the same names re-declared under `[data-theme="dark"]` |
| `styles/theme.css` | the Tailwind v4 `@theme` bridge that turns those tokens into utilities |
| `styles/base.css` | element defaults, plus the reduced-motion and coarse-pointer rules |

Because of the bridge, you use tokens as ordinary Tailwind utilities:

```html
<div class="bg-surface text-ink-700 border border-hairline rounded-card">
```

Two things about the bridge that will otherwise cost you an afternoon:

- **Border utilities come from the `--color-*` namespace.** `--color-border-card`
  generates `border-border-card`, so the bridge renames three of them. The real
  utilities are **`border-field`**, **`border-hairline`** and **`border-soft`**.
- **An unbridged token generates no CSS at all** — no error, no utility, nothing.
  If a class silently does nothing, check that its token is bridged in
  `theme.css`. A test enforces both directions, so this only bites on tokens you
  add yourself.

Heights come from tokens too: `--h-field` (38px), `--h-compact` (34px),
`--h-touch` (44px). Do not write the numbers.

### The gap scale

Layout gaps are restricted to `6, 8, 12, 14, 16, 22, 24, 32` — exported as
`GAPS`. There is deliberately **no 10, 18 or 20**: those are the values a
hand-measured layout drifts into, and every layout primitive validates its `gap`
against the list, so the drift fails in dev instead of being noticed six screens
later.

## Theming

```js
import { useTheme } from '@/design-system'

const { isDark, toggleTheme } = useTheme()
```

The system is authored against `[data-theme="dark"]` on `<html>`, **not** a
`.dark` class. `useTheme` wraps VueUse's `useDark` and persists the choice under
the `theme` storage key.

> If you are writing a test that needs the dark theme, **click the real toggle**.
> Setting `data-theme` by hand looks like it works and does not: `useDark`'s
> watcher rewrites the attribute within a tick, so the test measures the light
> theme and passes while checking nothing. This has already happened once here.

## Composing a screen

Reach for the layout primitives before writing a wrapper div with padding.
`Row`, `Column`, `Cluster`, `Split`, `Grid`, `GridItem`, `AutoGrid`, `Sidebar`,
`Page` and `Section` set **direction, gap and alignment only** — no colour, no
border, no padding of their own. A screen is composed from them rather than
hand-measured, and a test enforces that they stay that way.

```vue
<Page>
  <Section title="Applications">
    <Split>
      <SearchField v-model="q" label="Search" />
      <Row :gap="8"><Button variant="secondary">Export</Button><Button>New</Button></Row>
    </Split>
    <DataTable :columns="columns" :rows="rows" v-model:selected="selected" />
  </Section>
</Page>
```

For a full application frame — rail, header, main — use `AppShell`, which also
carries the skip link that keyboard users need to get past the navigation.

## Conventions worth knowing

**Fields own their own label.** Pass `label` to `TextField`, `Select`,
`Checkbox` and the rest; do not draw your own `<label>` beside them. If a field
must render without a visible label, still pass `label` and set `bare` — the
component turns it into an `aria-label` so the field keeps its accessible name.

**One message slot per field.** `hint` and `error` share a slot with a reserved
height, so a form does not change height when it validates. `error` replaces
`hint`; they never appear together.

**Tone carries meaning, and never alone.** Green = good or issued, amber =
waiting or legacy, red = blocked or overdue, grey = neutral, purple =
modification. Every tone is paired with a word, because colour is never the only
signal. No row should show two chips of the same tone — if it needs to, one of
them is a field, not a chip.

**Icon-only controls need a name.** `aria-label` on every one, and a `title` if
it is a table affordance. A bare `⋯` announces nothing.

**Tables are real tables.** `DataTable` renders `<table>` with `<th scope="col">`
and CSS grid for the layout. If you build another table, do the same — grid CSS
is fine, faked headers are not.

## What the gates check

```bash
npm run test:unit    # 654 unit tests
npm run test:e2e     # 43 Playwright tests, production build on :5178
npm run verify:css   # the CSS actually builds and emits what it should
npm run lint         # oxlint + eslint
```

The Playwright suite is worth knowing about, because it covers the things unit
tests structurally cannot:

| Spec | What it guards |
| --- | --- |
| `smoke` | every section in the manifest renders |
| `layout` | geometry, insets, focus traps, the toast stack |
| `responsive` | five viewports, no horizontal scroll, nothing overflows its card |
| `a11y` | the ARIA contract across the whole page at once |
| `touch` | a real coarse pointer — 44px targets, no sticky `:hover` |
| `dark` | the dark theme actually paints dark |

E2E needs a one-time `npx playwright install chromium`.

## If you change a component

1. The redlines it was built from are in
   [the spec](../superpowers/specs/2026-08-29-design-system-design.md) — Appendix C
   is the authority, and the demo page renders it verbatim.
2. Run the gates. All four.
3. If you added or changed a prop, regenerate the reference:
   ```bash
   node scripts/build-api-docs.mjs
   ```
   A test fails if `api.md` is stale, so this is not optional — but it is one
   command, and the reference is never hand-edited.

One warning from experience on this codebase: **a guard you write can pass while
checking nothing.** Four of the tests written here were vacuous when first
written and looked fine. Before you trust a new test, break the thing it
watches and confirm it goes red.
