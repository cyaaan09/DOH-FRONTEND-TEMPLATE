<script setup>
import { ref } from 'vue'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'
import {
  ChartEmpty,
  ChartPanel,
  ChartReadout,
  ChartStatCard,
  DonutChart,
  HorizontalBars,
  LineChart,
  StackedBars,
} from '@/design-system'

// Appendix D.1, "Charts". Every figure is the artifact's own, and the sets are
// internally consistent on purpose: the twelve months below sum to 744, the
// stacked legend to 122, the ranked rows to 211.

// Decoded from the artifact's published `d` attribute — geometry.spec.js
// reproduces that path byte for byte from exactly these numbers.
const MONTHS = [38, 44, 41, 52, 61, 57, 66, 72, 68, 81, 76, 88]
const MONTH_LABELS = [
  'Sep 25',
  'Oct',
  'Nov',
  'Dec',
  'Jan 26',
  'Feb',
  'Mar 26',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
]

// Redline "Status series" — a chart about licence state uses the status tones.
const SERIES = [
  { key: 'ok', label: 'On track', tone: 'var(--chart-ok)' },
  { key: 'warn', label: 'No renewal', tone: 'var(--chart-warn)' },
  { key: 'bad', label: 'Overdue', tone: 'var(--chart-bad)' },
]

/*
 * The artifact's own bar heights do not reconcile with its own labels or its
 * legend — November is drawn 42px where its value asks for 32.8, and only one
 * column carries a "no renewal" segment though the legend totals 27. It is a
 * hand-drawn mockup at that level of detail.
 *
 * So the split below is derived rather than copied, under three constraints
 * the artifact DOES state: each column sums to its own label (18, 25, 12, 32,
 * 21, 14 = 122), each series sums to its legend entry (86 / 27 / 9), and
 * December matches the hover-readout demo exactly (22 / 7 / 3).
 */
const COLUMNS = [
  {
    label: 'Sep',
    segments: [
      { key: 'ok', value: 13 },
      { key: 'warn', value: 4 },
      { key: 'bad', value: 1 },
    ],
  },
  {
    label: 'Oct',
    segments: [
      { key: 'ok', value: 19 },
      { key: 'warn', value: 5 },
      { key: 'bad', value: 1 },
    ],
  },
  {
    label: 'Nov',
    segments: [
      { key: 'ok', value: 9 },
      { key: 'warn', value: 3 },
      { key: 'bad', value: 0 },
    ],
  },
  {
    label: 'Dec',
    segments: [
      { key: 'ok', value: 22 },
      { key: 'warn', value: 7 },
      { key: 'bad', value: 3 },
    ],
  },
  {
    label: 'Jan',
    segments: [
      { key: 'ok', value: 15 },
      { key: 'warn', value: 4 },
      { key: 'bad', value: 2 },
    ],
  },
  {
    label: 'Feb',
    segments: [
      { key: 'ok', value: 8 },
      { key: 'warn', value: 4 },
      { key: 'bad', value: 2 },
    ],
  },
]

const TYPES = [
  { label: 'Primary Care Facility', value: 96, tone: 'var(--chart-ok-strong)' },
  { label: 'Birthing Home', value: 58, tone: 'var(--series-2)' },
  { label: 'Clinical Laboratory', value: 34, tone: 'var(--series-3)' },
  { label: 'Infirmary', value: 15, tone: 'var(--series-4)' },
  { label: 'Level 1 Hospital', value: 8, tone: 'var(--series-5)' },
]

const STATUS = [
  { label: 'Active', value: 178, tone: 'var(--chart-ok)' },
  { label: 'Expiring', value: 21, tone: 'var(--chart-warn)' },
  { label: 'Overdue', value: 8, tone: 'var(--chart-bad)' },
  { label: 'Closed', value: 4, tone: 'var(--chart-idle)' },
]

// Redline "Direction, not sign". The last two both FELL and both are good:
// fewer overdue renewals and a shorter median are improvements, so the pill is
// green with a ▼. This demo exists to show that.
const STATS = [
  {
    label: 'Issued this month',
    figure: 88,
    delta: '15.8%',
    direction: 'up',
    tone: 'good',
    values: MONTHS.slice(-8),
  },
  {
    label: 'Awaiting inspection',
    figure: 24,
    delta: '4',
    direction: 'up',
    tone: 'watch',
    values: [14, 17, 15, 19, 18, 22, 20, 24],
    chartTone: 'var(--chart-warn)',
  },
  {
    label: 'Overdue renewals',
    figure: 8,
    delta: '3',
    direction: 'down',
    tone: 'good',
    values: [17, 15, 16, 13, 12, 11, 9, 8],
  },
  {
    label: 'Median days to issue',
    figure: 11,
    delta: '1.5',
    direction: 'down',
    tone: 'good',
    values: [16, 15, 15, 14, 13, 13, 12, 11],
  },
]

const READOUT = [
  { label: 'On track', value: 22, tone: 'var(--chart-ok)' },
  { label: 'No renewal', value: 7, tone: 'var(--chart-warn)' },
  { label: 'Overdue', value: 3, tone: 'var(--chart-bad)' },
]

const RULES = [
  {
    title: 'Figure first, plot second',
    body: 'Every panel opens with a 26px mono figure, its delta as a tinted pill, and the period on the right. A user who reads only the header still leaves correct — the plot adds shape, not the answer.',
  },
  {
    title: 'Status tones outrank the ramp',
    body: 'If a chart is about licence state, it uses green, amber, red, grey exactly as the tables do. The categorical ramp is only for neutral splits — facility type, region, inspector.',
  },
  {
    title: 'One emphasised element',
    body: 'The peak bar, the top category, and the latest point are the only things at full weight; everything else steps back a shade. A chart where all six bars shout has no finding.',
  },
  {
    title: 'Hairlines, not boxes',
    body: 'Three gridlines max, the middle one #F3F5F9, no axis line, no ticks, no plot border. Structure comes from the panel edge and the type, never from a frame around the data.',
  },
]

const rangeReset = ref(0)
</script>

<template>
  <DemoCard
    title="Charts"
    description="Five chart types, no more. Every panel leads with the figure it is about, then draws it — so a glance answers the question and the plot only adds the shape. Status tones keep their meaning inside charts: green is still issued, red is still overdue."
  >
    <!-- Appendix D.1 — one auto-fit grid at a 430px minimum, gap 14px. -->
    <DemoBlocks min="430px" gap="14px" pb="22px">
      <DemoBlock label="LINE + AREA — ONE SERIES OVER TIME">
        <ChartPanel
          label="Licences issued"
          :figure="88"
          delta="15.8%"
          delta-direction="up"
          delta-tone="good"
          period="This month"
          note="744 in 12 months"
        >
          <LineChart :values="MONTHS" :labels="MONTH_LABELS" />
        </ChartPanel>
      </DemoBlock>

      <DemoBlock label="STACKED BARS — COMPOSITION PER PERIOD">
        <ChartPanel
          label="Expiring in the next 6 months"
          :figure="122"
          delta="36 at risk"
          delta-tone="watch"
          period="Renewal load"
          note="peak in December"
        >
          <StackedBars :columns="COLUMNS" :series="SERIES" emphasis="Dec" />
          <template #footer>
            <span class="charts__legend">
              <span v-for="s in SERIES" :key="s.key" class="charts__legend-item">
                <span class="charts__swatch" aria-hidden="true" :style="{ background: s.tone }" />
                {{ s.label }}
                <b class="font-mono">{{
                  COLUMNS.reduce((n, c) => n + c.segments.find((x) => x.key === s.key).value, 0)
                }}</b>
              </span>
            </span>
          </template>
        </ChartPanel>
      </DemoBlock>

      <DemoBlock label="HORIZONTAL BARS — RANKED CATEGORIES">
        <ChartPanel
          label="Facilities by type"
          :figure="211"
          period="Active licences"
          note="5 categories"
        >
          <HorizontalBars :rows="TYPES" :total="211" />
        </ChartPanel>
      </DemoBlock>

      <DemoBlock label="DONUT — PARTS OF ONE WHOLE, 4 SLICES MAX">
        <ChartPanel
          label="Licence status"
          figure="84%"
          delta="In good standing"
          delta-tone="good"
          period="211 licences"
        >
          <DonutChart :slices="STATUS" :centre-value="178" centre-label="active" />
        </ChartPanel>
      </DemoBlock>

      <DemoBlock label="SPARKLINES — INSIDE A STAT CARD">
        <div class="charts__stats">
          <ChartStatCard
            v-for="stat in STATS"
            :key="stat.label"
            :label="stat.label"
            :figure="stat.figure"
            :delta="stat.delta"
            :delta-direction="stat.direction"
            :delta-tone="stat.tone"
            :values="stat.values"
            :tone="stat.chartTone ?? 'var(--chart-ok)'"
          />
        </div>
      </DemoBlock>

      <DemoBlock label="HOVER READOUT">
        <!-- Same tinted wrapper the artifact gives the empty demo: neither is
             a chart, so neither gets a chart panel. -->
        <div class="charts__empty-wrap charts__readout">
          <ChartReadout period="DECEMBER 2026" :rows="READOUT" />
        </div>
      </DemoBlock>

      <DemoBlock
        label="NO DATA — NOT AN EMPTY FRAME"
        footnote="A chart with no data says why and offers the fix. Never a gridded frame with nothing in it, and never a zero-line that reads as real data."
      >
        <!-- Deliberately NOT a ChartPanel. The artifact wraps this one in a
             plain tinted card with no header at all — and it is right to: a
             panel header would have to show a figure, and a 0 above an empty
             chart is exactly the "zero-line that reads as real data" the
             footnote below warns against. -->
        <div class="charts__empty-wrap">
          <ChartEmpty
            :key="rangeReset"
            title="No licences issued in this range"
            reason="The first LTO in Caraga was issued in March 2019."
            action-label="Reset to last 12 months"
            @action="rangeReset++"
          />
        </div>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* The artifact's own wrapper for the empty demo: 18px pad, 1px --divider,
   radius 14px, on --surface-card-muted. */
.charts__empty-wrap {
  padding: 18px;
  border: 1px solid var(--divider);
  border-radius: var(--r-card);
  background: var(--surface-card-muted);
}

/* Redline "Stat card" row — the sparkline cards sit in their own 200px grid. */
.charts__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 12px;
}

.charts__readout {
  display: grid;
  place-items: center;
}

/* Redline "Legend · 8px radius-2 swatch + 11.5px --ink-700, value appended in
   mono / 700 --ink-900 · gap 14px · in the panel footer". */
.charts__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.charts__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--ink-700);
}

.charts__legend-item b {
  font-weight: 700;
  color: var(--ink-900);
}

.charts__swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
</style>
