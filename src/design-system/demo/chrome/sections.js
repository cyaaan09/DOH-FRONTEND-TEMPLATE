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
  { id: 'foundations', title: 'Foundations', complete: true },
  { id: 'containers', title: 'Containers & surfaces', complete: true },
  { id: 'chips', title: 'Chips', complete: true },
  { id: 'tabs', title: 'Tabs', complete: true },
  { id: 'fields', title: 'Text fields', complete: true },
  { id: 'dropdowns', title: 'Dropdowns', complete: true },
  { id: 'buttons', title: 'Buttons', complete: true },
  { id: 'files', title: 'File inputs', complete: true },
  { id: 'notices', title: 'Toasts & inline notices', complete: true },
  { id: 'selection', title: 'Selection controls', complete: true },
  { id: 'dialog', title: 'Dialog, empty state & loading', complete: true },
  // Added by the 2026-08-31 artifact update — five new sections.
  { id: 'layout', title: 'Layout primitives — Row, Column & containers', complete: true },
  { id: 'stepper', title: 'Stepper', complete: true },
  { id: 'date-picker', title: 'Date picker', complete: true },
  { id: 'tooltip', title: 'Tooltip & popover', complete: true },
  { id: 'accordion', title: 'Accordion', complete: true },
  { id: 'search', title: 'Search with results', complete: false },
  { id: 'notifications', title: 'Notification centre & activity feed', complete: false },
  { id: 'destructive', title: 'Destructive confirmation', complete: false },
  { id: 'shortcuts', title: 'Keyboard shortcuts', complete: false },
  { id: 'print', title: 'Print & PDF preview', complete: false },
  { id: 'form-layout', title: 'Form layout', complete: true },
  { id: 'app-shell', title: 'App shell — side navigation', complete: true },
  { id: 'data-table', title: 'Data table', complete: true },
  { id: 'type-scale', title: 'Type scale', complete: true },
  { id: 'specs', title: 'Component specs', complete: true },
  { id: 'dark-mode', title: 'Dark mode', complete: true },
  { id: 'tokens', title: 'Tokens for handoff', complete: true },
]
