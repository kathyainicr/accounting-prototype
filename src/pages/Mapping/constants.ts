import type { MappingStepId } from './types'

// ─── Step URL slug mapping ─────────────────────────────────────────────────────

export const STEP_TO_SLUG: Record<MappingStepId, string> = {
  vendors: 'vendors',
  items: 'items',
  costCenters: 'cost-centers',
}

// ─── Step config ──────────────────────────────────────────────────────────────

export type StepConfig = {
  id: MappingStepId
  label: string
  entityLabel: string        // used in success message: "All {entityLabel} mapped!"
  nextStepLabel: string      // label for the "Continue to X" button; '' on last step
}

export const STEP_CONFIG: StepConfig[] = [
  {
    id: 'vendors',
    label: 'Map Vendors',
    entityLabel: 'vendors',
    nextStepLabel: 'Map Items',
  },
  {
    id: 'items',
    label: 'Map Items',
    entityLabel: 'items',
    nextStepLabel: 'Map Cost Centers',
  },
  {
    id: 'costCenters',
    label: 'Map Cost Centers',
    entityLabel: 'cost centers',
    nextStepLabel: '',
  },
]

export const STEP_IDS: MappingStepId[] = STEP_CONFIG.map((s) => s.id)

// ─── Confidence bucket labels ─────────────────────────────────────────────────

export const CONFIDENCE_BUCKET_LABELS = {
  high: 'High confidence',
  medium: 'Needs review',
  none: 'Unmatched',
} as const

// ─── Tally ledger options for items (item ledger — for inventory tracking) ────

export const ITEM_LEDGER_OPTIONS = [
  'Electronics Stock',
  'IT Equipment Stock',
  'Furniture Stock',
  'Peripherals Stock',
  'Printing Equipment Stock',
  'General Stock',
]

// ─── Tally cost center options ────────────────────────────────────────────────

export const TALLY_COST_CENTER_OPTIONS = [
  'Marketing Department',
  'Indore Branch',
  'Sales Division',
  'Operations Dept',
  'Finance Dept',
  'IT Division',
  'HR Department',
]
