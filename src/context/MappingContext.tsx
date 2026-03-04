import { createContext, useContext, useState } from 'react'
import {
  MAPPING_VENDORS,
  MAPPING_ITEMS,
  MAPPING_COST_CENTERS,
} from '../pages/Mapping/mappingMockData'
import type {
  MappingStepId,
  ActivePhase,
  MappingResolution,
  MappingContextValue,
} from '../pages/Mapping/types'

// ─── Context ──────────────────────────────────────────────────────────────────

const MappingContext = createContext<MappingContextValue | null>(null)

export const useMappingContext = (): MappingContextValue => {
  const ctx = useContext(MappingContext)
  if (!ctx) throw new Error('useMappingContext must be used inside MappingProvider')
  return ctx
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

const buildInitialResolutions = <T extends { id: string }>(
  items: T[],
): Record<string, MappingResolution> => {
  const result: Record<string, MappingResolution> = {}
  items.forEach((item) => {
    result[item.id] = { entityId: item.id, status: 'pending', mappedTo: '' }
  })
  return result
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const MappingProvider = ({ children }: { children: React.ReactNode }) => {
  // Current position in the wizard
  const [activeStep, setActiveStep] = useState<MappingStepId>('vendors')
  const [activeSubStep, setActiveSubStep] = useState<ActivePhase>('high')

  // Tracks which sub-steps the user has "Next'd" past — drives sidebar green checkmarks.
  // Keys are `${stepId}:${phase}` e.g. "vendors:high"
  const [completedSubSteps, setCompletedSubSteps] = useState<Set<string>>(new Set())

  const markSubStepComplete = (stepId: MappingStepId, phase: ActivePhase) => {
    setCompletedSubSteps((prev) => new Set([...prev, `${stepId}:${phase}`]))
  }

  // Per-item resolution state
  const [vendorResolutions, setVendorResolutions] = useState<Record<string, MappingResolution>>(
    () => buildInitialResolutions(MAPPING_VENDORS),
  )
  const [itemResolutions, setItemResolutions] = useState<Record<string, MappingResolution>>(
    () => buildInitialResolutions(MAPPING_ITEMS),
  )
  const [costCenterResolutions, setCostCenterResolutions] = useState<
    Record<string, MappingResolution>
  >(() => buildInitialResolutions(MAPPING_COST_CENTERS))

  const [showFinalCompletion, setShowFinalCompletion] = useState(false)

  // ─── Resolution setters ───────────────────────────────────────────────────

  const setVendorResolution = (id: string, resolution: MappingResolution) => {
    setVendorResolutions((prev) => ({ ...prev, [id]: resolution }))
  }

  const setItemResolution = (id: string, resolution: MappingResolution) => {
    setItemResolutions((prev) => ({ ...prev, [id]: resolution }))
  }

  const setCostCenterResolution = (id: string, resolution: MappingResolution) => {
    setCostCenterResolutions((prev) => ({ ...prev, [id]: resolution }))
  }

  return (
    <MappingContext.Provider
      value={{
        activeStep,
        setActiveStep,
        activeSubStep,
        setActiveSubStep,
        completedSubSteps,
        markSubStepComplete,
        vendorResolutions,
        itemResolutions,
        costCenterResolutions,
        setVendorResolution,
        setItemResolution,
        setCostCenterResolution,
        showFinalCompletion,
        setShowFinalCompletion,
      }}
    >
      {children}
    </MappingContext.Provider>
  )
}
