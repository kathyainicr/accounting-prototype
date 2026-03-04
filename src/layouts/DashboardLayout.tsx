import { Outlet } from 'react-router-dom'
import {
  Box,
  SIDE_NAV_EXPANDED_L1_WIDTH_BASE,
  SIDE_NAV_EXPANDED_L1_WIDTH_XL,
} from '@razorpay/blade/components'
import { SideNavComponent } from '../navigation/SideNavComponent'
import { PageHeader } from '../components/PageHeader/PageHeader'
import { FlowSwitcher } from '../components/FlowSwitcher/FlowSwitcher'

export const DashboardLayout = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      height="100vh"
      position="relative"
      overflow="hidden"
      backgroundColor="surface.background.gray.moderate"
    >
      <SideNavComponent />

      <Box
        as="main"
        flex="1"
        overflowY="auto"
        marginLeft={{
          base: '0px',
          m: `${SIDE_NAV_EXPANDED_L1_WIDTH_BASE}px`,
          xl: `${SIDE_NAV_EXPANDED_L1_WIDTH_XL}px`,
        }}
        padding="spacing.7"
        backgroundColor="surface.background.gray.moderate"
      >
        <PageHeader />
        <Outlet />
      </Box>

      <FlowSwitcher />
    </Box>
  )
}
