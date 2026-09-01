/**
 * Path maths for the chart family.
 *
 * Kept out of the components because it is the part with right and wrong
 * answers: Appendix C's "Charts" group specifies the curve, the caps and the
 * dash arithmetic exactly, and each rule is there because the obvious
 * alternative is visibly wrong. Pure functions, so they can be tested without
 * a browser.
 */

/**
 * A smooth path through every point, curving through the MIDPOINTS.
 *
 * Redline "Line · smooth cubic through midpoints (never a spline that
 * overshoots)". A Catmull-Rom or cardinal spline is the usual reach here and is
 * wrong for this data: those interpolate through the points themselves and bulge
 * past them between samples, so a month whose value is 88 can be drawn touching
 * 95. This puts BOTH cubic control points on the segment's midpoint X, each at
 * its own end's Y — the curve leaves and arrives horizontally and stays inside
 * the band the two values define, which is what "through midpoints" means here.
 *
 * Byte-for-byte the artifact's own path: geometry.spec.js reproduces the
 * twelve-month line from its published `d` attribute, so a well-meaning change
 * to a "nicer" spline fails rather than quietly redrawing every chart.
 */
export function smoothPath(points) {
  if (points.length === 0) return ''
  const round = (n) => Number(n.toFixed(1))
  let d = `M${round(points[0].x)},${round(points[0].y)}`
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1]
    const to = points[i]
    // both control points share the midpoint X, at their own end's Y: the
    // curve leaves and arrives horizontally, so it eases between samples
    // without ever leaving the band the two values define.
    const midX = round((from.x + to.x) / 2)
    d += ` C${midX},${round(from.y)} ${midX},${round(to.y)} ${round(to.x)},${round(to.y)}`
  }
  return d
}

/** The same path closed down to a baseline, for the area fill. */
export function areaPath(points, baselineY) {
  if (points.length === 0) return ''
  const round = (n) => Number(n.toFixed(1))
  const last = points[points.length - 1]
  return `${smoothPath(points)} L${round(last.x)},${round(baselineY)} L${round(points[0].x)},${round(baselineY)} Z`
}

/**
 * Maps values onto a plot box. Y is inverted because SVG counts downward.
 *
 * `max` is the axis top, not the data max: the redline allows three gridlines,
 * so the axis is a round number the labels can sit on.
 */
export function plot(values, { width, height, max }) {
  const step = values.length > 1 ? width / (values.length - 1) : 0
  return values.map((value, i) => ({
    x: values.length > 1 ? i * step : width / 2,
    y: height - (max === 0 ? 0 : (value / max) * height),
    value,
  }))
}

/** A round axis top with headroom, so the line never touches the panel edge. */
export function axisMax(values) {
  const peak = Math.max(0, ...values)
  if (peak === 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(peak))
  for (const factor of [1, 1.25, 1.5, 2, 2.5, 5, 10]) {
    const candidate = magnitude * factor
    if (candidate >= peak) return candidate
  }
  return magnitude * 10
}

/**
 * Donut arcs as stroke-dasharray segments.
 *
 * Redline "Donut caps · butt, never round: a round cap adds stroke/2 at BOTH
 * ends, so at stroke 11 every slice paints 11px longer than its arc — an
 * 8-of-211 slice reads as 6.9% instead of 3.8% and laps its neighbour. Round
 * caps would require dash = arc − strokeWidth, which floors any slice under
 * ~3.8% at zero."
 *
 * So: butt caps, and the 2px separation is taken OUT of each dash rather than
 * added between them — adding it would push every later slice off its angle and
 * the last one past the top of the circle.
 *
 * @returns one entry per slice: { dash, gap, offset, value, share }
 */
export function donutSegments(values, { radius, gap = 2 }) {
  const circumference = 2 * Math.PI * radius
  const total = values.reduce((sum, v) => sum + v, 0)
  if (total === 0) return []

  let travelled = 0
  return values.map((value) => {
    const arc = (value / total) * circumference
    // never below zero: a slice smaller than the gap keeps a hairline rather
    // than inverting into a dash longer than its arc
    const dash = Math.max(arc - gap, 0.5)
    const segment = {
      dash,
      gap: circumference - dash,
      // negative, because stroke-dashoffset runs backwards along the path
      offset: -travelled,
      value,
      share: value / total,
    }
    travelled += arc
    return segment
  })
}

/** The hole a donut leaves: 2 × (r − stroke/2), per the "Donut centre" row. */
export const donutHole = (radius, stroke) => 2 * (radius - stroke / 2)

/**
 * Which axis labels to draw. Redline "Axis labels · label every 3rd period at
 * most" — the first and last always, then every third from the start.
 */
export function axisTicks(count, every = 3) {
  const keep = new Set([0, count - 1])
  for (let i = 0; i < count; i += every) keep.add(i)
  return keep
}
