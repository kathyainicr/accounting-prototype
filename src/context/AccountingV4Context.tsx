import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { V4EntityKey, V4MappingRow, V4Rule, V4Settings } from '../pages/AccountingV4/types'
import { INITIAL_ENTITY_MAPPINGS, INITIAL_RULES, INITIAL_SETTINGS } from '../pages/AccountingV4/data'

// ─── Context shape ────────────────────────────────────────────────────────────

type EntityCounts = { total: number; mapped: number; unmapped: number; rayMapped: number }

type AccountingV4ContextType = {
  // Entity mapping state
  entityMappings: Record<V4EntityKey, V4MappingRow[]>
  savedMappings: Record<V4EntityKey, V4MappingRow[]>
  updateEntityMapping: (key: V4EntityKey, rowId: string, updater: (row: V4MappingRow) => V4MappingRow) => void
  saveEntityMappings: (key: V4EntityKey) => void
  discardEntityMappings: (key: V4EntityKey) => void
  getEntityCounts: (key: V4EntityKey) => EntityCounts

  // Rules
  rules: V4Rule[]
  addRule: (rule: Omit<V4Rule, 'id' | 'createdAt'>) => void
  toggleRule: (id: string) => void
  deleteRule: (id: string) => void

  // Settings
  settings: V4Settings
  updateSettings: (patch: Partial<V4Settings>) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AccountingV4Context = createContext<AccountingV4ContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AccountingV4Provider = ({ children }: { children: ReactNode }) => {
  // In-flight edits (per entity, uncommitted)
  const [entityMappings, setEntityMappings] = useState<Record<V4EntityKey, V4MappingRow[]>>(
    INITIAL_ENTITY_MAPPINGS,
  )

  // Committed (post-Save) mappings — start identical to initial
  const [savedMappings, setSavedMappings] = useState<Record<V4EntityKey, V4MappingRow[]>>(
    INITIAL_ENTITY_MAPPINGS,
  )

  const [rules, setRules] = useState<V4Rule[]>(INITIAL_RULES)
  const [settings, setSettings] = useState<V4Settings>(INITIAL_SETTINGS)

  // ── Entity mapping actions ──────────────────────────────────────────────────

  const updateEntityMapping = (
    key: V4EntityKey,
    rowId: string,
    updater: (row: V4MappingRow) => V4MappingRow,
  ) => {
    setEntityMappings((prev) => ({
      ...prev,
      [key]: prev[key].map((row) => (row.id === rowId ? updater(row) : row)),
    }))
  }

  const saveEntityMappings = (key: V4EntityKey) => {
    // On save, finalise mappingState: any row with a targetLabel becomes 'edited'
    const finalised = entityMappings[key].map((row) =>
      row.targetLabel ? { ...row, mappingState: 'edited' as const } : row,
    )
    setEntityMappings((prev) => ({ ...prev, [key]: finalised }))
    setSavedMappings((prev) => ({ ...prev, [key]: finalised }))
  }

  const discardEntityMappings = (key: V4EntityKey) => {
    setEntityMappings((prev) => ({
      ...prev,
      [key]: savedMappings[key],
    }))
  }

  const getEntityCounts = (key: V4EntityKey): EntityCounts => {
    const rows = savedMappings[key]
    const mapped = rows.filter((r) => r.targetLabel !== '').length
    const rayMapped = rows.filter((r) => r.mappingState === 'ray').length
    return {
      total: rows.length,
      mapped,
      unmapped: rows.length - mapped,
      rayMapped,
    }
  }

  // ── Rule actions ────────────────────────────────────────────────────────────

  const addRule = (rule: Omit<V4Rule, 'id' | 'createdAt'>) => {
    const newRule: V4Rule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setRules((prev) => [...prev, newRule])
  }

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)))
  }

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  // ── Settings actions ────────────────────────────────────────────────────────

  const updateSettings = (patch: Partial<V4Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  return (
    <AccountingV4Context.Provider
      value={{
        entityMappings,
        savedMappings,
        updateEntityMapping,
        saveEntityMappings,
        discardEntityMappings,
        getEntityCounts,
        rules,
        addRule,
        toggleRule,
        deleteRule,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AccountingV4Context.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAccountingV4 = () => {
  const ctx = useContext(AccountingV4Context)
  if (!ctx) throw new Error('useAccountingV4 must be used within AccountingV4Provider')
  return ctx
}
