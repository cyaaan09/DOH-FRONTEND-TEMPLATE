<script setup>
import { ref } from 'vue'
import { SearchField, Textarea, TextField } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'

const name = ref('Carmen RHU, ADN')
const lto = ref('16-015-2527')
const beds = ref('')
const search = ref('')
const remarks = ref('')
</script>

<template>
  <DemoCard
    title="Text fields"
    description="Label 12.5px/500 above, hint or error 12px below. The green ring is the only focus signal."
  >
    <DemoBlocks>
      <div class="grid gap-4 sm:grid-cols-2">
        <TextField v-model="name" label="Facility name" hint="Rests on a hairline border." />
        <TextField v-model="lto" label="LTO number" mono hint="Mono for reference numbers." />
        <TextField v-model="beds" label="Bed capacity" suffix="beds" error="Must be at least 1." />
        <TextField
          label="NHFR code"
          model-value="PH-16-0142"
          readonly
          hint="Disabled fields lose their white surface, never their border."
        />
        <SearchField v-model="search" placeholder="Search facilities" />
        <div class="sm:col-span-2">
          <Textarea v-model="remarks" label="Reviewer remarks" :maxlength="400" />
        </div>
      </div>
    </DemoBlocks>
  </DemoCard>
</template>
