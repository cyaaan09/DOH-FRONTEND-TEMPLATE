# Selection Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the Selection controls section's six gaps with `Checkbox`, `Radio`, `Switch`, `CheckboxCard`, `RadioCard` and `BulkActionBar`, built on Ark UI and conforming to Appendix C's sixteen redline rows.

**Architecture:** Ark UI's `checkbox`, `radio-group` and `switch` supply state, keyboard handling and ARIA; the card variants compose the same primitives inside a selectable surface; `BulkActionBar` is a bespoke tri-state header over plain checkboxes. Every visual value comes from Appendix C and is expressed in design tokens. The demo page's section swaps its six `DemoGap` markers for real components and flips to `complete: true`.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, `@ark-ui/vue` 5.39.1, Vitest 4 + `@vue/test-utils`, Playwright (layout gate)

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — **Appendix C's `Selection controls` group is the authority for values** (16 rows), **Appendix D.1's "Selection controls → the six sub-blocks' data" is the authority for content** (extracted 2026-08-31), §8.1 for `label`, §17 for page architecture, §18 for the WCAG 2.1 AA baseline.

**Phase:** 3d. Phases 1–3c are complete on branch `design-system` (350 unit tests, 8 Playwright tests), and a real-browser layout gate now exists. Five of fifteen sections are done; this is the sixth.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **Appendix C is the authority for values.** If a redline contradicts this plan, stop and report — that has happened in every phase so far and reporting was right every time.
- **No raw hex colours** under `src/design-system/components/`, including comments — a guard scans them. Cite redline rows by name.
- **No `dark:` variants** anywhere in `src/design-system/`; no arbitrary Tailwind **type** sizes.
- **`label` names the thing; presentation is the component's business** (§8.1). A component whose label is invisible says so in its JSDoc.
- Accessibility baseline **WCAG 2.1 AA**. Ark supplies the ARIA — do not remove or override its roles. Disabled controls must still be perceivable; indeterminate must be exposed as `aria-checked="mixed"`, which Ark does natively.
- **Never put a comment before a component's root element** — Vue compiles that as a Fragment root.
- **Two competing classes for one property is this project's recurring defect** (seven instances). Every conditional produces exactly one class per property; a scoped rule setting a property a utility also sets counts.
- `tokens.css` / `tokens.dark.css` are frozen. `theme.css` is authored.
- Content from Appendix D and D.1 is verbatim, glyph for glyph — **including the em dashes** in `Clinical Laboratory — Limited` and `Enforced by policy — cannot be turned off`.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run unit tests with `npx vitest run` — `test:unit` is watch mode and hangs.
- **Four gates**: `npx vitest run`, `npm run verify:css`, `npm run lint`, `npm run test:e2e`. The first three run per task; the fourth runs once, in Task 6, after the section is wired.
- Write only ASCII quotes in code. Smart quotes have silently broken tests here four times.
- Commit messages carry **no** `Co-Authored-By` trailer.

## Verified Token Mapping

Checked against `tokens.css` definitions and the `theme.css` bridge before this plan was written. **Three tokens are renamed by the bridge** — using the token's own name emits no CSS while still appearing in `classes()`, which has cost a fix round twice:

| Redline value | Token | **Utility** |
|---|---|---|
| `#D5DBE6` switch track off | `--border-field` | **`bg-field`** (token named for a border role; same hex) |
| `#E4E8EF` card border | `--border-card` | **`border-hairline`** |
| `#DDE2EA` disabled border | `--border-soft` | **`border-soft`** |
| `#177236` on-state fill | `--green-fill` | `bg-green-fill` / `border-green-fill` |
| `#C3CAD6` off border, disabled track | `--ink-100` | `border-ink-100` / `bg-ink-100` |
| `#E9EDF3` disabled fill | `--surface-disabled` | `bg-surface-disabled` |
| `#B9C1D1` disabled glyph | `--ink-200` | `text-ink-200` |
| `#344054` label | `--ink-700` | `text-ink-700` |
| `#25A94E` card selected border | `--green-500` | `border-green-500` |
| `#F7FCF9` card selected bg, selected row | `--green-tint-2` | `bg-green-tint-2` |
| `#FAFBFD` bulk bar idle | `--surface-sunken` | `bg-surface-sunken` |
| `#F2FAF4` bulk bar active | `--green-tint` | `bg-green-tint` |
| `#F5F7FA` selected-row top rule | `--divider-row` | `border-divider-row` |
| `#FFF` knob, checkbox off fill | `--surface` | `bg-surface` |
| `#FFF` check glyph on green | `--green-on-fill` | `text-green-on-fill` |

**Note the last two are both white but semantically different.** The knob and the unchecked box are *surfaces* (`bg-surface`); the ✓ glyph is *a label on green fill* (`text-green-on-fill`). They diverge in dark mode — `--surface` becomes `#161C26`, `--green-on-fill` becomes `#0B1017` — so using one for the other renders wrong in dark theme while looking identical in light. Pick by meaning, not by hex.

**Sizes and radii.** `--size-check` is 17px and **is** bridged: `h-check` / `w-check` work, and I confirmed by build that they emit CSS — this section is their first consumer. `rounded-check` is 5px; `rounded-pill` is 999px.

**Values with no token — scoped CSS, each commented with its redline row name:** the 1.8px control border; the 8px radio inner dot; the 38×22px switch track and its 2px padding; the 18px knob and its `0 1px 2px rgba(16,24,40,.2)` shadow (no shadow token is close — `--sh-card` is `.04`); the **11px card radius** (`--r-panel` is 12px, `--r-card` is 14px); the 11px and 14px row gaps; the 10px label gap; the 10px/700 check glyph.

**One deliberate divergence, decided here.** Appendix C's `Card selected` row for this group specifies `ring rgba(37,169,78,.10)`; no `.10` token exists and `--ring-select` is `.12`. The system carries this ring at two different alphas in two different rows — `.10` here and `.12` in *Stat cards & meters* — and a third row, *Containers & surfaces → Selected surface*, states it as the range `.10–.12`. `--ring-select` carries the `.12` value and sits inside that stated range. **Use `var(--ring-select)`** rather than introducing a literal or a new token — the frozen token layer should not grow for a 0.02 alpha difference the source itself treats as a range.

## File Structure

```
src/design-system/components/selection/
  Checkbox.vue        17px box, on/off/indeterminate/disabled     (Task 1)
  Radio.vue           RadioGroup + items, 8px inner dot           (Task 2)
  Switch.vue          38x22 track, 18px knob                      (Task 3)
  CheckboxCard.vue    card surface wrapping Checkbox              (Task 4)
  RadioCard.vue       card surface wrapping a radio item          (Task 4)
  BulkActionBar.vue   tri-state header + conditional actions      (Task 5)

src/design-system/demo/sections/SelectionSection.vue  MODIFIED — six gaps -> components (Task 6)
src/design-system/demo/chrome/sections.js             MODIFIED — selection complete   (Task 6)
src/design-system/index.js                            MODIFIED — six exports
```

**Ark's export style, verified against the installed package:** flat named exports, not namespaces. From `@ark-ui/vue/checkbox`: `CheckboxRoot`, `CheckboxControl`, `CheckboxIndicator`, `CheckboxLabel`, `CheckboxHiddenInput`, `CheckboxGroup`. From `@ark-ui/vue/radio-group`: `RadioGroupRoot`, `RadioGroupItem`, `RadioGroupItemControl`, `RadioGroupItemText`, `RadioGroupItemHiddenInput`, `RadioGroupLabel`, `RadioGroupIndicator`. From `@ark-ui/vue/switch`: `SwitchRoot`, `SwitchControl`, `SwitchThumb`, `SwitchLabel`, `SwitchHiddenInput`.

---

### Task 1: Checkbox — four states in one control

Appendix C group **Selection controls**, rows `Checkbox`, `Checkbox on`, `Checkbox off`, `Indeterminate`, `Disabled`, `Label`. Read them before starting.

**Files:**
- Create: `src/design-system/components/selection/Checkbox.vue`
- Create: `src/design-system/components/selection/__tests__/Checkbox.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<Checkbox v-model :label :hint :disabled :indeterminate>` where `v-model` is a boolean, `label` is the visible row label, `hint` an optional second line, and `indeterminate` renders the mixed state. Emits `update:modelValue`. Tasks 4 and 5 build on it.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selection/__tests__/Checkbox.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Checkbox from '../Checkbox.vue'

const mountBox = (props = {}) =>
  mount(Checkbox, { props: { modelValue: false, label: 'Include legacy records', ...props } })

describe('Checkbox', () => {
  it('renders its label and optional hint', () => {
    const wrapper = mountBox({ hint: 'Migrated paper licences with no service list' })
    expect(wrapper.text()).toContain('Include legacy records')
    expect(wrapper.text()).toContain('Migrated paper licences with no service list')
  })

  it('omits the hint element when none is given', () => {
    expect(mountBox().find('[data-hint]').exists()).toBe(false)
  })

  it('sizes the box from the shared control token', () => {
    // Redline "Checkbox" — 17x17, radius 5px. --size-check is 17px and bridges
    // to h-check/w-check; this section is its first consumer.
    const box = mountBox().get('[data-box]')
    expect(box.classes()).toContain('h-check')
    expect(box.classes()).toContain('w-check')
    expect(box.classes()).toContain('rounded-check')
  })

  it('fills green when on and stays white when off', () => {
    // Redlines "Checkbox on" and "Checkbox off". Both branches set background
    // AND border, so neither is left to Tailwind's emit order.
    const on = mountBox({ modelValue: true }).get('[data-box]')
    expect(on.classes()).toContain('bg-green-fill')
    expect(on.classes()).toContain('border-green-fill')
    expect(on.classes()).not.toContain('bg-surface')

    const off = mountBox().get('[data-box]')
    expect(off.classes()).toContain('bg-surface')
    expect(off.classes()).toContain('border-ink-100')
    expect(off.classes()).not.toContain('bg-green-fill')
  })

  it('shows a check when on and a dash when indeterminate', () => {
    // Redline "Indeterminate" — same fill as on, glyph is a dash.
    expect(mountBox({ modelValue: true }).get('[data-glyph]').text()).toBe('✓')
    const mixed = mountBox({ indeterminate: true })
    expect(mixed.get('[data-glyph]').text()).toBe('–')
    expect(mixed.get('[data-box]').classes()).toContain('bg-green-fill')
  })

  it('exposes the mixed state to assistive technology', () => {
    // WCAG 2.1 AA: an indeterminate box must not announce as merely unchecked.
    expect(mountBox({ indeterminate: true }).get('[role="checkbox"]').attributes('aria-checked')).toBe(
      'mixed',
    )
  })

  it('dresses the disabled state distinctly from both on and off', () => {
    // Redline "Disabled" — its own fill, border and glyph colour.
    const box = mountBox({ disabled: true, modelValue: true }).get('[data-box]')
    expect(box.classes()).toContain('bg-surface-disabled')
    expect(box.classes()).toContain('border-soft')
    expect(box.classes()).toContain('text-ink-200')
    expect(box.classes()).not.toContain('bg-green-fill')
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mountBox()
    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mountBox({ disabled: true })
    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('labels at the body step in the ink-700 grey', () => {
    // Redline "Label" — 13.5/400, #344054.
    const label = mountBox().get('[data-label]')
    expect(label.classes()).toContain('text-body')
    expect(label.classes()).toContain('text-ink-700')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selection/__tests__/Checkbox.spec.js`
Expected: FAIL — cannot resolve `../Checkbox.vue`.

- [ ] **Step 3: Implement Checkbox**

Create `src/design-system/components/selection/Checkbox.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { CheckboxRoot, CheckboxControl, CheckboxLabel, CheckboxHiddenInput } from '@ark-ui/vue/checkbox'

const props = defineProps({
  /** Whether the box is checked. Ignored while `indeterminate` is true. */
  modelValue: { type: Boolean, default: false },
  /** The visible row label. */
  label: { type: String, required: true },
  /** Optional second line under the label. */
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /** Renders the mixed state and announces aria-checked="mixed". */
  indeterminate: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// Ark models the tri-state as a value of true | false | 'indeterminate'.
const checked = computed(() => (props.indeterminate ? 'indeterminate' : props.modelValue))

// One branch per state, each setting every property it owns — never a base
// class plus an override, which is this project's recurring defect.
const boxClass = computed(() => {
  if (props.disabled) return 'bg-surface-disabled border-soft text-ink-200'
  if (props.indeterminate || props.modelValue)
    return 'bg-green-fill border-green-fill text-green-on-fill'
  return 'bg-surface border-ink-100 text-transparent'
})
</script>

<template>
  <CheckboxRoot
    :checked="checked"
    :disabled="disabled"
    class="checkbox flex items-start"
    @checked-change="(details) => emit('update:modelValue', details.checked === true)"
  >
    <!-- Redline "Checkbox" — 17x17 from the shared control token, radius 5px,
         1.8px border set in the style block below. -->
    <CheckboxControl
      data-box
      class="checkbox__box grid h-check w-check flex-none place-items-center rounded-check border"
      :class="boxClass"
    >
      <!-- Redlines "Checkbox on" and "Indeterminate" — 10px/700 glyph, a dash
           for mixed. Decorative: the control itself carries the state. -->
      <span data-glyph aria-hidden="true" class="checkbox__glyph font-bold">{{
        indeterminate ? '–' : '✓'
      }}</span>
    </CheckboxControl>

    <span class="checkbox__text min-w-0">
      <!-- Redline "Label" — 13.5/400 ink-700, 10px from the box. -->
      <CheckboxLabel data-label class="checkbox__label block text-body text-ink-700">{{
        label
      }}</CheckboxLabel>
      <span v-if="hint" data-hint class="checkbox__hint block text-hint text-text-meta">{{
        hint
      }}</span>
    </span>

    <CheckboxHiddenInput />
  </CheckboxRoot>
</template>

<style scoped>
/* Redline "Checkbox" — 1.8px border. No border-width utility carries it. */
.checkbox__box {
  border-width: 1.8px;
  cursor: pointer;
}

/* Redline "Label" — gap 10px between box and text. */
.checkbox__text {
  margin-left: 10px;
}

/* Redlines "Checkbox on" / "Indeterminate" — glyph 10px. */
.checkbox__glyph {
  font-size: 10px;
  line-height: 1;
}

.checkbox[data-disabled] {
  cursor: not-allowed;
}

.checkbox:focus-within .checkbox__box {
  outline: none;
  box-shadow: var(--ring-focus);
}

.checkbox__hint {
  margin-top: 2px;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selection/__tests__/Checkbox.spec.js`
Expected: PASS — 10 tests.

If Ark's tri-state API differs — for instance if `checked-change` reports something other than `details.checked`, or if `'indeterminate'` is not the accepted value — **read the installed `@zag-js/checkbox` source and report what it actually does** rather than reshaping the assertions. Every implementer on this project has found a real error this way.

- [ ] **Step 5: Export, run the three gates, commit**

Add to `src/design-system/index.js`:

```js
export { default as Checkbox } from './components/selection/Checkbox.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selection/ src/design-system/index.js
git commit -m "feat(ds): add the checkbox with its four redlined states"
```

---

### Task 2: Radio — a group, not a lone control

Appendix C rows `Radio`, `Label`, `Row gap`, plus `Disabled` for the disabled option.

**Files:**
- Create: `src/design-system/components/selection/Radio.vue`
- Create: `src/design-system/components/selection/__tests__/Radio.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<Radio v-model :options :label>` where `options` is `Array<{ value, label, hint?, disabled? }>`, `v-model` is the chosen value, and `label` names the group for assistive technology and is **not** rendered (§8.1 — say so in JSDoc). Emits `update:modelValue`. Task 4's `RadioCard` reuses the option shape.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selection/__tests__/Radio.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Radio from '../Radio.vue'

const OPTIONS = [
  { value: 'as-plan', label: 'As-plan' },
  { value: 'as-built', label: 'As-built' },
  { value: 'n/a', label: 'Not applicable', disabled: true },
]

const mountRadio = (props = {}) =>
  mount(Radio, {
    props: { options: OPTIONS, modelValue: 'as-plan', label: 'Drawing type', ...props },
  })

describe('Radio', () => {
  it('renders one item per option', () => {
    const wrapper = mountRadio()
    expect(wrapper.findAll('[data-item]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Not applicable')
  })

  it('names the group without drawing the name', () => {
    const wrapper = mountRadio()
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Drawing type')
    expect(wrapper.text()).not.toContain('Drawing type')
  })

  it('marks the chosen option and only that one', () => {
    const items = mountRadio().findAll('[data-item]')
    expect(items[0].attributes('data-state')).toBe('checked')
    expect(items[1].attributes('data-state')).not.toBe('checked')
  })

  it('gives the dot the fill green only when chosen', () => {
    // Redline "Radio" — 8px inner dot in the fill green.
    const dots = mountRadio().findAll('[data-dot]')
    expect(dots[0].classes()).toContain('bg-green-fill')
    expect(dots[1].classes()).toContain('bg-transparent')
    expect(dots[1].classes()).not.toContain('bg-green-fill')
  })

  it('rounds the control fully, unlike the checkbox', () => {
    // Redline "Radio" — 17x17 circle. Same size token, different radius.
    const control = mountRadio().get('[data-control]')
    expect(control.classes()).toContain('h-check')
    expect(control.classes()).toContain('rounded-pill')
    expect(control.classes()).not.toContain('rounded-check')
  })

  it('emits the chosen value', async () => {
    const wrapper = mountRadio()
    await wrapper.findAll('[data-item] input')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['as-built'])
  })

  it('dresses a disabled option distinctly', () => {
    const control = mountRadio().findAll('[data-control]')[2]
    expect(control.classes()).toContain('bg-surface-disabled')
    expect(control.classes()).toContain('border-soft')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selection/__tests__/Radio.spec.js`
Expected: FAIL — cannot resolve `../Radio.vue`.

- [ ] **Step 3: Implement Radio**

Create `src/design-system/components/selection/Radio.vue`. Model the structure on `Checkbox.vue` — same label/hint treatment, same one-branch-per-state class computation — using `RadioGroupRoot` / `RadioGroupItem` / `RadioGroupItemControl` / `RadioGroupItemText` / `RadioGroupItemHiddenInput`.

Key differences from `Checkbox`:

- The control is `rounded-pill`, not `rounded-check`, and holds a nested 8px dot rather than a glyph. The dot's colour is the conditional; the control's border and background follow the same three-branch shape (disabled / chosen / unchosen).
- `label` is `aria-label` on the root and is never rendered.
- Row gap is 11px between items — scoped CSS, redline `Row gap`.

Write the scoped rules with the same commenting discipline as `Checkbox.vue`: every non-tokenised number cites its redline row by name.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selection/__tests__/Radio.spec.js`
Expected: PASS — 7 tests.

- [ ] **Step 5: Export, run the three gates, commit**

```js
export { default as Radio } from './components/selection/Radio.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selection/ src/design-system/index.js
git commit -m "feat(ds): add the radio group"
```

---

### Task 3: Switch — the control that acts immediately

Appendix C rows `Switch track`, `Track on / off`, `Knob`, `Label`, `Row gap` (14px for switches).

**Files:**
- Create: `src/design-system/components/selection/Switch.vue`
- Create: `src/design-system/components/selection/__tests__/Switch.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<Switch v-model :label :hint :disabled>` — `v-model` boolean, `label` visible, `hint` optional. Emits `update:modelValue`.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selection/__tests__/Switch.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Switch from '../Switch.vue'

const mountSwitch = (props = {}) =>
  mount(Switch, { props: { modelValue: false, label: 'Email me on returns', ...props } })

describe('Switch', () => {
  it('renders its label and hint', () => {
    const wrapper = mountSwitch({ hint: 'Digest at 6 PM, weekdays only' })
    expect(wrapper.text()).toContain('Email me on returns')
    expect(wrapper.text()).toContain('Digest at 6 PM, weekdays only')
  })

  it('greens the track when on and greys it when off', () => {
    // Redline "Track on / off" — the off colour is the field border token,
    // which the bridge exposes as `bg-field`; `bg-border-field` emits nothing.
    expect(mountSwitch({ modelValue: true }).get('[data-track]').classes()).toContain('bg-green-fill')
    const off = mountSwitch().get('[data-track]')
    expect(off.classes()).toContain('bg-field')
    expect(off.classes()).not.toContain('bg-green-fill')
  })

  it('greys the track differently when disabled', () => {
    // Redline "Track on / off" — disabled is its own colour, not the off colour.
    const track = mountSwitch({ disabled: true, modelValue: true }).get('[data-track]')
    expect(track.classes()).toContain('bg-ink-100')
    expect(track.classes()).not.toContain('bg-green-fill')
    expect(track.classes()).not.toContain('bg-field')
  })

  it('rounds the track fully and keeps the knob on the surface colour', () => {
    // Redlines "Switch track" and "Knob". The knob is a surface, not a label
    // on green — the two whites diverge in dark mode.
    const wrapper = mountSwitch()
    expect(wrapper.get('[data-track]').classes()).toContain('rounded-pill')
    const knob = wrapper.get('[data-knob]')
    expect(knob.classes()).toContain('bg-surface')
    expect(knob.classes()).toContain('rounded-pill')
  })

  it('exposes its state through the native input', () => {
    // Verified against @zag-js/switch: `role` appears NOWHERE in that package,
    // and getHiddenInputProps renders a plain <input type="checkbox"> with
    // defaultChecked and no aria-checked. State therefore lives on the input's
    // own `checked` IDL property, exactly as it does for Checkbox.
    const input = mountSwitch({ modelValue: true }).get('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
    expect(mountSwitch().get('input[type="checkbox"]').element.checked).toBe(false)
  })

  it('emits update:modelValue when toggled, and not when disabled', async () => {
    const on = mountSwitch()
    await on.get('input[type="checkbox"]').trigger('click')
    expect(on.emitted('update:modelValue')?.[0]).toEqual([true])

    const off = mountSwitch({ disabled: true })
    await off.get('input[type="checkbox"]').trigger('click')
    expect(off.emitted('update:modelValue')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selection/__tests__/Switch.spec.js`
Expected: FAIL — cannot resolve `../Switch.vue`.

- [ ] **Step 3: Implement Switch**

Create `src/design-system/components/selection/Switch.vue` using `SwitchRoot` / `SwitchControl` / `SwitchThumb` / `SwitchLabel` / `SwitchHiddenInput`.

Redlined geometry, all scoped CSS with the row named in each comment: track `38×22px`, `padding: 2px`, `rounded-pill`; knob `18px` circle with `box-shadow: 0 1px 2px rgba(16, 24, 40, 0.2)` — **no shadow token is close** (`--sh-card` is `.04`), so the literal is correct here and must not be replaced with `--sh-card`. Row gap for switches is 14px, not the 11px the other rows use.

The track's colour is a three-branch conditional (disabled / on / off), one class per property per branch.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selection/__tests__/Switch.spec.js`
Expected: PASS — 6 tests.

- [ ] **Step 5: Export, run the three gates, commit**

```js
export { default as Switch } from './components/selection/Switch.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selection/ src/design-system/index.js
git commit -m "feat(ds): add the switch"
```

---

### Task 4: CheckboxCard and RadioCard — the same control on a selectable surface

Appendix C rows `Card`, `Card selected`, plus the `Checkbox`/`Radio` rows the cards reuse. Built together because they share every value except which primitive sits inside.

**Files:**
- Create: `src/design-system/components/selection/CheckboxCard.vue`, `RadioCard.vue`
- Create: `src/design-system/components/selection/__tests__/SelectionCards.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<CheckboxCard v-model :label :hint :disabled>` — same prop shape as `Checkbox`, wrapped in a selectable surface. `<RadioCard v-model :options :label>` — same option shape as `Radio`, one card per option, `label` names the group and is not rendered. The chosen radio card additionally shows a `Selected` marker (Appendix D.1).

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selection/__tests__/SelectionCards.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CheckboxCard from '../CheckboxCard.vue'
import RadioCard from '../RadioCard.vue'

const CARD_OPTIONS = [
  { value: 'initial', label: 'Initial', hint: 'First licence for a newly built facility' },
  { value: 'renewal', label: 'Renewal', hint: 'Same services, new validity period' },
  { value: 'modify', label: 'Add / Modify', hint: 'Changes the services on an active licence' },
]

describe('CheckboxCard', () => {
  const mountCard = (props = {}) =>
    mount(CheckboxCard, {
      props: {
        modelValue: false,
        label: 'Pharmacy',
        hint: 'Requires a licensed pharmacist on duty',
        ...props,
      },
    })

  it('renders the label and hint inside a card surface', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Pharmacy')
    expect(wrapper.text()).toContain('Requires a licensed pharmacist on duty')
    expect(wrapper.get('[data-card]').classes()).toContain('border-hairline')
  })

  it('switches the whole surface when chosen, not just the box', () => {
    // Redline "Card selected" — green border AND tinted background. Both
    // branches set both properties, so neither is left to emit order.
    const on = mountCard({ modelValue: true }).get('[data-card]')
    expect(on.classes()).toContain('border-green-500')
    expect(on.classes()).toContain('bg-green-tint-2')
    expect(on.classes()).not.toContain('border-hairline')

    const off = mountCard().get('[data-card]')
    expect(off.classes()).toContain('border-hairline')
    expect(off.classes()).toContain('bg-surface')
    expect(off.classes()).not.toContain('bg-green-tint-2')
  })

  it('still contains a real checkbox', () => {
    expect(mountCard().find('[role="checkbox"]').exists()).toBe(true)
  })

  it('emits when the card is chosen', async () => {
    const wrapper = mountCard()
    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})

describe('RadioCard', () => {
  const mountCards = (props = {}) =>
    mount(RadioCard, {
      props: { options: CARD_OPTIONS, modelValue: 'renewal', label: 'Application type', ...props },
    })

  it('renders one card per option with its hint', () => {
    const wrapper = mountCards()
    expect(wrapper.findAll('[data-card]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Changes the services on an active licence')
  })

  it('names the group without drawing the name', () => {
    const wrapper = mountCards()
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Application type')
    expect(wrapper.text()).not.toContain('Application type')
  })

  it('marks only the chosen card', () => {
    const cards = mountCards().findAll('[data-card]')
    expect(cards[1].classes()).toContain('border-green-500')
    expect(cards[1].classes()).toContain('bg-green-tint-2')
    expect(cards[0].classes()).toContain('border-hairline')
    expect(cards[0].classes()).not.toContain('bg-green-tint-2')
  })

  it('shows the Selected marker on the chosen card only', () => {
    // Appendix D.1 — the chosen radio card carries a "Selected" marker.
    const markers = mountCards().findAll('[data-selected-marker]')
    expect(markers).toHaveLength(1)
    expect(markers[0].text()).toBe('Selected')
  })

  it('emits the chosen value', async () => {
    const wrapper = mountCards()
    await wrapper.findAll('[data-card] input')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['modify'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selection/__tests__/SelectionCards.spec.js`
Expected: FAIL — cannot resolve `../CheckboxCard.vue`.

- [ ] **Step 3: Implement both cards**

Both wrap the same card surface. Redlined values, all cited by row name:

- **`Card`** — `padding: 13px 14px`, **`border-radius: 11px`** (no token: `--r-panel` is 12px, `--r-card` is 14px, so this is scoped CSS), `1px` border in `border-hairline`, internal `gap: 11px`.
- **`Card selected`** — `border-green-500`, `bg-green-tint-2`, and `box-shadow: var(--ring-select)`. Appendix C's row for this group says `rgba(37,169,78,.10)` while `--ring-select` is `.12`; use the token. The artifact's own Stat-cards group writes this ring as the range `.10–.12`, so the token sits inside the source's stated tolerance and the frozen token layer should not grow for a 0.02 alpha difference.

`CheckboxCard` composes `Checkbox` rather than re-implementing the box. `RadioCard` renders `RadioGroupItem`s and adds the `Selected` marker on the chosen one — mark it `data-selected-marker` so the test can find it, and keep its text exactly `Selected`.

Reuse `Checkbox.vue`'s conditional-class discipline: one branch per state, each setting every property it owns.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selection/__tests__/SelectionCards.spec.js`
Expected: PASS — 10 tests.

- [ ] **Step 5: Export, run the three gates, commit**

```js
export { default as CheckboxCard } from './components/selection/CheckboxCard.vue'
export { default as RadioCard } from './components/selection/RadioCard.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selection/ src/design-system/index.js
git commit -m "feat(ds): add the checkbox and radio card variants"
```

---

### Task 5: BulkActionBar — tri-state header and conditional actions

Appendix C rows `Bulk bar`, `Selected row`, plus the `Checkbox`/`Indeterminate` rows the header reuses. Appendix D.1 for the label wording, the two actions and the three rows.

**Files:**
- Create: `src/design-system/components/selection/BulkActionBar.vue`
- Create: `src/design-system/components/selection/__tests__/BulkActionBar.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Produces: `<BulkActionBar v-model :rows :actions>` where `rows` is `Array<{ id, name, number }>`, `v-model` is an array of selected ids, and `actions` is `Array<{ value, label }>`. Emits `update:modelValue` and `action` with the chosen action's `value`.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/components/selection/__tests__/BulkActionBar.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BulkActionBar from '../BulkActionBar.vue'

const ROWS = [
  { id: 'r1', name: 'Trento Primary Care Facility', number: '16-015-2527-PCF-1' },
  { id: 'r2', name: 'Hipol Family Hospital', number: '16-19-26-I-2' },
  { id: 'r3', name: 'Socorro Birthing Clinic', number: '16-72-26-BH-1' },
]

const ACTIONS = [
  { value: 'notice', label: 'Send renewal notice' },
  { value: 'export', label: 'Export' },
]

const mountBar = (props = {}) =>
  mount(BulkActionBar, { props: { rows: ROWS, modelValue: [], actions: ACTIONS, ...props } })

describe('BulkActionBar', () => {
  it('renders every row with its name and licence number', () => {
    const wrapper = mountBar()
    expect(wrapper.findAll('[data-row]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Socorro Birthing Clinic')
    expect(wrapper.text()).toContain('16-72-26-BH-1')
  })

  it('reads "Select all" at zero and a count once something is chosen', () => {
    // Appendix D.1 — the header label is a count, not a static string.
    expect(mountBar().get('[data-bulk-label]').text()).toBe('Select all')
    expect(mountBar({ modelValue: ['r1', 'r2'] }).get('[data-bulk-label]').text()).toBe('2 selected')
  })

  it('hides the actions until at least one row is chosen', () => {
    // Appendix D.1 — the two buttons appear only when something is selected.
    expect(mountBar().findAll('[data-action]')).toHaveLength(0)
    const active = mountBar({ modelValue: ['r1'] })
    expect(active.findAll('[data-action]')).toHaveLength(2)
    expect(active.text()).toContain('Send renewal notice')
    expect(active.text()).toContain('Export')
  })

  it('tints the bar once active', () => {
    // Redline "Bulk bar" — sunken when idle, green tint when active.
    expect(mountBar().get('[data-bulk-bar]').classes()).toContain('bg-surface-sunken')
    const active = mountBar({ modelValue: ['r1'] }).get('[data-bulk-bar]')
    expect(active.classes()).toContain('bg-green-tint')
    expect(active.classes()).not.toContain('bg-surface-sunken')
  })

  it('tints a selected row and leaves the others plain', () => {
    // Redline "Selected row" — its own background.
    const rows = mountBar({ modelValue: ['r2'] }).findAll('[data-row]')
    expect(rows[1].classes()).toContain('bg-green-tint-2')
    expect(rows[0].classes()).not.toContain('bg-green-tint-2')
  })

  it('shows the header box mixed when some but not all rows are chosen', () => {
    // Redline "Indeterminate" — the tri-state is the point of this control.
    // Appendix C's Keyboard row says "aria-checked=mixed", but Task 1 proved
    // Ark exposes mixed through the native input's `indeterminate` IDL
    // PROPERTY, with no aria-checked attribute anywhere. Assert the property.
    const partial = mountBar({ modelValue: ['r1'] }).get('[data-bulk-box] input[type="checkbox"]')
    expect(partial.element.indeterminate).toBe(true)

    const all = mountBar({ modelValue: ['r1', 'r2', 'r3'] }).get(
      '[data-bulk-box] input[type="checkbox"]',
    )
    expect(all.element.indeterminate).toBe(false)
    expect(all.element.checked).toBe(true)
  })

  it('selects every row from the header, and clears them all again', async () => {
    const wrapper = mountBar()
    await wrapper.get('[data-bulk-box] input[type="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual(['r1', 'r2', 'r3'])

    const full = mountBar({ modelValue: ['r1', 'r2', 'r3'] })
    await full.get('[data-bulk-box] input[type="checkbox"]').trigger('click')
    expect(full.emitted('update:modelValue')?.[0][0]).toEqual([])
  })

  it('emits the chosen action', async () => {
    const wrapper = mountBar({ modelValue: ['r1'] })
    await wrapper.findAll('[data-action]')[0].trigger('click')
    expect(wrapper.emitted('action')?.[0]).toEqual(['notice'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/selection/__tests__/BulkActionBar.spec.js`
Expected: FAIL — cannot resolve `../BulkActionBar.vue`.

- [ ] **Step 3: Implement BulkActionBar**

Compose `Checkbox` for the header box and each row's box rather than re-implementing them — the header simply passes `indeterminate` when the selection is partial.

Redlined values: **`Bulk bar`** — `padding: 11px 16px`, `bg-surface-sunken` when idle and `bg-green-tint` when any row is chosen (one binding, both branches). **`Selected row`** — `bg-green-tint-2` with a `1px` top rule in `border-divider-row`.

The header label comes from Appendix D.1: `Select all` at zero, `<n> selected` otherwise. The action buttons render only when the selection is non-empty.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/selection/__tests__/BulkActionBar.spec.js`
Expected: PASS — 8 tests.

- [ ] **Step 5: Export, run the three gates, commit**

```js
export { default as BulkActionBar } from './components/selection/BulkActionBar.vue'
```

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/selection/ src/design-system/index.js
git commit -m "feat(ds): add the bulk selection bar"
```

---

### Task 6: Wire the section and close it

Replaces the six `DemoGap` markers with real components, flips the manifest, and runs the browser gate for the first time on this section.

**Files:**
- Modify: `src/design-system/demo/sections/SelectionSection.vue`
- Modify: `src/design-system/demo/chrome/sections.js`
- Modify: `src/design-system/demo/sections/__tests__/sections.spec.js`

**Interfaces:** Consumes all six components from Tasks 1-5.

**Do not change** the section's `DemoCard` title or description, or any of its six uppercase `DemoBlock` labels — all are Appendix D content asserted verbatim by `appendix-d-content.spec.js`. This section **does** have uppercase sub-blocks, unlike Dropdowns.

- [ ] **Step 1: Write the failing test**

Append to `src/design-system/demo/sections/__tests__/sections.spec.js`. That file already imports `mount`, `describe`/`expect`/`it` and every section component including `SelectionSection` — **add no imports**:

```js
describe('SelectionSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(SelectionSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('still renders all six uppercase sub-blocks', () => {
    const text = mount(SelectionSection).text()
    for (const label of [
      'CHECKBOX · STATES',
      'RADIO · LIST',
      'SWITCH · TAKES EFFECT AT ONCE',
      'CHECKBOX CARDS · MULTI',
      'RADIO CARDS · SINGLE',
      'BULK SELECTION — TABLE HEADER + ACTION BAR',
    ]) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('carries the checkbox states verbatim from Appendix D.1', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Include legacy records')
    expect(text).toContain('Migrated paper licences with no service list')
    expect(text).toContain('All Caraga provinces')
    expect(text).toContain('3 of 5 provinces selected')
  })

  it('shows an indeterminate checkbox, which is the point of that sub-block', () => {
    const mixed = mount(SelectionSection).findAll('[role="checkbox"][aria-checked="mixed"]')
    expect(mixed.length).toBeGreaterThan(0)
  })

  it('carries the switch rows, including the disabled one', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Maintenance mode')
    expect(text).toContain('Enforced by policy — cannot be turned off')
  })

  it('carries the card options with their em dashes intact', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Clinical Laboratory — Limited')
    expect(text).toContain('Add / Modify')
  })

  it('shows the bulk rows and their licence numbers', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Trento Primary Care Facility')
    expect(text).toContain('16-015-2527-PCF-1')
    expect(text).toContain('Select all')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: FAIL — 6 gap markers found, expected 0.

- [ ] **Step 3: Wire the components in**

Drop the `DemoGap` import, import `ref` and the six components from `@/design-system`, and add the Appendix D.1 data **verbatim** — including the em dashes in `Clinical Laboratory — Limited` and `Enforced by policy — cannot be turned off`, and the middots in the sub-block labels, which already exist and must not change.

Each sub-block keeps its existing `DemoBlock` label and gains its component:

- `CHECKBOX · STATES` — four `Checkbox` rows: `Include legacy records` (off, with hint), `Only facilities I signed` (on, no hint), `All Caraga provinces` (indeterminate, with hint), `Archived facilities` (disabled and checked, with hint).
- `RADIO · LIST` — `Radio` with `As-plan` / `As-built` / `Not applicable` (disabled).
- `SWITCH · TAKES EFFECT AT ONCE` — three `Switch` rows, the last disabled.
- `CHECKBOX CARDS · MULTI` — three `CheckboxCard`s.
- `RADIO CARDS · SINGLE` — one `RadioCard` group with the three options.
- `BULK SELECTION — TABLE HEADER + ACTION BAR` — `BulkActionBar` with the three rows and the two actions.

Each interactive group needs its own `ref` for state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/demo/sections/__tests__/sections.spec.js`
Expected: PASS.

- [ ] **Step 5: Flip the manifest**

In `src/design-system/demo/chrome/sections.js`, set the `selection` entry's `complete` to `true`. Change only that entry.

**This activates the browser gate for this section.** `e2e/design-system.layout.spec.js` derives its complete-section list from this manifest, so `selection` immediately joins the zero-visible-gaps assertion, and its incomplete-section counterpart drops it. That is by design — the guard was rewritten to derive from the manifest precisely so this would happen automatically.

- [ ] **Step 6: Run all four gates**

Run: `npx vitest run && npm run verify:css && npm run lint && npm run test:e2e`

**This is the first section built with the browser gate watching.** If `test:e2e` fails, read the failure carefully before changing anything:

- A **card-overflow** failure means real content is spilling past its card at the page's true column width — a genuine defect of the kind that shipped twice before this gate existed. Report the section and element; do not widen the tolerance.
- A **gap-marker** failure on `selection` means the manifest says complete while a gap still renders.
- A **horizontal-scroll** failure means something in the new markup is wider than its container.

None of these should be made green by adjusting the test.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/demo/
git commit -m "feat(ds): render the Selection controls section and mark it complete"
```

---

## Self-Review

**Spec coverage.** Appendix C's `Selection controls` group has 16 rows. `Checkbox`, `Checkbox on`, `Checkbox off`, `Indeterminate`, `Disabled`, `Label` → Task 1. `Radio`, `Row gap` → Task 2. `Switch track`, `Track on / off`, `Knob` → Task 3. `Card`, `Card selected` → Task 4. `Bulk bar`, `Selected row` → Task 5. All 16 land in a task with an assertion. Appendix D.1's six sub-blocks' data lands in Task 6, with the em dashes asserted explicitly.

**Every value verified against the repo before writing.** All 15 colours map to real `tokens.css` definitions; three are renamed by the bridge (`bg-field`, `border-hairline`, `border-soft`) and are called out in a table, because that exact trap has cost two fix rounds. `--size-check` is 17px and bridges to `h-check`/`w-check` — I confirmed by production build that they emit CSS, since a bridge pointing at an undefined token is this project's signature failure.

**Type consistency.** `Checkbox` takes `modelValue`/`label`/`hint`/`disabled`/`indeterminate`; `Radio` and `RadioCard` share `options`/`modelValue`/`label`; `Switch` matches `Checkbox` minus `indeterminate`; `BulkActionBar` takes `rows`/`modelValue`/`actions` and emits `action`. Task 6 uses exactly those names.

**Values with no token**, each to be commented in place: the 1.8px border, the 8px radio dot, the 38×22 track and 2px padding, the 18px knob and its `.2` shadow, the **11px card radius**, the 11px/14px row gaps, the 10px label gap, and the 10px glyph. None belongs in the frozen token layer.

**One recorded divergence.** `Card selected`'s ring is specified as `.10`; `--ring-select` is `.12`. The token is used deliberately, because the artifact's own Stat-cards group writes this ring as the range `.10–.12`.

**Two whites that are not interchangeable.** The knob and unchecked box use `bg-surface`; the ✓ glyph uses `text-green-on-fill`. Identical in light mode, divergent in dark (`#161C26` vs `#0B1017`). Task 1 and Task 3 both assert the correct one.

**The browser gate runs once, in Task 6**, not per task — components are not on the page until then, so there is nothing for it to measure earlier.
