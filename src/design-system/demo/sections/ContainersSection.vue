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

// Inner surfaces - Appendix D.1 "Containers & surfaces -> INNER SURFACES" records
// the bespoke markup: a white card holding four filled tint rows, with the
// caption (hex included) set as the row's own text, not a swatch beside a
// label. demo/ is exempt from the raw-hex guard so these captions can quote
// the literal values as content, per D.1.
const SURFACES = [
  {
    cls: 'bg-surface-sunken text-ink-600 border border-divider',
    caption: 'Sunken strip #FAFBFD — expanded row, footer',
  },
  {
    cls: 'bg-surface-input text-ink-600 border border-hairline',
    caption: 'Input well #F7F9FC — read-only fields, panel search',
  },
  {
    cls: 'bg-surface-muted text-ink-600',
    caption: 'Control shell #F4F6FA — segmented tabs, hover',
  },
  {
    cls: 'demo-surface-row--dashed text-text-meta',
    caption: 'Dashed #CDD5E2 — dropzones and empty states only',
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
        <div
          class="flex flex-col gap-2.5 rounded-card border border-hairline bg-surface shadow-card pt-4 px-5 pb-4.5"
        >
          <div
            v-for="surface in SURFACES"
            :key="surface.caption"
            class="demo-surface-row text-caption"
            :class="surface.cls"
          >
            {{ surface.caption }}
          </div>
        </div>
        <p class="text-hint text-text-meta mt-2">Four tints, each with one job. No new greys.</p>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 "INNER SURFACES" row treatment - padding 11px 13px and radius
 * 10px match no Tailwind spacing/radius step, so they are expressed here,
 * the same escape hatch DemoGap uses for its own 11px/13px padding. */
.demo-surface-row {
  padding: 11px 13px;
  border-radius: 10px;
}

.demo-surface-row--dashed {
  border: 1.6px dashed var(--border-dashed);
}
</style>
