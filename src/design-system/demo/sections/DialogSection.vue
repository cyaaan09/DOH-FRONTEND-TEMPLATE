<script setup>
import { ref } from 'vue'
import { Button, Dialog, EmptyState, Skeleton } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'

// Appendix D.1, "Dialog, empty state & loading". Three sub-blocks on a 300px
// grid; the dialog itself is a modal the first block opens.
const open = ref(false)
</script>

<template>
  <DemoCard
    title="Dialog, empty state &amp; loading"
    description="The three states a table can be in besides full, plus the one modal pattern — confirmation before an irreversible action."
  >
    <!-- Appendix D.1 — 300px track, gap 22px 24px, align-items: start,
         closing the card at 24px. -->
    <DemoBlocks min="300px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock
        label="CONFIRMATION DIALOG"
        footnote="Destructive confirmations name the consequence, not the action."
      >
        <Button size="compact" variant="destructive" @click="open = true">
          Revoke certificate
        </Button>
      </DemoBlock>

      <DemoBlock label="EMPTY STATE">
        <EmptyState
          title="Nothing matches those filters"
          description="Clear the search or switch back to all types."
        >
          <Button size="compact" variant="secondary">Reset filters</Button>
        </EmptyState>
      </DemoBlock>

      <DemoBlock label="SKELETON ROWS" footnote="Three rows only — never a full page of shimmer.">
        <Skeleton :columns="['1.6fr', '0.7fr', '1fr']" />
      </DemoBlock>
    </DemoBlocks>

    <Dialog
      v-model="open"
      title="Revoke this certificate?"
      description="You will not be able to sign documents until a new PNPKI certificate is uploaded and verified. Documents already signed stay valid."
      confirm-label="Revoke"
      cancel-label="Keep certificate"
      @confirm="open = false"
    />
  </DemoCard>
</template>
