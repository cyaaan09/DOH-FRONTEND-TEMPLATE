<script setup>
import { ref } from 'vue'
import { Button } from '@/design-system'

const busy = ref(false)

function runBusy() {
  busy.value = true
  setTimeout(() => (busy.value = false), 1600)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-btn-row">
      <Button variant="primary">Verify &amp; save</Button>
      <Button variant="secondary">Export CSV</Button>
      <Button variant="destructive">Revoke licence</Button>
      <Button variant="ghost">View logs</Button>
    </div>

    <div class="flex flex-wrap items-center gap-btn-row">
      <Button size="compact" variant="secondary">Apply</Button>
      <Button size="compact" variant="ghost">Reset filters</Button>
      <Button size="touch">Sign document</Button>
      <Button size="icon" variant="secondary" aria-label="More actions">⋯</Button>
    </div>

    <div class="flex flex-wrap items-center gap-btn-row">
      <Button :busy="busy" @click="runBusy">{{ busy ? 'Signing…' : 'Click for busy state' }}</Button>
      <Button disabled variant="secondary">Disabled</Button>
    </div>
  </div>
</template>
