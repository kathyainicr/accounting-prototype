import type { V4EntityConfig, V4EntityKey, V4MappingRow, V4Rule, V4Settings } from './types'

// ─── Entity config ────────────────────────────────────────────────────────────

export const V4_ENTITY_CONFIG: Record<V4EntityKey, V4EntityConfig> = {
  items: {
    key: 'items',
    label: 'Items',
    description: 'Map RazorpayX items to Tally purchase accounts',
    icon: 'PackageIcon',
    targetOptions: [
      'Purchases @ 18%',
      'Engineering Expense',
      'Consulting Expense',
      'Marketing Expense',
      'Office Supplies Expense',
    ],
    secondaryTargetOptions: [
      'IT Equipment Stock',
      'Peripherals Stock',
      'Electronics Stock',
      'Furniture Stock',
    ],
    supportsInventory: true,
    sourceColumnLabel: 'RazorpayX Item',
    targetColumnLabel: 'Tally Item Ledger',
    secondaryTargetColumnLabel: 'Tally Item',
  },
  vendors: {
    key: 'vendors',
    label: 'Vendors',
    description: 'Map vendor contacts to Tally ledger accounts',
    icon: 'UsersIcon',
    targetOptions: [
      'Sundry Creditors',
      'Tech Services A/C',
      'Office Supplies A/C',
      'Raw Materials A/C',
      'Marketing Expense',
    ],
    sourceColumnLabel: 'RazorpayX Vendor',
    targetColumnLabel: 'Tally Vendor Ledger',
  },
  costCenters: {
    key: 'costCenters',
    label: 'Cost Centers',
    description: 'Map cost center allocations to Tally cost centres',
    icon: 'BoxIcon',
    targetOptions: [
      'Marketing Department',
      'Operations Dept',
      'Sales Division',
      'Finance Dept',
      'Engineering Dept',
    ],
    sourceColumnLabel: 'RazorpayX Cost Center',
    targetColumnLabel: 'Tally Cost Centre',
  },
  gst: {
    key: 'gst',
    label: 'GST',
    description: 'Map GST components to input tax ledgers',
    icon: 'TaxPaymentsIcon',
    targetOptions: [
      'Input CGST',
      'Input SGST',
      'Input IGST',
      'GST Suspense Ledger',
    ],
    sourceColumnLabel: 'GST Component',
    targetColumnLabel: 'Tally GST Ledger',
  },
  tds: {
    key: 'tds',
    label: 'TDS',
    description: 'Map TDS deductions to payable ledgers',
    icon: 'FileTextIcon',
    targetOptions: [
      'TDS Payable 194C',
      'TDS Payable 194I',
      'TDS Payable 194J',
    ],
    sourceColumnLabel: 'TDS Component',
    targetColumnLabel: 'Tally TDS Ledger',
  },
}

// ─── Initial entity mapping rows ─────────────────────────────────────────────

export const INITIAL_ENTITY_MAPPINGS: Record<V4EntityKey, V4MappingRow[]> = {
  items: [
    {
      id: 'item_v4_001',
      sourceLabel: 'Laptop Dock',
      trackInventory: true,
      mappingState: 'ray',
      targetLabel: 'Purchases @ 18%',
      secondaryTargetLabel: 'IT Equipment Stock',
      explanation: 'Ray matched the HSN cluster to IT peripherals already booked under Purchases @ 18%.',
    },
    {
      id: 'item_v4_002',
      sourceLabel: 'Conference Camera',
      trackInventory: false,
      mappingState: 'missing',
      targetLabel: '',
      secondaryTargetLabel: '',
      explanation: 'No prior pattern exists for this item name — choose a purchase account to continue.',
    },
    {
      id: 'item_v4_003',
      sourceLabel: 'Wireless Keyboard',
      trackInventory: true,
      mappingState: 'ray',
      targetLabel: 'Purchases @ 18%',
      secondaryTargetLabel: 'Peripherals Stock',
      explanation: 'Matched from a high-confidence stock pattern across repeated orders.',
    },
    {
      id: 'item_v4_004',
      sourceLabel: 'Standing Desk',
      trackInventory: false,
      mappingState: 'edited',
      targetLabel: 'Office Supplies Expense',
      secondaryTargetLabel: '',
      explanation: 'Manually mapped to office supplies in the last sync cycle.',
    },
    {
      id: 'item_v4_005',
      sourceLabel: 'Projector Mount',
      trackInventory: true,
      mappingState: 'missing',
      targetLabel: '',
      secondaryTargetLabel: '',
      explanation: 'Vendor sent an incomplete description — pick the right account before saving.',
    },
  ],
  vendors: [
    {
      id: 'vendor_v4_001',
      sourceLabel: 'Delta Logistics',
      mappingState: 'ray',
      targetLabel: 'Sundry Creditors',
      explanation: 'Ray found a strong supplier history. GSTIN changed this month so held for your confirmation.',
    },
    {
      id: 'vendor_v4_002',
      sourceLabel: 'Omega Consulting',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'No confident vendor ledger match for this supplier name — select one to proceed.',
    },
    {
      id: 'vendor_v4_003',
      sourceLabel: 'Nova Technologies',
      mappingState: 'ray',
      targetLabel: 'Tech Services A/C',
      explanation: 'Matched from repeated bookings under the same PAN and bank account.',
    },
    {
      id: 'vendor_v4_004',
      sourceLabel: 'Acme Supplies Pvt Ltd',
      mappingState: 'edited',
      targetLabel: 'Office Supplies A/C',
      explanation: 'Previously approved and committed to books.',
    },
    {
      id: 'vendor_v4_005',
      sourceLabel: 'Prime Vendors Ltd',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'Excluded until procurement confirms the legal entity name.',
    },
  ],
  costCenters: [
    {
      id: 'cc_v4_001',
      sourceLabel: 'Marketing West',
      mappingState: 'ray',
      targetLabel: 'Marketing Department',
      explanation: 'Mapped from branch naming and prior tagged payouts.',
    },
    {
      id: 'cc_v4_002',
      sourceLabel: 'Sales Pods',
      mappingState: 'ray',
      targetLabel: 'Sales Division',
      explanation: 'Team code matches the existing cost centre tree.',
    },
    {
      id: 'cc_v4_003',
      sourceLabel: 'Core Ops',
      mappingState: 'edited',
      targetLabel: 'Operations Dept',
      explanation: 'Finance re-labeled the cost centre — mapping confirmed.',
    },
    {
      id: 'cc_v4_004',
      sourceLabel: 'Board Projects',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'Pending cost centre approval from controllership.',
    },
    {
      id: 'cc_v4_005',
      sourceLabel: 'Engineering Infra',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'New cost centre added last week — no prior mapping pattern found.',
    },
  ],
  gst: [
    {
      id: 'gst_v4_001',
      sourceLabel: 'Input GST 18%',
      mappingState: 'ray',
      targetLabel: 'Input IGST',
      explanation: 'Held for review — supplier state code is inconsistent across recent bills.',
    },
    {
      id: 'gst_v4_002',
      sourceLabel: 'Input GST 12%',
      mappingState: 'ray',
      targetLabel: 'Input CGST',
      explanation: 'Reused the approved tax mapping from the last two close cycles.',
    },
    {
      id: 'gst_v4_003',
      sourceLabel: 'GST Reversal',
      mappingState: 'edited',
      targetLabel: 'GST Suspense Ledger',
      explanation: 'Finance manually approved this suspense ledger mapping earlier this month.',
    },
    {
      id: 'gst_v4_004',
      sourceLabel: 'Reverse Charge GST',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'Reverse-charge treatment to be confirmed by tax before mapping.',
    },
    {
      id: 'gst_v4_005',
      sourceLabel: 'Input GST 5%',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'Reduced-rate GST component — new invoice type seen for the first time this month.',
    },
  ],
  tds: [
    {
      id: 'tds_v4_001',
      sourceLabel: 'Professional Fees',
      mappingState: 'ray',
      targetLabel: 'TDS Payable 194J',
      explanation: 'Mapped from invoice description and prior withholding decisions.',
    },
    {
      id: 'tds_v4_002',
      sourceLabel: 'Office Rent',
      mappingState: 'ray',
      targetLabel: 'TDS Payable 194I',
      explanation: 'Repeated rent pattern auto-approved from the landlord vendor history.',
    },
    {
      id: 'tds_v4_003',
      sourceLabel: 'Contract Labor',
      mappingState: 'edited',
      targetLabel: 'TDS Payable 194C',
      explanation: 'Withholding mapping approved and committed to books.',
    },
    {
      id: 'tds_v4_004',
      sourceLabel: 'Director Sitting Fees',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'Payroll needs to confirm the treatment before this can be mapped.',
    },
    {
      id: 'tds_v4_005',
      sourceLabel: 'Commission Payments',
      mappingState: 'missing',
      targetLabel: '',
      explanation: 'New payment category — section code to be decided by tax team.',
    },
  ],
}

// ─── Payout purposes and contact types (for rules) ───────────────────────────

export const PAYOUT_PURPOSES: string[] = [
  'Vendor Payment',
  'Salary',
  'Expense Reimbursement',
  'Tax Payment',
  'Advance Payment',
  'Contractor Payment',
  'Utility Payment',
]

export const CONTACT_TYPES: string[] = [
  'Vendor',
  'Employee',
  'Contractor',
  'Government',
  'Customer',
]

// ─── Initial smart rules ──────────────────────────────────────────────────────

export const INITIAL_RULES: V4Rule[] = [
  {
    id: 'rule_001',
    type: 'purpose-only',
    payoutPurpose: 'Vendor Payment',
    ledger: 'Sundry Creditors',
    isActive: true,
    createdBy: 'ray',
    createdAt: '2026-05-01',
  },
  {
    id: 'rule_002',
    type: 'contact-only',
    contactType: 'Employee',
    ledger: 'Salary Payable A/C',
    isActive: true,
    createdBy: 'ray',
    createdAt: '2026-05-01',
  },
  {
    id: 'rule_003',
    type: 'compound',
    payoutPurpose: 'Expense Reimbursement',
    contactType: 'Employee',
    ledger: 'Payout Expense A/C',
    isActive: true,
    createdBy: 'manual',
    createdAt: '2026-05-10',
  },
  {
    id: 'rule_004',
    type: 'purpose-only',
    payoutPurpose: 'Tax Payment',
    ledger: 'Tax Payable A/C',
    isActive: false,
    createdBy: 'manual',
    createdAt: '2026-05-14',
  },
  {
    id: 'rule_005',
    type: 'compound',
    payoutPurpose: 'Contractor Payment',
    contactType: 'Contractor',
    ledger: 'Tech Services A/C',
    isActive: true,
    createdBy: 'manual',
    createdAt: '2026-05-20',
  },
]

// ─── Default settings ─────────────────────────────────────────────────────────

export const INITIAL_SETTINGS: V4Settings = {
  enabledEntities: {
    items: true,
    vendors: true,
    costCenters: true,
    gst: true,
    tds: true,
  },
}
