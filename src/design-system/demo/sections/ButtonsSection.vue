<script setup>
import { ref } from 'vue'
import { Button } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'

const busy = ref(false)

function runBusy() {
  busy.value = true
  setTimeout(() => (busy.value = false), 1600)
}
</script>

<template>
  <DemoCard
    title="Buttons"
    description="38px default, 34px compact, 44px for the one primary action on a mobile-width form. One filled green button per screen region."
  >
    <!-- Appendix D.1 — the body is a flex COLUMN of two rows at gap 16px,
         padding 18px 24px 22px; not the DemoBlocks grid. DemoBlocks supplies
         that padding and holds the column as its single cell, so its own
         track and gap never come into play. -->
    <DemoBlocks pb="22px">
      <div class="flex flex-col gap-4">
        <!-- Row 1 — the 38px default size, one button per variant, closing
             with the disabled dress. `Sign document` appears here disabled
             AND in row 2 as the busy control; both are the artifact's. -->
        <div class="flex flex-wrap items-center gap-btn-row">
          <Button variant="primary">Verify &amp; save</Button>
          <Button variant="secondary">Export CSV</Button>
          <Button variant="destructive">Revoke licence</Button>
          <Button variant="ghost">View logs</Button>
          <Button variant="secondary" disabled>Sign document</Button>
        </div>

        <!-- Row 2 — the 34px compact size. Apply is PRIMARY and Reset
             filters SECONDARY; they were built a variant apart each, which
             left the row with no filled button at all. -->
        <div class="flex flex-wrap items-center gap-btn-row">
          <Button size="compact" variant="primary">Apply</Button>
          <Button size="compact" variant="secondary">Reset filters</Button>
          <Button size="icon" variant="secondary" aria-label="More actions">⋯</Button>
          <Button size="compact" variant="primary" :busy="busy" @click="runBusy">
            {{ busy ? 'Signing…' : 'Sign document' }}
          </Button>
          <span class="text-hint text-text-meta"
            >Compact 34px row · click the last one for the pending state</span
          >
        </div>
      </div>
    </DemoBlocks>
  </DemoCard>
</template>
