/**
 * Mock data for the Map with AI wizard (Flow 2).
 *
 * Vendor IDs match vendor_009..015 from vendorMockData (status: 'categorise').
 * Item IDs match item_004..007 from itemsMockData (status: 'categorise').
 * Cost center IDs match COST_CENTER_OPTIONS from vendorMockData.
 */

import { MOCK_LEDGER_OPTIONS } from '../Accounting/Vendor/vendorMockData'
import { PURCHASE_LEDGER_OPTIONS } from '../Accounting/Items/itemsMockData'
import type { MappingVendor, MappingItem, MappingCostCenter, ConfidenceTier } from './types'

export { MOCK_LEDGER_OPTIONS, PURCHASE_LEDGER_OPTIONS }

// ─── Vendors (vendor_009..015) ────────────────────────────────────────────────
// Distribution: 3 high, 2 medium, 2 unmatched | 2 flagged isNew

export const MAPPING_VENDORS: MappingVendor[] = [
  {
    id: 'vendor_009',
    name: 'Alpha Resources',
    gstin: '29AAACA1234F1Z5',
    confidence: 'high',
    confidenceScore: 94,
    suggestedLedger: 'Raw Materials A/C',
    aiReasoning: 'Strong GSTIN match and historical transaction pattern',
    isNew: false,
  },
  {
    id: 'vendor_010',
    name: 'Pinnacle Services',
    gstin: null,
    confidence: 'medium',
    confidenceScore: 68,
    suggestedLedger: 'Sundry Creditors',
    aiReasoning: 'Partial name similarity; no GSTIN available for verification',
    isNew: false,
  },
  {
    id: 'vendor_011',
    name: 'Delta Logistics',
    gstin: '06AAADL2222B1ZP',
    confidence: 'high',
    confidenceScore: 97,
    suggestedLedger: 'Office Supplies A/C',
    aiReasoning: 'Exact GSTIN match found in Tally ledger history',
    isNew: false,
  },
  {
    id: 'vendor_012',
    name: 'Omega Consulting',
    gstin: null,
    confidence: 'none',
    confidenceScore: 0,
    suggestedLedger: '',
    aiReasoning: '',
    isNew: false,
  },
  {
    id: 'vendor_013',
    name: 'Nova Technologies',
    gstin: '27AABCN1234K1ZG',
    confidence: 'high',
    confidenceScore: 91,
    suggestedLedger: 'Tech Services A/C',
    aiReasoning: 'GSTIN matched; vendor category aligns with Tech Services ledger',
    isNew: true,
  },
  {
    id: 'vendor_014',
    name: 'Prime Vendors Ltd',
    gstin: null,
    confidence: 'medium',
    confidenceScore: 61,
    suggestedLedger: 'Marketing Expense',
    aiReasoning: 'Name pattern matches similar vendors mapped to Marketing Expense',
    isNew: false,
  },
  {
    id: 'vendor_015',
    name: 'Sterling Supplies',
    gstin: '24AABCS5678Z1ZX',
    confidence: 'none',
    confidenceScore: 0,
    suggestedLedger: '',
    aiReasoning: '',
    isNew: true,
  },
]

// ─── Items (item_004..007) ────────────────────────────────────────────────────
// Distribution: 2 high, 1 medium, 1 unmatched | 1 flagged isNew

export const MAPPING_ITEMS: MappingItem[] = [
  {
    id: 'item_004',
    name: 'Monitor',
    type: 'Item',
    hsnSac: '85285200',
    confidence: 'high',
    confidenceScore: 93,
    suggestedPurchaseLedger: 'Purchases @ 18%',
    suggestedItemLedger: 'IT Equipment Stock',
    aiReasoning: 'HSN 85285200 matches Display equipment — taxed at 18% GST',
    isNew: false,
  },
  {
    id: 'item_005',
    name: 'Keyboard',
    type: 'Item',
    hsnSac: '84716000',
    confidence: 'high',
    confidenceScore: 89,
    suggestedPurchaseLedger: 'Purchases @ 12%',
    suggestedItemLedger: 'Peripherals Stock',
    aiReasoning: 'HSN 84716000 matches Input devices — 12% GST bracket',
    isNew: false,
  },
  {
    id: 'item_006',
    name: 'Mouse',
    type: 'Item',
    hsnSac: '84716000',
    confidence: 'medium',
    confidenceScore: 72,
    suggestedPurchaseLedger: 'Purchases @ 12%',
    suggestedItemLedger: 'Peripherals Stock',
    aiReasoning: 'Shared HSN with Keyboard; ledger assignment inferred from category',
    isNew: true,
  },
  {
    id: 'item_007',
    name: 'Printer',
    type: 'Item',
    hsnSac: '84433200',
    confidence: 'none',
    confidenceScore: 0,
    suggestedPurchaseLedger: '',
    suggestedItemLedger: '',
    aiReasoning: '',
    isNew: false,
  },
]

// ─── Cost Centers ─────────────────────────────────────────────────────────────
// Based on COST_CENTER_OPTIONS: 'Marketing', 'Indore', 'Sales', 'Operations', 'Finance'
// Distribution: 2 high, 2 medium, 1 unmatched | 1 flagged isNew

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

// ─── Bucketing helpers ────────────────────────────────────────────────────────

type Buckets<T> = { high: T[]; medium: T[]; unmatched: T[] }

const bucket = <T extends { confidence: ConfidenceTier }>(items: T[]): Buckets<T> => ({
  high: items.filter((i) => i.confidence === 'high'),
  medium: items.filter((i) => i.confidence === 'medium'),
  unmatched: items.filter((i) => i.confidence === 'none'),
})

export const getVendorBuckets = (): Buckets<MappingVendor> => bucket(MAPPING_VENDORS)
export const getItemBuckets = (): Buckets<MappingItem> => bucket(MAPPING_ITEMS)
export const getCostCenterBuckets = (): Buckets<MappingCostCenter> => bucket(MAPPING_COST_CENTERS)

// ─── New-item helpers ─────────────────────────────────────────────────────────

export const getNewVendorCount = (): number => MAPPING_VENDORS.filter((v) => v.isNew).length
export const getNewItemCount = (): number => MAPPING_ITEMS.filter((i) => i.isNew).length
export const getNewCostCenterCount = (): number => MAPPING_COST_CENTERS.filter((c) => c.isNew).length
