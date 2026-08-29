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
  it('TabsSection renders the three variant headings', () => {
    const text = mount(TabsSection).text()
    for (const label of [
      'UNDERLINE — PRIMARY, SITS ON A CARD EDGE',
      'SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS',
      'STAGE TABS — A WORKFLOW WITH VOLUME PER STEP',
    ]) {
      expect(text, `missing: ${label}`).toContain(label)
    }
    expect(mount(TabsSection).findAll('[data-gap]')).toHaveLength(3)
  })

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
    ['DropdownsSection', DropdownsSection],
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

  it('SpecsSection cites Appendix C with no group, not the false “Component specs” heading', () => {
    // “Component specs” is the source document's own section name, quoted in
    // Appendix C's intro - it is not one of Appendix C's 19 groups. A gap
    // that would render all 19 names none of them, so no curly quote appears.
    expect(mount(SpecsSection).text()).not.toContain('”')
  })
})

describe('SpecsSection hosts the components the artifact only redlines', () => {
  // StatCard and Meter have an Appendix C group (“Stat cards & meters”) but no
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
    expect(wrapper.find('[role=”progressbar”]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Uploaded')
  })

  it('still renders its SpecTables gap', () => {
    // The spec-table component itself is still unbuilt; hosting StatCard here
    // must not disturb that marker.
    expect(mount(SpecsSection).findAll('[data-gap]')).toHaveLength(1)
  })
})
