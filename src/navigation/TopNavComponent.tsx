import { Link, useLocation } from 'react-router-dom'
import {
  TopNav,
  TopNavBrand,
  TopNavContent,
  TopNavActions,
  TabNav,
  TabNavItems,
  TabNavItem,
  SearchInput,
  Avatar,
  Menu,
  MenuOverlay,
  MenuItem,
  MenuHeader,
  Box,
  Text,
  ChevronDownIcon,
  RazorpayXIcon,
  RazorpayxPayrollIcon,
  AcceptPaymentsIcon,
  BusinessBankingIcon,
} from '@razorpay/blade/components'
import type { IconComponent } from '@razorpay/blade/components'
import { isNavItemActive } from './utils'

type TabItem = {
  title: string
  href: string
  icon: IconComponent
  isAlwaysOverflowing?: boolean
}

const TAB_ITEMS: TabItem[] = [
  { title: 'Banking', href: '/home', icon: BusinessBankingIcon },
  { title: 'Payments', href: '/payments', icon: AcceptPaymentsIcon, isAlwaysOverflowing: true },
  { title: 'Payroll', href: '/payroll-product', icon: RazorpayxPayrollIcon, isAlwaysOverflowing: true },
]

export const TopNavComponent = () => {
  const location = useLocation()
  const currentPathname = location.pathname

  return (
    <TopNav>
      <TopNavBrand>
        <Box display="flex" alignItems="center" gap="spacing.2">
          <RazorpayXIcon size="large" color="interactive.icon.neutral.normal" />
        </Box>
      </TopNavBrand>

      <TopNavContent>
        <TabNav items={TAB_ITEMS}>
          {({ items, overflowingItems }) => (
            <>
              <TabNavItems>
                {items.map((item) => (
                  <TabNavItem
                    key={item.href}
                    as={Link}
                    href={item.href}
                    title={item.title}
                    icon={item.icon}
                    isActive={item.href !== undefined && isNavItemActive(currentPathname, item.href)}
                  />
                ))}
              </TabNavItems>

              {overflowingItems.length > 0 && (
                <Menu openInteraction="hover">
                  <TabNavItem
                    title="More"
                    trailing={<ChevronDownIcon />}
                    isActive={overflowingItems.some((item) =>
                      item.href !== undefined && isNavItemActive(currentPathname, item.href),
                    )}
                    accessibilityLabel="More navigation options"
                  />
                  <MenuOverlay>
                    <MenuHeader title="More products" />
                    {overflowingItems.map((item) => (
                      <MenuItem key={item.href}>
                        {item.href !== undefined ? (
                          <Link to={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Text>{item.title}</Text>
                          </Link>
                        ) : (
                          <Text>{item.title}</Text>
                        )}
                      </MenuItem>
                    ))}
                  </MenuOverlay>
                </Menu>
              )}
            </>
          )}
        </TabNav>
      </TopNavContent>

      <TopNavActions>
        <SearchInput placeholder="Search" accessibilityLabel="Search RazorpayX" />
        <Menu openInteraction="click">
          <Avatar name="Acme Corp" size="medium" />
          <MenuOverlay>
            <MenuHeader title="Acme Corp" />
            <MenuItem>
              <Text>Profile</Text>
            </MenuItem>
            <MenuItem>
              <Text color="feedback.text.negative.intense">Logout</Text>
            </MenuItem>
          </MenuOverlay>
        </Menu>
      </TopNavActions>
    </TopNav>
  )
}
