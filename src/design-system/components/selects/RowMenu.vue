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

    <MenuPositioner class="rowmenu__positioner">
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
            :data-destructive="item.destructive ? true : undefined"
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

/* Redline "Motion, states & z-index" — Dropdown / menu z-index 12. Zag's
 * positioner sets zIndex: var(--z-index) inline; undefined, that declaration
 * is invalid and falls back to auto, which only paints correctly by
 * accident while nothing else on the page is positioned. */
.rowmenu__positioner {
  --z-index: var(--z-popover);
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

/* Appendix C "Keyboard & focus" mandates arrow navigation, and "Motion,
 * states & z-index" requires a visible indicator on every focusable. Zag
 * sets data-highlighted on the item under the cursor or arrow keys. No
 * :not() guard is needed here, unlike Select and InlineFilter: RowMenu has
 * no selected state to protect. */
.rowmenu__item[data-highlighted] {
  background: var(--surface-muted);
}

/* Redline "Menu item" — the destructive item's own 13px top padding
 * replaces its share of the standard item's 9px, so total space above its
 * text is margin-top 6 + hairline 1 + padding-top 13 = 20px, matching
 * Appendix D.1's destructive-item spacing instead of the 29px two competing
 * paddings previously produced. */
.rowmenu__item[data-destructive] {
  padding-top: 13px;
}

/* Appendix D.1 — the destructive item sits 6px below a hairline. Only
 * margin-top lives here: border-top-width comes from Tailwind's preflight
 * `hr` rule (Ark's MenuSeparator renders an actual <hr> — confirmed against
 * the installed package), and padding-top comes from the destructive item
 * itself, not the separator — see .rowmenu__item[data-destructive] above. */
.rowmenu__separator {
  margin-top: 6px;
}
</style>
