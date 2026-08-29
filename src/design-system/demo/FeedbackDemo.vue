<script setup>
import { Notice, Skeleton } from '@/design-system'
</script>

<template>
  <div class="flex flex-col gap-4">
    <Notice tone="green" label="Success">You have successfully updated the user's role.</Notice>
    <Notice tone="amber" label="Warning">Inspection is due within 7 days.</Notice>
    <Notice tone="red" label="Error">Inspection is overdue by 4 days.</Notice>
    <Notice tone="blue" label="Info">Legacy records are read-only.</Notice>

    <div class="max-w-md">
      <p class="text-hint text-text-meta mb-2">Skeleton — three rows only</p>
      <Skeleton />
    </div>
  </div>
</template>
