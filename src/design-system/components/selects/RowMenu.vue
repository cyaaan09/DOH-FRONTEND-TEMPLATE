<script setup>
import { MenuRoot, MenuTrigger, MenuPositioner, MenuContent, MenuItem, MenuSeparator } from '@ark-ui/vue/menu'

defineProps({
  /** Items as `{ value, label, destructive? }`, destructive last. */
  items: { type: Array, required: true },
  /** Names the trigger for assistive technology — the glyph is decorative. */
  label: { type: String, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <MenuRoot :positioning="{ gutter: 6 }" @select="(details) => emit('select', details.value)">
    <!-- Appendix D.1 — 34x34 square, radius 8px, field border. -->
    <MenuTrigger
      data-trigger
      :aria-label="label"
      class="rowmenu__trigger grid h-compact w-compact place-items-center rounded-control border border-field bg-surface text-ink-500"
    >
      <span data-glyph aria-hidden="true" class="rowmenu__glyph font-bold">⋯</span>
    </MenuTrigger>

    <MenuPositioner>
      <MenuContent class="rowmenu__panel rounded-panel border border-hairline bg-surface p-1.5">
        <template v-for="item in items" :key="item.value">
          <!-- Redline "Menu item" — the destructive item is preceded by a rule. -->
          <MenuSeparator
            v-if="item.destructive"
            data-separator
            class="rowmenu__separator border-divider"
          />
          <MenuItem
            :value="item.value"
            class="rowmenu__item flex items-center rounded-control text-body"
            :class="item.destructive ? 'text-red-700 font-bold' : 'text-ink-700 font-normal'"
            >{{ item.label }}</MenuItem
          >
        </template>
      </MenuContent>
    </MenuPositioner>
  </MenuRoot>
</template>

<style scoped>
/* Size comes from `h-compact w-compact` on the element — exactly the pattern
 * Button's icon size already uses for a 34x34 square control. */
.rowmenu__trigger {
  cursor: pointer;
}

.rowmenu__trigger:hover {
  background: var(--surface-muted);
}

.rowmenu__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.rowmenu__glyph {
  font-size: 14px;
  line-height: 1;
}

/* Appendix D.1 — panel min-width 196px, on the panel shadow. */
.rowmenu__panel {
  min-width: 196px;
  box-shadow: var(--sh-panel);
}

/* Redline "Option" geometry, shared by menu items — pad 9px 10px. */
.rowmenu__item {
  padding: 9px 10px;
  cursor: pointer;
}

/* Appendix D.1 — the destructive item sits 6px below a hairline, with 13px
 * of space above its own text. */
.rowmenu__separator {
  margin-top: 6px;
  padding-top: 13px;
  border-top-width: 1px;
}
</style>
