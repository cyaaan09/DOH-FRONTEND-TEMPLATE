# Design System Conformance Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the fifteen Phase 2 components into exact agreement with the source document's redlines, now captured in spec Appendix C, and add the component variants Phase 2 never built.

**Architecture:** Phase 2 built components from the spec's prose inventory (§7) and API conventions (§8) without the source's per-component redline tables, and drifted — grey notice text where the source uses the tone colour, weight 500 where it specifies 700, wrong radii and label scales. Appendix C now carries all 310 literal values and outranks the prose sections. Every change in this plan cites the redline row that requires it.

**Tech Stack:** Vue 3.5 (`<script setup>`), Vite 8, Tailwind CSS v4, Vitest 4 + `@vue/test-utils`

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — **Appendix C is the authority for every value in this plan.** Read the group named in each task before changing anything.

**Phase:** 2.5 of 5. Phases 1-2 are complete on branch `design-system` (123 tests). Phase 3 (~20 Ark-backed components) follows and will be built against Appendix C from the start.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **Appendix C wins.** Where this plan and the prose sections disagree with Appendix C, Appendix C is correct. If a redline contradicts a value in this plan, stop and report it rather than guessing.
- **No raw hex colours** in any file under `src/design-system/components/`. Every colour is a token utility or `var(--token)`.
- **No `dark:` variants** anywhere in `src/design-system/`.
- **No arbitrary type sizes.** Never `text-[13px]` — Task 1 adds the two scale entries this pass needs.
- **Dependency direction is one-way:** nothing under `src/design-system/` imports from `src/components/`.
- `tokens.css` is **no longer frozen** — Task 1 appends to it, and spec Appendix A.1 records exactly what was appended. Everything *above* the additions block stays byte-verbatim. Tasks 2-7 must not touch it.
- Geometry is theme-invariant.
- Test convention: `__tests__/` beside the code, `*.spec.js`, `describe`/`it`/`expect` from `vitest`.
- Run tests with `npx vitest run` — `test:unit` is watch mode and will hang.
- Commit messages carry **no** `Co-Authored-By` trailer.

## File Structure

```
src/design-system/styles/
  tokens.css          MODIFIED — appends 23 colours + --r-bar (Task 1)
  tokens.dark.css     MODIFIED — appends 2 dark counterparts (Task 1)
  theme.css           MODIFIED — bridges the additions + 2 type sizes (Task 1)
  base.css            MODIFIED — a:hover uses the real value (Task 6)
  __tests__/tokens.spec.js  MODIFIED — parity expectations (Task 1)

src/design-system/components/
  forms/Button.vue          weight, compact geometry, primary fill, ghost,
                            disabled, spinner, icon-only variant (Task 2)
  feedback/Chip.vue         neutral text, row gap, filled/service/filter (Task 3)
  feedback/DismissibleChip.vue  17px filled dismiss button (Task 3)
  forms/TextField.vue       error border, readonly, mono size (Task 4)
  forms/Textarea.vue        padding, readonly parity (Task 4)
  surfaces/StatCard.vue     radius, label scale, hint, padding, dot (Task 5)
  surfaces/Meter.vue        track height, caption (Task 5)
  feedback/Notice.vue       rebuilt against the redline (Task 6)
  feedback/Skeleton.vue     11px bars, radius 6, correct fill (Task 6)

src/design-system/demo/     MODIFIED — surfaces the new variants (Task 7)
```

---

### Task 1: Token and scale additions

Everything else in this plan depends on values that do not exist yet. Nothing visual changes here.

**Files:**
- Modify: `src/design-system/styles/tokens.css`, `tokens.dark.css`, `theme.css`
- Modify: `src/design-system/styles/__tests__/tokens.spec.js`, `__tests__/theme-bridge.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: 23 colour tokens, `--r-bar: 6px`, 2 dark tokens, their Tailwind bridges, and two type-scale entries `text-notice` (13px/1.35/400) and `text-stat-hint` (11.5px/400). Tasks 2-7 use these names.

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/styles/__tests__/tokens.spec.js`, inside the existing `describe('design tokens', ...)`:

```js
  it('carries the additions the source document uses but never tokenised', () => {
    // Spec Appendix A.1 — each of these is cited to the redline that needs it.
    for (const name of [
      'notice-border-green', 'notice-border-blue', 'notice-border-amber', 'notice-border-red',
      'toast-border-green', 'toast-border-amber', 'toast-border-blue',
      'toast-bg-amber', 'toast-bg-blue',
      'dot-green', 'border-dashed', 'dropzone-hover', 'surface-disabled',
      'red-800', 'green-link-hover',
      'nav-ink', 'item-mark', 'avatar-bg', 'logo-ink', 'separator', 'row-hover-strong',
      'r-bar',
    ]) {
      expect(light.has(name), `tokens.css is missing --${name}`).toBe(true)
    }
  })

  it('keeps the verbatim block intact above the additions', () => {
    // The additions are appended after a marker comment; everything above it
    // must still match spec Appendix A byte for byte.
    const css = readStyle('tokens.css')
    expect(css).toContain('/* --- additions: colours the source document uses but never tokenised --- */')
    const verbatim = css.split('/* --- additions')[0]
    expect(verbatim).toMatch(/^:root\s*\{/m)
    expect(verbatim).not.toContain('--notice-border-green')
  })

  it('gives the two dark-mode additions their counterparts', () => {
    for (const name of ['green-on-fill-red', 'red-fill-hover']) {
      expect(dark.has(name), `tokens.dark.css is missing --${name}`).toBe(true)
    }
  })
```

Add to `src/design-system/styles/__tests__/theme-bridge.spec.js`, inside its existing `describe`:

```js
  it('adds the two type sizes this pass needs', () => {
    expect(bridge.get('text-notice')).toBe('13px')
    expect(bridge.get('text-notice--line-height')).toBe('1.35')
    expect(bridge.get('text-stat-hint')).toBe('11.5px')
  })

  it('bridges the new colour additions', () => {
    for (const name of [
      'color-notice-border-green', 'color-notice-border-blue',
      'color-notice-border-amber', 'color-notice-border-red',
      'color-border-dashed', 'color-surface-disabled', 'color-dot-green',
      'radius-bar',
    ]) {
      expect(bridge.has(name), `theme.css is missing --${name}`).toBe(true)
    }
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/design-system/styles/__tests__/`
Expected: FAIL — `tokens.css is missing --notice-border-green`.

- [ ] **Step 3: Append the colour additions to tokens.css**

Append to the **end** of `src/design-system/styles/tokens.css`, after the closing `}` of the verbatim `:root` block. Copy this exactly — it is spec Appendix A.1:

```css

/* --- additions: colours the source document uses but never tokenised --- */
:root {
  /* Notice borders — redline "Notice label · 1px tone/200" */
  --notice-border-green: #A6E7C3;
  --notice-border-blue:  #B2DDFF;
  --notice-border-amber: #F7D9A0;
  --notice-border-red:   #F9C4BE;

  /* Toast borders and fills — redline "Success/Error/Warning/Info tone".
     The toast error border is #F5CDC7, already tokenised as --red-border. */
  --toast-border-green: #CDEAD6;
  --toast-border-amber: #F2E0BD;
  --toast-border-blue:  #D5E4FA;
  --toast-bg-amber:     #FFFBF2;
  --toast-bg-blue:      #F5F9FF;

  /* Status dot — redline "Success tone · dot #17A34A". Never behind white
     text: the chips redline warns it is 3.29:1 and fails AA. */
  --dot-green: #17A34A;

  /* Dashed panel — redline "Dashed panel · 1.6px dashed #CDD5E2" */
  --border-dashed: #CDD5E2;

  /* Dropzone hover fill — redline "Dropzone hover · bg #F7FCF8". This is ONE
     DIGIT off --green-tint-2 (#F7FCF9) and is very likely a typo in the source
     document; kept literal so we match it exactly. */
  --dropzone-hover: #F7FCF8;

  /* Selection controls — redline "Disabled · #E9EDF3" */
  --surface-disabled: #E9EDF3;

  /* Destructive confirm hover — redline "Confirm button · #B42318 → hover #96190F" */
  --red-800: #96190F;

  /* Link hover — the source's base CSS uses a:hover { color: #166534 }. */
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

- [ ] **Step 4: Append the dark counterparts**

Append to the end of `src/design-system/styles/tokens.dark.css`:

```css

/* --- additions: dark counterparts (spec Appendix A.1) --- */
[data-theme="dark"] {
  --green-on-fill-red: #2A0806;   /* dark destructive fill text, on #FF9B95 */
  --red-fill-hover:    #FFB2AD;   /* dark destructive hover */
}
```

- [ ] **Step 5: Bridge the additions and add the two type sizes**

In `src/design-system/styles/theme.css`, add to the **plain `@theme` block** (beside the existing type scale):

```css
  /* Notice body — redline "Notice text · 13px / 400 in tone colour". The
   * 1.35 line-height is tighter than --text-body's 1.55 because a notice is
   * one line inside a 32px shell. */
  --text-notice: 13px;
  --text-notice--line-height: 1.35;
  --text-notice--font-weight: 400;

  /* Stat card hint — redline "Hint · 11.5px / 400 #667085 · urgent 700 #B42318" */
  --text-stat-hint: 11.5px;
  --text-stat-hint--font-weight: 400;
```

And add to the **`@theme inline` block**, beside the other colour bridges:

```css
  /* additions — spec Appendix A.1 */
  --color-notice-border-green: var(--notice-border-green);
  --color-notice-border-blue: var(--notice-border-blue);
  --color-notice-border-amber: var(--notice-border-amber);
  --color-notice-border-red: var(--notice-border-red);
  --color-toast-border-green: var(--toast-border-green);
  --color-toast-border-amber: var(--toast-border-amber);
  --color-toast-border-blue: var(--toast-border-blue);
  --color-toast-bg-amber: var(--toast-bg-amber);
  --color-toast-bg-blue: var(--toast-bg-blue);
  --color-dot-green: var(--dot-green);
  --color-border-dashed: var(--border-dashed);
  --color-dropzone-hover: var(--dropzone-hover);
  --color-surface-disabled: var(--surface-disabled);
  --color-red-800: var(--red-800);
  --color-green-link-hover: var(--green-link-hover);
  --color-nav-ink: var(--nav-ink);
  --color-item-mark: var(--item-mark);
  --color-avatar-bg: var(--avatar-bg);
  --color-logo-ink: var(--logo-ink);
  --color-separator: var(--separator);
  --color-row-hover-strong: var(--row-hover-strong);
  --radius-bar: var(--r-bar);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/design-system/styles/__tests__/`
Expected: PASS.

If the existing token→bridge coverage test fails naming the new tokens, they are correctly bridged and the allowlist simply needs no change — but if it names one you did NOT bridge, bridge it rather than widening the allowlist.

- [ ] **Step 7: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`
Expected: all green.

```bash
git add src/design-system/styles/
git commit -m "feat(ds): add the 23 colours and 2 type sizes the redlines require"
```

---

### Task 2: Button conformance

Appendix C group: **Buttons** (12 rows). Read it before starting.

**Files:**
- Modify: `src/design-system/components/forms/Button.vue`
- Modify: `src/design-system/components/forms/__tests__/Button.spec.js`

**Interfaces:**
- Consumes: Task 1's tokens.
- Produces: `<Button variant size busy disabled type>` with `size` gaining `icon`. `variant` and `size` values are otherwise unchanged, so no other task's markup breaks.

The redline requires these changes from the current implementation:

| Redline | Current | Required |
|---|---|---|
| `Default · 38px · pad 0 16px · radius 9px · 13.5px / 700` | `font-medium` (500) | `font-bold` (700) |
| `Compact · 34px · pad 0 14px · radius 8px · 12.5px` | `px-3` (12px), radius 9px, 13.5px | `px-3.5` (14px), `rounded-control` (8px), 12.5px |
| `Icon only · 34×34px · radius 8px` | missing | new `size="icon"` |
| `Primary · #177236 bg` | `var(--grad-primary)` gradient | flat `--green-fill` |
| `Ghost · transparent · #15803D / 700 · hover #F2FAF4` | `text-ink-600`, hover `bg-surface-muted` | `text-green-text`, hover `bg-green-tint` |
| `Disabled · #F7F9FC bg · 1px #E4E8EF · #B9C1D1` | `opacity-60` | explicit surface, border and text |
| `Pending · #125A2B + 12px spinner, 2px track rgba(255,255,255,.4)` | 13px, `currentColor` | 12px, white-40% track |

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/components/forms/__tests__/Button.spec.js`:

```js
describe('Button — Appendix C conformance', () => {
  it('sets label weight to 700, not 500', () => {
    // Redline "Default · 38px · pad 0 16px · radius 9px · 13.5px / 700"
    const classes = mount(Button).classes()
    expect(classes).toContain('font-bold')
    expect(classes).not.toContain('font-medium')
  })

  it('gives compact its own padding, radius and size', () => {
    // Redline "Compact · 34px · pad 0 14px · radius 8px · 12.5px"
    const classes = mount(Button, { props: { size: 'compact' } }).classes()
    expect(classes).toContain('h-compact')
    expect(classes).toContain('px-3.5')
    expect(classes).toContain('rounded-control')
    expect(classes).toContain('text-field-label')
    expect(classes).not.toContain('rounded-field')
  })

  it('supports a square icon-only size', () => {
    // Redline "Icon only · 34×34px · radius 8px"
    const classes = mount(Button, { props: { size: 'icon' } }).classes()
    expect(classes).toContain('h-compact')
    expect(classes).toContain('w-compact')
    expect(classes).toContain('rounded-control')
  })

  it('fills primary with the flat green, not the gradient', () => {
    // Redline "Primary · #177236 bg · #FFF text · shadow 0 1px 2px rgba(20,80,40,.25)"
    expect(mount(Button).classes()).toContain('bg-green-fill')
  })

  it('colours ghost green on a green tint, not grey', () => {
    // Redline "Ghost · transparent · #15803D / 700 · hover #F2FAF4"
    const classes = mount(Button, { props: { variant: 'ghost' } }).classes()
    expect(classes).toContain('text-green-text')
    expect(classes).toContain('hover:bg-green-tint')
    expect(classes).not.toContain('text-ink-600')
  })

  it('gives disabled its own surface, border and text rather than opacity', () => {
    // Redline "Disabled · #F7F9FC bg · 1px #E4E8EF · #B9C1D1"
    const classes = mount(Button, { props: { disabled: true } }).classes()
    expect(classes).toContain('disabled:border')
    expect(classes).toContain('disabled:bg-surface-input')
    expect(classes).toContain('disabled:border-hairline')
    expect(classes).toContain('disabled:text-ink-200')
    expect(classes).not.toContain('disabled:opacity-60')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/forms/__tests__/Button.spec.js`
Expected: FAIL — expected `font-bold`, got `font-medium`.

- [ ] **Step 3: Apply the conformance changes**

Replace the `<script setup>` maps and the `<template>` class strings in `src/design-system/components/forms/Button.vue`:

```js
const SIZES = {
  // Redline "Default · 38px · pad 0 16px · radius 9px · 13.5px / 700"
  default: 'h-field px-4 rounded-field text-body',
  // Redline "Compact · 34px · pad 0 14px · radius 8px · 12.5px"
  compact: 'h-compact px-3.5 rounded-control text-field-label',
  // Redline "Icon only · 34×34px · radius 8px"
  icon: 'h-compact w-compact rounded-control text-field-label',
  // Not in the redline table; the source's responsive group specifies 44px
  // for the one primary action on a mobile-width form.
  touch: 'h-touch px-5 rounded-field text-body',
}

const VARIANTS = {
  // Redline "Primary · #177236 bg · #FFF text · shadow 0 1px 2px rgba(20,80,40,.25)"
  primary: 'btn--primary bg-green-fill text-green-on-fill',
  // Redline "Secondary · #FFF bg · 1px #D5DBE6 · #344054 / 500" + "hover #F4F6FA"
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted',
  // Redline "Destructive · #FFF bg · 1px #E4A49C · #B42318 · hover #FEF3F2"
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50',
  // Redline "Ghost · transparent · #15803D / 700 · hover #F2FAF4"
  ghost: 'text-green-text hover:bg-green-tint',
}
```

Update the `size` validator to include `'icon'`:

```js
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'icon', 'touch'].includes(value),
  },
```

Replace the `<button>` class string — note `rounded-field` and `text-body` moved into `SIZES` because compact and icon override them:

```html
  <button
    class="btn inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed disabled:border disabled:bg-surface-input disabled:border-hairline disabled:text-ink-200"
    :class="[sizeClass, variantClass]"
    :type="type"
    :disabled="disabled || busy"
    :aria-busy="busy || undefined"
  >
```

Replace the `<style scoped>` block:

```css
<style scoped>
/* Shadow, focus ring and the spinner keyframe have no utility namespace —
 * spec §4.2 routes those through var() here. The primary FILL is a flat
 * --green-fill utility now, not the gradient: redline "Primary · #177236 bg". */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.btn--primary {
  box-shadow: var(--sh-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--green-fill-hover);
}

/* Redline "Pending · #125A2B + 12px spinner, 2px track rgba(255,255,255,.4)" */
.btn__spinner {
  width: 12px;
  height: 12px;
  flex: none;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 0.4);
  border-top-color: currentColor;
  animation: spin 600ms linear infinite;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/forms/__tests__/Button.spec.js`
Expected: PASS — the 7 original tests plus the 6 new ones.

The original test asserting `h-field` on the default button still passes because `SIZES.default` still contains it.

- [ ] **Step 5: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/forms/
git commit -m "fix(ds): conform Button to the Appendix C redlines"
```

---

### Task 3: Chip family conformance and missing variants

Appendix C group: **Chips** (16 rows). Read it before starting. Five of those sixteen rows describe chip kinds that do not exist yet.

**Files:**
- Modify: `src/design-system/components/feedback/Chip.vue`, `DismissibleChip.vue`
- Create: `src/design-system/components/feedback/FilterChip.vue`
- Modify: `src/design-system/components/feedback/__tests__/Chip.spec.js`
- Modify: `src/design-system/index.js`

**Interfaces:**
- Consumes: `TONES`, `DEFAULT_TONE`, `TONE_TEXT` from `../tones`; Task 1's tokens.
- Produces: `<Chip tone dot variant>` where `variant` ∈ `tint | filled | service` (default `tint`); `<FilterChip selected>` emitting `toggle`; `<DismissibleChip chipKey value>` unchanged in API.

**A source conflict, already ruled on — do not treat it as drift:** the redline says `Gap in row · 7px`, but the source's own token block defines `--gap-chip-row: 8px`. The two contradict each other. **Keep the 8px token.** The token block is what the source tells implementers to build against ("build every component against the CSS variables"), `--gap-chip-row` sits in the frozen verbatim region, and 1px is imperceptible. Do not change `ChipGroup`.

| Redline | Current | Required |
|---|---|---|
| `Closed · #EEF1F6 bg · #5A6577 text (#667085 is 4.39:1 — fails)` | `text-ink-600` (#475467) | `text-text-header` (#5A6577) |
| `Active (filled) · #177236 bg · #FFFFFF text` | missing | `variant="filled"` |
| `Service chip · 12px/400 · 5px 12px · #FFF bg · 1px #DDE2EA · #475467` | missing | `variant="service"` |
| `Filter chip on · #177236 bg · #FFF text · 7px 13px · shadow` | missing | `<FilterChip selected>` |
| `Filter chip off · #FFF bg · 1px #D5DBE6 · #475467 / 500` | missing | `<FilterChip>` |
| `Dismiss × · 17px circle · #E4E8EF bg → #D5DBE6 hover · glyph #475467` | 14px, transparent, `--ink-400` | 17px, filled, `--ink-600` |

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/components/feedback/__tests__/Chip.spec.js`:

```js
import FilterChip from '../FilterChip.vue'

describe('Chip — Appendix C conformance', () => {
  it('uses the accessible neutral text colour', () => {
    // Redline "Closed · #EEF1F6 bg · #5A6577 text (#667085 is 4.39:1 — fails)"
    const classes = mount(Chip, { props: { tone: 'neutral' } }).classes()
    expect(classes).toContain('text-text-header')
    expect(classes).not.toContain('text-ink-600')
  })

  it('supports a filled variant', () => {
    // Redline "Active (filled) · #177236 bg · #FFFFFF text = 6.01:1"
    const classes = mount(Chip, { props: { variant: 'filled' } }).classes()
    expect(classes).toContain('bg-green-fill')
    expect(classes).toContain('text-green-on-fill')
  })

  it('supports a service variant', () => {
    // Redline "Service chip · 12px/400 · 5px 12px · #FFF bg · 1px #DDE2EA · #475467"
    const classes = mount(Chip, { props: { variant: 'service' } }).classes()
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-soft')
    expect(classes).toContain('text-ink-600')
    expect(classes).toContain('text-hint')
  })

  it('falls back to the tint variant for an unknown value', () => {
    expect(mount(Chip, { props: { variant: 'nonsense' } }).classes()).toContain('bg-neutral-100')
  })
})

describe('FilterChip', () => {
  it('renders unselected by default', () => {
    // Redline "Filter chip off · #FFF bg · 1px #D5DBE6 · #475467 / 500"
    const classes = mount(FilterChip, { slots: { default: 'Hospital' } }).classes()
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-field')
    expect(classes).toContain('text-ink-600')
  })

  it('fills green when selected', () => {
    // Redline "Filter chip on · #177236 bg · #FFF text · 7px 13px · shadow"
    const classes = mount(FilterChip, { props: { selected: true } }).classes()
    expect(classes).toContain('bg-green-fill')
    expect(classes).toContain('text-green-on-fill')
  })

  it('is a real button and emits toggle when pressed', async () => {
    const wrapper = mount(FilterChip, { slots: { default: 'Hospital' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    await wrapper.trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('reports its selected state to assistive tech', () => {
    expect(mount(FilterChip, { props: { selected: true } }).attributes('aria-pressed')).toBe('true')
    expect(mount(FilterChip).attributes('aria-pressed')).toBe('false')
  })
})

describe('DismissibleChip — Appendix C conformance', () => {
  it('gives the dismiss button a filled 17px circle', () => {
    // Redline "Dismiss × · 17px circle · #E4E8EF bg → #D5DBE6 hover · glyph #475467"
    const button = mount(DismissibleChip, {
      props: { chipKey: 'Status:', value: 'Active' },
    }).get('button')
    expect(button.classes()).toContain('chip__remove')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Chip.spec.js`
Expected: FAIL — cannot resolve `../FilterChip.vue`.

- [ ] **Step 3: Update the shared tone table**

In `src/design-system/components/tones.js`, change the neutral entry only:

```js
export const TONE_TEXT = {
  // Redline "Closed · #EEF1F6 bg · #5A6577 text" — the chips redline
  // explicitly rejects #667085 (--text-meta) as 4.39:1, failing AA.
  neutral: 'text-text-header',
  green: 'text-green-text',
  amber: 'text-amber-text',
  red: 'text-red-700',
  blue: 'text-blue-700',
  violet: 'text-violet-700',
}
```

This also changes `Notice`'s neutral pill colour, which is correct — both derive from the same redline.

- [ ] **Step 4: Add the variants to Chip**

Replace `src/design-system/components/feedback/Chip.vue`'s script and template:

```vue
<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONE_TEXT, TONES } from '../tones'

const VARIANTS = ['tint', 'filled', 'service']

const props = defineProps({
  tone: {
    type: String,
    default: DEFAULT_TONE,
    validator: (value) => TONES.includes(value),
  },
  variant: {
    type: String,
    default: 'tint',
    validator: (value) => ['tint', 'filled', 'service'].includes(value),
  },
  dot: { type: Boolean, default: false },
})

// Redline "Approved/Pending/Returned/Closed/Online/Add-Modify" — tint background
// per tone, paired with the shared TONE_TEXT foreground.
const BACKGROUNDS = {
  neutral: 'bg-neutral-100',
  green: 'bg-green-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
  blue: 'bg-blue-100',
  violet: 'bg-violet-100',
}

const variantClass = computed(() => {
  const variant = VARIANTS.includes(props.variant) ? props.variant : 'tint'
  // Redline "Active (filled) · #177236 bg · #FFFFFF text = 6.01:1"
  if (variant === 'filled') return 'chip--pad bg-green-fill text-green-on-fill text-chip'
  // Redline "Service chip · 12px/400 · 5px 12px · #FFF bg · 1px #DDE2EA · #475467"
  if (variant === 'service') {
    return 'chip--service bg-surface border border-soft text-ink-600 text-hint'
  }
  const tone = TONES.includes(props.tone) ? props.tone : DEFAULT_TONE
  return `chip--pad ${BACKGROUNDS[tone]} ${TONE_TEXT[tone]} text-chip`
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-pill whitespace-nowrap"
    :class="[variantClass, dot ? 'chip--dotted' : '']"
  >
    <span v-if="dot" data-dot class="chip__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
/* --chip-pad (3px 9px) has no utility namespace — spec §4.2. */
.chip--pad {
  padding: var(--chip-pad);
}

/* Redline "Service chip · 5px 12px" — its own padding, not --chip-pad. */
.chip--service {
  padding: 5px 12px;
}

/* Redline "Dot · 6px circle, gap 6px, left pad 7px" — a dotted chip loses
 * 2px of its left padding so the dot sits closer to the edge. */
.chip--dotted.chip--pad {
  padding-left: 7px;
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

- [ ] **Step 5: Create FilterChip**

Create `src/design-system/components/feedback/FilterChip.vue`:

```vue
<script setup>
defineProps({
  selected: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    class="filter-chip inline-flex items-center rounded-pill text-chip whitespace-nowrap transition-colors"
    :class="
      selected
        ? 'filter-chip--on bg-green-fill text-green-on-fill'
        : 'bg-surface border border-field text-ink-600'
    "
    :aria-pressed="selected ? 'true' : 'false'"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped>
/* Redline "Filter chip on · 7px 13px · shadow 0 1px 2px rgba(20,80,40,.24)"
 * and "Filter chip off · #FFF bg · 1px #D5DBE6 · #475467 / 500". The
 * selected shadow has no utility namespace — spec §4.2. */
.filter-chip {
  padding: 7px 13px;
  cursor: pointer;
}

.filter-chip--on {
  box-shadow: 0 1px 2px rgb(20 80 40 / 0.24);
}

.filter-chip:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
```

- [ ] **Step 6: Conform the dismiss button**

In `src/design-system/components/feedback/DismissibleChip.vue`, replace the `.chip__remove` rules:

```css
/* Redline "Dismiss × · 17px circle · #E4E8EF bg → #D5DBE6 hover · glyph #475467
 * (4.05:1 at #667085 fails)". A filled circle, not a bare glyph. */
.chip__remove {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: var(--border-card);
  color: var(--ink-600);
  cursor: pointer;
  line-height: 1;
}

.chip__remove:hover {
  background: var(--border-field);
}

.chip__remove:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
```

- [ ] **Step 7: Export FilterChip, run tests**

Add to `src/design-system/index.js`:

```js
export { default as FilterChip } from './components/feedback/FilterChip.vue'
```

Run: `npx vitest run src/design-system/components/feedback/__tests__/Chip.spec.js`
Expected: PASS.

**One existing test will now fail and must be updated, not deleted:** the `Chip` tone test asserting `text-ink-600` for neutral. Change it to `text-text-header` — the redline requires the change, and the assertion is still doing its job.

- [ ] **Step 8: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/ src/design-system/index.js
git commit -m "fix(ds): conform the Chip family and add filled, service and filter variants"
```

---

### Task 4: Text field conformance

Appendix C group: **Text fields** (14 rows). Read it before starting.

**Files:**
- Modify: `src/design-system/components/forms/TextField.vue`, `Textarea.vue`
- Modify: `src/design-system/components/forms/__tests__/TextField.spec.js`

**Interfaces:**
- Consumes: Task 1's tokens.
- Produces: no API change — same props, same events. Only the rendered classes change.

| Redline | Current | Required |
|---|---|---|
| `Error · border #B42318 · hint #B42318` | `border-red-border` (#F5CDC7, pale pink) | `border-red-700` |
| `Read only · bg #F7F9FC · border #E4E8EF · text #8A94A6` | keeps `border-field`, `text-ink-500` | `border-hairline`, `text-ink-400` |
| `Label · 12.5px / 500 · #344054 · 6px below` | 6px via wrapper gap ✓ | explicit `mb-1.5` |
| `Hint · 12px / 400 · #667085 · 5px above` | 6px via wrapper gap | explicit `mt-1.25` (5px) |
| `Textarea · pad 11px 12px · line-height 1.55 · resize vertical` | `px-3 py-2` (12/8px) | `px-3 py-2.75` (12/11px) |

`Value type · 13.5px / 400 · #1E2532` and `Mono values · JetBrains Mono 13.5px / 400` are already correct — `text-body` is 13.5/400 and the `mono` prop adds `font-mono` without changing size.

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/components/forms/__tests__/TextField.spec.js`:

```js
describe('TextField — Appendix C conformance', () => {
  it('uses the strong red for an error border, not the pale tint', () => {
    // Redline "Error · border #B42318 · hint #B42318"
    const classes = mount(TextField, { props: { label: 'A', error: 'Required' } })
      .get('input')
      .classes()
    expect(classes).toContain('border-red-700')
    expect(classes).not.toContain('border-red-border')
  })

  it('gives read-only fields the hairline border and muted text', () => {
    // Redline "Read only · bg #F7F9FC · border #E4E8EF · text #8A94A6"
    const classes = mount(TextField, { props: { label: 'A', readonly: true } })
      .get('input')
      .classes()
    expect(classes).toContain('bg-surface-input')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('text-ink-400')
  })

  it('spaces the label 6px above and the message 5px below', () => {
    // Redline "Label · 6px below" and "Hint · 5px above"
    const wrapper = mount(TextField, { props: { label: 'A', hint: 'h' } })
    expect(wrapper.get('label').classes()).toContain('mb-1.5')
    expect(wrapper.get('p').classes()).toContain('mt-1.25')
  })
})

describe('Textarea — Appendix C conformance', () => {
  it('uses the taller textarea padding', () => {
    // Redline "Textarea · pad 11px 12px · line-height 1.55 · resize vertical"
    const classes = mount(Textarea, { props: { label: 'A' } }).get('textarea').classes()
    expect(classes).toContain('py-2.75')
    expect(classes).toContain('px-3')
    expect(classes).toContain('resize-y')
  })

  it('matches the read-only treatment TextField uses', () => {
    const classes = mount(Textarea, { props: { label: 'A', readonly: true } })
      .get('textarea')
      .classes()
    expect(classes).toContain('bg-surface-input')
    expect(classes).toContain('border-hairline')
    expect(classes).toContain('text-ink-400')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/forms/__tests__/TextField.spec.js`
Expected: FAIL — expected `border-red-700`, got `border-red-border`.

- [ ] **Step 3: Conform TextField**

In `src/design-system/components/forms/TextField.vue`, change the wrapper from a gap to explicit margins and fix the state classes.

Replace the wrapper `<div>` and `<label>`:

```html
  <div class="flex flex-col">
    <label :for="id" class="text-field-label text-ink-700 mb-1.5">{{ label }}</label>
```

Replace the input's `:class` binding:

```js
        :class="[
          // Redline "Error · border #B42318" — the strong red, not the pale
          // --red-border tint used for toast and notice outlines.
          error ? 'border-red-700' : 'border-field',
          // Redline "Read only · bg #F7F9FC · border #E4E8EF · text #8A94A6"
          disabled || readonly
            ? 'bg-surface-input border-hairline text-ink-400'
            : 'bg-surface text-ink-900',
          mono ? 'font-mono' : '',
          suffix ? 'pr-14' : '',
        ]"
```

Note `text-ink-900` moves out of the static class string and into the enabled branch, so the read-only branch can override it.

Replace the message `<p>`:

```html
    <p
      v-if="message"
      :id="messageId"
      class="text-hint mt-1.25"
      :class="error ? 'text-red-700' : 'text-text-meta'"
    >
      {{ message }}
    </p>
```

Remove `text-ink-900` from the input's static class list — it is now conditional.

- [ ] **Step 4: Conform Textarea**

Apply the same three changes to `src/design-system/components/forms/Textarea.vue`: `mb-1.5` on the label, `mt-1.25` on the hint, and the state classes on the `<textarea>`. Its padding becomes `px-3 py-2.75` and it keeps `resize-y`:

```html
    <textarea
      :id="id"
      class="field__input w-full resize-y rounded-field border px-3 py-2.75 text-body transition-colors"
      :class="[
        error ? 'border-red-700' : 'border-field',
        disabled || readonly
          ? 'bg-surface-input border-hairline text-ink-400'
          : 'bg-surface text-ink-900',
      ]"
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/forms/__tests__/TextField.spec.js`
Expected: PASS.

The existing read-only test asserting `bg-surface-input` still passes; the one asserting `text-ink-500` must be updated to `text-ink-400` — the redline requires it.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/forms/
git commit -m "fix(ds): conform TextField and Textarea to the Appendix C redlines"
```

---

### Task 5: StatCard and Meter conformance

Appendix C group: **Stat cards & meters** (12 rows). Read it before starting.

**Files:**
- Modify: `src/design-system/components/surfaces/StatCard.vue`, `Meter.vue`
- Modify: `src/design-system/components/surfaces/__tests__/StatCard.spec.js`

**Interfaces:**
- Consumes: Task 1's `text-stat-hint`.
- Produces: `<StatCard label value hint muted dot urgent>` — `dot` (String tone name, optional) and `urgent` (Boolean) are new. `<Meter value max label caption>` — `caption` is new.

| Redline | Current | Required |
|---|---|---|
| `Card · pad 14px 16px · radius 12px` | `p-4` (16px), `rounded-card` (14px) | `px-4 py-3.5`, `rounded-panel` (12px) |
| `Label · 12px / 500 #667085 · dot 8px · gap 7px` | `text-column-header` (10.5/700) + `uppercase` | `text-hint font-medium text-text-meta`, no uppercase |
| `Figure · 23px / 700 / -0.01em · 5px above` | `gap-1` on wrapper | `mt-1.25` (5px) |
| `Hint · 11.5px / 400 #667085 · urgent 700 #B42318` | `text-hint` (12px) | `text-stat-hint`, `urgent` variant |
| `Muted card · #FBFCFE bg · figure #5A6577` | figure stays `text-ink-900` | muted figure becomes `text-text-header` |
| `Meter track · 6px · radius 999px · #EEF1F6` | `bg-surface-muted` (#F4F6FA) | `bg-neutral-100` (#EEF1F6) |
| `Meter caption · 12px / 400 #667085 · value 700 #15803D · 7px above` | missing | optional `caption` |

- [ ] **Step 1: Write the failing test**

Add to `src/design-system/components/surfaces/__tests__/StatCard.spec.js`:

```js
describe('StatCard — Appendix C conformance', () => {
  it('uses the panel radius and the redlined padding', () => {
    // Redline "Card · pad 14px 16px · radius 12px · #FFF · 1px #E4E8EF"
    const classes = mount(StatCard, { props: { label: 'A', value: '1' } }).classes()
    expect(classes).toContain('rounded-panel')
    expect(classes).toContain('px-4')
    expect(classes).toContain('py-3.5')
    expect(classes).not.toContain('rounded-card')
  })

  it('renders the label at 12px medium, not as an uppercase column header', () => {
    // Redline "Label · 12px / 500 #667085"
    const label = mount(StatCard, { props: { label: 'A', value: '1' } }).get('[data-label]')
    expect(label.classes()).toContain('text-hint')
    expect(label.classes()).toContain('font-medium')
    expect(label.classes()).not.toContain('text-column-header')
    expect(label.classes()).not.toContain('uppercase')
  })

  it('renders the hint at 11.5px', () => {
    // Redline "Hint · 11.5px / 400 #667085 · urgent 700 #B42318"
    const hint = mount(StatCard, { props: { label: 'A', value: '1', hint: 'h' } }).get('[data-hint]')
    expect(hint.classes()).toContain('text-stat-hint')
  })

  it('turns the hint red and bold when urgent', () => {
    const hint = mount(StatCard, {
      props: { label: 'A', value: '1', hint: '2 due within 7 days', urgent: true },
    }).get('[data-hint]')
    expect(hint.classes()).toContain('text-red-700')
    expect(hint.classes()).toContain('font-bold')
  })

  it('mutes the figure colour on a muted card', () => {
    // Redline "Muted card · #FBFCFE bg · figure #5A6577 (data, so AA applies)"
    const figure = mount(StatCard, {
      props: { label: 'A', value: '1', muted: true },
    }).get('[data-figure]')
    expect(figure.classes()).toContain('text-text-header')
  })

  it('renders an optional tone dot beside the label', () => {
    // Redline "Label · dot 8px · gap 7px"
    expect(
      mount(StatCard, { props: { label: 'A', value: '1', dot: 'green' } })
        .find('[data-dot]')
        .exists(),
    ).toBe(true)
    expect(mount(StatCard, { props: { label: 'A', value: '1' } }).find('[data-dot]').exists()).toBe(
      false,
    )
  })
})

describe('Meter — Appendix C conformance', () => {
  it('uses the redlined track fill', () => {
    // Redline "Meter track · 6px · radius 999px · #EEF1F6".
    // The track is no longer the component root — a caption may sit above it —
    // so query the progressbar element rather than the wrapper.
    const track = mount(Meter, { props: { value: 50, label: 'A' } }).get('[role="progressbar"]')
    expect(track.classes()).toContain('bg-neutral-100')
    expect(track.classes()).not.toContain('bg-surface-muted')
  })

  it('renders an optional caption', () => {
    // Redline "Meter caption · 12px / 400 #667085 · value 700 #15803D · 7px above"
    const wrapper = mount(Meter, { props: { value: 50, label: 'A', caption: 'Uploaded' } })
    expect(wrapper.text()).toContain('Uploaded')
    expect(wrapper.find('[data-caption]').exists()).toBe(true)
  })

  it('omits the caption element when there is none', () => {
    expect(
      mount(Meter, { props: { value: 50, label: 'A' } }).find('[data-caption]').exists(),
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/StatCard.spec.js`
Expected: FAIL — expected `rounded-panel`, got `rounded-card`.

- [ ] **Step 3: Conform StatCard**

Replace `src/design-system/components/surfaces/StatCard.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONES } from '../tones'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  muted: { type: Boolean, default: false },
  // Redline "Label · dot 8px · gap 7px" — an optional status dot.
  dot: { type: String, default: '' },
  // Redline "Hint · urgent 700 #B42318"
  urgent: { type: Boolean, default: false },
})

// The dot's fill per tone. --dot-green is the source's dedicated dot colour;
// the redline warns it is 3.29:1 and must never sit behind white text.
const DOTS = {
  neutral: 'bg-ink-300',
  green: 'bg-dot-green',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  blue: 'bg-blue-700',
  violet: 'bg-violet-700',
}

const dotClass = computed(() => DOTS[props.dot] ?? DOTS[DEFAULT_TONE])
const showDot = computed(() => TONES.includes(props.dot))
</script>

<template>
  <div
    class="flex flex-col rounded-panel border border-hairline px-4 py-3.5 shadow-card"
    :class="muted ? 'bg-surface-card-muted' : 'bg-surface'"
  >
    <!-- Redline "Label · 12px / 500 #667085 · dot 8px · gap 7px" -->
    <span data-label class="flex items-center text-hint font-medium text-text-meta">
      <span
        v-if="showDot"
        data-dot
        class="statcard__dot"
        :class="dotClass"
        aria-hidden="true"
      />
      {{ label }}
    </span>

    <!-- Redline "Figure · 23px / 700 / -0.01em · 5px above" -->
    <span
      data-figure
      class="text-card-figure mt-1.25"
      :class="muted ? 'text-text-header' : 'text-ink-900'"
      >{{ value }}</span
    >

    <!-- Redline "Hint · 11.5px / 400 #667085 · urgent 700 #B42318" -->
    <span
      v-if="hint"
      data-hint
      class="text-stat-hint mt-1"
      :class="urgent ? 'text-red-700 font-bold' : 'text-text-meta'"
      >{{ hint }}</span
    >
  </div>
</template>

<style scoped>
/* Redline "dot 8px · gap 7px" — 8px and 7px have no utility steps. */
.statcard__dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  margin-right: 7px;
}
</style>
```

- [ ] **Step 4: Conform Meter**

In `src/design-system/components/surfaces/Meter.vue`, add the `caption` prop, wrap the track so a caption can sit above it, and fix the track fill.

Add to `defineProps`:

```js
  // Redline "Meter caption · 12px / 400 #667085 · value 700 #15803D · 7px above"
  caption: { type: String, default: '' },
```

Replace the template:

```html
<template>
  <div>
    <p v-if="caption" data-caption class="meter__caption text-hint text-text-meta">
      {{ caption }}
      <span class="font-bold text-green-text">{{ clampedValue }}</span>
    </p>

    <!-- Redline "Meter track · 6px · radius 999px · #EEF1F6" -->
    <div
      class="meter h-1.5 w-full overflow-hidden rounded-pill bg-neutral-100"
      role="progressbar"
      :aria-valuenow="clampedValue"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label"
    >
      <div data-fill class="meter__fill h-full rounded-pill" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>
```

Add to the `<style scoped>` block:

```css
/* Redline "Meter caption · 7px above" — 7px has no utility step. */
.meter__caption {
  margin: 0 0 7px;
}
```

**Note:** the `role="progressbar"` element is no longer the component root. The existing ARIA tests use `wrapper.get('[role="progressbar"]')` and keep working; the new track-fill test asserts on `.classes()` of the root, so it must be changed to query the progressbar element instead. Update it rather than deleting it.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/surfaces/__tests__/StatCard.spec.js`
Expected: PASS.

- [ ] **Step 6: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/surfaces/
git commit -m "fix(ds): conform StatCard and Meter to the Appendix C redlines"
```

---

### Task 6: Notice rebuild, Skeleton, and the link hover

Appendix C groups: **Toasts & notices** (rows "Notice shell", "Notice label", "Notice text", "Notice fills") and **Dialog, empty & loading** (row "Skeleton bar"). Read both.

`Notice` diverges on every dimension and is rewritten rather than patched.

**Files:**
- Modify: `src/design-system/components/feedback/Notice.vue`, `Skeleton.vue`
- Modify: `src/design-system/styles/base.css`
- Modify: `src/design-system/components/feedback/__tests__/Notice.spec.js`

**Interfaces:**
- Consumes: Task 1's `--notice-border-*` tokens and `text-notice`; `TONES` / `DEFAULT_TONE` / `TONE_TEXT` from `../tones`.
- Produces: `<Notice tone label>` — unchanged API, entirely different rendering.

| Redline | Current | Required |
|---|---|---|
| `Notice shell · min-h 32px · radius 16px · pad 4px 10px 4px 4px · gap 12px` | `px-3 py-2`, gap 10px, **bordered** | `py-1 pr-2.5 pl-1`, gap 12px, **no border**, `min-h-notice` |
| `Notice label · 24px · radius 16px · pad 0 12px · 12.5px / 400 · 1px tone/200` | white fill, radius 999, 11px/700 | `h-6 px-3 rounded-notice`, transparent, `text-field-label font-normal`, tone border |
| `Notice text · 13px / 400 in tone colour` | `text-body` (13.5/1.55) **grey** | `text-notice` in the **tone colour** |
| `Notice fills · #ECFDF3 · #EFF8FF · #FFFAEB · #FEF3F2` | tone/50 ✓ mostly | unchanged |
| `Skeleton bar · 11px · radius 6px · #EEF1F6 · 3 rows max` | `h-4` (16px), `rounded-tile` (7px), `bg-surface-muted` | `h-2.75`, `rounded-bar`, `bg-neutral-100`, clamped to 3 |

- [ ] **Step 1: Write the failing test**

Replace the whole `describe('Notice', ...)` block in `src/design-system/components/feedback/__tests__/Notice.spec.js` with:

```js
describe('Notice', () => {
  it('renders its label pill and body', () => {
    const wrapper = mount(Notice, {
      props: { tone: 'red', label: 'Error' },
      slots: { default: 'Inspection is overdue by 4 days.' },
    })
    expect(wrapper.text()).toContain('Error')
    expect(wrapper.text()).toContain('Inspection is overdue by 4 days.')
  })

  it('colours the body text in the tone, not grey', () => {
    // Redline "Notice text · 13px / 400 in tone colour on tone/50"
    const body = mount(Notice, { props: { tone: 'red', label: 'Error' } }).get('[data-body]')
    expect(body.classes()).toContain('text-red-700')
    expect(body.classes()).toContain('text-notice')
    expect(body.classes()).not.toContain('text-ink-700')
  })

  it('gives the shell no border and the redlined geometry', () => {
    // Redline "Notice shell · min-h 32px · radius 16px · pad 4px 10px 4px 4px · gap 12px"
    const classes = mount(Notice, { props: { tone: 'green', label: 'Success' } }).classes()
    expect(classes).toContain('min-h-notice')
    expect(classes).toContain('rounded-notice')
    expect(classes).toContain('gap-3')
    expect(classes).toContain('pl-1')
    expect(classes).toContain('pr-2.5')
    expect(classes).not.toContain('border')
  })

  it('outlines the pill in the tone border on a transparent fill', () => {
    // Redline "Notice label · 24px · radius 16px · pad 0 12px · 12.5px / 400 · 1px tone/200"
    const pill = mount(Notice, { props: { tone: 'green', label: 'Success' } }).get('[data-pill]')
    expect(pill.classes()).toContain('h-6')
    expect(pill.classes()).toContain('px-3')
    expect(pill.classes()).toContain('rounded-notice')
    expect(pill.classes()).toContain('border-notice-border-green')
    expect(pill.classes()).toContain('text-field-label')
    expect(pill.classes()).toContain('font-normal')
    expect(pill.classes()).not.toContain('bg-surface')
  })

  it('fills each tone from the tone/50 scale', () => {
    // Redline "Notice fills · #ECFDF3 · #EFF8FF · #FFFAEB · #FEF3F2"
    const fills = {
      green: 'bg-green-50',
      blue: 'bg-blue-50',
      amber: 'bg-amber-50',
      red: 'bg-red-50',
    }
    for (const [tone, fill] of Object.entries(fills)) {
      expect(mount(Notice, { props: { tone, label: 'X' } }).classes(), tone).toContain(fill)
    }
  })

  it('falls back to neutral for an unknown tone', () => {
    expect(mount(Notice, { props: { tone: 'nonsense', label: 'X' } }).classes()).toContain(
      'bg-neutral-100',
    )
  })

  it('interrupts for errors but stays polite otherwise', () => {
    expect(mount(Notice, { props: { tone: 'red', label: 'Error' } }).attributes('role')).toBe(
      'alert',
    )
    expect(mount(Notice, { props: { tone: 'green', label: 'Success' } }).attributes('role')).toBe(
      'status',
    )
  })
})

describe('Skeleton — Appendix C conformance', () => {
  it('renders 11px bars at the bar radius on the canvas tint', () => {
    // Redline "Skeleton bar · 11px · radius 6px · #EEF1F6 · 3 rows max"
    const row = mount(Skeleton).get('[data-row]')
    expect(row.classes()).toContain('h-2.75')
    expect(row.classes()).toContain('rounded-bar')
    expect(row.classes()).toContain('bg-neutral-100')
  })

  it('never renders more than three rows', () => {
    // Redline "3 rows max" — the source warns against a page of shimmer.
    expect(mount(Skeleton, { props: { rows: 9 } }).findAll('[data-row]')).toHaveLength(3)
    expect(mount(Skeleton, { props: { rows: 2 } }).findAll('[data-row]')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Notice.spec.js`
Expected: FAIL — expected `[data-body]` to exist.

- [ ] **Step 3: Rebuild Notice**

Replace `src/design-system/components/feedback/Notice.vue` entirely:

```vue
<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONE_TEXT, TONES } from '../tones'

const props = defineProps({
  tone: {
    type: String,
    default: DEFAULT_TONE,
    validator: (value) => TONES.includes(value),
  },
  label: { type: String, required: true },
})

// Redline "Notice fills · #ECFDF3 · #EFF8FF · #FFFAEB · #FEF3F2" — the tone/50
// scale. Neutral and violet have no redlined fill; their tint is used.
const FILLS = {
  neutral: 'bg-neutral-100',
  green: 'bg-green-50',
  amber: 'bg-amber-50',
  red: 'bg-red-50',
  blue: 'bg-blue-50',
  violet: 'bg-violet-100',
}

// Redline "Notice label · 1px tone/200" — a border scale the source uses but
// never tokenised; added in spec Appendix A.1. Neutral and violet have no
// redlined border, so they use the soft hairline.
const PILL_BORDERS = {
  neutral: 'border-soft',
  green: 'border-notice-border-green',
  amber: 'border-notice-border-amber',
  red: 'border-notice-border-red',
  blue: 'border-notice-border-blue',
  violet: 'border-soft',
}

const tone = computed(() => (TONES.includes(props.tone) ? props.tone : DEFAULT_TONE))
const fillClass = computed(() => FILLS[tone.value])
const textClass = computed(() => TONE_TEXT[tone.value])
const pillBorderClass = computed(() => PILL_BORDERS[tone.value])

// role="status" is implicitly aria-live="polite" — assistive tech waits for a
// pause. An error must interrupt instead, so it gets role="alert".
const role = computed(() => (tone.value === 'red' ? 'alert' : 'status'))
</script>

<template>
  <!-- Redline "Notice shell · min-h 32px · radius 16px · pad 4px 10px 4px 4px
       · gap 12px". No border: the outlined pill carries the meaning and the
       surface stays almost white. -->
  <div
    class="flex min-h-notice items-center gap-3 rounded-notice py-1 pr-2.5 pl-1"
    :class="fillClass"
    :role="role"
  >
    <!-- Redline "Notice label · 24px · radius 16px · pad 0 12px · 12.5px / 400
         · 1px tone/200" — transparent fill, tone outline. -->
    <span
      data-pill
      class="inline-flex h-6 flex-none items-center rounded-notice border px-3 text-field-label font-normal"
      :class="[textClass, pillBorderClass]"
      >{{ label }}</span
    >

    <!-- Redline "Notice text · 13px / 400 in tone colour on tone/50" -->
    <p data-body class="m-0 min-w-0 text-notice" :class="textClass"><slot /></p>
  </div>
</template>
```

- [ ] **Step 4: Conform Skeleton**

Replace `src/design-system/components/feedback/Skeleton.vue`'s script and template (keep the `<style scoped>` block exactly as it is):

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Number, default: 3 },
})

// Redline "Skeleton bar · 3 rows max" — the source warns against a full page
// of shimmer, so the count is clamped rather than trusted.
const rowCount = computed(() => Math.max(1, Math.min(3, props.rows)))
</script>

<template>
  <div class="flex flex-col gap-2.5" aria-hidden="true">
    <!-- Redline "Skeleton bar · 11px · radius 6px · #EEF1F6" -->
    <div
      v-for="row in rowCount"
      :key="row"
      data-row
      class="skeleton h-2.75 rounded-bar bg-neutral-100"
    />
  </div>
</template>
```

- [ ] **Step 5: Use the real link hover colour**

In `src/design-system/styles/base.css`, replace the `a:hover` rule and its comment:

```css
/* The source's base CSS uses #166534, tokenised in spec Appendix A.1 as
 * --green-link-hover. Phase 1 substituted --green-900 because the value had
 * no token; it does now. */
a:hover {
  color: var(--green-link-hover);
  text-decoration: underline;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/design-system/components/feedback/__tests__/Notice.spec.js`
Expected: PASS.

**One Phase 2 test is now wrong and must be updated, not deleted:** `Skeleton`'s
`it('honours an explicit row count')` mounts with `rows: 5` and expects 5 rows. The redline caps
the count at 3, so change that case to assert `rows: 2` renders 2 — it still proves the prop is
honoured below the cap, which is what it was written to check.

- [ ] **Step 7: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/components/feedback/ src/design-system/styles/base.css
git commit -m "fix(ds): rebuild Notice and conform Skeleton to the Appendix C redlines"
```

---

### Task 7: Surface the new variants on the demo page

The kitchen sink is the acceptance surface. Four new component variants exist and none of them appear on it.

**Files:**
- Modify: `src/design-system/demo/ChipsDemo.vue`, `ButtonsDemo.vue`, `CardsDemo.vue`, `FeedbackDemo.vue`
- Modify: `src/pages/__tests__/design-system.spec.js`

**Interfaces:**
- Consumes: `Chip` (`variant`), `FilterChip`, `Button` (`size="icon"`), `StatCard` (`dot`, `urgent`), `Meter` (`caption`) from `@/design-system`.
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing test**

Add to `src/pages/__tests__/design-system.spec.js`:

```js
  it('exercises the variants added in the conformance pass', () => {
    const wrapper = mount(DesignSystemPage)
    // Chip variants, FilterChip, icon Button, StatCard dot/urgent, Meter caption
    for (const text of ['Pharmacy', 'Birthing Home', 'Uploaded']) {
      expect(wrapper.text(), `missing: ${text}`).toContain(text)
    }
    expect(wrapper.findAll('[aria-pressed]').length).toBeGreaterThan(0)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: FAIL — missing: Pharmacy.

- [ ] **Step 3: Add the chip variants to ChipsDemo**

In `src/design-system/demo/ChipsDemo.vue`, import `FilterChip` alongside the existing imports, add a `selected` ref, and append two rows inside the outer wrapper `<div>`, after the existing `ChipGroup`s:

```vue
<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip, FilterChip } from '@/design-system'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
])

const FILTERS = ['Primary Care Facility', 'Hospital', 'Birthing Home', 'Clinical Laboratory']
const selected = ref(['Primary Care Facility'])

function dismiss({ chipKey, value }) {
  applied.value = applied.value.filter((chip) => !(chip.key === chipKey && chip.value === value))
}

function toggle(label) {
  selected.value = selected.value.includes(label)
    ? selected.value.filter((item) => item !== label)
    : [...selected.value, label]
}
</script>
```

Append to the template, inside the outer `<div class="flex flex-col gap-4">`:

```html
    <ChipGroup>
      <Chip variant="filled">Active</Chip>
      <Chip variant="service">Pharmacy</Chip>
      <Chip variant="service">Birthing Home</Chip>
      <Chip variant="service">X-ray Facility</Chip>
    </ChipGroup>

    <ChipGroup>
      <FilterChip
        v-for="label in FILTERS"
        :key="label"
        :selected="selected.includes(label)"
        @toggle="toggle(label)"
        >{{ label }}</FilterChip
      >
    </ChipGroup>
```

- [ ] **Step 4: Add the icon button to ButtonsDemo**

In `src/design-system/demo/ButtonsDemo.vue`, append to the second row of buttons:

```html
      <Button size="icon" variant="secondary" aria-label="More actions">⋯</Button>
```

- [ ] **Step 5: Add the stat dot, urgent hint and meter caption to CardsDemo**

In `src/design-system/demo/CardsDemo.vue`, replace the `StatCard` grid and the meter block:

```html
    <div class="grid gap-card sm:grid-cols-3">
      <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" dot="green" />
      <StatCard label="Inspection" value="8" hint="2 overdue" dot="amber" urgent />
      <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
    </div>

    <div class="max-w-sm">
      <Meter :value="62" :max="100" label="Upload progress" caption="Uploaded" />
    </div>
```

Remove the now-redundant `<p class="text-hint text-text-meta mb-2">Meter at 62%</p>` above the meter — the caption replaces it.

- [ ] **Step 6: Give the notices their bold emphasis**

The source's notices end in a bold clause. In `src/design-system/demo/FeedbackDemo.vue`, replace the four `Notice` lines:

```html
    <Notice tone="green" label="Success">
      You have successfully updated user's <strong class="font-bold">role and permissions.</strong>
    </Notice>
    <Notice tone="blue" label="Info">
      This application was returned to the facility on Aug 19. It reappears here
      <strong class="font-bold">once they resubmit.</strong>
    </Notice>
    <Notice tone="amber" label="Warning">
      Your certificate uses an older encryption format. A converted copy is stored alongside it —
      <strong class="font-bold">no action needed.</strong>
    </Notice>
    <Notice tone="red" label="Error">
      Inspection is overdue by 4 days. The licence cannot be issued
      <strong class="font-bold">until the report is uploaded.</strong>
    </Notice>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/pages/__tests__/design-system.spec.js`
Expected: PASS.

- [ ] **Step 8: Run all gates and commit**

Run: `npx vitest run && npm run verify:css && npm run lint`

```bash
git add src/design-system/demo/ src/pages/__tests__/
git commit -m "feat(ds): surface the conformance-pass variants on the design system page"
```

---

## Phase complete

```bash
npx vitest run && npm run verify:css && npm run lint
```

Then open http://localhost:5177/design-system and compare each section against the source artifact **side by side, in both themes**. Every value on the page now traces to a row in spec Appendix C; anything that still looks wrong is either a redline this pass missed or a genuine conflict in the source, and either is worth reporting rather than adjusting by eye.

Phase 3 (~20 Ark-backed components) is planned separately and builds against Appendix C from the start.
