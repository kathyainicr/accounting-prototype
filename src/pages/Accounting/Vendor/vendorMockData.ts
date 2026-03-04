import { ACCOUNTING_STATUS_CONFIG } from '../shared/accountingStatusConfig'
import type { AccountingStatusConfigEntry } from '../shared/accountingStatusConfig'

export type VendorStatus = 'categorise' | 'pending_tally_sync' | 'synced'

export type Vendor = {
  id: string
  name: string
  gstin: string | null
  pan: string | null
  status: VendorStatus
  createdOn: string
  statusTimestamp: string
  vendorLedger?: string
  aiSuggestedLedger?: string
}

export type VendorStatusConfigEntry = AccountingStatusConfigEntry

export const VENDOR_STATUS_CONFIG: Record<VendorStatus, VendorStatusConfigEntry> = {
  categorise: ACCOUNTING_STATUS_CONFIG.categorise,
  pending_tally_sync: ACCOUNTING_STATUS_CONFIG.pending_tally_sync,
  synced: ACCOUNTING_STATUS_CONFIG.synced,
}

export const MOCK_LEDGER_OPTIONS = [
  'Hitachi',
  'Marketing Expense',
  'Office Supplies A/C',
  'Raw Materials A/C',
  'Tech Services A/C',
  'Sundry Creditors',
  'Capital Expense A/C',
]

export const COST_CENTER_OPTIONS = ['Marketing', 'Indore', 'Sales', 'Operations', 'Finance']

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor_001',
    name: 'Acme Supplies Pvt Ltd',
    gstin: '27AAPFU0939F1ZV',
    pan: 'AAPFU0939F',
    status: 'synced',
    createdOn: '01 Jan, 2024',
    statusTimestamp: '01 Jan, 2024 at 10:00 AM',
    vendorLedger: 'Sundry Creditors',
  },
  {
    id: 'vendor_002',
    name: 'TechCorp Solutions',
    gstin: null,
    pan: 'CXSPG4264R',
    status: 'synced',
    createdOn: '02 Jan, 2024',
    statusTimestamp: '02 Jan, 2024 at 11:30 AM',
    vendorLedger: 'Tech Services A/C',
  },
  {
    id: 'vendor_011',
    name: 'Delta Logistics',
    gstin: '06AAADL2222B1ZP',
    pan: 'AAADL2222B',
    status: 'categorise',
    createdOn: '04 Jan, 2024',
    statusTimestamp: '04 Jan, 2024 at 11:45 AM',
    aiSuggestedLedger: 'Capital Expense A/C',
  },
  {
    id: 'vendor_004',
    name: 'Sunrise Electronics',
    gstin: '27AAACE2416J1ZC',
    pan: 'AAACE2416J',
    status: 'synced',
    createdOn: '06 Jan, 2024',
    statusTimestamp: '06 Jan, 2024 at 02:00 PM',
    vendorLedger: 'Hitachi',
  },
  {
    id: 'vendor_009',
    name: 'Alpha Resources',
    gstin: '29AAACA1234F1Z5',
    pan: 'AAACA1234F',
    status: 'categorise',
    createdOn: '08 Jan, 2024',
    statusTimestamp: '08 Jan, 2024 at 10:30 AM',
    aiSuggestedLedger: 'Raw Materials A/C',
  },
  {
    id: 'vendor_012',
    name: 'Omega Consulting',
    gstin: null,
    pan: 'ABCCD1234A',
    status: 'categorise',
    createdOn: '09 Jan, 2024',
    statusTimestamp: '09 Jan, 2024 at 01:09 PM',
  },
  {
    id: 'vendor_005',
    name: 'Premium Parts Co.',
    gstin: null,
    pan: 'ABCPD1234E',
    status: 'synced',
    createdOn: '11 Jan, 2024',
    statusTimestamp: '11 Jan, 2024 at 10:45 AM',
    vendorLedger: 'Office Supplies A/C',
  },
  {
    id: 'vendor_010',
    name: 'Pinnacle Services',
    gstin: null,
    pan: 'BCHPS7890M',
    status: 'categorise',
    createdOn: '13 Jan, 2024',
    statusTimestamp: '13 Jan, 2024 at 02:15 PM',
    aiSuggestedLedger: 'Tech Services A/C',
  },
  {
    id: 'vendor_003',
    name: 'Global Trade Enterprises',
    gstin: '29GGGGG1314R9Z6',
    pan: 'GGGGG1314R',
    status: 'synced',
    createdOn: '15 Jan, 2024',
    statusTimestamp: '15 Jan, 2024 at 09:15 AM',
    vendorLedger: 'Raw Materials A/C',
  },
  {
    id: 'vendor_015',
    name: 'Sterling Supplies',
    gstin: '24AABCS5678Z1ZX',
    pan: 'AABCS5678Z',
    status: 'categorise',
    createdOn: '17 Jan, 2024',
    statusTimestamp: '17 Jan, 2024 at 09:30 AM',
  },
  {
    id: 'vendor_006',
    name: 'Metro Infrastructure Ltd',
    gstin: '24AAACM5606R1ZX',
    pan: 'AAACM5606R',
    status: 'synced',
    createdOn: '18 Jan, 2024',
    statusTimestamp: '18 Jan, 2024 at 03:30 PM',
    vendorLedger: 'Capital Expense A/C',
  },
  {
    id: 'vendor_013',
    name: 'Nova Technologies',
    gstin: '27AABCN1234K1ZG',
    pan: 'AABCN1234K',
    status: 'categorise',
    createdOn: '21 Jan, 2024',
    statusTimestamp: '21 Jan, 2024 at 10:00 AM',
  },
  {
    id: 'vendor_008',
    name: 'Horizon Manufacturing',
    gstin: '27AABCH1234A1Z1',
    pan: 'AABCH1234A',
    status: 'synced',
    createdOn: '22 Jan, 2024',
    statusTimestamp: '22 Jan, 2024 at 09:00 AM',
    vendorLedger: 'Raw Materials A/C',
  },
  {
    id: 'vendor_014',
    name: 'Prime Vendors Ltd',
    gstin: null,
    pan: 'DPMPV0939L',
    status: 'categorise',
    createdOn: '25 Jan, 2024',
    statusTimestamp: '25 Jan, 2024 at 03:00 PM',
  },
  {
    id: 'vendor_007',
    name: 'Digital Solutions Inc',
    gstin: null,
    pan: 'ABMCD4567K',
    status: 'synced',
    createdOn: '28 Jan, 2024',
    statusTimestamp: '28 Jan, 2024 at 11:00 AM',
    vendorLedger: 'Marketing Expense',
  },
]
