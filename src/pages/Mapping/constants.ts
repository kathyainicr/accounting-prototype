import type { MappingStepId } from './types'

export const STEP_TO_SLUG: Record<MappingStepId, string> = {
  vendors: 'vendors',
  items: 'items',
  costCenters: 'cost-centers',
}

export type StepConfig = {
  id: MappingStepId
  label: string
  entityLabel: string
  nextStepLabel: string
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

export const CONFIDENCE_BUCKET_LABELS = {
  high: 'High confidence',
  medium: 'Needs review',
  none: 'Unmatched',
} as const

export const ITEM_LEDGER_OPTIONS = [
  'Electronics Stock',
  'IT Equipment Stock',
  'Furniture Stock',
  'Peripherals Stock',
  'Printing Equipment Stock',
  'General Stock',
]

export const TALLY_COST_CENTER_OPTIONS = [
  'Marketing Department',
  'Indore Branch',
  'Sales Division',
  'Operations Dept',
  'Finance Dept',
  'IT Division',
  'HR Department',
]
