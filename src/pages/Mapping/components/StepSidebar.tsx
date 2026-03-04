import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Counter,
  StepGroup,
  StepItem,
  StepItemIcon,
  StepItemIndicator,
} from '@razorpay/blade/components'
import { CheckIcon } from '@razorpay/blade/components'
import { useMappingContext } from '../../../context/MappingContext'
import { STEP_CONFIG, STEP_TO_SLUG } from '../constants'
import {
  getVendorBuckets,
  getItemBuckets,
  getCostCenterBuckets,
} from '../mappingMockData'
import type { MappingStepId, ActivePhase } from '../types'

// ─── Phase metadata ────────────────────────────────────────────────────────────

const PHASES: ActivePhase[] = ['high', 'medium', 'unmatched']

const PHASE_LABELS: Record<ActivePhase, string> = {
  high: 'Ready to Sync',
  medium: 'Needs Review',
  unmatched: 'Unmapped',
}

// ─── Bucket helpers (static — computed once at module level) ──────────────────

const RAW_VENDOR_BUCKETS = getVendorBuckets()
const RAW_ITEM_BUCKETS = getItemBuckets()
const RAW_CC_BUCKETS = getCostCenterBuckets()

const RAW_BUCKETS: Record<MappingStepId, { high: unknown[]; medium: unknown[]; unmatched: unknown[] }> = {
  vendors: RAW_VENDOR_BUCKETS,
  items: RAW_ITEM_BUCKETS,
  costCenters: RAW_CC_BUCKETS,
}

const getPhasesForStep = (stepId: MappingStepId): ActivePhase[] =>
  PHASES.filter((p) => RAW_BUCKETS[stepId][p].length > 0)

const getPhaseCount = (stepId: MappingStepId, phase: ActivePhase): number =>
  RAW_BUCKETS[stepId][phase].length

// ─── Component ─────────────────────────────────────────────────────────────────

export const StepSidebar = () => {
  const navigate = useNavigate()
  const {
    activeStep,
    setActiveStep,
    activeSubStep,
    setActiveSubStep,
    completedSubSteps,
  } = useMappingContext()

  const isSubStepComplete = (stepId: MappingStepId, phase: ActivePhase) =>
    completedSubSteps.has(`${stepId}:${phase}`)

  const isParentComplete = (stepId: MappingStepId) =>
    getPhasesForStep(stepId).every((p) => isSubStepComplete(stepId, p))

  // Build the flat element list that the outer StepGroup needs.
  // The nested StepGroup MUST be a sibling of the parent StepItem — not a child —
  // so that Blade renders the proper indented connectors between them.
  const elements: React.ReactElement[] = []

  for (const step of STEP_CONFIG) {
    const isActive = activeStep === step.id
    const isComplete = isParentComplete(step.id)
    const phases = getPhasesForStep(step.id)

    const parentMarker = isComplete
      ? <StepItemIcon icon={CheckIcon} color="positive" />
      : <StepItemIndicator color="neutral" />

    // When sub-steps are shown below, use 'full' so the connector reaches them.
    const parentProgress: 'full' | 'start' | 'none' = isComplete
      ? 'full'
      : isActive
        ? 'full'   // connector reaches the nested sub-step group
        : 'none'

    elements.push(
      <StepItem
        key={step.id}
        title={step.label}
        marker={parentMarker}
        stepProgress={parentProgress}
        isSelected={isActive && !isComplete}
        onClick={() => {
          const firstPhase = phases.find((p) => !isSubStepComplete(step.id, p)) ?? phases[0]
          setActiveStep(step.id)
          setActiveSubStep(firstPhase)
          navigate(`/v2/accounting/map/${STEP_TO_SLUG[step.id]}`)
        }}
      />
    )

    // Sub-steps — rendered as a SIBLING StepGroup, not as StepItem children.
    // This is the Blade-correct nesting pattern that produces proper connectors.
    if (isActive) {
      elements.push(
        <StepGroup key={`${step.id}-sub`} orientation="vertical" size="medium">
          {phases.map((phase) => {
            const isSubComplete = isSubStepComplete(step.id, phase)
            const isSubActive = activeSubStep === phase
            const count = getPhaseCount(step.id, phase)

            const subMarker = isSubComplete
              ? <StepItemIcon icon={CheckIcon} color="positive" />
              : isSubActive
                ? <StepItemIndicator color="primary" />
                : <StepItemIndicator color="neutral" />

            const subProgress: 'full' | 'start' | 'none' = isSubComplete
              ? 'full'
              : isSubActive
                ? 'start'
                : 'none'

            return (
              <StepItem
                key={phase}
                title={PHASE_LABELS[phase]}
                marker={subMarker}
                stepProgress={subProgress}
                isSelected={isSubActive}
                trailing={<Counter value={count} color="neutral" />}
                onClick={() => {
                  setActiveStep(step.id)
                  setActiveSubStep(phase)
                  navigate(`/v2/accounting/map/${STEP_TO_SLUG[step.id]}`)
                }}
              />
            )
          })}
        </StepGroup>
      )
    }
  }

  return (
    <StepGroup orientation="vertical" size="medium" width="100%">
      {elements}
    </StepGroup>
  )
}
