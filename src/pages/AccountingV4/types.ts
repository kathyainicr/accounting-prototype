export type V4EntityKey = 'items' | 'vendors' | 'costCenters' | 'gst' | 'tds'

export type V4MappingState = 'ray' | 'edited' | 'missing'

export type V4MappingRow = {
  id: string
  sourceLabel: string
  targetLabel: string
  secondaryTargetLabel?: string
  trackInventory?: boolean
  mappingState: V4MappingState
  explanation?: string
}

// Three forms of smart rules
export type V4RuleType = 'compound' | 'purpose-only' | 'contact-only'

export type V4Rule = {
  id: string
  type: V4RuleType
  payoutPurpose?: string   // required for 'compound' and 'purpose-only'
  contactType?: string     // required for 'compound' and 'contact-only'
  ledger: string
  isActive: boolean
  createdBy: 'ray' | 'manual'
  createdAt: string
}

export type V4Settings = {
  enabledEntities: Record<V4EntityKey, boolean>
}

export type V4EntityConfig = {
  key: V4EntityKey
  label: string
  description: string
  icon: string
  targetOptions: string[]
  secondaryTargetOptions?: string[]
  supportsInventory?: boolean
  sourceColumnLabel: string
  targetColumnLabel: string
  secondaryTargetColumnLabel?: string
}
