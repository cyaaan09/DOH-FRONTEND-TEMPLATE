<script setup>
import { ref } from 'vue'
import {
  Button,
  ConsentRow,
  Fieldset,
  FormField,
  FormShell,
  Grid,
  GridItem,
  Select,
  Textarea,
  TextField,
  TokenField,
} from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Form layout". One card, two fieldsets divided by a rule, a
// sticky footer, and a dark preview of the same fields — every label, value
// and message verbatim.
const name = ref('Carmen Rural Health Unit')
const type = ref('pcf')
const licence = ref('16-015-25')
const issued = ref('14 Aug 2026')
const expiry = ref('Auto · 13 Aug 2029')
const address = ref('Purok 3, Poblacion, Carmen, Agusan del Norte')
const remarks = ref('')
const certified = ref(false)
const services = ref(['Pharmacy', 'Birthing Home'])

const TYPES = [
  { value: 'pcf', label: 'Primary Care Facility' },
  { value: 'infirmary', label: 'Infirmary' },
  { value: 'hospital', label: 'Hospital · Level 1' },
]

const RULES = [
  {
    title: 'Errors replace, never insert',
    body: 'Help text and error text share one 11.5px slot with a 5px offset, so validating a field never reflows the fields below it.',
  },
  {
    title: 'Required is the exception',
    body: "Most fields are required, so mark the few that aren't with a grey optional and keep the red asterisk for the rest.",
  },
  {
    title: 'Sections are rules, not cards',
    body: 'One card per form. Fieldsets are a 10.5px caps label plus a 1px hairline — nesting cards inside cards doubles the borders and halves the clarity.',
  },
]
</script>

<template>
  <DemoCard
    title="Form layout"
    description="A 12-column grid on a 24px gutter, fieldsets separated by a rule rather than a card, and one sticky footer that owns every action. Errors replace help text in place — the row never grows."
  >
    <div class="px-card-x pt-4.5 pb-6">
      <FormShell
        title="Register a facility"
        subtitle="Step 2 of 4 · Facility profile"
        :progress="50"
        autosave="Draft saved 2 min ago"
      >
        <Fieldset label="IDENTIFICATION" first>
          <Grid>
            <GridItem :span="8">
              <FormField
                label="Facility name"
                required
                hint="As written on the DTI or SEC registration."
              >
                <TextField v-model="name" bare label="Facility name" />
              </FormField>
            </GridItem>
            <GridItem :span="4">
              <FormField label="Facility type" required hint="Determines the checklist.">
                <Select v-model="type" :options="TYPES" label="Facility type" />
              </FormField>
            </GridItem>
            <GridItem :span="4">
              <!-- Redline "Error text · REPLACES help text in the shared slot" —
                   this field carries an error, and the row below it does not
                   move because the slot was already two lines tall. -->
              <FormField
                label="Licence number"
                required
                error="Needs all four segments — 16-015-2527-PCF-1."
              >
                <TextField v-model="licence" bare mono label="Licence number" error=" " />
              </FormField>
            </GridItem>
            <GridItem :span="4">
              <FormField label="Date issued" required>
                <TextField v-model="issued" bare label="Date issued" />
              </FormField>
            </GridItem>
            <GridItem :span="4">
              <FormField label="Expiry" optional hint="Computed from date issued.">
                <TextField v-model="expiry" bare readonly label="Expiry" />
              </FormField>
            </GridItem>
          </Grid>
        </Fieldset>

        <Fieldset label="LOCATION &amp; SERVICES">
          <Grid>
            <GridItem :span="12">
              <FormField label="Street address" required>
                <TextField v-model="address" bare label="Street address" />
              </FormField>
            </GridItem>
            <GridItem :span="6">
              <FormField label="Services offered" required>
                <TokenField
                  :model-value="services"
                  placeholder="Add a service…"
                  @remove="(t) => (services = services.filter((s) => s !== t))"
                />
              </FormField>
            </GridItem>
            <GridItem :span="6">
              <FormField
                label="Remarks"
                optional
                hint="Anything the inspector should know before the visit. Visible to the facility."
              >
                <Textarea v-model="remarks" bare label="Remarks" :maxlength="500" :rows="3" />
              </FormField>
            </GridItem>
            <GridItem :span="12">
              <ConsentRow
                v-model="certified"
                label="I certify this information matches the submitted documents."
                hint="Recorded with your name and timestamp."
              />
            </GridItem>
          </Grid>
        </Fieldset>

        <template #actions>
          <Button variant="secondary">Back</Button>
          <Button variant="primary">Continue</Button>
        </template>
      </FormShell>

      <!-- Appendix D.1 — the same fields on the dark canvas, scoped the way
           DarkModeSection does it: data-theme on the panel re-scopes tokens
           for the subtree, so these are the real components. -->
      <div data-form-dark data-theme="dark" class="form-layout__dark">
        <div class="text-column-header text-text-header mb-3">DARK</div>
        <div class="flex flex-col gap-3.5">
          <FormField label="Facility name" required hint="As written on the registration.">
            <TextField model-value="Carmen RHU" bare label="Facility name" />
          </FormField>
          <FormField label="Licence number" required error="Needs all four segments.">
            <TextField model-value="16-015-25" bare mono label="Licence number" error=" " />
          </FormField>
        </div>
      </div>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — the dark preview is a 16px panel on the dark canvas. */
.form-layout__dark {
  margin-top: 22px;
  padding: 16px;
  border-radius: var(--r-panel);
  background: var(--canvas);
  border: 1px solid var(--border-card);
}
</style>
