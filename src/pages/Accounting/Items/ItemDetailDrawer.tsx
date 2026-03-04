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
  Switch,
  StepGroup,
  StepItem,
  StepItemIcon,
  StepItemIndicator,
  SettlementsIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from '@razorpay/blade/components'
import type { Item, ItemStatus } from './itemsMockData'
import { PURCHASE_LEDGER_OPTIONS, ITEM_LEDGER_OPTIONS, ITEM_STATUS_CONFIG } from './itemsMockData'
import { useAccountingContext } from '../../../context/AccountingContext'
import { LedgerDropdown } from '../../../components/LedgerDropdown'
import type { LedgerDropdownVariant } from '../../../components/LedgerDropdown'

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

const getTimelineSteps = (item: Item, runtimeStatus: ItemStatus): TimelineStep[] => {
  const steps: TimelineStep[] = []

  if (runtimeStatus === 'synced') {
    steps.push({
      title: 'Synced to Tally',
      timestamp: item.statusTimestamp,
      marker: <StepItemIcon icon={SettlementsIcon} color="positive" />,
    })
  } else if (runtimeStatus === 'pending_tally_sync') {
    steps.push({
      title: 'Pending Tally sync',
      timestamp: item.statusTimestamp,
      marker: <StepItemIcon icon={ClockIcon} color="primary" />,
    })
  }

  steps.push({
    title: 'Item added',
    timestamp: item.createdOn,
    marker: <StepItemIndicator color="neutral" />,
  })

  return steps
}


type Props = {
  selectedItem: Item | null
  onClose: () => void
}

export const ItemDetailDrawer = ({ selectedItem, onClose }: Props) => {
  const {
    itemCategories,
    setItemCategory,
    pendingItemPurchaseLedgers,
    setPendingItemPurchaseLedger,
    pendingItemSyncs,
    addPendingItemSync,
  } = useAccountingContext()

  const [showMore, setShowMore] = useState(false)
  const [trackInventory, setTrackInventory] = useState(false)
  const [itemLedger, setItemLedger] = useState('')

  const item = selectedItem
  const isOpen = item !== null

  const runtimeStatus: ItemStatus = item
    ? pendingItemSyncs.has(item.id) ? 'pending_tally_sync'
      : itemCategories[item.id]?.purchaseLedger ? 'synced'
      : 'categorise'
    : 'categorise'

  const savedCategory = item ? itemCategories[item.id] : undefined
  const pendingPurchaseLedger = item ? (pendingItemPurchaseLedgers[item.id] ?? '') : ''
  const effectivePurchaseLedger = pendingPurchaseLedger || item?.aiSuggestedPurchaseLedger || ''

  const purchaseLedgerVariant: LedgerDropdownVariant = (() => {
    if (pendingPurchaseLedger && pendingPurchaseLedger === item?.aiSuggestedPurchaseLedger) return 'ai-approved'
    if (pendingPurchaseLedger) return 'manual'
    if (item?.aiSuggestedPurchaseLedger) return 'ai'
    return 'empty'
  })()

  const itemLedgerVariant: LedgerDropdownVariant = (() => {
    if (itemLedger && itemLedger === item?.aiSuggestedItemLedger) return 'ai-approved'
    if (itemLedger) return 'manual'
    if (item?.aiSuggestedItemLedger) return 'ai'
    return 'empty'
  })()

  const isSaveEnabled = !!effectivePurchaseLedger && (!trackInventory || !!itemLedger)

  const handleSaveAndSync = () => {
    if (!item || !effectivePurchaseLedger) return
    if (!pendingPurchaseLedger && item.aiSuggestedPurchaseLedger) {
      setPendingItemPurchaseLedger(item.id, item.aiSuggestedPurchaseLedger)
    }
    setItemCategory(item.id, {
      purchaseLedger: effectivePurchaseLedger,
      trackInventory,
      itemLedger: trackInventory ? itemLedger : undefined,
    })
    addPendingItemSync(item.id)
    setTrackInventory(false)
    setItemLedger('')
    onClose()
  }

  const handleDismiss = () => {
    setTrackInventory(false)
    setItemLedger('')
    setShowMore(false)
    onClose()
  }

  const timelineSteps = item ? getTimelineSteps(item, runtimeStatus) : []
  const hasMoreSteps = timelineSteps.length > 1
  const visibleSteps = showMore ? timelineSteps : [timelineSteps[0]]

  return (
    <Drawer
      isOpen={isOpen}
      onDismiss={handleDismiss}
      accessibilityLabel={item ? `Item details for ${item.name}` : 'Item details'}
    >
      <DrawerHeader
        title={item?.name ?? ''}
        titleSuffix={item ? (
          <Badge
            color={ITEM_STATUS_CONFIG[runtimeStatus].badgeColor}
            icon={ITEM_STATUS_CONFIG[runtimeStatus].badgeIcon}
          >
            {ITEM_STATUS_CONFIG[runtimeStatus].label}
          </Badge>
        ) : undefined}
        color={item ? ITEM_STATUS_CONFIG[runtimeStatus].drawerHeaderColor : undefined}
      />

      <DrawerBody>
        {item && (
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
                showLink={runtimeStatus === 'synced'}
              />

              {runtimeStatus === 'categorise' ? (
                <Box marginBottom="spacing.7">
                  <Box marginBottom="spacing.4">
                    <LedgerDropdown
                      isDrawer
                      label="Purchase ledger"
                      necessityIndicator="required"
                      variant={purchaseLedgerVariant}
                      value={effectivePurchaseLedger}
                      options={PURCHASE_LEDGER_OPTIONS}
                      aiSuggestedValue={item.aiSuggestedPurchaseLedger}
                      onChange={(val) => setPendingItemPurchaseLedger(item.id, val)}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.4">
                    <Text size="medium" color="surface.text.gray.normal">Track inventory</Text>
                    <Switch
                      accessibilityLabel="Track inventory"
                      isChecked={trackInventory}
                      onChange={({ isChecked }) => {
                        setTrackInventory(isChecked)
                        if (!isChecked) {
                          setItemLedger('')
                        } else if (item.aiSuggestedItemLedger) {
                          setItemLedger(item.aiSuggestedItemLedger)
                        }
                      }}
                      size="small"
                    />
                  </Box>

                  <Box marginBottom="spacing.5">
                    {!trackInventory ? (
                      <Box display="flex" flexDirection="column" gap="spacing.1">
                        <Text size="small" color="surface.text.gray.muted">Item ledger</Text>
                        <Text size="medium" color="surface.text.gray.muted">-</Text>
                      </Box>
                    ) : (
                      <LedgerDropdown
                        isDrawer
                        label="Item ledger"
                        variant={itemLedgerVariant}
                        value={itemLedger}
                        options={ITEM_LEDGER_OPTIONS}
                        aiSuggestedValue={item.aiSuggestedItemLedger}
                        onChange={setItemLedger}
                      />
                    )}
                  </Box>
                </Box>
              ) : (
                <Box marginBottom="spacing.5">
                  <DetailRow label="Purchase ledger" value={savedCategory?.purchaseLedger ?? '--'} />
                  <DetailRow label="Track inventory" value={savedCategory?.trackInventory ? 'On' : 'Off'} />
                  <DetailRow
                    label="Item ledger"
                    value={savedCategory?.trackInventory ? (savedCategory.itemLedger ?? '--') : '-'}
                  />
                </Box>
              )}
            </Box>

            <Divider variant="subtle" dividerStyle="dashed" />

            <Box marginTop="spacing.5">
            <SectionHeading
                title="Item Details"
                showLink
                linkLabel="View"
                linkIcon={ExternalLinkIcon}
              />
              <DetailRow label="Type" value={item.type} />
              <DetailRow label="Added On" value={item.addedOn} />
              <DetailRow label="HSN / SAC" value={item.hsnSac ?? '--'} />
              <DetailRow label="Description" value={item.description} />
            </Box>
          </>
        )}
      </DrawerBody>

      {item && runtimeStatus === 'categorise' && (
        <DrawerFooter>
          <Button
            variant="primary"
            isFullWidth
            isDisabled={!isSaveEnabled}
            onClick={handleSaveAndSync}
          >
            Save and sync
          </Button>
        </DrawerFooter>
      )}
    </Drawer>
  )
}
