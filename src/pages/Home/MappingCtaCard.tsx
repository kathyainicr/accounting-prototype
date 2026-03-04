import { useNavigate } from 'react-router-dom'
import {
  Box,
  Text,
  Heading,
  Button,
  Badge,
  Card,
  CardBody,
  CheckCircleIcon,
  RayIcon,
} from '@razorpay/blade/components'
import { useMappingContext } from '../../context/MappingContext'
import { STEP_CONFIG } from '../Mapping/constants'
import {
  getNewVendorCount,
  getNewItemCount,
  getNewCostCenterCount,
} from '../Mapping/mappingMockData'
import type { MappingStepId, MappingResolution } from '../Mapping/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const countResolved = (res: Record<string, MappingResolution>) =>
  Object.values(res).filter((r) => r.status !== 'pending').length

// ─── Sub-state: step progress (State B) ──────────────────────────────────────

const StepProgressList = ({
  vendorResolutions,
  itemResolutions,
  costCenterResolutions,
}: {
  vendorResolutions: Record<string, MappingResolution>
  itemResolutions: Record<string, MappingResolution>
  costCenterResolutions: Record<string, MappingResolution>
}) => {
  const allRes: Record<MappingStepId, Record<string, MappingResolution>> = {
    vendors: vendorResolutions,
    items: itemResolutions,
    costCenters: costCenterResolutions,
  }

  return (
    <Box display="flex" flexDirection="column" gap="spacing.2" marginBottom="spacing.5">
      {STEP_CONFIG.map((step) => {
        const res = allRes[step.id]
        const total = Object.values(res).length
        const done = countResolved(res)
        const isComplete = done === total
        return (
          <Box key={step.id} display="flex" alignItems="center" justifyContent="space-between">
            <Text
              size="small"
              color={isComplete ? 'interactive.text.positive.normal' : 'surface.text.gray.muted'}
            >
              {step.label}
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              {done}/{total}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const MappingCtaCard = () => {
  const navigate = useNavigate()
  const { vendorResolutions, itemResolutions, costCenterResolutions } =
    useMappingContext()

  const totalNewCount =
    getNewVendorCount() + getNewItemCount() + getNewCostCenterCount()

  const hasAnyResolved =
    countResolved(vendorResolutions) +
      countResolved(itemResolutions) +
      countResolved(costCenterResolutions) >
    0

  const isWizardComplete = [
    ...Object.values(vendorResolutions),
    ...Object.values(itemResolutions),
    ...Object.values(costCenterResolutions),
  ].every((r) => r.status !== 'pending')

  const goToWizard = () => navigate('/v2/accounting/map')

  // ── State D: All done ──────────────────────────────────────────────────────
  if (isWizardComplete) {
    return (
      <Card height="100%">
        <CardBody>
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4" paddingY="spacing.4">
            <Box
              width="48px"
              height="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backgroundColor="feedback.background.positive.subtle"
              borderRadius="max"
            >
              <CheckCircleIcon color="interactive.icon.positive.normal" />
            </Box>
            <Box textAlign="center">
              <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.1">
                All items mapped!
              </Heading>
              <Text size="small" color="surface.text.gray.muted">
                Your bills are ready to sync to Tally.
              </Text>
            </Box>
            <Button isFullWidth onClick={goToWizard}>
              Sync to Tally →
            </Button>
          </Box>
        </CardBody>
      </Card>
    )
  }

  // ── State A: Fresh ─────────────────────────────────────────────────────────
  if (!hasAnyResolved) {
    return (
      <Card height="100%">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <RayIcon color="interactive.icon.primary.normal" />
              <Text size="small" color="interactive.text.primary.normal" weight="semibold">
                Map with AI
              </Text>
            </Box>
            <Heading size="small" color="surface.text.gray.normal">
              Categorise with AI
            </Heading>
            <Text size="small" color="surface.text.gray.muted">
              Map vendors, items and cost centers to Tally. Bills linked to mapped entities will be
              ready to sync.
            </Text>
            <Button isFullWidth onClick={goToWizard}>
              Get started →
            </Button>
          </Box>
        </CardBody>
      </Card>
    )
  }

  // ── State C: New items added ───────────────────────────────────────────────
  if (totalNewCount > 0) {
    return (
      <Card height="100%">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <Badge color="notice">{totalNewCount} new</Badge>
              <Text size="small" color="surface.text.gray.muted">
                items added since last session
              </Text>
            </Box>
            <Text size="small" color="surface.text.gray.muted">
              New vendors and items were added. Continue mapping to keep bills ready to sync.
            </Text>
            <Button isFullWidth onClick={goToWizard}>
              Categorise with AI →
            </Button>
          </Box>
        </CardBody>
      </Card>
    )
  }

  // ── State B: In-progress ───────────────────────────────────────────────────
  return (
    <Card height="100%">
      <CardBody>
        <Box display="flex" flexDirection="column" gap="spacing.4">
          <Box>
            <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.1">
              Mapping in progress
            </Heading>
            <Text size="small" color="surface.text.gray.muted">
              Continue where you left off.
            </Text>
          </Box>
          <StepProgressList
            vendorResolutions={vendorResolutions}
            itemResolutions={itemResolutions}
            costCenterResolutions={costCenterResolutions}
          />
          <Button isFullWidth variant="secondary" onClick={goToWizard}>
            Resume mapping ↺
          </Button>
        </Box>
      </CardBody>
    </Card>
  )
}
