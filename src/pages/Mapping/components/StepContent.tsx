import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Heading, Text, Button } from '@razorpay/blade/components'
import { useMappingContext } from '../../../context/MappingContext'
import { useAccountingContext } from '../../../context/AccountingContext'
import { STEP_CONFIG, STEP_TO_SLUG, TALLY_COST_CENTER_OPTIONS, ITEM_LEDGER_OPTIONS } from '../constants'
import {
  getVendorBuckets,
  getItemBuckets,
  getCostCenterBuckets,
  MOCK_LEDGER_OPTIONS,
  PURCHASE_LEDGER_OPTIONS,
} from '../mappingMockData'
import { ConfidenceGroup } from './ConfidenceGroup'
import type { MappingCardData } from './MappingCard'
import type { MappingVendor, MappingItem, MappingCostCenter, MappingStepId, MappingResolution, ActivePhase } from '../types'

// ─── Entity → card data normalizers ──────────────────────────────────────────

const toBillNo = (id: string) => `INV-${id.split('_')[1]}`

const vendorToCard = (v: MappingVendor): MappingCardData => ({
  entityId: v.id,
  entityName: v.name,
  billNumber: toBillNo(v.id),
  confidence: v.confidence,
  confidenceScore: v.confidenceScore,
  suggestedValue: v.suggestedLedger,
  isNew: v.isNew,
  aiReasoning: v.aiReasoning || undefined,
})

const itemToCard = (i: MappingItem): MappingCardData => ({
  entityId: i.id,
  entityName: i.name,
  billNumber: toBillNo(i.id),
  confidence: i.confidence,
  confidenceScore: i.confidenceScore,
  suggestedValue: i.suggestedPurchaseLedger,
  isNew: i.isNew,
  aiReasoning: i.aiReasoning || undefined,
  showInventoryToggle: true,
  suggestedItemLedger: i.suggestedItemLedger,
})

const costCenterToCard = (cc: MappingCostCenter): MappingCardData => ({
  entityId: cc.id,
  entityName: cc.rxName,
  rxName: cc.rxName,
  confidence: cc.confidence,
  confidenceScore: cc.confidenceScore,
  suggestedValue: cc.suggestedTallyCC,
  isNew: cc.isNew,
  aiReasoning: cc.aiReasoning || undefined,
})

// ─── Phase labels + descriptions ─────────────────────────────────────────────

const PHASE_INFO: Record<ActivePhase, { title: string; description: string }> = {
  high: {
    title: 'Ready to Sync',
    description: 'AI has matched these with high confidence. Review and approve to proceed.',
  },
  medium: {
    title: 'Needs Review',
    description: 'Lower confidence matches — check each one before confirming.',
  },
  unmatched: {
    title: 'Unmapped',
    description: 'No match found. Assign a ledger manually or skip to handle later.',
  },
}

// ─── Sub-step sequence builder ────────────────────────────────────────────────
// Builds the ordered flat list of (stepId, phase) pairs, skipping empty buckets.

type SubStep = { stepId: MappingStepId; phase: ActivePhase }
const PHASES: ActivePhase[] = ['high', 'medium', 'unmatched']

const buildSequence = (
  vb: { high: unknown[]; medium: unknown[]; unmatched: unknown[] },
  ib: { high: unknown[]; medium: unknown[]; unmatched: unknown[] },
  cb: { high: unknown[]; medium: unknown[]; unmatched: unknown[] },
): SubStep[] => {
  const buckets: Record<MappingStepId, { high: unknown[]; medium: unknown[]; unmatched: unknown[] }> = {
    vendors: vb,
    items: ib,
    costCenters: cb,
  }
  const seq: SubStep[] = []
  for (const stepId of ['vendors', 'items', 'costCenters'] as MappingStepId[]) {
    for (const phase of PHASES) {
      if (buckets[stepId][phase].length > 0) seq.push({ stepId, phase })
    }
  }
  return seq
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StepContent = () => {
  const navigate = useNavigate()
  const {
    activeStep,
    setActiveStep,
    activeSubStep,
    setActiveSubStep,
    markSubStepComplete,
    vendorResolutions,
    itemResolutions,
    costCenterResolutions,
    setVendorResolution,
    setItemResolution,
    setCostCenterResolution,
    setShowFinalCompletion,
  } = useMappingContext()

  const { setVendorLedger, setItemCategory } = useAccountingContext()

  // ─── Buckets (static mock data) ───────────────────────────────────────────

  const vendorBuckets = useMemo(() => {
    const b = getVendorBuckets()
    return { high: b.high.map(vendorToCard), medium: b.medium.map(vendorToCard), unmatched: b.unmatched.map(vendorToCard) }
  }, [])

  const itemBuckets = useMemo(() => {
    const b = getItemBuckets()
    return { high: b.high.map(itemToCard), medium: b.medium.map(itemToCard), unmatched: b.unmatched.map(itemToCard) }
  }, [])

  const ccBuckets = useMemo(() => {
    const b = getCostCenterBuckets()
    return { high: b.high.map(costCenterToCard), medium: b.medium.map(costCenterToCard), unmatched: b.unmatched.map(costCenterToCard) }
  }, [])

  // ─── Sequence + position ──────────────────────────────────────────────────

  const sequence = useMemo(
    () => buildSequence(vendorBuckets, itemBuckets, ccBuckets),
    [vendorBuckets, itemBuckets, ccBuckets]
  )

  const currentIndex = sequence.findIndex(
    (s) => s.stepId === activeStep && s.phase === activeSubStep
  )
  const isFirstSubStep = currentIndex <= 0

  // ─── Resolution helpers ───────────────────────────────────────────────────

  const makeHandlers = (
    setResolution: (id: string, r: MappingResolution) => void,
    onConfirmSideEffect?: (id: string, value: string) => void,
  ) => ({
    onConfirm: (id: string, value: string) => {
      setResolution(id, { entityId: id, status: 'confirmed', mappedTo: value })
      onConfirmSideEffect?.(id, value)
    },
    onSkip: (id: string) =>
      setResolution(id, { entityId: id, status: 'skipped', mappedTo: '' }),
    onReset: (id: string) =>
      setResolution(id, { entityId: id, status: 'pending', mappedTo: '' }),
  })

  // ─── Footer handlers ──────────────────────────────────────────────────────

  const handleNext = () => {
    // Mark current sub-step complete (drives green checkmark in sidebar)
    markSubStepComplete(activeStep, activeSubStep)

    if (currentIndex < sequence.length - 1) {
      const next = sequence[currentIndex + 1]
      setActiveStep(next.stepId)
      setActiveSubStep(next.phase)
      navigate(`/v2/accounting/map/${STEP_TO_SLUG[next.stepId]}`)
    } else {
      setShowFinalCompletion(true)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prev = sequence[currentIndex - 1]
      setActiveStep(prev.stepId)
      setActiveSubStep(prev.phase)
      navigate(`/v2/accounting/map/${STEP_TO_SLUG[prev.stepId]}`)
    }
  }

  // ─── Current phase items + handlers ──────────────────────────────────────

  const currentBuckets = activeStep === 'vendors' ? vendorBuckets
    : activeStep === 'items' ? itemBuckets
    : ccBuckets

  const currentItems = currentBuckets[activeSubStep]

  const currentResolutions = activeStep === 'vendors' ? vendorResolutions
    : activeStep === 'items' ? itemResolutions
    : costCenterResolutions

  const currentSetResolution = activeStep === 'vendors' ? setVendorResolution
    : activeStep === 'items' ? setItemResolution
    : setCostCenterResolution

  const currentSideEffect = activeStep === 'vendors'
    ? (id: string, value: string) => setVendorLedger(id, value)
    : activeStep === 'items'
      ? (id: string, value: string) => setItemCategory(id, { purchaseLedger: value, trackInventory: false })
      : undefined

  const handlers = makeHandlers(currentSetResolution, currentSideEffect)

  const dropdownLabel = activeStep === 'vendors' ? 'Tally Ledger'
    : activeStep === 'items' ? 'Purchase Ledger'
    : 'Tally Cost Center'

  const dropdownOptions = activeStep === 'vendors' ? MOCK_LEDGER_OPTIONS
    : activeStep === 'items' ? PURCHASE_LEDGER_OPTIONS
    : TALLY_COST_CENTER_OPTIONS

  const phaseInfo = PHASE_INFO[activeSubStep]
  const stepConfig = STEP_CONFIG.find((s) => s.id === activeStep)!

  return (
    <Box flex="1" display="flex" flexDirection="column" overflowY="hidden">

      {/* Header — shows current phase (sub-step) title */}
      <Box paddingX="spacing.8" paddingTop="spacing.8" paddingBottom="spacing.4" flexShrink={0}>
        <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.1">
          {stepConfig.label}
        </Text>
        <Heading size="medium" color="surface.text.gray.normal" marginBottom="spacing.1">
          {phaseInfo.title}
        </Heading>
        <Text color="surface.text.gray.muted">
          {phaseInfo.description}
        </Text>
      </Box>

      {/* Table — fills remaining height */}
      <Box flex="1" display="flex" flexDirection="column" overflow="hidden" paddingX="spacing.8" minHeight="0px">
        <ConfidenceGroup
          items={currentItems}
          resolutions={currentResolutions}
          dropdownLabel={dropdownLabel}
          dropdownOptions={dropdownOptions}
          onReset={handlers.onReset}
          showInventoryColumns={activeStep === 'items'}
          itemLedgerOptions={activeStep === 'items' ? ITEM_LEDGER_OPTIONS : undefined}
        />
      </Box>

      {/* Footer — Blade Box, sibling of padded content, full right panel width */}
      <Box
        flexShrink={0}
        borderTopColor="surface.border.gray.muted"
        borderTopWidth="thin"
        borderStyle="solid"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        paddingY="spacing.3"
        paddingX="spacing.8"
      >
        <Button variant="tertiary" onClick={() => navigate('/home')}>
          Save and Close
        </Button>
        <Box display="flex" gap="spacing.4">
          <Button variant="tertiary" isDisabled={isFirstSubStep} onClick={handlePrevious}>
            Previous
          </Button>
          <Button onClick={handleNext}>
            Next
          </Button>
        </Box>
      </Box>

    </Box>
  )
}
