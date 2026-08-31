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
    title: 'Grouped, capped, counted',
    body: 'Max three groups and four rows each, every group counted in its header. Everything beyond that lives behind See all \u2014 a scrolling result list is a results page in disguise.',
  },
  {
    title: 'Mono for the identifier',
    body: "Every row's second line is the thing you would paste into a search: the LTO number, the filing date. Absent, it says so plainly.",
  },
  {
    title: 'Keyboard is the point',
    body: 'Slash or cmd-K opens, arrows move, Enter opens, Esc closes and restores the previous query. The first result is preselected but never auto-navigated.',
  },
  {
    title: 'Field merges with the panel',
    body: 'The open field squares its bottom corners and the panel continues it \u2014 one object, not a field with a floating list.',
  },
]
</script>

<template>
  <DemoCard
    title="Search with results"
    description="One field, results grouped by what they are, and a keyboard path from first keystroke to open record. Distinct from the plain filter field in the table toolbar, which narrows a list already on screen."
  >
    <DemoBlocks>
      <DemoBlock label="FACILITIES · 3">
        <DemoGap component="SearchResults" group="Search with results" />
      </DemoBlock>

      <DemoBlock label="APPLICATIONS · 1">
        <DemoGap component="SearchResults" group="Search with results" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
