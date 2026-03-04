import { ACCOUNTING_STATUS_CONFIG } from '../shared/accountingStatusConfig'
import type { AccountingStatusConfigEntry } from '../shared/accountingStatusConfig'

export type ItemStatus = 'categorise' | 'pending_tally_sync' | 'synced'

export type Item = {
  id: string
  name: string
  description: string
  type: 'Item' | 'Service'
  addedOn: string
  createdOn: string
  hsnSac: string | null
  status: ItemStatus
  statusTimestamp: string
  aiSuggestedPurchaseLedger?: string
  aiSuggestedItemLedger?: string
  confidence?: 'high' | 'medium' | 'none'
  confidenceScore?: number
  aiReasoning?: string
  isNew?: boolean
}

export type ItemCategory = {
  purchaseLedger: string
  trackInventory: boolean
  itemLedger?: string
}

export type ItemStatusConfigEntry = AccountingStatusConfigEntry

export const ITEM_STATUS_CONFIG: Record<ItemStatus, ItemStatusConfigEntry> = {
  categorise: ACCOUNTING_STATUS_CONFIG.categorise,
  pending_tally_sync: ACCOUNTING_STATUS_CONFIG.pending_tally_sync,
  synced: ACCOUNTING_STATUS_CONFIG.synced,
}

export const PURCHASE_LEDGER_OPTIONS = [
  'Consulting Expense',
  'Electricity',
  'Engineering Expense',
  'Marketing Expense',
  'Purchases @ 12%',
  'Purchases @ 18%',
  'Purchases @ 28%',
]

export const ITEM_LEDGER_OPTIONS = [
  'Electronics Stock',
  'IT Equipment Stock',
  'Furniture Stock',
  'Peripherals Stock',
  'Printing Equipment Stock',
  'General Stock',
]

export const MOCK_ITEMS: Item[] = [
  {
    id: 'item_001',
    name: 'Laptop',
    description: 'High-performance business laptop with 16GB RAM and 512GB SSD',
    type: 'Item',
    addedOn: '01 Jan, 2024',
    createdOn: '01 Jan, 2024',
    hsnSac: '84713000',
    status: 'synced',
    statusTimestamp: '01 Jan, 2024 at 10:00 AM',
  },
  {
    id: 'item_004',
    name: 'Monitor',
    description: '27-inch 4K IPS display with USB-C connectivity',
    type: 'Item',
    addedOn: '10 Jan, 2024',
    createdOn: '10 Jan, 2024',
    hsnSac: '85285200',
    status: 'categorise',
    statusTimestamp: '10 Jan, 2024 at 02:00 PM',
    aiSuggestedPurchaseLedger: 'Engineering Expense',
    aiSuggestedItemLedger: 'IT Equipment Stock',
    confidence: 'high',
    confidenceScore: 93,
    aiReasoning: 'HSN 85285200 matches Display equipment — taxed at 18% GST',
    isNew: false,
  },
  {
    id: 'item_002',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support and adjustable height',
    type: 'Item',
    addedOn: '05 Jan, 2024',
    createdOn: '05 Jan, 2024',
    hsnSac: '94013000',
    status: 'synced',
    statusTimestamp: '05 Jan, 2024 at 11:30 AM',
  },
  {
    id: 'item_005',
    name: 'Keyboard',
    description: 'Mechanical wireless keyboard with backlit keys',
    type: 'Item',
    addedOn: '12 Jan, 2024',
    createdOn: '12 Jan, 2024',
    hsnSac: '84716000',
    status: 'categorise',
    statusTimestamp: '12 Jan, 2024 at 10:45 AM',
    aiSuggestedPurchaseLedger: 'Purchases @ 12%',
    aiSuggestedItemLedger: 'Peripherals Stock',
    confidence: 'high',
    confidenceScore: 89,
    aiReasoning: 'HSN 84716000 matches Input devices — 12% GST bracket',
    isNew: false,
  },
  {
    id: 'item_003',
    name: 'Desk',
    description: 'Standing adjustable office desk with wooden top',
    type: 'Item',
    addedOn: '08 Jan, 2024',
    createdOn: '08 Jan, 2024',
    hsnSac: '94031000',
    status: 'synced',
    statusTimestamp: '08 Jan, 2024 at 09:00 AM',
  },
  {
    id: 'item_006',
    name: 'Mouse',
    description: 'Wireless ergonomic mouse with precision tracking',
    type: 'Item',
    addedOn: '15 Jan, 2024',
    createdOn: '15 Jan, 2024',
    hsnSac: '84716000',
    status: 'categorise',
    statusTimestamp: '15 Jan, 2024 at 03:30 PM',
    aiSuggestedPurchaseLedger: 'Purchases @ 12%',
    aiSuggestedItemLedger: 'Peripherals Stock',
    confidence: 'medium',
    confidenceScore: 72,
    aiReasoning: 'Shared HSN with Keyboard; ledger assignment inferred from category',
    isNew: true,
  },
  {
    id: 'item_007',
    name: 'Printer',
    description: 'A4 colour laser printer with duplex printing',
    type: 'Item',
    addedOn: '18 Jan, 2024',
    createdOn: '18 Jan, 2024',
    hsnSac: '84433200',
    status: 'categorise',
    statusTimestamp: '18 Jan, 2024 at 11:00 AM',
    aiSuggestedPurchaseLedger: 'Purchases @ 18%',
    aiSuggestedItemLedger: 'Printing Equipment Stock',
    confidence: 'medium',
    confidenceScore: 58,
    aiReasoning: 'HSN 84433200 matches Printing equipment — standard 18% GST bracket',
    isNew: false,
  },
]

export const buildInitialItemCategories = (): Record<string, ItemCategory> => {
  const initial: Record<string, ItemCategory> = {}
  MOCK_ITEMS.forEach((item) => {
    if (item.status === 'synced') {
      initial[item.id] = {
        purchaseLedger: 'Purchases @ 18%',
        trackInventory: false,
      }
    }
  })
  return initial
}
