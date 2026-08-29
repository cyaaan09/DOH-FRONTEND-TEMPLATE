# Demo Page Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/design-system` so it mirrors the source artifact's page structure exactly, with every unbuilt component slot rendering a visible gap marker — turning the page into a live checklist of what remains.

**Architecture:** Six demo-only chrome components reproduce the artifact's page furniture (section card, sub-block grid, sunken strip, rule-card footer, gap marker). The page is then assembled from them in the artifact's own section order, with descriptions, sub-block labels and rule cards taken verbatim from spec Appendix D. Sections whose components exist get their current demos re-homed into the chrome; sections whose components do not exist yet get the same headings with `DemoGap` in each slot.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, Vitest 4 + `@vue/test-utils`

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — **§17 is the architecture and Appendix D is the content authority.** Read both. Appendix C remains the authority for component values.

**Phase:** 3a of the remaining work. Phases 1, 2 and 2.5 are complete on branch `design-system` (192 tests). The section-filling phases follow, each dropping components into slots this phase creates.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **Appendix D is the content authority for this page.** Section descriptions, sub-block labels and rule-card text are copied verbatim from it — not paraphrased, not shortened, not reworded. The whole point is that our page and the artifact's read identically so any difference is a real defect.
- **Appendix C remains the authority for values.** Where this plan gives a pixel value, it came from there.
- `src/design-system/demo/` is exempt from the raw-hex guard, but keep colours in tokens anyway — the chrome is built from the same tokens as everything else.
- No `dark:` variants anywhere in `src/design-system/`; no arbitrary type sizes.
- Chrome components are demo-only and are **never** exported from `src/design-system/index.js`.
- Nothing under `src/design-system/` may import from `src/components/`.
- `tokens.css` and `tokens.dark.css` must not be edited — a test diffs them against spec Appendix A/A.1 in both directions.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run tests with `npx vitest run` — `test:unit` is watch mode and will hang.
- Commit messages carry **no** `Co-Authored-By` trailer.
- **Never put a comment before a component's root element.** Vue compiles that as a Fragment root, and `wrapper.classes()` then reads the comment node and returns `[]` — tests fail in a way that looks like a class bug. Put explanatory comments inside the root. This has now bitten twice.

## File Structure

```
src/design-system/styles/theme.css          MODIFIED — adds --text-caption (Task 1)

src/design-system/demo/chrome/
  DemoCard.vue      section card: header, title, description, body slot   (Task 2)
  DemoBlocks.vue    auto-fit sub-block grid                                (Task 2)
  DemoBlock.vue     label + note + content                                 (Task 2)
  DemoStrip.vue     sunken full-width strip for interactive demos          (Task 2)
  DemoRules.vue     three-column rule-card footer                          (Task 3)
  DemoGap.vue       the not-built marker                                   (Task 3)
  sections.js       the section manifest — order, titles, completeness     (Task 3)

src/design-system/demo/sections/            one file per artifact section
  FoundationsSection.vue  ContainersSection.vue  ChipsSection.vue
  TabsSection.vue         FieldsSection.vue      DropdownsSection.vue
  ButtonsSection.vue      FilesSection.vue       NoticesSection.vue
  SelectionSection.vue    DialogSection.vue      TypeScaleSection.vue
  SpecsSection.vue        DarkModeSection.vue    TokensSection.vue

src/pages/design-system.vue                 REWRITTEN — assembles the sections
```

The existing `ButtonsDemo.vue`, `ChipsDemo.vue`, `CardsDemo.vue`, `FieldsDemo.vue`, `FeedbackDemo.vue`, `TypeScaleDemo.vue` and `DemoSection.vue` are absorbed into the new section files and deleted. One file per artifact section keeps each holdable in context and means a later phase edits exactly one file to fill its slots.

---

### Task 1: The note type entry

The chrome needs a 12.5px/1.5 style the scale lacks. Nothing visual changes.

**Files:**
- Modify: `src/design-system/styles/theme.css`
- Modify: `src/design-system/styles/__tests__/theme-bridge.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: the `text-caption` utility (12.5px / line-height 1.5 / weight 400). Tasks 2-6 use it for sub-block notes and rule-card bodies.

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/styles/__tests__/theme-bridge.spec.js`, inside its existing top-level `describe`:

```js
  it('defines the note style the demo chrome needs', () => {
    // Spec §17.1 — sub-block notes and rule-card bodies are 12.5px / 1.5.
    // The scale's text-field-label is also 12.5px but carries weight 500 and
    // no line-height, so it is the wrong style for running prose.
    expect(bridge.get('text-caption')).toBe('12.5px')
    expect(bridge.get('text-caption--line-height')).toBe('1.5')
    expect(bridge.get('text-caption--font-weight')).toBe('400')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: FAIL — `expected undefined to be '12.5px'`.

- [ ] **Step 3: Add the entry**

Add to the **plain `@theme` block** in `src/design-system/styles/theme.css`, below the existing type scale — this is a literal, not a bridged token:

```css
  /* Demo chrome caption style — spec §17.1. Sub-block notes and rule-card
   * bodies are running prose at 12.5px with a 1.5 line-height; the scale's
   * text-field-label is the same size but weight 500 with no line-height,
   * which is a label style, not a prose one.
   *
   * Named `caption`, NOT `note`: the scale already has --text-notice (13px /
   * 1.35), and `text-note` beside `text-notice` is a near-miss where both are
   * valid classes that render at different sizes — a typo would look almost
   * right and never fail a test. */
  --text-caption: 12.5px;
  --text-caption--line-height: 1.5;
  --text-caption--font-weight: 400;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: PASS.

- [ ] **Step 5: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/styles/
git commit -m "feat(ds): add the note type style the demo chrome needs"
```

---

### Task 2: Layout chrome — card, blocks, block, strip

Four components reproducing the artifact's section furniture. Values are spec §17.1.

**Files:**
- Create: `src/design-system/demo/chrome/DemoCard.vue`, `DemoBlocks.vue`, `DemoBlock.vue`, `DemoStrip.vue`
- Create: `src/design-system/demo/chrome/__tests__/chrome.spec.js`

**Interfaces:**
- Consumes: `text-caption` from Task 1.
- Produces: `<DemoCard title description>` with a default slot; `<DemoBlocks>` wrapping `<DemoBlock label note>`; `<DemoStrip label>` with a default slot. Tasks 4-6 compose every section from these.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/demo/chrome/__tests__/chrome.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DemoCard from '../DemoCard.vue'
import DemoBlocks from '../DemoBlocks.vue'
import DemoBlock from '../DemoBlock.vue'
import DemoStrip from '../DemoStrip.vue'

describe('DemoCard', () => {
  it('renders a hairline card at card radius', () => {
    // Spec §17.1 — radius 14, 1px hairline, --sh-card
    const classes = mount(DemoCard, { props: { title: 'Chips' } }).classes()
    expect(classes).toContain('rounded-card')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('shadow-card')
  })

  it('renders the title at section-title scale', () => {
    const heading = mount(DemoCard, { props: { title: 'Chips' } }).get('h2')
    expect(heading.text()).toBe('Chips')
    expect(heading.classes()).toContain('text-section-title')
  })

  it('renders a description only when given one', () => {
    const withDesc = mount(DemoCard, {
      props: { title: 'Chips', description: 'Tone comes from the meaning.' },
    })
    expect(withDesc.text()).toContain('Tone comes from the meaning.')
    expect(mount(DemoCard, { props: { title: 'Chips' } }).findAll('p')).toHaveLength(0)
  })

  it('renders its default slot', () => {
    const wrapper = mount(DemoCard, {
      props: { title: 'Chips' },
      slots: { default: '<span class="body-probe" />' },
    })
    expect(wrapper.find('.body-probe').exists()).toBe(true)
  })
})

describe('DemoBlocks', () => {
  it('renders an auto-fit grid, not a fixed column count', () => {
    // Spec §17.1 — repeat(auto-fit, minmax(268px, 1fr)), gap 24
    const wrapper = mount(DemoBlocks, { slots: { default: '<span class="block-probe" />' } })
    expect(wrapper.classes()).toContain('demo-blocks')
    expect(wrapper.find('.block-probe').exists()).toBe(true)
  })
})

describe('DemoBlock', () => {
  it('renders its label at column-header scale', () => {
    const label = mount(DemoBlock, { props: { label: 'STATUS' } }).get('[data-label]')
    expect(label.text()).toBe('STATUS')
    expect(label.classes()).toContain('text-column-header')
    expect(label.classes()).toContain('text-text-header')
  })

  it('renders a note only when given one', () => {
    const withNote = mount(DemoBlock, { props: { label: 'STATUS', note: 'A dot plus a word.' } })
    expect(withNote.get('[data-note]').classes()).toContain('text-caption')
    expect(mount(DemoBlock, { props: { label: 'STATUS' } }).find('[data-note]').exists()).toBe(false)
  })

  it('renders its default slot', () => {
    const wrapper = mount(DemoBlock, {
      props: { label: 'STATUS' },
      slots: { default: '<span class="chip-probe" />' },
    })
    expect(wrapper.find('.chip-probe').exists()).toBe(true)
  })
})

describe('DemoStrip', () => {
  it('sits on the sunken surface below a divider', () => {
    // Spec §17.1 — border-top 1px --divider, background --surface-sunken
    const classes = mount(DemoStrip, { props: { label: 'INTERACTIVE — FILTER CHIPS' } }).classes()
    expect(classes).toContain('bg-surface-sunken')
    expect(classes).toContain('border-divider')
  })

  it('renders its label and slot', () => {
    const wrapper = mount(DemoStrip, {
      props: { label: 'INTERACTIVE — FILTER CHIPS' },
      slots: { default: '<span class="strip-probe" />' },
    })
    expect(wrapper.text()).toContain('INTERACTIVE — FILTER CHIPS')
    expect(wrapper.find('.strip-probe').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/chrome/__tests__/chrome.spec.js`
Expected: FAIL — cannot resolve `../DemoCard.vue`.

- [ ] **Step 3: Create DemoCard**

Create `src/design-system/demo/chrome/DemoCard.vue`:

```vue
<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="mb-section overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
    <!-- Spec §17.1 — section card: radius 14, hairline, card shadow.
         Header pad 20/24/4, title at section-title scale, description at body.
         Comment inside the root: a comment before it compiles a Fragment root
         and breaks wrapper.classes(). -->
    <div class="px-card-x pt-5 pb-1">
      <h2 class="text-section-title text-ink-900">{{ title }}</h2>
      <p v-if="description" class="text-body text-text-meta mt-0.5 max-w-4xl">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>
```

- [ ] **Step 4: Create DemoBlocks, DemoBlock and DemoStrip**

`src/design-system/demo/chrome/DemoBlocks.vue`:

```vue
<template>
  <div class="demo-blocks px-card-x pt-4.5 pb-1.5">
    <slot />
  </div>
</template>

<style scoped>
/* Spec §17.1 — repeat(auto-fit, minmax(268px, 1fr)), gap 24px. Tailwind has
 * no utility for an auto-fit track list, so it is expressed here. */
.demo-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
  gap: 24px;
}
</style>
```

`src/design-system/demo/chrome/DemoBlock.vue`:

```vue
<script setup>
defineProps({
  label: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <div>
    <!-- Spec §17.1 — label 10.5/700/0.08em, margin-bottom 4px -->
    <div data-label class="text-column-header text-text-header mb-1">{{ label }}</div>
    <!-- note 12.5/1.5, margin-bottom 10px -->
    <p v-if="note" data-note class="text-caption text-text-meta mb-2.5">{{ note }}</p>
    <slot />
  </div>
</template>
```

`src/design-system/demo/chrome/DemoStrip.vue`:

```vue
<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="border-t border-divider bg-surface-sunken px-card-x pt-4.5 pb-5.5">
    <!-- Spec §17.1 — border-top 1px divider, sunken surface, pad 18/24/22.
         Comment inside the root, per the Fragment-root note above. -->
    <div class="text-column-header text-text-header mb-2.5">{{ label }}</div>
    <slot />
  </div>
</template>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/chrome/__tests__/chrome.spec.js`
Expected: PASS — 10 tests.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/chrome/
git commit -m "feat(ds): add the demo page's layout chrome"
```

---

### Task 3: Rule footer, gap marker, and the section manifest

The two components that make the page a checklist, plus the manifest a test reads to enforce it.

**Files:**
- Create: `src/design-system/demo/chrome/DemoRules.vue`, `DemoGap.vue`, `sections.js`
- Create: `src/design-system/demo/chrome/__tests__/gaps.spec.js`

**Interfaces:**
- Consumes: `text-caption` from Task 1.
- Produces: `<DemoRules :rules="[{ title, body }]" />`; `<DemoGap component group />`; and `SECTIONS` from `sections.js` — an array of `{ id, title, complete }` in the artifact's order. Tasks 4-6 consume all three.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/demo/chrome/__tests__/gaps.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DemoRules from '../DemoRules.vue'
import DemoGap from '../DemoGap.vue'
import { SECTIONS } from '../sections'

describe('DemoRules', () => {
  it('renders one card per rule', () => {
    const wrapper = mount(DemoRules, {
      props: {
        rules: [
          { title: 'One tone per meaning', body: 'Green = good or issued.' },
          { title: 'Never two chips of the same tone', body: 'Move it into the label line.' },
        ],
      },
    })
    expect(wrapper.findAll('[data-rule]')).toHaveLength(2)
    expect(wrapper.text()).toContain('One tone per meaning')
    expect(wrapper.text()).toContain('Move it into the label line.')
  })

  it('renders the title at rule scale and the body at note scale', () => {
    const wrapper = mount(DemoRules, {
      props: { rules: [{ title: 'A', body: 'B' }] },
    })
    expect(wrapper.get('[data-rule-title]').classes()).toContain('text-notice')
    expect(wrapper.get('[data-rule-title]').classes()).toContain('font-bold')
    expect(wrapper.get('[data-rule-body]').classes()).toContain('text-caption')
  })

  it('renders nothing when given no rules', () => {
    expect(mount(DemoRules, { props: { rules: [] } }).findAll('[data-rule]')).toHaveLength(0)
  })
})

describe('DemoGap', () => {
  it('names the missing component and the redline group that governs it', () => {
    const wrapper = mount(DemoGap, {
      props: { component: 'SegmentedTabs', group: 'Tabs' },
    })
    expect(wrapper.text()).toContain('SegmentedTabs')
    expect(wrapper.text()).toContain('Tabs')
  })

  it('marks itself so a test can count gaps', () => {
    expect(mount(DemoGap, { props: { component: 'X', group: 'Y' } }).attributes('data-gap')).toBe(
      '',
    )
  })

  it('uses the dashed panel treatment', () => {
    // Spec §17.1 — dashed --border-dashed at 1.6px
    expect(mount(DemoGap, { props: { component: 'X', group: 'Y' } }).classes()).toContain(
      'demo-gap',
    )
  })
})

describe('the section manifest', () => {
  it('lists the artifact sections in order', () => {
    // Spec Appendix D. The order is the artifact's own and must not drift.
    expect(SECTIONS.map((s) => s.id)).toEqual([
      'foundations',
      'containers',
      'chips',
      'tabs',
      'fields',
      'dropdowns',
      'buttons',
      'files',
      'notices',
      'selection',
      'dialog',
      'type-scale',
      'specs',
      'dark-mode',
      'tokens',
    ])
  })

  it('gives every section a title and a completeness flag', () => {
    for (const section of SECTIONS) {
      expect(typeof section.title, section.id).toBe('string')
      expect(section.title.length, section.id).toBeGreaterThan(0)
      expect(typeof section.complete, section.id).toBe('boolean')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/chrome/__tests__/gaps.spec.js`
Expected: FAIL — cannot resolve `../DemoRules.vue`.

- [ ] **Step 3: Create DemoRules and DemoGap**

`src/design-system/demo/chrome/DemoRules.vue`:

```vue
<script setup>
defineProps({
  rules: { type: Array, required: true },
})
</script>

<template>
  <div v-if="rules.length" class="demo-rules border-t border-divider">
    <!-- Spec §17.1 — border-top divider; auto-fit minmax(240px,1fr); each card
         pad 16/24 with a right rule that the negative margin hides on the last
         column of each row. The comment sits INSIDE the root: a comment before
         it makes Vue compile a Fragment root, and wrapper.classes() then reads
         the comment node instead of the element. -->
    <div v-for="rule in rules" :key="rule.title" data-rule class="demo-rules__card px-card-x py-4">
      <div data-rule-title class="text-notice font-bold text-ink-900">{{ rule.title }}</div>
      <p data-rule-body class="text-caption text-text-meta mt-1">{{ rule.body }}</p>
    </div>
  </div>
</template>

<style scoped>
.demo-rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.demo-rules__card {
  border-right: 1px solid var(--divider);
  margin-right: -1px;
}
</style>
```

`src/design-system/demo/chrome/DemoGap.vue`:

```vue
<script setup>
defineProps({
  component: { type: String, required: true },
  group: { type: String, required: true },
})
</script>

<template>
  <div data-gap class="demo-gap text-caption text-ink-400">
    <!-- Spec §17.2 — a slot whose component is not built yet. Visible on the
         page so the remaining work is a checklist rather than an absence.
         Comment inside the root, per the Fragment-root note above. -->
    <span class="font-mono text-mono">{{ component }}</span>
    not built — Appendix C “{{ group }}”
  </div>
</template>

<style scoped>
/* Spec §17.1 — dashed panel treatment, the source's dropzone/empty-state
 * border. --border-dashed has no utility namespace. */
.demo-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 13px;
  border: 1.6px dashed var(--border-dashed);
  border-radius: var(--r-panel);
}
</style>
```

- [ ] **Step 4: Create the section manifest**

`src/design-system/demo/chrome/sections.js`:

```js
/**
 * The artifact's section order, from spec Appendix D. The demo page mirrors
 * this exactly (spec §17) so a side-by-side comparison needs no translation.
 *
 * `complete` means every slot in that section renders a real component. A
 * test asserts a complete section contains no DemoGap, so a section cannot be
 * declared done while a slot is still empty. Each later phase flips the
 * sections it fills.
 */
export const SECTIONS = [
  { id: 'foundations', title: 'Foundations', complete: false },
  { id: 'containers', title: 'Containers & surfaces', complete: false },
  { id: 'chips', title: 'Chips', complete: false },
  { id: 'tabs', title: 'Tabs', complete: false },
  { id: 'fields', title: 'Text fields', complete: true },
  { id: 'dropdowns', title: 'Dropdowns', complete: false },
  { id: 'buttons', title: 'Buttons', complete: true },
  { id: 'files', title: 'File inputs', complete: false },
  { id: 'notices', title: 'Toasts & inline notices', complete: false },
  { id: 'selection', title: 'Selection controls', complete: false },
  { id: 'dialog', title: 'Dialog, empty state & loading', complete: false },
  { id: 'type-scale', title: 'Type scale', complete: true },
  { id: 'specs', title: 'Component specs', complete: false },
  { id: 'dark-mode', title: 'Dark mode', complete: false },
  { id: 'tokens', title: 'Tokens for handoff', complete: false },
]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/chrome/__tests__/gaps.spec.js`
Expected: PASS — 8 tests.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/chrome/
git commit -m "feat(ds): add the rule footer, gap marker and section manifest"
```

---

### Task 4: Sections whose components already exist

Six sections re-homed into the chrome. Their demos exist today as flat rows in `demo/*.vue`; they gain the artifact's headings, notes and rule footers, and their content moves into the artifact's own sub-blocks.

**Files:**
- Create: `src/design-system/demo/sections/ContainersSection.vue`, `ChipsSection.vue`, `FieldsSection.vue`, `ButtonsSection.vue`, `NoticesSection.vue`, `TypeScaleSection.vue`
- Create: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:**
- Consumes: `DemoCard`, `DemoBlocks`, `DemoBlock`, `DemoStrip` (Task 2); `DemoRules`, `DemoGap` (Task 3); every component exported from `@/design-system`.
- Produces: six section components, each taking no props. Task 6 assembles them.

**Content comes from spec Appendix D, verbatim.** Each section's description is the `**Description:**` line under its heading there; each sub-block's label and note come from the artifact; each rule footer's cards come from Appendix D's rule-card data. Do not paraphrase — an identical page is the whole point.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/demo/sections/__tests__/sections.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChipsSection from '../ChipsSection.vue'
import NoticesSection from '../NoticesSection.vue'
import ButtonsSection from '../ButtonsSection.vue'
import FieldsSection from '../FieldsSection.vue'
import ContainersSection from '../ContainersSection.vue'
import TypeScaleSection from '../TypeScaleSection.vue'

describe('ChipsSection', () => {
  it('carries the artifact description verbatim', () => {
    expect(mount(ChipsSection).text()).toContain(
      'Tone comes from the meaning, never from decoration.',
    )
  })

  it('renders the five tone sub-blocks the artifact shows', () => {
    const text = mount(ChipsSection).text()
    for (const label of ['STATUS', 'APPLICATION TYPE', 'SERVICE', 'SOURCE', 'COUNT & OVERFLOW']) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('renders the interactive and dismissible strips', () => {
    const text = mount(ChipsSection).text()
    expect(text).toContain('INTERACTIVE — FILTER CHIPS')
    expect(text).toContain('DISMISSIBLE — APPLIED FILTERS')
  })

  it('renders the three rule cards', () => {
    const wrapper = mount(ChipsSection)
    expect(wrapper.findAll('[data-rule]')).toHaveLength(3)
    expect(wrapper.text()).toContain('One tone per meaning')
  })
})

describe('NoticesSection', () => {
  it('renders the inline notices strip with all four tones', () => {
    const text = mount(NoticesSection).text()
    expect(text).toContain('INLINE NOTICES — PERSISTENT, IN-FLOW')
    for (const label of ['Success', 'Info', 'Warning', 'Error']) {
      expect(text, `missing notice: ${label}`).toContain(label)
    }
  })

  it('marks the toast stack as not built', () => {
    // Toast is Phase 3e. Its slot must be visible, not absent.
    expect(mount(NoticesSection).findAll('[data-gap]').length).toBeGreaterThan(0)
  })
})

describe('sections with complete components render no gaps', () => {
  it.each([
    ['ButtonsSection', ButtonsSection],
    ['FieldsSection', FieldsSection],
    ['TypeScaleSection', TypeScaleSection],
  ])('%s', (_name, component) => {
    expect(mount(component).findAll('[data-gap]')).toHaveLength(0)
  })
})

describe('ContainersSection', () => {
  it('renders all four sub-blocks, gaps included', () => {
    const text = mount(ContainersSection).text()
    for (const label of [
      'PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT',
      'CARD — HEADER, BODY, FOOTER',
      'DIVIDED CARD — NO NESTING',
      'INNER SURFACES',
    ]) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('marks the page shell as not built', () => {
    expect(mount(ContainersSection).findAll('[data-gap]').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — cannot resolve `../ChipsSection.vue`.

- [ ] **Step 3: Create ChipsSection — the pattern every other section follows**

Create `src/design-system/demo/sections/ChipsSection.vue`. This is the fullest shape: sub-blocks, two strips, and a rule footer.

```vue
<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip, FilterChip } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoRules from '../chrome/DemoRules.vue'
import DemoGap from '../chrome/DemoGap.vue'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
])

const FILTERS = [
  'Primary Care Facility',
  'Hospital',
  'Birthing Home',
  'Clinical Laboratory',
  'Pharmacy',
  'X-ray Facility',
]
const selected = ref(['Primary Care Facility', 'Hospital', 'Birthing Home'])

// Rule cards — spec Appendix D, chipRules
const RULES = [
  {
    title: 'One tone per meaning',
    body: 'Green = good or issued, amber = waiting or legacy, red = blocked or overdue, grey = neutral, purple = modification.',
  },
  {
    title: 'Never two chips of the same tone',
    body: 'If a row needs two amber chips, one of them is really a field, not a chip. Move it into the label line.',
  },
  {
    title: 'Chips never wrap mid-phrase',
    body: 'white-space: nowrap, and overflow collapses into a grey “+n more” that expands the row.',
  },
]

function dismiss({ chipKey, value }) {
  applied.value = applied.value.filter((chip) => !(chip.key === chipKey && chip.value === value))
}

function toggle(label) {
  selected.value = selected.value.includes(label)
    ? selected.value.filter((item) => item !== label)
    : [...selected.value, label]
}
</script>

<template>
  <DemoCard
    title="Chips"
    description="Height auto (20px at 11px type), radius 999, 11px / 700, padding 3px 9px. Tone comes from the meaning, never from decoration."
  >
    <DemoBlocks>
      <DemoBlock
        label="STATUS"
        note="A dot plus a word. Green for good, amber for waiting, red for blocked, grey for closed."
      >
        <ChipGroup>
          <Chip tone="green" dot>Approved</Chip>
          <Chip variant="filled">Active</Chip>
          <Chip tone="amber" dot>Pending</Chip>
          <Chip tone="red" dot>Returned</Chip>
          <Chip tone="neutral" dot>Closed</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="APPLICATION TYPE"
        note="Flat tint, no dot — a category, not a state. Purple is reserved for Add / Modify."
      >
        <ChipGroup>
          <Chip tone="neutral">Initial</Chip>
          <Chip tone="neutral">Renewal</Chip>
          <Chip tone="violet">Add / Modify</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="SERVICE"
        note="Outline only — a licence can carry six of these, so tint would drown the row. 12px / 400, white surface, hairline border."
      >
        <ChipGroup>
          <Chip variant="service">New · Birthing Home</Chip>
          <Chip variant="service">New · Clinical Laboratory — Limited</Chip>
          <Chip variant="service">New · Ambulance Service Provider — Type I</Chip>
          <Chip variant="service">Upgrade · Clinical Laboratory — Tertiary</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="SOURCE"
        note="Where the record came from. Blue for portal-filed, amber for migrated paper records."
      >
        <ChipGroup>
          <Chip tone="blue">Online</Chip>
          <Chip tone="amber">Legacy</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="COUNT & OVERFLOW"
        note="Numeric badges in nav and tables. Red only when the count is work waiting on you."
      >
        <DemoGap component="Chip variant=&quot;count&quot;" group="Chips" />
      </DemoBlock>
    </DemoBlocks>

    <DemoStrip label="INTERACTIVE — FILTER CHIPS">
      <div class="flex flex-wrap items-center gap-2">
        <FilterChip
          v-for="label in FILTERS"
          :key="label"
          :selected="selected.includes(label)"
          @toggle="toggle(label)"
          >{{ label }}</FilterChip
        >
        <span v-if="selected.length" class="text-caption text-green-text ml-1">
          Clear {{ selected.length }}
        </span>
      </div>
      <p class="text-caption text-text-meta mt-2.5">
        Selected chips fill green; unselected keep a hairline border so the row reads as one control
        group.
      </p>
    </DemoStrip>

    <DemoStrip label="DISMISSIBLE — APPLIED FILTERS">
      <ChipGroup>
        <DismissibleChip
          v-for="chip in applied"
          :key="chip.value"
          :chip-key="chip.key"
          :value="chip.value"
          @dismiss="dismiss"
        />
        <span v-if="applied.length === 0" class="text-caption text-text-meta">No filters applied.</span>
      </ChipGroup>
    </DemoStrip>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
```

**Note the filter strip uses `gap-2` (8px), not `ChipGroup`.** Spec §17.3: the artifact's tone-chip rows are 7px but its filter-chip row is 8px. `ChipGroup` is 7px, so the filter row sets its own gap. That closes the first of §17.3's three gaps.

**The other two are component work and are deliberately NOT in this phase.** §17.3 also records that `FilterChip` is missing the checkbox-style mark glyph the artifact shows inside each filter chip, and that two Chip variants were never built — count badges (`13`, `+4 more`) and overflow/expiry pills (`128 days left`). This phase renders the filter chips as they currently are and marks `COUNT & OVERFLOW` with a `DemoGap`, so both remain visible on the page as outstanding work rather than being quietly papered over. The phase that fills the Chips section closes them.

- [ ] **Step 4: Create the other five sections**

Each follows the same shape as Step 3. Content is verbatim from spec Appendix D.

**`ContainersSection.vue`** — description from Appendix D's `Containers & surfaces`. Four `DemoBlock`s in a `DemoBlocks`:
- `PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT` → `<DemoGap component="AppShell" group="App shell — sidebar & header" />`
- `CARD — HEADER, BODY, FOOTER` → the existing `CardsDemo` card example (`Card` + `CardHeader` with an actions `Button` + `CardBody` + `CardFooter` with two buttons)
- `DIVIDED CARD — NO NESTING` → `<DemoGap component="DividedCard" group="Containers & surfaces" />`
- `INNER SURFACES` → four labelled swatch rows using `bg-surface-sunken`, `bg-surface-input`, `bg-surface-muted` and a dashed `--border-dashed` box, each with the artifact's caption
- Rules: Appendix D's `containerRules` (3 cards)

**`FieldsSection.vue`** — description from Appendix D's `Text fields`. No sub-blocks; the artifact shows the fields inline. Move the existing `FieldsDemo` content in, using the artifact's own sample values: facility name `Carmen RHU, ADN`, LTO number `16-015-2527` (mono), a search field, bed capacity with the `beds` suffix and its error, a read-only `NHFR code`, and the reviewer remarks textarea with its 400-character counter. No rule footer — the artifact shows none for this section.

**`ButtonsSection.vue`** — description from Appendix D's `Buttons`. No sub-blocks. Move the existing `ButtonsDemo` content in: the four variants at default size, the compact row, the icon button, the busy toggle and a disabled example. No rule footer.

**`NoticesSection.vue`** — description from Appendix D's `Toasts & inline notices`. One `DemoStrip` labelled `INLINE NOTICES — PERSISTENT, IN-FLOW` holding the four `Notice`s with their bold emphasis clauses, exactly as they read in the artifact. Above it, a `DemoGap` for the toast stack: `<DemoGap component="Toast + ToastRegion" group="Toasts &amp; notices" />`. Rules: Appendix D's `toastRules` (3 cards).

**`TypeScaleSection.vue`** — description from Appendix D's `Type scale`. Move the existing `TypeScaleDemo` rows in unchanged; they already match. No sub-blocks, no rule footer.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS — 10 tests.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/sections/
git commit -m "feat(ds): re-home the built sections into the artifact's page chrome"
```

---

### Task 5: Skeleton-only sections

Nine sections whose components do not exist yet. Each gets the artifact's headings and notes with a `DemoGap` in every slot, so the remaining work is visible in place.

**Files:**
- Create: `src/design-system/demo/sections/FoundationsSection.vue`, `TabsSection.vue`, `DropdownsSection.vue`, `FilesSection.vue`, `SelectionSection.vue`, `DialogSection.vue`, `SpecsSection.vue`, `DarkModeSection.vue`, `TokensSection.vue`
- Modify: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:**
- Consumes: the chrome from Tasks 2-3; `Skeleton` from `@/design-system` (the one component in this group that exists).
- Produces: nine section components taking no props. Task 6 assembles them.

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/demo/sections/__tests__/sections.spec.js`:

```js
import TabsSection from '../TabsSection.vue'
import DropdownsSection from '../DropdownsSection.vue'
import FilesSection from '../FilesSection.vue'
import SelectionSection from '../SelectionSection.vue'
import DialogSection from '../DialogSection.vue'
import FoundationsSection from '../FoundationsSection.vue'

describe('skeleton sections show their headings and mark their gaps', () => {
  it('TabsSection renders the three variant headings', () => {
    const text = mount(TabsSection).text()
    for (const label of [
      'UNDERLINE — PRIMARY, SITS ON A CARD EDGE',
      'SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS',
      'STAGE TABS — A WORKFLOW WITH VOLUME PER STEP',
    ]) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    expect(mount(TabsSection).findAll('[data-gap]')).toHaveLength(3)
  })

  it('SelectionSection renders all six sub-blocks', () => {
    const text = mount(SelectionSection).text()
    for (const label of [
      'CHECKBOX · STATES',
      'RADIO · LIST',
      'SWITCH · TAKES EFFECT AT ONCE',
      'CHECKBOX CARDS · MULTI',
      'RADIO CARDS · SINGLE',
      'BULK SELECTION — TABLE HEADER + ACTION BAR',
    ]) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    expect(mount(SelectionSection).findAll('[data-gap]')).toHaveLength(6)
  })

  it('FilesSection renders its file-list heading and marks both gaps', () => {
    expect(mount(FilesSection).text()).toContain('FILE LIST — UPLOADING, DONE, FAILED')
    expect(mount(FilesSection).findAll('[data-gap]').length).toBeGreaterThan(0)
  })

  it('DialogSection shows Skeleton for real and marks the other two', () => {
    const wrapper = mount(DialogSection)
    const text = wrapper.text()
    for (const label of ['CONFIRMATION DIALOG', 'EMPTY STATE', 'SKELETON ROWS']) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    // Skeleton is built; Dialog and EmptyState are not.
    expect(wrapper.findAll('[data-gap]')).toHaveLength(2)
    expect(wrapper.findAll('[data-row]').length).toBeGreaterThan(0)
  })

  it.each([
    ['DropdownsSection', DropdownsSection],
    ['FoundationsSection', FoundationsSection],
  ])('%s marks its gaps', (_name, component) => {
    expect(mount(component).findAll('[data-gap]').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — cannot resolve `../TabsSection.vue`.

- [ ] **Step 3: Create the nine sections**

Every one follows Task 4's Step 3 shape: a `DemoCard` with the Appendix D description, `DemoBlocks` of `DemoBlock`s with the artifact's labels and notes, a `DemoGap` in each unbuilt slot, and a `DemoRules` footer where Appendix D lists one.

| File | Description from Appendix D | Sub-blocks → gap component | Rules |
|---|---|---|---|
| `FoundationsSection.vue` | `Foundations` | **six** blocks per Appendix D.1: `BRAND GREEN`, `NEUTRALS`, `STATUS TONES` (each with its note) plus `RADIUS`, `SIZE & SPACING`, `ELEVATION & BORDERS` (no notes) → each gets `<DemoGap component="SwatchGrid" group="Foundations" />` | none |
| `TabsSection.vue` | `Tabs` | the 3 headings above → `Tabs`, `SegmentedTabs`, `StageTabs`, all group `Tabs` | `tabRules` |
| `DropdownsSection.vue` | `Dropdowns` | `SINGLE SELECT`, `MULTI SELECT`, `INLINE FILTER — TABLE BAR`, `ROW MENU — ACTIONS` → `Select`, `MultiSelect`, `InlineFilter`, `RowMenu`, group `Dropdowns` | none |
| `FilesSection.vue` | `File inputs` | `PNPKI CERTIFICATE` → `FileInput`; `COMPACT · INSIDE A FORM ROW` → `FileInputCompact`; then a `DemoStrip` labelled `FILE LIST — UPLOADING, DONE, FAILED` → `FileList`, group `File inputs` | none |
| `SelectionSection.vue` | `Selection controls` | the 6 headings above → `Checkbox`, `Radio`, `Switch`, `CheckboxCard`, `RadioCard`, `BulkActionBar`, group `Selection controls` | none |
| `DialogSection.vue` | `Dialog, empty state & loading` | `CONFIRMATION DIALOG` → `Dialog`; `EMPTY STATE` → `EmptyState`; `SKELETON ROWS` → a real `<Skeleton />`, since it is built | none |
| `SpecsSection.vue` | `Component specs` | one block, `REDLINES` → `<DemoGap component="SpecTables" group="Component specs" />` | none |
| `DarkModeSection.vue` | `Dark mode` | one block, `DARK MODE` → `<DemoGap component="DarkModePreview" group="Dark mode" />` | none |
| `TokensSection.vue` | `Tokens for handoff` | one block, `TOKENS` → `<DemoGap component="TokenBlock" group="Tokens for handoff" />` | `handoffRules` |

Sub-block labels not listed verbatim in Appendix D (the dropdown and foundations ones) are taken from the artifact's own headings as recorded there; where Appendix D shows a data-driven label, use the ones named in this table.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS.

- [ ] **Step 5: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/sections/
git commit -m "feat(ds): add the skeleton sections with visible gap markers"
```

---

### Task 6: Assemble the page and enforce the manifest

**Files:**
- Rewrite: `src/pages/design-system.vue`
- Delete: `src/design-system/demo/DemoSection.vue`, `ButtonsDemo.vue`, `ChipsDemo.vue`, `CardsDemo.vue`, `FieldsDemo.vue`, `FeedbackDemo.vue`, `TypeScaleDemo.vue`
- Delete: `src/design-system/demo/__tests__/ChipsDemo.spec.js`
- Rewrite: `src/pages/__tests__/design-system.spec.js`

**Interfaces:**
- Consumes: all fifteen section components and `SECTIONS` from `../chrome/sections`.
- Produces: the `/design-system` route.

- [ ] **Step 1: Write the failing test**

Rewrite `src/pages/__tests__/design-system.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DesignSystemPage from '../design-system.vue'
import { SECTIONS } from '@/design-system/demo/chrome/sections'

describe('design system page', () => {
  it('renders every section the artifact has, in its order', () => {
    const text = mount(DesignSystemPage).text()
    for (const section of SECTIONS) {
      expect(text, `missing section: ${section.title}`).toContain(section.title)
    }
  })

  it('renders the sections in the artifact order, not alphabetically', () => {
    const html = mount(DesignSystemPage).html()
    const positions = SECTIONS.map((s) => html.indexOf(s.title))
    expect(positions.every((p) => p >= 0)).toBe(true)
    const sorted = [...positions].sort((a, b) => a - b)
    expect(positions).toEqual(sorted)
  })

  it('a section marked complete contains no gap markers', () => {
    // Spec §17.2 — a section cannot be declared done while a slot is empty.
    const wrapper = mount(DesignSystemPage)
    for (const section of SECTIONS.filter((s) => s.complete)) {
      const el = wrapper.find(`[data-section="${section.id}"]`)
      expect(el.exists(), `no element for section: ${section.id}`).toBe(true)
      expect(el.findAll('[data-gap]'), `${section.id} is marked complete but has gaps`).toHaveLength(
        0,
      )
    }
  })

  it('still shows the remaining work as visible gaps', () => {
    // Sanity: the page is a checklist, so incomplete sections must show gaps.
    expect(mount(DesignSystemPage).findAll('[data-gap]').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: FAIL — the page does not yet render the new sections.

- [ ] **Step 3: Rewrite the page**

Replace `src/pages/design-system.vue`:

```vue
<script setup>
import { SECTIONS } from '@/design-system/demo/chrome/sections'
import FoundationsSection from '@/design-system/demo/sections/FoundationsSection.vue'
import ContainersSection from '@/design-system/demo/sections/ContainersSection.vue'
import ChipsSection from '@/design-system/demo/sections/ChipsSection.vue'
import TabsSection from '@/design-system/demo/sections/TabsSection.vue'
import FieldsSection from '@/design-system/demo/sections/FieldsSection.vue'
import DropdownsSection from '@/design-system/demo/sections/DropdownsSection.vue'
import ButtonsSection from '@/design-system/demo/sections/ButtonsSection.vue'
import FilesSection from '@/design-system/demo/sections/FilesSection.vue'
import NoticesSection from '@/design-system/demo/sections/NoticesSection.vue'
import SelectionSection from '@/design-system/demo/sections/SelectionSection.vue'
import DialogSection from '@/design-system/demo/sections/DialogSection.vue'
import TypeScaleSection from '@/design-system/demo/sections/TypeScaleSection.vue'
import SpecsSection from '@/design-system/demo/sections/SpecsSection.vue'
import DarkModeSection from '@/design-system/demo/sections/DarkModeSection.vue'
import TokensSection from '@/design-system/demo/sections/TokensSection.vue'

// Keyed by the manifest's ids so the page order and the manifest cannot drift
// apart — a test asserts the rendered order matches SECTIONS.
const COMPONENTS = {
  foundations: FoundationsSection,
  containers: ContainersSection,
  chips: ChipsSection,
  tabs: TabsSection,
  fields: FieldsSection,
  dropdowns: DropdownsSection,
  buttons: ButtonsSection,
  files: FilesSection,
  notices: NoticesSection,
  selection: SelectionSection,
  dialog: DialogSection,
  'type-scale': TypeScaleSection,
  specs: SpecsSection,
  'dark-mode': DarkModeSection,
  tokens: TokensSection,
}
</script>

<template>
  <div>
    <h1 class="text-page-title text-ink-900">Design system</h1>
    <p class="text-body text-text-meta mt-2 mb-8 max-w-2xl">
      Chips, tabs, fields, dropdowns, and the type scale the licensing screens are built on. Every
      field is 38px tall with a 9px radius, so a filter bar and a form read as the same system.
    </p>

    <div v-for="section in SECTIONS" :key="section.id" :data-section="section.id">
      <component :is="COMPONENTS[section.id]" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Delete the superseded demo files**

```bash
git rm src/design-system/demo/DemoSection.vue \
       src/design-system/demo/ButtonsDemo.vue \
       src/design-system/demo/ChipsDemo.vue \
       src/design-system/demo/CardsDemo.vue \
       src/design-system/demo/FieldsDemo.vue \
       src/design-system/demo/FeedbackDemo.vue \
       src/design-system/demo/TypeScaleDemo.vue \
       src/design-system/demo/__tests__/ChipsDemo.spec.js
```

Their content now lives in the section files. If any assertion in `ChipsDemo.spec.js` covers behaviour the new section tests do not, move it into `sections.spec.js` rather than losing it — the dismiss-removes-the-right-chip case in particular.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: PASS — 4 tests.

- [ ] **Step 6: Confirm the route and the build**

Run: `npx vitest run && npm run verify:css && npm run lint`
Expected: all green.

Then confirm no junk routes appeared — the section files live under `src/design-system/demo/sections/`, outside `src/pages/`, so the file-based router should still see exactly one:

```bash
grep -c 'design-system' typed-router.d.ts
```

Expected: the same small number as before.

- [ ] **Step 7: Commit**

```bash
git add src/pages/ src/design-system/demo/
git commit -m "feat(ds): assemble the design system page in the artifact's section order"
```

---

## Phase complete

```bash
npx vitest run && npm run verify:css && npm run lint
```

Open http://localhost:5177/design-system beside the source artifact. The two should now share a structure: same sections in the same order, same headings, same notes, same rule footers. Every remaining component appears as a dashed gap naming itself and its redline group — that list is the plan for the phases that follow.
