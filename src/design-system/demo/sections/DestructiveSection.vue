<script setup>
import { ref } from 'vue'
import { createToaster } from '@ark-ui/vue/toast'
import { Button, ConfirmDialog, ToastRegion } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Destructive confirmation" — three levels, chosen by how bad
// the mistake is. Level 1 has NO dialog, which is the point of the section's
// last rule card: undo beats confirm.
const level3 = ref(false)
const level2 = ref(false)

// Redline "Level 1 · reversible: no dialog at all — toast with Undo and a
// 3px meter, 10s window". Ten seconds, not the usual five: an undo window is
// only useful if it outlasts the moment of realising the mistake.
const toaster = createToaster({
  placement: 'bottom-end',
  gap: 10,
  offsets: '16px',
  duration: 10000,
  max: 1,
})

function deleteDraft() {
  toaster.create({
    type: 'success',
    title: 'Draft deleted',
    description: 'Nothing was submitted, so nothing was lost.',
    action: { label: 'Undo', onClick: () => {} },
  })
}

const RULES = [
  {
    title: 'Name the consequence, not the action',
    body: 'The body says what happens to the facility, how many things it touches, and whether it can be undone. Are you sure is not information.',
  },
  {
    title: 'The typed string is the identifier',
    body: 'Always the LTO number or facility name shown in mono right above the field \u2014 never the word DELETE, which teaches nothing about what is selected.',
  },
  {
    title: 'Disabled until exact',
    body: 'Trim whitespace, compare case-insensitively, and keep the button visibly disabled with a plain reason under the field. No shake, no toast.',
  },
  {
    title: 'Undo beats confirm',
    body: 'If the action is reversible for even 10 seconds, ship a toast with Undo instead of a dialog. Level 3 exists for the handful that truly are not.',
  },
]
</script>

<template>
  <DemoCard
    title="Destructive confirmation"
    description="Three levels, chosen by how bad the mistake is. A reversible action gets a toast with undo and no dialog at all; a serious one gets a normal dialog; an irreversible one makes you type the thing's name, because a second button is not friction, it is muscle memory."
  >
    <DemoBlocks min="300px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="LEVEL 3 — TYPE TO CONFIRM">
        <Button size="compact" variant="destructive" @click="level3 = true">Revoke licence</Button>
        <ConfirmDialog
          v-model="level3"
          title="Revoke this licence?"
          body="The facility loses the right to operate immediately. Documents already signed stay valid, but the licence cannot be reinstated — a new application is required."
          impact="Affects 1 licence and 2 linked services."
          confirm-phrase="16-19-26-I-2"
          confirm-label="Revoke licence"
          @confirm="level3 = false"
        />
      </DemoBlock>

      <DemoBlock label="LEVEL 2 — SERIOUS, NOT PERMANENT">
        <Button size="compact" variant="destructive" @click="level2 = true"
          >Return application</Button
        >
        <ConfirmDialog
          v-model="level2"
          title="Return this application?"
          body="The facility is notified and can resubmit. Anything already reviewed stays reviewed, so returning does not restart the assessment."
          confirm-label="Return"
          @confirm="level2 = false"
        />
      </DemoBlock>

      <DemoBlock label="LEVEL 1 — REVERSIBLE, NO DIALOG">
        <!-- Redline "Level 1 · no dialog at all". Firing it live is the
             demonstration: nothing interrupts, and the way back is in the
             toast rather than behind a confirmation. -->
        <Button size="compact" variant="secondary" @click="deleteDraft">Delete draft</Button>
        <div class="destructive-section__surface relative overflow-hidden rounded-panel">
          <p class="text-hint text-text-meta">No dialog — the toast carries the way back.</p>
          <ToastRegion :toaster="toaster" contained />
        </div>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* The toast is contained in its own surface rather than fixed to the
   viewport, the same way the Toasts section demonstrates its stack. */
.destructive-section__surface {
  min-height: 150px;
  margin-top: 10px;
  padding: 14px;
  border: 1px dashed var(--border-dashed);
  background: var(--surface-input);
}
</style>
