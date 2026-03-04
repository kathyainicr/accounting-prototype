import { ACCOUNTING_STATUS_CONFIG } from '../shared/accountingStatusConfig'
import type { AccountingStatusConfigEntry } from '../shared/accountingStatusConfig'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillStatus =
  | 'categorise'
  | 'excluded'
  | 'pending_tally_sync'
  | 'error_found'
  | 'synced'

export type BillItem = {
  itemId: string
  itemName: string
  quantity: number
  price: number
}

export type TallyDetails = {
  type: string
  vendorLedger: string
  itemLedgers: string | null   // null → show "Add +"
  tdsLedger: string
  costCenter: string | null    // null → show "--"
  invoiceType: string
  postingDate: string
}

export type VendorPayment = {
  paymentStatus: 'UNPAID' | 'PAID'
  invoiceDate: string
  dueDate: string
  invoiceNo: string
  description: string | null
}

export type Bill = {
  id: string
  vendorId: string      // links to Vendor.id in vendorMockData
  vendor: string        // display name (kept for backwards compat)
  billNumber: string
  amount: number
  status: BillStatus
  createdOn: string
  statusTimestamp: string
  statusDescription?: string
  items: BillItem[]     // line items shown in Categorise Bill left panel
  gstLedger: string     // always "GST Input Credit"
  postingDate: string   // auto-filled from createdOn
  tallyDetails: TallyDetails
  vendorPayment: VendorPayment
}

// ─── Status config ────────────────────────────────────────────────────────────

export type StatusConfigEntry = AccountingStatusConfigEntry & {
  actionType: 'categorise' | 'error_found' | null
}

export const STATUS_CONFIG: Record<BillStatus, StatusConfigEntry> = {
  categorise: {
    ...ACCOUNTING_STATUS_CONFIG.categorise,
    actionType: 'categorise',
  },
  excluded: {
    ...ACCOUNTING_STATUS_CONFIG.excluded,
    actionType: null,
  },
  pending_tally_sync: {
    ...ACCOUNTING_STATUS_CONFIG.pending_tally_sync,
    drawerHeaderColor: 'notice',
    actionType: null,
  },
  error_found: {
    ...ACCOUNTING_STATUS_CONFIG.error_found,
    actionType: 'error_found',
  },
  synced: {
    ...ACCOUNTING_STATUS_CONFIG.synced,
    actionType: null,
  },
}

// ─── Mock data ────────────────────────────────────────────────────────────────

// Vendor IDs match MOCK_VENDORS in vendorMockData.ts
// vendor_001–008: already synced → bills linked to them show ✓ vendor ledger in Categorise modal
// vendor_009–015: categorise → bills linked to them show ⚠ vendor ledger
const VENDOR_IDS = [
  'vendor_001', 'vendor_002', 'vendor_003', 'vendor_004', // synced
  'vendor_009', 'vendor_010', 'vendor_011', 'vendor_012', // categorise
  'vendor_005', 'vendor_006', 'vendor_007', 'vendor_008', // synced
  'vendor_013', 'vendor_014', 'vendor_015', 'vendor_009', // categorise / wrap
  'vendor_001', 'vendor_003', 'vendor_005', 'vendor_007', // synced
]

const VENDORS = [
  'Acme Supplies Pvt Ltd',   // high confidence → ready to sync
  'Nova Technologies',        // medium confidence → needs review
  'Omega Consulting',         // low confidence → needs review
  'Sterling Supplies',        // medium confidence → needs review
  'Alpha Resources',
  'Pinnacle Services',
  'Delta Logistics',
  'Omega Consulting',
  'Premium Parts Co.',
  'Metro Infrastructure Ltd',
  'Digital Solutions Inc',
  'Horizon Manufacturing',
  'Nova Technologies',
  'Prime Vendors Ltd',
  'Sterling Supplies',
  'Alpha Resources',
  'Acme Supplies Pvt Ltd',
  'Global Trade Enterprises',
  'Premium Parts Co.',
  'Digital Solutions Inc',
]

// 4 of each status
const STATUSES: BillStatus[] = [
  'categorise', 'categorise', 'categorise', 'categorise',
  'excluded', 'excluded', 'excluded', 'excluded',
  'pending_tally_sync', 'pending_tally_sync', 'pending_tally_sync', 'pending_tally_sync',
  'error_found', 'error_found', 'error_found', 'error_found',
  'synced', 'synced', 'synced', 'synced',
]

const TALLY_TYPES = ['Bill', 'Purchase Order', 'Credit Note', 'Debit Note']
const VENDOR_LEDGERS = [
  'Acme Creditors A/C',
  'Tech Suppliers Ledger',
  'Global Vendors A/C',
  'Sunrise Payables',
  'Premium Creditors',
]
const ITEM_LEDGERS = ['Purchase A/C', 'Raw Materials', 'Office Supplies', 'IT Equipment A/C']
const TDS_LEDGERS = ['TDS Payable 194C', 'TDS Payable 194J', 'TDS Payable 194I']
const COST_CENTERS = ['Operations', 'Engineering', 'Marketing', 'Finance']
const INVOICE_TYPES = ['Regular', 'Import Goods', 'Export', 'SEZ']

// Reusable item definitions
const ITEM_POOL: BillItem[][] = [
  [{ itemId: 'item_001', itemName: 'Laptop', quantity: 1, price: 60000 }],
  [{ itemId: 'item_002', itemName: 'Office Chair', quantity: 4, price: 12000 }, { itemId: 'item_003', itemName: 'Desk', quantity: 2, price: 8000 }],
  [{ itemId: 'item_004', itemName: 'Monitor', quantity: 2, price: 25000 }],
  [{ itemId: 'item_005', itemName: 'Keyboard', quantity: 10, price: 2000 }, { itemId: 'item_006', itemName: 'Mouse', quantity: 10, price: 800 }],
  [{ itemId: 'item_007', itemName: 'Printer', quantity: 1, price: 45000 }],
]

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const MOCK_BILLS: Bill[] = STATUSES.map((status, index) => {
  const vendor = VENDORS[index]
  const vendorId = VENDOR_IDS[index]
  const num = index + 1
  const amount = Math.round((5000 + index * 9876.54) * 100) / 100
  const date = new Date(2024, Math.floor(index / 4), (index % 27) + 1)
  const dateStr = formatDate(date)
  const dueDate = formatDate(new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000))
  const hour = 10 + (index % 8)
  const minute = ((index * 7) % 60).toString().padStart(2, '0')

  return {
    id: `bill_${num.toString().padStart(3, '0')}`,
    vendorId,
    vendor,
    billNumber: `BILL-2024-${num.toString().padStart(4, '0')}`,
    amount,
    status,
    createdOn: dateStr,
    statusTimestamp: `${dateStr} at ${hour}:${minute} AM`,
    statusDescription:
      status === 'pending_tally_sync'
        ? 'Waiting for Tally to confirm the sync. This usually takes a few minutes.'
        : undefined,
    items: ITEM_POOL[index % ITEM_POOL.length],
    gstLedger: 'GST Input Credit',
    postingDate: dateStr,
    tallyDetails: {
      type: TALLY_TYPES[index % TALLY_TYPES.length],
      vendorLedger: VENDOR_LEDGERS[index % VENDOR_LEDGERS.length],
      itemLedgers: index % 3 === 0 ? null : ITEM_LEDGERS[index % ITEM_LEDGERS.length],
      tdsLedger: TDS_LEDGERS[index % TDS_LEDGERS.length],
      costCenter: index % 4 === 0 ? null : COST_CENTERS[index % COST_CENTERS.length],
      invoiceType: INVOICE_TYPES[index % INVOICE_TYPES.length],
      postingDate: dateStr,
    },
    vendorPayment: {
      paymentStatus: index % 5 === 0 ? 'PAID' : 'UNPAID',
      invoiceDate: dateStr,
      dueDate,
      invoiceNo: `INV-2024-${num.toString().padStart(4, '0')}`,
      description: index % 2 === 0 ? 'Monthly supplies and services rendered' : null,
    },
  }
})
