export type MappingStepId = 'vendors' | 'items' | 'costCenters'

export type ActivePhase = 'high' | 'medium' | 'unmatched'

export type ResolutionStatus = 'pending' | 'confirmed' | 'skipped'

export type MappingResolution = {
  entityId: string
  status: ResolutionStatus
  mappedTo: string   // '' when pending or skipped
}

export type ConfidenceTier = 'high' | 'medium' | 'none'

export type MappingVendor = {
  id: string
  name: string
  gstin: string | null
  confidence: ConfidenceTier
  confidenceScore: number   // 0 if none
  suggestedLedger: string   // '' if none
  aiReasoning: string
  isNew: boolean
}

export type MappingItem = {
  id: string
  name: string
  type: 'Item' | 'Service'
  hsnSac: string | null
  confidence: ConfidenceTier
  confidenceScore: number
  suggestedPurchaseLedger: string
  suggestedItemLedger: string   // suggested stock item ledger (for inventory tracking)
  aiReasoning: string
  isNew: boolean
}

export type MappingCostCenter = {
  id: string
  rxName: string           // name in RazorpayX
  confidence: ConfidenceTier
  confidenceScore: number
  suggestedTallyCC: string
  aiReasoning: string
  isNew: boolean
}

export type MappingContextValue = {
  activeStep: MappingStepId
  setActiveStep: (step: MappingStepId) => void
  activeSubStep: ActivePhase
  setActiveSubStep: (phase: ActivePhase) => void

  completedSubSteps: Set<string>
  markSubStepComplete: (stepId: MappingStepId, phase: ActivePhase) => void

  vendorResolutions: Record<string, MappingResolution>
  itemResolutions: Record<string, MappingResolution>
  costCenterResolutions: Record<string, MappingResolution>

  setVendorResolution: (id: string, resolution: MappingResolution) => void
  setItemResolution: (id: string, resolution: MappingResolution) => void
  setCostCenterResolution: (id: string, resolution: MappingResolution) => void

  showFinalCompletion: boolean
  setShowFinalCompletion: (show: boolean) => void
}
