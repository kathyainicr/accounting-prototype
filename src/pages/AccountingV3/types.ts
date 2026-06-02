export type V3ModuleKey =
  | 'items'
  | 'vendors'
  | 'bills'
  | 'expenses'
  | 'advances'
  | 'costCenters'
  | 'gst'
  | 'tds'

export type V3ReviewStatus = 'needs_review' | 'ready_for_sync' | 'synced' | 'excluded'

export type V3MappingState = 'ray' | 'edited' | 'missing'

export type V3ReviewRow = {
  id: string
  status: V3ReviewStatus
  sourceLabel: string
  mappingState: V3MappingState
  targetLabel: string
  secondaryTargetLabel?: string
  accountingDate?: string
  amount?: number
  referenceLabel?: string
  trackInventory?: boolean
  explanation: string
}

export type V3ModuleConfig = {
  key: V3ModuleKey
  label: string
  route: string
  description: string
  sourceColumnLabel: string
  targetColumnLabel: string
  secondaryTargetColumnLabel?: string
  referenceColumnLabel?: string
  supportsInventory?: boolean
}

export type V3ModuleCounts = Record<V3ReviewStatus, number>
