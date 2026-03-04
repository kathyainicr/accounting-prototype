/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { MOCK_VENDORS } from '../pages/Accounting/Vendor/vendorMockData'
import { buildInitialItemCategories } from '../pages/Accounting/Items/itemsMockData'
import type { ItemCategory } from '../pages/Accounting/Items/itemsMockData'

type AccountingContextValue = {
  vendorLedgers: Record<string, string>
  setVendorLedger: (vendorId: string, ledger: string) => void

  pendingVendorLedgers: Record<string, string>
  setPendingVendorLedger: (vendorId: string, ledger: string) => void

  pendingVendorSyncs: Set<string>
  addPendingVendorSync: (vendorId: string) => void

  costCenters: Record<string, string>
  setCostCenter: (billId: string, costCenter: string) => void

  itemCategories: Record<string, ItemCategory>
  setItemCategory: (itemId: string, data: ItemCategory) => void

  pendingItemPurchaseLedgers: Record<string, string>
  setPendingItemPurchaseLedger: (itemId: string, ledger: string) => void

  pendingItemSyncs: Set<string>
  addPendingItemSync: (itemId: string) => void
}

const AccountingContext = createContext<AccountingContextValue>({} as AccountingContextValue)

export const useAccountingContext = () => useContext(AccountingContext)

const buildInitialVendorLedgers = (): Record<string, string> => {
  const initial: Record<string, string> = {}
  MOCK_VENDORS.forEach((v) => {
    if (v.status === 'synced' && v.vendorLedger) {
      initial[v.id] = v.vendorLedger
    }
  })
  return initial
}

export const AccountingProvider = ({ children }: { children: React.ReactNode }) => {
  const [vendorLedgers, setVendorLedgersState] = useState<Record<string, string>>(
    buildInitialVendorLedgers,
  )
  const [pendingVendorLedgers, setPendingVendorLedgersState] = useState<Record<string, string>>({})
  const [pendingVendorSyncs, setPendingVendorSyncsState] = useState<Set<string>>(new Set())
  const [costCenters, setCostCentersState] = useState<Record<string, string>>({})
  const [itemCategories, setItemCategoriesState] = useState<Record<string, ItemCategory>>(
    buildInitialItemCategories,
  )
  const [pendingItemPurchaseLedgers, setPendingItemPurchaseLedgersState] = useState<Record<string, string>>({})
  const [pendingItemSyncs, setPendingItemSyncsState] = useState<Set<string>>(new Set())

  const setVendorLedger = (vendorId: string, ledger: string) => {
    setVendorLedgersState((prev) => ({ ...prev, [vendorId]: ledger }))
  }

  const setPendingVendorLedger = (vendorId: string, ledger: string) => {
    setPendingVendorLedgersState((prev) => ({ ...prev, [vendorId]: ledger }))
  }

  const addPendingVendorSync = (vendorId: string) => {
    setPendingVendorSyncsState((prev) => new Set([...prev, vendorId]))
  }

  const setCostCenter = (billId: string, costCenter: string) => {
    setCostCentersState((prev) => ({ ...prev, [billId]: costCenter }))
  }

  const setItemCategory = (itemId: string, data: ItemCategory) => {
    setItemCategoriesState((prev) => ({ ...prev, [itemId]: data }))
  }

  const setPendingItemPurchaseLedger = (itemId: string, ledger: string) => {
    setPendingItemPurchaseLedgersState((prev) => ({ ...prev, [itemId]: ledger }))
  }

  const addPendingItemSync = (itemId: string) => {
    setPendingItemSyncsState((prev) => new Set([...prev, itemId]))
  }

  return (
    <AccountingContext.Provider
      value={{
        vendorLedgers, setVendorLedger,
        pendingVendorLedgers, setPendingVendorLedger,
        pendingVendorSyncs, addPendingVendorSync,
        costCenters, setCostCenter,
        itemCategories, setItemCategory,
        pendingItemPurchaseLedgers, setPendingItemPurchaseLedger,
        pendingItemSyncs, addPendingItemSync,
      }}
    >
      {children}
    </AccountingContext.Provider>
  )
}
