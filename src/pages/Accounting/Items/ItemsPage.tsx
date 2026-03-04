import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  ListView,
  ListViewFilters,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableToolbar,
  TableToolbarActions,
  QuickFilterGroup,
  QuickFilter,
  Badge,
  Text,
  Alert,
  Button,
  Tooltip,
  TooltipInteractiveWrapper,
  useToast,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { MOCK_ITEMS, ITEM_STATUS_CONFIG, PURCHASE_LEDGER_OPTIONS } from './itemsMockData'
import type { Item, ItemStatus } from './itemsMockData'
import { useAccountingContext } from '../../../context/AccountingContext'
import { LedgerDropdown } from '../../../components/LedgerDropdown'
import { ItemDetailDrawer } from './ItemDetailDrawer'
import { AiBanner } from '../shared/AiBanner'

type FilterId = 'all' | ItemStatus

const ItemsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filteredItemId = searchParams.get('itemId')
  const comingFromBillId = searchParams.get('billId')

  const {
    itemCategories,
    setItemCategory,
    pendingItemPurchaseLedgers,
    setPendingItemPurchaseLedger,
    pendingItemSyncs,
    addPendingItemSync,
  } = useAccountingContext()

  const toast = useToast()
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const itemsWithStatus = MOCK_ITEMS.map((item) => ({
    ...item,
    status: (
      pendingItemSyncs.has(item.id) ? 'pending_tally_sync'
      : itemCategories[item.id]?.purchaseLedger ? 'synced'
      : item.status
    ) as ItemStatus,
  }))

  const hasPendingSync = itemsWithStatus.some((i) => i.status === 'pending_tally_sync')

  const categoriseItems = itemsWithStatus.filter(
    (i) => i.status === 'categorise' && i.aiSuggestedPurchaseLedger,
  )

  const displayedItems = filteredItemId
    ? itemsWithStatus.filter((i) => i.id === filteredItemId)
    : activeFilter === 'all'
      ? itemsWithStatus
      : itemsWithStatus.filter((i) => i.status === activeFilter)

  const tableData: TableData<Item> = { nodes: displayedItems }

  const handleBulkSync = () => {
    itemsWithStatus.forEach((item) => {
      const purchaseLedger = pendingItemPurchaseLedgers[item.id]
      if (purchaseLedger) {
        setItemCategory(item.id, { purchaseLedger, trackInventory: false })
        addPendingItemSync(item.id)
      }
    })
  }

  const handleSaveAndSyncFromRow = (item: Item) => {
    const purchaseLedger = pendingItemPurchaseLedgers[item.id]
    if (!purchaseLedger) return
    setItemCategory(item.id, { purchaseLedger, trackInventory: false })
    addPendingItemSync(item.id)
  }

  const handleAutoCategoriSe = async () => {
    if (isRunning) return
    setIsRunning(true)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      categoriseItems.forEach((i) => setPendingItemPurchaseLedger(i.id, i.aiSuggestedPurchaseLedger!))
    } else {
      for (const item of categoriseItems) {
        await new Promise<void>((resolve) => setTimeout(resolve, 150))
        setPendingItemPurchaseLedger(item.id, item.aiSuggestedPurchaseLedger!)
      }
    }

    setIsRunning(false)

    if (categoriseItems.length > 0) {
      toast.show({
        content: `${categoriseItems.length} item${categoriseItems.length === 1 ? '' : 's'} categorised with AI`,
        color: 'positive',
        autoDismiss: true,
      })
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6">
      {filteredItemId && comingFromBillId && (
        <Alert
          description={`Showing item for bill #${comingFromBillId}. Categorise the item below and return to the bill to complete the mapping.`}
          color="information"
          isDismissible={false}
          isFullWidth
          actions={{
            secondary: {
              text: '← Back to Bills',
              onClick: () => navigate('/v1/accounting/bills'),
            },
          }}
        />
      )}

      {!filteredItemId && (
        <AiBanner
          heading="Categorise items with AI"
          description={`${categoriseItems.length} items pending purchase ledger mapping — Ray AI will auto-fill suggestions. Review or edit any time.`}
        >
          <Button
            variant="secondary"
            color="white"
            size="medium"
            isLoading={isRunning}
            onClick={handleAutoCategoriSe}
          >
            Auto categorise items
          </Button>
        </AiBanner>
      )}

      <ListView>
        {!filteredItemId && (
          <ListViewFilters
            quickFilters={
              <QuickFilterGroup
                selectionType="single"
                defaultValue="all"
                onChange={({ values }) => setActiveFilter((values[0] as FilterId) ?? 'all')}
              >
                <QuickFilter title="All items" value="all" />
                <QuickFilter title="Categorise" value="categorise" />
                {hasPendingSync && <QuickFilter title="Pending sync" value="pending_tally_sync" />}
                <QuickFilter title="Synced" value="synced" />
              </QuickFilterGroup>
            }
          />
        )}

        <Table
          data={tableData}
          marginTop={filteredItemId ? 'spacing.0' : 'spacing.5'}
          toolbar={!filteredItemId ? (
            <TableToolbar title={`${displayedItems.length} Items`}>
              <TableToolbarActions>
                <Box flexShrink={0}>
                  <Button variant="primary" onClick={handleBulkSync}>
                    Sync to Tally
                  </Button>
                </Box>
              </TableToolbarActions>
            </TableToolbar>
          ) : undefined}
          pagination={!filteredItemId ? <TablePagination defaultPageSize={25} showPageSizePicker /> : undefined}
        >
          {(tableData) => (
            <>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell>Item</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Purchase Ledger</TableHeaderCell>
                  <TableHeaderCell>Created On</TableHeaderCell>
                </TableHeaderRow>
              </TableHeader>

              <TableBody>
                {tableData.map((item) => {
                  const config = ITEM_STATUS_CONFIG[item.status]
                  const isSynced = item.status === 'synced'
                  const isPending = item.status === 'pending_tally_sync'
                  const savedCategory = itemCategories[item.id]
                  const pendingLedger = pendingItemPurchaseLedgers[item.id] ?? ''

                  const ledgerVariant = (() => {
                    if (pendingLedger && pendingLedger === item.aiSuggestedPurchaseLedger) return 'ai-approved'
                    if (pendingLedger) return 'manual'
                    return 'empty'
                  })()

                  const ledgerValue = pendingLedger

                  const canSaveAndSync = !isSynced && !isPending && !!pendingLedger

                  return (
                    <TableRow
                      key={item.id}
                      item={item}
                      onClick={({ item }) => setSelectedItem(item)}
                      hoverActions={
                        <Box display="flex" gap="spacing.2">
                          {!selectedItem && (
                            <>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}
                              >
                                View details
                              </Button>
                              {canSaveAndSync && (
                                <Button
                                  variant="primary"
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); handleSaveAndSyncFromRow(item) }}
                                >
                                  Save and sync
                                </Button>
                              )}
                            </>
                          )}
                        </Box>
                      }
                    >
                      <TableCell>
                        <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                          {item.name}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Tooltip content={item.description} placement="top">
                          <TooltipInteractiveWrapper>
                            <Text size="medium" color="surface.text.gray.muted" truncateAfterLines={1}>
                              {item.description}
                            </Text>
                          </TooltipInteractiveWrapper>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Badge color={config.badgeColor} icon={config.badgeIcon} size="medium">
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSynced ? (
                          <Text size="medium" color="surface.text.gray.muted">
                            {savedCategory?.purchaseLedger ?? '--'}
                          </Text>
                        ) : isPending ? (
                          <Text size="medium" color="surface.text.gray.muted">
                            {pendingLedger || '--'}
                          </Text>
                        ) : (
                          <div onClick={(e) => e.stopPropagation()} style={{ width: '80%' }}>
                            <LedgerDropdown
                              variant={ledgerVariant}
                              value={ledgerValue}
                              options={PURCHASE_LEDGER_OPTIONS}
                              aiSuggestedValue={item.aiSuggestedPurchaseLedger}
                              onChange={(val) => setPendingItemPurchaseLedger(item.id, val)}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Text size="medium" color="surface.text.gray.muted">
                          {item.createdOn}
                        </Text>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </>
          )}
        </Table>
      </ListView>

      <ItemDetailDrawer
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  )
}

export default ItemsPage
