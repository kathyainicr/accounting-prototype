import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BladeProvider, ToastContainer } from '@razorpay/blade/components'
import { bladeTheme } from '@razorpay/blade/tokens'
import { ThemeContext } from './context/ThemeContext'
import { AccountingProvider } from './context/AccountingContext'
import { MappingProvider } from './context/MappingContext'
import { DashboardLayout } from './layouts/DashboardLayout'
import HomePage from './pages/Home/HomePage'
import BillsPage from './pages/Accounting/Bills/BillsPage'

import VendorPage from './pages/Accounting/Vendor/VendorPage'
import ItemsPage from './pages/Accounting/Items/ItemsPage'
import MappingPage from './pages/Mapping/MappingPage'

const App = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark')

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      <BladeProvider themeTokens={bladeTheme} colorScheme={colorScheme}>
        <ToastContainer />
        <AccountingProvider>
          <MappingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="v1/accounting/bills" element={<BillsPage />} />

                <Route path="v1/accounting/vendor" element={<VendorPage />} />
                <Route path="v1/accounting/items" element={<ItemsPage />} />
                <Route path="*" element={<HomePage />} />
              </Route>
              <Route path="v2/accounting/map" element={<MappingPage />} />
              <Route path="v2/accounting/map/:step" element={<MappingPage />} />
            </Routes>
          </BrowserRouter>
          </MappingProvider>
        </AccountingProvider>
      </BladeProvider>
    </ThemeContext.Provider>
  )
}

export default App
