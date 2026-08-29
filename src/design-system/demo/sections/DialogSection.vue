<script setup>
import { Skeleton } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
</script>

<template>
  <DemoCard
    title="Dialog, empty state &amp; loading"
    description="The three states a table can be in besides full, plus the one modal pattern — confirmation before an irreversible action."
  >
    <DemoBlocks>
      <DemoBlock label="CONFIRMATION DIALOG">
        <DemoGap component="Dialog" group="Dialog, empty &amp; loading" />
      </DemoBlock>

      <DemoBlock label="EMPTY STATE">
        <DemoGap component="EmptyState" group="Dialog, empty &amp; loading" />
      </DemoBlock>

      <DemoBlock label="SKELETON ROWS">
        <!-- Skeleton already exists in @/design-system; Dialog and EmptyState do not. -->
        <Skeleton />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
