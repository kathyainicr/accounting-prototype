import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BladeProvider, ToastContainer } from '@razorpay/blade/components'
import { bladeTheme } from '@razorpay/blade/tokens'
import { ThemeContext } from './context/ThemeContext'
import { AccountingProvider } from './context/AccountingContext'
import { AccountingV3Provider } from './context/AccountingV3Context'
import { AccountingV4Provider } from './context/AccountingV4Context'
import { MappingProvider } from './context/MappingContext'
import { DashboardLayout } from './layouts/DashboardLayout'
import HomePage from './pages/Home/HomePage'
import BillsPage from './pages/Accounting/Bills/BillsPage'

import VendorPage from './pages/Accounting/Vendor/VendorPage'
import ItemsPage from './pages/Accounting/Items/ItemsPage'
import MappingPage from './pages/Mapping/MappingPage'
import AccountingOverviewPage from './pages/AccountingV3/AccountingOverviewPage'
import AccountingModulePage from './pages/AccountingV3/AccountingModulePage'
import AccountingV4OverviewPage from './pages/AccountingV4/AccountingV4OverviewPage'
import AccountingV4ModulePage from './pages/AccountingV4/AccountingV4ModulePage'
import AccountingV4MappingsPage from './pages/AccountingV4/AccountingV4MappingsPage'
import AccountingV4RulesPage from './pages/AccountingV4/AccountingV4RulesPage'
import AccountingV4SettingsPage from './pages/AccountingV4/AccountingV4SettingsPage'

const App = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark')

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
        <BladeProvider themeTokens={bladeTheme} colorScheme={colorScheme}>
          <ToastContainer />
          <AccountingProvider>
            <AccountingV3Provider>
              <AccountingV4Provider>
                <MappingProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="home" element={<HomePage />} />
                        <Route path="v1/accounting/bills" element={<BillsPage />} />
                        <Route path="v1/accounting/vendor" element={<VendorPage />} />
                        <Route path="v1/accounting/items" element={<ItemsPage />} />

                        <Route path="v3/accounting" element={<Navigate to="/v3/accounting/overview" replace />} />
                        <Route path="v3/accounting/overview" element={<AccountingOverviewPage />} />
                        <Route path="v3/accounting/items" element={<AccountingModulePage moduleKey="items" />} />
                        <Route path="v3/accounting/vendors" element={<AccountingModulePage moduleKey="vendors" />} />
                        <Route path="v3/accounting/bills" element={<AccountingModulePage moduleKey="bills" />} />
                        <Route path="v3/accounting/expenses" element={<AccountingModulePage moduleKey="expenses" />} />
                        <Route path="v3/accounting/advances" element={<AccountingModulePage moduleKey="advances" />} />
                        <Route path="v3/accounting/more/cost-centers" element={<AccountingModulePage moduleKey="costCenters" />} />
                        <Route path="v3/accounting/more/gst" element={<AccountingModulePage moduleKey="gst" />} />
                        <Route path="v3/accounting/more/tds" element={<AccountingModulePage moduleKey="tds" />} />

                        <Route path="v4/accounting" element={<Navigate to="/v4/accounting/overview" replace />} />
                        <Route path="v4/accounting/overview" element={<AccountingV4OverviewPage />} />
                        <Route path="v4/accounting/bills" element={<AccountingV4ModulePage moduleKey="bills" />} />
                        <Route path="v4/accounting/expenses" element={<AccountingV4ModulePage moduleKey="expenses" />} />
                        <Route path="v4/accounting/advances" element={<AccountingV4ModulePage moduleKey="advances" />} />
                        <Route path="v4/accounting/mappings" element={<AccountingV4MappingsPage />} />
                        <Route path="v4/accounting/rules" element={<AccountingV4RulesPage />} />
                        <Route path="v4/accounting/settings" element={<AccountingV4SettingsPage />} />

                        <Route path="*" element={<HomePage />} />
                      </Route>
                      <Route path="v2/accounting/map" element={<MappingPage />} />
                      <Route path="v2/accounting/map/:step" element={<MappingPage />} />
                    </Routes>
                  </BrowserRouter>
                </MappingProvider>
              </AccountingV4Provider>
            </AccountingV3Provider>
        </AccountingProvider>
      </BladeProvider>
    </ThemeContext.Provider>
  )
}

export default App
