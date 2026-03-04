import { useState } from 'react'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Box,
  Text,
  Link,
  Button,
  Divider,
  Badge,
  ExternalLinkIcon,
  StepGroup,
  StepItem,
  StepItemIcon,
  StepItemIndicator,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from '@razorpay/blade/components'
import type { Vendor, VendorStatus } from './vendorMockData'
import { MOCK_LEDGER_OPTIONS, VENDOR_STATUS_CONFIG } from './vendorMockData'
import { useAccountingContext } from '../../../context/AccountingContext'
import { LedgerDropdown } from '../../../components/LedgerDropdown'

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <Box display="flex" flexDirection="column" gap="spacing.1" marginBottom="spacing.4">
    <Text size="small" color="surface.text.gray.muted">{label}</Text>
    <Text size="medium" color="surface.text.gray.normal" weight="medium">{value}</Text>
  </Box>
)

const SectionHeading = ({
  title,
  linkLabel,
  linkIcon,
  showLink = false,
}: {
  title: string
  linkLabel?: string
  linkIcon?: React.ComponentType
  showLink?: boolean
}) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
    <Text size="medium" weight="semibold" color="surface.text.gray.normal">{title}</Text>
    {showLink && linkLabel && (
      <Link size="small" href="#" icon={linkIcon} iconPosition="right">{linkLabel}</Link>
    )}
  </Box>
)

type TimelineStep = {
  title: string
  timestamp: string
  marker: React.ReactElement
}

const getTimelineSteps = (vendor: Vendor, runtimeStatus: VendorStatus): TimelineStep[] => {
  const steps: TimelineStep[] = []

  if (runtimeStatus === 'synced') {
    steps.push({
      title: 'Synced to Tally',
      timestamp: vendor.statusTimestamp,
      marker: <StepItemIcon icon={CheckCircleIcon} color="positive" />,
    })
  } else if (runtimeStatus === 'pending_tally_sync') {
    steps.push({
      title: 'Pending Tally sync',
      timestamp: vendor.statusTimestamp,
      marker: <StepItemIcon icon={ClockIcon} color="primary" />,
    })
  }

  steps.push({
    title: 'Vendor added',
    timestamp: vendor.createdOn,
    marker: <StepItemIndicator color="neutral" />,
  })

  return steps
}


type Props = {
  selectedVendor: Vendor | null
  onClose: () => void
}

export const VendorDetailDrawer = ({ selectedVendor, onClose }: Props) => {
  const {
    vendorLedgers,
    pendingVendorLedgers,
    setPendingVendorLedger,
    pendingVendorSyncs,
    addPendingVendorSync,
  } = useAccountingContext()

  const [showMore, setShowMore] = useState(false)

  const vendor = selectedVendor
  const isOpen = vendor !== null

  const runtimeStatus: VendorStatus = vendor
    ? vendorLedgers[vendor.id] ? 'synced'
      : pendingVendorSyncs.has(vendor.id) ? 'pending_tally_sync'
        : 'categorise'
    : 'categorise'

  const syncedLedger = vendor ? vendorLedgers[vendor.id] ?? vendor.vendorLedger : undefined
  const pendingLedger = vendor ? pendingVendorLedgers[vendor.id] ?? '' : ''

  const ledgerVariant = (() => {
    if (pendingLedger && pendingLedger === vendor?.aiSuggestedLedger) return 'ai-approved'
    if (pendingLedger) return 'manual'
    if (vendor?.aiSuggestedLedger) return 'ai'
    return 'empty'
  })()

  const effectiveLedger = pendingLedger || vendor?.aiSuggestedLedger || ''

  const handleSaveAndSync = () => {
    if (!vendor || !effectiveLedger) return
    if (!pendingLedger && vendor.aiSuggestedLedger) {
      setPendingVendorLedger(vendor.id, vendor.aiSuggestedLedger)
    }
    addPendingVendorSync(vendor.id)
    onClose()
  }

  const timelineSteps = vendor ? getTimelineSteps(vendor, runtimeStatus) : []
  const hasMoreSteps = timelineSteps.length > 1
  const visibleSteps = showMore ? timelineSteps : [timelineSteps[0]]

  return (
    <Drawer
      isOpen={isOpen}
      onDismiss={onClose}
      accessibilityLabel={vendor ? `Vendor details for ${vendor.name}` : 'Vendor details'}
    >
      <DrawerHeader
        title={vendor?.name ?? ''}
        titleSuffix={vendor ? (
          <Badge
            color={VENDOR_STATUS_CONFIG[runtimeStatus].badgeColor}
            icon={VENDOR_STATUS_CONFIG[runtimeStatus].badgeIcon}
          >
            {VENDOR_STATUS_CONFIG[runtimeStatus].label}
          </Badge>
        ) : undefined}
        color={vendor ? VENDOR_STATUS_CONFIG[runtimeStatus].drawerHeaderColor : undefined}
      />

      <DrawerBody>
        {vendor && (
          <>
            <Box marginBottom="spacing.4">
              <SectionHeading title="Timeline" />
              <StepGroup orientation="vertical" size="medium">
                {visibleSteps.map((step, index) => (
                  <StepItem
                    key={step.title}
                    title={step.title}
                    timestamp={step.timestamp}
                    stepProgress={index < visibleSteps.length - 1 ? 'full' : 'none'}
                    marker={step.marker}
                  />
                ))}
              </StepGroup>

              {hasMoreSteps && (
                <Box>
                  <Link
                    size="medium"
                    onClick={() => setShowMore((v) => !v)}
                    icon={showMore ? ChevronUpIcon : ChevronDownIcon}
                    iconPosition="right"
                  >
                    {showMore ? 'Show less' : 'Show more'}
                  </Link>
                </Box>
              )}
            </Box>

            <Divider variant='subtle' dividerStyle='dashed'/>

            <Box marginTop="spacing.7">
              <SectionHeading
                title="Tally Details"
                linkLabel="Edit"
                showLink={runtimeStatus === 'synced'}
              />

              <Box marginBottom="spacing.7">
                {runtimeStatus === 'categorise' ? (
                  <LedgerDropdown
                    isDrawer
                    label="Vendor ledger"
                    necessityIndicator="required"
                    variant={ledgerVariant}
                    value={pendingLedger || vendor.aiSuggestedLedger || ''}
                    options={MOCK_LEDGER_OPTIONS}
                    aiSuggestedValue={vendor.aiSuggestedLedger}
                    onChange={(val) => setPendingVendorLedger(vendor.id, val)}
                  />
                ) : (
                  <Box display="flex" flexDirection="column" gap="spacing.1">
                    <Text size="small" color="surface.text.gray.muted">Vendor ledger</Text>
                    <Text size="medium" color="surface.text.gray.normal" weight="medium">
                      {runtimeStatus === 'pending_tally_sync' ? pendingLedger : (syncedLedger ?? '--')}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider variant='subtle' dividerStyle='dashed'/>

            <Box marginTop="spacing.7">
              <SectionHeading
                title="Vendor Details"
                linkLabel="View"
                linkIcon={ExternalLinkIcon}
                showLink
              />
              <DetailRow label="GSTIN" value={vendor.gstin ?? '--'} />
              <DetailRow label="PAN" value={vendor.pan ?? '--'} />
            </Box>
          </>
        )}
      </DrawerBody>

      {vendor && runtimeStatus === 'categorise' && (
        <DrawerFooter>
          <Button
            variant="primary"
            isFullWidth
            isDisabled={!effectiveLedger}
            onClick={handleSaveAndSync}
          >
            Save and sync
          </Button>
        </DrawerFooter>
      )}
    </Drawer>
  )
}
