<script setup>
// The real tokens.css, GENERATED into a module rather than transcribed.
// This block's whole purpose is to be copied into another stylesheet, so a
// hand-kept copy that drifted from the file it claims to be would be wrong
// in someone else's codebase. Vite's `?raw` was the obvious route and is a
// trap: it returns an EMPTY STRING for a .css file under Vitest, whose CSS
// stubbing beats the raw query — the block would render correctly in the
// browser while every test saw nothing. Exempt from the raw-hex guard like
// the rest of demo/, which is what lets these values render as text.
import { TOKENS_CSS as tokensCss } from '../data/tokens-css.js'

defineProps({
  /** The name a reader should save the block as. */
  filename: { type: String, default: 'olrs-tokens.css' },
  hint: { type: String, default: 'select all · paste into :root' },
})
</script>

<template>
  <div data-token-block class="tokenblock overflow-hidden rounded-panel border border-hairline">
    <div class="tokenblock__bar flex items-center justify-between border-b border-divider bg-surface-sunken">
      <div data-filename class="font-mono text-hint font-medium text-ink-600">{{ filename }}</div>
      <div data-hint class="tokenblock__hint text-text-meta">{{ hint }}</div>
    </div>
    <pre data-code class="tokenblock__code font-mono text-ink-700">{{ tokensCss }}</pre>
  </div>
</template>

<style scoped>
.tokenblock {
  background: var(--surface-card-muted);
}

.tokenblock__bar {
  gap: 12px;
  padding: 10px 14px;
}

.tokenblock__hint {
  font-size: 11.5px;
}

/* white-space: pre and its own horizontal scroll — a token block must never
   soft-wrap a declaration onto two lines, and must never widen the card. */
.tokenblock__code {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre;
}
</style>
