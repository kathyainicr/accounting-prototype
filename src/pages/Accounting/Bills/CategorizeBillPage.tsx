import { useNavigate } from 'react-router-dom'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Heading,
  Text,
  Amount,
  Alert,
  Link,
  Divider,
  Button,
  Badge,
  Dropdown,
  DropdownOverlay,
  SelectInput,
  ActionList,
  ActionListItem,
  CheckCircleIcon,
  AlertTriangleIcon,
  ZapIcon,
  RayIcon,
} from '@razorpay/blade/components'
import type { Bill } from './billsMockData'
import { MOCK_VENDORS, COST_CENTER_OPTIONS } from '../Vendor/vendorMockData'
import { useAccountingContext } from '../../../context/AccountingContext'
import type { AIBillSuggestion, AIConfidenceTier } from './aiMockData'
import { getConfidenceTierMeta } from './aiMockData'
import { AiGradientText, getAiIconColor } from './aiStyles'

const MappingRow = ({
  resolved,
  label,
  resolvedValue,
  missingMessage,
  linkLabel,
  onLinkClick,
  children,
  aiConfidence,
}: {
  resolved: boolean
  label: string
  resolvedValue?: string
  missingMessage?: string
  linkLabel?: string
  onLinkClick?: () => void
  children?: React.ReactNode
  aiConfidence?: AIConfidenceTier
}) => (
  <Box paddingY="spacing.5">
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="spacing.4">
      <Box display="flex" alignItems="center" gap="spacing.3" flex="1">
        {resolved ? (
          aiConfidence
            ? <RayIcon size="medium" color={getAiIconColor(aiConfidence)} />
            : <CheckCircleIcon color="feedback.icon.positive.intense" size="medium" />
        ) : (
          <AlertTriangleIcon color="feedback.icon.notice.intense" size="medium" />
        )}
        <Text size="medium" color="surface.text.gray.normal" weight="medium">
          {label}
        </Text>
      </Box>

      <Box textAlign="right">
        {resolved ? (
          <Box display="flex" alignItems="center" gap="spacing.2">
            {aiConfidence && <RayIcon size="small" color={getAiIconColor(aiConfidence)} />}
            {aiConfidence
              ? <AiGradientText>{resolvedValue}</AiGradientText>
              : <Text size="medium" color="surface.text.gray.normal" weight="semibold">{resolvedValue}</Text>
            }
          </Box>
        ) : (
          <Text size="medium" color="feedback.text.notice.intense" weight="semibold">
            Missing
          </Text>
        )}
      </Box>
    </Box>

    {!resolved && (
      <Box marginLeft="spacing.8" marginTop="spacing.2">
        {missingMessage && (
          <Text size="small" color="surface.text.gray.muted">
            {missingMessage}
          </Text>
        )}
        {linkLabel && onLinkClick && (
          <Box marginTop="spacing.1">
            <Link size="small" onClick={onLinkClick}>
              {linkLabel}
            </Link>
          </Box>
        )}
        {children}
      </Box>
    )}
  </Box>
)

const CostCenterMappingRow = ({
  rxValue,
  tallyValue,
  isResolved,
  onSelect,
  aiConfidence,
}: {
  rxValue: string | null
  tallyValue: string | undefined
  isResolved: boolean
  onSelect: (value: string) => void
  aiConfidence?: AIConfidenceTier
}) => (
  <Box paddingY="spacing.5">
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="spacing.4">
      <Box display="flex" alignItems="center" gap="spacing.3">
        {isResolved ? (
          aiConfidence
            ? <RayIcon size="medium" color={getAiIconColor(aiConfidence)} />
            : <CheckCircleIcon color="feedback.icon.positive.intense" size="medium" />
        ) : (
          <AlertTriangleIcon color="feedback.icon.notice.intense" size="medium" />
        )}
        <Text size="medium" color="surface.text.gray.normal" weight="medium">
          Cost Center
        </Text>
      </Box>
      {isResolved && (
        <Text size="medium" color="surface.text.gray.normal" weight="semibold">
          {tallyValue}
        </Text>
      )}
      {!isResolved && (
        <Text size="medium" color="feedback.text.notice.intense" weight="semibold">
          Missing
        </Text>
      )}
    </Box>

    <Box
      marginTop="spacing.3"
      display="flex"
      gap="spacing.0"
      borderWidth="thinner"
      borderStyle="solid"
      borderColor="surface.border.gray.subtle"
      borderRadius="medium"
      overflow="hidden"
    >
      <Box
        flex="1"
        padding="spacing.4"
        backgroundColor="surface.background.gray.subtle"
        borderRightWidth="thinner"
        borderRightStyle="solid"
        borderRightColor="surface.border.gray.subtle"
      >
        <Text size="xsmall" color="surface.text.gray.muted" marginBottom="spacing.2">
          RazorpayX
        </Text>
        <Badge color="neutral" size="medium">
          {rxValue || '--'}
        </Badge>
      </Box>

      <Box flex="1" padding="spacing.4" backgroundColor="surface.background.gray.moderate">
        <Text size="xsmall" color="surface.text.gray.muted" marginBottom="spacing.2">
          Tally Cost Center
        </Text>
        {isResolved ? (
          <Box display="flex" alignItems="center" gap="spacing.2">
            {aiConfidence && <RayIcon size="small" color={getAiIconColor(aiConfidence)} />}
            {aiConfidence
              ? <AiGradientText>{tallyValue}</AiGradientText>
              : <Text size="medium" color="surface.text.gray.normal" weight="semibold">{tallyValue}</Text>
            }
          </Box>
        ) : (
          <Dropdown selectionType="single">
            <SelectInput
              label=""
              accessibilityLabel="Choose Tally cost center"
              placeholder="Choose cost center"
              onChange={({ values }) => {
                if (values[0]) onSelect(values[0])
              }}
              size="medium"
            />
            <DropdownOverlay>
              <ActionList>
                {COST_CENTER_OPTIONS.map((opt) => (
                  <ActionListItem key={opt} title={opt} value={opt} />
                ))}
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        )}
      </Box>
    </Box>
  </Box>
)

type Props = {
  bill: Bill | null
  isOpen: boolean
  onClose: () => void
  onSave?: (bill: Bill) => void
  aiSuggestion?: AIBillSuggestion
}

export const CategorizeBillModal = ({ bill, isOpen, onClose, onSave, aiSuggestion }: Props) => {
  const navigate = useNavigate()
  const { vendorLedgers, costCenters, setCostCenter, itemCategories } = useAccountingContext()

  const vendor = bill ? MOCK_VENDORS.find((v) => v.id === bill.vendorId) : null

  const contextVendorLedger = bill ? vendorLedgers[bill.vendorId] : ''
  const contextItemResolved = bill ? bill.items.every((item) => !!itemCategories[item.itemId]?.purchaseLedger) : false
  const contextCostCenter = bill ? costCenters[bill.id] : undefined

  const resolvedVendorLedger = contextVendorLedger || aiSuggestion?.suggestedVendorLedger || ''
  const resolvedItemLedger = contextItemResolved ? '' : (aiSuggestion?.suggestedItemLedger ?? '')
  const resolvedTallyCostCenter = contextCostCenter || aiSuggestion?.suggestedCostCenter

  const vendorResolved = !!resolvedVendorLedger
  const itemResolved = contextItemResolved || !!resolvedItemLedger
  const costCenterResolved = !!resolvedTallyCostCenter

  const missingCount = [!vendorResolved, !itemResolved, !costCenterResolved].filter(Boolean).length

  const rxCostCenter = aiSuggestion?.suggestedCostCenter || bill?.tallyDetails.costCenter || null

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} size="full" accessibilityLabel="Categorise bill">
      <ModalHeader title="Categorise bill" />

      <ModalBody padding="spacing.6">
        {bill && (
          <Box
            display="flex"
            flexDirection="row"
            gap="spacing.5"
            width="75%"
            justifyContent="center"
            alignItems="flex-start"
            height="calc(100vh - 180px)"
            margin="auto"
          >
            <Box
              flex="1"
              padding="spacing.6"
              borderWidth="thinner"
              borderStyle="solid"
              borderColor="surface.border.gray.subtle"
              borderRadius="large"
              overflowY="auto"
              backgroundColor="surface.background.gray.moderate"
            >
              <Box marginBottom="spacing.5">
                <Heading size="medium" color="surface.text.gray.normal" weight="regular">
                  Bill# {bill.billNumber}
                </Heading>
                <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
                  Added on {bill.createdOn}
                </Text>
              </Box>

              <Divider variant="subtle" />

              <Box marginY="spacing.5">
                <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.2">
                  Vendor
                </Text>
                <Heading size="small" color="surface.text.gray.normal" weight="semibold">
                  {vendor?.name ?? bill.vendor}
                </Heading>
              </Box>

              <Box marginBottom="spacing.6">
                <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.2">
                  Items
                </Text>
                <Box
                  borderWidth="thinner"
                  borderStyle="solid"
                  borderColor="surface.border.gray.subtle"
                  borderRadius="medium"
                  overflow="hidden"
                >
                  {bill.items.map((item, idx) => (
                    <Box key={item.itemId}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingX="spacing.4"
                        paddingY="spacing.3"
                        backgroundColor={
                          idx % 2 === 0
                            ? 'surface.background.gray.moderate'
                            : 'surface.background.gray.subtle'
                        }
                      >
                        <Text size="medium" color="surface.text.gray.normal">
                          {item.itemName} · x{item.quantity}
                        </Text>
                        <Text size="medium" color="surface.text.gray.normal" weight="semibold">
                          ₹{item.price.toLocaleString('en-IN')}
                        </Text>
                      </Box>
                      {idx < bill.items.length - 1 && <Divider variant="subtle" />}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider variant="subtle" />

              <Box marginY="spacing.5">
                <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.2">
                  Amount
                </Text>
                <Amount value={bill.amount} size="large" type="heading" currency="INR" weight='semibold' />
              </Box>

              <Divider variant="subtle" />
              <Box marginTop="spacing.5">
                <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.1">
                  Cost Center
                </Text>
                <Heading size="small" color="surface.text.gray.normal" weight="semibold">
                  {rxCostCenter ?? '--'}
                </Heading>
              </Box>
            </Box>

            <Box
              flex="1"
              padding="spacing.6"
              borderWidth="thinner"
              borderStyle="solid"
              borderColor="surface.border.gray.subtle"
              borderRadius="large"
              overflowY="auto"
              backgroundColor="surface.background.gray.moderate"
            >
              {aiSuggestion && (
                <Box display="flex" alignItems="center" gap="spacing.5" marginBottom="spacing.4">
                  <Box display="flex" alignItems="center" gap="spacing.3">
                    <RayIcon size="large" color={getAiIconColor(aiSuggestion.confidence)} />
                    <Heading size="medium" color="surface.text.gray.muted">Filled by Ray AI</Heading>
                  </Box>
                  <Badge color={getConfidenceTierMeta(aiSuggestion.confidence).color} size="medium">
                    {({ high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' } as Record<string, string>)[aiSuggestion.confidence]}
                  </Badge>
                </Box>
              )}

              {missingCount > 0 ? (
                <Alert
                  description={`${missingCount} mapping${missingCount > 1 ? 's' : ''} missing`}
                  color="notice"
                  isDismissible={false}
                  isFullWidth
                  marginBottom="spacing.6"
                />
              ) : (
                <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.6">
                  Verify the details before proceeding.
                </Text>
              )}

              <MappingRow
                resolved={vendorResolved}
                label="Vendor Ledger"
                resolvedValue={resolvedVendorLedger}
                aiConfidence={!contextVendorLedger && aiSuggestion?.suggestedVendorLedger ? aiSuggestion.confidence : undefined}
                missingMessage="Vendor mapping is editable only through vendor settings"
                linkLabel="Go to Vendors →"
                onLinkClick={() => {
                  onClose()
                  navigate('/v1/accounting/vendor')
                }}
              />
              <Divider variant="muted" />

              <MappingRow
                resolved={itemResolved}
                label="Item Ledger"
                resolvedValue={contextItemResolved ? undefined : resolvedItemLedger}
                aiConfidence={!contextItemResolved && aiSuggestion?.suggestedItemLedger ? aiSuggestion.confidence : undefined}
                missingMessage="Item mapping is editable only through item settings"
                linkLabel="Go to Items →"
                onLinkClick={() => {
                  if (!bill) return
                  onClose()
                  const firstUncategorised =
                    bill.items.find((i) => !itemCategories[i.itemId]?.purchaseLedger) ??
                    bill.items[0]
                  navigate(
                    `/v1/accounting/items?itemId=${firstUncategorised.itemId}&billId=${bill.id}`,
                  )
                }}
              />
              <Divider variant="muted" />

              <MappingRow resolved label="GST Ledger" resolvedValue={bill.gstLedger} />
              <Divider variant="muted" />

              <CostCenterMappingRow
                rxValue={rxCostCenter}
                tallyValue={resolvedTallyCostCenter}
                isResolved={costCenterResolved}
                aiConfidence={!contextCostCenter && aiSuggestion?.suggestedCostCenter ? aiSuggestion.confidence : undefined}
                onSelect={(value) => setCostCenter(bill.id, value)}
              />
              <Divider variant="muted" />

              <MappingRow resolved label="Posting Date" resolvedValue={bill.postingDate} />
            </Box>
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        <Box display="flex" alignItems="center" gap="spacing.3" width="100%">
          <ZapIcon color="feedback.icon.notice.intense" size="small" />
          <Box flex="1">
            <Text size="small" color="surface.text.gray.muted">
              This mapping will be applied for current &amp; future bills
            </Text>
          </Box>
          <Button variant="tertiary" onClick={onClose}>
            Skip
          </Button>
          <Button variant="primary" onClick={() => bill && onSave?.(bill)}>
            Categorise
          </Button>
        </Box>
      </ModalFooter>
    </Modal>
  )
}

export default CategorizeBillModal
