export type AIConfidenceTier = 'high' | 'medium' | 'low'

export type AIBillSuggestion = {
  id: string
  billNumber: string
  vendor: string
  amount: number
  date: string
  confidence: AIConfidenceTier
  confidenceScore: number
  suggestedVendorLedger: string
  suggestedCostCenter: string
  suggestedItemLedger: string
  reasoning: string
  signalSource: string   // what data the AI used to make the call
}

export const AI_BILL_SUGGESTIONS: AIBillSuggestion[] = [
  {
    id: 'ai_001', billNumber: 'BILL-2024-0041', vendor: 'Acme Supplies Pvt Ltd',
    amount: 84320, date: '12 Jan 2024', confidence: 'high', confidenceScore: 99,
    suggestedVendorLedger: 'Acme Creditors A/C', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'Exact GSTIN match. 14 prior bills mapped identically.',
    signalSource: 'GSTIN + historical mapping',
  },
  {
    id: 'ai_002', billNumber: 'BILL-2024-0042', vendor: 'TechCorp Solutions',
    amount: 215000, date: '14 Jan 2024', confidence: 'high', confidenceScore: 97,
    suggestedVendorLedger: 'Tech Suppliers Ledger', suggestedCostCenter: 'Engineering',
    suggestedItemLedger: 'IT Equipment A/C',
    reasoning: 'PAN matches. Same item category mapped 8 times previously.',
    signalSource: 'PAN + item category history',
  },
  {
    id: 'ai_003', billNumber: 'BILL-2024-0043', vendor: 'Global Trade Enterprises',
    amount: 67890, date: '15 Jan 2024', confidence: 'high', confidenceScore: 98,
    suggestedVendorLedger: 'Global Vendors A/C', suggestedCostCenter: 'Finance',
    suggestedItemLedger: 'Raw Materials',
    reasoning: 'Exact GSTIN match. Recurring monthly vendor.',
    signalSource: 'GSTIN + payment frequency',
  },
  {
    id: 'ai_004', billNumber: 'BILL-2024-0044', vendor: 'Sunrise Electronics',
    amount: 43500, date: '16 Jan 2024', confidence: 'high', confidenceScore: 96,
    suggestedVendorLedger: 'Sunrise Payables', suggestedCostCenter: 'Engineering',
    suggestedItemLedger: 'IT Equipment A/C',
    reasoning: 'PAN + GSTIN both match. 6 prior bills in same ledger.',
    signalSource: 'PAN + GSTIN',
  },
  {
    id: 'ai_005', billNumber: 'BILL-2024-0045', vendor: 'Premium Parts Co.',
    amount: 128400, date: '17 Jan 2024', confidence: 'high', confidenceScore: 95,
    suggestedVendorLedger: 'Premium Creditors', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'Exact name + GSTIN match. Same cost centre for 11 bills.',
    signalSource: 'Vendor name + GSTIN + cost centre history',
  },
  {
    id: 'ai_006', billNumber: 'BILL-2024-0046', vendor: 'Metro Infrastructure Ltd',
    amount: 395000, date: '18 Jan 2024', confidence: 'high', confidenceScore: 99,
    suggestedVendorLedger: 'Metro Creditors A/C', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'Recurring annual vendor. Exact GSTIN. Same ledger for 3 years.',
    signalSource: 'GSTIN + historical frequency',
  },
  {
    id: 'ai_007', billNumber: 'BILL-2024-0047', vendor: 'Digital Solutions Inc',
    amount: 52000, date: '19 Jan 2024', confidence: 'high', confidenceScore: 97,
    suggestedVendorLedger: 'Tech Suppliers Ledger', suggestedCostCenter: 'Engineering',
    suggestedItemLedger: 'IT Equipment A/C',
    reasoning: 'PAN match. Same vendor under alternate display name.',
    signalSource: 'PAN + name fuzzy match',
  },
  {
    id: 'ai_008', billNumber: 'BILL-2024-0048', vendor: 'Horizon Manufacturing',
    amount: 87650, date: '20 Jan 2024', confidence: 'high', confidenceScore: 96,
    suggestedVendorLedger: 'Horizon Payables A/C', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Raw Materials',
    reasoning: 'GSTIN match. Item category unchanged from prior bills.',
    signalSource: 'GSTIN + item category',
  },

  {
    id: 'ai_009', billNumber: 'BILL-2024-0049', vendor: 'Nova Technologies',
    amount: 175000, date: '21 Jan 2024', confidence: 'medium', confidenceScore: 72,
    suggestedVendorLedger: 'Tech Suppliers Ledger', suggestedCostCenter: 'Engineering',
    suggestedItemLedger: 'IT Equipment A/C',
    reasoning: 'Vendor name is similar but GSTIN not found in history. Suggesting based on category.',
    signalSource: 'Name similarity + category',
  },
  {
    id: 'ai_010', billNumber: 'BILL-2024-0050', vendor: 'Prime Vendors Ltd',
    amount: 34200, date: '22 Jan 2024', confidence: 'medium', confidenceScore: 65,
    suggestedVendorLedger: 'Premium Creditors', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'First bill from this vendor. Mapped to closest ledger based on name.',
    signalSource: 'Name similarity only',
  },
  {
    id: 'ai_011', billNumber: 'BILL-2024-0051', vendor: 'Sterling Supplies',
    amount: 23450, date: '23 Jan 2024', confidence: 'medium', confidenceScore: 78,
    suggestedVendorLedger: 'Acme Creditors A/C', suggestedCostCenter: 'Finance',
    suggestedItemLedger: 'Office Supplies',
    reasoning: 'Item category matches office supplies pattern. Vendor is new but GSTIN prefix matches state.',
    signalSource: 'Item category + GSTIN state prefix',
  },
  {
    id: 'ai_012', billNumber: 'BILL-2024-0052', vendor: 'Alpha Resources',
    amount: 91000, date: '24 Jan 2024', confidence: 'medium', confidenceScore: 58,
    suggestedVendorLedger: 'Global Vendors A/C', suggestedCostCenter: 'Marketing',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'Generic vendor name. Best match based on bill amount pattern and cost centre.',
    signalSource: 'Amount pattern + cost centre inference',
  },
  {
    id: 'ai_013', billNumber: 'BILL-2024-0053', vendor: 'Pinnacle Services',
    amount: 156000, date: '25 Jan 2024', confidence: 'medium', confidenceScore: 69,
    suggestedVendorLedger: 'Tech Suppliers Ledger', suggestedCostCenter: 'Engineering',
    suggestedItemLedger: 'IT Equipment A/C',
    reasoning: 'Services vendor. GSTIN not in system. Suggested based on similar bill descriptions.',
    signalSource: 'Bill description similarity',
  },
  {
    id: 'ai_014', billNumber: 'BILL-2024-0054', vendor: 'Delta Logistics',
    amount: 48900, date: '26 Jan 2024', confidence: 'medium', confidenceScore: 74,
    suggestedVendorLedger: 'Global Vendors A/C', suggestedCostCenter: 'Operations',
    suggestedItemLedger: 'Purchase A/C',
    reasoning: 'Logistics vendor. Name partial match with existing ledger.',
    signalSource: 'Name partial match',
  },

  {
    id: 'ai_015', billNumber: 'BILL-2024-0055', vendor: 'Omega Consulting',
    amount: 275000, date: '27 Jan 2024', confidence: 'low', confidenceScore: 31,
    suggestedVendorLedger: '', suggestedCostCenter: '', suggestedItemLedger: '',
    reasoning: 'First-time vendor, no GSTIN match, unique item category not in history.',
    signalSource: 'No reliable signal',
  },
  {
    id: 'ai_016', billNumber: 'BILL-2024-0056', vendor: 'CloudNine Infra Pvt Ltd',
    amount: 190000, date: '28 Jan 2024', confidence: 'low', confidenceScore: 22,
    suggestedVendorLedger: '', suggestedCostCenter: '', suggestedItemLedger: '',
    reasoning: 'Vendor not in Tally. Name has no close match in ledger list.',
    signalSource: 'No reliable signal',
  },
  {
    id: 'ai_017', billNumber: 'BILL-2024-0057', vendor: 'Zenithal Corp',
    amount: 88700, date: '29 Jan 2024', confidence: 'low', confidenceScore: 18,
    suggestedVendorLedger: '', suggestedCostCenter: '', suggestedItemLedger: '',
    reasoning: 'New vendor, unusual item category, cost centre unresolvable.',
    signalSource: 'No reliable signal',
  },
  {
    id: 'ai_018', billNumber: 'BILL-2024-0058', vendor: 'Meridian Trade Co.',
    amount: 63200, date: '30 Jan 2024', confidence: 'low', confidenceScore: 41,
    suggestedVendorLedger: '', suggestedCostCenter: '', suggestedItemLedger: '',
    reasoning: 'Low name similarity with any existing ledger. Insufficient history.',
    signalSource: 'No reliable signal',
  },
]

export const HIGH_CONFIDENCE_BILLS = AI_BILL_SUGGESTIONS.filter(b => b.confidence === 'high')
export const MEDIUM_CONFIDENCE_BILLS = AI_BILL_SUGGESTIONS.filter(b => b.confidence === 'medium')
export const LOW_CONFIDENCE_BILLS = AI_BILL_SUGGESTIONS.filter(b => b.confidence === 'low')

export const AI_SUGGESTION_BY_VENDOR: Record<string, AIBillSuggestion> =
  Object.fromEntries(AI_BILL_SUGGESTIONS.map(s => [s.vendor, s]))

export const getConfidenceTierMeta = (tier: AIConfidenceTier): {
  label: string
  color: 'positive' | 'notice' | 'negative'
  tooltipTitle: string
} => {
  if (tier === 'high') return { label: 'High', color: 'positive', tooltipTitle: 'High confidence' }
  if (tier === 'medium') return { label: 'Mid', color: 'notice', tooltipTitle: 'Medium confidence' }
  return { label: 'Low', color: 'negative', tooltipTitle: 'Low confidence' }
}

export type FAFCounts = {
  needsAction: number
  needsReview: number
  readyToSync: number
  pendingToSync: number
  synced: number
  issues: number
  excluded: number
}

export const FAF_COUNTS_FRESH: FAFCounts = {
  needsAction: 458,
  needsReview: 0,
  readyToSync: 0,
  pendingToSync: 0,
  synced: 280,
  issues: 4,
  excluded: 4,
}

export const FAF_COUNTS_POST_AI: FAFCounts = {
  needsAction: 211,
  needsReview: 0,
  readyToSync: 247,
  pendingToSync: 0,
  synced: 280,
  issues: 4,
  excluded: 4,
}

export const FAF_GRAND_TOTAL = 738
export const FAF_DAYS_LEFT = 7

export const AI_SUMMARY = {
  totalBills: 681,
  categoriseBills: 458,
  highCount: HIGH_CONFIDENCE_BILLS.length,
  mediumCount: MEDIUM_CONFIDENCE_BILLS.length,
  lowCount: LOW_CONFIDENCE_BILLS.length,
  highCountDisplay: 247,
  mediumCountDisplay: 53,
  lowCountDisplay: 158,
}
