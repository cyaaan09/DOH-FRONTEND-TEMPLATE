# Design System Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the hand-written primitive components — Button, Chip, Card, text inputs, StatCard, Meter, Notice, Skeleton — on the Phase 1 token foundation, plus the type-scale bridge and the kitchen-sink page that proves them.

**Architecture:** Every component is a Vue SFC authored in Tailwind utilities that resolve through the design tokens, dropping into a small `<style scoped>` block only for gradients, focus rings and keyframe animations — the things no utility namespace covers. Components take `variant` / `tone` / `size` props rather than accepting class overrides, so the system stays closed. A barrel export keeps the family sub-folders invisible to consumers.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, Vitest 4 + `@vue/test-utils`, VueUse 14

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — read §3, §3.1, §6, §8, §12 and §13 alongside this plan.

**Phase:** 2 of 5. Phase 1 (foundations) is complete and merged into branch `design-system`. Phase 3 (Ark-backed components), Phase 4 (composites) and Phase 5 (docs) follow.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **No raw hex colours** in any file under `src/design-system/components/`. Use token utilities (`bg-surface`) or `var(--token)` in `<style>`. Enforced by `guards.spec.js`.
- **No `dark:` variants** anywhere in `src/design-system/`. Dark mode is a palette swap on `[data-theme="dark"]` and nothing else. Enforced by `guards.spec.js`.
- **No arbitrary type sizes.** Never `text-[13.5px]` — use the `text-*` scale from Task 1. This is a review point; no static guard catches it.
- **Dependency direction is one-way:** nothing under `src/design-system/` may import from `src/components/`. Enforced by test in Task 2.
- CSS variable names in `tokens.css` / `tokens.dark.css` are verbatim from the spec appendices — those two files are **frozen**, never edited.
- Geometry is theme-invariant. Sizes come from `h-field` (38px), `h-compact` (34px), `h-touch` (44px); radii from `rounded-field` / `rounded-card` / `rounded-pill`.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run tests with `npx vitest run` — `test:unit` is watch mode and will hang.
- Commit messages carry **no** `Co-Authored-By` trailer.

## File Structure

```
src/design-system/
  styles/theme.css                    MODIFIED — adds the --text-* scale
  index.js                            MODIFIED — barrel re-exports every component
  components/
    forms/     Button.vue TextField.vue Textarea.vue SearchField.vue
    surfaces/  Card.vue CardHeader.vue CardBody.vue CardFooter.vue
               StatCard.vue Meter.vue
    feedback/  Chip.vue ChipGroup.vue DismissibleChip.vue
               Notice.vue Skeleton.vue
  demo/        DemoSection.vue ButtonsDemo.vue ChipsDemo.vue
               CardsDemo.vue FieldsDemo.vue FeedbackDemo.vue TypeScaleDemo.vue
  testing/guards.js                   MODIFIED — adds findAppImports
src/components/README.md              CREATED — the app boundary rule
src/pages/design-system.vue           CREATED — the kitchen-sink route
```

`Chip` lives under `feedback/` rather than its own folder because chips in this system carry status meaning — the same tone vocabulary as `Notice`. `selects/`, `selection/`, `tabs/`, `overlays/`, `files/`, `data/` and `shell/` are created empty-by-omission; Phase 3 and 4 add them.

---

### Task 1: Type scale bridge

Defines the nine text styles from spec §6 in the Tailwind `--text-*` namespace, so components never write an arbitrary size.

**Files:**
- Modify: `src/design-system/styles/theme.css`
- Test: `src/design-system/styles/__tests__/theme-bridge.spec.js`

**Interfaces:**
- Consumes: the existing `@theme` block in `theme.css` (which already owns `--font-sans` / `--font-mono` as literals).
- Produces: utilities `text-page-title`, `text-card-figure`, `text-section-title`, `text-row-title`, `text-body`, `text-field-label`, `text-hint`, `text-column-header`, `text-mono`. Every later task uses these.

- [ ] **Step 1: Write the failing test**

Append to `src/design-system/styles/__tests__/theme-bridge.spec.js`, inside the existing top-level `describe('tailwind theme bridge', ...)` block:

```js
  it('defines the nine text styles from spec §6', () => {
    const expected = {
      'text-page-title': '26px',
      'text-card-figure': '23px',
      'text-section-title': '17px',
      'text-row-title': '14px',
      'text-body': '13.5px',
      'text-field-label': '12.5px',
      'text-hint': '12px',
      'text-column-header': '10.5px',
      'text-mono': '12.5px',
    }
    for (const [name, size] of Object.entries(expected)) {
      expect(bridge.get(name), `missing --${name}`).toBe(size)
    }
  })

  it('carries leading, tracking and weight on the scale names', () => {
    expect(bridge.get('text-body--line-height')).toBe('1.55')
    expect(bridge.get('text-page-title--letter-spacing')).toBe('-0.015em')
    expect(bridge.get('text-card-figure--letter-spacing')).toBe('-0.01em')
    expect(bridge.get('text-column-header--letter-spacing')).toBe('0.08em')
    expect(bridge.get('text-page-title--font-weight')).toBe('700')
    expect(bridge.get('text-field-label--font-weight')).toBe('500')
  })

  it('declares the scale as literals, never as var() references', () => {
    // The scale lives in theme.css because tokens.css has no size tokens and
    // is frozen verbatim. A var() here would dangle.
    const scaleRefs = [...bridge.entries()].filter(
      ([name, value]) => name.startsWith('text-') && value.startsWith('var('),
    )
    expect(scaleRefs).toEqual([])
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: FAIL — `missing --text-page-title`.

- [ ] **Step 3: Add the scale to theme.css**

Add to the **existing plain `@theme` block** in `src/design-system/styles/theme.css` (the one holding `--font-sans` / `--font-mono`), not the `@theme inline` block — these are literal values, not bridged tokens:

```css
  /* Type scale — spec §6. Literals, not bridged: the source document states
   * the scale as values and never tokenised it, and tokens.css is frozen
   * verbatim. Tailwind carries leading/tracking/weight on the same name, so
   * one utility sets a whole style. --text-* cannot carry font-family, so the
   * mono style pairs with `font-mono`. */
  --text-page-title: 26px;
  --text-page-title--font-weight: 700;
  --text-page-title--letter-spacing: -0.015em;

  --text-card-figure: 23px;
  --text-card-figure--font-weight: 700;
  --text-card-figure--letter-spacing: -0.01em;

  --text-section-title: 17px;
  --text-section-title--font-weight: 700;

  --text-row-title: 14px;
  --text-row-title--font-weight: 700;

  --text-body: 13.5px;
  --text-body--line-height: 1.55;
  --text-body--font-weight: 400;

  --text-field-label: 12.5px;
  --text-field-label--font-weight: 500;

  /* Named `hint`, not `meta`: tokens.css already has a COLOUR called
   * --text-meta (#667085), bridged to --color-text-meta. A type style of the
   * same name would give the confusing pair `text-meta` (size) and
   * `text-text-meta` (colour). Spec §6 calls this row "Meta / hint". */
  --text-hint: 12px;
  --text-hint--font-weight: 400;

  --text-column-header: 10.5px;
  --text-column-header--font-weight: 700;
  --text-column-header--letter-spacing: 0.08em;

  --text-mono: 12.5px;
  --text-mono--font-weight: 500;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: PASS.

If the existing token→bridge coverage test now fails complaining about `text-*` names, that test compares `tokens.css` against the bridge — the scale is not in `tokens.css`, so it should not be implicated. If it is, the coverage test is reading the wrong direction; fix the test, not the scale.

- [ ] **Step 5: Confirm the build still passes**

Run: `npm run verify:css`
Expected: passes as before.

Do **not** add `.text-body` or `.text-column-header` assertions to `scripts/verify-css-build.mjs` yet. Tailwind only emits a utility it sees used in markup, and nothing uses the scale until Task 9's demo page — asserting them here would leave the build gate red for every task in between. Task 9 adds those assertions once the page satisfies them.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/styles/theme.css src/design-system/styles/__tests__/theme-bridge.spec.js
git commit -m "feat(ds): bridge the type scale as text-* utilities"
```

---

### Task 2: Scaffolding, barrel and the import-direction guard

Creates the folder structure, the app boundary documentation, and the test that keeps the design system liftable.

**Files:**
- Create: `src/components/README.md`
- Modify: `src/design-system/testing/guards.js`
- Modify: `src/design-system/testing/__tests__/guards.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `findRawHex(source)` and `findDarkVariants(source)` already exported from `guards.js`.
- Produces: `findAppImports(source) => string[]`, returning offending import specifiers. Barrel `src/design-system/index.js` gains component exports appended by Tasks 3-8.

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/testing/__tests__/guards.spec.js`:

```js
describe('findAppImports', () => {
  it('catches an alias import from the app components directory', () => {
    expect(findAppImports("import Foo from '@/components/Foo.vue'")).toEqual([
      '@/components/Foo.vue',
    ])
  })

  it('catches a relative import that climbs into app components', () => {
    expect(findAppImports("import Foo from '../../components/Foo.vue'")).toEqual([
      '../../components/Foo.vue',
    ])
  })

  it('allows imports within the design system', () => {
    expect(findAppImports("import Chip from '../feedback/Chip.vue'")).toEqual([])
    expect(findAppImports("import { useTheme } from '@/design-system'")).toEqual([])
  })

  it('allows package imports', () => {
    expect(findAppImports("import { ref } from 'vue'")).toEqual([])
    expect(findAppImports("import { useDark } from '@vueuse/core'")).toEqual([])
  })
})
```

Leave the existing `describe('design-system components', ...)` block alone — it scans `components/` for hex and `dark:`, which is still correct. Add a **new** block beside it, because import direction applies to the whole design system, not just components:

```js
describe('design-system import direction', () => {
  // Spec §3.1: app code may import the design system; the design system may
  // never import app code, or it cannot be lifted into a package.
  it('never imports from src/components', () => {
    const violations = []
    for (const file of listDesignSystemFiles()) {
      const source = readFileSync(file, 'utf8')
      for (const spec of findAppImports(source)) violations.push(`${file}: ${spec}`)
    }
    expect(violations).toEqual([])
  })
})
```

Add this helper beside the existing `listComponents()` in the same file:

```js
const DESIGN_SYSTEM_DIR = 'src/design-system'

/** Every .vue and .js file in the design system, excluding test files. */
function listDesignSystemFiles() {
  try {
    return readdirSync(DESIGN_SYSTEM_DIR, { recursive: true })
      .map((name) => String(name))
      .filter((name) => /\.(vue|js)$/.test(name) && !name.includes('__tests__'))
      .map((name) => join(DESIGN_SYSTEM_DIR, name))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/testing/__tests__/guards.spec.js`
Expected: FAIL — `findAppImports is not a function`.

- [ ] **Step 3: Implement the detector**

Add to `src/design-system/testing/guards.js`:

```js
// An import whose specifier resolves into the app's own components directory.
// Matches the '@/components/...' alias and any relative path ending in a
// '../components/' segment. Written with a capture group rather than a
// lookbehind, which is not portable across JS engines.
const APP_IMPORT = /from\s+['"]((?:@\/components|(?:\.\.\/)+components)\/[^'"]*)['"]/g

/**
 * @param {string} source file contents
 * @returns {string[]} import specifiers that reach into src/components
 */
export function findAppImports(source) {
  return [...source.matchAll(APP_IMPORT)].map((match) => match[1])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/testing/__tests__/guards.spec.js`
Expected: PASS. The directory scan passes vacuously — no components exist yet.

- [ ] **Step 5: Create the component folders and the app boundary README**

Create the family folders with `.gitkeep` files so the structure is visible before components land:

```bash
for d in surfaces forms selects selection tabs overlays files feedback data shell; do
  mkdir -p "src/design-system/components/$d"
  touch "src/design-system/components/$d/.gitkeep"
done
```

Create `src/components/README.md`:

```markdown
# App components

Components for **this app only**. The design system in `src/design-system/`
holds components that could ship in **any** project built from this template.

## Which goes where

The test is whether the component knows anything about a business domain.

| Here (`src/components/`) | `src/design-system/components/` |
|---|---|
| `LicenceStatusChip` — maps `expiring` → amber | `Chip` — takes a `tone` prop |
| `FacilitySearchBar` — wired to facility filters | `SearchField`, `InlineFilter` |
| `FacilityTable` — your columns and API shape | `DataTable` — takes columns and rows |

A component here is usually a thin wrapper that encodes a policy decision
("expiring licences are amber"), which has no place in a reusable template:

```vue
<script setup>
import { Chip } from '@/design-system'
const TONES = { active: 'green', expiring: 'amber', expired: 'red' }
defineProps({ status: String })
</script>

<template>
  <Chip :tone="TONES[status] ?? 'neutral'">{{ status }}</Chip>
</template>
```

## The one hard rule

Components here may import from `@/design-system` freely.
**Nothing in `src/design-system/` may import from here** — that would make the
design system impossible to extract into a package without dragging one app's
domain concepts along. Enforced by `src/design-system/testing/__tests__/guards.spec.js`.
```

- [ ] **Step 6: Run the full suite and lint**

Run: `npx vitest run && npm run lint`
Expected: all green. The import-direction scan passes with no design-system components yet.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/testing/ src/design-system/components/ src/components/README.md
git commit -m "feat(ds): scaffold component families and guard import direction"
```

---

### Task 3: Button

The first component. Establishes the pattern every later one follows: utilities for everything a namespace covers, a small `<style scoped>` block for the gradient, focus ring and spinner.

**Files:**
- Create: `src/design-system/components/forms/Button.vue`
- Create: `src/design-system/components/forms/__tests__/Button.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `text-body` from Task 1; `findRawHex` / `findDarkVariants` guards from Task 2 now scan this file.
- Produces: `<Button variant size busy disabled type>` exported from `@/design-system`. Props: `variant` ∈ `primary | secondary | destructive | ghost` (default `primary`), `size` ∈ `default | compact | touch` (default `default`), `busy` and `disabled` booleans, `type` string (default `button`). Later tasks and demo sections use these exact names.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/forms/__tests__/Button.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Verify & save' } })
    expect(wrapper.text()).toBe('Verify & save')
  })

  it('defaults to a primary button of field height', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('btn--primary')
    expect(wrapper.classes()).toContain('h-field')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('maps each variant to its own token classes', () => {
    expect(mount(Button, { props: { variant: 'secondary' } }).classes()).toContain('border-field')
    expect(mount(Button, { props: { variant: 'destructive' } }).classes()).toContain('text-red-700')
    expect(mount(Button, { props: { variant: 'ghost' } }).classes()).toContain('text-ink-600')
  })

  it('maps each size to a geometry token, never a raw pixel value', () => {
    expect(mount(Button, { props: { size: 'compact' } }).classes()).toContain('h-compact')
    expect(mount(Button, { props: { size: 'touch' } }).classes()).toContain('h-touch')
  })

  it('disables itself and announces busy while busy', () => {
    const wrapper = mount(Button, { props: { busy: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-spinner]').exists()).toBe(true)
  })

  it('has no spinner and no aria-busy when idle', () => {
    const wrapper = mount(Button)
    expect(wrapper.find('[data-spinner]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('falls back to primary when handed an unknown variant', () => {
    // Guards against a typo silently rendering an unstyled button.
    const wrapper = mount(Button, { props: { variant: 'nonsense' } })
    expect(wrapper.classes()).toContain('btn--primary')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/forms/__tests__/Button.spec.js`
Expected: FAIL — cannot resolve `../Button.vue`.

- [ ] **Step 3: Implement Button**

Create `src/design-system/components/forms/Button.vue`:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const SIZES = {
  default: 'h-field px-4',
  compact: 'h-compact px-3',
  touch: 'h-touch px-5',
}

const VARIANTS = {
  primary: 'btn--primary text-green-on-fill',
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted',
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50',
  ghost: 'text-ink-600 hover:bg-surface-muted',
}

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.default)
const variantClass = computed(() => VARIANTS[props.variant] ?? VARIANTS.primary)
</script>

<template>
  <button
    class="btn inline-flex items-center justify-center gap-2 rounded-field text-body font-medium whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    :class="[sizeClass, variantClass]"
    :type="type"
    :disabled="disabled || busy"
    :aria-busy="busy || undefined"
  >
    <span v-if="busy" data-spinner class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
/* Gradient, focus ring and keyframe animation have no utility namespace —
 * spec §4.2 routes those through var() here. */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.btn--primary {
  background: var(--grad-primary);
  box-shadow: var(--sh-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--green-fill-hover);
}

.btn__spinner {
  width: 13px;
  height: 13px;
  flex: none;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 600ms linear infinite;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/forms/__tests__/Button.spec.js`
Expected: PASS — 7 tests.

- [ ] **Step 5: Export from the barrel**

Add to `src/design-system/index.js`:

```js
export { default as Button } from './components/forms/Button.vue'
```

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run`
Expected: all green, including the guards — Button contains no raw hex and no `dark:` variant.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/components/forms/ src/design-system/index.js
git commit -m "feat(ds): add Button primitive"
```

---

### Task 4: Chip family

Chips carry status meaning through a shared tone vocabulary that `Notice` reuses in Task 8. Adds the 11px chip type style, which the spec §6 scale does not cover because the source document specifies it in the chips redline instead.

**Files:**
- Create: `src/design-system/components/feedback/Chip.vue`
- Create: `src/design-system/components/feedback/ChipGroup.vue`
- Create: `src/design-system/components/feedback/DismissibleChip.vue`
- Create: `src/design-system/components/feedback/__tests__/Chip.spec.js`
- Modify: `src/design-system/styles/theme.css`, `src/design-system/index.js`

**Interfaces:**
- Consumes: nothing from Tasks 3.
- Produces: `<Chip tone dot>` where `tone` ∈ `neutral | green | amber | red | blue | violet` (default `neutral`) and `dot` is a boolean. `<ChipGroup>` wraps chips in a gap row. `<DismissibleChip chipKey value>` emits `dismiss`. Task 8's `Notice` reuses the same `tone` vocabulary; Task 9's demo renders all six.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/feedback/__tests__/Chip.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Chip from '../Chip.vue'
import ChipGroup from '../ChipGroup.vue'
import DismissibleChip from '../DismissibleChip.vue'

describe('Chip', () => {
  it('renders its slot content', () => {
    expect(mount(Chip, { slots: { default: 'Active' } }).text()).toBe('Active')
  })

  it('defaults to the neutral tone', () => {
    expect(mount(Chip).classes()).toContain('bg-neutral-100')
  })

  it('maps every tone to its own token pair', () => {
    const cases = {
      green: ['bg-green-100', 'text-green-text'],
      amber: ['bg-amber-100', 'text-amber-text'],
      red: ['bg-red-100', 'text-red-700'],
      blue: ['bg-blue-100', 'text-blue-700'],
      violet: ['bg-violet-100', 'text-violet-700'],
    }
    for (const [tone, classes] of Object.entries(cases)) {
      const wrapper = mount(Chip, { props: { tone } })
      for (const cls of classes) {
        expect(wrapper.classes(), `tone=${tone}`).toContain(cls)
      }
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Chip, { props: { tone: 'nonsense' } }).classes()).toContain('bg-neutral-100')
  })

  it('renders a decorative dot only when asked', () => {
    expect(mount(Chip, { props: { dot: true } }).find('[data-dot]').exists()).toBe(true)
    expect(mount(Chip).find('[data-dot]').exists()).toBe(false)
  })

  it('hides the dot from assistive tech', () => {
    const dot = mount(Chip, { props: { dot: true } }).find('[data-dot]')
    expect(dot.attributes('aria-hidden')).toBe('true')
  })
})

describe('ChipGroup', () => {
  it('renders its chips in a gapped row', () => {
    const wrapper = mount(ChipGroup, {
      slots: { default: '<span class="chip-stub" />' },
    })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.find('.chip-stub').exists()).toBe(true)
  })
})

describe('DismissibleChip', () => {
  it('shows the key and value', () => {
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    expect(wrapper.text()).toContain('Status:')
    expect(wrapper.text()).toContain('Active')
  })

  it('emits dismiss with its value when the remove button is pressed', async () => {
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toEqual([['Active']])
  })

  it('labels the remove button for screen readers', () => {
    const wrapper = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Remove Status: Active')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Chip.spec.js`
Expected: FAIL — cannot resolve `../Chip.vue`.

- [ ] **Step 3: Add the chip type style**

Add to the plain `@theme` block in `src/design-system/styles/theme.css`, below the type scale:

```css
  /* Chips are 11px/700 per the source document's chips redline. Not part of
   * the spec §6 scale, which covers prose and table styles only. */
  --text-chip: 11px;
  --text-chip--font-weight: 700;
```

- [ ] **Step 4: Implement the three components**

Create `src/design-system/components/feedback/Chip.vue`:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  dot: { type: Boolean, default: false },
})

const TONES = {
  neutral: 'bg-neutral-100 text-ink-600',
  green: 'bg-green-100 text-green-text',
  amber: 'bg-amber-100 text-amber-text',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
}

const toneClass = computed(() => TONES[props.tone] ?? TONES.neutral)
</script>

<template>
  <span
    class="chip inline-flex items-center gap-1.5 rounded-pill text-chip whitespace-nowrap"
    :class="toneClass"
  >
    <span v-if="dot" data-dot class="chip__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
/* --chip-pad (3px 9px) has no utility namespace — spec §4.2. */
.chip {
  padding: var(--chip-pad);
}

.chip__dot {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}
</style>
```

Create `src/design-system/components/feedback/ChipGroup.vue`:

```vue
<template>
  <div class="flex flex-wrap items-center gap-chip-row">
    <slot />
  </div>
</template>
```

Create `src/design-system/components/feedback/DismissibleChip.vue`:

```vue
<script setup>
defineProps({
  chipKey: { type: String, required: true },
  value: { type: String, required: true },
})

const emit = defineEmits(['dismiss'])
</script>

<template>
  <span
    class="chip inline-flex items-center gap-1.5 rounded-pill text-chip whitespace-nowrap bg-surface border border-soft text-ink-600"
  >
    <span class="text-ink-500">{{ chipKey }}</span>
    <span>{{ value }}</span>
    <button
      type="button"
      class="chip__remove"
      :aria-label="`Remove ${chipKey} ${value}`"
      @click="emit('dismiss', value)"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.chip {
  padding: var(--chip-pad);
}

.chip__remove {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
  line-height: 1;
}

.chip__remove:hover {
  color: var(--ink-700);
  background: var(--surface-muted);
}

.chip__remove:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Chip.spec.js`
Expected: PASS — 10 tests.

- [ ] **Step 6: Export from the barrel**

Add to `src/design-system/index.js`:

```js
export { default as Chip } from './components/feedback/Chip.vue'
export { default as ChipGroup } from './components/feedback/ChipGroup.vue'
export { default as DismissibleChip } from './components/feedback/DismissibleChip.vue'
```

- [ ] **Step 7: Run the full suite and commit**

Run: `npx vitest run`
Expected: all green.

```bash
git add src/design-system/components/feedback/ src/design-system/styles/theme.css src/design-system/index.js
git commit -m "feat(ds): add Chip, ChipGroup and DismissibleChip"
```

---

### Task 5: Card family

Cards never nest — a card divides instead. The four parts compose rather than taking a dozen props.

**Files:**
- Create: `src/design-system/components/surfaces/Card.vue`, `CardHeader.vue`, `CardBody.vue`, `CardFooter.vue`
- Create: `src/design-system/components/surfaces/__tests__/Card.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `text-section-title`, `text-body` from Task 1.
- Produces: `<Card>` (surface, hairline, `rounded-card`, `shadow-card`), `<CardHeader title subtitle>` with a `#actions` slot, `<CardBody>`, `<CardFooter>` (sunken strip). Task 7's `StatCard` and Task 9's demo use them.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/surfaces/__tests__/Card.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../Card.vue'
import CardHeader from '../CardHeader.vue'
import CardBody from '../CardBody.vue'
import CardFooter from '../CardFooter.vue'

describe('Card', () => {
  it('renders a hairline surface at card radius', () => {
    const wrapper = mount(Card, { slots: { default: 'content' } })
    expect(wrapper.classes()).toContain('bg-surface')
    expect(wrapper.classes()).toContain('border-hairline')
    expect(wrapper.classes()).toContain('rounded-card')
    expect(wrapper.classes()).toContain('shadow-card')
    expect(wrapper.text()).toBe('content')
  })
})

describe('CardHeader', () => {
  it('renders the title at section-title scale', () => {
    const wrapper = mount(CardHeader, { props: { title: 'Certificate' } })
    const heading = wrapper.get('h2')
    expect(heading.text()).toBe('Certificate')
    expect(heading.classes()).toContain('text-section-title')
  })

  it('renders a subtitle only when given one', () => {
    const withSub = mount(CardHeader, { props: { title: 'A', subtitle: 'B' } })
    expect(withSub.text()).toContain('B')
    expect(mount(CardHeader, { props: { title: 'A' } }).findAll('p')).toHaveLength(0)
  })

  it('renders an actions slot', () => {
    const wrapper = mount(CardHeader, {
      props: { title: 'A' },
      slots: { actions: '<button class="act">Go</button>' },
    })
    expect(wrapper.find('.act').exists()).toBe(true)
  })
})

describe('CardBody', () => {
  it('applies the card gutter', () => {
    expect(mount(CardBody).classes()).toContain('px-card-x')
  })
})

describe('CardFooter', () => {
  it('sits on the sunken strip above a divider', () => {
    const wrapper = mount(CardFooter)
    expect(wrapper.classes()).toContain('bg-surface-sunken')
    expect(wrapper.classes()).toContain('border-divider')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/Card.spec.js`
Expected: FAIL — cannot resolve `../Card.vue`.

- [ ] **Step 3: Implement the four parts**

`src/design-system/components/surfaces/Card.vue`:

```vue
<template>
  <div class="bg-surface border border-hairline rounded-card shadow-card overflow-hidden">
    <slot />
  </div>
</template>
```

`src/design-system/components/surfaces/CardHeader.vue`:

```vue
<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-start justify-between gap-3 px-card-x pt-5 pb-1">
    <div class="min-w-0">
      <h2 class="text-section-title text-ink-900">{{ title }}</h2>
      <p v-if="subtitle" class="text-body text-text-meta mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-btn-row shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
```

`src/design-system/components/surfaces/CardBody.vue`:

```vue
<template>
  <div class="px-card-x py-4 text-body text-ink-700">
    <slot />
  </div>
</template>
```

`src/design-system/components/surfaces/CardFooter.vue`:

```vue
<template>
  <div
    class="flex items-center justify-end gap-btn-row px-card-x py-3.5 bg-surface-sunken border-t border-divider"
  >
    <slot />
  </div>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/Card.spec.js`
Expected: PASS — 6 tests.

- [ ] **Step 5: Export from the barrel**

Add to `src/design-system/index.js`:

```js
export { default as Card } from './components/surfaces/Card.vue'
export { default as CardHeader } from './components/surfaces/CardHeader.vue'
export { default as CardBody } from './components/surfaces/CardBody.vue'
export { default as CardFooter } from './components/surfaces/CardFooter.vue'
```

- [ ] **Step 6: Run the full suite and commit**

Run: `npx vitest run`
Expected: all green.

```bash
git add src/design-system/components/surfaces/ src/design-system/index.js
git commit -m "feat(ds): add Card, CardHeader, CardBody and CardFooter"
```

---

### Task 6: Text inputs

Three field components sharing one shell: 38px tall, 9px radius, label above, hint or error below, and a green focus ring as the only focus signal.

**Files:**
- Create: `src/design-system/components/forms/TextField.vue`, `Textarea.vue`, `SearchField.vue`
- Create: `src/design-system/components/forms/__tests__/TextField.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `text-field-label`, `text-body`, `text-hint`, `text-mono` from Task 1.
- Produces: `<TextField v-model label hint error placeholder disabled readonly type mono suffix>`, `<Textarea v-model label hint rows maxlength>`, `<SearchField v-model placeholder>` emitting `update:modelValue`. All three associate their label with `useId()` from Vue 3.5. Task 9's demo uses them.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/forms/__tests__/TextField.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextField from '../TextField.vue'
import Textarea from '../Textarea.vue'
import SearchField from '../SearchField.vue'

describe('TextField', () => {
  it('associates its label with its input', () => {
    const wrapper = mount(TextField, { props: { label: 'Facility name' } })
    const id = wrapper.get('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(TextField, { props: { label: 'A', modelValue: '' } })
    await wrapper.get('input').setValue('Carmen RHU')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Carmen RHU']])
  })

  it('shows a hint when there is no error', () => {
    const wrapper = mount(TextField, { props: { label: 'A', hint: 'Must be at least 1' } })
    expect(wrapper.text()).toContain('Must be at least 1')
  })

  it('replaces the hint with the error and marks the input invalid', () => {
    const wrapper = mount(TextField, {
      props: { label: 'A', hint: 'a hint', error: 'Required' },
    })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.text()).not.toContain('a hint')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('points aria-describedby at whichever message is showing', () => {
    const wrapper = mount(TextField, { props: { label: 'A', error: 'Required' } })
    const describedBy = wrapper.get('input').attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.get(`#${describedBy}`).text()).toBe('Required')
  })

  it('switches to the mono face for reference numbers', () => {
    const wrapper = mount(TextField, { props: { label: 'A', mono: true } })
    expect(wrapper.get('input').classes()).toContain('font-mono')
  })

  it('renders a suffix when given one', () => {
    const wrapper = mount(TextField, { props: { label: 'A', suffix: 'beds' } })
    expect(wrapper.text()).toContain('beds')
  })

  it('keeps its border but loses its white surface when disabled', () => {
    const wrapper = mount(TextField, { props: { label: 'A', disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('input').classes()).toContain('bg-surface-input')
  })
})

describe('Textarea', () => {
  it('associates its label and emits on input', async () => {
    const wrapper = mount(Textarea, { props: { label: 'Remarks', modelValue: '' } })
    const id = wrapper.get('textarea').attributes('id')
    expect(wrapper.get('label').attributes('for')).toBe(id)
    await wrapper.get('textarea').setValue('Looks good')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Looks good']])
  })

  it('shows a character counter only when maxlength is set', () => {
    const counted = mount(Textarea, {
      props: { label: 'A', modelValue: 'abc', maxlength: 400 },
    })
    expect(counted.text()).toContain('3 / 400')
    expect(mount(Textarea, { props: { label: 'A' } }).text()).not.toContain('/')
  })

  it('defaults to three rows', () => {
    expect(mount(Textarea, { props: { label: 'A' } }).get('textarea').attributes('rows')).toBe('3')
  })
})

describe('SearchField', () => {
  it('shows the clear button only once there is a value', () => {
    expect(mount(SearchField, { props: { modelValue: '' } }).find('[data-clear]').exists()).toBe(false)
    expect(mount(SearchField, { props: { modelValue: 'rhu' } }).find('[data-clear]').exists()).toBe(true)
  })

  it('emits an empty string when cleared', async () => {
    const wrapper = mount(SearchField, { props: { modelValue: 'rhu' } })
    await wrapper.get('[data-clear]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
  })

  it('labels the clear button for screen readers', () => {
    const wrapper = mount(SearchField, { props: { modelValue: 'rhu' } })
    expect(wrapper.get('[data-clear]').attributes('aria-label')).toBe('Clear search')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/forms/__tests__/TextField.spec.js`
Expected: FAIL — cannot resolve `../TextField.vue`.

- [ ] **Step 3: Implement TextField**

Create `src/design-system/components/forms/TextField.vue`:

```vue
<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  mono: { type: Boolean, default: false },
  suffix: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const id = useId()
const messageId = `${id}-message`
const message = computed(() => props.error || props.hint)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-field-label text-ink-700">{{ label }}</label>

    <div class="field relative flex items-center">
      <input
        :id="id"
        class="field__input h-field w-full rounded-field border px-3 text-body text-ink-900 transition-colors"
        :class="[
          error ? 'border-red-border' : 'border-field',
          disabled || readonly ? 'bg-surface-input text-ink-500' : 'bg-surface',
          mono ? 'font-mono' : '',
          suffix ? 'pr-14' : '',
        ]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="message ? messageId : undefined"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span v-if="suffix" class="absolute right-3 text-hint text-ink-500">{{ suffix }}</span>
    </div>

    <p
      v-if="message"
      :id="messageId"
      class="text-hint"
      :class="error ? 'text-red-700' : 'text-text-meta'"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
/* The focus ring is the only focus signal — spec §4.2 routes it via var(). */
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
```

- [ ] **Step 4: Implement Textarea and SearchField**

Create `src/design-system/components/forms/Textarea.vue`:

```vue
<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])

const id = useId()
const counter = computed(() =>
  props.maxlength ? `${props.modelValue.length} / ${props.maxlength}` : '',
)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-field-label text-ink-700">{{ label }}</label>
      <span v-if="counter" class="text-hint text-text-meta">{{ counter }}</span>
    </div>

    <textarea
      :id="id"
      class="field__input w-full resize-y rounded-field border border-field bg-surface px-3 py-2 text-body text-ink-900 transition-colors"
      :rows="rows"
      :value="modelValue"
      :maxlength="maxlength || undefined"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p v-if="hint" class="text-hint text-text-meta">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
```

Create `src/design-system/components/forms/SearchField.vue`:

```vue
<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field relative flex items-center">
    <svg
      class="pointer-events-none absolute left-3 h-4 w-4 text-ink-400"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>

    <input
      class="field__input h-field w-full rounded-field border border-field bg-surface pl-9 pr-9 text-body text-ink-900 transition-colors"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      data-clear
      type="button"
      class="field__clear absolute right-2"
      aria-label="Clear search"
      @click="emit('update:modelValue', '')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.field__clear {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
  line-height: 1;
}

.field__clear:hover {
  color: var(--ink-700);
  background: var(--surface-muted);
}

.field__clear:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/forms/__tests__/TextField.spec.js`
Expected: PASS — 14 tests.

- [ ] **Step 6: Export from the barrel, run the suite, commit**

Add to `src/design-system/index.js`:

```js
export { default as TextField } from './components/forms/TextField.vue'
export { default as Textarea } from './components/forms/Textarea.vue'
export { default as SearchField } from './components/forms/SearchField.vue'
```

Run: `npx vitest run`
Expected: all green.

```bash
git add src/design-system/components/forms/ src/design-system/index.js
git commit -m "feat(ds): add TextField, Textarea and SearchField"
```

---

### Task 7: StatCard and Meter

**Files:**
- Create: `src/design-system/components/surfaces/StatCard.vue`, `Meter.vue`
- Create: `src/design-system/components/surfaces/__tests__/StatCard.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `text-card-figure`, `text-column-header`, `text-hint` from Task 1.
- Produces: `<StatCard label value hint muted>` and `<Meter value max label>` where `value`/`max` are numbers. Task 9's demo uses both.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/surfaces/__tests__/StatCard.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatCard from '../StatCard.vue'
import Meter from '../Meter.vue'

describe('StatCard', () => {
  it('renders label, value and hint', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Active LTOs', value: '211', hint: '2 due within 7 days' },
    })
    expect(wrapper.text()).toContain('Active LTOs')
    expect(wrapper.text()).toContain('211')
    expect(wrapper.text()).toContain('2 due within 7 days')
  })

  it('renders the figure at card-figure scale', () => {
    const wrapper = mount(StatCard, { props: { label: 'A', value: '211' } })
    expect(wrapper.get('[data-figure]').classes()).toContain('text-card-figure')
  })

  it('renders the label at column-header scale', () => {
    const wrapper = mount(StatCard, { props: { label: 'A', value: '1' } })
    expect(wrapper.get('[data-label]').classes()).toContain('text-column-header')
  })

  it('uses the muted surface for closed or archived stats', () => {
    expect(mount(StatCard, { props: { label: 'A', value: '1', muted: true } }).classes()).toContain(
      'bg-surface-card-muted',
    )
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).classes()).toContain('bg-surface')
  })

  it('omits the hint element entirely when there is no hint', () => {
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).find('[data-hint]').exists()).toBe(
      false,
    )
  })
})

describe('Meter', () => {
  it('exposes progressbar semantics with its current and max values', () => {
    const wrapper = mount(Meter, { props: { value: 62, max: 100, label: 'Upload' } })
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('62')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(bar.attributes('aria-label')).toBe('Upload')
  })

  it('sets the fill width from the ratio', () => {
    const wrapper = mount(Meter, { props: { value: 25, max: 50, label: 'A' } })
    expect(wrapper.get('[data-fill]').attributes('style')).toContain('width: 50%')
  })

  it('clamps out-of-range values instead of overflowing', () => {
    expect(mount(Meter, { props: { value: 150, max: 100, label: 'A' } }).get('[data-fill]').attributes('style')).toContain('width: 100%')
    expect(mount(Meter, { props: { value: -5, max: 100, label: 'A' } }).get('[data-fill]').attributes('style')).toContain('width: 0%')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/StatCard.spec.js`
Expected: FAIL — cannot resolve `../StatCard.vue`.

- [ ] **Step 3: Implement both**

Create `src/design-system/components/surfaces/StatCard.vue`:

```vue
<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  muted: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="flex flex-col gap-1 rounded-card border border-hairline p-4 shadow-card"
    :class="muted ? 'bg-surface-card-muted' : 'bg-surface'"
  >
    <span data-label class="text-column-header text-text-header uppercase">{{ label }}</span>
    <span data-figure class="text-card-figure text-ink-900">{{ value }}</span>
    <span v-if="hint" data-hint class="text-hint text-text-meta">{{ hint }}</span>
  </div>
</template>
```

Create `src/design-system/components/surfaces/Meter.vue`:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, required: true },
})

const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<template>
  <div
    class="meter h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <div data-fill class="meter__fill h-full rounded-pill" :style="{ width: `${percent}%` }" />
  </div>
</template>

<style scoped>
/* --grad-meter has no utility namespace — spec §4.2. */
.meter__fill {
  background: var(--grad-meter);
  transition: width var(--t-control) ease;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/StatCard.spec.js`
Expected: PASS — 8 tests.

- [ ] **Step 5: Export from the barrel, run the suite, commit**

Add to `src/design-system/index.js`:

```js
export { default as StatCard } from './components/surfaces/StatCard.vue'
export { default as Meter } from './components/surfaces/Meter.vue'
```

Run: `npx vitest run`
Expected: all green.

```bash
git add src/design-system/components/surfaces/ src/design-system/index.js
git commit -m "feat(ds): add StatCard and Meter"
```

---

### Task 8: Notice and Skeleton

Notices explain a state that stays — they live in the layout and never float. Skeletons show three rows, never a page of shimmer.

**Files:**
- Create: `src/design-system/components/feedback/Notice.vue`, `Skeleton.vue`
- Create: `src/design-system/components/feedback/__tests__/Notice.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: the same `tone` vocabulary as Task 4's `Chip` — `neutral | green | amber | red | blue | violet` — and the `text-chip` utility Task 4 adds to `theme.css`, which `Notice`'s label pill uses.
- Produces: `<Notice tone label>` with a default slot for the body, and `<Skeleton rows>` defaulting to 3.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/feedback/__tests__/Notice.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Notice from '../Notice.vue'
import Skeleton from '../Skeleton.vue'

describe('Notice', () => {
  it('renders its label pill and body', () => {
    const wrapper = mount(Notice, {
      props: { tone: 'red', label: 'Error' },
      slots: { default: 'Inspection is overdue by 4 days.' },
    })
    expect(wrapper.text()).toContain('Error')
    expect(wrapper.text()).toContain('Inspection is overdue by 4 days.')
  })

  it('carries the tone on the pill, keeping the surface almost white', () => {
    const wrapper = mount(Notice, { props: { tone: 'red', label: 'Error' } })
    expect(wrapper.get('[data-pill]').classes()).toContain('text-red-700')
    expect(wrapper.classes()).toContain('bg-red-50')
  })

  it('supports every tone Chip supports', () => {
    for (const tone of ['neutral', 'green', 'amber', 'red', 'blue', 'violet']) {
      expect(() => mount(Notice, { props: { tone, label: 'X' } })).not.toThrow()
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Notice, { props: { tone: 'nonsense', label: 'X' } }).classes()).toContain(
      'bg-neutral-100',
    )
  })

  it('announces errors politely to assistive tech', () => {
    expect(mount(Notice, { props: { tone: 'red', label: 'Error' } }).attributes('role')).toBe(
      'status',
    )
  })
})

describe('Skeleton', () => {
  it('renders three rows by default', () => {
    expect(mount(Skeleton).findAll('[data-row]')).toHaveLength(3)
  })

  it('honours an explicit row count', () => {
    expect(mount(Skeleton, { props: { rows: 5 } }).findAll('[data-row]')).toHaveLength(5)
  })

  it('hides itself from assistive tech', () => {
    // Placeholder bars carry no information; the surrounding region owns any
    // loading announcement.
    expect(mount(Skeleton).attributes('aria-hidden')).toBe('true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Notice.spec.js`
Expected: FAIL — cannot resolve `../Notice.vue`.

- [ ] **Step 3: Implement both**

Create `src/design-system/components/feedback/Notice.vue`:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  label: { type: String, required: true },
})

// Surface stays almost white; the outlined pill carries the meaning.
const SURFACES = {
  neutral: 'bg-neutral-100 border-soft',
  green: 'bg-green-50 border-soft',
  amber: 'bg-amber-50 border-soft',
  red: 'bg-red-50 border-red-border',
  blue: 'bg-blue-50 border-soft',
  violet: 'bg-violet-100 border-soft',
}

const PILLS = {
  neutral: 'text-ink-600 border-soft',
  green: 'text-green-text border-soft',
  amber: 'text-amber-text border-soft',
  red: 'text-red-700 border-red-border',
  blue: 'text-blue-700 border-soft',
  violet: 'text-violet-700 border-soft',
}

const surfaceClass = computed(() => SURFACES[props.tone] ?? SURFACES.neutral)
const pillClass = computed(() => PILLS[props.tone] ?? PILLS.neutral)
</script>

<template>
  <div
    class="flex items-center gap-2.5 rounded-notice border px-3 py-2 text-body text-ink-700"
    :class="surfaceClass"
    role="status"
  >
    <span
      data-pill
      class="shrink-0 rounded-pill border bg-surface px-2 py-0.5 text-chip"
      :class="pillClass"
      >{{ label }}</span
    >
    <span class="min-w-0"><slot /></span>
  </div>
</template>
```

Create `src/design-system/components/feedback/Skeleton.vue`:

```vue
<script setup>
defineProps({
  rows: { type: Number, default: 3 },
})
</script>

<template>
  <div class="flex flex-col gap-2.5" aria-hidden="true">
    <div
      v-for="row in rows"
      :key="row"
      data-row
      class="skeleton h-4 rounded-tile bg-surface-muted"
    />
  </div>
</template>

<style scoped>
/* A slow pulse rather than a sweeping shimmer — the source document warns
 * against a full page of shimmer. */
.skeleton {
  animation: skeletonPulse 1.4s ease-in-out infinite;
}

@keyframes skeletonPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Notice.spec.js`
Expected: PASS — 8 tests.

- [ ] **Step 5: Export from the barrel, run the suite, commit**

Add to `src/design-system/index.js`:

```js
export { default as Notice } from './components/feedback/Notice.vue'
export { default as Skeleton } from './components/feedback/Skeleton.vue'
```

Run: `npx vitest run && npm run lint`
Expected: all green.

```bash
git add src/design-system/components/feedback/ src/design-system/index.js
git commit -m "feat(ds): add Notice and Skeleton"
```

---

### Task 9: The kitchen-sink page

The acceptance surface. Every later phase appends its own sections here.

**Files:**
- Create: `src/design-system/demo/DemoSection.vue`, `TypeScaleDemo.vue`, `ButtonsDemo.vue`, `ChipsDemo.vue`, `CardsDemo.vue`, `FieldsDemo.vue`, `FeedbackDemo.vue`
- Create: `src/pages/design-system.vue`
- Create: `src/pages/__tests__/design-system.spec.js`

**Interfaces:**
- Consumes: every component exported from `@/design-system` by Tasks 3-8.
- Produces: the `/design-system` route. Section components live in `src/design-system/demo/` — **not** under `src/pages/`, because the file-based router turns anything there into a route.

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/design-system.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '../design-system.vue'

describe('design system page', () => {
  it('renders a section per component family built so far', () => {
    const wrapper = mount(DesignSystemPage)
    for (const heading of ['Type scale', 'Buttons', 'Chips', 'Cards', 'Text fields', 'Feedback']) {
      expect(wrapper.text(), `missing section: ${heading}`).toContain(heading)
    }
  })

  it('exercises every button variant so the page is a real acceptance surface', () => {
    const wrapper = mount(DesignSystemPage)
    expect(wrapper.text()).toContain('Verify & save')
    expect(wrapper.text()).toContain('Revoke licence')
  })

  it('renders all six chip tones', () => {
    const wrapper = mount(DesignSystemPage)
    for (const tone of ['Approved', 'Pending', 'Returned', 'Closed', 'Online', 'Legacy']) {
      expect(wrapper.text(), `missing chip: ${tone}`).toContain(tone)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: FAIL — cannot resolve `../design-system.vue`.

- [ ] **Step 3: Create the section wrapper**

Create `src/design-system/demo/DemoSection.vue`:

```vue
<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <section class="mb-section">
    <h2 class="text-section-title text-ink-900">{{ title }}</h2>
    <p v-if="note" class="text-body text-text-meta mt-1 mb-4 max-w-2xl">{{ note }}</p>
    <div class="mt-4"><slot /></div>
  </section>
</template>
```

- [ ] **Step 4: Create the six demo sections**

`src/design-system/demo/TypeScaleDemo.vue`:

```vue
<script setup>
const ROWS = [
  { cls: 'text-page-title', name: 'Page title', sample: 'Issued LTO' },
  { cls: 'text-card-figure', name: 'Card figure', sample: '211' },
  { cls: 'text-section-title', name: 'Section title', sample: 'Application history' },
  { cls: 'text-row-title', name: 'Row title', sample: 'Buenavista Health Center' },
  { cls: 'text-body', name: 'Body', sample: 'Stored encrypted at rest.' },
  { cls: 'text-field-label', name: 'Field label', sample: 'Certificate password' },
  { cls: 'text-hint', name: 'Meta / hint', sample: 'Updated 8 minutes ago' },
  { cls: 'text-column-header', name: 'Column header', sample: 'FACILITY TYPE' },
  { cls: 'text-mono font-mono', name: 'Mono', sample: '16-015-2527-PCF-1' },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-for="row in ROWS" :key="row.name" class="flex items-baseline gap-4">
      <span class="text-hint text-text-meta w-32 shrink-0">{{ row.name }}</span>
      <span :class="row.cls" class="text-ink-900">{{ row.sample }}</span>
    </div>
  </div>
</template>
```

`src/design-system/demo/ButtonsDemo.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { Button } from '@/design-system'

const busy = ref(false)

function runBusy() {
  busy.value = true
  setTimeout(() => (busy.value = false), 1600)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-btn-row">
      <Button variant="primary">Verify &amp; save</Button>
      <Button variant="secondary">Export CSV</Button>
      <Button variant="destructive">Revoke licence</Button>
      <Button variant="ghost">View logs</Button>
    </div>

    <div class="flex flex-wrap items-center gap-btn-row">
      <Button size="compact" variant="secondary">Apply</Button>
      <Button size="compact" variant="ghost">Reset filters</Button>
      <Button size="touch">Sign document</Button>
    </div>

    <div class="flex flex-wrap items-center gap-btn-row">
      <Button :busy="busy" @click="runBusy">{{ busy ? 'Signing…' : 'Click for busy state' }}</Button>
      <Button disabled variant="secondary">Disabled</Button>
    </div>
  </div>
</template>
```

`src/design-system/demo/ChipsDemo.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip } from '@/design-system'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
])

function dismiss(value) {
  applied.value = applied.value.filter((chip) => chip.value !== value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ChipGroup>
      <Chip tone="green" dot>Approved</Chip>
      <Chip tone="amber" dot>Pending</Chip>
      <Chip tone="red" dot>Returned</Chip>
      <Chip tone="neutral" dot>Closed</Chip>
      <Chip tone="blue">Online</Chip>
      <Chip tone="violet">Legacy</Chip>
    </ChipGroup>

    <ChipGroup>
      <DismissibleChip
        v-for="chip in applied"
        :key="chip.value"
        :chip-key="chip.key"
        :value="chip.value"
        @dismiss="dismiss"
      />
      <span v-if="applied.length === 0" class="text-hint text-text-meta">No filters applied.</span>
    </ChipGroup>
  </div>
</template>
```

`src/design-system/demo/CardsDemo.vue`:

```vue
<script setup>
import { Button, Card, CardBody, CardFooter, CardHeader, Meter, StatCard } from '@/design-system'
</script>

<template>
  <div class="flex flex-col gap-card">
    <Card>
      <CardHeader title="Certificate" subtitle="Body sits on white, 24px gutter.">
        <template #actions>
          <Button size="compact" variant="secondary">Action</Button>
        </template>
      </CardHeader>
      <CardBody>
        Radius 14px, 1px hairline, and the card shadow. Cards never nest — a card divides instead.
      </CardBody>
      <CardFooter>
        <Button size="compact" variant="ghost">Cancel</Button>
        <Button size="compact">Save</Button>
      </CardFooter>
    </Card>

    <div class="grid gap-card sm:grid-cols-3">
      <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" />
      <StatCard label="Inspection" value="8" hint="ready to sign" />
      <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
    </div>

    <div class="max-w-sm">
      <p class="text-hint text-text-meta mb-2">Meter at 62%</p>
      <Meter :value="62" :max="100" label="Upload progress" />
    </div>
  </div>
</template>
```

`src/design-system/demo/FieldsDemo.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { SearchField, Textarea, TextField } from '@/design-system'

const name = ref('Carmen RHU, ADN')
const lto = ref('16-015-2527')
const beds = ref('')
const search = ref('')
const remarks = ref('')
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <TextField v-model="name" label="Facility name" hint="Rests on a hairline border." />
    <TextField v-model="lto" label="LTO number" mono hint="Mono for reference numbers." />
    <TextField v-model="beds" label="Bed capacity" suffix="beds" error="Must be at least 1." />
    <TextField
      label="NHFR code"
      model-value="PH-16-0142"
      readonly
      hint="Disabled fields lose their white surface, never their border."
    />
    <SearchField v-model="search" placeholder="Search facilities" />
    <div class="sm:col-span-2">
      <Textarea v-model="remarks" label="Reviewer remarks" :maxlength="400" />
    </div>
  </div>
</template>
```

`src/design-system/demo/FeedbackDemo.vue`:

```vue
<script setup>
import { Notice, Skeleton } from '@/design-system'
</script>

<template>
  <div class="flex flex-col gap-4">
    <Notice tone="green" label="Success">You have successfully updated the user's role.</Notice>
    <Notice tone="amber" label="Warning">Inspection is due within 7 days.</Notice>
    <Notice tone="red" label="Error">Inspection is overdue by 4 days.</Notice>
    <Notice tone="blue" label="Info">Legacy records are read-only.</Notice>

    <div class="max-w-md">
      <p class="text-hint text-text-meta mb-2">Skeleton — three rows only</p>
      <Skeleton />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create the page**

Create `src/pages/design-system.vue`:

```vue
<script setup>
import DemoSection from '@/design-system/demo/DemoSection.vue'
import TypeScaleDemo from '@/design-system/demo/TypeScaleDemo.vue'
import ButtonsDemo from '@/design-system/demo/ButtonsDemo.vue'
import ChipsDemo from '@/design-system/demo/ChipsDemo.vue'
import CardsDemo from '@/design-system/demo/CardsDemo.vue'
import FieldsDemo from '@/design-system/demo/FieldsDemo.vue'
import FeedbackDemo from '@/design-system/demo/FeedbackDemo.vue'
</script>

<template>
  <div>
    <h1 class="text-page-title text-ink-900">Design system</h1>
    <p class="text-body text-text-meta mt-2 mb-8 max-w-2xl">
      Every component below is built against the design tokens — no raw hex, no
      <code class="font-mono text-mono">dark:</code> variants. Toggle the theme in the header; only
      the palette changes, never the geometry.
    </p>

    <DemoSection title="Type scale" note="DM Sans at three weights. JetBrains Mono for numbers you might copy.">
      <TypeScaleDemo />
    </DemoSection>

    <DemoSection title="Buttons" note="38px default, 34px compact, 44px touch. One filled green button per screen region.">
      <ButtonsDemo />
    </DemoSection>

    <DemoSection title="Chips" note="Tone comes from meaning, never decoration.">
      <ChipsDemo />
    </DemoSection>

    <DemoSection title="Cards" note="Three surfaces and nothing else. Cards never nest.">
      <CardsDemo />
    </DemoSection>

    <DemoSection title="Text fields" note="Every field is 38px tall with a 9px radius. The green ring is the only focus signal.">
      <FieldsDemo />
    </DemoSection>

    <DemoSection title="Feedback" note="Notices explain a state that stays — they live in the layout and never float.">
      <FeedbackDemo />
    </DemoSection>
  </div>
</template>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: PASS — 3 tests.

- [ ] **Step 7: Add the type-scale build assertions**

Now that the demo page uses the scale, Tailwind emits it — so the build can prove it. Add `.text-body` and `.text-column-header` to the `failures` checks in `scripts/verify-css-build.mjs`, beside the existing `.bg-canvas` / `.border-hairline` assertions, following the same pattern:

```js
// The type scale compiles only if the bridge is well-formed AND something
// uses it; the demo page is what uses it.
for (const cls of ['.bg-canvas', '.border-hairline', '.text-body', '.text-column-header']) {
  if (!css.includes(cls)) failures.push(`utility ${cls} missing from built CSS`)
}
```

Replace the existing `.bg-canvas` / `.border-hairline` check with this loop rather than adding a second one.

- [ ] **Step 8: Confirm the route and the build**

Run: `npx vitest run && npm run verify:css && npm run lint`
Expected: all green, with the two new utility assertions satisfied.

Then check `typed-router.d.ts` regenerated with a `/design-system` route (it updates on dev server start or build). Confirm exactly one new route was added and no junk routes appeared from the demo folder:

```bash
grep -c 'design-system' typed-router.d.ts
```

Expected: a small number (route path plus its name). If you see entries like `design-system/sections/...`, a demo component was placed under `src/pages/` by mistake — move it to `src/design-system/demo/`.

- [ ] **Step 9: Commit**

```bash
git add src/design-system/demo/ src/pages/design-system.vue src/pages/__tests__/
git commit -m "feat(ds): add the kitchen-sink design system page"
```

---

## Phase complete

Run all three gates:

```bash
npx vitest run && npm run verify:css && npm run lint
```

Then open http://localhost:5177/design-system and check every section against the source canvas in **both** themes. Geometry must be identical between them — if a size changes when you toggle, that is a bug.

Phase 3 (Ark-backed components: selects, selection controls, tabs, dialog, toast, file input, pagination) gets its own plan.
