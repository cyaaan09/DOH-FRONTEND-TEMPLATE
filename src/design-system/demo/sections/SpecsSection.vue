<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoGap from '../chrome/DemoGap.vue'
import { StatCard, Meter } from '@/design-system'
</script>

<template>
  <DemoCard
    title="Component specs"
    description="Redlines for everything above — geometry, type, and the exact colour per state. Values are literal CSS."
  >
    <div class="mb-4">
      <p class="text-caption text-text-meta mb-2.5">
        Stat cards and meters have redlines in this appendix but no section of their own on the
        source page, so they are shown here rather than in a section the artifact does not have.
      </p>
      <div class="specs-section__stat-grid">
        <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" dot="green" />
        <StatCard label="Inspection" value="8" hint="2 overdue" dot="amber" urgent />
        <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
      </div>
      <div class="mt-4 max-w-sm">
        <Meter :value="62" :max="100" label="Upload progress" caption="Uploaded" />
      </div>
    </div>
    <DemoBlocks>
      <DemoGap component="SpecTables" />
    </DemoBlocks>
  </DemoCard>
</template>

<style scoped>
/* Redline "Grid" (Stat cards & meters) — auto-fit at a 190px minimum. */
.specs-section__stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px; /* redline "Grid" — gap 12px; no spacing token for it */
}
</style>
