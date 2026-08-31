<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { createToaster } from '@ark-ui/vue/toast'
import { Notice, ToastRegion } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoStrip from '../chrome/DemoStrip.vue'

// Appendix D.1, "Toasts & inline notices". createToaster's options ARE the
// artifact's numbers: bottom-right, 10px between toasts, 16px off each edge,
// 5s auto-dismiss, and `max: 3` for the section's own "Three at most" rule.
const toaster = createToaster({
  placement: 'bottom-end',
  gap: 10,
  offsets: '16px',
  duration: 5000,
  max: 3,
})

const TOAST_COPY = {
  success: {
    title: 'Licence issued',
    description: '16-015-2527-PCF-1 is now active until Dec 31, 2027.',
    action: 'View',
  },
  error: {
    title: 'Upload failed',
    description: 'annex-b2-equipment.xlsx exceeds the 10 MB limit.',
    action: 'Retry',
  },
  warning: {
    title: '3 licences expire soon',
    description: 'They fall within 90 days — send renewal notices.',
    action: 'Review',
  },
  info: {
    title: 'Draft saved',
    description: 'Your remarks were saved but not submitted.',
    action: '',
  },
}

// Redline "Toast tone" — the trigger's dot and border are the tone's dot and
// toast-border tokens. One entry per kind, each naming both.
const TRIGGERS = [
  { kind: 'success', label: 'Success', dot: 'bg-dot-green', border: 'border-toast-border-green' },
  { kind: 'error', label: 'Error', dot: 'bg-red-500', border: 'border-red-border' },
  { kind: 'warning', label: 'Warning', dot: 'bg-amber-400', border: 'border-toast-border-amber' },
  { kind: 'info', label: 'Info', dot: 'bg-blue-700', border: 'border-toast-border-blue' },
]

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

// The store publishes one EVENT per change, never the toast array — its
// TypeScript signature says `(toasts: Options[]) => void` but the runtime
// calls `subscriber(data)` with a single toast, and `{ id, dismiss: true }`
// when one is actually removed (including by the 5s timer). `getCount()` is
// no help inside the callback either: publish() runs BEFORE the store
// mutates its own array, so it reads stale by one in both directions.
// Tracking ids is the only accurate route to a live count.
const liveIds = ref([])
const count = computed(() => liveIds.value.length)
let unsubscribe

onMounted(() => {
  unsubscribe = toaster.subscribe((event) => {
    if (event.dismiss) {
      liveIds.value = liveIds.value.filter((id) => id !== event.id)
    } else if (event.message !== 'DISMISS' && !liveIds.value.includes(event.id)) {
      // A `message: 'DISMISS'` event is a dismiss REQUEST — the toast is
      // still on screen animating out, and its removal arrives separately.
      liveIds.value = [...liveIds.value, event.id]
    }
  })
  // The artifact opens with one success toast already on screen, which
  // auto-dismisses on the same 5s timer as any other.
  toaster.create({
    type: 'success',
    title: 'Certificate saved',
    description: 'Password verified and stored encrypted.',
    action: { label: 'Undo', onClick: () => {} },
  })
})

onUnmounted(() => unsubscribe?.())

function fire(kind) {
  const copy = TOAST_COPY[kind]
  toaster.create({
    type: kind,
    title: copy.title,
    description: copy.description,
    ...(copy.action ? { action: { label: copy.action, onClick: () => {} } } : {}),
  })
}
</script>

<template>
  <DemoCard
    title="Toasts &amp; inline notices"
    description="Toasts confirm something you just did and leave. Notices explain a state that stays — they live in the layout, never float."
  >
    <!-- Appendix D.1 — the toast block is a plain padded body (18px 24px
         22px), not a DemoBlocks grid. -->
    <div class="px-card-x pt-4.5 pb-5.5">
      <div class="notices__triggers flex flex-wrap items-center">
        <button
          v-for="trigger in TRIGGERS"
          :key="trigger.kind"
          data-toast-trigger
          type="button"
          class="notices__trigger inline-flex items-center rounded-control border bg-surface text-mono text-ink-700"
          :class="trigger.border"
          @click="fire(trigger.kind)"
        >
          <span
            aria-hidden="true"
            class="notices__dot flex-none rounded-pill"
            :class="trigger.dot"
          />
          {{ trigger.label }}
        </button>

        <div class="flex-1" />

        <button
          v-if="count"
          data-dismiss-all
          type="button"
          class="notices__dismiss-all rounded-control text-mono text-text-meta"
          @click="toaster.dismiss()"
        >
          Dismiss all
        </button>
      </div>

      <!-- Appendix D.1 — a dashed "app surface" the toasts are contained
           inside, so the demo shows the stack in place rather than floating
           it over the whole page. -->
      <div class="notices__surface relative overflow-hidden rounded-panel">
        <p class="text-hint text-text-meta">
          App surface — toasts stack bottom-right, newest on top, 5s auto-dismiss
        </p>

        <ToastRegion :toaster="toaster" contained />

        <p v-if="!count" data-toast-empty class="notices__empty text-caption text-text-meta">
          Fire one above to see the stack.
        </p>
      </div>

      <!-- Appendix D.1 — these rules sit INSIDE the toast block on their own
           230px grid, not in the §17.1 DemoRules footer other sections use:
           no top rule, no card borders, no sunken surface. -->
      <div class="notices__rules">
        <div v-for="rule in RULES" :key="rule.title" data-rule>
          <div class="text-notice font-bold text-ink-900">{{ rule.title }}</div>
          <p class="notices__rule-body text-caption text-text-meta">{{ rule.body }}</p>
        </div>
      </div>
    </div>

    <DemoStrip label="INLINE NOTICES — PERSISTENT, IN-FLOW">
      <div class="notices__list flex flex-col">
        <Notice tone="green" label="Success">
          You have successfully updated user's
          <strong class="font-bold">role and permissions.</strong>
        </Notice>
        <Notice tone="blue" label="Info">
          This application was returned to the facility on Aug 19. It reappears here
          <strong class="font-bold">once they resubmit.</strong>
        </Notice>
        <Notice tone="amber" label="Warning">
          Your certificate uses an older encryption format. A converted copy is stored alongside it
          —
          <strong class="font-bold">no action needed.</strong>
        </Notice>
        <Notice tone="red" label="Error">
          Inspection is overdue by 4 days. The licence cannot be issued
          <strong class="font-bold">until the report is uploaded.</strong>
        </Notice>
        <p data-footnote class="notices__footnote text-hint text-text-meta">
          One line, one pill: the outlined tone label carries the meaning, so the surface stays
          almost white.
        </p>
      </div>
    </DemoStrip>
  </DemoCard>
</template>

<style scoped>
.notices__triggers {
  gap: 8px;
  margin-bottom: 14px;
}

/* Redline "Toast trigger" — 34px compact row, radius --r-control, 12.5/500
   on the surface with the tone's own border. --text-mono names the 12.5/500
   step, not a face. */
.notices__trigger {
  gap: 8px;
  height: var(--h-compact);
  padding: 0 14px;
  cursor: pointer;
}

.notices__dot {
  width: 8px;
  height: 8px;
}

.notices__dismiss-all {
  height: var(--h-compact);
  padding: 0 12px;
  cursor: pointer;
  transition: background-color var(--t-control) ease;
}

@media (hover: hover) {
  .notices__dismiss-all:hover {
    background: var(--surface-muted);
  }
}

/* Appendix D.1 gives this surface `min-height: 316px`, which cannot hold the
   three-toast maximum the section itself advertises: the stack runs 307px
   (71 + 117 + 99 plus two 10px gaps) and sits 16px off the bottom edge, so
   it needs 323px and the top toast was clipped by the panel's own
   overflow: hidden. 340px covers it with headroom for the taller wrapping a
   narrower viewport produces. Deviation recorded in §17.3. */
.notices__surface {
  min-height: 340px;
  padding: 16px;
  border: 1px dashed var(--border-dashed);
  background: var(--surface-input);
}

.notices__empty {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 13px 15px;
  border: 1px dashed var(--border-dashed);
  border-radius: 11px;
  background: var(--surface);
}

.notices__rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr));
  gap: 18px;
  margin-top: 16px;
}

.notices__rule-body {
  margin-top: 3px;
  text-wrap: pretty;
}

/* Appendix D.1 — the notices strip is a 10px column, not the 16px other
   stacks use. */
.notices__list {
  gap: 10px;
}

.notices__footnote {
  margin-top: 2px;
}
</style>
