<route lang="json">
{ "meta": { "layout": "app" } }
</route>

<script setup>
import { ChartPanel, ChartStatCard, HorizontalBars, LineChart, Page } from '@/design-system'
import PageHeader from '@/components/PageHeader.vue'

// Placeholder figures. They are internally consistent — the twelve months sum
// to 744, the five types to 211 — so the page reads as real while it is not.
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

const TYPES = [
  { label: 'Primary Care Facility', value: 96, tone: 'var(--chart-ok-strong)' },
  { label: 'Birthing Home', value: 58, tone: 'var(--series-2)' },
  { label: 'Clinical Laboratory', value: 34, tone: 'var(--series-3)' },
  { label: 'Infirmary', value: 15, tone: 'var(--series-4)' },
  { label: 'Level 1 Hospital', value: 8, tone: 'var(--series-5)' },
]
</script>

<template>
  <Page width="table">
    <!-- width="table" is Appendix C's WIDE bucket — "Content max-w · 1320px
         detail · 1560px tables". The name comes from the redline's own wording;
         the distinction it draws is between a reading column and a wide
         overview, and a dashboard of side-by-side panels is the latter. At
         1320 the panels left a canvas margin wider than a nav rail. -->
    <!-- No Section around these. Redline "Section · cards never nest — divide
         or sink instead": every stat card and chart panel below is already a
         card, and a Section would be a seventh one wrapped around the other
         six. The canvas IS the page's background. -->
    <PageHeader title="Dashboard" subtitle="Licensing activity across the region." />

    <div class="dashboard__stats">
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

    <div class="dashboard__panels">
      <ChartPanel
        label="Licences issued"
        :figure="88"
        delta="15.8%"
        delta-direction="up"
        period="This month"
        note="744 in 12 months"
      >
        <LineChart :values="MONTHS" :labels="MONTH_LABELS" />
      </ChartPanel>

      <ChartPanel
        label="Facilities by type"
        :figure="211"
        period="Active licences"
        note="5 categories"
      >
        <HorizontalBars :rows="TYPES" :total="211" />
      </ChartPanel>
    </div>
  </Page>
</template>

<style scoped>
.dashboard__stats,
.dashboard__panels {
  display: grid;
  gap: 14px;
}

.dashboard__stats {
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
}

.dashboard__panels {
  grid-template-columns: repeat(auto-fit, minmax(min(430px, 100%), 1fr));
  margin-top: 14px;
}
</style>
