<script setup>
import { computed, ref } from 'vue'
import { SearchField, Textarea, TextField } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'

// Appendix D.1, "Text fields -> the seven demos" — every value, placeholder,
// qualifier and hint below is verbatim from the artifact. The section
// previously ran six demos in a different order with the hints rewritten
// down to fragments ("Rests on a hairline border." for "Default · rests on
// a hairline border."), and omitted the password demo entirely.

const name = ref('')
const lto = ref('16-015-2527-PCF-1')
const search = ref('')
const password = ref('')
const showPassword = ref(false)
const beds = ref('0')
const nhfr = ref('37720')
const remarks = ref('')

// Appendix D.1 — pwLabel is `showPw ? "HIDE" : "SHOW"` and pwType is
// `showPw ? "text" : "password"`, starting closed.
const passwordAction = computed(() => (showPassword.value ? 'HIDE' : 'SHOW'))
const passwordType = computed(() => (showPassword.value ? 'text' : 'password'))
</script>

<template>
  <DemoCard
    title="Text fields"
    description="Label 12.5px/500 above, hint or error 12px below. The green ring is the only focus signal."
  >
    <!-- Appendix D.1 — this section's grid is a 280px track at gap 20px 24px,
         closing the card at 24px. It was built on §17.1's 268px/24px default
         with a second `sm:grid-cols-2` grid nested inside it, which pinned
         the demos to two columns instead of letting auto-fit place them. -->
    <DemoBlocks min="280px" gap="20px 24px" pb="24px">
      <TextField
        v-model="name"
        label="Facility name"
        placeholder="e.g. Carmen RHU"
        hint="Default · rests on a hairline border."
      />

      <!-- Appendix D.1 renders this one permanently focused to show the ring.
           Ours shows it on real focus instead — see §17.3; the hint text is
           the artifact's, unchanged. -->
      <TextField
        v-model="lto"
        label="LTO number"
        mono
        hint="Focus · 3px ring at 15% green. Mono for reference numbers."
      />

      <!-- SearchField draws no label or hint of its own — its `label` is the
           aria-label for the filter-bar use where none is drawn. The visible
           label, qualifier and hint therefore come from section chrome, the
           same pattern DropdownsSection uses for the same reason. -->
      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Search <span class="text-ink-500">· with leading icon</span>
        </div>
        <SearchField v-model="search" label="Search" placeholder="Search facility or LTO number" />
        <p class="text-hint text-text-meta mt-1.25">
          Clear button appears only once there's a value.
        </p>
      </div>

      <TextField
        v-model="password"
        label="Certificate password"
        :type="passwordType"
        placeholder="Required to unlock the .p12"
        :action="passwordAction"
        hint="Trailing text action instead of an eye icon."
        @action="showPassword = !showPassword"
      />

      <TextField
        v-model="beds"
        label="Bed capacity"
        suffix="beds"
        error="Must be at least 1 for an infirmary."
      />

      <TextField
        v-model="nhfr"
        label="NHFR code"
        qualifier="· read only"
        mono
        readonly
        badge="SYNCED"
        hint="Disabled fields lose their white surface, never their border."
      />

      <!-- Appendix D.1 — the textarea spans the whole grid (grid-column: 1 / -1). -->
      <div class="fields-section__wide">
        <Textarea
          v-model="remarks"
          label="Reviewer remarks"
          :rows="3"
          :maxlength="400"
          placeholder="Explain what the facility needs to correct before resubmitting."
          hint="Textarea keeps the field radius; min 3 rows, resizable vertically only."
        />
      </div>
    </DemoBlocks>
  </DemoCard>
</template>

<style scoped>
.fields-section__wide {
  grid-column: 1 / -1;
}
</style>
