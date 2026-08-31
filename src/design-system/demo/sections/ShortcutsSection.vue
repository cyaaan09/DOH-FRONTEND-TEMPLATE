<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Button, ShortcutSheet } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Keyboard shortcuts". The sheet opens with ? — bound here so
// the demo demonstrates its own contract rather than describing it.
const open = ref(false)

// Redline "Suspension · single-letter bindings are off while an input,
// textarea, or contenteditable has focus". Without this, typing a question
// mark into any field on the page opens the sheet.
function onKey(event) {
  if (event.key !== '?') return
  const el = document.activeElement
  if (el && (el.matches('input, textarea') || el.isContentEditable)) return
  event.preventDefault()
  open.value = true
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const GROUPS = [
  {
    label: 'GLOBAL',
    rows: [
      { keys: ['/'], label: 'Search' },
      { keys: ['⌘', 'K'], joiner: 'chord', label: 'Command palette' },
      { keys: ['?'], label: 'This sheet' },
      { keys: ['Esc'], label: 'Close or cancel' },
    ],
  },
  {
    label: 'NAVIGATE',
    rows: [
      { keys: ['g', 'l'], joiner: 'then', label: 'Issued LTO' },
      { keys: ['g', 'a'], joiner: 'then', label: 'LTO Applications' },
      { keys: ['g', 'f'], joiner: 'then', label: 'Facilities' },
      { keys: ['['], label: 'Toggle the rail' },
    ],
  },
  {
    label: 'TABLE',
    rows: [
      { keys: ['↑', '↓'], joiner: 'or', label: 'Move between rows' },
      { keys: ['↵'], label: 'Open the row' },
      { keys: ['space'], label: 'Expand the row' },
      { keys: ['x'], label: 'Select the row' },
      { keys: ['⌘', 'A'], joiner: 'chord', label: 'Select all shown' },
    ],
  },
  {
    label: 'RECORD',
    rows: [
      { keys: ['⌘', '↵'], joiner: 'chord', label: 'Save and continue' },
      { keys: ['⌥', '→'], joiner: 'chord', label: 'Next step' },
      { keys: ['⌥', '←'], joiner: 'chord', label: 'Previous step' },
      { keys: ['u'], label: 'Upload' },
      { keys: ['⌘', 'S'], joiner: 'chord', label: 'Sign' },
    ],
  },
]

const RULES = [
  {
    title: 'Keycap, not code font alone',
    body: '11px mono on #FFF with a 1px #E4E8EF border and a 1px bottom shadow \u2014 it reads as a key at a glance and survives being printed in greyscale.',
  },
  {
    title: 'Two-key sequences, not chords',
    body: 'Navigation uses g then l, so nothing collides with the browser or a screen reader. Chords are reserved for save and select-all, where users already expect them.',
  },
  {
    title: 'Never inside a text field',
    body: 'Single-letter bindings are suspended while an input, textarea, or contenteditable has focus \u2014 otherwise typing a facility name fires four commands.',
  },
  {
    title: 'Discoverable twice',
    body: 'Question mark opens it, and the account menu links it. A shortcut nobody can find is a shortcut nobody uses.',
  },
]
</script>

<template>
  <DemoCard
    title="Keyboard shortcuts"
    description="The sheet is the contract: if a key is listed here it works on every screen, and if it is not listed it is not bound. Opened with question mark, closed with Esc, and reachable from the account menu for anyone who never guesses at question mark."
  >
    <div class="px-card-x pt-4.5 pb-6">
      <Button size="compact" variant="secondary" @click="open = true">
        Open the shortcut sheet — or press ?
      </Button>
      <ShortcutSheet v-model="open" :groups="GROUPS" />
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
