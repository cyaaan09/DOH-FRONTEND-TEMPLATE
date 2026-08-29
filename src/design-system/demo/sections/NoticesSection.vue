<script setup>
import { Notice } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoRules from '../chrome/DemoRules.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Rule cards - spec Appendix D, toastRules
const RULES = [
  {
    title: 'One line, one consequence',
    body: 'Title names what happened, body carries the detail a user would otherwise go looking for.',
  },
  {
    title: 'Actions live in the toast',
    body: 'Undo, Retry, and View belong here — a toast with no action and no detail should have been a quiet state change.',
  },
  {
    title: 'Three at most',
    body: 'Older toasts drop off the bottom of the stack; a fourth event means the page itself should say something.',
  },
]
</script>

<template>
  <DemoCard
    title="Toasts &amp; inline notices"
    description="Toasts confirm something you just did and leave. Notices explain a state that stays — they live in the layout, never float."
  >
    <DemoBlocks>
      <DemoGap component="Toast + ToastRegion" group="Toasts &amp; notices" />
    </DemoBlocks>

    <DemoStrip label="INLINE NOTICES — PERSISTENT, IN-FLOW">
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
      </div>
    </DemoStrip>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
