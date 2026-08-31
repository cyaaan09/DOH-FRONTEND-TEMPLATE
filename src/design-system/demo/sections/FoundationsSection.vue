<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import SwatchGrid from '../chrome/SwatchGrid.vue'
import ScaleList from '../chrome/ScaleList.vue'

// Appendix D.1, "Foundations". Three palettes stacked in the card body, then
// three scale columns in a ruled footer — not the six-cell DemoBlocks grid
// the skeleton used. Every hex is content: the demo folder is exempt from
// the raw-hex guard (spec §13) for exactly this table.
const PALETTES = [
  {
    label: 'BRAND GREEN',
    note: 'actions, active state, anything issued',
    swatches: [
      { name: 'Green 900', hex: '#14532D', use: 'Sidebar logo mark' },
      {
        name: 'Green fill',
        hex: '#177236',
        use: 'Buttons, active nav, filled chip · white 6.01:1',
      },
      { name: 'Green hover', hex: '#125A2B', use: 'Pressed / hover · 8.35:1' },
      { name: 'Green 600', hex: '#1D8F42', use: 'Legacy value — never white text (4.15:1)' },
      { name: 'Green 500', hex: '#25A94E', use: 'Focus border only' },
      { name: 'Green 700 text', hex: '#15803D', use: 'Green text on tint · 4.50:1, no headroom' },
      { name: 'Green 100', hex: '#E8F6EC', use: 'Chip and count tint' },
      { name: 'Green 50', hex: '#ECFDF3', use: 'Notice surface' },
    ],
  },
  {
    label: 'NEUTRALS',
    note: 'text, borders, surfaces',
    swatches: [
      { name: 'Ink 900', hex: '#1E2532', use: 'Titles, row names' },
      { name: 'Ink 700', hex: '#344054', use: 'Field labels, buttons' },
      { name: 'Ink 600', hex: '#475467', use: 'Secondary body' },
      { name: 'Ink 500', hex: '#667085', use: 'Body & hints on white · 4.97:1' },
      {
        name: 'Header 5A',
        hex: '#5A6577',
        use: 'Column headers + all text on tint · 5.21:1 on canvas',
      },
      { name: 'Ink 400', hex: '#8A94A6', use: 'Decorative only · 3.06:1' },
      { name: 'Ink 300', hex: '#98A2B3', use: 'Carets, ⋯ glyphs · 2.58:1' },
      { name: 'Ink 200', hex: '#B9C1D1', use: 'Disabled text · exempt' },
      { name: 'Border', hex: '#D5DBE6', use: 'Field border' },
      { name: 'Hairline', hex: '#E4E8EF', use: 'Card border' },
      { name: 'Divider', hex: '#EEF1F6', use: 'Section rules, tracks' },
      { name: 'Row hover', hex: '#FAFBFD', use: 'Table zebra, footers' },
      { name: 'Canvas', hex: '#EEF1F6', use: 'Page background — text on it uses #5A6577' },
    ],
  },
  {
    label: 'STATUS TONES',
    note: 'one meaning each — never decorative',
    swatches: [
      { name: 'Amber text', hex: '#8A5206', use: 'Legacy, pending text · 5.77:1' },
      { name: 'Amber 400', hex: '#D9A13B', use: 'Warning dot' },
      { name: 'Amber 100', hex: '#FEF2E0', use: 'Warning chip' },
      { name: 'Red 700', hex: '#B42318', use: 'Destructive text' },
      { name: 'Red 500', hex: '#E5484D', use: 'Error dot, nav badge' },
      { name: 'Red 100', hex: '#FEE2E2', use: 'Count badge, error chip' },
      { name: 'Blue 700', hex: '#175CD3', use: 'Online / info text' },
      { name: 'Blue 100', hex: '#EAF2FE', use: 'Online chip' },
      { name: 'Violet 700', hex: '#6941C6', use: 'Add / Modify text' },
      { name: 'Violet 100', hex: '#F0ECFE', use: 'Add / Modify chip' },
    ],
  },
]

const SCALES = [
  {
    label: 'RADIUS',
    rows: [
      { value: '999px', use: 'Chips, pills, notices, dots', radius: '999px' },
      { value: '16px', use: 'Inline notice shell', radius: '16px' },
      { value: '14px', use: 'Cards and sections', radius: '14px' },
      { value: '12px', use: 'Dropdown panels, stat cards', radius: '12px' },
      { value: '9px', use: 'Fields, 38px buttons, nav items', radius: '9px' },
      { value: '8px', use: '34px buttons, menu items', radius: '8px' },
      { value: '5px', use: 'Checkbox', radius: '5px' },
    ],
  },
  {
    label: 'SIZE & SPACING',
    rows: [
      { value: '44px', use: 'Mobile primary action height' },
      { value: '38px', use: 'Field, default button, dropdown trigger' },
      { value: '34px', use: 'Compact button, inline filter, icon button' },
      { value: '24px / 32px', use: 'Notice label / notice shell' },
      { value: '20px', use: 'Chip (auto height from 3px 9px padding)' },
      { value: '17px', use: 'Checkbox, radio target' },
      { value: '24px', use: 'Card padding (x), section gutter' },
      { value: '22px', use: 'Gap between sections' },
      { value: '12px', use: 'Gap between cards in a grid' },
      { value: '10px / 8px', use: 'Gap in a button row / chip row' },
    ],
  },
  {
    label: 'ELEVATION & BORDERS',
    rows: [
      { value: '1px #E4E8EF', use: 'Every card and section' },
      { value: '1.6px dashed', use: 'File dropzones only' },
      { value: '2.5px solid', use: 'Active underline tab' },
      { value: '0 1px 2px /.04', use: 'Card rest' },
      { value: '0 1px 2px /.25', use: 'Primary button' },
      { value: '0 0 0 3px /.15', use: 'Focus ring (green 500)' },
      { value: '0 8px 24px /.12', use: 'Toast' },
      { value: '0 12px 28px /.14', use: 'Dropdown panel' },
      { value: '0 24px 60px /.28', use: 'Modal dialog' },
    ],
  },
]
</script>

<template>
  <DemoCard
    title="Foundations"
    description="Every value used anywhere below comes from these four scales. Nothing in the licensing screens introduces a colour, radius, or size that isn't here."
  >
    <!-- Appendix D.1 — palettes stack full-width at 18px 24px 8px; the last
         one's own 20px bottom margin makes up the rest of the gutter. -->
    <div class="px-card-x pt-4.5 pb-2">
      <SwatchGrid
        v-for="palette in PALETTES"
        :key="palette.label"
        :label="palette.label"
        :note="palette.note"
        :swatches="palette.swatches"
      />
    </div>

    <!-- Appendix D.1 — a ruled 280px footer, the same shape DemoRules uses. -->
    <div class="foundations__scales border-t border-divider">
      <ScaleList
        v-for="scale in SCALES"
        :key="scale.label"
        :label="scale.label"
        :rows="scale.rows"
      />
    </div>
  </DemoCard>
</template>

<style scoped>
.foundations__scales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
</style>
