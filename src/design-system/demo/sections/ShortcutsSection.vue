<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Added by the second 2026-08-31 artifact update. Spec §17.2 — the slot is
// visible from the start, so the page stays a live checklist. Everything
// here is generated from Appendix D: the rule cards are CONTENT the artifact
// shows, so a skeleton renders them for real even while its component slot
// is still a gap.
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
    <DemoBlocks>
      <DemoBlock label="GLOBAL">
        <DemoGap component="ShortcutSheet" group="Keyboard shortcuts" />
      </DemoBlock>

      <DemoBlock label="NAVIGATE">
        <DemoGap component="ShortcutSheet" group="Keyboard shortcuts" />
      </DemoBlock>

      <DemoBlock label="TABLE">
        <DemoGap component="ShortcutSheet" group="Keyboard shortcuts" />
      </DemoBlock>

      <DemoBlock label="RECORD">
        <DemoGap component="ShortcutSheet" group="Keyboard shortcuts" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
