# Tabs Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the Tabs section's three gaps with `Tabs`, `SegmentedTabs` and `StageTabs` built on Ark UI, and place `StatCard`/`Meter` on the page so no built component is invisible.

**Architecture:** Ark UI supplies keyboard navigation, roving tabindex and ARIA for the three tab variants; every visual value comes from Appendix C's Tabs group and is expressed in design tokens. The demo page's Tabs section swaps its three `DemoGap` markers for the real components and flips to `complete: true`, which the manifest test then enforces.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, `@ark-ui/vue` 5.39.1, Vitest 4 + `@vue/test-utils`

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — **Appendix C's `Tabs` group is the authority for values**, Appendix D and D.1 for page content, §8.1 for the `label` convention, §17 for the page architecture, §18 for the accessibility baseline.

**Phase:** 3b. Phases 1, 2, 2.5 and 3a are complete on branch `design-system` (258 tests). Dropdowns, Selection controls, File inputs, Overlays, Shell and the reference sections follow, one section per phase.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **Appendix C is the authority for values.** Where this plan gives a number, it came from there. If a redline contradicts this plan, stop and report it rather than guessing — that has happened five times across earlier phases and reporting was right every time.
- **No raw hex colours** in any file under `src/design-system/components/`, **including comments** — the guard scans them. Cite redline rows by name, never by quoting a colour.
- **No `dark:` variants** anywhere in `src/design-system/` (the guard now scans `demo/` too); no arbitrary type sizes.
- **`label` names the thing; presentation is the component's business** (§8.1). Any component whose label is not visible says so in its JSDoc.
- Accessibility baseline is **WCAG 2.1 AA** (§18). Ark supplies the ARIA; do not remove or override its roles and relationships.
- **Never put a comment before a component's root element** — Vue compiles that as a Fragment root and `wrapper.classes()` returns `[]`.
- **Two competing classes for one property is the recurring defect of this project** — six instances so far, each "working" only because of compile order. Every conditional must produce exactly one class per property.
- `tokens.css` / `tokens.dark.css` are frozen — a test diffs them against spec Appendix A/A.1 in both directions.
- Content from Appendix D is verbatim, glyph for glyph.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run tests with `npx vitest run` — `test:unit` is watch mode and will hang.
- Commit messages carry **no** `Co-Authored-By` trailer.

## File Structure

```
package.json                                    MODIFIED — + @ark-ui/vue (Task 1)
src/design-system/styles/theme.css              MODIFIED — + --text-stage-figure (Task 4)

src/design-system/components/
  tabs/Tabs.vue                 underline tabs with counts            (Task 2)
  tabs/SegmentedTabs.vue        segmented inline filter               (Task 3)
  tabs/StageTabs.vue            numbered workflow cards               (Task 4)

src/design-system/demo/sections/
  SpecsSection.vue              MODIFIED — hosts StatCard + Meter     (Task 1)
  TabsSection.vue               MODIFIED — three gaps → components    (Task 5)
src/design-system/demo/chrome/sections.js       MODIFIED — tabs complete (Task 5)
src/design-system/index.js                      MODIFIED — three exports
```

**Ark's export style, verified against the published package:** flat named exports, not namespaces. **The Tabs parts are singular** — `TabList`, `TabTrigger`, `TabContent` — while the root is `TabsRoot`. Getting this wrong is the most likely first failure.

---

### Task 1: Ark UI, and a home for StatCard and Meter

Installs the dependency every later task needs, and fixes an omission: `StatCard` and `Meter` were built in Phase 2, conformed in Phase 2.5, and render nowhere — 21 passing tests reading as coverage for components no one can see.

**Files:**
- Modify: `package.json`, `src/design-system/demo/sections/SpecsSection.vue`
- Modify: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:**
- Consumes: `StatCard` and `Meter` from `@/design-system`.
- Produces: `@ark-ui/vue` available to Tasks 2-4.

- [ ] **Step 1: Install Ark UI**

Run:

```bash
npm install --save-exact @ark-ui/vue@5.39.1
```

Pinned exactly: Ark ships frequently and an unpinned minor could change rendered DOM under a component whose markup is redlined to the pixel.

- [ ] **Step 2: Write the failing test**

Append to `src/design-system/demo/sections/__tests__/sections.spec.js`. That file
already imports `mount` and every section component including `SpecsSection`,
so add **no** imports — a duplicate import is a lint failure:

```js
describe('SpecsSection hosts the components the artifact only redlines', () => {
  // StatCard and Meter have an Appendix C group ("Stat cards & meters") but no
  // page section of their own, so deleting the old CardsDemo left them
  // invisible. Component specs is where redlines live, so they go here rather
  // than in an invented section the artifact does not have.
  it('renders StatCard with its label, figure and hint', () => {
    const text = mount(SpecsSection).text()
    expect(text).toContain('Active LTOs')
    expect(text).toContain('211')
    expect(text).toContain('2 due within 7 days')
  })

  it('renders a Meter with its caption', () => {
    const wrapper = mount(SpecsSection)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Uploaded')
  })

  it('still renders its SpecTables gap', () => {
    // The spec-table component itself is still unbuilt; hosting StatCard here
    // must not disturb that marker.
    expect(mount(SpecsSection).findAll('[data-gap]')).toHaveLength(1)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — `expected '' to contain 'Active LTOs'`.

- [ ] **Step 4: Host StatCard and Meter in SpecsSection**

In `src/design-system/demo/sections/SpecsSection.vue`, import `StatCard` and `Meter` from `@/design-system` and render them **above** the existing `SpecTables` gap, inside the section's existing body. Use the artifact's own sample data, which Appendix D.1 records for the stat grid:

```html
      <div class="mb-4">
        <p class="text-caption text-text-meta mb-2.5">
          Stat cards and meters have redlines in this appendix but no section of their own on the
          source page, so they are shown here rather than in a section the artifact does not have.
        </p>
        <div class="specs-section__stat-grid">
          <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" dot="green" />
          <StatCard label="Inspection" value="8" hint="2 overdue" dot="amber" urgent />
          <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
        </div>
        <div class="mt-4 max-w-sm">
          <Meter :value="62" :max="100" label="Upload progress" caption="Uploaded" />
        </div>
      </div>
```

Add the grid rule to a `<style scoped>` block — Appendix C's `Stat cards & meters` group opens with `Grid · auto-fit minmax(190px,1fr) · gap 12px`, and Tailwind has no utility for an auto-fit track list:

```css
<style scoped>
/* Redline "Grid" (Stat cards & meters) — auto-fit at a 190px minimum. */
.specs-section__stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px; /* redline "Grid" — gap 12px; no spacing token for it */
}
</style>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS.

The Appendix D content test must also still pass — `SpecsSection` gains rendered text, but Appendix D asserts *presence* of its description and rule cards, not absence of anything else.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add package.json package-lock.json src/design-system/demo/
git commit -m "feat(ds): add Ark UI and give StatCard and Meter a home on the page"
```

---

### Task 2: Tabs — the underline variant

Appendix C group **Tabs**, rows `Underline pad`, `Underline type`, `Marker`, `Active text`, `Idle tab text`, `Tab count`, `Count active`, `Count idle`. Read them before starting.

**Files:**
- Create: `src/design-system/components/tabs/Tabs.vue`
- Create: `src/design-system/components/tabs/__tests__/Tabs.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `@ark-ui/vue` from Task 1.
- Produces: `<Tabs v-model :tabs>` where `tabs` is `Array<{ key, label, count? }>` and `v-model` is the active key. The default slot is a plain content slot for the active tab's panel — it passes no scoped data, because the consumer owns both the array and the selection ref and resolves its own content. Task 5's `TabsSection` uses it.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/tabs/__tests__/Tabs.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tabs from '../Tabs.vue'

const TABS = [
  { key: 'active', label: 'Active LTOs', count: '211' },
  { key: 'all', label: 'All applications', count: '215' },
  { key: 'moa', label: 'MOA services', count: '8' },
]

const mountTabs = (props = {}) =>
  mount(Tabs, { props: { tabs: TABS, modelValue: 'active', ...props } })

describe('Tabs', () => {
  it('renders one trigger per tab, with its count', () => {
    const wrapper = mountTabs()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Active LTOs')
    expect(wrapper.text()).toContain('211')
  })

  it('marks the model value selected and the others not', () => {
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].attributes('aria-selected')).toBe('true')
    expect(triggers[1].attributes('aria-selected')).toBe('false')
  })

  it('emits update:modelValue when another tab is chosen', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['all'])
  })

  it('colours the 2.5px marker only under the active tab', () => {
    // Redline "Marker". Asserted through classes rather than left to scoped
    // CSS: a marker that never paints is invisible to a DOM test otherwise.
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].classes()).toContain('border-b-green-fill')
    expect(triggers[1].classes()).toContain('border-b-transparent')
    expect(triggers[1].classes()).not.toContain('border-b-green-fill')
  })

  it('gives the active tab the green text and the idle ones the header grey', () => {
    // Redline "Active text" and "Idle tab text" — the idle colour is the
    // accessible header grey, not the lighter meta grey.
    const triggers = mountTabs().findAll('[role="tab"]')
    expect(triggers[0].classes()).toContain('text-green-text')
    expect(triggers[0].classes()).not.toContain('text-text-header')
    expect(triggers[1].classes()).toContain('text-text-header')
    expect(triggers[1].classes()).not.toContain('text-green-text')
  })

  it('tints the active count and greys the idle ones', () => {
    // Redline "Count active" and "Count idle"
    const counts = mountTabs().findAll('[data-count]')
    expect(counts[0].classes()).toContain('bg-green-100')
    expect(counts[0].classes()).toContain('text-green-text')
    expect(counts[1].classes()).toContain('bg-surface-muted')
    expect(counts[1].classes()).toContain('text-text-header')
  })

  it('renders counts in mono at the redlined size', () => {
    // Redline "Tab count · mono 11.5px/500"
    const count = mountTabs().get('[data-count]')
    expect(count.classes()).toContain('font-mono')
    expect(count.classes()).toContain('text-stat-hint')
    expect(count.classes()).toContain('font-medium')
  })

  it('omits the count element for a tab with no count', () => {
    const wrapper = mount(Tabs, {
      props: { tabs: [{ key: 'a', label: 'A' }], modelValue: 'a' },
    })
    expect(wrapper.find('[data-count]').exists()).toBe(false)
  })

  it('renders the active tab panel through the default slot', () => {
    const wrapper = mount(Tabs, {
      props: { tabs: TABS, modelValue: 'active' },
      slots: { default: '<span class="panel-probe" />' },
    })
    expect(wrapper.find('.panel-probe').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/tabs/__tests__/Tabs.spec.js`
Expected: FAIL — cannot resolve `../Tabs.vue`.

- [ ] **Step 3: Implement Tabs**

Create `src/design-system/components/tabs/Tabs.vue`:

```vue
<script setup>
import { TabsRoot, TabList, TabTrigger, TabContent } from '@ark-ui/vue/tabs'

defineProps({
  /** Tabs to render: `{ key, label, count? }`. */
  tabs: { type: Array, required: true },
  /** The active tab's key. */
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <!-- Redline "Underline pad" — 14px 2px per trigger, 22px between them.
         The list carries the hairline the marker sits on. -->
    <TabList class="tabs__list flex items-center border-b border-divider">
      <TabTrigger
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        class="tabs__trigger inline-flex items-center gap-2 text-body font-bold whitespace-nowrap border-b-[2.5px]"
        :class="
          tab.key === modelValue
            ? 'border-b-green-fill text-green-text'
            : 'border-b-transparent text-text-header'
        "
      >
        {{ tab.label }}
        <!-- Redline "Tab count" — mono, and "Count active"/"Count idle" for the tint. -->
        <span
          v-if="tab.count"
          data-count
          class="tabs__count font-mono text-stat-hint font-medium"
          :class="
            tab.key === modelValue
              ? 'bg-green-100 text-green-text'
              : 'bg-surface-muted text-text-header'
          "
          >{{ tab.count }}</span
        >
      </TabTrigger>
    </TabList>

    <TabContent :value="modelValue" class="pt-4">
      <slot />
    </TabContent>
  </TabsRoot>
</template>

<style scoped>
/* Redline "Underline pad" — row gap 22px between triggers. */
.tabs__list {
  gap: 22px;
}

/* Redline "Underline pad" — 14px 2px. The 2.5px marker itself is the
 * border-b-[2.5px] utility on the trigger, coloured by the :class binding, so
 * that one property has exactly one source. The negative margin pulls the
 * marker onto the list's hairline instead of stacking below it. */
.tabs__trigger {
  padding: 14px 2px;
  margin-bottom: -1px;
  cursor: pointer;
}

.tabs__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Tab count" — pad 2px 7px, radius 9px. */
.tabs__count {
  padding: 2px 7px;
  border-radius: var(--r-field);
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/tabs/__tests__/Tabs.spec.js`
Expected: PASS — 9 tests.

If Ark renders no `role="tab"`, check the import: the parts are `TabList` / `TabTrigger` / `TabContent`, singular, while the root is `TabsRoot`. That is the most likely first failure.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as Tabs } from './components/tabs/Tabs.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/tabs/ src/design-system/index.js
git commit -m "feat(ds): add the underline Tabs variant"
```

---

### Task 3: SegmentedTabs — the inline filter variant

Appendix C group **Tabs**, rows `Segmented shell`, `Segment on`, `Segment off`. Read them before starting.

**Files:**
- Create: `src/design-system/components/tabs/SegmentedTabs.vue`
- Create: `src/design-system/components/tabs/__tests__/SegmentedTabs.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `@ark-ui/vue` from Task 1.
- Produces: `<SegmentedTabs v-model :options label="...">` where `options` is `string[]` and `v-model` is the selected string. No default slot — a segmented control filters content that lives outside it.

**On the `label` prop:** this control is a radio group, and a radio group needs an accessible name (§18, WCAG 2.1 AA 1.3.1). The name is not drawn on screen — the surrounding `DemoBlock` label already says what it filters — so per §8.1 the component's JSDoc must say the label is invisible.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/tabs/__tests__/SegmentedTabs.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SegmentedTabs from '../SegmentedTabs.vue'

const OPTIONS = ['All', 'Initial', 'Renewal', 'Add / Modify']

const mountSegments = (props = {}) =>
  mount(SegmentedTabs, {
    props: { options: OPTIONS, modelValue: 'All', label: 'Application type', ...props },
  })

describe('SegmentedTabs', () => {
  it('renders one segment per option', () => {
    const wrapper = mountSegments()
    expect(wrapper.findAll('[data-segment]')).toHaveLength(4)
    expect(wrapper.text()).toContain('Add / Modify')
  })

  it('names the group for assistive technology', () => {
    // The group is a radio group; without a name its options have no context.
    const group = mountSegments().get('[role="radiogroup"]')
    expect(group.attributes('aria-label')).toBe('Application type')
  })

  it('emits update:modelValue when a segment is chosen', async () => {
    const wrapper = mountSegments()
    await wrapper.findAll('[data-segment] input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Initial'])
  })

  it('gives the selected segment the raised white treatment', () => {
    // Redline "Segment on" — white, tile radius, 700.
    const segments = mountSegments().findAll('[data-segment]')
    expect(segments[0].classes()).toContain('bg-surface')
    expect(segments[0].classes()).toContain('font-bold')
  })

  it('leaves unselected segments transparent and at 500', () => {
    // Redline "Segment off". Both branches must set background AND weight, or
    // the winner is decided by Tailwind's emit order.
    const segments = mountSegments().findAll('[data-segment]')
    expect(segments[1].classes()).toContain('bg-transparent')
    expect(segments[1].classes()).toContain('font-medium')
    expect(segments[1].classes()).not.toContain('bg-surface')
    expect(segments[1].classes()).not.toContain('font-bold')
  })

  it('sizes every segment from the same type step', () => {
    // Redline "Segment on"/"Segment off" are both 12.5px; only weight differs.
    for (const segment of mountSegments().findAll('[data-segment]')) {
      expect(segment.classes()).toContain('text-field-label')
    }
  })

  it('puts the muted shell around the group', () => {
    // Redline "Segmented shell"
    const group = mountSegments().get('[role="radiogroup"]')
    expect(group.classes()).toContain('bg-surface-muted')
    expect(group.classes()).toContain('rounded-field')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/tabs/__tests__/SegmentedTabs.spec.js`
Expected: FAIL — cannot resolve `../SegmentedTabs.vue`.

- [ ] **Step 3: Implement SegmentedTabs**

Create `src/design-system/components/tabs/SegmentedTabs.vue`:

```vue
<script setup>
import {
  SegmentGroupRoot,
  SegmentGroupItem,
  SegmentGroupItemText,
  SegmentGroupItemHiddenInput,
} from '@ark-ui/vue/segment-group'

defineProps({
  /** The options to choose between, in display order. */
  options: { type: Array, required: true },
  /** The selected option. */
  modelValue: { type: String, required: true },
  /**
   * Names the group for assistive technology. NOT rendered on screen — a
   * segmented control sits under a heading that already says what it filters.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <SegmentGroupRoot
    orientation="horizontal"
    :model-value="modelValue"
    :aria-label="label"
    class="segments inline-flex items-center bg-surface-muted rounded-field"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <SegmentGroupItem
      v-for="option in options"
      :key="option"
      :value="option"
      data-segment
      class="segments__item cursor-pointer whitespace-nowrap text-field-label rounded-tile"
      :class="
        option === modelValue
          ? 'segments__item--on bg-surface font-bold text-text-header'
          : 'bg-transparent font-medium text-text-meta'
      "
    >
      <SegmentGroupItemText>{{ option }}</SegmentGroupItemText>
      <SegmentGroupItemHiddenInput />
    </SegmentGroupItem>
  </SegmentGroupRoot>
</template>

<style scoped>
/* Redline "Segmented shell" — pad 3px, gap 6px. */
.segments {
  padding: 3px;
  gap: 6px;
}

.segments__item {
  padding: 6px 12px;
}

/* Redline "Segment on" — the lift. No shadow token carries this value:
 * --sh-card is the same geometry at half the opacity, so using it would be
 * visibly wrong. Left literal here rather than added to the frozen token
 * layer, which is diffed against the spec appendix. */
.segments__item--on {
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.08);
}

.segments__item:focus-within {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
```

Ark's `SegmentGroupRoot` may render its own element with the radio-group role; if `[role="radiogroup"]` is not on the element carrying your classes, add `as="div"` or move the assertion to the element Ark marks. Do not hand-write `role="radiogroup"` on top of Ark's — two roles on nested elements is worse than one in the wrong place.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/tabs/__tests__/SegmentedTabs.spec.js`
Expected: PASS — 7 tests.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as SegmentedTabs } from './components/tabs/SegmentedTabs.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/tabs/ src/design-system/index.js
git commit -m "feat(ds): add the segmented inline-filter tabs variant"
```

---

### Task 4: StageTabs — the workflow variant

Appendix C group **Tabs**, rows `Stage card`, `Stage active`, `Stage figure`, `Stage urgent`. Read them before starting.

**Ruling — StageTabs is built on Ark Tabs, not Ark Steps.** Ark ships a `steps`
component whose name matches "stage", and it is the wrong fit: a stepper
encodes linear progression, marking earlier items complete and rendering
separators between them. These stages are not a progression the user walks
through — they are five buckets of live applications, any one of which can be
selected to see its records, and "Closed" is not a step after "Issuance". The
artifact calls them stage *tabs*, and tablist/tab/tabpanel is the accurate
role set for "pick one, see its content". Cost if wrong: the visual result is
identical either way, so a later change would swap the wrapper, not the CSS.

**Files:**
- Create: `src/design-system/components/tabs/StageTabs.vue`
- Create: `src/design-system/components/tabs/__tests__/StageTabs.spec.js`
- Modify: `src/design-system/styles/theme.css`, `src/design-system/index.js`

**Interfaces:**
- Consumes: `@ark-ui/vue` from Task 1.
- Produces: `<StageTabs v-model :stages>` where `stages` is
  `Array<{ key, step, label, count, hint, urgent?, muted? }>` — `step` is the
  displayed marker string (`'1'`…`'4'`, and `'·'` for Closed), `count` a number.
  The default slot is a plain content slot for the active stage's panel and passes no
  scoped data, matching `Tabs` — the consumer resolves its own content.

- [ ] **Step 1: Add the stage figure type step**

The figure is 25px/700/-0.02em. Nothing in the scale carries it — `--text-card-figure` is 23px at -0.01em. Add to the plain `@theme` block in `src/design-system/styles/theme.css`, directly after the `--text-card-figure` group so the scale stays in descending size order:

```css
  /* Redline "Stage figure" — larger and tighter than a card figure, because a
   * stage card carries one number and nothing competes with it. */
  --text-stage-figure: 25px;
  --text-stage-figure--font-weight: 700;
  --text-stage-figure--letter-spacing: -0.02em;
```

This is a type step, not a token: `theme.css` is authored, `tokens.css` is the frozen verbatim layer. The token parity test does not read `theme.css`, so this does not break it.

- [ ] **Step 2: Write the failing test**

Create `src/design-system/components/tabs/__tests__/StageTabs.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StageTabs from '../StageTabs.vue'

const STAGES = [
  { key: 'review', step: '1', label: 'Review', count: 2, hint: '2 returned' },
  { key: 'payment', step: '2', label: 'Payment', count: 2, hint: '1 awaiting OP' },
  {
    key: 'inspection',
    step: '3',
    label: 'Inspection',
    count: 8,
    hint: '2 due within 7 days',
    urgent: true,
  },
  { key: 'issuance', step: '4', label: 'Issuance', count: 1, hint: 'ready to sign' },
  {
    key: 'closed',
    step: '·',
    label: 'Closed',
    count: 41,
    hint: 'rejected · forfeited',
    muted: true,
  },
]

const mountStages = (props = {}) =>
  mount(StageTabs, { props: { stages: STAGES, modelValue: 'review', ...props } })

describe('StageTabs', () => {
  it('renders one card per stage, with step, label, count and hint', () => {
    const wrapper = mountStages()
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(5)
    const text = wrapper.text()
    expect(text).toContain('Inspection')
    expect(text).toContain('8')
    expect(text).toContain('2 due within 7 days')
  })

  it('renders the Closed stage with its middot marker, not a number', () => {
    // The artifact gives Closed a "·" because it is not a step in the flow.
    expect(mountStages().findAll('[data-step]')[4].text()).toBe('·')
  })

  it('emits update:modelValue when a stage is chosen', async () => {
    const wrapper = mountStages()
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['inspection'])
  })

  it('rings only the active stage card', () => {
    // Redline "Stage active" — green border plus the select ring. Idle cards
    // keep the hairline border, so exactly one border colour applies to each.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[0].classes()).toContain('stage-tabs__card--active')
    expect(cards[0].classes()).toContain('border-green-500')
    expect(cards[0].classes()).not.toContain('border-hairline')
    expect(cards[1].classes()).toContain('border-hairline')
    expect(cards[1].classes()).not.toContain('border-green-500')
    expect(cards[1].classes()).not.toContain('stage-tabs__card--active')
  })

  it('renders the count at the stage-figure step', () => {
    // Redline "Stage figure"
    expect(mountStages().get('[data-figure]').classes()).toContain('text-stage-figure')
  })

  it('colours an urgent hint red and bold, leaving the others meta grey', () => {
    // Redline "Stage urgent" — 11.5/700. Every hint sets colour and weight, so
    // neither is left to emit order.
    const hints = mountStages().findAll('[data-hint]')
    expect(hints[2].classes()).toContain('text-red-700')
    expect(hints[2].classes()).toContain('font-bold')
    expect(hints[0].classes()).toContain('text-text-meta')
    expect(hints[0].classes()).toContain('font-normal')
    expect(hints[0].classes()).not.toContain('text-red-700')
  })

  it('mutes the Closed stage', () => {
    // Background has exactly one source: both branches of the same binding.
    const cards = mountStages().findAll('[role="tab"]')
    expect(cards[4].classes()).toContain('bg-surface-sunken')
    expect(cards[0].classes()).toContain('bg-surface')
    expect(cards[0].classes()).not.toContain('bg-surface-sunken')
  })

  it('renders the active stage panel through the default slot', () => {
    const wrapper = mount(StageTabs, {
      props: { stages: STAGES, modelValue: 'review' },
      slots: { default: '<span class="stage-panel-probe" />' },
    })
    expect(wrapper.find('.stage-panel-probe').exists()).toBe(true)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/tabs/__tests__/StageTabs.spec.js`
Expected: FAIL — cannot resolve `../StageTabs.vue`.

- [ ] **Step 4: Implement StageTabs**

Create `src/design-system/components/tabs/StageTabs.vue`:

```vue
<script setup>
import { TabsRoot, TabList, TabTrigger, TabContent } from '@ark-ui/vue/tabs'

defineProps({
  /** Stages: `{ key, step, label, count, hint, urgent?, muted? }`. */
  stages: { type: Array, required: true },
  /** The active stage's key. */
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <TabList class="stage-tabs__list">
      <TabTrigger
        v-for="stage in stages"
        :key="stage.key"
        :value="stage.key"
        class="stage-tabs__card border rounded-panel text-left cursor-pointer"
        :class="[
          stage.key === modelValue
            ? 'stage-tabs__card--active border-green-500'
            : 'border-hairline',
          stage.muted ? 'bg-surface-sunken' : 'bg-surface',
        ]"
      >
        <span class="flex items-center gap-2">
          <span data-step class="stage-tabs__step text-stat-hint font-bold text-text-meta">{{
            stage.step
          }}</span>
          <span class="text-field-label font-bold text-text-header">{{ stage.label }}</span>
        </span>
        <span data-figure class="stage-tabs__figure text-stage-figure text-text-header block">{{
          stage.count
        }}</span>
        <!-- Redline "Stage urgent" — red at 700; every other hint is meta grey
             at 400, so colour and weight each have exactly one source. -->
        <span
          data-hint
          class="text-stat-hint block"
          :class="stage.urgent ? 'text-red-700 font-bold' : 'text-text-meta font-normal'"
          >{{ stage.hint }}</span
        >
      </TabTrigger>
    </TabList>

    <TabContent :value="modelValue" class="pt-4">
      <slot />
    </TabContent>
  </TabsRoot>
</template>

<style scoped>
/* Appendix C "Stat cards & meters" sets the same auto-fit grid for card rows;
 * stage cards use it so a five-stage row wraps instead of scrolling. */
.stage-tabs__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

/* Redline "Stage card" — pad 13px 15px 14px. */
.stage-tabs__card {
  padding: 13px 15px 14px;
}

/* Redline "Stage active" — the select ring sits outside the green border. */
.stage-tabs__card--active {
  box-shadow: var(--ring-select);
}

.stage-tabs__figure {
  margin-top: 6px;
}

.stage-tabs__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/tabs/__tests__/StageTabs.spec.js`
Expected: PASS — 8 tests.

- [ ] **Step 6: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as StageTabs } from './components/tabs/StageTabs.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/tabs/ src/design-system/styles/theme.css src/design-system/index.js
git commit -m "feat(ds): add the stage workflow tabs variant"
```

---

### Task 5: Wire the Tabs section and close it

Replaces the section's three `DemoGap` markers with the real components and flips the manifest, which makes the existing "a complete section has zero gaps" test enforce the result.

**Files:**
- Modify: `src/design-system/demo/sections/TabsSection.vue`
- Modify: `src/design-system/demo/chrome/sections.js`
- Modify: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:**
- Consumes: `Tabs`, `SegmentedTabs`, `StageTabs` from Tasks 2-4.

**Do not change** the section's `title`, `description`, the three `DemoBlock` labels, or the three rule cards — all four are Appendix D content, asserted verbatim by `appendix-d-content.spec.js`.

- [ ] **Step 1: Write the failing test**

Append to `src/design-system/demo/sections/__tests__/sections.spec.js`.
`TabsSection` and `mount` are already imported there — add no imports:

```js
describe('TabsSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(TabsSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('shows the underline tabs with the artifact data', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Active LTOs')
    expect(text).toContain('211')
    expect(text).toContain('MOA services')
  })

  it('shows the panel body of whichever tab is active', () => {
    // The three tab rows are independently stateful, so the section holds the
    // selection; a static render must still show the default tab's body.
    expect(mount(TabsSection).text()).toContain('211 licences currently valid')
  })

  it('shows the four segmented filter options', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Initial')
    expect(text).toContain('Add / Modify')
  })

  it('shows all five workflow stages', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Inspection')
    expect(text).toContain('Closed')
    expect(text).toContain('rejected · forfeited')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — 3 gap markers found, expected 0.

- [ ] **Step 3: Wire the components in**

In `src/design-system/demo/sections/TabsSection.vue`, drop the `DemoGap` import, import the three components and `ref`, and add the artifact's own demo data — verbatim, including the middot in `rejected · forfeited`:

```js
import { ref } from 'vue'
import { Tabs, SegmentedTabs, StageTabs } from '@/design-system'

const UNDERLINE_TABS = [
  {
    key: 'active',
    label: 'Active LTOs',
    count: '211',
    body: '211 licences currently valid. Expiry tone tells you which need a renewal notice.',
  },
  {
    key: 'all',
    label: 'All applications',
    count: '215',
    body: 'Every application ever filed, including rejected and forfeited records.',
  },
  {
    key: 'moa',
    label: 'MOA services',
    count: '8',
    body: 'Services delivered under a memorandum of agreement with another facility.',
  },
]

const STAGES = [
  { key: 'review', step: '1', label: 'Review', count: 2, hint: '2 returned' },
  { key: 'payment', step: '2', label: 'Payment', count: 2, hint: '1 awaiting OP' },
  { key: 'inspection', step: '3', label: 'Inspection', count: 8, hint: '2 due within 7 days', urgent: true },
  { key: 'issuance', step: '4', label: 'Issuance', count: 1, hint: 'ready to sign' },
  { key: 'closed', step: '·', label: 'Closed', count: 41, hint: 'rejected · forfeited', muted: true },
]

const SEGMENT_OPTIONS = ['All', 'Initial', 'Renewal', 'Add / Modify']

const activeTab = ref('active')
const activeSegment = ref('All')
const activeStage = ref('review')
```

Then replace each `DemoGap` with its component, leaving the three `DemoBlock` labels untouched:

```html
      <DemoBlock label="UNDERLINE — PRIMARY, SITS ON A CARD EDGE">
        <Tabs v-model="activeTab" :tabs="UNDERLINE_TABS">
          <p class="text-body text-text-meta">
            {{ UNDERLINE_TABS.find((tab) => tab.key === activeTab)?.body }}
          </p>
        </Tabs>
      </DemoBlock>
      <DemoBlock label="SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS">
        <SegmentedTabs
          v-model="activeSegment"
          :options="SEGMENT_OPTIONS"
          label="Application type"
        />
      </DemoBlock>
      <DemoBlock label="STAGE TABS — A WORKFLOW WITH VOLUME PER STEP">
        <StageTabs v-model="activeStage" :stages="STAGES">
          <p class="text-body text-text-meta">
            Showing {{ STAGES.find((stage) => stage.key === activeStage)?.count }} application(s) in
            {{ STAGES.find((stage) => stage.key === activeStage)?.label }}.
          </p>
        </StageTabs>
      </DemoBlock>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS.

- [ ] **Step 5: Flip the manifest**

In `src/design-system/demo/chrome/sections.js`, set the `tabs` section's `complete` to `true`.

- [ ] **Step 6: Run all gates**

Run: `npx vitest run && npm run verify:css && npm run lint`

The manifest test ("a section marked complete renders no gaps") now covers the Tabs section for good — regressing any of the three components back to a gap fails the suite. Expect the full count to have grown by roughly 32 tests, to about 290.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/demo/
git commit -m "feat(ds): render the Tabs section's three variants and mark it complete"
```

---

## Self-Review

Checked against the spec after writing:

**Spec coverage.** Appendix C's `Tabs` group has 15 rows. `Underline pad`,
`Underline type`, `Marker`, `Active text`, `Idle tab text`, `Tab count`,
`Count active`, `Count idle` → Task 2. `Segmented shell`, `Segment on`,
`Segment off` → Task 3. `Stage card`, `Stage active`, `Stage figure`,
`Stage urgent` → Task 4. All 15 land in a task, and each has an assertion.

**Type consistency.** `Tabs` takes `tabs`/`modelValue`; `SegmentedTabs` takes
`options`/`modelValue`/`label`; `StageTabs` takes `stages`/`modelValue`. Task
5 calls all three with exactly those names. `StatCard`'s props in Task 1
(`label`, `value`, `hint`, `dot`, `urgent`, `muted`) and `Meter`'s (`value`,
`max`, `label`, `caption`) were read from the components, not recalled.

**Values verified against the repo, not assumed:** `--r-panel` is 12px,
`--r-field` 9px, `--r-tile` 7px; `--color-green-fill`, `--color-green-500`,
`--color-green-100`, `--color-green-text`, `--color-red-700`,
`--color-hairline`, `--color-surface-muted` and `--color-text-meta` are all
bridged, so the plan's utilities resolve. `--text-stat-hint` is 11.5/400 and
`--text-field-label` 12.5/500, so the count, segment and urgent-hint sizes
compose from existing steps plus a weight utility — only the 25px stage figure
needs a new one.

**Two known un-tokenised values**, both deliberate and commented in place: the
auto-fit grid track list (Task 1) and the segment's `.08` lift (Task 3, where
`--sh-card` is the same geometry at half opacity and would be visibly wrong).
Neither belongs in the frozen token layer.

**One ruling recorded:** StageTabs is built on Ark Tabs rather than Ark Steps
(Task 4), because a stepper's progression semantics misdescribe five parallel
buckets. Ark Steps is therefore unused by this phase.
