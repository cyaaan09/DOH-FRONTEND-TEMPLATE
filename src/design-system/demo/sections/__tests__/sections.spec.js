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

  it('marks the toast stack as not built', () => {
    // Toast is Phase 3e. Its slot must be visible, not absent.
    expect(mount(NoticesSection).findAll('[data-gap]').length).toBeGreaterThan(0)
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
  it('SelectionSection renders all six sub-blocks', () => {
    const text = mount(SelectionSection).text()
    for (const label of [
      'CHECKBOX · STATES',
      'RADIO · LIST',
      'SWITCH · TAKES EFFECT AT ONCE',
      'CHECKBOX CARDS · MULTI',
      'RADIO CARDS · SINGLE',
      'BULK SELECTION — TABLE HEADER + ACTION BAR',
    ]) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    expect(mount(SelectionSection).findAll('[data-gap]')).toHaveLength(6)
  })

  it('FilesSection renders its file-list heading and marks both gaps', () => {
    expect(mount(FilesSection).text()).toContain('FILE LIST — UPLOADING, DONE, FAILED')
    expect(mount(FilesSection).findAll('[data-gap]').length).toBeGreaterThan(0)
  })

  it('DialogSection shows Skeleton for real and marks the other two', () => {
    const wrapper = mount(DialogSection)
    const text = wrapper.text()
    for (const label of ['CONFIRMATION DIALOG', 'EMPTY STATE', 'SKELETON ROWS']) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    // Skeleton is built; Dialog and EmptyState are not.
    expect(wrapper.findAll('[data-gap]')).toHaveLength(2)
    expect(wrapper.findAll('[data-row]').length).toBeGreaterThan(0)
  })

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
