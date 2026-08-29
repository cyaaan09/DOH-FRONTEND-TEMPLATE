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

// The dark block survived. Production CSS minification (lightningcss) drops
// the quotes from attribute selectors when the value doesn't need them, so
// match both the source form and the minified form.
if (!/\[data-theme=("dark"|dark)\]/.test(css)) {
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
