<script setup>
import { Notice, Skeleton } from '@/design-system'
</script>

<template>
  <div class="flex flex-col gap-4">
    <Notice tone="green" label="Success">
      You have successfully updated user's <strong class="font-bold">role and permissions.</strong>
    </Notice>
    <Notice tone="blue" label="Info">
      This application was returned to the facility on Aug 19. It reappears here
      <strong class="font-bold">once they resubmit.</strong>
    </Notice>
    <Notice tone="amber" label="Warning">
      Your certificate uses an older encryption format. A converted copy is stored alongside it —
      <strong class="font-bold">no action needed.</strong>
    </Notice>
    <Notice tone="red" label="Error">
      Inspection is overdue by 4 days. The licence cannot be issued
      <strong class="font-bold">until the report is uploaded.</strong>
    </Notice>

    <div class="max-w-md">
      <p class="text-hint text-text-meta mb-2">Skeleton — three rows only</p>
      <Skeleton />
    </div>
  </div>
</template>
