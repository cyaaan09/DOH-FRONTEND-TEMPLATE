<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /**
   * The gutter Appendix C allows for "cards under ~360px": 20px sides and a
   * tighter 15px title, which is what the Containers demo's 300px grid cell
   * renders. The default is the full-width card header the redline gives as
   * `pad 20px 24px 4px · title 17px / 700`.
   */
  narrow: { type: Boolean, default: false },
})
</script>

<template>
  <div
    data-card-header
    class="flex items-start justify-between gap-3"
    :class="narrow ? 'card-header--narrow' : 'px-card-x pt-5 pb-1'"
  >
    <div class="min-w-0">
      <h2
        class="text-ink-900"
        :class="narrow ? 'card-header__title--narrow' : 'text-section-title'"
      >
        {{ title }}
      </h2>
      <p
        v-if="subtitle"
        class="text-text-meta mt-0.5"
        :class="narrow ? 'text-caption' : 'text-body'"
      >
        {{ subtitle }}
      </p>
    </div>
    <!-- Redline "Row gap" — 8px inside cards, not the default 10px button-row
         gap. No token exists for 8px, so this uses Tailwind's built-in
         gap-2, which is exactly 8px. -->
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
/* Appendix C "Card gutter · 20px on cards under ~360px"; the artifact pads
   this header 16px 20px 14px and drops the title to 15px, which sits between
   --text-row-title (14) and --text-section-title (17) with no token. */
.card-header--narrow {
  padding: 16px 20px 14px;
}

.card-header__title--narrow {
  font-size: 15px;
  font-weight: 700;
}
</style>
