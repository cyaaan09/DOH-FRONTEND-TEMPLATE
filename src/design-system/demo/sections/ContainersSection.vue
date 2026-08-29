<script setup>
import { Button, Card, CardBody, CardFooter, CardHeader } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Rule cards - spec Appendix D, containerRules
const RULES = [
  {
    title: 'Cards never nest',
    body: 'A card that needs internal structure divides with 1px #EEF1F6 rules or drops to a sunken strip. Two stacked shadows means the layout is wrong.',
  },
  {
    title: '22px between cards, 24px inside',
    body: 'Section gap 22px, card gutter 24px (20px on narrow cards), 12px between cards in a stat grid. Nothing else.',
  },
  {
    title: 'One elevation per layer',
    body: 'Cards 0 1px 2px, popovers 0 12px 28px, dialogs 0 24px 60px. Elevation signals layer, never importance.',
  },
]

// Inner surfaces - Appendix D's sub-block list names this block but does
// not give per-swatch captions. The label/caption pairs below are Appendix
// C's own "Containers & surfaces" redline row for each surface, matched to
// the bg-surface-* token that actually carries that hex value: Sunken strip
// -> bg-surface-sunken, Input well -> bg-surface-input, Control shell ->
// bg-surface-muted. Appendix C's separate "Muted card" row is a different
// hex (#FBFCFE) with no bg-surface-* token and is not one of the four rows
// named in the task brief.
const SURFACES = [
  {
    cls: 'bg-surface-sunken border border-hairline',
    label: 'Sunken strip',
    caption: 'expanded rows, headers, footers',
  },
  {
    cls: 'bg-surface-input border border-hairline',
    label: 'Input well',
    caption: 'read-only fields, in-panel search',
  },
  {
    cls: 'bg-surface-muted border border-hairline',
    label: 'Control shell',
    caption: 'segmented tabs, row hover in nav',
  },
  {
    cls: 'demo-dashed-swatch',
    label: 'Dashed panel',
    caption: 'dropzones, empty states only',
  },
]
</script>

<template>
  <DemoCard
    title="Containers &amp; surfaces"
    description="Three surfaces, and nothing else: the canvas #EEF1F6 that everything sits on, the card #FFF that holds content, and the sunken strip #FAFBFD for headers, footers, and expanded rows inside a card. Cards never nest inside cards — a card divides instead."
  >
    <DemoBlocks>
      <DemoBlock label="PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT">
        <DemoGap component="AppShell" group="App shell — sidebar &amp; header" />
      </DemoBlock>

      <DemoBlock label="CARD — HEADER, BODY, FOOTER">
        <Card>
          <CardHeader title="Certificate" subtitle="Body sits on white, 24px gutter.">
            <template #actions>
              <Button size="compact" variant="secondary">Action</Button>
            </template>
          </CardHeader>
          <CardBody>
            Radius 14px, 1px hairline, and the card shadow. Cards never nest — a card divides instead.
          </CardBody>
          <CardFooter>
            <Button size="compact" variant="ghost">Cancel</Button>
            <Button size="compact">Save</Button>
          </CardFooter>
        </Card>
      </DemoBlock>

      <DemoBlock label="DIVIDED CARD — NO NESTING">
        <DemoGap component="DividedCard" group="Containers &amp; surfaces" />
      </DemoBlock>

      <DemoBlock label="INNER SURFACES">
        <div class="flex flex-col gap-2.5">
          <div v-for="surface in SURFACES" :key="surface.label" class="flex items-center gap-2.5">
            <div class="h-9 w-9 shrink-0 rounded-tile" :class="surface.cls" />
            <div>
              <div class="text-caption font-bold text-ink-900">{{ surface.label }}</div>
              <p class="text-caption text-text-meta">{{ surface.caption }}</p>
            </div>
          </div>
        </div>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix C "Dashed panel" - 1.6px dashed, no Tailwind border-width utility
 * matches 1.6px; same escape hatch DemoGap uses for the same treatment. */
.demo-dashed-swatch {
  border: 1.6px dashed var(--border-dashed);
}
</style>
