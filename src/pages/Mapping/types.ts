// ─── Step identifiers ─────────────────────────────────────────────────────────

export type MappingStepId = 'vendors' | 'items' | 'costCenters'

// ─── Confidence phase (maps to the 3 buckets: Ready to Sync / Needs Review / Unmapped) ──

export type ActivePhase = 'high' | 'medium' | 'unmatched'

// ─── Per-item resolution ──────────────────────────────────────────────────────

export type ResolutionStatus = 'pending' | 'confirmed' | 'skipped'

export type MappingResolution = {
  entityId: string
  status: ResolutionStatus
  mappedTo: string   // '' when pending or skipped
}

// ─── Confidence bucket ────────────────────────────────────────────────────────

export type ConfidenceTier = 'high' | 'medium' | 'none'

// ─── Shared entity shape for mapping cards ────────────────────────────────────

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

// ─── Context value ────────────────────────────────────────────────────────────

export type MappingContextValue = {
  // Current position in the wizard
  activeStep: MappingStepId
  setActiveStep: (step: MappingStepId) => void
  activeSubStep: ActivePhase
  setActiveSubStep: (phase: ActivePhase) => void

  // Tracks which sub-steps the user has "Next'd" past — drives sidebar green checkmarks
  completedSubSteps: Set<string>    // keys are `${stepId}:${phase}`
  markSubStepComplete: (stepId: MappingStepId, phase: ActivePhase) => void

  // Per-item resolution state
  vendorResolutions: Record<string, MappingResolution>
  itemResolutions: Record<string, MappingResolution>
  costCenterResolutions: Record<string, MappingResolution>

  setVendorResolution: (id: string, resolution: MappingResolution) => void
  setItemResolution: (id: string, resolution: MappingResolution) => void
  setCostCenterResolution: (id: string, resolution: MappingResolution) => void

  // Final completion overlay
  showFinalCompletion: boolean
  setShowFinalCompletion: (show: boolean) => void
}
