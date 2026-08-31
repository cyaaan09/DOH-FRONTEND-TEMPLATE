/**
 * The artifact's section order, from spec Appendix D. The demo page mirrors
 * this exactly (spec §17) so a side-by-side comparison needs no translation.
 *
 * `complete` means every slot in that section renders a real component. A
 * test asserts a complete section contains no DemoGap, so a section cannot be
 * declared done while a slot is still empty. Each later phase flips the
 * sections it fills.
 */
export const SECTIONS = [
  { id: 'foundations', title: 'Foundations', complete: false },
  { id: 'containers', title: 'Containers & surfaces', complete: false },
  { id: 'chips', title: 'Chips', complete: true },
  { id: 'tabs', title: 'Tabs', complete: true },
  { id: 'fields', title: 'Text fields', complete: true },
  { id: 'dropdowns', title: 'Dropdowns', complete: true },
  { id: 'buttons', title: 'Buttons', complete: true },
  { id: 'files', title: 'File inputs', complete: true },
  { id: 'notices', title: 'Toasts & inline notices', complete: true },
  { id: 'selection', title: 'Selection controls', complete: true },
  { id: 'dialog', title: 'Dialog, empty state & loading', complete: true },
  { id: 'type-scale', title: 'Type scale', complete: true },
  { id: 'specs', title: 'Component specs', complete: false },
  { id: 'dark-mode', title: 'Dark mode', complete: false },
  { id: 'tokens', title: 'Tokens for handoff', complete: false },
]
