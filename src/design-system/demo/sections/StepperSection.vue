<script setup>
import { Chip, Stepper } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Stepper". Four sub-blocks: the three variants plus the error
// state, every label and sub-label verbatim.
const HORIZONTAL = [
  { key: 'applicant', label: 'Applicant', sublabel: 'Completed', state: 'done' },
  { key: 'facility', label: 'Facility profile', sublabel: 'In progress', state: 'current' },
  { key: 'documents', label: 'Documents', sublabel: '4 required', state: 'upcoming' },
  { key: 'review', label: 'Review & sign', sublabel: 'Not started', state: 'upcoming' },
]

const VERTICAL = [
  {
    key: 'received',
    label: 'Application received',
    sublabel: '19 Aug 2026 · 09:14 · portal',
    state: 'done',
    chip: { tone: 'blue', label: 'Online' },
  },
  {
    key: 'review',
    label: 'Document review',
    sublabel: '21 Aug 2026 · R. Villaflor',
    state: 'done',
  },
  {
    key: 'inspection',
    label: 'Inspection',
    sublabel: 'Scheduled 04 Sep 2026',
    state: 'current',
    chip: { tone: 'amber', label: 'Due in 4 days' },
  },
  {
    key: 'issuance',
    label: 'Issuance',
    sublabel: 'Released to facility',
    state: 'upcoming',
  },
]

const ERROR_STEPS = [
  { key: 'applicant', label: 'Applicant', sublabel: 'Completed', state: 'done' },
  {
    key: 'documents',
    label: 'Documents',
    sublabel: '2 files rejected — replace to continue',
    state: 'error',
  },
  { key: 'review', label: 'Review & sign', sublabel: 'Not started', state: 'upcoming' },
]

const RULES = [
  {
    title: 'Reached steps only',
    body: 'A completed or current step is a button; an upcoming step is plain text. Jumping forward past validation is how half-filled records get created.',
  },
  {
    title: 'The connector carries progress',
    body: '2px, green behind reached steps and #EEF1F6 ahead of them. The current step keeps a 4px rgba(23,114,54,.12) halo so it reads at a glance.',
  },
  {
    title: 'Sub-labels do work',
    body: 'Completed shows the date and who did it, current shows what is left, upcoming shows the requirement. Never a repeat of the step title.',
  },
  {
    title: 'Four steps horizontal, five plus vertical',
    body: 'Above four, horizontal labels start truncating — switch to the vertical form, or the compact meter if the header has no room.',
  },
]
</script>

<template>
  <DemoCard
    title="Stepper"
    description="Three forms, one rule: a step is only clickable once it has been reached. Horizontal for a form the user is filling, vertical for a record whose history matters, compact where the header has no room."
  >
    <DemoBlocks min="300px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="HORIZONTAL — A FORM IN PROGRESS">
        <Stepper :steps="HORIZONTAL" label="Application progress" />
      </DemoBlock>

      <DemoBlock label="VERTICAL — A RECORD WITH HISTORY">
        <Stepper v-slot="{ step }" :steps="VERTICAL" variant="vertical" label="Application history">
          <Chip v-if="step.chip" :tone="step.chip.tone" dot>{{ step.chip.label }}</Chip>
        </Stepper>
      </DemoBlock>

      <DemoBlock label="COMPACT — INSIDE A CARD HEADER">
        <Stepper
          :steps="HORIZONTAL"
          variant="compact"
          label="Application progress"
          title="Step 2 of 4 · Facility profile"
          note="Segment form for 4 steps or fewer, single meter above that."
        />
      </DemoBlock>

      <DemoBlock label="ERROR STATE">
        <Stepper :steps="ERROR_STEPS" label="Application progress with an error" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
