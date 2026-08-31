<script setup>
import { AutoGrid, Cluster, Column, Grid, GridItem, Row, Sidebar, Split } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'
import PrimitiveCard from '../chrome/PrimitiveCard.vue'
import PrimitiveTile from '../chrome/PrimitiveTile.vue'

// Appendix D.1, "Layout primitives". Eight cards on a 300px auto-fit grid at
// gap 14, each pairing a signature with a live example of the primitive it
// names — the well arranges real Rows and Grids, not a picture of them, so a
// primitive that breaks takes its own documentation down with it.
const RULES = [
  {
    title: 'Primitives own spacing only',
    body: 'A Row sets direction, gap, and alignment. The moment one grows a background or a border it stops being a primitive and becomes a card — put that in Section instead.',
  },
  {
    title: 'One gap scale',
    body: '6 and 8 inside a control, 12 between siblings, 14 in table rows, 16 in form rows, 22 between cards, 24 form columns and card padding, 32 page gutter. No 10, no 18, no 20.',
  },
  {
    title: 'Gap, never margin',
    body: 'Spacing lives on the container so drag-reorder, delete, and duplicate keep working. A child with its own margin breaks the rhythm the moment it moves.',
  },
  {
    title: 'min-width: 0 on flex children',
    body: 'Any Row or Grid child holding text that must clip needs it, or the ellipsis silently stops working and the layout widens instead.',
  },
]
</script>

<template>
  <DemoCard
    title="Layout primitives — Row, Column &amp; containers"
    description="Eight primitives cover every screen in OLRS. They own spacing and direction only — never colour, border, or padding of their own — so a screen is composed, not hand-measured. Gaps come from one 4px-based scale: 6, 8, 12, 14, 16, 22, 24, 32."
  >
    <div class="layout-section__grid px-card-x pt-4.5 pb-6">
      <PrimitiveCard
        signature="<Row gap align justify wrap>"
        description="Horizontal flex. Default align center, gap 12. Every toolbar, button pair, and label row is a Row — never inline siblings spaced by whitespace."
      >
        <Row>
          <PrimitiveTile label="flex 1" grow />
          <PrimitiveTile label="auto" width="74px" />
          <PrimitiveTile label="auto" width="54px" />
        </Row>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<Column gap align>"
        description="Vertical flex. Default gap 12, align stretch. Use for stacked fields, card bodies, and sidebars — the workhorse of the system."
      >
        <Column>
          <PrimitiveTile label="child" />
          <PrimitiveTile label="child" />
        </Column>
      </PrimitiveCard>

      <PrimitiveCard
        signature='<Grid cols=12 gap="16 24">'
        description="The form grid. Twelve minmax(0,1fr) tracks, 16px row and 24px column gap; children span 4, 6, 8, or 12 and floor at 172px."
      >
        <Grid>
          <GridItem :span="6"><PrimitiveTile label="6" /></GridItem>
          <GridItem :span="6"><PrimitiveTile label="6" /></GridItem>
          <GridItem :span="12"><PrimitiveTile label="12" /></GridItem>
        </Grid>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<AutoGrid min=260>"
        description="repeat(auto-fit, minmax(min, 1fr)) with gap 12. Stat cards, stage cards, and detail panels — reflows without a media query."
      >
        <AutoGrid min="110px">
          <PrimitiveTile label="card" />
          <PrimitiveTile label="card" />
        </AutoGrid>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<Split>"
        description="Row with a flex:1 spacer between the two groups. Card headers, table toolbars, form footers — anything with content left and actions right."
      >
        <Split>
          <PrimitiveTile label="left" />
          <template #end><PrimitiveTile label="actions" width="82px" /></template>
        </Split>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<Cluster gap=8>"
        description="Row with wrap on. Chips, tags, filter pills, service lists — a group whose count you do not control."
      >
        <Cluster>
          <PrimitiveTile v-for="n in 5" :key="n" label="chip" width="58px" />
        </Cluster>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<Sidebar side=left w=244>"
        description="The app shell: fixed rail plus flex:1 main, collapsing to 62px under 1024px and off-canvas under 768px. One per page."
      >
        <Sidebar class="layout-section__sidebar">
          <template #rail><PrimitiveTile label="244" /></template>
          <PrimitiveTile label="main" />
        </Sidebar>
      </PrimitiveCard>

      <PrimitiveCard
        signature="<Page> and <Section>"
        description="Page caps width — 1320px detail, 1560px tables — on a 32px gutter. Section is a card plus 22px below it. Cards never nest: divide or sink instead."
      >
        <Column :gap="8">
          <PrimitiveTile label="Section — card" />
          <PrimitiveTile label="Section — card" />
        </Column>
      </PrimitiveCard>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — 300px auto-fit at gap 14. Not AutoGrid itself: this grid is
   demo chrome arranging the cards that DOCUMENT AutoGrid, and using the
   primitive to lay out its own documentation would hide a break in it. */
.layout-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 14px;
}

/* The Sidebar demo needs a gap its own primitive does not own — Sidebar sets
   direction and widths only, per the Rule row. */
.layout-section__sidebar {
  gap: 8px;
}
</style>
