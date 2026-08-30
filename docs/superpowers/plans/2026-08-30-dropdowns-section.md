# Dropdowns Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the Dropdowns section's four gaps with `Select`, `MultiSelect`, `InlineFilter` and `RowMenu` built on Ark UI, and close the accessible-name defect left parked by Phase 3b.

**Architecture:** Ark UI's `select` supplies the listbox, keyboard navigation and ARIA for the three selects; `menu` supplies the row menu. Every visual value comes from Appendix C's `Dropdowns` group and is expressed in design tokens. The demo page's Dropdowns section swaps its four `DemoGap` markers for the real components and flips to `complete: true`, which the manifest test then enforces.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, `@ark-ui/vue` 5.39.1, Vitest 4 + `@vue/test-utils`

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — **Appendix C's `Dropdowns` group is the authority for values** (16 rows), **Appendix D.1's "Dropdowns → the four inline demos" is the authority for content** (extracted from the artifact on 2026-08-30), §8.1 for the `label` convention, §17 for page architecture, §18 for the accessibility baseline.

**Phase:** 3c. Phases 1, 2, 2.5, 3a and 3b are complete on branch `design-system` (298 tests). Selection controls + File inputs, Overlays, Shell and the reference sections follow, one section per phase.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **Appendix C is the authority for values.** Where this plan gives a number, it came from there or from Appendix D.1. If a redline contradicts this plan, stop and report it rather than guessing — that has happened six times across earlier phases and reporting was right every time.
- **No raw hex colours** in any file under `src/design-system/components/`, **including comments** — the guard scans them. Cite redline rows by name, never by quoting a colour.
- **No `dark:` variants** anywhere in `src/design-system/`; no arbitrary Tailwind type sizes.
- **`label` names the thing; presentation is the component's business** (§8.1). Any component whose label is not visible says so in its JSDoc.
- Accessibility baseline is **WCAG 2.1 AA** (§18). Ark supplies the ARIA; do not remove or override its roles and relationships.
- **Never put a comment before a component's root element** — Vue compiles that as a Fragment root and `wrapper.classes()` returns `[]`.
- **Two competing classes for one property is the recurring defect of this project** — seven instances so far, each "working" only because of compile order or specificity. Every conditional must produce exactly one class per property, and a scoped `<style>` rule that sets a property a utility also sets on the same element counts.
- `tokens.css` / `tokens.dark.css` are frozen — a test diffs them against spec Appendix A/A.1 in both directions. `theme.css` is authored and may change.
- Content from Appendix D and D.1 is verbatim, glyph for glyph — including em dashes (`—`) in the service names and middots (`·`) in the qualifiers.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run tests with `npx vitest run` — `test:unit` is watch mode and will hang.
- Write only ASCII quotes in code. Smart quotes (U+201C/U+201D) silently broke a test four times in Phase 3b.
- Commit messages carry **no** `Co-Authored-By` trailer.

## Verified Token Mapping

Every colour in this section maps to a real token; I checked each against `tokens.css` definitions and the `theme.css` bridge before writing this plan. **Three are renamed by the bridge** — using the token's own name would produce a class that emits no CSS while still appearing in `wrapper.classes()`, which is this project's signature failure and cost a fix round in Phase 3b:

| Redline value | Token | **Utility to write** |
|---|---|---|
| `#D5DBE6` trigger border | `--border-field` | **`border-field`** |
| `#E4E8EF` panel border | `--border-card` | **`border-hairline`** |
| `#DDE2EA` inline border | `--border-soft` | **`border-soft`** |
| `#25A94E` open trigger | `--green-500` | `border-green-500` |
| `#1E2532` value | `--ink-900` | `text-ink-900` |
| `#667085` placeholder, Clear | `--ink-500` | `text-ink-500` |
| `#98A2B3` caret | `--ink-300` | `text-ink-300` |
| `#F2FAF4` option selected bg | `--green-tint` | `bg-green-tint` |
| `#15803D` option selected text | `--green-text` | `text-green-text` |
| `#177236` checkbox on, Apply bg | `--green-fill` | `bg-green-fill` |
| `#F7F9FC` panel filter field | `--surface-input` | `bg-surface-input` |
| `#FAFBFD` panel footer | `--surface-sunken` | `bg-surface-sunken` |
| `#EEF1F6` footer top rule | `--divider` | `border-divider` |
| `#B42318` destructive item | `--red-700` | `text-red-700` |
| `#344054` menu item | `--ink-700` | `text-ink-700` |
| `#F4F6FA` row-menu hover | `--surface-muted` | `bg-surface-muted` |
| dots: `#17A34A` / `#D9A13B` / `#E5484D` / `#B9C1D1` | `--dot-green` / `--amber-400` / `--red-500` / `--ink-200` | `bg-dot-green` / `bg-amber-400` / `bg-red-500` / `bg-ink-200` |

Radii and shadows: trigger 9px = `rounded-field`; panel 12px = `rounded-panel`; option / filter field / inline / Apply / row-menu trigger 8px = `rounded-control`; panel shadow = `var(--sh-panel)`; open-trigger ring = `var(--ring-focus)`. **Heights DO have tokens**: 38px is `--h-field` (utility `h-field`, used by `TextField`/`SearchField`/`Button`) and 34px is `--h-compact` (`h-compact`, and `w-compact` for a square — the pattern `Button`'s icon size uses). Use those utilities, never a literal. Only the **4px checkbox radius, the 32px panel-filter height and the 8px status dot** have no token — those go in scoped CSS, commented with the redline row name.

Type steps: value 13.5/500 = `text-body font-medium`; placeholder and option 13.5/400 = `text-body`; selected option 13.5/700 = `text-body font-bold`; `✓` 12/700 = `text-hint font-bold`; inline variant and footer buttons 12.5/700 = `text-field-label font-bold`; field labels 12.5/500 = `text-field-label`; notes 12px = `text-hint`; empty state 12.5/400 = `text-caption`.


**Panel offset — applies to every component in this phase.** Appendix C's `Panel` row says
`top 44px` against a 38px trigger, and Appendix D.1 records the row menu's panel at `top: 40px`
against a 34px trigger: both a **6px gap**. Zag defaults `positioning.gutter` to **8** for
`select` and for `menu`, so leaving it unset renders every panel 2px lower than the artifact.
Pass `:positioning="{ gutter: 6 }"` on each root. jsdom computes no layout, so assert it as a
prop — `wrapper.findComponent(SelectRoot).props('positioning')` — not as a rendered offset.


**Asserting classes on portal DOM — use `classList`, never `className`.** Ark renders panels in
a portal, so those nodes are raw DOM rather than Vue Test Utils wrappers. On a **string**
receiver `toContain` is *substring* matching, so `expect(el.className).toContain('border-field')`
passes even when the class is actually `border-border-field` — the exact trap this project has
already shipped once. It cuts both ways: `bg-red-500` contains `bg-red-50`, and
`bg-green-fill-hover` contains `bg-green-fill`, and both of those are real tokens here. Always
spread to an array first — `expect([...el.classList]).toContain('border-field')` — which makes
`toContain` an exact token match. Wrapper-based `.classes()` is already an array and is safe.

## File Structure

```
src/design-system/components/tabs/Tabs.vue          MODIFIED — a11y fix   (Task 1)
src/design-system/components/tabs/StageTabs.vue     MODIFIED — a11y fix   (Task 1)

src/design-system/components/selects/
  Select.vue            single select, 38px shell            (Task 2)
  MultiSelect.vue       checkbox list + filter + footer      (Task 3)
  InlineFilter.vue      34px table-bar variant, dots         (Task 4)
  RowMenu.vue           ⋯ trigger, destructive last          (Task 5)

src/design-system/demo/sections/
  DropdownsSection.vue           MODIFIED — four gaps → components  (Task 6)
src/design-system/demo/chrome/sections.js  MODIFIED — dropdowns complete (Task 6)
src/design-system/index.js                 MODIFIED — four exports
```

**Ark's export style, verified against the installed package:** flat named exports, not namespaces. From `@ark-ui/vue/select`: `SelectRoot`, `SelectControl`, `SelectTrigger`, `SelectValueText`, `SelectIndicator`, `SelectPositioner`, `SelectContent`, `SelectList`, `SelectItem`, `SelectItemText`, `SelectItemIndicator`, `SelectHiddenSelect`. From `@ark-ui/vue/menu`: `MenuRoot`, `MenuTrigger`, `MenuPositioner`, `MenuContent`, `MenuItem`, `MenuSeparator`.

---

### Task 1: Close the accessible-name defect parked in Phase 3b

Phase 3b's final review found that `aria-label` on a count badge **replaces that badge's text** when the browser computes the enclosing tab's name from content, so tabs announce their label twice. This was parked to avoid a second fix wave; it is the first thing to clear here because it is a live a11y regression.

**Files:**
- Modify: `src/design-system/components/tabs/Tabs.vue`, `StageTabs.vue`
- Modify: `src/design-system/components/tabs/__tests__/Tabs.spec.js`, `StageTabs.spec.js`

**Interfaces:** No prop or API change. Public interfaces of both components stay exactly as they are.

- [ ] **Step 1: Understand the defect before changing anything**

Read `Tabs.vue`'s count `<span>` and `StageTabs.vue`'s figure `<span>`. Both sit **inside** the element carrying `role="tab"`. Per the Accessible Name and Description Computation, when a name is computed from content, a child that carries its own `aria-label` contributes that label instead of its text. So today:

- `Tabs` announces `"Active LTOs 211 Active LTOs"`
- `StageTabs` announces `"Review 2 Review 2 returned"`

Spec line 938 (`| Counts | badge text needs context: aria-label='10 applications for checking' |`) is written for a badge that stands alone. Inside a tab, the surrounding label already supplies the context, so the badge needs no label of its own — it needs to contribute its bare number.

- [ ] **Step 2: Write the failing tests**

Add to `Tabs.spec.js`:

```js
it('does not repeat the tab label inside its own accessible name', () => {
  // The count sits inside role="tab", so an aria-label on it REPLACES its text
  // in the tab's name-from-content computation, producing "Active LTOs 211
  // Active LTOs". The visible label already gives the number its context.
  const count = mountTabs().get('[data-count]')
  expect(count.attributes('aria-label')).toBeUndefined()
  expect(count.text()).toBe('211')
})
```

Add to `StageTabs.spec.js`:

```js
it('does not repeat the stage label inside its own accessible name', () => {
  // Same defect as Tabs: an aria-label on the figure replaced its text in the
  // card's name-from-content computation, giving "Review 2 Review 2 returned".
  const figure = mountStages().get('[data-figure]')
  expect(figure.attributes('aria-label')).toBeUndefined()
  expect(figure.text()).toBe('2')
})

it('keeps the decorative step marker out of the accessible name', () => {
  expect(mountStages().get('[data-step]').attributes('aria-hidden')).toBe('true')
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/design-system/components/tabs/`
Expected: FAIL — the two `toBeUndefined()` assertions, because both `aria-label`s are currently present.

- [ ] **Step 4: Remove the two aria-labels**

Delete the `:aria-label` binding from `Tabs.vue`'s count span and from `StageTabs.vue`'s figure span. Leave `aria-hidden="true"` on `StageTabs`' step marker exactly as it is — that one is correct and its test above locks it in.

Replace each removed binding with a short comment naming the reason, e.g.:

```html
<!-- No aria-label here: this span is inside role="tab", so a label would
     replace its text in the tab's name-from-content computation and repeat
     the tab label. The visible label already gives the number context. -->
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/design-system/components/tabs/`
Expected: PASS. Two previously-passing assertions that checked for the `aria-label` values will now fail — **delete those two assertions**, since they assert the defect. Do not weaken anything else in either file.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/tabs/
git commit -m "fix(ds): stop tab count badges repeating their tab's label"
```

---

### Task 2: Select — the single-select shell

Appendix C group **Dropdowns**, rows `Trigger`, `Open trigger`, `Value`, `Placeholder`, `Caret`, `Panel`, `Panel shadow`, `Panel max-h`, `Option`, `Option selected`. Appendix D.1 for the option list. Read both before starting.

**Files:**
- Create: `src/design-system/components/selects/Select.vue`
- Create: `src/design-system/components/selects/__tests__/Select.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<Select v-model :options :placeholder :label>` where `options` is `string[]`, `v-model` is the selected string (`''` when unset), `placeholder` is the text shown while unset, and `label` names the control for assistive technology and is **not** rendered (the demo page draws its own field label). Task 6 uses it.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selects/__tests__/Select.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Select from '../Select.vue'

const OPTIONS = [
  'Hospital · Level 1',
  'Hospital · Level 2',
  'Infirmary',
  'Primary Care Facility',
  'Birthing Home',
  'Clinical Laboratory',
  'X-ray Facility',
]

const mountSelect = (props = {}) =>
  mount(Select, {
    props: {
      options: OPTIONS,
      modelValue: '',
      placeholder: 'Select a facility type',
      label: 'Facility type',
      ...props,
    },
    attachTo: document.body,
  })

describe('Select', () => {
  it('shows the placeholder while nothing is chosen', () => {
    const wrapper = mountSelect()
    expect(wrapper.get('[data-value]').text()).toBe('Select a facility type')
  })

  it('greys the placeholder and inks a real value', () => {
    // Redline "Placeholder" (13.5/400 meta) vs "Value" (13.5/500 ink).
    // Both branches set colour AND weight, so neither is left to emit order.
    const empty = mountSelect().get('[data-value]')
    expect(empty.classes()).toContain('text-ink-500')
    expect(empty.classes()).not.toContain('text-ink-900')

    const filled = mountSelect({ modelValue: 'Infirmary' }).get('[data-value]')
    expect(filled.text()).toBe('Infirmary')
    expect(filled.classes()).toContain('text-ink-900')
    expect(filled.classes()).toContain('font-medium')
    expect(filled.classes()).not.toContain('text-ink-500')
  })

  it('names the control for assistive technology without drawing the name', () => {
    const wrapper = mountSelect()
    expect(wrapper.get('[data-trigger]').attributes('aria-label')).toBe('Facility type')
    expect(wrapper.text()).not.toContain('Facility type')
  })

  it('gives the trigger the field shell and the field border', () => {
    // Redline "Trigger" — radius 9px, 1px field border. `border-field` is the
    // bridge's name for it; `border-border-field` emits nothing.
    const trigger = mountSelect().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-field')
    expect(trigger.classes()).toContain('border-field')
  })

  it('renders a decorative caret that assistive technology ignores', () => {
    // Redline "Caret · decorative"
    const caret = mountSelect().get('[data-caret]')
    expect(caret.attributes('aria-hidden')).toBe('true')
    expect(caret.classes()).toContain('text-ink-300')
  })

  it('opens on click and lists every option', async () => {
    const wrapper = mountSelect()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = document.querySelectorAll('[role="option"]')
    expect(items).toHaveLength(7)
    expect(items[0].textContent).toContain('Hospital · Level 1')
    wrapper.unmount()
  })

  it('emits update:modelValue with the chosen option', async () => {
    const wrapper = mountSelect()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[role="option"]')[2].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Infirmary'])
    wrapper.unmount()
  })

  it('marks the chosen option selected', async () => {
    const wrapper = mountSelect({ modelValue: 'Infirmary' })
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="option"]')]
    expect(items[2].getAttribute('aria-selected')).toBe('true')
    expect(items[0].getAttribute('aria-selected')).toBe('false')
    wrapper.unmount()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selects/__tests__/Select.spec.js`
Expected: FAIL — cannot resolve `../Select.vue`.

- [ ] **Step 3: Implement Select**

Create `src/design-system/components/selects/Select.vue`:

```vue
<script setup>
import { computed } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectTrigger,
  SelectPositioner,
  SelectContent,
  SelectItem,
  SelectItemText,
} from '@ark-ui/vue/select'
import { createListCollection } from '@ark-ui/vue/collection'

const props = defineProps({
  /** The options to choose between, in display order. */
  options: { type: Array, required: true },
  /** The selected option, or '' when nothing is chosen. */
  modelValue: { type: String, default: '' },
  /** Shown in the trigger while nothing is chosen. */
  placeholder: { type: String, required: true },
  /**
   * Names the control for assistive technology. NOT rendered — the page draws
   * its own visible field label above the control.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const collection = computed(() => createListCollection({ items: props.options }))
const selected = computed(() => (props.modelValue ? [props.modelValue] : []))
</script>

<template>
  <SelectRoot
    :collection="collection"
    :model-value="selected"
    @value-change="(details) => emit('update:modelValue', details.value[0] ?? '')"
  >
    <SelectControl>
      <!-- Redline "Trigger" — 38px, radius 9px, 1px field border, gap 8px.
           Height lives in scoped CSS; no spacing token carries 38px. -->
      <SelectTrigger
        data-trigger
        :aria-label="label"
        class="select__trigger flex w-full items-center gap-2 rounded-field border border-field bg-surface px-3 text-left"
      >
        <!-- Redline "Value" vs "Placeholder" — one class per property per branch. -->
        <span
          data-value
          class="select__value min-w-0 flex-1 truncate text-body"
          :class="modelValue ? 'text-ink-900 font-medium' : 'text-ink-500 font-normal'"
          >{{ modelValue || placeholder }}</span
        >
        <!-- Redline "Caret · decorative" — hidden from the accessible name. -->
        <span data-caret aria-hidden="true" class="select__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner>
      <!-- Redline "Panel" and "Panel max-h" — radius 12, pad 6, hairline, 246px. -->
      <SelectContent
        class="select__panel rounded-panel border border-hairline bg-surface p-1.5"
      >
        <SelectItem
          v-for="option in options"
          :key="option"
          :item="option"
          class="select__option flex items-center gap-2 rounded-control text-body"
          :class="option === modelValue ? 'bg-green-tint text-green-text font-bold' : 'font-normal'"
        >
          <SelectItemText class="min-w-0 flex-1 truncate">{{ option }}</SelectItemText>
          <!-- Redline "Option selected" — the check is 12px/700. -->
          <span v-if="option === modelValue" aria-hidden="true" class="text-hint font-bold">✓</span>
        </SelectItem>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Redline "Trigger" — 38px tall. No spacing token carries it. */
.select__trigger {
  height: 38px;
  cursor: pointer;
}

/* Redline "Open trigger" — green border plus the focus ring. Ark sets
 * data-state="open" on the trigger, so one selector covers the whole state. */
.select__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.select__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Caret" — 9px glyph; the type scale has no step this small. */
.select__caret {
  font-size: 9px;
}

/* Redline "Panel shadow" and "Panel max-h" — 246px without a filter. */
.select__panel {
  box-shadow: var(--sh-panel);
  max-height: 246px;
  overflow-y: auto;
}

/* Redline "Option" — pad 9px 10px. */
.select__option {
  padding: 9px 10px;
  cursor: pointer;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selects/__tests__/Select.spec.js`
Expected: PASS — 8 tests.

Ark's Select renders its content in a portal, which is why the tests query `document` rather than the wrapper and use `attachTo: document.body`. If `createListCollection` is not exported from `@ark-ui/vue/collection`, find its real path in the installed package and report what you found — do not guess an import.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as Select } from './components/selects/Select.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selects/ src/design-system/index.js
git commit -m "feat(ds): add the single-select dropdown"
```

---

### Task 3: MultiSelect — checkbox list, inline filter, sticky footer

Appendix C group **Dropdowns**, rows `Panel max-h` (214px with filter), `Checkbox in list`, `Panel filter`, `Panel footer`, plus the shared `Trigger`/`Panel`/`Option` rows. Appendix D.1 for the service list, the empty state and the footer buttons. Read both before starting.

This is the most complex component in the phase. Build it after `Select`. Its trigger repeats `Select`'s shell markup and scoped rules deliberately — the two differ in what they display (a single value vs a count summary) and extracting a shared wrapper for two call sites would add indirection without removing much. This duplication is a deliberate decision with reasoning recorded here, not an oversight — implement it as written rather than refactoring on your own initiative. If you or a reviewer judge the duplication worth removing anyway, say so and it will be adjudicated.

**Files:**
- Create: `src/design-system/components/selects/MultiSelect.vue`
- Create: `src/design-system/components/selects/__tests__/MultiSelect.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<MultiSelect v-model :options :placeholder :label :filter-placeholder :empty-text>` where `options` is `string[]` and `v-model` is `string[]` of chosen options. Emits `update:modelValue` on every toggle, and `apply` when the footer's Apply is pressed. Task 6 uses it.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selects/__tests__/MultiSelect.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MultiSelect from '../MultiSelect.vue'

const SERVICES = [
  'Ambulance Service — Type I',
  'Birthing Home',
  'Clinical Laboratory — Limited',
  'Clinical Laboratory — Secondary',
  'Dental Clinic',
  'Pharmacy',
  'X-ray Facility',
]

const mountMulti = (props = {}) =>
  mount(MultiSelect, {
    props: {
      options: SERVICES,
      modelValue: ['Pharmacy', 'Birthing Home'],
      placeholder: 'Select services',
      label: 'Services',
      filterPlaceholder: 'Filter services',
      emptyText: 'No service matches that.',
      ...props,
    },
    attachTo: document.body,
  })

describe('MultiSelect', () => {
  it('summarises the chosen options in the trigger', () => {
    expect(mountMulti().get('[data-value]').text()).toContain('2')
  })

  it('falls back to the placeholder when nothing is chosen', () => {
    const wrapper = mountMulti({ modelValue: [] })
    expect(wrapper.get('[data-value]').text()).toBe('Select services')
    expect(wrapper.get('[data-value]').classes()).toContain('text-ink-500')
  })

  it('renders a checkbox per option and checks the chosen ones', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const boxes = [...document.querySelectorAll('[data-box]')]
    expect(boxes).toHaveLength(7)
    // Redline "Checkbox in list" — filled green when on, plain border when off.
    expect(boxes[1].className).toContain('bg-green-fill')
    expect(boxes[0].className).not.toContain('bg-green-fill')
    wrapper.unmount()
  })

  it('filters the list as the filter field is typed into', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const filter = document.querySelector('[data-filter]')
    filter.value = 'labor'
    filter.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    const labels = [...document.querySelectorAll('[data-option-label]')].map((n) => n.textContent)
    expect(labels).toEqual([
      'Clinical Laboratory — Limited',
      'Clinical Laboratory — Secondary',
    ])
    wrapper.unmount()
  })

  it('shows the empty text when the filter matches nothing', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const filter = document.querySelector('[data-filter]')
    filter.value = 'zzzz'
    filter.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[data-empty]').textContent).toBe('No service matches that.')
    expect(document.querySelectorAll('[data-option-label]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('toggles an option on and off', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[data-option]')[4].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toContain('Dental Clinic')
    wrapper.unmount()
  })

  it('clears every choice from the footer', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelector('[data-clear]').click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual([])
    wrapper.unmount()
  })

  it('emits apply from the footer', async () => {
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelector('[data-apply]').click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('apply')).toBeTruthy()
    wrapper.unmount()
  })

  it('dresses the footer as a sunken strip under a rule', async () => {
    // Redline "Panel footer" — sunken background, 1px top divider.
    const wrapper = mountMulti()
    await wrapper.get('[data-trigger]').trigger('click')
    const footer = document.querySelector('[data-footer]')
    expect(footer.className).toContain('bg-surface-sunken')
    expect(footer.className).toContain('border-divider')
    wrapper.unmount()
  })

  it('names the control without drawing the name', () => {
    const wrapper = mountMulti()
    expect(wrapper.get('[data-trigger]').attributes('aria-label')).toBe('Services')
    expect(wrapper.text()).not.toContain('Services')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selects/__tests__/MultiSelect.spec.js`
Expected: FAIL — cannot resolve `../MultiSelect.vue`.

- [ ] **Step 3: Implement MultiSelect**

Create `src/design-system/components/selects/MultiSelect.vue`. Model it on `Select.vue`: same trigger shell, same panel treatment, `multiple` on the root, and a filtered collection.

```vue
<script setup>
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectTrigger,
  SelectPositioner,
  SelectContent,
  SelectItem,
  SelectItemText,
} from '@ark-ui/vue/select'
import { createListCollection } from '@ark-ui/vue/collection'

const props = defineProps({
  /** Every option, in display order. */
  options: { type: Array, required: true },
  /** The chosen options. */
  modelValue: { type: Array, default: () => [] },
  /** Shown in the trigger while nothing is chosen. */
  placeholder: { type: String, required: true },
  /** Names the control for assistive technology. NOT rendered on screen. */
  label: { type: String, required: true },
  /** Placeholder for the in-panel filter field. */
  filterPlaceholder: { type: String, required: true },
  /** Shown in place of the list when the filter matches nothing. */
  emptyText: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const query = ref('')

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.options.filter((o) => o.toLowerCase().includes(q)) : props.options
})

const collection = computed(() => createListCollection({ items: shown.value }))

const summary = computed(() =>
  props.modelValue.length ? `${props.modelValue.length} selected` : props.placeholder,
)

// Selection has ONE source: Ark's own multiple-select machine, surfaced through
// @value-change. A parallel @click toggle would drift from Ark's aria-selected.
const isOn = (option) => props.modelValue.includes(option)
</script>

<template>
  <SelectRoot
    multiple
    :collection="collection"
    :model-value="modelValue"
    :positioning="{ gutter: 6 }"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <SelectControl>
      <SelectTrigger
        data-trigger
        :aria-label="label"
        class="multiselect__trigger flex h-field w-full items-center gap-2 rounded-field border border-field bg-surface px-3 text-left"
      >
        <span
          data-value
          class="min-w-0 flex-1 truncate text-body"
          :class="modelValue.length ? 'text-ink-900 font-medium' : 'text-ink-500 font-normal'"
          >{{ summary }}</span
        >
        <span aria-hidden="true" class="multiselect__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner>
      <SelectContent
        class="multiselect__panel rounded-panel border border-hairline bg-surface"
      >
        <!-- Redline "Panel filter" — 32px field on the input surface. -->
        <div class="p-1.5">
          <input
            v-model="query"
            data-filter
            type="text"
            :placeholder="filterPlaceholder"
            :aria-label="filterPlaceholder"
            class="multiselect__filter w-full rounded-control bg-surface-input px-2.5 text-field-label text-ink-900"
          />
        </div>

        <!-- Redline "Panel max-h" — 214px once a filter is present. -->
        <div class="multiselect__list p-1.5">
          <SelectItem
            v-for="option in shown"
            :key="option"
            :item="option"
            data-option
            class="multiselect__option flex items-center gap-2 rounded-control text-body font-normal"
          >
            <!-- Redline "Checkbox in list" — 15px, filled green when on. -->
            <span
              data-box
              aria-hidden="true"
              class="multiselect__box grid flex-none place-items-center rounded-[4px] border"
              :class="
                isOn(option)
                  ? 'bg-green-fill border-green-fill text-green-on-fill'
                  : 'bg-surface border-field text-transparent'
              "
              >✓</span
            >
            <SelectItemText data-option-label class="min-w-0 flex-1 truncate">{{
              option
            }}</SelectItemText>
          </SelectItem>
          <p v-if="!shown.length" data-empty class="multiselect__empty text-caption text-ink-500">
            {{ emptyText }}
          </p>
        </div>

        <!-- Redline "Panel footer" — sunken strip under a 1px rule. -->
        <div
          data-footer
          class="multiselect__footer flex items-center justify-between gap-3 border-t border-divider bg-surface-sunken"
        >
          <button
            data-clear
            type="button"
            class="multiselect__clear text-field-label font-bold text-ink-500"
            @click="emit('update:modelValue', [])"
          >
            Clear
          </button>
          <button
            data-apply
            type="button"
            class="multiselect__apply rounded-control bg-green-fill text-field-label font-bold text-green-on-fill"
            @click="emit('apply')"
          >
            Apply
          </button>
        </div>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Height comes from the `h-field` utility on the element, matching TextField
 * and SearchField — Appendix D calls this "the same 38px shell as a text
 * field", so it must be the same token, not a repeated literal. */
.multiselect__trigger {
  cursor: pointer;
}

.multiselect__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.multiselect__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Caret" — 9px glyph. */
.multiselect__caret {
  font-size: 9px;
}

/* Redline "Panel shadow". The panel itself does not scroll — the list does,
 * so the footer stays stuck to the bottom. */
.multiselect__panel {
  box-shadow: var(--sh-panel);
}

/* Redline "Panel filter" — 32px tall, borderless on the input surface. */
.multiselect__filter {
  height: 32px;
  border: none;
}

.multiselect__filter:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Panel max-h" — 214px with a filter present. */
.multiselect__list {
  max-height: 214px;
  overflow-y: auto;
}

/* Redline "Option" — pad 9px 10px. */
.multiselect__option {
  padding: 9px 10px;
  cursor: pointer;
}

/* Redline "Checkbox in list" — 15px box, radius 4px. No token carries 4px:
 * --r-check is 5px, so this is the arbitrary value the redline requires. */
.multiselect__box {
  width: 15px;
  height: 15px;
  font-size: 10px;
  line-height: 1;
}

/* Appendix D.1 — empty state padding. */
.multiselect__empty {
  padding: 14px 10px;
}

/* Redline "Panel footer" — pad 9px 12px. */
.multiselect__footer {
  padding: 9px 12px;
}

.multiselect__clear {
  padding: 4px;
  cursor: pointer;
  background: none;
  border: none;
}

/* Appendix D.1 — Apply is 7px 14px on the fill green. */
.multiselect__apply {
  padding: 7px 14px;
  border: none;
  cursor: pointer;
}

.multiselect__apply:hover {
  background: var(--green-fill-hover);
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selects/__tests__/MultiSelect.spec.js`
Expected: PASS — 10 tests.

**A risk to check and report, not to paper over:** Ark's Select machine has typeahead — typing while the listbox is open jumps to a matching option. That may swallow keystrokes intended for the in-panel filter input. Verify by reading `@zag-js/select`'s key handling, and if typeahead does intercept, report what you found rather than deleting the filter or loosening a test. Two implementers on this project resolved comparable problems correctly by reading installed package source; that is the standard here.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as MultiSelect } from './components/selects/MultiSelect.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selects/ src/design-system/index.js
git commit -m "feat(ds): add the multi-select dropdown with filter and footer"
```

---

### Task 4: InlineFilter — the 34px table-bar variant

Appendix C group **Dropdowns**, row `Inline variant` (34px · radius 8px · 1px `--border-soft` · 12.5px/700). Appendix D.1 for the `Status:` prefix and the four dotted options.

**Files:**
- Create: `src/design-system/components/selects/InlineFilter.vue`
- Create: `src/design-system/components/selects/__tests__/InlineFilter.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<InlineFilter v-model :options :name>` where `options` is `Array<{ label, dot }>` — `dot` is a **utility class name** such as `'bg-dot-green'`, not a colour — and `name` is the field name rendered inline before the value (e.g. `Status`). `v-model` is the chosen label.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selects/__tests__/InlineFilter.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InlineFilter from '../InlineFilter.vue'

const STATUSES = [
  { label: 'Active', dot: 'bg-dot-green' },
  { label: 'Expiring soon', dot: 'bg-amber-400' },
  { label: 'Expired', dot: 'bg-red-500' },
  { label: 'All', dot: 'bg-ink-200' },
]

const mountFilter = (props = {}) =>
  mount(InlineFilter, {
    props: { options: STATUSES, modelValue: 'Active', name: 'Status', ...props },
    attachTo: document.body,
  })

describe('InlineFilter', () => {
  it('renders the field name inline before the value', () => {
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.get('[data-name]').text()).toBe('Status:')
    expect(trigger.get('[data-value]').text()).toBe('Active')
  })

  it('wears the soft-bordered 34px shell, not the 38px field shell', () => {
    // Redline "Inline variant" — radius 8px and the soft border, which the
    // bridge exposes as `border-soft`; `border-border-soft` emits nothing.
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-control')
    expect(trigger.classes()).toContain('border-soft')
    expect(trigger.classes()).not.toContain('rounded-field')
    expect(trigger.classes()).not.toContain('border-field')
  })

  it('sets the inline type step', () => {
    // Redline "Inline variant" — 12.5px/700.
    const trigger = mountFilter().get('[data-trigger]')
    expect(trigger.classes()).toContain('text-field-label')
    expect(trigger.classes()).toContain('font-bold')
  })

  it('gives every option its status dot', async () => {
    const wrapper = mountFilter()
    await wrapper.get('[data-trigger]').trigger('click')
    const dots = [...document.querySelectorAll('[data-dot]')]
    expect(dots).toHaveLength(4)
    expect([...dots[0].classList]).toContain('bg-dot-green')
    expect([...dots[2].classList]).toContain('bg-red-500')
    // The dot carries no meaning of its own; the label beside it does.
    expect(dots[0].getAttribute('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('emits update:modelValue with the chosen label', async () => {
    const wrapper = mountFilter()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[role="option"]')[1].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Expiring soon'])
    wrapper.unmount()
  })

  it('names the control from the field name it renders', () => {
    expect(mountFilter().get('[data-trigger]').attributes('aria-label')).toBe('Status')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selects/__tests__/InlineFilter.spec.js`
Expected: FAIL — cannot resolve `../InlineFilter.vue`.

- [ ] **Step 3: Implement InlineFilter**

Create `src/design-system/components/selects/InlineFilter.vue`, following `Select.vue`'s structure with the inline shell:

```vue
<script setup>
import { computed } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectTrigger,
  SelectPositioner,
  SelectContent,
  SelectItem,
  SelectItemText,
} from '@ark-ui/vue/select'
import { createListCollection } from '@ark-ui/vue/collection'

const props = defineProps({
  /** Options as `{ label, dot }`, where `dot` is a background utility class. */
  options: { type: Array, required: true },
  /** The chosen option's label. */
  modelValue: { type: String, required: true },
  /** The field name, rendered inline before the value and used as the name. */
  name: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const labels = computed(() => props.options.map((o) => o.label))
const collection = computed(() => createListCollection({ items: labels.value }))
</script>

<template>
  <SelectRoot
    :collection="collection"
    :model-value="[modelValue]"
    :positioning="{ gutter: 6 }"
    @value-change="(details) => emit('update:modelValue', details.value[0] ?? modelValue)"
  >
    <SelectControl>
      <!-- Redline "Inline variant" — 34px, radius 8px, soft border, 12.5/700. -->
      <SelectTrigger
        data-trigger
        :aria-label="name"
        class="inline-filter__trigger inline-flex h-compact items-center gap-2 rounded-control border border-soft bg-surface px-3 text-field-label font-bold text-ink-900"
      >
        <span data-name class="text-ink-500">{{ name }}:</span>
        <span data-value class="truncate">{{ modelValue }}</span>
        <span aria-hidden="true" class="inline-filter__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner>
      <SelectContent class="inline-filter__panel rounded-panel border border-hairline bg-surface p-1.5">
        <SelectItem
          v-for="option in options"
          :key="option.label"
          :item="option.label"
          class="inline-filter__option flex items-center gap-2 rounded-control text-body"
          :class="option.label === modelValue ? 'bg-green-tint text-green-text font-bold' : 'font-normal'"
        >
          <span
            data-dot
            aria-hidden="true"
            class="inline-filter__dot flex-none rounded-pill"
            :class="option.dot"
          />
          <SelectItemText class="min-w-0 flex-1 truncate">{{ option.label }}</SelectItemText>
        </SelectItem>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Height comes from the `h-compact` utility (--h-compact is 34px), the same
 * token Button's compact size uses. */
.inline-filter__trigger {
  cursor: pointer;
}

.inline-filter__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.inline-filter__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.inline-filter__caret {
  font-size: 9px;
}

/* Redline "Panel" and "Panel shadow". */
.inline-filter__panel {
  box-shadow: var(--sh-panel);
  max-height: 246px;
  overflow-y: auto;
}

/* Redline "Option" — pad 9px 10px. */
.inline-filter__option {
  padding: 9px 10px;
  cursor: pointer;
}

/* Appendix D.1 — the status dot. Sized here; no spacing token is 8px square. */
.inline-filter__dot {
  width: 8px;
  height: 8px;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selects/__tests__/InlineFilter.spec.js`
Expected: PASS — 6 tests.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as InlineFilter } from './components/selects/InlineFilter.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selects/ src/design-system/index.js
git commit -m "feat(ds): add the inline filter dropdown variant"
```

---

### Task 5: RowMenu — the ⋯ actions menu

Appendix C group **Dropdowns**, row `Menu item` (13.5/400 · destructive `--red-700`/700 last). Appendix D.1 for the trigger geometry, the panel offset and the four items.

**Files:**
- Create: `src/design-system/components/selects/RowMenu.vue`
- Create: `src/design-system/components/selects/__tests__/RowMenu.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<RowMenu :items :label @select>` where `items` is `Array<{ value, label, destructive? }>` and `label` names the trigger for assistive technology (the `⋯` glyph is decorative). Emits `select` with the chosen item's `value`.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selects/__tests__/RowMenu.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RowMenu from '../RowMenu.vue'

const ITEMS = [
  { value: 'lto', label: 'View LTO document' },
  { value: 'facility', label: 'Facility details' },
  { value: 'logs', label: 'View logs' },
  { value: 'revoke', label: 'Revoke licence', destructive: true },
]

const mountMenu = (props = {}) =>
  mount(RowMenu, {
    props: { items: ITEMS, label: 'Row actions', ...props },
    attachTo: document.body,
  })

describe('RowMenu', () => {
  it('names the trigger and hides its decorative glyph', () => {
    const trigger = mountMenu().get('[data-trigger]')
    expect(trigger.attributes('aria-label')).toBe('Row actions')
    expect(trigger.get('[data-glyph]').attributes('aria-hidden')).toBe('true')
  })

  it('gives the trigger the 8px control radius and the field border', () => {
    // Appendix D.1 — 34x34, radius 8px, 1px field border.
    const trigger = mountMenu().get('[data-trigger]')
    expect(trigger.classes()).toContain('rounded-control')
    expect(trigger.classes()).toContain('border-field')
  })

  it('opens on click and renders every item', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="menuitem"]')]
    expect(items).toHaveLength(4)
    expect(items[0].textContent).toContain('View LTO document')
    expect(items[3].textContent).toContain('Revoke licence')
    wrapper.unmount()
  })

  it('marks only the destructive item, and only last', async () => {
    // Redline "Menu item" — destructive is red at 700 and sits last.
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    const items = [...document.querySelectorAll('[role="menuitem"]')]
    expect([...items[3].classList]).toContain('text-red-700')
    expect([...items[3].classList]).toContain('font-bold')
    expect([...items[0].classList]).toContain('text-ink-700')
    expect([...items[0].classList]).not.toContain('text-red-700')
    wrapper.unmount()
  })

  it('separates the destructive item with a hairline', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    expect(document.querySelectorAll('[data-separator]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits select with the chosen value', async () => {
    const wrapper = mountMenu()
    await wrapper.get('[data-trigger]').trigger('click')
    document.querySelectorAll('[role="menuitem"]')[2].click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('select')?.[0]).toEqual(['logs'])
    wrapper.unmount()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selects/__tests__/RowMenu.spec.js`
Expected: FAIL — cannot resolve `../RowMenu.vue`.

- [ ] **Step 3: Implement RowMenu**

Create `src/design-system/components/selects/RowMenu.vue`:

```vue
<script setup>
import { MenuRoot, MenuTrigger, MenuPositioner, MenuContent, MenuItem, MenuSeparator } from '@ark-ui/vue/menu'

defineProps({
  /** Items as `{ value, label, destructive? }`, destructive last. */
  items: { type: Array, required: true },
  /** Names the trigger for assistive technology — the glyph is decorative. */
  label: { type: String, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <MenuRoot :positioning="{ gutter: 6 }" @select="(details) => emit('select', details.value)">
    <!-- Appendix D.1 — 34x34 square, radius 8px, field border. -->
    <MenuTrigger
      data-trigger
      :aria-label="label"
      class="rowmenu__trigger grid h-compact w-compact place-items-center rounded-control border border-field bg-surface text-ink-500"
    >
      <span data-glyph aria-hidden="true" class="rowmenu__glyph font-bold">⋯</span>
    </MenuTrigger>

    <MenuPositioner>
      <MenuContent class="rowmenu__panel rounded-panel border border-hairline bg-surface p-1.5">
        <template v-for="item in items" :key="item.value">
          <!-- Redline "Menu item" — the destructive item is preceded by a rule. -->
          <MenuSeparator
            v-if="item.destructive"
            data-separator
            class="rowmenu__separator border-divider"
          />
          <MenuItem
            :value="item.value"
            class="rowmenu__item flex items-center rounded-control text-body"
            :class="item.destructive ? 'text-red-700 font-bold' : 'text-ink-700 font-normal'"
            >{{ item.label }}</MenuItem
          >
        </template>
      </MenuContent>
    </MenuPositioner>
  </MenuRoot>
</template>

<style scoped>
/* Size comes from `h-compact w-compact` on the element — exactly the pattern
 * Button's icon size already uses for a 34x34 square control. */
.rowmenu__trigger {
  cursor: pointer;
}

.rowmenu__trigger:hover {
  background: var(--surface-muted);
}

.rowmenu__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.rowmenu__glyph {
  font-size: 14px;
  line-height: 1;
}

/* Appendix D.1 — panel min-width 196px, on the panel shadow. */
.rowmenu__panel {
  min-width: 196px;
  box-shadow: var(--sh-panel);
}

/* Redline "Option" geometry, shared by menu items — pad 9px 10px. */
.rowmenu__item {
  padding: 9px 10px;
  cursor: pointer;
}

/* Appendix D.1 — the destructive item sits 6px below a hairline, with 13px
 * of space above its own text. */
.rowmenu__separator {
  margin-top: 6px;
  padding-top: 7px;
  border-top-width: 1px;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selects/__tests__/RowMenu.spec.js`
Expected: PASS — 6 tests.

If Ark's `MenuSeparator` renders an element that cannot carry `data-separator`, or if `@select`'s payload shape differs from `details.value`, read the installed package to find the real contract and report it — do not guess.

- [ ] **Step 5: Export, run all gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as RowMenu } from './components/selects/RowMenu.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selects/ src/design-system/index.js
git commit -m "feat(ds): add the row actions menu"
```

---

### Task 6: Wire the Dropdowns section and close it

Replaces the section's four `DemoGap` markers with the real components and flips the manifest, which makes the existing "a complete section has zero gaps" test enforce the result.

**Files:**
- Modify: `src/design-system/demo/sections/DropdownsSection.vue`
- Modify: `src/design-system/demo/chrome/sections.js`
- Modify: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:** Consumes all four components from Tasks 2-5.

**Do not change** the section's `DemoCard` title or description — both are Appendix D content, asserted verbatim by `appendix-d-content.spec.js`.

**This section has NO uppercase sub-blocks.** Appendix D.1 records that, and a live test asserts `SpecsSection`, `DropdownsSection` and `TokensSection` each render **zero** `.text-column-header` elements. Each demo is named instead by a 12.5/500 field label with a muted qualifier, exactly as `FilesSection` and `SpecsSection` already do.

- [ ] **Step 1: Write the failing test**

Append to `src/design-system/demo/sections/__tests__/sections.spec.js`. That file already imports `mount`, `describe`/`expect`/`it` and every section component including `DropdownsSection` — **add no imports**:

```js
describe('DropdownsSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(DropdownsSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('still renders no uppercase headings', () => {
    // Appendix D.1 — Dropdowns has none; the demos carry field labels instead.
    expect(mount(DropdownsSection).findAll('.text-column-header')).toHaveLength(0)
  })

  it('names all four demos with their field label and qualifier', () => {
    const text = mount(DropdownsSection).text()
    for (const label of ['Facility type', 'Services', 'Inline filter', 'Row menu']) {
      expect(text, `missing field label: ${label}`).toContain(label)
    }
    for (const qualifier of ['· single select', '· multi select', '· table bar', '· actions']) {
      expect(text, `missing qualifier: ${qualifier}`).toContain(qualifier)
    }
  })

  it('carries the four notes verbatim from Appendix D.1', () => {
    const text = mount(DropdownsSection).text()
    expect(text).toContain('Placeholder greys out until a value is picked.')
    expect(text).toContain('Long lists get an inline filter and a sticky footer.')
    expect(text).toContain('34px variant for filter bars, with the field name inline.')
    expect(text).toContain('Destructive item sits last, separated by a hairline.')
  })

  it('shows the select placeholder from the artifact', () => {
    expect(mount(DropdownsSection).text()).toContain('Select a facility type')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — 4 gap markers found, expected 0.

- [ ] **Step 3: Wire the components in**

In `DropdownsSection.vue`, drop the `DemoGap` import, import `ref` and the four components from `@/design-system`, and add the Appendix D.1 data verbatim — including the em dashes in the service names:

```js
import { ref } from 'vue'
import { Select, MultiSelect, InlineFilter, RowMenu } from '@/design-system'

const FACILITY_TYPES = [
  'Hospital · Level 1',
  'Hospital · Level 2',
  'Infirmary',
  'Primary Care Facility',
  'Birthing Home',
  'Clinical Laboratory',
  'X-ray Facility',
]

const SERVICES = [
  'Ambulance Service — Type I',
  'Birthing Home',
  'Clinical Laboratory — Limited',
  'Clinical Laboratory — Secondary',
  'Dental Clinic',
  'Pharmacy',
  'X-ray Facility',
]

const STATUSES = [
  { label: 'Active', dot: 'bg-dot-green' },
  { label: 'Expiring soon', dot: 'bg-amber-400' },
  { label: 'Expired', dot: 'bg-red-500' },
  { label: 'All', dot: 'bg-ink-200' },
]

const ROW_ACTIONS = [
  { value: 'lto', label: 'View LTO document' },
  { value: 'facility', label: 'Facility details' },
  { value: 'logs', label: 'View logs' },
  { value: 'revoke', label: 'Revoke licence', destructive: true },
]

const facilityType = ref('')
const services = ref(['Pharmacy', 'Birthing Home'])
const status = ref('Active')
```

Then replace the four `DemoGap`s. Each demo is one grid cell: a field label, the control, and a note. Follow `FilesSection.vue`'s field-label markup exactly (`text-field-label text-ink-700 mb-1.5`), adding the muted qualifier as a nested span:

```html
      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Facility type <span class="text-ink-500">· single select</span>
        </div>
        <Select
          v-model="facilityType"
          :options="FACILITY_TYPES"
          placeholder="Select a facility type"
          label="Facility type"
        />
        <p class="text-hint text-text-meta mt-1.5">
          Placeholder greys out until a value is picked.
        </p>
      </div>
```

Repeat for the other three, using their Appendix D.1 label, qualifier and note:

- `Services` / `· multi select` — `<MultiSelect v-model="services" :options="SERVICES" placeholder="Select services" label="Services" filter-placeholder="Filter services" empty-text="No service matches that." />` — note `Long lists get an inline filter and a sticky footer.`
- `Inline filter` / `· table bar` — `<InlineFilter v-model="status" :options="STATUSES" name="Status" />` — note `34px variant for filter bars, with the field name inline.`
- `Row menu` / `· actions` — `<RowMenu :items="ROW_ACTIONS" label="Row actions" />` — note `Destructive item sits last, separated by a hairline.`

Keep the existing `<DemoBlocks>` wrapper: Appendix D.1 gives this section a `minmax(260px,1fr)` grid, and `DemoBlocks` supplies `minmax(268px,1fr)` with the card padding. That is the closest existing container, and unlike the Tabs section these four demos are narrow enough to sit in a grid cell — which is what the artifact does.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS.

- [ ] **Step 5: Flip the manifest**

In `src/design-system/demo/chrome/sections.js`, set the `dropdowns` entry's `complete` to `true`. Change only that entry.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/
git commit -m "feat(ds): render the Dropdowns section's four variants and mark it complete"
```

---

## Self-Review

Checked against the spec after writing:

**Spec coverage.** Appendix C's `Dropdowns` group has 16 rows. `Trigger`, `Open trigger`, `Value`, `Placeholder`, `Caret`, `Panel`, `Panel shadow`, `Panel max-h`, `Option`, `Option selected` → Task 2. `Checkbox in list`, `Panel filter`, `Panel footer`, and `Panel max-h`'s 214px case → Task 3. `Inline variant` → Task 4. `Menu item` → Task 5. All 16 land in a task with an assertion. Appendix D.1's four labels, four qualifiers, four notes, both option lists, the empty text and the footer buttons all land in Task 6 or in the component tests.

**Every value verified against the repo, not assumed.** All 20 colours were mapped to real `tokens.css` definitions and checked against the `theme.css` bridge before this plan was written — the table above records the three the bridge renames, which is the exact defect that cost a fix round in Phase 3b. `--sh-panel` really is `0 12px 28px rgba(16,24,40,.14)`, matching the `Panel shadow` row. `--r-control` is 8px, `--r-field` 9px, `--r-panel` 12px.

**Ark API verified against the installed package**, not recalled: the `'./*'` wildcard in `@ark-ui/vue`'s export map makes `@ark-ui/vue/select`, `/menu` and `/collection` valid subpaths; `createListCollection` is exported from `@ark-ui/vue/collection`; `SelectItem` takes an `item` prop (`ItemProps.item` in `@zag-js/select`).

**Type consistency.** `Select` takes `options`/`modelValue`/`placeholder`/`label`; `MultiSelect` adds `filterPlaceholder`/`emptyText` and emits `apply`; `InlineFilter` takes `options`/`modelValue`/`name`; `RowMenu` takes `items`/`label` and emits `select`. Task 6 calls all four with exactly those names.

**Three values have no token**, each commented in place: the 4px checkbox radius (`--r-check` is 5px), the 38/34/32px heights, and the 8px status dot. None belongs in the frozen token layer.

**Known risk carried into Task 3:** Ark Select's typeahead may intercept keystrokes meant for the in-panel filter input. The task tells the implementer to verify against installed source and report rather than work around it.

**Layout checked at the real page width**, which Phase 3b's final review showed is invisible to jsdom: `DemoBlocks` gives each cell 293px at the page's 928px content width. All four dropdown triggers are single-line controls that shrink to their container, so unlike `StageTabs` they do not collapse — this is why Task 6 keeps `DemoBlocks` instead of moving to `DemoStrip`.
