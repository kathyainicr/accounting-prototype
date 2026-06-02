import { Link, useLocation } from 'react-router-dom'
import {
  SideNav,
  SideNavBody,
  SideNavFooter,
  SideNavLink,
  SideNavLevel,
  SideNavSection,
  Counter,
  Box,
  Text,
} from '@razorpay/blade/components'
import { NAV_SECTIONS, FOOTER_NAV_ITEM } from './navItems'
import type { L1NavItem, L2NavItem } from './navItems'
import { isNavItemActive } from './utils'

const getChildHrefs = (children: L2NavItem[] | undefined): string[] => {
  if (!children) return []
  return children.flatMap((child) => {
    if (child.type === 'divider') return []
    return [child.href, ...(child.children?.map((nestedChild) => nestedChild.href) ?? [])].filter(
      Boolean,
    ) as string[]
  })
}

const NavDivider = ({ title }: { title: string }) => (
  <Box paddingTop="spacing.4" paddingBottom="spacing.2" paddingX="spacing.5">
    <Box borderTopWidth="thin" borderStyle="solid" borderColor="surface.border.gray.muted" paddingTop="spacing.3">
      <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
        {title}
      </Text>
    </Box>
  </Box>
)

const NestedNavLinkItem = ({
  item,
  currentPathname,
}: {
  item: L2NavItem
  currentPathname: string
}) => {
  if (item.type === 'divider') {
    return <NavDivider title={item.title} />
  }

  const hasBadge = item.badgeCount !== undefined

  if (!item.children || item.children.length === 0) {
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

  return (
    <SideNavLink
      as={Link}
      title={item.title}
      href={item.href}
      isActive={isNavItemActive(currentPathname, item.href, getChildHrefs(item.children))}
      titleSuffix={
        hasBadge ? (
          <Counter value={item.badgeCount!} max={item.badgeMax} color="neutral" />
        ) : undefined
      }
    >
      <SideNavLevel>
        {item.children.map((child) => (
          <NestedNavLinkItem key={`${item.title}-${child.title}`} item={child} currentPathname={currentPathname} />
        ))}
      </SideNavLevel>
    </SideNavLink>
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
          <NestedNavLinkItem key={`${item.title}-${child.title}`} item={child} currentPathname={currentPathname} />
        ))}
      </SideNavLevel>
    </SideNavLink>
  )
}

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
