<script setup>
import { ref } from 'vue'
import { AppHeader, AppSidebar } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "App shell — side navigation". The artifact shows both rail
// widths side by side, so the demo renders the SAME component twice rather
// than drawing a second one — the collapsed state is where the accessibility
// work lives, and a picture of it would not prove the labels survive.
const active = ref('issued')

const GROUPS = [
  {
    label: 'LICENSING',
    items: [
      { key: 'issued', label: 'Issued LTO', mark: 'circle', badge: '211' },
      { key: 'applications', label: 'LTO Applications', mark: 'square', badge: '4' },
      { key: 'facilities', label: 'Facilities', mark: 'square' },
      { key: 'inspections', label: 'Inspections', mark: 'square' },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { key: 'signature', label: 'My Digital Signature', mark: 'diamond' },
      { key: 'users', label: 'User Management', mark: 'diamond' },
      { key: 'reference', label: 'Reference Data', mark: 'diamond' },
    ],
  },
]

const BRAND = { mark: 'OL', name: 'OLRS', org: 'DOH CHD Caraga' }
const ACCOUNT = { initials: 'RV', name: 'R. Villaflor', role: 'Regional Licensing Officer' }

const RULES = [
  {
    title: 'Two states, one rail',
    body: '244px → 62px over 160ms ease. Labels drop, the active gradient becomes a 34px tile, and each count badge collapses to a 7px dot with a 2px ring in the rail surface.',
  },
  {
    title: 'One gradient per screen',
    body: "The active item is the rail's only filled surface — hover is a flat #F4F6FA, so the current page never competes with a pointer.",
  },
  {
    title: 'Badges earn their place',
    body: 'Red only where something is waiting on you. A total that never demands action stays neutral — on the active item it sits in a 25% white well.',
  },
  {
    title: 'Marks are decorative',
    body: '13px shapes at 1.8px #B3BDCD sit below 3:1 on purpose — they read as texture beside a text label, never as the only cue. Collapsed, each keeps a tooltip.',
  },
]
</script>

<template>
  <DemoCard
    title="App shell — side navigation"
    description="One rail, two widths. Group headers carry the section, the active item is the only gradient on screen, and a count badge only appears where a number changes what you do next."
  >
    <div class="app-shell-section flex flex-wrap items-start px-card-x pt-4.5 pb-6">
      <div
        class="app-shell-section__rail overflow-hidden rounded-panel border border-hairline shadow-card"
      >
        <AppSidebar
          :groups="GROUPS"
          :active="active"
          :brand="BRAND"
          :account="ACCOUNT"
          @select="(item) => (active = item.key)"
        />
      </div>

      <div class="app-shell-section__collapsed">
        <div class="text-column-header text-text-header mb-2.5">Collapsed rail · 62px</div>
        <div
          class="app-shell-section__rail overflow-hidden rounded-panel border border-hairline shadow-card"
        >
          <AppSidebar
            :groups="GROUPS"
            :active="active"
            :brand="BRAND"
            :account="ACCOUNT"
            collapsed
            collapse-label="Expand navigation"
          />
        </div>
      </div>

      <div class="app-shell-section__header min-w-0 flex-1">
        <div class="text-column-header text-text-header mb-2.5">Header — sticky, z 6</div>
        <div class="overflow-hidden rounded-panel border border-hairline">
          <AppHeader :breadcrumb="['Licensing', 'Issued LTO']" :account="ACCOUNT" />
        </div>
      </div>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
.app-shell-section {
  gap: 22px;
}

/* The rail is 100vh in a real shell; inside a demo card it needs a height to
   show its footer, so the panel supplies one rather than the component. */
.app-shell-section__rail {
  min-height: 470px;
}

.app-shell-section__collapsed,
.app-shell-section__header {
  display: flex;
  flex-direction: column;
}
</style>
