import { Link, useLocation } from 'react-router-dom'
import {
  SideNav,
  SideNavBody,
  SideNavFooter,
  SideNavLink,
  SideNavLevel,
  SideNavSection,
  Counter,
} from '@razorpay/blade/components'
import { NAV_SECTIONS, FOOTER_NAV_ITEM } from './navItems'
import type { L1NavItem, L2NavItem } from './navItems'
import { isNavItemActive } from './utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getChildHrefs = (children: L2NavItem[] | undefined): string[] => {
  if (!children) return []
  return children.map((child) => child.href)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const L2NavLinkItem = ({
  item,
  currentPathname,
}: {
  item: L2NavItem
  currentPathname: string
}) => {
  const hasBadge = item.badgeCount !== undefined

  return (
    <SideNavLink
      as={Link}
      title={item.title}
      href={item.href}
      isActive={isNavItemActive(currentPathname, item.href)}
      titleSuffix={
        hasBadge ? (
          <Counter value={item.badgeCount!} max={item.badgeMax} color="neutral" />
        ) : undefined
      }
    />
  )
}

const L1NavLinkItem = ({
  item,
  currentPathname,
}: {
  item: L1NavItem
  currentPathname: string
}) => {
  const childHrefs = getChildHrefs(item.children)
  const active = isNavItemActive(currentPathname, item.href, childHrefs)

  if (!item.children || item.children.length === 0) {
    return (
      <SideNavLink
        as={Link}
        title={item.title}
        href={item.href}
        icon={item.icon}
        isActive={active}
      />
    )
  }

  // Point parent to first child's href — Blade pattern:
  // clicking the L1 trigger navigates to the first sub-item,
  // which sets isActive=true and reveals the L2 panel.
  const firstChildHref = item.children[0].href

  return (
    <SideNavLink
      as={Link}
      title={item.title}
      href={firstChildHref}
      icon={item.icon}
      isActive={active}
    >
      <SideNavLevel>
        {item.children.map((child) => (
          <L2NavLinkItem key={child.href} item={child} currentPathname={currentPathname} />
        ))}
      </SideNavLevel>
    </SideNavLink>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const SideNavComponent = () => {
  const location = useLocation()
  const currentPathname = location.pathname

  return (
    <SideNav position="absolute">
      <SideNavBody>
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <SideNavSection key={sectionIndex} title={section.title}>
            {section.items.map((item) => (
              <L1NavLinkItem key={item.href} item={item} currentPathname={currentPathname} />
            ))}
          </SideNavSection>
        ))}
      </SideNavBody>

      <SideNavFooter>
        <L1NavLinkItem
          item={FOOTER_NAV_ITEM}
          currentPathname={currentPathname}
        />
      </SideNavFooter>
    </SideNav>
  )
}
