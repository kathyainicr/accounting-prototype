import { useState } from 'react'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Box,
  Amount,
  Text,
  Link,
  Button,
  Badge,
  Divider,
  RayIcon,
  StepGroup,
  StepItem,
  StepItemIcon,
  StepItemIndicator,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@razorpay/blade/components'
import type { Bill, BillStatus } from './billsMockData'
import { STATUS_CONFIG } from './billsMockData'
import type { AIBillSuggestion, AIConfidenceTier } from './aiMockData'
import { getConfidenceTierMeta } from './aiMockData'
import { AiGradientText, getAiIconColor } from './aiStyles'

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <Text size="small" color="surface.text.gray.muted">{label}</Text>
    <Text size="medium" color="surface.text.gray.normal" weight="medium">{value}</Text>
  </>
)

const AiDetailRow = ({ label, value, confidence }: { label: string; value: string; confidence: AIConfidenceTier }) => (
  <>
    <Text size="small" color="surface.text.gray.muted">{label}</Text>
    <Box display="flex" alignItems="center" gap="spacing.2">
      <RayIcon size="small" color={getAiIconColor(confidence)} />
      <AiGradientText>{value}</AiGradientText>
    </Box>
  </>
)

const SectionHeading = ({
  title,
  linkLabel,
  showLink = false,
}: {
  title: string
  linkLabel?: string
  showLink?: boolean
}) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
    <Text size="medium" weight="semibold" color="surface.text.gray.normal">{title}</Text>
    {showLink && linkLabel && (
      <Link size="small" href="#">{linkLabel}</Link>
    )}
  </Box>
)

type TimelineStep = {
  title: string
  timestamp: string
  marker: React.ReactElement
}

const getTimelineSteps = (bill: Bill): TimelineStep[] => {
  const steps: TimelineStep[] = []

  if (bill.status === 'synced') {
    steps.push({
      title: 'Synced to Tally',
      timestamp: bill.statusTimestamp,
      marker: <StepItemIcon icon={CheckCircleIcon} color="positive" />,
    })
  } else if (bill.status === 'pending_tally_sync') {
    steps.push({
      title: 'Pending Tally sync',
      timestamp: bill.statusTimestamp,
      marker: <StepItemIcon icon={ClockIcon} color="primary" />,
    })
  } else if (bill.status === 'error_found') {
    steps.push({
      title: 'Error found',
      timestamp: bill.statusTimestamp,
      marker: <StepItemIcon icon={AlertTriangleIcon} color="negative" />,
    })
  } else if (bill.status === 'excluded') {
    steps.push({
      title: 'Bill excluded',
      timestamp: bill.statusTimestamp,
      marker: <StepItemIcon icon={TagIcon} color="neutral" />,
    })
  }

  steps.push({
    title: 'Bill added',
    timestamp: bill.createdOn,
    marker: <StepItemIndicator color="neutral" />,
  })

  return steps
}

const drawerHeaderColor = (
  status: BillStatus,
  confidenceMeta: ReturnType<typeof getConfidenceTierMeta> | null,
): 'positive' | 'information' | 'notice' | 'negative' | undefined => {
  if (confidenceMeta?.color) return confidenceMeta.color as 'positive' | 'notice' | 'negative'
  return STATUS_CONFIG[status].drawerHeaderColor
}

type Props = {
  selectedBill: Bill | null
  aiSuggestion?: AIBillSuggestion
  onClose: () => void
  onCategorise: (bill: Bill) => void
  onExclude?: (bill: Bill) => void
  isReadyToSync?: boolean
  onAccept?: (bill: Bill) => void
}

export const BillDetailDrawer = ({ selectedBill, aiSuggestion, onClose, onCategorise, onExclude, isReadyToSync, onAccept }: Props) => {
  const [showMore, setShowMore] = useState(false)

  const bill = selectedBill
  const isOpen = bill !== null
  const config = bill ? STATUS_CONFIG[bill.status] : null
  const confidenceMeta = aiSuggestion ? getConfidenceTierMeta(aiSuggestion.confidence) : null

  const timelineSteps = bill ? getTimelineSteps(bill) : []
  const hasMoreSteps = timelineSteps.length > 1
  const visibleSteps = showMore ? timelineSteps : [timelineSteps[0]]

  return (
    <Drawer
      isOpen={isOpen}
      onDismiss={onClose}
      accessibilityLabel={bill ? `Bill details for ${bill.vendor}` : 'Bill details'}
    >
      <DrawerHeader
        title={bill?.vendor ?? ''}
        color={bill && config ? drawerHeaderColor(bill.status, confidenceMeta) : undefined}
      >
        <Box>
          {bill && config && (
            <>
              <Box marginTop="spacing.5" textAlign="center">
                <Amount
                  value={bill.amount}
                  size="2xlarge"
                  type="heading"
                  currency="INR"
                  weight="semibold"
                  suffix="decimals"
                />
              </Box>

              <Box display="flex" justifyContent="center" marginTop="spacing.4">
                <Badge
                  color={config.badgeColor}
                  icon={config.badgeIcon}
                  size="medium"
                  emphasis="subtle"
                >
                  {config.label}
                </Badge>
              </Box>

              {confidenceMeta && (
                <Box display="flex" justifyContent="center" marginTop="spacing.3">
                  <Badge color={confidenceMeta.color} icon={RayIcon} size="small">
                    {`${confidenceMeta.label} confidence`}
                  </Badge>
                </Box>
              )}

{bill.statusDescription && (
                <Text
                  size="small"
                  color="surface.text.gray.muted"
                  textAlign="center"
                  marginTop="spacing.2"
                  marginX="spacing.4"
                >
                  {bill.statusDescription}
                </Text>
              )}
            </>
          )}
        </Box>
      </DrawerHeader>

      <DrawerBody>
        {bill && config && (
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

            <Divider variant="subtle" dividerStyle="dashed" />

            <Box marginTop="spacing.7">
              <SectionHeading
                title="Tally Details"
                linkLabel="Edit"
                showLink={bill.status === 'synced'}
              />

              <Box
                display="grid"
                gridTemplateColumns="160px 1fr"
                gap="spacing.3"
                marginBottom="spacing.4"
              >
                <DetailRow label="Type" value={bill.tallyDetails.type} />

                {aiSuggestion?.suggestedVendorLedger
                  ? <AiDetailRow label="Vendor Ledger" value={aiSuggestion.suggestedVendorLedger} confidence={aiSuggestion.confidence} />
                  : <DetailRow label="Vendor Ledger" value={bill.tallyDetails.vendorLedger} />
                }

                {aiSuggestion?.suggestedItemLedger
                  ? <AiDetailRow label="Item Ledgers" value={aiSuggestion.suggestedItemLedger} confidence={aiSuggestion.confidence} />
                  : <DetailRow label="Item Ledgers" value={bill.tallyDetails.itemLedgers ?? 'Add +'} />
                }

                <DetailRow label="TDS Ledger" value={bill.tallyDetails.tdsLedger} />

                {aiSuggestion?.suggestedCostCenter
                  ? <AiDetailRow label="Cost Center" value={aiSuggestion.suggestedCostCenter} confidence={aiSuggestion.confidence} />
                  : <DetailRow label="Cost Center" value={bill.tallyDetails.costCenter ?? '--'} />
                }

                <DetailRow label="Invoice Type" value={bill.tallyDetails.invoiceType} />
                <DetailRow label="Posting Date" value={bill.tallyDetails.postingDate} />
              </Box>
            </Box>

            <Divider variant="subtle" dividerStyle="dashed" marginY="spacing.6" />

            <SectionHeading title="Vendor Payment" linkLabel="View →" showLink />

            <Box marginBottom="spacing.5">
              <Badge
                color={bill.vendorPayment.paymentStatus === 'UNPAID' ? 'negative' : 'positive'}
                emphasis="subtle"
              >
                {bill.vendorPayment.paymentStatus}
              </Badge>
            </Box>

            <Box display="grid" gridTemplateColumns="160px 1fr" gap="spacing.3">
              <DetailRow label="Invoice Date" value={bill.vendorPayment.invoiceDate} />
              <DetailRow label="Due Date" value={bill.vendorPayment.dueDate} />
              <DetailRow label="Invoice No." value={bill.vendorPayment.invoiceNo} />
              {bill.vendorPayment.description && (
                <DetailRow label="Description" value={bill.vendorPayment.description} />
              )}
            </Box>
          </>
        )}
      </DrawerBody>

      {bill && isReadyToSync && (
        <DrawerFooter>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Button variant="primary" isFullWidth onClick={() => onAccept?.(bill)}>
              Sync to Tally
            </Button>
            <Button variant="secondary" isFullWidth onClick={() => onCategorise(bill)}>
              Review
            </Button>
            <Box display="flex" justifyContent="center">
              <Link variant="button" color="negative" onClick={() => onExclude?.(bill)}>
                Exclude bill
              </Link>
            </Box>
          </Box>
        </DrawerFooter>
      )}

      {bill && config && !isReadyToSync && (config.actionType === 'categorise' || config.actionType === 'error_found') && (
        <DrawerFooter>
          {config.actionType === 'categorise' && aiSuggestion ? (
            <Box display="flex" flexDirection="column" gap="spacing.4">
              <Button variant="primary" isFullWidth onClick={() => onCategorise(bill)}>Review categorisation</Button>
              <Box display="flex" justifyContent="center">
                <Link variant="button" color="negative" onClick={() => onExclude?.(bill)}>Exclude bill</Link>
              </Box>
            </Box>
          ) : config.actionType === 'categorise' ? (
            <Box display="flex" flexDirection="column" gap="spacing.4">
              <Button variant="primary" isFullWidth onClick={() => onCategorise(bill)}>Categorise</Button>
              <Box display="flex" justifyContent="center">
                <Link variant="button" color="negative" onClick={() => onExclude?.(bill)}>Exclude bill</Link>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap="spacing.4">
              <Button variant="primary" isFullWidth onClick={() => {}}>Retry Sync</Button>
              <Box display="flex" justifyContent="center">
                <Link variant="button" color="negative" onClick={() => {}}>Exclude bill</Link>
              </Box>
            </Box>
          )}
        </DrawerFooter>
      )}
    </Drawer>
  )
}
