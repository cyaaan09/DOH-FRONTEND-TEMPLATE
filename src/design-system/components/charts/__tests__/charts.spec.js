import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ChartEmpty from '../ChartEmpty.vue'
import ChartPanel from '../ChartPanel.vue'
import ChartReadout from '../ChartReadout.vue'
import DeltaPill from '../DeltaPill.vue'
import DonutChart from '../DonutChart.vue'
import HorizontalBars from '../HorizontalBars.vue'
import StackedBars from '../StackedBars.vue'

const SERIES = [
  { key: 'ok', label: 'On track', tone: 'var(--chart-ok)' },
  { key: 'warn', label: 'No renewal', tone: 'var(--chart-warn)' },
  { key: 'bad', label: 'Overdue', tone: 'var(--chart-bad)' },
]

describe('DeltaPill', () => {
  it('takes its tone and its direction independently', () => {
    // Redline "Direction, not sign · the pill's tone follows whether the
    // movement is GOOD, not whether the number rose — overdue renewals falling
    // is green with a ▼". A component that derived one from the other would
    // paint half a dashboard the wrong colour, so this asserts the pairing the
    // rule exists for: DOWN and GOOD together.
    const wrapper = mount(DeltaPill, { props: { label: '3', direction: 'down', tone: 'good' } })
    expect(wrapper.classes()).toContain('delta--good')
    expect(wrapper.attributes('data-direction')).toBe('down')
    expect(wrapper.text()).toContain('▼')
  })

  it('renders no arrow for a pill that states a condition', () => {
    // "In good standing" and "36 at risk" are not movements.
    const wrapper = mount(DeltaPill, { props: { label: 'In good standing' } })
    expect(wrapper.text()).not.toMatch(/[▲▼]/)
  })

  it('hides the arrow from assistive tech', () => {
    // The label already carries the word; "black down-pointing triangle" does not.
    const wrapper = mount(DeltaPill, { props: { label: '3', direction: 'down' } })
    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('▼')
  })
})

describe('ChartPanel', () => {
  const mountPanel = (props = {}) =>
    mount(ChartPanel, {
      props: { label: 'Licences issued', figure: 88, ...props },
      slots: { default: '<p>plot</p>' },
    })

  it('leads with the figure, then the plot', () => {
    // Redline "Figure first · the header answers the question; the plot adds
    // shape". Asserted as DOM ORDER, which is what a screen reader and a
    // skimming eye both follow.
    const html = mountPanel().html()
    expect(html.indexOf('data-chart-header')).toBeLessThan(html.indexOf('data-chart-plot'))
  })

  it('stacks the period over its note in one right-aligned block', () => {
    // Both lines are the meta block, one <br> apart — not a panel footer, which
    // is what this looked like before the artifact markup was read properly.
    const wrapper = mountPanel({ period: 'This month', note: '744 in 12 months' })
    const period = wrapper.get('[data-chart-period]')
    expect(period.text()).toContain('This month')
    expect(period.text()).toContain('744 in 12 months')
    expect(period.html()).toContain('<br')
  })

  it('renders the delta pill only when there is a delta', () => {
    expect(mountPanel().find('[data-delta]').exists()).toBe(false)
    expect(mountPanel({ delta: '15.8%' }).find('[data-delta]').exists()).toBe(true)
  })

  it('names the table view holding the same data', () => {
    // Redline "A11y · each chart names the table view holding the same data".
    // The SVG is aria-hidden, so this link is the whole non-visual path in.
    const wrapper = mountPanel({ tableHref: '#licences' })
    expect(wrapper.get('[data-chart-table-link]').attributes('href')).toBe('#licences')
  })

  it('is a figure with a figcaption, not a bare div', () => {
    expect(mountPanel().element.tagName).toBe('FIGURE')
    expect(mountPanel().get('[data-chart-header]').element.tagName).toBe('FIGCAPTION')
  })
})

describe('StackedBars', () => {
  const columns = [
    {
      label: 'Sep',
      segments: [
        { key: 'ok', value: 13 },
        { key: 'warn', value: 4 },
        { key: 'bad', value: 1 },
      ],
    },
    {
      label: 'Dec',
      segments: [
        { key: 'ok', value: 22 },
        { key: 'warn', value: 7 },
        { key: 'bad', value: 3 },
      ],
    },
  ]
  const mountBars = () =>
    mount(StackedBars, { props: { columns, series: SERIES, emphasis: 'Dec' } })

  it('rounds the outer ends only, so a stack reads as one bar', () => {
    // Redline "Bars · radius 5px on the outer end only". Rounding every segment
    // draws a column of separate pills instead of one divided bar.
    const segments = mountBars().findAll('[data-bar-column]')[0].findAll('[data-bar-segment]')
    expect(segments[0].attributes('style')).toContain('border-radius: 5px 5px 0 0')
    expect(segments[1].attributes('style')).toContain('border-radius: 0')
    expect(segments[2].attributes('style')).toContain('border-radius: 0 0 5px 5px')
  })

  it('paints the stack top-down from a bottom-up series order', () => {
    // The data lists series in stack order (bottom first) because that is how
    // the legend and the readout read; the DOM has to reverse it.
    const first = mountBars().findAll('[data-bar-column]')[0].findAll('[data-bar-segment]')
    expect(first[0].attributes('style')).toContain('var(--chart-bad)')
    expect(first[2].attributes('style')).toContain('var(--chart-ok)')
  })

  it('draws nothing for a series with no value', () => {
    // min-height keeps a small-but-real segment visible; without this filter it
    // would also paint a 2px red mark on a month with no overdue licences.
    const wrapper = mount(StackedBars, {
      props: {
        columns: [
          {
            label: 'Nov',
            segments: [
              { key: 'ok', value: 9 },
              { key: 'warn', value: 3 },
              { key: 'bad', value: 0 },
            ],
          },
        ],
        series: SERIES,
      },
    })
    const segments = wrapper.findAll('[data-bar-segment]')
    expect(segments).toHaveLength(2)
    // and the rounding follows what is drawn, not the raw list
    expect(segments[0].attributes('style')).toContain('border-radius: 5px 5px 0 0')
    expect(segments[1].attributes('style')).toContain('border-radius: 0 0 5px 5px')
  })

  it('totals each column and emphasises exactly one', () => {
    // Redline "One emphasis · exactly one element at full weight per chart".
    const wrapper = mountBars()
    expect(wrapper.findAll('[data-bar-value]').map((v) => v.text())).toEqual(['18', '32'])
    expect(wrapper.findAll('[data-bar-column][data-emphasis]')).toHaveLength(1)
  })
})

describe('HorizontalBars', () => {
  const rows = [
    { label: 'Primary Care Facility', value: 96 },
    { label: 'Birthing Home', value: 58 },
  ]

  it('scales bars against the largest row, not the total', () => {
    // This chart ranks. Scaling to the total leaves every bar short and the
    // ranking hard to read; the share column carries the proportion in text.
    const fills = mount(HorizontalBars, { props: { rows, total: 211 } }).findAll('[data-hbar-fill]')
    expect(fills[0].attributes('style')).toContain('width: 100%')
    expect(fills[1].attributes('style')).toContain(`width: ${(58 / 96) * 100}%`)
  })

  it('takes the share from the total, so the percentages are of the whole', () => {
    const wrapper = mount(HorizontalBars, { props: { rows, total: 211 } })
    expect(wrapper.findAll('[data-hbar-share]').map((s) => s.text())).toEqual(['45%', '27%'])
  })

  it('emphasises the top row and only the top row', () => {
    const wrapper = mount(HorizontalBars, { props: { rows, total: 211 } })
    expect(wrapper.findAll('[data-hbar-row][data-emphasis]')).toHaveLength(1)
  })
})

describe('DonutChart', () => {
  const slices = [
    { label: 'Active', value: 178, tone: 'var(--chart-ok)' },
    { label: 'Expiring', value: 21, tone: 'var(--chart-warn)' },
    { label: 'Overdue', value: 8, tone: 'var(--chart-bad)' },
    { label: 'Closed', value: 4, tone: 'var(--chart-idle)' },
  ]
  const mountDonut = () =>
    mount(DonutChart, { props: { slices, centreValue: 178, centreLabel: 'active' } })

  it('uses butt caps on every slice', () => {
    // Redline "Donut caps · butt, never round". geometry.spec.js proves the
    // arithmetic; this proves the attribute that makes it true on screen.
    for (const slice of mountDonut().findAll('[data-donut-slice]')) {
      expect(slice.attributes('stroke-linecap')).toBe('butt')
    }
  })

  it('passes the tone through style, never through a stroke attribute', () => {
    // var() does not resolve in an SVG presentation attribute — the ring simply
    // would not paint, silently, in a file that compiles clean.
    const slice = mountDonut().findAll('[data-donut-slice]')[0]
    expect(slice.attributes('stroke')).toBeUndefined()
    expect(slice.attributes('style')).toContain('var(--chart-ok)')
  })

  it('carries every slice in text, since the ring is aria-hidden', () => {
    // Redline "A11y · SVG is aria-hidden; the legend carries the meaning".
    const wrapper = mountDonut()
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    const legend = wrapper.get('[data-donut-legend]')
    expect(legend.text()).toContain('Overdue')
    expect(legend.text()).toContain('8')
    expect(legend.text()).toContain('4%')
  })

  it('keeps the centre block inside the hole', () => {
    // Redline "Donut centre · the hole is 81px — the centre block caps at
    // max-width 70px. An uncapped caption overruns onto the ring, where the SVG
    // sibling is not an ancestor background so no contrast check catches it."
    const style = mountDonut().get('[data-donut-centre]').attributes('style')
    expect(style).toContain('max-width: 70px')
  })
})

describe('ChartReadout', () => {
  it('shows every series plus a total, in the order given', () => {
    // Redline "every series in stack order + a total row above a 1px rule".
    // Every series always — hiding a zero row changes the readout's shape
    // between columns and the row you are looking for moves.
    const wrapper = mount(ChartReadout, {
      props: {
        period: 'DECEMBER 2026',
        rows: [
          { label: 'On track', value: 22, tone: 'a' },
          { label: 'No renewal', value: 7, tone: 'b' },
          { label: 'Overdue', value: 0, tone: 'c' },
        ],
      },
    })
    expect(wrapper.findAll('[data-readout-row]')).toHaveLength(3)
    expect(wrapper.get('[data-readout-total]').text()).toContain('29')
    expect(wrapper.get('[data-readout-period]').text()).toBe('DECEMBER 2026')
  })
})

describe('ChartEmpty', () => {
  it('says why, and offers the fix', () => {
    // Redline "Empty · says why in 13px/700 + a 12px reason + a 34px reset
    // button. Never an empty gridded frame, never a zero line."
    const wrapper = mount(ChartEmpty, {
      props: {
        title: 'No licences issued in this range',
        reason: 'First LTO was March 2019.',
        actionLabel: 'Reset',
      },
    })
    expect(wrapper.get('[data-empty-title]').text()).toContain('No licences issued')
    expect(wrapper.get('[data-empty-reason]').text()).toContain('March 2019')
    wrapper.get('[data-empty-action]').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
  })

  it('drops the button when there is nothing to reset to', () => {
    expect(
      mount(ChartEmpty, { props: { title: 'None' } })
        .find('[data-empty-action]')
        .exists(),
    ).toBe(false)
  })
})
