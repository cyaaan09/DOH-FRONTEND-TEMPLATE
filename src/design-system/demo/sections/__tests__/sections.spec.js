import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChipsSection from '../ChipsSection.vue'
import NoticesSection from '../NoticesSection.vue'
import ButtonsSection from '../ButtonsSection.vue'
import FieldsSection from '../FieldsSection.vue'
import ContainersSection from '../ContainersSection.vue'
import TypeScaleSection from '../TypeScaleSection.vue'
import TabsSection from '../TabsSection.vue'
import DropdownsSection from '../DropdownsSection.vue'
import FilesSection from '../FilesSection.vue'
import SelectionSection from '../SelectionSection.vue'
import DialogSection from '../DialogSection.vue'
import FoundationsSection from '../FoundationsSection.vue'
import DarkModeSection from '../DarkModeSection.vue'
import SpecsSection from '../SpecsSection.vue'
import TokensSection from '../TokensSection.vue'

describe('ChipsSection', () => {
  it('carries the artifact description verbatim', () => {
    expect(mount(ChipsSection).text()).toContain(
      'Tone comes from the meaning, never from decoration.',
    )
  })

  it('renders the five tone sub-blocks the artifact shows', () => {
    const text = mount(ChipsSection).text()
    for (const label of ['STATUS', 'APPLICATION TYPE', 'SERVICE', 'SOURCE', 'COUNT & OVERFLOW']) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('renders the interactive and dismissible strips', () => {
    const text = mount(ChipsSection).text()
    expect(text).toContain('INTERACTIVE — FILTER CHIPS')
    expect(text).toContain('DISMISSIBLE — APPLIED FILTERS')
  })

  it('renders the three rule cards', () => {
    const wrapper = mount(ChipsSection)
    expect(wrapper.findAll('[data-rule]')).toHaveLength(3)
    expect(wrapper.text()).toContain('One tone per meaning')
  })

  it('removes exactly the dismissed chip using the { chipKey, value } payload', async () => {
    // Ported from the deleted ChipsDemo.spec.js. DismissibleChip emits an
    // object payload, not a bare value (Finding 9 — a bare value can't
    // disambiguate two chips that share a value under different keys). The
    // applied list gives "Source:" and "Payment:" the same value ("Online")
    // so a handler filtering on value alone would remove both chips (or
    // neither) instead of only the one dismissed — and separately gives two
    // chips the same "Source:" key with different values ("Online" and
    // "Migrated", review Finding 3) so a handler filtering on chipKey alone
    // fails the same way. Only checking BOTH fields together passes.
    const wrapper = mount(ChipsSection)
    const removeButtons = () => wrapper.findAll('button[aria-label^="Remove"]')

    expect(removeButtons()).toHaveLength(5)

    await removeButtons()[2].trigger('click') // "Source: Online"

    const remaining = removeButtons()
    expect(remaining).toHaveLength(4)
    const labels = remaining.map((button) => button.attributes('aria-label'))
    expect(labels).not.toContain('Remove Source: Online')
    expect(labels).toContain('Remove Payment: Online')
    expect(labels).toContain('Remove Status: Active')
    expect(labels).toContain('Remove Expiry: Within 90 days')
    expect(labels).toContain('Remove Source: Migrated')
  })
})

describe('NoticesSection', () => {
  it('renders the inline notices strip with all four tones', () => {
    const text = mount(NoticesSection).text()
    expect(text).toContain('INLINE NOTICES — PERSISTENT, IN-FLOW')
    for (const label of ['Success', 'Info', 'Warning', 'Error']) {
      expect(text, `missing notice: ${label}`).toContain(label)
    }
  })

})

describe('sections with complete components render no gaps', () => {
  it.each([
    ['ButtonsSection', ButtonsSection],
    ['FieldsSection', FieldsSection],
    ['TypeScaleSection', TypeScaleSection],
  ])('%s', (_name, component) => {
    expect(mount(component).findAll('[data-gap]')).toHaveLength(0)
  })
})

describe('TypeScaleSection', () => {
  it('renders the three rule cards (Appendix D, typeRules)', () => {
    // Finding 1 — the original rule extraction missed this array's shape, so
    // Appendix D showed an empty "Rule cards:" heading and the section was
    // built with no DemoRules footer. It has since been extracted (spec
    // Appendix D, "typeRules"); this section must render it like any other.
    const wrapper = mount(TypeScaleSection)
    expect(wrapper.findAll('[data-rule]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Three weights only')
    expect(wrapper.text()).toContain("DM Sans's 500 already reads as emphasis.")
  })
})

describe('ContainersSection', () => {
  it('renders all four sub-blocks, gaps included', () => {
    const text = mount(ContainersSection).text()
    for (const label of [
      'PAGE SHELL — CANVAS, RAIL, STICKY HEADER, CONTENT',
      'CARD — HEADER, BODY, FOOTER',
      'DIVIDED CARD — NO NESTING',
      'INNER SURFACES',
    ]) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('marks the page shell as not built', () => {
    expect(mount(ContainersSection).findAll('[data-gap]').length).toBeGreaterThan(0)
  })

  it('renders the INNER SURFACES captions and closing line verbatim (Appendix D.1)', () => {
    const text = mount(ContainersSection).text()
    for (const caption of [
      'Sunken strip #FAFBFD — expanded row, footer',
      'Input well #F7F9FC — read-only fields, panel search',
      'Control shell #F4F6FA — segmented tabs, hover',
      'Dashed #CDD5E2 — dropzones and empty states only',
    ]) {
      expect(text, `missing caption: ${caption}`).toContain(caption)
    }
    expect(text).toContain('Four tints, each with one job. No new greys.')
  })
})

describe('skeleton sections show their headings and mark their gaps', () => {


  it.each([
    ['FoundationsSection', FoundationsSection],
  ])('%s marks its gaps', (_name, component) => {
    expect(mount(component).findAll('[data-gap]').length).toBeGreaterThan(0)
  })

  it('DarkModeSection renders all six sub-blocks and four rule cards', () => {
    const wrapper = mount(DarkModeSection)
    const text = wrapper.text()
    for (const label of [
      'CHIPS & TONES',
      'TABS & STAGE CARDS',
      'FIELDS & DROPDOWN',
      'SELECTION & FILES',
      'DIALOG, EMPTY, SKELETON & PAGINATION',
      'TOASTS, NOTICES & TABLE',
    ]) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    expect(wrapper.findAll('[data-gap]')).toHaveLength(6)
    expect(wrapper.findAll('[data-rule]')).toHaveLength(4)
  })

  it('renders no invented uppercase headings for Dropdowns, Component specs and Tokens', () => {
    // Spec Appendix D.1, "Sections with NO uppercase sub-blocks" — an earlier
    // pass invented DemoBlock headings for these three; none exists in the
    // source, so none of these sections should render the column-header class.
    for (const Section of [DropdownsSection, SpecsSection, TokensSection]) {
      expect(mount(Section).findAll('.text-column-header')).toHaveLength(0)
    }
  })

  it('FilesSection renders exactly one uppercase heading (FILE LIST)', () => {
    // Appendix D.1 gives File inputs exactly one uppercase sub-block; the
    // PNPKI/Compact demos carry field labels instead, not column headers.
    expect(mount(FilesSection).findAll('.text-column-header')).toHaveLength(1)
  })

  it('SpecsSection cites Appendix C with no group, not the false "Component specs" heading', () => {
    // "Component specs" is the source document's own section name, quoted in
    // Appendix C's intro - it is not one of Appendix C's 19 groups. A gap
    // that would render all 19 names none of them, so no curly quote appears.
    // U+201C as an escape, not a literal: this assertion has already been
    // corrupted once by smart-quote substitution, and an escape cannot be
    // silently mangled.
    expect(mount(SpecsSection).text()).not.toContain('\u201c')
  })
})

describe('SpecsSection hosts the components the artifact only redlines', () => {
  // StatCard and Meter have an Appendix C group ("Stat cards & meters") but no
  // page section of their own, so deleting the old CardsDemo left them
  // invisible. Component specs is where redlines live, so they go here rather
  // than in an invented section the artifact does not have.
  it('renders StatCard with its label, figure and hint', () => {
    const text = mount(SpecsSection).text()
    expect(text).toContain('Active LTOs')
    expect(text).toContain('211')
    expect(text).toContain('2 due within 7 days')
  })

  it('renders a Meter with its caption', () => {
    const wrapper = mount(SpecsSection)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Uploaded')
  })

  it('still renders its SpecTables gap', () => {
    // The spec-table component itself is still unbuilt; hosting StatCard here
    // must not disturb that marker.
    expect(mount(SpecsSection).findAll('[data-gap]')).toHaveLength(1)
  })

  it('insets the stat block by the card padding, like every sibling block', () => {
    // Regression: this block first shipped as a bare child of DemoCard's slot,
    // so it rendered flush to the card edge while the header and DemoBlocks
    // were inset by px-card-x. jsdom computes no layout, so the misalignment
    // is only catchable as a class.
    expect(mount(SpecsSection).get('[data-stat-block]').classes()).toContain('px-card-x')
  })

  it('names the two demos with field labels, not uppercase headings', () => {
    // Appendix D.1 lists Component specs under "Sections with NO uppercase
    // sub-blocks", so these take FilesSection's 12.5/500 field-label treatment.
    // Without a name, neither demo is identifiable on the page.
    const wrapper = mount(SpecsSection)
    const labels = wrapper.findAll('.text-field-label').map((el) => el.text())
    expect(labels).toContain('Stat cards')
    expect(labels).toContain('Meter')
    expect(wrapper.findAll('.text-column-header')).toHaveLength(0)
  })
})

describe('TabsSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(TabsSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('shows the underline tabs with the artifact data', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Active LTOs')
    expect(text).toContain('211')
    expect(text).toContain('MOA services')
  })

  it('shows the panel body of whichever tab is active', () => {
    // The three tab rows are independently stateful, so the section holds the
    // selection; a static render must still show the default tab's body.
    expect(mount(TabsSection).text()).toContain('211 licences currently valid')
  })

  it('shows the four segmented filter options', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Initial')
    expect(text).toContain('Add / Modify')
  })

  it('shows all five workflow stages', () => {
    const text = mount(TabsSection).text()
    expect(text).toContain('Inspection')
    expect(text).toContain('Closed')
    expect(text).toContain('rejected · forfeited')
  })
})

describe('DropdownsSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(DropdownsSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('still renders no uppercase headings', () => {
    // Appendix D.1 — Dropdowns has none; the demos carry field labels instead.
    expect(mount(DropdownsSection).findAll('.text-column-header')).toHaveLength(0)
  })

  it('names all four demos with their field label and qualifier', () => {
    const text = mount(DropdownsSection).text()
    for (const label of ['Facility type', 'Services', 'Inline filter', 'Row menu']) {
      expect(text, `missing field label: ${label}`).toContain(label)
    }
    for (const qualifier of ['· single select', '· multi select', '· table bar', '· actions']) {
      expect(text, `missing qualifier: ${qualifier}`).toContain(qualifier)
    }
  })

  it('carries the four notes verbatim from Appendix D.1', () => {
    const text = mount(DropdownsSection).text()
    expect(text).toContain('Placeholder greys out until a value is picked.')
    expect(text).toContain('Long lists get an inline filter and a sticky footer.')
    expect(text).toContain('34px variant for filter bars, with the field name inline.')
    expect(text).toContain('Destructive item sits last, separated by a hairline.')
  })

  it('shows the select placeholder from the artifact', () => {
    expect(mount(DropdownsSection).text()).toContain('Select a facility type')
  })

  // The five tests above all read text that DropdownsSection's own template
  // supplies (field labels, qualifiers, notes) or that only Select's own
  // `{{ modelValue || placeholder }}` can produce. None of them would notice
  // a wiring mistake inside MultiSelect, InlineFilter or RowMenu specifically
  // (wrong array, a v-model pointed at the wrong ref, two components
  // swapped) — each test below binds to output only that one child component
  // can produce.

  it("shows MultiSelect's own computed summary for the seeded selection", () => {
    // MultiSelect.vue's `summary` computed: `${modelValue.length} selected`.
    // `services` is seeded with two entries, so only MultiSelect renders
    // this string — proves `services` (not some other array) reached it.
    // Appendix D.1 — the trigger names the picked options and puts the total in
    // a badge; it does not render a count sentence. Both halves are asserted so
    // this still binds to MultiSelect's own output rather than the section's.
    const wrapper = mount(DropdownsSection)
    expect(wrapper.text()).toContain('Pharmacy, Birthing Home')
    expect(wrapper.get('[data-count]').text()).toBe('2')
  })

  it("shows InlineFilter's own name and value text, not the section's markup", () => {
    // InlineFilter.vue renders `name` and `modelValue` as two sibling spans
    // (`data-name`, immediately followed by `data-value`), not one
    // interpolated string — confirmed empirically: the whitespace-only text
    // node the template source has between them contains a newline, which
    // Vue's compiler drops entirely, so the rendered text is "Status:Active"
    // with no space. Checking `toContain('Status: Active')` would therefore
    // fail against a correctly wired component. InlineFilter.spec.js's own
    // "renders the field name inline before the value" test already checks
    // the two spans as two separate exact strings for the same reason; this
    // mirrors that precedent instead of guessing at concatenated whitespace.
    // `data-name` is unique to InlineFilter among the four dropdown demos,
    // so this is unambiguous even though `data-value` also appears on
    // Select's and MultiSelect's triggers.
    const wrapper = mount(DropdownsSection)
    const nameSpan = wrapper.get('[data-name]')
    expect(nameSpan.text()).toBe('Status:')
    expect(nameSpan.element.nextElementSibling.textContent).toBe('Active')
  })

  it("names the row menu trigger from its own label prop", () => {
    // RowMenu closed renders only its decorative `⋯` glyph (aria-hidden), so
    // there is no visible text this test could bind to; its trigger's
    // aria-label is the one output the `label` prop itself produces. All
    // four dropdown demos share the `[data-trigger]` attribute, so this
    // checks the full set rather than assuming which index is RowMenu's.
    const ariaLabels = mount(DropdownsSection)
      .findAll('[data-trigger]')
      .map((trigger) => trigger.attributes('aria-label'))
    expect(ariaLabels).toContain('Row actions')
  })
})

describe('SelectionSection renders real components, not gaps', () => {
  it('has no gap markers left', () => {
    expect(mount(SelectionSection).findAll('[data-gap]')).toHaveLength(0)
  })

  it('still renders all six uppercase sub-blocks', () => {
    const text = mount(SelectionSection).text()
    for (const label of [
      'CHECKBOX · STATES',
      'RADIO · LIST',
      'SWITCH · TAKES EFFECT AT ONCE',
      'CHECKBOX CARDS · MULTI',
      'RADIO CARDS · SINGLE',
      'BULK SELECTION — TABLE HEADER + ACTION BAR',
    ]) {
      expect(text, `missing sub-block: ${label}`).toContain(label)
    }
  })

  it('carries the checkbox states verbatim from Appendix D.1', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Include legacy records')
    expect(text).toContain('Migrated paper licences with no service list')
    expect(text).toContain('All Caraga provinces')
    expect(text).toContain('3 of 5 provinces selected')
  })

  it('shows an indeterminate checkbox, which is the point of that sub-block', () => {
    // Deviates from the task brief here, which targeted
    // `[role="checkbox"][aria-checked="mixed"]`. Confirmed empirically (mount
    // Checkbox with indeterminate: true and inspect wrapper.html()) and
    // against Checkbox.spec.js "exposes the mixed state to assistive
    // technology", BulkActionBar.spec.js "shows the header box mixed...", and
    // Task 1's report: no element Checkbox.vue renders ever carries a
    // literal `role` attribute or an `aria-checked` attribute. The mixed
    // state lives only on the native hidden input's `indeterminate` IDL
    // property. `[role="checkbox"][aria-checked="mixed"]` would match zero
    // elements against a correctly wired, correctly built component.
    const wrapper = mount(SelectionSection)
    const mixed = wrapper
      .findAll('input[type="checkbox"]')
      .filter((input) => input.element.indeterminate)
    expect(mixed.length).toBeGreaterThan(0)
  })

  it('carries the switch rows, including the disabled one', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Maintenance mode')
    expect(text).toContain('Enforced by policy — cannot be turned off')
  })

  it('carries the card options with their em dashes intact', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Clinical Laboratory — Limited')
    expect(text).toContain('Add / Modify')
  })

  it('shows the bulk rows and their licence numbers', () => {
    const text = mount(SelectionSection).text()
    expect(text).toContain('Trento Primary Care Facility')
    expect(text).toContain('16-015-2527-PCF-1')
    expect(text).toContain('Select all')
  })
})

describe('SelectionSection follows the artifact arrangement', () => {
  it('closes its first three sub-blocks with their footnotes', () => {
    // Appendix D.1 — three trailing notes, one per first-row sub-block. The
    // section shipped without them; DemoBlock's `note` prop leads, so these
    // needed their own trailing slot. Asserting position, not just presence:
    // a leading note would satisfy a text-only check.
    const wrapper = mount(SelectionSection)
    const notes = wrapper.findAll('[data-footnote]').map((n) => n.text())
    expect(notes).toEqual([
      'Parent rows show a dash when only some children are picked.',
      'Three or fewer short options; more than that becomes a dropdown.',
      'Switch sits right of its label — nothing to submit, so nothing to scan back to.',
    ])
    const first = wrapper.findAll('[data-footnote]')[0].element
    const label = wrapper.findAll('[data-label]')[0].element
     
    expect(Boolean(label.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
      true,
    )
  })

  it('puts bulk selection in a full-width strip, not the sub-block grid', () => {
    // Appendix D.1 — the section is three stacked wrappers. Built as one
    // DemoBlocks, auto-fit floated BULK SELECTION up as a third column
    // beside the two card blocks, which is what the screenshot showed.
    const wrapper = mount(SelectionSection)
    const grids = wrapper.findAll('.demo-blocks')
    expect(grids).toHaveLength(2)
    grids.forEach((g) => expect(g.text()).not.toContain('BULK SELECTION'))

    const bulk = wrapper
      .findAll('[data-label]')
      .find((el) => el.text().startsWith('BULK SELECTION'))
    expect(bulk).toBeDefined()
    expect(bulk.element.closest('.demo-blocks')).toBe(null)
  })

  it('widens the card row so it holds two columns, not three', () => {
    // Appendix D.1 — the card grid runs a 300px track against the 268px the
    // first row uses, which is what keeps the two card blocks side by side.
    const grids = mount(SelectionSection).findAll('.demo-blocks')
    expect(grids[0].attributes('style')).toContain('268px')
    expect(grids[1].attributes('style')).toContain('300px')
  })
})

describe('FieldsSection carries the artifact\'s seven demos', () => {
  // Appendix D.1 — the section shipped six demos in a different order with
  // the hints rewritten to fragments and the password demo absent. Asserting
  // the full ordered list, not just presence: a reordered or re-worded set
  // is exactly what shipped, and a contains-check would have passed it.
  it('renders every label in the artifact order, with its qualifier', () => {
    const labels = mount(FieldsSection)
      .findAll('label, .text-field-label')
      .map((el) => el.text().replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    expect(labels).toEqual([
      'Facility name',
      'LTO number',
      'Search · with leading icon',
      'Certificate password',
      'Bed capacity',
      'NHFR code · read only',
      'Reviewer remarks',
    ])
  })

  it('carries each demo\'s hint verbatim', () => {
    const text = mount(FieldsSection).text()
    for (const hint of [
      'Default · rests on a hairline border.',
      'Focus · 3px ring at 15% green. Mono for reference numbers.',
      "Clear button appears only once there's a value.",
      'Trailing text action instead of an eye icon.',
      'Must be at least 1 for an infirmary.',
      'Disabled fields lose their white surface, never their border.',
      'Textarea keeps the field radius; min 3 rows, resizable vertically only.',
    ]) {
      expect(text).toContain(hint)
    }
  })

  it('wires the password reveal through the trailing action', async () => {
    const wrapper = mount(FieldsSection)
    const field = wrapper.findAll('input').find((i) => i.attributes('type') === 'password')
    expect(field).toBeDefined()
    const button = wrapper.findAll('[data-action]')[0]
    expect(button.text()).toBe('SHOW')
    await button.trigger('click')
    expect(wrapper.findAll('[data-action]')[0].text()).toBe('HIDE')
  })

  it('runs the 280px track and spans the textarea across it', () => {
    const wrapper = mount(FieldsSection)
    expect(wrapper.get('.demo-blocks').attributes('style')).toContain('--db-min: 280px')
    expect(wrapper.find('.fields-section__wide').exists()).toBe(true)
  })
})

describe('carry-forward audit: arrangement the earlier sections were built without', () => {
  it('DropdownsSection draws the inline filter\'s field name', () => {
    // Appendix D.1 — the InlineFilter trigger reads "Status: All". The name
    // comes from the component, not the section, which is why a text scan of
    // the section file alone reports it missing.
    expect(mount(DropdownsSection).text()).toContain('Status:')
  })

  it('DropdownsSection runs the 260px track it was already specced for', () => {
    // D.1 recorded 260px / gap 20px 24px / align-items:start when Dropdowns
    // was built, and the build used §17.1's 268px default anyway.
    const grid = mount(DropdownsSection).get('.demo-blocks')
    expect(grid.attributes('style')).toContain('--db-min: 260px')
    expect(grid.attributes('style')).toContain('--db-gap: 20px 24px')
    expect(grid.classes()).toContain('items-start')
  })

  it('TabsSection runs three plain blocks, each leading with its note', () => {
    // Appendix D.1 — Tabs' blocks are NOT the sunken strips Chips and Toasts
    // use; they sit on the card surface, and the first carries no top rule
    // because it opens the body. All three shipped tinted and note-less.
    const wrapper = mount(TabsSection)
    const strips = wrapper.findAll('.demo-strip')
    expect(strips).toHaveLength(3)
    strips.forEach((s) => expect(s.classes()).not.toContain('bg-surface-sunken'))
    expect(strips[0].classes()).not.toContain('border-t')
    expect(strips[1].classes()).toContain('border-t')
    expect(wrapper.findAll('[data-note]').map((n) => n.text())).toEqual([
      'Use at the top of a table card. Counts ride inside the label.',
      'Sits in a filter bar next to the search field. Never more than four.',
      'The pipeline pattern from LTO Applications: numbered, countable, one urgent tone allowed.',
    ])
  })

  it('ButtonsSection runs two rows, each with exactly one filled button', () => {
    // Appendix D.1 — a 38px row and a 34px compact row. It shipped as three
    // rows with Apply built secondary and Reset filters ghost, which left
    // the compact row with no primary at all.
    const wrapper = mount(ButtonsSection)
    const rows = wrapper.findAll('.gap-btn-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].findAll('button').map((b) => b.text())).toEqual([
      'Verify & save',
      'Export CSV',
      'Revoke licence',
      'View logs',
      'Sign document',
    ])
    expect(rows[0].findAll('button')[4].attributes('disabled')).toBeDefined()
    expect(rows[1].findAll('button').map((b) => b.text())).toEqual([
      'Apply',
      'Reset filters',
      '⋯',
      'Sign document',
    ])

    // Variant, not just label: Apply shipped secondary and Reset filters
    // ghost, so the compact row had no filled button. `btn--primary` is the
    // marker class Button sets for the primary variant only.
    const compact = rows[1].findAll('button')
    expect(compact[0].classes()).toContain('btn--primary')
    expect(compact[1].classes()).not.toContain('btn--primary')
    expect(compact[1].classes()).toContain('border-field')
    expect(rows[0].findAll('button')[0].classes()).toContain('btn--primary')
    expect(wrapper.text()).toContain('Compact 34px row · click the last one for the pending state')
  })

  it('TypeScaleSection is a three-column table with a header row', () => {
    // Appendix D.1 — TOKEN / SAMPLE / SPEC. It shipped as a two-column list
    // with no header, no spec column, the order shuffled and two samples cut
    // to fragments.
    const wrapper = mount(TypeScaleSection)
    expect(wrapper.get('[data-type-head]').findAll('div').map((d) => d.text())).toEqual([
      'TOKEN',
      'SAMPLE',
      'SPEC',
    ])
    const rows = wrapper.findAll('[data-type-row]')
    expect(rows).toHaveLength(9)
    expect(rows.map((r) => r.findAll('div')[0].text())).toEqual([
      'Page title',
      'Section title',
      'Card figure',
      'Row title',
      'Body',
      'Field label',
      'Meta / hint',
      'Column header',
      'Mono',
    ])
    expect(rows[0].findAll('div')[2].text()).toBe('26px / 700 / -0.015em')
    expect(wrapper.text()).toContain('Buenavista Primary Health Care Center')
    expect(wrapper.text()).toContain('Your PNPKI certificate and its password are stored encrypted.')
  })
})

describe('FilesSection carries the artifact\'s three demos', () => {
  it('renders both inputs and the spanning file list, with no gaps left', () => {
    const wrapper = mount(FilesSection)
    expect(wrapper.findAll('[data-gap]')).toHaveLength(0)
    expect(wrapper.text()).toContain('PNPKI certificate')
    expect(wrapper.text()).toContain('Compact · inside a form row')
    expect(wrapper.text()).toContain('FILE LIST — UPLOADING, DONE, FAILED')
    expect(wrapper.get('[data-dropzone]').text()).toContain('Drop a file or click to browse')
    expect(wrapper.text()).toContain('.p12 · up to 5 MB')
    expect(wrapper.get('[data-row]').text()).toContain('No file selected')
    // Appendix D.1 — the list spans the grid rather than sitting in a strip;
    // the artifact gives this section no tinted strip at all.
    expect(wrapper.findAll('.demo-strip')).toHaveLength(0)
    expect(wrapper.find('.files-section__wide').exists()).toBe(true)
    expect(wrapper.get('.demo-blocks').attributes('style')).toContain('--db-min: 320px')
  })

  it('shows one row per file, each in its own state', () => {
    const wrapper = mount(FilesSection)
    const rows = wrapper.findAll('[data-file-row]')
    expect(rows).toHaveLength(3)
    expect(rows.map((r) => r.get('[data-name]').text())).toEqual([
      'matangcas-pnpki.p12',
      'floorplan-carmen-rhu.pdf',
      'annex-b2-equipment.xlsx',
    ])
    // done -> success note, uploading -> a bar and no note, failed -> red row
    expect(rows[0].get('[data-note]').text()).toBe('Uploaded · virus scan passed')
    expect(rows[1].find('[data-note]').exists()).toBe(false)
    expect(rows[1].get('[data-bar]').attributes('aria-valuenow')).toBe('62')
    expect(rows[2].classes()).toContain('bg-red-50')
    expect(rows[2].get('[data-note]').text()).toBe(
      'Over the 10 MB limit — compress or split the file.',
    )
  })

  it('removes a row through the destructive action', async () => {
    const wrapper = mount(FilesSection)
    await wrapper.findAll('[data-remove]')[1].trigger('click')
    expect(wrapper.findAll('[data-file-row]')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('floorplan-carmen-rhu.pdf')
  })
})

describe('NoticesSection carries the toast demo', () => {
  it('renders one trigger per tone and the contained region', () => {
    const wrapper = mount(NoticesSection)
    expect(wrapper.findAll('[data-gap]')).toHaveLength(0)
    expect(wrapper.findAll('[data-toast-trigger]').map((b) => b.text())).toEqual([
      'Success',
      'Error',
      'Warning',
      'Info',
    ])
    expect(wrapper.text()).toContain(
      'App surface — toasts stack bottom-right, newest on top, 5s auto-dismiss',
    )
    // Appendix D.1 — the demo contains its toasts inside the app surface
    // rather than letting Ark fix them to the viewport.
    expect(wrapper.get('[data-toast-region]').classes()).toContain('toastregion--contained')
  })

  it('keeps its rule cards inside the toast block, not the DemoRules footer', () => {
    // Appendix D.1 — a plain 230px grid with no top rule, card borders or
    // sunken surface, unlike §17.1's DemoRules that other sections use.
    const wrapper = mount(NoticesSection)
    const rules = wrapper.findAll('[data-rule]')
    expect(rules).toHaveLength(3)
    expect(rules[0].text()).toContain('One line, one consequence')
    expect(wrapper.find('.demo-rules__card').exists()).toBe(false)
  })

  it('closes the notices strip with its footnote', () => {
    expect(mount(NoticesSection).get('[data-footnote]').text()).toContain(
      'One line, one pill: the outlined tone label carries the meaning',
    )
  })
})

describe('DialogSection carries all three states', () => {
  it('renders the three sub-blocks with their notes and no gaps', () => {
    const wrapper = mount(DialogSection)
    expect(wrapper.findAll('[data-gap]')).toHaveLength(0)
    for (const label of ['CONFIRMATION DIALOG', 'EMPTY STATE', 'SKELETON ROWS']) {
      expect(wrapper.text(), `missing: ${label}`).toContain(label)
    }
    expect(wrapper.findAll('[data-footnote]').map((n) => n.text())).toEqual([
      'Destructive confirmations name the consequence, not the action.',
      'Three rows only — never a full page of shimmer.',
    ])
  })

  it('renders the empty state with its own action', () => {
    const empty = mount(DialogSection).get('[data-empty-state]')
    expect(empty.get('[data-title]').text()).toBe('Nothing matches those filters')
    expect(empty.get('[data-body]').text()).toBe('Clear the search or switch back to all types.')
    expect(empty.text()).toContain('Reset filters')
  })

  it('renders the skeleton in its table form, three ruled rows of three bars', () => {
    // Appendix D.1 — the demo is a bordered card of ruled rows, not the
    // plain stack Appendix C's bar redline describes on its own.
    const table = mount(DialogSection).get('[data-skeleton-table]')
    const rows = table.findAll('[data-row]')
    expect(rows).toHaveLength(3)
    expect(rows[0].findAll('[data-bar]')).toHaveLength(3)
    // The bars are deliberately not uniform between rows.
    expect(rows[0].findAll('[data-bar]')[0].attributes('style')).toContain('88%')
    expect(rows[1].findAll('[data-bar]')[0].attributes('style')).toContain('72%')
    expect(rows[2].findAll('[data-bar]')[2].attributes('style')).toContain('50%')
  })

  it('opens the confirmation dialog from the destructive trigger', async () => {
    const wrapper = mount(DialogSection, { attachTo: document.body })
    expect(document.querySelector('[data-dialog]')).toBeNull()
    await wrapper.get('button').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))
    const dialog = document.querySelector('[data-dialog]')
    expect(dialog).not.toBeNull()
    expect(dialog.textContent).toContain('Revoke this certificate?')
    // The consequence, not the action — the section's own stated rule.
    expect(dialog.textContent).toContain('You will not be able to sign documents')
    expect(dialog.textContent).toContain('Keep certificate')
    wrapper.unmount()
  })
})

describe('ChipsSection is complete', () => {
  it('renders the count and overflow badges, and leaves no gap', () => {
    const wrapper = mount(ChipsSection)
    expect(wrapper.findAll('[data-gap]')).toHaveLength(0)
    const text = wrapper.text()
    for (const label of ['13', '8', '+4 more', '128 days left', '36 days left']) {
      expect(text, `missing count chip: ${label}`).toContain(label)
    }
  })

  it('tints only the INTERACTIVE strip, not DISMISSIBLE', () => {
    // Appendix D.1 — both shipped tinted; only the first one is.
    const strips = mount(ChipsSection).findAll('.demo-strip')
    expect(strips).toHaveLength(2)
    expect(strips[0].classes()).toContain('bg-surface-sunken')
    expect(strips[1].classes()).not.toContain('bg-surface-sunken')
  })
})
