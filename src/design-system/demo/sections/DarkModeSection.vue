<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Six sub-blocks and four rule cards - spec Appendix D, "Dark mode" entry.
// Appendix D gives this section no Description line, so DemoCard gets none.
// None of the six previews is built yet (no live dark-mode preview harness
// exists), so every block is a gap; the component name on each names what it
// would preview rather than repeating one generic label.
const RULES = [
  { title: 'Depth by surface, not shadow', body: '--sh-card and --sh-primary become none; a card reads as raised because #161C26 sits on #0F141C. Only toasts, panels, and dialogs keep a shadow, and it goes darker rather than softer.' },
  { title: 'The fill flips its text', body: 'White on a dark-mode green never clears 4.5:1 at a usable brightness, so the filled green lightens to #2FB25F and takes #0B1017 text (6.95:1). Read it from --green-on-fill so one button component serves both themes.' },
  { title: 'Tints become translucent', body: 'Every status tint is the tone at 14–24% over whatever surface it lands on — 7% for neutral chips and row hover — paired with the light tone as text — so a chip works on a card, a sunken strip, and a hovered row without a third value.' },
  { title: 'Geometry never changes', body: 'Same 38px fields, 9px radius, 22px chips, 32px notices, 24px gutters. Dark mode is a palette swap — if a size changes between themes, it is a bug.' },
]
</script>

<template>
  <DemoCard title="Dark mode">
    <DemoBlocks>
      <DemoBlock label="CHIPS &amp; TONES">
        <DemoGap component="DarkModePreview: chips &amp; tones" group="Dark mode" />
      </DemoBlock>

      <DemoBlock label="TABS &amp; STAGE CARDS">
        <DemoGap component="DarkModePreview: tabs &amp; stage cards" group="Dark mode" />
      </DemoBlock>

      <DemoBlock label="FIELDS &amp; DROPDOWN">
        <DemoGap component="DarkModePreview: fields &amp; dropdown" group="Dark mode" />
      </DemoBlock>

      <DemoBlock label="SELECTION &amp; FILES">
        <DemoGap component="DarkModePreview: selection &amp; files" group="Dark mode" />
      </DemoBlock>

      <DemoBlock label="DIALOG, EMPTY, SKELETON &amp; PAGINATION">
        <DemoGap component="DarkModePreview: dialog, empty, skeleton &amp; pagination" group="Dark mode" />
      </DemoBlock>

      <DemoBlock label="TOASTS, NOTICES &amp; TABLE">
        <DemoGap component="DarkModePreview: toasts, notices &amp; table" group="Dark mode" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
