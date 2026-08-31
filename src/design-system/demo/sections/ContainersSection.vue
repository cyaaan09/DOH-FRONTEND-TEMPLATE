<script setup>
import { Button, Card, CardFooter, CardHeader, DividedCard } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Rule cards - spec Appendix D, containerRules
// Appendix D.1's DIVIDED CARD — four facts, the two dates in mono.
const FACTS = [
  { label: 'HOLDER', value: 'LGU Carmen' },
  { label: 'TYPE', value: 'Government' },
  { label: 'VALID FROM', value: '2026-07-28', mono: true },
  { label: 'EXPIRES', value: '2036-07-25', mono: true },
]

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
    <!-- Appendix D.1 — the shell block sits in its own full-width wrapper
         (18px 24px 22px); the other three share a 300px grid below it that
         closes the card at 24px with no top padding of its own. -->
    <div class="px-card-x pt-4.5 pb-5.5">
      <div class="text-column-header text-text-header mb-2.5">
        PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT
      </div>
      <!-- A SCHEMATIC, not a live AppShell: the artifact draws a 172px
           miniature of the layout with its measurements written on it. The
           skeleton had marked this slot as a missing AppShell component;
           nothing on this page renders one. -->
      <div
        data-shell-schematic
        class="containers__shell flex overflow-hidden rounded-panel border border-hairline bg-canvas"
      >
        <div class="containers__rail flex flex-none flex-col bg-surface">
          <div class="containers__bar" />
          <div class="containers__bar containers__bar--active" />
          <div class="containers__bar" />
          <div class="containers__bar" />
          <div class="flex-1" />
          <div class="containers__measure">244px</div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="containers__header flex flex-none items-center">STICKY HEADER · z 6</div>
          <div class="containers__content flex flex-1 flex-col">
            <div class="containers__panel containers__panel--bar" />
            <div class="containers__panel containers__panel--main flex items-end">
              cards · 22px apart · max-w 1320 / 1560px
            </div>
          </div>
        </div>
      </div>
    </div>

    <DemoBlocks min="300px" gap="20px" pt="0px" pb="24px">
      <DemoBlock
        label="CARD — HEADER, BODY, FOOTER"
        footnote="Radius 14px · 1px #E4E8EF · shadow 0 1px 2px rgba(16,24,40,.04)."
      >
        <!-- Appendix D.1 — header + footer, no body, and the footer pairs a
             caption with ONE action rather than stacking buttons. Both take
             the narrow 20px gutter Appendix C allows for cards under ~360px,
             which is what a 300px grid cell is. -->
        <Card>
          <CardHeader narrow title="Certificate" subtitle="Body sits on white, 20px gutter." />
          <CardFooter narrow spread>
            <span class="text-hint text-text-meta">Footer on the sunken tint</span>
            <Button size="compact" variant="secondary">Action</Button>
          </CardFooter>
        </Card>
      </DemoBlock>

      <DemoBlock
        label="DIVIDED CARD — NO NESTING"
        footnote="Facts split by 1px #EEF1F6 rules — never by inner cards."
      >
        <DividedCard :cells="FACTS" />
      </DemoBlock>

      <DemoBlock label="INNER SURFACES" footnote="Four tints, each with one job. No new greys.">
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

<style scoped>
/* Appendix D.1's page-shell schematic — a 172px miniature with its own
   measurements drawn on it. Every value here is a diagram dimension, not a
   redline: the shell it pictures is Appendix C's "App shell" group, which no
   section on this page renders. */
.containers__shell {
  height: 172px;
}

.containers__rail {
  width: 86px;
  gap: 6px;
  padding: 10px 8px;
  border-right: 1px solid var(--border-card);
}

.containers__bar {
  height: 12px;
  border-radius: 4px;
  background: var(--canvas);
}

.containers__bar--active {
  height: 22px;
  border-radius: 6px;
  background: var(--grad-primary);
}

.containers__measure,
.containers__header,
.containers__panel--main {
  font-size: 9.5px;
  color: var(--text-header);
}

.containers__measure {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.containers__header {
  height: 30px;
  padding: 0 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: rgb(255 255 255 / 0.75);
  border-bottom: 1px solid var(--border-card);
}

.containers__content {
  gap: 8px;
  padding: 12px;
}

.containers__panel {
  border-radius: var(--r-control);
  background: var(--surface);
  border: 1px solid var(--border-card);
  box-shadow: var(--sh-card);
}

.containers__panel--bar {
  height: 34px;
}

.containers__panel--main {
  flex: 1;
  padding: 6px 8px;
}
</style>
