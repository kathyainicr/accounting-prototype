import { matchPath } from 'react-router-dom'
import { NAV_SECTIONS, FOOTER_NAV_ITEM } from './navItems'

export const isNavItemActive = (
  currentPathname: string,
  href: string | undefined,
  childHrefs: string[] = [],
): boolean => {
  if (!href) return childHrefs.some((childHref) => Boolean(matchPath({ path: childHref, end: false }, currentPathname)))

  const isPrimaryMatch = Boolean(matchPath({ path: href, end: false }, currentPathname))

  const isChildMatch = childHrefs.some((childHref) =>
    Boolean(matchPath({ path: childHref, end: false }, currentPathname)),
  )

  return isPrimaryMatch || isChildMatch
}

export const getPageTitle = (pathname: string): string => {
  for (const section of NAV_SECTIONS) {
    for (const l1 of section.items) {
      for (const l2 of l1.children ?? []) {
        if (l2.href && matchPath({ path: l2.href, end: true }, pathname)) return l2.title
        for (const l3 of l2.children ?? []) {
          if (l3.href && matchPath({ path: l3.href, end: true }, pathname)) return l3.title
        }
      }
    }
  }
  for (const section of NAV_SECTIONS) {
    for (const l1 of section.items) {
      if (matchPath({ path: l1.href, end: true }, pathname)) return l1.title
    }
  }
  for (const child of FOOTER_NAV_ITEM.children ?? []) {
    if (child.href && matchPath({ path: child.href, end: true }, pathname)) return child.title
  }
  if (matchPath({ path: FOOTER_NAV_ITEM.href, end: false }, pathname)) return FOOTER_NAV_ITEM.title
  return 'Dashboard'
}
