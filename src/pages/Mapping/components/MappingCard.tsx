import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import {
  Box,
  Text,
  Link,
} from '@razorpay/blade/components'
import type { MappingResolution, ConfidenceTier } from '../types'

// ─── AI gradient animation ────────────────────────────────────────────────────

const gradientFlow = keyframes`
  from { background-position: 0% center }
  to { background-position: 200% center }
`

// ─── Ledger dropdown wrapper — ray icon + gradient text ───────────────────────

export const LedgerDropdownWrap = styled.div`
  position: relative;

  .ray-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
    display: flex;
    align-items: center;
    opacity: 0.6;
  }

  /* Push trigger text right to clear the icon */
  button[id^="dropdown-"] {
    padding-left: 36px !important;
  }

  /* Gradient on the selected value text */
  [data-blade-component="text"].KFujK,
  [data-blade-component="text"][class*="KFujK"] {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.45) 60%,
      rgba(255, 255, 255, 0.9) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientFlow} 3s linear infinite;
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

export type MappingCardData = {
  entityId: string
  entityName: string
  billNumber?: string
  rxName?: string
  confidence: ConfidenceTier
  confidenceScore: number
  suggestedValue: string
  isNew: boolean
  aiReasoning?: string
  showInventoryToggle?: boolean
  suggestedItemLedger?: string
}

// ─── Resolved compact row ─────────────────────────────────────────────────────

type ResolvedRowProps = {
  entityName: string
  resolution: MappingResolution
  onReset: () => void
}

export const ResolvedRow = ({ entityName, resolution, onReset }: ResolvedRowProps) => {
  const isConfirmed = resolution.status === 'confirmed'

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Box
        display="flex"
        alignItems="center"
        paddingY="spacing.3"
        borderBottomWidth="thin"
        borderStyle="solid"
        borderColor="surface.border.gray.subtle"
        gap="spacing.3"
      >
        {/* Spacer for checkbox column */}
        <Box width="36px" flexShrink={0} />

        <Box flex="1" display="flex" alignItems="center" gap="spacing.3" flexWrap="wrap">
          <Text size="small" weight="semibold" color="surface.text.gray.normal">
            {entityName}
          </Text>
          {isConfirmed ? (
            <>
              <Text size="small" color="surface.text.gray.muted">→</Text>
              <Text size="small" color="interactive.text.positive.normal" weight="medium">
                {resolution.mappedTo}
              </Text>
            </>
          ) : (
            <Text size="small" color="surface.text.gray.muted">Skipped</Text>
          )}
        </Box>

        <Link size="small" onClick={onReset}>
          {isConfirmed ? 'Edit' : 'Map it'}
        </Link>
      </Box>
    </motion.div>
  )
}
