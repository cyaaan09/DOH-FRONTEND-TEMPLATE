# Design System Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the token layer, Tailwind v4 bridge, font loading, theme switching, and the mechanical guards that enforce the design system's two governing rules — so that every component phase that follows is built on a verified foundation.

**Architecture:** CSS custom properties are pasted verbatim from the source design document into `tokens.css` / `tokens.dark.css` and are never hand-adapted. A `@theme inline` block bridges them into Tailwind's utility namespaces so utilities resolve *through* the variables — which is what lets a theme swap work with zero `dark:` variants. Theme state is a `data-theme` attribute on `<html>`, driven by VueUse. Four static tests enforce that no component may ever contain a raw hex value or a `dark:` variant.

**Tech Stack:** Vue 3.5, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), VueUse 14, Vitest 4, `@fontsource-variable/dm-sans` 5.3.0, `@fontsource-variable/jetbrains-mono` 5.3.0

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — the token blocks this plan installs are Appendix A and Appendix B of that document. Read it alongside this plan.

**Phase:** 1 of 5. Later phases (Primitives, Ark-backed components, Composites, Kitchen sink) get their own plans, written once this one lands.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- Dark mode selector is `[data-theme="dark"]`. The `.dark` class convention currently in `src/assets/main.css` is being replaced — never reintroduce it.
- CSS variable names are **verbatim** from the spec appendices. Never rename, never "tidy", never add a prefix.
- No file under `src/design-system/components/` may contain a raw hex colour or a `dark:` variant. Task 5 makes this a failing test.
- Geometry tokens are theme-invariant: `tokens.dark.css` overrides colours and shadows only. If a size or radius differs between themes, that is a bug.
- Dev server runs on port 5177 (already configured in `vite.config.js`).
- Existing test convention: specs live in a `__tests__/` directory beside the code they test, named `*.spec.js`, using `describe` / `it` / `expect` imported from `vitest`.

---

### Task 1: Token files and parity test

Installs the two token blocks and proves the dark block is a disciplined override of the light one rather than a second, drifting palette.

**Files:**
- Create: `src/design-system/styles/tokens.css`
- Create: `src/design-system/styles/tokens.dark.css`
- Test: `src/design-system/styles/__tests__/tokens.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: the two CSS files, and a helper `parseTokens(css: string) => Map<string, string>` exported from the test file's sibling module `src/design-system/styles/__tests__/parse-tokens.js`, reused by Task 2.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/styles/__tests__/parse-tokens.js`:

```js
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Extracts `--name: value` declarations from a CSS block.
 * Comments are stripped first so commented-out tokens are not counted.
 * @returns {Map<string, string>} token name (without `--`) → trimmed value
 */
export function parseTokens(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const tokens = new Map()
  for (const match of withoutComments.matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)) {
    tokens.set(match[1], match[2].trim())
  }
  return tokens
}

/** Reads a file from src/design-system/styles/ */
export function readStyle(name) {
  return readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8')
}
```

Create `src/design-system/styles/__tests__/tokens.spec.js`:

```js
import { describe, expect, it } from 'vitest'
import { parseTokens, readStyle } from './parse-tokens'

const light = parseTokens(readStyle('tokens.css'))
const dark = parseTokens(readStyle('tokens.dark.css'))

describe('design tokens', () => {
  it('defines the light palette on :root', () => {
    expect(readStyle('tokens.css')).toMatch(/^:root\s*\{/m)
    expect(light.size).toBeGreaterThan(80)
  })

  it('scopes the dark palette to [data-theme="dark"]', () => {
    expect(readStyle('tokens.dark.css')).toMatch(/^\[data-theme="dark"\]\s*\{/m)
  })

  it('introduces no token in dark that does not exist in light', () => {
    const orphans = [...dark.keys()].filter((name) => !light.has(name))
    expect(orphans).toEqual([])
  })

  it('does not redeclare --font-sans or --font-mono (owned by theme.css)', () => {
    expect(light.has('font-sans')).toBe(false)
    expect(light.has('font-mono')).toBe(false)
  })

  it('keeps geometry theme-invariant', () => {
    const geometry = [...light.keys()].filter((n) =>
      /^(r-|h-|size-|rail-|gap-|pad-|z-|w-)/.test(n),
    )
    expect(geometry.length).toBeGreaterThan(10)
    const overridden = geometry.filter((n) => dark.has(n))
    expect(overridden).toEqual([])
  })

  it('defines the tokens every component depends on', () => {
    for (const name of [
      'canvas', 'surface', 'surface-sunken', 'ink-900', 'ink-500',
      'green-fill', 'green-on-fill', 'border-card', 'border-field',
      'r-field', 'r-card', 'h-field', 'h-compact', 'h-touch',
      'sh-card', 'ring-focus', 'scrim',
    ]) {
      expect(light.has(name), `light is missing --${name}`).toBe(true)
    }
  })

  it('flips the fill label colour in dark mode', () => {
    expect(light.get('green-on-fill')).toBe('#FFFFFF')
    expect(dark.get('green-on-fill')).toBe('#0B1017')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/styles/__tests__/tokens.spec.js`
Expected: FAIL — `ENOENT: no such file or directory` for `tokens.css`.

- [ ] **Step 3: Create the token files**

Create `src/design-system/styles/tokens.css` with the **exact contents of Appendix A** of the spec, with one modification: delete these two lines, which move to `theme.css` in Task 2 because their names collide with Tailwind's own namespace (spec §4.1):

```css
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
```

Create `src/design-system/styles/tokens.dark.css` with the **exact contents of Appendix B** of the spec, unmodified.

Change nothing else — not a hex digit, not a comment, not the whitespace. The comments carry the contrast ratios that justify each value.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/styles/__tests__/tokens.spec.js`
Expected: PASS — 7 tests.

If `introduces no token in dark that does not exist in light` fails, do **not** add the orphan to the light file. It means Appendix B was pasted with a typo — re-copy it.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/styles/tokens.css src/design-system/styles/tokens.dark.css src/design-system/styles/__tests__/
git commit -m "feat(ds): install light and dark token blocks with parity test"
```

---

### Task 2: Tailwind bridge and integrity test

Maps the tokens into Tailwind utility namespaces. The test exists because the one failure mode here — a self-referential `@theme` declaration — produces **no build error**; the utility silently resolves to nothing.

**Files:**
- Create: `src/design-system/styles/theme.css`
- Test: `src/design-system/styles/__tests__/theme-bridge.spec.js`

**Interfaces:**
- Consumes: `parseTokens` and `readStyle` from Task 1's `./parse-tokens`.
- Produces: `theme.css`, which later phases rely on for the utilities `bg-surface`, `text-ink-900`, `rounded-field`, `h-field`, `shadow-card`, `border-card`.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/styles/__tests__/theme-bridge.spec.js`:

```js
import { describe, expect, it } from 'vitest'
import { parseTokens, readStyle } from './parse-tokens'

const light = parseTokens(readStyle('tokens.css'))
const bridge = parseTokens(readStyle('theme.css'))

/** Bridged entries whose value is a single var() reference. */
const references = [...bridge.entries()]
  .map(([name, value]) => [name, /^var\(\s*--([\w-]+)\s*\)$/.exec(value)?.[1]])
  .filter(([, target]) => target !== undefined)

describe('tailwind theme bridge', () => {
  it('uses @theme inline so utilities resolve through the variables', () => {
    expect(readStyle('theme.css')).toMatch(/@theme\s+inline\s*\{/)
  })

  it('never references a token that does not exist', () => {
    const dangling = references.filter(([, target]) => !light.has(target))
    expect(dangling.map(([name, target]) => `--${name} → --${target}`)).toEqual([])
  })

  it('never declares a self-reference', () => {
    // `--font-sans: var(--font-sans)` is circular. It does not error —
    // the utility silently resolves to nothing. This is the guard.
    const circular = references.filter(([name, target]) => name === target)
    expect(circular.map(([name]) => `--${name}`)).toEqual([])
  })

  it('owns the two colliding font names with literal values', () => {
    expect(bridge.get('font-sans')).toBe("'DM Sans', system-ui, sans-serif")
    expect(bridge.get('font-mono')).toBe("'JetBrains Mono', monospace")
  })

  it('bridges the namespaces components are written against', () => {
    for (const name of [
      'color-canvas', 'color-surface', 'color-ink-900', 'color-green-fill',
      'radius-field', 'radius-card', 'spacing-field', 'shadow-card',
    ]) {
      expect(bridge.has(name), `bridge is missing --${name}`).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: FAIL — `ENOENT` for `theme.css`.

- [ ] **Step 3: Create the bridge**

Create `src/design-system/styles/theme.css`:

```css
/* Bridges the design tokens into Tailwind v4's utility namespaces.
 *
 * `@theme inline` inlines the var() reference into each generated utility
 * instead of snapshotting its value. That is what makes `bg-surface` follow
 * [data-theme="dark"] without a single `dark:` variant. Do not drop `inline`.
 *
 * --font-sans and --font-mono are declared here with literal values rather
 * than bridged, because those names exist in both the token block and
 * Tailwind's own namespace; `--font-sans: var(--font-sans)` is circular and
 * fails silently. See spec §4.1.
 */

@theme {
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@theme inline {
  /* surfaces */
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-sunken: var(--surface-sunken);
  --color-surface-input: var(--surface-input);
  --color-surface-muted: var(--surface-muted);
  --color-surface-card-muted: var(--surface-card-muted);
  --color-row-hover: var(--row-hover);

  /* text */
  --color-ink-900: var(--ink-900);
  --color-ink-700: var(--ink-700);
  --color-ink-600: var(--ink-600);
  --color-ink-500: var(--ink-500);
  --color-ink-400: var(--ink-400);
  --color-ink-300: var(--ink-300);
  --color-ink-200: var(--ink-200);
  --color-ink-100: var(--ink-100);
  --color-text-header: var(--text-header);
  --color-text-meta: var(--text-meta);
  --color-placeholder: var(--placeholder);

  /* green */
  --color-green-900: var(--green-900);
  --color-green-fill: var(--green-fill);
  --color-green-fill-hover: var(--green-fill-hover);
  --color-green-600: var(--green-600);
  --color-green-500: var(--green-500);
  --color-green-text: var(--green-text);
  --color-green-on-fill: var(--green-on-fill);
  --color-green-100: var(--green-100);
  --color-green-50: var(--green-50);
  --color-green-tint: var(--green-tint);
  --color-green-tint-2: var(--green-tint-2);

  /* status tones */
  --color-amber-text: var(--amber-text);
  --color-amber-400: var(--amber-400);
  --color-amber-100: var(--amber-100);
  --color-amber-50: var(--amber-50);
  --color-red-700: var(--red-700);
  --color-red-500: var(--red-500);
  --color-red-100: var(--red-100);
  --color-red-50: var(--red-50);
  --color-red-border: var(--red-border);
  --color-red-border-btn: var(--red-border-btn);
  --color-blue-700: var(--blue-700);
  --color-blue-100: var(--blue-100);
  --color-blue-50: var(--blue-50);
  --color-violet-700: var(--violet-700);
  --color-violet-100: var(--violet-100);
  --color-neutral-100: var(--neutral-100);

  /* borders and rules */
  --color-border-field: var(--border-field);
  --color-border-card: var(--border-card);
  --color-border-soft: var(--border-soft);
  --color-divider: var(--divider);
  --color-divider-row: var(--divider-row);

  /* radius */
  --radius-pill: var(--r-pill);
  --radius-notice: var(--r-notice);
  --radius-card: var(--r-card);
  --radius-panel: var(--r-panel);
  --radius-field: var(--r-field);
  --radius-control: var(--r-control);
  --radius-tile: var(--r-tile);
  --radius-check: var(--r-check);

  /* sizing — feeds h-*, w-*, p-*, gap-* */
  --spacing-touch: var(--h-touch);
  --spacing-field: var(--h-field);
  --spacing-compact: var(--h-compact);
  --spacing-notice: var(--h-notice);
  --spacing-check: var(--size-check);
  --spacing-rail: var(--rail-w);
  --spacing-rail-collapsed: var(--rail-w-collapsed);

  /* elevation */
  --shadow-card: var(--sh-card);
  --shadow-primary: var(--sh-primary);
  --shadow-toast: var(--sh-toast);
  --shadow-panel: var(--sh-panel);
  --shadow-dialog: var(--sh-dialog);
}

/* Deliberately NOT bridged — no Tailwind namespace fits, so components use
 * these as var() inside <style> blocks (spec §4.2):
 *   --z-header --z-popover --z-dialog
 *   --t-fast --t-control --t-rail
 *   --grad-primary --grad-meter
 *   --ring-focus --ring-select --scrim --chip-pad
 * Font weights are not bridged either: 400/500/700 are Tailwind's built-in
 * font-normal / font-medium / font-bold.
 */
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/styles/__tests__/theme-bridge.spec.js`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/styles/theme.css src/design-system/styles/__tests__/theme-bridge.spec.js
git commit -m "feat(ds): bridge tokens into tailwind namespaces with @theme inline"
```

---

### Task 3: Fonts, base resets, and stylesheet wiring

Wires everything into the app's entry stylesheet and adds a build-level check, because a broken `@theme` bridge is invisible to unit tests that only read source text.

**Files:**
- Create: `src/design-system/styles/fonts.css`
- Create: `src/design-system/styles/base.css`
- Create: `scripts/verify-css-build.mjs`
- Modify: `src/assets/main.css` (replace entire contents)
- Modify: `package.json` (add two dependencies and one script)

**Interfaces:**
- Consumes: `tokens.css`, `tokens.dark.css`, `theme.css` from Tasks 1–2.
- Produces: a working stylesheet cascade, and `npm run verify:css` which fails if the built CSS is missing tokens or utilities.

- [ ] **Step 1: Install the font packages**

Run:

```bash
npm install --save-exact @fontsource-variable/dm-sans@5.3.0 @fontsource-variable/jetbrains-mono@5.3.0
```

Both are variable fonts, so a single file covers weights 400, 500 and 700.

- [ ] **Step 2: Create the font and base stylesheets**

Create `src/design-system/styles/fonts.css`:

```css
/* Self-hosted — no third-party network requests at runtime. */
@import '@fontsource-variable/dm-sans';
@import '@fontsource-variable/jetbrains-mono';
```

Create `src/design-system/styles/base.css`:

```css
/* Element-level resets from the source document, rewritten against tokens so
 * they follow the theme. The document's literals mapped exactly onto tokens
 * with one exception, noted below.
 */

body {
  margin: 0;
  background: var(--canvas);
  color: var(--ink-900);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--green-text);
  text-decoration: none;
}

/* Source document specified #166534 for hover, which is not a token.
 * --green-900 (#14532D) is the nearest token and is used deliberately. */
a:hover {
  color: var(--green-900);
  text-decoration: underline;
}

input,
button,
textarea,
select {
  font-family: inherit;
}

input:focus,
textarea:focus {
  outline: none;
}

input::placeholder,
textarea::placeholder {
  color: var(--placeholder);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes toastTimer {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
```

- [ ] **Step 3: Replace the entry stylesheet**

Replace the entire contents of `src/assets/main.css`:

```css
/* Import order matters: tokens must exist before theme.css bridges them,
 * and base.css comes last so its element rules win over Tailwind preflight. */
@import '../design-system/styles/fonts.css';
@import 'tailwindcss';
@import '../design-system/styles/tokens.css';
@import '../design-system/styles/tokens.dark.css';
@import '../design-system/styles/theme.css';
@import '../design-system/styles/base.css';

/* Dark mode is driven by data-theme, not a class. Kept so any `dark:` utility
 * in application code (outside the design system) still resolves. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

- [ ] **Step 4: Write the build verification script**

Create `scripts/verify-css-build.mjs`:

```js
/**
 * Builds the app and asserts the emitted CSS actually contains the design
 * tokens and at least one bridged utility.
 *
 * This exists because a self-referential @theme declaration produces no build
 * error — the utility just silently resolves to nothing. Static tests cannot
 * see that; only the compiled output can.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'dist/assets'

rmSync('dist', { recursive: true, force: true })
execFileSync('npx', ['vite', 'build'], { stdio: 'inherit' })

const cssFiles = readdirSync(OUT).filter((f) => f.endsWith('.css'))
if (cssFiles.length === 0) {
  console.error('FAIL: no CSS emitted to', OUT)
  process.exit(1)
}
const css = cssFiles.map((f) => readFileSync(join(OUT, f), 'utf8')).join('\n')

const failures = []

// Tokens reached the bundle.
for (const token of ['--canvas:', '--surface:', '--ink-900:', '--green-fill:']) {
  if (!css.includes(token)) failures.push(`token ${token} missing from built CSS`)
}

// The dark block survived.
if (!css.includes('[data-theme="dark"]')) {
  failures.push('[data-theme="dark"] block missing from built CSS')
}

// Fonts resolved to real files rather than a dead @import.
if (!/@font-face/.test(css)) failures.push('no @font-face rules — fontsource import failed')

// The font bridge is not circular.
if (/--font-sans:\s*var\(--font-sans\)/.test(css)) {
  failures.push('--font-sans is self-referential — see spec §4.1')
}

if (failures.length > 0) {
  console.error('CSS build verification FAILED:')
  for (const f of failures) console.error('  •', f)
  process.exit(1)
}

console.log('CSS build verification passed:', cssFiles.join(', '))
```

Add the script to `package.json` under `"scripts"`:

```json
"verify:css": "node scripts/verify-css-build.mjs"
```

- [ ] **Step 5: Run the verification**

Run: `npm run verify:css`
Expected: builds, then prints `CSS build verification passed: index-<hash>.css`

If it reports `no @font-face rules`, the fontsource import path is wrong — confirm the packages installed and that `fonts.css` uses bare specifiers, not relative paths.

- [ ] **Step 6: Confirm nothing else broke**

Run: `npx vitest run`
Expected: PASS — Task 1 and 2 specs plus the pre-existing counter store spec.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/styles/fonts.css src/design-system/styles/base.css src/assets/main.css scripts/verify-css-build.mjs package.json package-lock.json
git commit -m "feat(ds): wire fonts, base resets and stylesheet cascade"
```

---

### Task 4: Theme composable and toggle

Replaces the template's class-based dark mode with the `data-theme` attribute the design system is written against.

**Files:**
- Create: `src/design-system/composables/useTheme.js`
- Create: `src/design-system/index.js`
- Create: `src/design-system/composables/__tests__/useTheme.spec.js`
- Modify: `src/layouts/default.vue`

**Interfaces:**
- Consumes: `tokens.dark.css`'s `[data-theme="dark"]` selector from Task 1.
- Produces: `useTheme() => { isDark: WritableComputedRef<boolean>, toggleTheme: () => boolean }`, exported from `@/design-system`. Later phases import components from this same barrel.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/composables/__tests__/useTheme.spec.js`:

```js
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // jsdom's matchMedia is incomplete; useDark reads prefers-color-scheme
    // through it. Stub it so the initial value is deterministic.
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })
  })

  it('writes the theme to data-theme on the document element', async () => {
    const { isDark } = useTheme()

    isDark.value = true
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    isDark.value = false
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('never uses the dark class convention', async () => {
    const { isDark } = useTheme()

    isDark.value = true
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme flips the current value', async () => {
    const { isDark, toggleTheme } = useTheme()

    const before = isDark.value
    toggleTheme()
    await nextTick()
    expect(isDark.value).toBe(!before)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/composables/__tests__/useTheme.spec.js`
Expected: FAIL — cannot resolve `../useTheme`.

- [ ] **Step 3: Write the composable and barrel**

Create `src/design-system/composables/useTheme.js`:

```js
import { useDark, useToggle } from '@vueuse/core'

/**
 * Design-system theme state.
 *
 * The system is authored against `[data-theme="dark"]`, not a `.dark` class,
 * so this writes an attribute. Light mode writes `data-theme="light"`, which
 * matches nothing in the stylesheets — the `:root` block is the light palette.
 *
 * @returns {{ isDark: import('vue').WritableComputedRef<boolean>, toggleTheme: () => boolean }}
 */
export function useTheme() {
  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme',
  })

  return { isDark, toggleTheme: useToggle(isDark) }
}
```

Create `src/design-system/index.js`:

```js
/**
 * Public entry point for the design system.
 * Application code imports from '@/design-system', never from deep paths.
 */
export { useTheme } from './composables/useTheme'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/composables/__tests__/useTheme.spec.js`
Expected: PASS — 3 tests.

- [ ] **Step 5: Rewire the layout's toggle**

In `src/layouts/default.vue`, replace the `<script setup>` block:

```js
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/design-system'

const { isDark, toggleTheme } = useTheme()
```

Then replace every `dark:` utility and hardcoded grey in that file's template with token utilities. The shell is replaced wholesale by `AppShell` in a later phase, so keep this minimal — it only needs to prove the theme swap works:

```html
<template>
  <div class="min-h-screen bg-canvas text-ink-900">
    <header class="border-b border-card bg-surface">
      <nav class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span class="font-bold">Frontend Template</span>
        <RouterLink to="/" class="text-sm text-ink-600 hover:text-green-text">Home</RouterLink>
        <RouterLink to="/about" class="text-sm text-ink-600 hover:text-green-text">About</RouterLink>

        <button
          type="button"
          class="ml-auto h-compact rounded-field border border-field px-3 text-sm hover:bg-surface-muted"
          @click="toggleTheme()"
        >
          {{ isDark ? 'Light' : 'Dark' }}
        </button>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>
```

- [ ] **Step 6: Verify the swap in the browser**

Run: `npm run dev` and open http://localhost:5177

Confirm: the page background is `#EEF1F6`, body text is DM Sans, and clicking the toggle switches the canvas to `#0F141C` with `<html data-theme="dark">` in the inspector. Both must change with **no** `dark:` utility anywhere in the file.

- [ ] **Step 7: Commit**

```bash
git add src/design-system/composables/ src/design-system/index.js src/layouts/default.vue
git commit -m "feat(ds): add useTheme composable and switch layout to data-theme"
```

---

### Task 5: Component guards

The two rules the design system is built on — no raw hex, no `dark:` variants in components — become failing tests. The detectors are unit-tested against fixtures so they are known to actually catch violations before any component exists for them to scan.

**Files:**
- Create: `src/design-system/testing/guards.js`
- Create: `src/design-system/testing/__tests__/guards.spec.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `findRawHex(source: string) => string[]` and `findDarkVariants(source: string) => string[]`, both returning the offending substrings. Every later phase's components are scanned by the directory test here.

- [ ] **Step 1: Write the failing test**

Create `src/design-system/testing/__tests__/guards.spec.js`:

```js
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findDarkVariants, findRawHex } from '../guards'

const COMPONENTS_DIR = 'src/design-system/components'

/**
 * Lists .vue files under the components directory.
 * Uses readdirSync recursive rather than fs.globSync, which does not exist
 * on Node 20 — and package.json still allows Node ^20.19.0.
 */
function listComponents() {
  try {
    return readdirSync(COMPONENTS_DIR, { recursive: true })
      .filter((name) => String(name).endsWith('.vue'))
      .map((name) => join(COMPONENTS_DIR, String(name)))
  } catch {
    return [] // directory does not exist yet
  }
}

describe('findRawHex', () => {
  it('catches 3, 6 and 8 digit hex colours', () => {
    expect(findRawHex('color: #fff')).toEqual(['#fff'])
    expect(findRawHex('color: #1E2532')).toEqual(['#1E2532'])
    expect(findRawHex('color: #1E253280')).toEqual(['#1E253280'])
  })

  it('catches hex inside a style attribute', () => {
    expect(findRawHex('<div style="background:#177236">')).toEqual(['#177236'])
  })

  it('allows var() references', () => {
    expect(findRawHex('color: var(--ink-900)')).toEqual([])
  })

  it('allows anchor hrefs and HTML entities', () => {
    expect(findRawHex('<a href="#main">')).toEqual([])
    expect(findRawHex('&#39;')).toEqual([])
  })
})

describe('findDarkVariants', () => {
  it('catches a dark: utility in a class attribute', () => {
    expect(findDarkVariants('class="bg-surface dark:bg-black"')).toEqual(['dark:bg-black'])
  })

  it('allows the word dark outside a variant', () => {
    expect(findDarkVariants('const isDark = true')).toEqual([])
    expect(findDarkVariants('// dark mode is a palette swap')).toEqual([])
  })
})

describe('design-system components', () => {
  // Passes vacuously until phase 2 adds components, then guards every file.
  it('contain no raw hex colours and no dark: variants', () => {
    const violations = []
    for (const file of listComponents()) {
      const source = readFileSync(file, 'utf8')
      for (const hex of findRawHex(source)) violations.push(`${file}: raw hex ${hex}`)
      for (const v of findDarkVariants(source)) violations.push(`${file}: ${v}`)
    }
    expect(violations).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/design-system/testing/__tests__/guards.spec.js`
Expected: FAIL — cannot resolve `../guards`.

- [ ] **Step 3: Write the detectors**

Create `src/design-system/testing/guards.js`:

```js
/**
 * Static detectors for the design system's two governing rules.
 * Used by tests, not shipped to the browser.
 */

// 3, 4, 6 or 8 hex digits followed by a non-word char. Two-digit sequences are
// excluded so HTML entities like &#39; do not match, and a fragment such as
// #main is ignored because `m` is not a hex digit. A hex-shaped fragment like
// #abc would false-positive — acceptable, since components reference var().
const RAW_HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/g

// A `dark:` Tailwind variant, anchored to a class-list boundary so prose and
// identifiers containing "dark" are not flagged. Written with a capture group
// rather than a lookbehind, which is not portable across JS engines.
const DARK_VARIANT = /(?:^|["'\s])(dark:[\w[\]/.,%()-]+)/g

/**
 * @param {string} source file contents
 * @returns {string[]} raw hex colour literals found
 */
export function findRawHex(source) {
  return source.match(RAW_HEX) ?? []
}

/**
 * @param {string} source file contents
 * @returns {string[]} `dark:` variant utilities found
 */
export function findDarkVariants(source) {
  return [...source.matchAll(DARK_VARIANT)].map((match) => match[1])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/design-system/testing/__tests__/guards.spec.js`
Expected: PASS — 7 tests. The `design-system components` block reports a single skipped-style pass because no components exist yet; it goes live in phase 2.

- [ ] **Step 5: Run the whole suite and the linter**

Run: `npx vitest run && npm run lint`
Expected: all specs pass; lint clean.

- [ ] **Step 6: Commit**

```bash
git add src/design-system/testing/
git commit -m "test(ds): add raw-hex and dark-variant guards for components"
```

---

## Phase complete

At this point: tokens are installed and verified, Tailwind utilities resolve through them, fonts are self-hosted, the theme swaps via `data-theme` with zero `dark:` variants, and the rules that keep it that way are enforced by tests.

Run once more before handing off:

```bash
npx vitest run && npm run verify:css && npm run lint
```

Then write the phase 2 plan (Primitives: Button, Chip, TextField, Textarea, SearchField, Card family, Notice, Skeleton, StatCard, Meter).
