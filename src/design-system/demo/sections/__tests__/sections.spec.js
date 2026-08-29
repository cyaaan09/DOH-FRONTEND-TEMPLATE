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

  it('SpecsSection cites Appendix C with no group, not the false "Component specs" heading', () => {
    // "Component specs" is the source document's own section name, quoted in
    // Appendix C's intro - it is not one of Appendix C's 19 groups. A gap
    // that would render all 19 names none of them, so no curly quote appears.
    expect(mount(SpecsSection).text()).not.toContain('“')
  })
})
