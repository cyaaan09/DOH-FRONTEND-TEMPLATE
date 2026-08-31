import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FileInput from '../FileInput.vue'
import FileInputCompact from '../FileInputCompact.vue'
import FileList from '../FileList.vue'

const FILES = [
  { id: 'f1', name: 'matangcas-pnpki.p12', size: '3.2 KB', ext: 'P12', state: 'done' },
  { id: 'f2', name: 'floorplan.pdf', size: '8.4 MB', ext: 'PDF', state: 'uploading', pct: 62 },
  { id: 'f3', name: 'annex-b2.xlsx', size: '12.8 MB', ext: 'XLS', state: 'failed' },
]

describe('FileInput', () => {
  const mountZone = (props = {}) =>
    mount(FileInput, { props: { label: 'PNPKI certificate', ...props } })

  it('renders its label, title and constraint', () => {
    const wrapper = mountZone({ constraint: '.p12 · up to 5 MB' })
    expect(wrapper.get('[data-label]').text()).toBe('PNPKI certificate')
    expect(wrapper.get('[data-title]').text()).toBe('Drop a file or click to browse')
    expect(wrapper.get('[data-constraint]').text()).toBe('.p12 · up to 5 MB')
  })

  it('exposes the dropzone as an activatable control', () => {
    // Ark's getDropzoneProps sets role=button and tabIndex 0, so the zone is
    // reachable and operable from the keyboard without a <label> wrapper.
    const zone = mountZone().get('[data-dropzone]')
    expect(zone.attributes('role')).toBe('button')
    expect(zone.attributes('tabindex')).toBe('0')
  })

  it('renders a native file input for the picker', () => {
    expect(mountZone().find('input[type="file"]').exists()).toBe(true)
  })

  it('hides the type mark from assistive tech', () => {
    // Redline "Dropzone mark" — the ↑ is decoration; the title carries the
    // meaning, so the glyph must not be read out before it.
    expect(mountZone().get('[data-mark]').attributes('aria-hidden')).toBe('true')
  })

  it('omits the hint slot entirely when there is no hint', () => {
    expect(mountZone().find('[data-hint]').exists()).toBe(false)
    expect(mountZone({ hint: 'Click it' }).get('[data-hint]').text()).toBe('Click it')
  })
})

describe('FileInputCompact', () => {
  const mountRow = (props = {}) =>
    mount(FileInputCompact, { props: { label: 'Compact · inside a form row', ...props } })

  it('shows the placeholder in the meta tone until a file is chosen', () => {
    const empty = mountRow().get('[data-name]')
    expect(empty.text()).toBe('No file selected')
    expect(empty.classes()).toContain('text-text-meta')
    expect(empty.classes()).not.toContain('text-ink-900')
  })

  it('shows the file name in the ink tone once there is one', () => {
    const named = mountRow({ fileName: 'certificate.p12' }).get('[data-name]')
    expect(named.text()).toBe('certificate.p12')
    expect(named.classes()).toContain('text-ink-900')
    expect(named.classes()).not.toContain('text-text-meta')
  })

  it('keeps the row at the field height with its own trigger inset', () => {
    // Redline "Compact row" — the 38px field shell; the trigger is 28px, so
    // the row's right pad drops to 6px while the name keeps 12px.
    expect(mountRow().get('[data-row]').classes()).toContain('h-field')
    expect(mountRow().get('[data-trigger]').text()).toBe('Browse')
  })
})

describe('FileList', () => {
  const mountList = (props = {}) => mount(FileList, { props: { files: FILES, ...props } })

  it('dresses each row by its state, never by emit order', () => {
    // One branch per state, each naming both properties it owns.
    const rows = mountList().findAll('[data-file-row]')
    expect(rows[0].classes()).toContain('bg-surface')
    expect(rows[0].classes()).not.toContain('bg-red-50')
    expect(rows[2].classes()).toContain('bg-red-50')
    expect(rows[2].classes()).toContain('border-red-border')
    expect(rows[2].classes()).not.toContain('bg-surface')
  })

  it('shows a progress bar only while uploading, and announces the value', () => {
    const rows = mountList().findAll('[data-file-row]')
    expect(rows[0].find('[data-bar]').exists()).toBe(false)
    const bar = rows[1].get('[data-bar]')
    expect(bar.attributes('role')).toBe('progressbar')
    expect(bar.attributes('aria-valuenow')).toBe('62')
    expect(rows[1].get('[data-bar-fill]').attributes('style')).toContain('width: 62%')
  })

  it('writes the success note in green and the failure note in red at 500', () => {
    const rows = mountList().findAll('[data-file-row]')
    expect(rows[0].get('[data-note]').classes()).toContain('text-green-text')
    const failed = rows[2].get('[data-note]')
    expect(failed.classes()).toContain('text-red-700')
    expect(failed.classes()).toContain('font-medium')
  })

  it('names each remove button after its own file', () => {
    // A row of bare × buttons is unusable by screen reader; the label has to
    // carry which file it removes.
    const buttons = mountList().findAll('[data-remove]')
    expect(buttons[0].attributes('aria-label')).toBe('Remove matangcas-pnpki.p12')
    expect(buttons[2].attributes('aria-label')).toBe('Remove annex-b2.xlsx')
  })

  it('emits the file it was asked to remove', async () => {
    const wrapper = mountList()
    await wrapper.findAll('[data-remove]')[1].trigger('click')
    expect(wrapper.emitted('remove')[0][0].id).toBe('f2')
  })

  it('replaces the rows with the empty panel when there are none', () => {
    const wrapper = mountList({ files: [] })
    expect(wrapper.findAll('[data-file-row]')).toHaveLength(0)
    expect(wrapper.get('[data-empty]').text()).toBe('No files attached yet.')
  })
})
