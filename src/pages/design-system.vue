<script setup>
import DemoSection from '@/design-system/demo/DemoSection.vue'
import TypeScaleDemo from '@/design-system/demo/TypeScaleDemo.vue'
import ButtonsDemo from '@/design-system/demo/ButtonsDemo.vue'
import ChipsDemo from '@/design-system/demo/ChipsDemo.vue'
import CardsDemo from '@/design-system/demo/CardsDemo.vue'
import FieldsDemo from '@/design-system/demo/FieldsDemo.vue'
import FeedbackDemo from '@/design-system/demo/FeedbackDemo.vue'
</script>

<template>
  <div>
    <h1 class="text-page-title text-ink-900">Design system</h1>
    <p class="text-body text-text-meta mt-2 mb-8 max-w-2xl">
      Every component below is built against the design tokens — no raw hex, no
      <code class="font-mono text-mono">dark:</code> variants. Toggle the theme in the header; only
      the palette changes, never the geometry.
    </p>

    <DemoSection title="Type scale" note="DM Sans at three weights. JetBrains Mono for numbers you might copy.">
      <TypeScaleDemo />
    </DemoSection>

    <DemoSection title="Buttons" note="38px default, 34px compact, 44px touch. One filled green button per screen region.">
      <ButtonsDemo />
    </DemoSection>

    <DemoSection title="Chips" note="Tone comes from meaning, never decoration.">
      <ChipsDemo />
    </DemoSection>

    <DemoSection title="Cards" note="Three surfaces and nothing else. Cards never nest.">
      <CardsDemo />
    </DemoSection>

    <DemoSection title="Text fields" note="Every field is 38px tall with a 9px radius. The green ring is the only focus signal.">
      <FieldsDemo />
    </DemoSection>

    <DemoSection title="Feedback" note="Notices explain a state that stays — they live in the layout and never float.">
      <FeedbackDemo />
    </DemoSection>
  </div>
</template>
