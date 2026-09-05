/**
 * The application's navigation, in one place.
 *
 * The sidebar renders it, the router guard reads it, and the header derives its
 * breadcrumb from it — so a new page is added here once rather than in three
 * files that can disagree.
 *
 * `key` is what AppSidebar marks active; `to` is the route it pushes.
 *
 * `mark` is the rail's decorative glyph. The redline assigns them by meaning —
 * "square PTC, circle LTO, diamond config" — so a page outside those three
 * picks the one that reads least like something else: a 13px rounded square
 * beside a label is easily mistaken for a checkbox.
 */
export const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { key: 'dashboard', label: 'Dashboard', to: '/dashboard', mark: 'circle' },
      { key: 'second', label: 'Second page', to: '/second-page', mark: 'diamond' },
    ],
  },
]

/** Every nav item, flattened — for lookups by key or by path. */
export const NAV_ITEMS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
)

export const navItemForPath = (path) =>
  NAV_ITEMS.find((item) => path === item.to || path.startsWith(`${item.to}/`)) ?? null

export const BRAND = { mark: 'DH', name: 'DOH', org: 'Licensing' }
