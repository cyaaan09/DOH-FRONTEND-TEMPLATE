import { describe, expect, it } from 'vitest'
import {
  areaPath,
  axisMax,
  axisTicks,
  donutHole,
  donutSegments,
  plot,
  smoothPath,
} from '../geometry.js'

/**
 * The chart maths, checked against the artifact's own published output rather
 * than against my reading of it. Two of these reproduce a literal string or
 * number the artifact ships, which is the only kind of check that can catch a
 * plausible-but-different implementation.
 */

// Decoded from the artifact's own line chart: y = 105 − (v/100) × 102.
const MONTHS = [38, 44, 41, 52, 61, 57, 66, 72, 68, 81, 76, 88]

/** The artifact's plot box: x from 3 to 317, baseline 105, axis top 100 at y=3. */
const artifactPoints = () =>
  MONTHS.map((value, i) => ({ x: 3 + (i * (317 - 3)) / 11, y: 105 - (value / 100) * 102, value }))

describe('smoothPath', () => {
  it("reproduces the artifact's twelve-month line exactly", () => {
    // Byte-for-byte against the `d` attribute the artifact publishes. If
    // someone swaps this for a Catmull-Rom or a cardinal spline — the usual
    // reach for "smooth" — every chart quietly redraws and this fails.
    const published =
      'M3.0,66.2 C17.3,66.2 17.3,60.1 31.5,60.1 C45.8,60.1 45.8,63.2 60.1,63.2 C74.4,63.2 ' +
      '74.4,52.0 88.6,52.0 C102.9,52.0 102.9,42.8 117.2,42.8 C131.5,42.8 131.5,46.9 145.7,46.9 ' +
      'C160.0,46.9 160.0,37.7 174.3,37.7 C188.5,37.7 188.5,31.6 202.8,31.6 C217.1,31.6 ' +
      '217.1,35.6 231.4,35.6 C245.6,35.6 245.6,22.4 259.9,22.4 C274.2,22.4 274.2,27.5 ' +
      '288.5,27.5 C302.7,27.5 302.7,15.2 317.0,15.2'
    const normalise = (d) =>
      d
        .replace(/(\d)\.0\b/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    expect(normalise(smoothPath(artifactPoints()))).toBe(normalise(published))
  })

  it('never leaves the band its two endpoints define', () => {
    // The whole reason for this curve shape. A spline that interpolates through
    // the points overshoots between them, drawing a value the data never had.
    const points = [
      { x: 0, y: 100 },
      { x: 50, y: 0 },
      { x: 100, y: 100 },
    ]
    const ys = [...smoothPath(points).matchAll(/[,\s](-?[\d.]+)(?=[\s]|$)/g)].map((m) =>
      Number(m[1]),
    )
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(100)
  })

  it('degrades safely on one point and on none', () => {
    expect(smoothPath([])).toBe('')
    expect(smoothPath([{ x: 4, y: 9 }])).toBe('M4,9')
  })
})

describe('areaPath', () => {
  it('closes the line down to the baseline and back', () => {
    const d = areaPath(artifactPoints(), 105)
    expect(d.startsWith('M3,66.2')).toBe(true)
    expect(d.endsWith('L317,105 L3,105 Z')).toBe(true)
  })
})

describe('donutSegments', () => {
  const RADIUS = 46
  const STROKE = 11
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  it('paints the redline’s own worked example at its true share', () => {
    // Redline "Donut caps": an 8-of-211 slice is 3.8%, and a round cap would
    // paint it as 6.9% — "and laps its neighbour". Both halves are asserted,
    // so the arithmetic that justifies butt caps cannot silently stop being
    // true. The demo data IS this example.
    const overdue = donutSegments([178, 21, 8, 4], { radius: RADIUS })[2]
    expect(overdue.share * 100).toBeCloseTo(3.8, 1)
    expect(((overdue.dash + STROKE) / CIRCUMFERENCE) * 100).toBeCloseTo(6.9, 1)
  })

  it('takes the 2px separation OUT of each dash, never adds it between', () => {
    // Adding it would push every later slice off its angle and carry the last
    // one past the top of the circle.
    const values = [178, 21, 8, 4]
    const segments = donutSegments(values, { radius: RADIUS })
    const total = values.reduce((a, b) => a + b, 0)
    let expectedOffset = 0
    for (const [i, segment] of segments.entries()) {
      const arc = (values[i] / total) * CIRCUMFERENCE
      expect(segment.dash).toBeCloseTo(arc - 2, 5)
      expect(segment.offset).toBeCloseTo(-expectedOffset, 5)
      expectedOffset += arc
    }
    // the last slice ends exactly at the circumference — no drift
    expect(expectedOffset).toBeCloseTo(CIRCUMFERENCE, 5)
  })

  it('keeps a hairline for a slice thinner than the gap', () => {
    // Otherwise dash goes negative and the slice inverts into a near-full ring.
    const [, tiny] = donutSegments([1000, 1], { radius: RADIUS })
    expect(tiny.dash).toBeGreaterThan(0)
  })

  it('returns nothing rather than dividing by zero on an empty total', () => {
    expect(donutSegments([0, 0], { radius: RADIUS })).toEqual([])
  })

  it('leaves the hole the redline states', () => {
    // "the hole is 2 × (r − stroke/2) = 81px"
    expect(donutHole(RADIUS, STROKE)).toBe(81)
  })
})

describe('axis helpers', () => {
  it('rounds the axis up to a number a label can sit on', () => {
    expect(axisMax([18, 25, 12, 32, 21, 14])).toBe(50)
    expect(axisMax(MONTHS)).toBe(100)
    expect(axisMax([0, 0])).toBe(1)
  })

  it('labels every third period, always including the ends', () => {
    // Redline "Axis labels · label every 3rd period at most".
    expect([...axisTicks(12)].sort((a, b) => a - b)).toEqual([0, 3, 6, 9, 11])
  })

  it('spaces points evenly and inverts y for SVG', () => {
    const points = plot([0, 50, 100], { width: 100, height: 100, max: 100 })
    expect(points.map((p) => p.x)).toEqual([0, 50, 100])
    expect(points.map((p) => p.y)).toEqual([100, 50, 0])
  })
})
