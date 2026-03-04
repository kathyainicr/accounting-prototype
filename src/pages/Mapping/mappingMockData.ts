import { MOCK_VENDORS, MOCK_LEDGER_OPTIONS } from '../Accounting/Vendor/vendorMockData'
import { MOCK_ITEMS, PURCHASE_LEDGER_OPTIONS } from '../Accounting/Items/itemsMockData'
import type { MappingVendor, MappingItem, MappingCostCenter, ConfidenceTier } from './types'

export { MOCK_LEDGER_OPTIONS, PURCHASE_LEDGER_OPTIONS }

export const MAPPING_VENDORS: MappingVendor[] = MOCK_VENDORS
  .filter((v) => v.status === 'categorise')
  .map((v) => ({
    id: v.id,
    name: v.name,
    gstin: v.gstin,
    confidence: (v.confidence ?? 'none') as ConfidenceTier,
    confidenceScore: v.confidenceScore ?? 0,
    suggestedLedger: v.aiSuggestedLedger ?? '',
    aiReasoning: v.aiReasoning ?? '',
    isNew: v.isNew ?? false,
  }))

export const MAPPING_ITEMS: MappingItem[] = MOCK_ITEMS
  .filter((i) => i.status === 'categorise')
  .map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    hsnSac: i.hsnSac,
    confidence: (i.confidence ?? 'none') as ConfidenceTier,
    confidenceScore: i.confidenceScore ?? 0,
    suggestedPurchaseLedger: i.aiSuggestedPurchaseLedger ?? '',
    suggestedItemLedger: i.aiSuggestedItemLedger ?? '',
    aiReasoning: i.aiReasoning ?? '',
    isNew: i.isNew ?? false,
  }))

export const MAPPING_COST_CENTERS: MappingCostCenter[] = [
  {
    id: 'cc_001',
    rxName: 'Marketing',
    confidence: 'high',
    confidenceScore: 96,
    suggestedTallyCC: 'Marketing Department',
    aiReasoning: 'Exact name match found in Tally cost center list',
    isNew: false,
  },
  {
    id: 'cc_002',
    rxName: 'Indore',
    confidence: 'high',
    confidenceScore: 92,
    suggestedTallyCC: 'Indore Branch',
    aiReasoning: 'Location-based cost center matched to Indore Branch in Tally',
    isNew: false,
  },
  {
    id: 'cc_003',
    rxName: 'Sales',
    confidence: 'medium',
    confidenceScore: 74,
    suggestedTallyCC: 'Sales Division',
    aiReasoning: 'Partial match; Sales is a common cost center name',
    isNew: false,
  },
  {
    id: 'cc_004',
    rxName: 'Operations',
    confidence: 'medium',
    confidenceScore: 67,
    suggestedTallyCC: 'Operations Dept',
    aiReasoning: 'Name similarity found but Tally has multiple matching entries',
    isNew: true,
  },
  {
    id: 'cc_005',
    rxName: 'Finance',
    confidence: 'none',
    confidenceScore: 0,
    suggestedTallyCC: '',
    aiReasoning: '',
    isNew: false,
  },
]

type Buckets<T> = { high: T[]; medium: T[]; unmatched: T[] }

const bucket = <T extends { confidence: ConfidenceTier }>(items: T[]): Buckets<T> => ({
  high: items.filter((i) => i.confidence === 'high'),
  medium: items.filter((i) => i.confidence === 'medium'),
  unmatched: items.filter((i) => i.confidence === 'none'),
})

export const getVendorBuckets = (): Buckets<MappingVendor> => bucket(MAPPING_VENDORS)
export const getItemBuckets = (): Buckets<MappingItem> => bucket(MAPPING_ITEMS)
export const getCostCenterBuckets = (): Buckets<MappingCostCenter> => bucket(MAPPING_COST_CENTERS)

export const getNewVendorCount = (): number => MAPPING_VENDORS.filter((v) => v.isNew).length
export const getNewItemCount = (): number => MAPPING_ITEMS.filter((i) => i.isNew).length
export const getNewCostCenterCount = (): number => MAPPING_COST_CENTERS.filter((c) => c.isNew).length
