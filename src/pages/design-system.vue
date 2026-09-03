<route lang="json">
{ "meta": { "public": true } }
</route>

<script setup>
import { SECTIONS } from '@/design-system/demo/chrome/sections'
import FoundationsSection from '@/design-system/demo/sections/FoundationsSection.vue'
import ContainersSection from '@/design-system/demo/sections/ContainersSection.vue'
import ChipsSection from '@/design-system/demo/sections/ChipsSection.vue'
import TabsSection from '@/design-system/demo/sections/TabsSection.vue'
import FieldsSection from '@/design-system/demo/sections/FieldsSection.vue'
import DropdownsSection from '@/design-system/demo/sections/DropdownsSection.vue'
import ButtonsSection from '@/design-system/demo/sections/ButtonsSection.vue'
import FilesSection from '@/design-system/demo/sections/FilesSection.vue'
import NoticesSection from '@/design-system/demo/sections/NoticesSection.vue'
import SelectionSection from '@/design-system/demo/sections/SelectionSection.vue'
import DialogSection from '@/design-system/demo/sections/DialogSection.vue'
import LayoutSection from '@/design-system/demo/sections/LayoutSection.vue'
import StepperSection from '@/design-system/demo/sections/StepperSection.vue'
import DatePickerSection from '@/design-system/demo/sections/DatePickerSection.vue'
import TooltipSection from '@/design-system/demo/sections/TooltipSection.vue'
import AccordionSection from '@/design-system/demo/sections/AccordionSection.vue'
import SearchSection from '@/design-system/demo/sections/SearchSection.vue'
import NotificationsSection from '@/design-system/demo/sections/NotificationsSection.vue'
import DestructiveSection from '@/design-system/demo/sections/DestructiveSection.vue'
import ShortcutsSection from '@/design-system/demo/sections/ShortcutsSection.vue'
import PrintSection from '@/design-system/demo/sections/PrintSection.vue'
import FormLayoutSection from '@/design-system/demo/sections/FormLayoutSection.vue'
import AppShellSection from '@/design-system/demo/sections/AppShellSection.vue'
import ChartsSection from '@/design-system/demo/sections/ChartsSection.vue'
import DataTableSection from '@/design-system/demo/sections/DataTableSection.vue'
import TypeScaleSection from '@/design-system/demo/sections/TypeScaleSection.vue'
import SpecsSection from '@/design-system/demo/sections/SpecsSection.vue'
import DarkModeSection from '@/design-system/demo/sections/DarkModeSection.vue'
import TokensSection from '@/design-system/demo/sections/TokensSection.vue'

// Keyed by the manifest's ids so the page order and the manifest cannot drift
// apart — a test asserts the rendered order matches SECTIONS.
const COMPONENTS = {
  foundations: FoundationsSection,
  containers: ContainersSection,
  chips: ChipsSection,
  tabs: TabsSection,
  fields: FieldsSection,
  dropdowns: DropdownsSection,
  buttons: ButtonsSection,
  files: FilesSection,
  notices: NoticesSection,
  selection: SelectionSection,
  dialog: DialogSection,
  layout: LayoutSection,
  stepper: StepperSection,
  'date-picker': DatePickerSection,
  tooltip: TooltipSection,
  accordion: AccordionSection,
  search: SearchSection,
  notifications: NotificationsSection,
  destructive: DestructiveSection,
  shortcuts: ShortcutsSection,
  print: PrintSection,
  'form-layout': FormLayoutSection,
  'app-shell': AppShellSection,
  charts: ChartsSection,
  'data-table': DataTableSection,
  'type-scale': TypeScaleSection,
  specs: SpecsSection,
  'dark-mode': DarkModeSection,
  tokens: TokensSection,
}
</script>

<template>
  <div>
    <h1 class="text-page-title text-ink-900">Design system</h1>
    <p class="text-body text-text-meta mt-2 mb-8 max-w-2xl">
      Chips, tabs, fields, dropdowns, and the type scale the licensing screens are built on. Every
      field is 38px tall with a 9px radius, so a filter bar and a form read as the same system.
    </p>

    <div v-for="section in SECTIONS" :key="section.id" :data-section="section.id">
      <component :is="COMPONENTS[section.id]" />
    </div>
  </div>
</template>
