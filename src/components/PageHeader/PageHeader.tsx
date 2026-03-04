import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Heading,
  Text,
  SearchInput,
  Menu,
  MenuOverlay,
  MenuItem,
  MenuDivider,
  Button,
  Switch,
  Avatar,
  ChevronDownIcon,
  ArrowUpRightIcon,
  BulkPayoutsIcon,
  InvoicesIcon,
  UserPlusIcon,
  UsersIcon,
  SunIcon,
} from '@razorpay/blade/components'
import { getPageTitle } from '../../navigation/utils'
import { useThemeContext } from '../../context/ThemeContext'

export const PageHeader = () => {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)
  const { colorScheme, setColorScheme } = useThemeContext()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const isLightTheme = colorScheme === 'light'

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      paddingBottom="spacing.6"
    >
      {/* Dynamic page title */}
      <Heading as="h1" size="large" color="surface.text.gray.normal" weight="semibold">
        {pageTitle}
      </Heading>

      {/* Right-side actions */}
      <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4">
        <SearchInput placeholder="Search..." accessibilityLabel="Search" />

        {/* Create New dropdown */}
        <Menu openInteraction="click">
          <Button variant="secondary" icon={ChevronDownIcon} iconPosition="right">
            Create New
          </Button>
          <MenuOverlay minWidth="220px">
            <MenuItem leading={<ArrowUpRightIcon size="small" />} title="Payout" onClick={() => {}} />
            <MenuItem leading={<BulkPayoutsIcon size="small" />} title="Bulk Payout" onClick={() => {}} />
            <MenuItem leading={<InvoicesIcon size="small" />} title="Upload Invoice" onClick={() => {}} />
            <MenuItem leading={<UserPlusIcon size="small" />} title="Add Contact" onClick={() => {}} />
            <MenuItem leading={<UsersIcon size="small" />} title="Team Member" onClick={() => {}} />
          </MenuOverlay>
        </Menu>

        {/* Avatar → opens profile / settings menu (controlled) */}
        <Menu
          isOpen={isProfileMenuOpen}
          onOpenChange={({ isOpen }) => setIsProfileMenuOpen(isOpen)}
        >
          <Avatar
            name="Anay Rajguru"
            variant="square"
            size="medium"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          />

          <MenuOverlay minWidth="220px">
            {/* Light Theme toggle — custom row with Switch on the right */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              paddingX="spacing.4"
              paddingY="spacing.3"
            >
              <Box display="flex" alignItems="center" gap="spacing.3">
                <SunIcon size="small" color="surface.icon.gray.normal" />
                <Text size="medium" color="surface.text.gray.normal">
                  Light Theme
                </Text>
              </Box>
              <Switch
                accessibilityLabel="Toggle light theme"
                isChecked={isLightTheme}
                onChange={({ isChecked }) => setColorScheme(isChecked ? 'light' : 'dark')}
                size="small"
              />
            </Box>

            <MenuDivider />

            <MenuItem title="Log Out" color="negative" onClick={() => {}} />
          </MenuOverlay>
        </Menu>
      </Box>
    </Box>
  )
}
