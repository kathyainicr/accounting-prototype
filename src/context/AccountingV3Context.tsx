/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { getModuleCounts, INITIAL_MODULE_ROWS, REVIEW_ORDER } from '../pages/AccountingV3/data'
import type { V3ModuleCounts, V3ModuleKey, V3ReviewRow } from '../pages/AccountingV3/types'

type AccountingV3ContextValue = {
  moduleRows: Record<V3ModuleKey, V3ReviewRow[]>
  updateRow: (moduleKey: V3ModuleKey, rowId: string, updater: (row: V3ReviewRow) => V3ReviewRow) => void
  updateRows: (moduleKey: V3ModuleKey, rowIds: string[], updater: (row: V3ReviewRow) => V3ReviewRow) => void
  approveRow: (moduleKey: V3ModuleKey, rowId: string) => void
  excludeRow: (moduleKey: V3ModuleKey, rowId: string) => void
  syncModule: (moduleKey: V3ModuleKey) => void
  syncAll: () => void
  getCounts: (moduleKey: V3ModuleKey) => V3ModuleCounts
  getOverviewTotals: () => V3ModuleCounts
  getNextReviewModule: () => V3ModuleKey
}

const AccountingV3Context = createContext<AccountingV3ContextValue | null>(null)

const moveReadyRowsToSynced = (rows: V3ReviewRow[]): V3ReviewRow[] =>
  rows.map((row) => (row.status === 'ready_for_sync' ? { ...row, status: 'synced' } : row))

export const AccountingV3Provider = ({ children }: { children: React.ReactNode }) => {
  const [moduleRows, setModuleRows] = useState<Record<V3ModuleKey, V3ReviewRow[]>>(INITIAL_MODULE_ROWS)

  const updateRow = (
    moduleKey: V3ModuleKey,
    rowId: string,
    updater: (row: V3ReviewRow) => V3ReviewRow,
  ) => {
    setModuleRows((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].map((row) => (row.id === rowId ? updater(row) : row)),
    }))
  }

  const updateRows = (
    moduleKey: V3ModuleKey,
    rowIds: string[],
    updater: (row: V3ReviewRow) => V3ReviewRow,
  ) => {
    const rowIdSet = new Set(rowIds)

    setModuleRows((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].map((row) => (rowIdSet.has(row.id) ? updater(row) : row)),
    }))
  }

  const approveRow = (moduleKey: V3ModuleKey, rowId: string) => {
    updateRow(moduleKey, rowId, (row) => ({
      ...row,
      status: 'ready_for_sync',
      mappingState: row.mappingState === 'missing' ? 'edited' : row.mappingState,
    }))
  }

  const excludeRow = (moduleKey: V3ModuleKey, rowId: string) => {
    updateRow(moduleKey, rowId, (row) => ({ ...row, status: 'excluded' }))
  }

  const syncModule = (moduleKey: V3ModuleKey) => {
    setModuleRows((prev) => ({
      ...prev,
      [moduleKey]: moveReadyRowsToSynced(prev[moduleKey]),
    }))
  }

  const syncAll = () => {
    setModuleRows((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([moduleKey, rows]) => [moduleKey, moveReadyRowsToSynced(rows)]),
      ) as Record<V3ModuleKey, V3ReviewRow[]>,
    )
  }

  const value: AccountingV3ContextValue = {
    moduleRows,
    updateRow,
    updateRows,
    approveRow,
    excludeRow,
    syncModule,
    syncAll,
    getCounts: (moduleKey) => getModuleCounts(moduleRows[moduleKey]),
    getOverviewTotals: () => {
      const allRows = Object.values(moduleRows).flat()
      return getModuleCounts(allRows)
    },
    getNextReviewModule: () =>
      REVIEW_ORDER.find((moduleKey) => getModuleCounts(moduleRows[moduleKey]).needs_review > 0) ?? 'bills',
  }

  return <AccountingV3Context.Provider value={value}>{children}</AccountingV3Context.Provider>
}

export const useAccountingV3Context = () => {
  const context = useContext(AccountingV3Context)

  if (!context) {
    throw new Error('useAccountingV3Context must be used within AccountingV3Provider')
  }

  return context
}
