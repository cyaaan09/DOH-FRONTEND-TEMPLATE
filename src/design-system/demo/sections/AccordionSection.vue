<script setup>
import { ref } from 'vue'
import { Accordion } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Accordion" — one record read top to bottom. Redline
// "Default state · first section open, rest collapsed".
const open = ref(['profile'])

const ITEMS = [
  { value: 'profile', title: 'Facility profile', summary: 'Type, address, contact' },
  {
    value: 'services',
    title: 'Services offered',
    summary: 'Pharmacy, Birthing Home',
    badge: { label: '2', tone: 'neutral' },
  },
  {
    value: 'inspection',
    title: 'Inspection history',
    summary: 'Last passed 12 Jun 2026',
    badge: { label: '4', tone: 'done' },
  },
  {
    value: 'documents',
    title: 'Documents',
    summary: '2 files rejected — action needed',
    badge: { label: '2', tone: 'action' },
  },
  { value: 'audit', title: 'Audit trail', summary: '18 events since 2019' },
]

const PROFILE = [
  { label: 'TYPE', value: 'Primary Care Facility' },
  { label: 'ADDRESS', value: 'Purok 3, Carmen' },
  { label: 'CONTACT', value: 'Dr. A. Salcedo' },
  { label: 'TELEPHONE', value: '(085) 343 1120' },
]

const RULES = [
  {
    title: 'Headers summarise, not tease',
    body: 'Each closed header carries the answer most people came for. If a header needs opening to know whether it matters, rewrite the sub-line.',
  },
  {
    title: 'Accordion or tabs, never both',
    body: 'Accordion is one long record; tabs swap between views of different things. A tabbed accordion means the information architecture is unresolved.',
  },
  {
    title: 'Chevron is decorative',
    body: 'The whole 14px 18px header is the button with aria-expanded; the 22px chevron tile only reflects state.',
  },
  {
    title: 'Open state sinks',
    body: "An open section's header goes #FAFBFD and its body indents to 52px, aligning with the chevron \u2014 so nesting reads without a second border.",
  },
]
</script>

<template>
  <DemoCard
    title="Accordion"
    description="For a long record read top to bottom — not for switching views, which is what tabs are. One section open by default, the rest collapsed with enough summary in the header to decide whether to open them."
  >
    <div class="px-card-x pt-4.5 pb-6">
      <Accordion v-model="open" :items="ITEMS" title="Carmen Rural Health Unit">
        <template #profile>
          <div v-for="fact in PROFILE" :key="fact.label">
            <div class="accordion-section__label text-text-header">{{ fact.label }}</div>
            <div class="accordion-section__value text-ink-900">{{ fact.value }}</div>
          </div>
        </template>
      </Accordion>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — body labels are the column-header step at a 5px gap. */
.accordion-section__label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 5px;
}

.accordion-section__value {
  font-size: 13px;
}
</style>
