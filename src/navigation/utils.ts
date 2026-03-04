import { matchPath } from 'react-router-dom'
import { NAV_SECTIONS, FOOTER_NAV_ITEM } from './navItems'

/**
 * Returns true if the given href (or any of the childHrefs) matches
 * the current route pathname.
 *
 * Uses end=false so /accounting stays active when user is at /accounting/bills.
 */
export const isNavItemActive = (
  currentPathname: string,
  href: string,
  childHrefs: string[] = [],
): boolean => {
  const isPrimaryMatch = Boolean(matchPath({ path: href, end: false }, currentPathname))

  const isChildMatch = childHrefs.some((childHref) =>
    Boolean(matchPath({ path: childHref, end: false }, currentPathname)),
  )

  return isPrimaryMatch || isChildMatch
}

/**
 * Returns the display title for the current route by looking up NAV_SECTIONS
 * and FOOTER_NAV_ITEM. L2 items take priority over L1 items (deepest match wins).
 */
export const getPageTitle = (pathname: string): string => {
  // 1. L2 items — most specific match
  for (const section of NAV_SECTIONS) {
    for (const l1 of section.items) {
      for (const l2 of l1.children ?? []) {
        if (matchPath({ path: l2.href, end: true }, pathname)) return l2.title
      }
    }
  }
  // 2. L1 items
  for (const section of NAV_SECTIONS) {
    for (const l1 of section.items) {
      if (matchPath({ path: l1.href, end: true }, pathname)) return l1.title
    }
  }
  // 3. Footer nav children
  for (const child of FOOTER_NAV_ITEM.children ?? []) {
    if (matchPath({ path: child.href, end: true }, pathname)) return child.title
  }
  // 4. Footer nav L1
  if (matchPath({ path: FOOTER_NAV_ITEM.href, end: false }, pathname)) return FOOTER_NAV_ITEM.title
  return 'Dashboard'
}
