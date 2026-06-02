import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActionList,
  ActionListItem,
  AlertTriangleIcon,
  Amount,
  Badge,
  Box,
  Button,
  Counter,
  DatePicker,
  Dropdown,
  DropdownOverlay,
  EditComposeIcon,
  FilterChipGroup,
  FilterChipSelectInput,
  InfoIcon,
  ListView,
  ListViewFilters,
  Popover,
  PopoverInteractiveWrapper,
  QuickFilter,
  QuickFilterGroup,
  RayIcon,
  SearchInput,
  SelectInput,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
  TablePagination,
  TableRow,
  TableToolbar,
  TableToolbarActions,
  Text,
  TextInput,
  Tooltip,
  TooltipInteractiveWrapper,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { useAccountingV3Context } from '../../context/AccountingV3Context'
import {
  COST_CENTER_OPTIONS,
  GST_LEDGER_OPTIONS,
  MODULE_CONFIG,
  PURCHASE_ACCOUNT_OPTIONS,
  REVIEW_STATUS_ORDER,
  REVIEW_TAB_LABELS,
  TALLY_ITEM_OPTIONS,
  TALLY_LEDGER_OPTIONS,
  TDS_LEDGER_OPTIONS,
  VENDOR_LEDGER_OPTIONS,
} from './data'
import { SyncBooksModal } from './SyncBooksModal'
import type { V3ModuleKey, V3MappingState, V3ReviewRow, V3ReviewStatus } from './types'

type Props = {
  moduleKey: V3ModuleKey
}

type DateRangeValue = [Date | null, Date | null]

const mappingTone: Record<
  V3MappingState,
  {
    label: string
    icon: typeof RayIcon | typeof EditComposeIcon | typeof AlertTriangleIcon
    color: 'positive' | 'notice' | 'negative'
  }
> = {
  ray: { color: 'positive', label: 'Ray mapped', icon: RayIcon },
  edited: { color: 'notice', label: 'Edited', icon: EditComposeIcon },
  missing: { color: 'negative', label: 'Needs input', icon: AlertTriangleIcon },
}

const containerStyles = {
  borderWidth: 'thin' as const,
  borderStyle: 'solid' as const,
  borderColor: 'surface.border.gray.muted' as const,
  borderRadius: 'large' as const,
  backgroundColor: 'surface.background.gray.intense' as const,
}

const needsSecondaryMapping = (moduleKey: V3ModuleKey, row: V3ReviewRow) =>
  moduleKey === 'items' && Boolean(row.trackInventory)

const getOptionsForModule = (moduleKey: V3ModuleKey) => {
  if (moduleKey === 'items') return PURCHASE_ACCOUNT_OPTIONS
  if (moduleKey === 'vendors') return VENDOR_LEDGER_OPTIONS
  if (moduleKey === 'costCenters') return COST_CENTER_OPTIONS
  if (moduleKey === 'gst') return GST_LEDGER_OPTIONS
  if (moduleKey === 'tds') return TDS_LEDGER_OPTIONS
  return TALLY_LEDGER_OPTIONS
}

const explanationTitleByModule: Record<V3ModuleKey, string> = {
  items: 'Why Ray mapped this item',
  vendors: 'Why Ray mapped this vendor',
  bills: 'Why Ray mapped this bill',
  expenses: 'Why Ray mapped this expense',
  advances: 'Why Ray mapped this advance',
  costCenters: 'Why Ray mapped this cost center',
  gst: 'Why Ray mapped this GST ledger',
  tds: 'Why Ray mapped this TDS ledger',
}

const statusCounterColor = (status: V3ReviewStatus): 'notice' | 'positive' | 'neutral' => {
  if (status === 'needs_review') return 'notice'
  if (status === 'ready_for_sync') return 'positive'
  return 'neutral'
}

const EmptyState = ({ label }: { label: string }) => (
  <Box paddingY="spacing.10" display="flex" flexDirection="column" alignItems="center" gap="spacing.2">
    <RayIcon size="large" color="feedback.icon.positive.intense" />
    <Text size="medium" weight="semibold" color="surface.text.gray.normal">
      No {label.toLowerCase()} entries
    </Text>
    <Text size="small" color="surface.text.gray.muted">
      Ray has cleared this bucket for now.
    </Text>
  </Box>
)

const isRowReadyEligible = (moduleKey: V3ModuleKey, row: V3ReviewRow) =>
  Boolean(row.targetLabel) && (!needsSecondaryMapping(moduleKey, row) || Boolean(row.secondaryTargetLabel))

const parseAccountingDate = (value?: string): Date | null => {
  if (!value) return null
  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const isWithinRange = (date: Date | null, range: DateRangeValue) => {
  if (!date) return false
  const [start, end] = range
  if (!start && !end) return true
  if (start && end) return date >= start && date <= end
  if (start) return date >= start
  return Boolean(end && date <= end)
}

const AccountingModulePage = ({ moduleKey }: Props) => {
  const navigate = useNavigate()
  const config = MODULE_CONFIG[moduleKey]
  const { moduleRows, getCounts, approveRow, excludeRow, syncModule, updateRow, updateRows } =
    useAccountingV3Context()

  const [activeStatus, setActiveStatus] = useState<V3ReviewStatus>('needs_review')
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [targetFilter, setTargetFilter] = useState('all')
  const [secondaryTargetFilter, setSecondaryTargetFilter] = useState('all')
  const [mappingTypeFilter, setMappingTypeFilter] = useState<'all' | V3MappingState>('all')
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'on' | 'off'>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null])

  const rows = moduleRows[moduleKey]
  const counts = getCounts(moduleKey)
  const dropdownOptions = getOptionsForModule(moduleKey)

  const unmappedItemCount = moduleRows.items.filter(
    (row) => row.mappingState === 'missing' && row.status === 'needs_review',
  ).length
  const unmappedVendorCount = moduleRows.vendors.filter(
    (row) => row.mappingState === 'missing' && row.status === 'needs_review',
  ).length
  const vendorBlockedBillCount = rows.filter(
    (row) =>
      row.status === 'needs_review' &&
      moduleRows.vendors.some(
        (vendorRow) =>
          vendorRow.sourceLabel === row.sourceLabel &&
          vendorRow.mappingState === 'missing' &&
          vendorRow.status === 'needs_review',
      ),
  ).length

  const statusRows = rows.filter((row) => row.status === activeStatus)
  const sourceOptions = Array.from(new Set(rows.map((row) => row.sourceLabel))).sort()
  const targetOptions = Array.from(new Set(rows.map((row) => row.targetLabel).filter(Boolean))).sort()
  const secondaryTargetOptions = Array.from(
    new Set(rows.map((row) => row.secondaryTargetLabel).filter(Boolean) as string[]),
  ).sort()

  const hasAmountFilters = ['bills', 'expenses', 'advances'].includes(moduleKey)
  const hasDateFilters = hasAmountFilters
  const hasSourceFilter = ['vendors', 'bills', 'expenses', 'advances'].includes(moduleKey)
  const hasSecondaryTargetFilter = moduleKey === 'items'
  const hasInventoryFilter = moduleKey === 'items'

  const visibleRows = statusRows.filter((row) => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    const matchesSearch =
      normalizedSearch.length === 0 ||
      row.sourceLabel.toLowerCase().includes(normalizedSearch) ||
      row.referenceLabel?.toLowerCase().includes(normalizedSearch)

    const matchesSource = sourceFilter === 'all' || row.sourceLabel === sourceFilter
    const matchesTarget = targetFilter === 'all' || row.targetLabel === targetFilter
    const matchesSecondaryTarget =
      secondaryTargetFilter === 'all' || row.secondaryTargetLabel === secondaryTargetFilter
    const matchesMappingType = mappingTypeFilter === 'all' || row.mappingState === mappingTypeFilter
    const matchesInventory =
      inventoryFilter === 'all' ||
      (inventoryFilter === 'on' ? Boolean(row.trackInventory) : !row.trackInventory)

    const numericMinAmount = minAmount ? Number(minAmount) : null
    const numericMaxAmount = maxAmount ? Number(maxAmount) : null
    const matchesAmount =
      !hasAmountFilters ||
      ((!numericMinAmount || (row.amount ?? 0) >= numericMinAmount) &&
        (!numericMaxAmount || (row.amount ?? 0) <= numericMaxAmount))

    const matchesDate = !hasDateFilters || isWithinRange(parseAccountingDate(row.accountingDate), dateRange)

    return (
      matchesSearch &&
      matchesSource &&
      matchesTarget &&
      matchesSecondaryTarget &&
      matchesMappingType &&
      matchesInventory &&
      matchesAmount &&
      matchesDate
    )
  })

  const tableData: TableData<V3ReviewRow> = { nodes: visibleRows }
  const selectedRows = visibleRows.filter((row) => selectedRowIds.includes(row.id))
  const eligibleSelectedRows = selectedRows.filter((row) => isRowReadyEligible(moduleKey, row))

  const activeFilterCount = [
    searchValue.trim() !== '',
    sourceFilter !== 'all',
    targetFilter !== 'all',
    secondaryTargetFilter !== 'all',
    mappingTypeFilter !== 'all',
    inventoryFilter !== 'all',
    minAmount !== '',
    maxAmount !== '',
    Boolean(dateRange[0] || dateRange[1]),
  ].filter(Boolean).length

  const resetFilters = () => {
    setSearchValue('')
    setSourceFilter('all')
    setTargetFilter('all')
    setSecondaryTargetFilter('all')
    setMappingTypeFilter('all')
    setInventoryFilter('all')
    setMinAmount('')
    setMaxAmount('')
    setDateRange([null, null])
    setSelectedRowIds([])
  }

  const handleTargetChange = (rowId: string, value: string) => {
    updateRow(moduleKey, rowId, (row) => {
      const shouldStayPending = needsSecondaryMapping(moduleKey, row) && !row.secondaryTargetLabel
      return {
        ...row,
        targetLabel: value,
        mappingState: 'edited',
        status: value && !shouldStayPending ? 'ready_for_sync' : 'needs_review',
      }
    })
  }

  const handleSecondaryTargetChange = (rowId: string, value: string) => {
    updateRow(moduleKey, rowId, (row) => ({
      ...row,
      secondaryTargetLabel: value,
      mappingState: 'edited',
      status: row.targetLabel && value ? 'ready_for_sync' : 'needs_review',
    }))
  }

  const handleTrackInventoryChange = (rowId: string, isChecked: boolean) => {
    updateRow(moduleKey, rowId, (row) => ({
      ...row,
      trackInventory: isChecked,
      secondaryTargetLabel: isChecked ? row.secondaryTargetLabel : '',
      mappingState: 'edited',
      status:
        row.targetLabel && (!isChecked || Boolean(row.secondaryTargetLabel))
          ? 'ready_for_sync'
          : 'needs_review',
    }))
  }

  const handleBulkReady = () => {
    if (eligibleSelectedRows.length === 0) return
    updateRows(
      moduleKey,
      eligibleSelectedRows.map((row) => row.id),
      (row) => ({
        ...row,
        status: 'ready_for_sync',
        mappingState: row.mappingState === 'missing' ? 'edited' : row.mappingState,
      }),
    )
    setSelectedRowIds([])
  }

  const handleBulkExclude = () => {
    if (selectedRows.length === 0) return
    updateRows(
      moduleKey,
      selectedRows.map((row) => row.id),
      (row) => ({ ...row, status: 'excluded' }),
    )
    setSelectedRowIds([])
  }

  const eligibleNeedsReviewRows = rows.filter(
    (row) => row.status === 'needs_review' && isRowReadyEligible(moduleKey, row),
  )

  const handleMarkAllReady = () => {
    updateRows(
      moduleKey,
      eligibleNeedsReviewRows.map((row) => row.id),
      (row) => ({
        ...row,
        status: 'ready_for_sync',
        mappingState: row.mappingState === 'missing' ? 'edited' : row.mappingState,
      }),
    )
  }

  const handleBulkSync = () => {
    if (selectedRows.length === 0) return
    updateRows(
      moduleKey,
      selectedRows.map((row) => row.id),
      (row) => ({ ...row, status: 'synced' }),
    )
    setSelectedRowIds([])
  }

  const renderStaticLedgerValue = (row: V3ReviewRow, value: string) => (
    <Box display="flex" alignItems="center" gap="spacing.2">
      {row.mappingState === 'ray' && (
        <RayIcon size="small" color="feedback.icon.positive.intense" />
      )}
      <Text size="medium" color="surface.text.gray.normal" weight="medium">
        {value || '--'}
      </Text>
    </Box>
  )

  const renderMappingCell = (row: V3ReviewRow) => {
    const StateIcon = mappingTone[row.mappingState].icon

    return (
      <TableCell>
        <Box display="flex" alignItems="center" gap="spacing.3">
          <Tooltip
            title={mappingTone[row.mappingState].label}
            content={mappingTone[row.mappingState].label}
            placement="top"
          >
            <TooltipInteractiveWrapper>
              <Box display="flex" alignItems="center">
                <StateIcon
                  size="medium"
                  color={
                    row.mappingState === 'ray'
                      ? 'feedback.icon.positive.intense'
                      : row.mappingState === 'edited'
                        ? 'feedback.icon.notice.intense'
                        : 'feedback.icon.negative.intense'
                  }
                />
              </Box>
            </TooltipInteractiveWrapper>
          </Tooltip>

          <Popover
            title={explanationTitleByModule[moduleKey]}
            titleLeading={<RayIcon size="small" color="feedback.icon.positive.intense" />}
            openInteraction="click"
            placement="top"
            content={
              <Box display="flex" flexDirection="column" gap="spacing.4" maxWidth="340px">
                <Box
                  backgroundColor="feedback.background.positive.subtle"
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="surface.border.primary.muted"
                  borderRadius="large"
                  padding="spacing.4"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="spacing.3"
                    marginBottom="spacing.3"
                  >
                    <Box display="flex" alignItems="center" gap="spacing.2">
                      <RayIcon size="small" color="feedback.icon.positive.intense" />
                      <Text size="small" color="surface.text.gray.normal" weight="semibold">
                        Ray reasoning
                      </Text>
                    </Box>
                    <Badge color={mappingTone[row.mappingState].color} size="small">
                      {mappingTone[row.mappingState].label}
                    </Badge>
                  </Box>
                  <Text size="small" color="surface.text.gray.normal">
                    {row.explanation}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xsmall"
                    color="surface.text.gray.muted"
                    marginBottom="spacing.1"
                    textTransform="uppercase"
                  >
                    Source
                  </Text>
                  <Text size="medium" color="surface.text.gray.normal" weight="semibold">
                    {row.sourceLabel}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xsmall"
                    color="surface.text.gray.muted"
                    marginBottom="spacing.1"
                    textTransform="uppercase"
                  >
                    Current target
                  </Text>
                  <Text size="small" color="surface.text.gray.normal" weight="medium">
                    {row.targetLabel || 'Awaiting manual selection'}
                  </Text>
                </Box>

                {row.secondaryTargetLabel && (
                  <Box>
                    <Text
                      size="xsmall"
                      color="surface.text.gray.muted"
                      marginBottom="spacing.1"
                      textTransform="uppercase"
                    >
                      Secondary target
                    </Text>
                    <Text size="small" color="surface.text.gray.normal" weight="medium">
                      {row.secondaryTargetLabel}
                    </Text>
                  </Box>
                )}
              </Box>
            }
          >
            <PopoverInteractiveWrapper accessibilityLabel="Open Ray explanation">
              <Box display="flex" alignItems="center">
                <InfoIcon size="small" color="surface.icon.gray.subtle" />
              </Box>
            </PopoverInteractiveWrapper>
          </Popover>
        </Box>
      </TableCell>
    )
  }

  const renderLedgerSelect = (
    row: V3ReviewRow,
    value: string,
    placeholder: string,
    onChange: (nextValue: string) => void,
    isDisabled = false,
    options = dropdownOptions,
  ) => (
    <Dropdown selectionType="single">
      <SelectInput
        label=""
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        value={value || undefined}
        icon={row.mappingState === 'ray' ? RayIcon : undefined}
        isDisabled={isDisabled}
        onChange={({ values }) => onChange(values[0] ?? '')}
      />
      <DropdownOverlay>
        <ActionList>
          {options.map((option) => (
            <ActionListItem key={option} title={option} value={option} />
          ))}
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  )

  const isInteractiveStatus = activeStatus === 'needs_review' || activeStatus === 'ready_for_sync'

  const tableToolbar = isInteractiveStatus ? (
    <TableToolbar
      title={`${visibleRows.length} ${config.label}`}
      selectedTitle={`${selectedRowIds.length} selected`}
    >
      <TableToolbarActions>
        <Box display="flex" gap="spacing.3" flexWrap="wrap">
          {activeStatus === 'needs_review' ? (
            <>
              <Box flexShrink={0}>
                <Button
                  variant="primary"
                  size="small"
                  isDisabled={eligibleSelectedRows.length === 0}
                  onClick={handleBulkReady}
                >
                  Ready {eligibleSelectedRows.length || ''} selected
                </Button>
              </Box>
              <Box flexShrink={0}>
                <Button
                  variant="secondary"
                  size="small"
                  isDisabled={selectedRows.length === 0}
                  onClick={handleBulkExclude}
                >
                  Exclude selected
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box flexShrink={0}>
                <Button
                  variant="primary"
                  size="small"
                  isDisabled={selectedRows.length === 0}
                  onClick={handleBulkSync}
                >
                  Sync selected
                </Button>
              </Box>
              <Box flexShrink={0}>
                <Button
                  variant="secondary"
                  size="small"
                  isDisabled={selectedRows.length === 0}
                  onClick={handleBulkExclude}
                >
                  Exclude selected
                </Button>
              </Box>
            </>
          )}
        </Box>
      </TableToolbarActions>
    </TableToolbar>
  ) : undefined

  return (
    <>
      <Box display="flex" flexDirection="column" gap="spacing.6">
        {moduleKey === 'bills' && (
          <Box
            borderWidth="thin"
            borderStyle="solid"
            borderColor="surface.border.primary.muted"
            borderRadius="large"
            backgroundColor="feedback.background.notice.subtle"
            padding="spacing.6"
          >
            <Box
              display="flex"
              flexDirection={{ base: 'column', l: 'row' }}
              justifyContent="space-between"
              gap="spacing.6"
            >
              <Box maxWidth="720px">
                <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.3">
                  <RayIcon size="large" color="feedback.icon.positive.intense" />
                  <Badge color="positive">Ray bill summary</Badge>
                </Box>
                <Text size="large" weight="semibold" color="surface.text.gray.normal" marginBottom="spacing.2">
                  Review vendors and items first to automatically unlock more bills.
                </Text>
                <Text size="small" color="surface.text.gray.normal" marginBottom="spacing.4">
                  Ray already has {counts.ready_for_sync} bills staged for sync. There are{' '}
                  {unmappedVendorCount} unmapped vendors and {unmappedItemCount} unmapped items still
                  blocking automatic bill resolution, with {vendorBlockedBillCount} bill
                  {vendorBlockedBillCount === 1 ? '' : 's'} directly waiting on vendor mapping fixes.
                </Text>
                <Text size="small" weight="semibold" color="feedback.text.notice.intense">
                  Review Items and Vendors first so Ray can automatically resolve more bills in this queue.
                </Text>
              </Box>

              <Box
                display="flex"
                gap="spacing.3"
                alignItems={{ base: 'stretch', l: 'flex-start' }}
                flexWrap="wrap"
              >
                <Button variant="primary" onClick={() => navigate('/v3/accounting/vendors')}>
                  Review Vendors
                </Button>
                <Button variant="secondary" onClick={() => navigate('/v3/accounting/items')}>
                  Review Items
                </Button>
              </Box>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }}
              gap="spacing.3"
              marginTop="spacing.5"
            >
              {[
                { label: 'Ready now', value: counts.ready_for_sync, sub: 'Bills Ray can sync immediately' },
                { label: 'Bills needing review', value: counts.needs_review, sub: 'Remaining exception queue' },
                { label: 'Unmapped vendors', value: unmappedVendorCount, sub: 'Upstream blockers for vendor-led bills' },
                { label: 'Unmapped items', value: unmappedItemCount, sub: 'Item-ledger gaps Ray cannot reuse yet' },
              ].map(({ label, value, sub }) => (
                <Box
                  key={label}
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="surface.border.gray.muted"
                  borderRadius="large"
                  backgroundColor="surface.background.gray.moderate"
                  padding="spacing.3"
                >
                  <Text size="xsmall" color="surface.text.gray.muted" textTransform="uppercase" marginBottom="spacing.1">
                    {label}
                  </Text>
                  <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                    {value}
                  </Text>
                  <Text size="xsmall" color="surface.text.gray.muted">{sub}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <ListView>
          <ListViewFilters
            quickFilters={
              <QuickFilterGroup
                selectionType="single"
                value={activeStatus}
                onChange={({ values }) => {
                  setActiveStatus((values[0] as V3ReviewStatus) ?? 'needs_review')
                  setSelectedRowIds([])
                }}
              >
                {REVIEW_STATUS_ORDER.map((status) => (
                  <QuickFilter
                    key={status}
                    title={REVIEW_TAB_LABELS[status]}
                    value={status}
                    trailing={
                      <Counter value={counts[status]} color={statusCounterColor(status)} />
                    }
                  />
                ))}
              </QuickFilterGroup>
            }
            actions={
              <Box display="flex" gap="spacing.3" alignItems="center" flexWrap="wrap">
                <Box minWidth={{ base: '100%', m: '280px' }}>
                  <SearchInput
                    accessibilityLabel={`Search ${config.label}`}
                    placeholder={
                      ['bills', 'expenses', 'advances'].includes(moduleKey)
                        ? `Search by vendor or ${config.referenceColumnLabel?.toLowerCase()}`
                        : `Search ${config.label.toLowerCase()}`
                    }
                    value={searchValue}
                    onChange={({ value }) => {
                      setSearchValue(value ?? '')
                      setSelectedRowIds([])
                    }}
                  />
                </Box>
                {activeStatus === 'needs_review' && eligibleNeedsReviewRows.length > 0 && (
                  <Box flexShrink={0}>
                    <Button variant="primary" onClick={handleMarkAllReady}>
                      Mark {eligibleNeedsReviewRows.length} as ready
                    </Button>
                  </Box>
                )}
                {activeStatus === 'ready_for_sync' && (
                  <Box flexShrink={0}>
                    <Button
                      variant="primary"
                      onClick={() => setIsSyncOpen(true)}
                      isDisabled={counts.ready_for_sync === 0}
                    >
                      Sync to Tally
                    </Button>
                  </Box>
                )}
              </Box>
            }
            selectedFiltersCount={activeFilterCount}
          >
            <Box display="flex" gap="spacing.4" flexWrap="wrap" alignItems="flex-end">
              <FilterChipGroup
                showClearButton={activeFilterCount > 0}
                onClearButtonClick={resetFilters}
              >
                {hasSourceFilter ? (
                  <Dropdown selectionType="single">
                    <FilterChipSelectInput
                      label="Vendor"
                      value={sourceFilter === 'all' ? undefined : sourceFilter}
                      onChange={({ values }) => {
                        setSourceFilter(values[0] ?? 'all')
                        setSelectedRowIds([])
                      }}
                    />
                    <DropdownOverlay>
                      <ActionList>
                        <ActionListItem title="All vendors" value="all" />
                        {sourceOptions.map((opt) => (
                          <ActionListItem key={opt} title={opt} value={opt} />
                        ))}
                      </ActionList>
                    </DropdownOverlay>
                  </Dropdown>
                ) : null}

                {hasInventoryFilter ? (
                  <Dropdown selectionType="single">
                    <FilterChipSelectInput
                      label="Track inventory"
                      value={inventoryFilter === 'all' ? undefined : inventoryFilter}
                      onChange={({ values }) => {
                        setInventoryFilter((values[0] as 'all' | 'on' | 'off') ?? 'all')
                        setSelectedRowIds([])
                      }}
                    />
                    <DropdownOverlay>
                      <ActionList>
                        <ActionListItem title="All" value="all" />
                        <ActionListItem title="On" value="on" />
                        <ActionListItem title="Off" value="off" />
                      </ActionList>
                    </DropdownOverlay>
                  </Dropdown>
                ) : null}

                {hasSecondaryTargetFilter ? (
                  <Dropdown selectionType="single">
                    <FilterChipSelectInput
                      label={config.secondaryTargetColumnLabel ?? 'Secondary target'}
                      value={secondaryTargetFilter === 'all' ? undefined : secondaryTargetFilter}
                      onChange={({ values }) => {
                        setSecondaryTargetFilter(values[0] ?? 'all')
                        setSelectedRowIds([])
                      }}
                    />
                    <DropdownOverlay>
                      <ActionList>
                        <ActionListItem
                          title={`All ${(config.secondaryTargetColumnLabel ?? 'secondary targets').toLowerCase()}`}
                          value="all"
                        />
                        {secondaryTargetOptions.map((opt) => (
                          <ActionListItem key={opt} title={opt} value={opt} />
                        ))}
                      </ActionList>
                    </DropdownOverlay>
                  </Dropdown>
                ) : null}

                <Dropdown selectionType="single">
                  <FilterChipSelectInput
                    label={config.targetColumnLabel}
                    value={targetFilter === 'all' ? undefined : targetFilter}
                    onChange={({ values }) => {
                      setTargetFilter(values[0] ?? 'all')
                      setSelectedRowIds([])
                    }}
                  />
                  <DropdownOverlay>
                    <ActionList>
                      <ActionListItem
                        title={`All ${config.targetColumnLabel.toLowerCase()}s`}
                        value="all"
                      />
                      {targetOptions.map((opt) => (
                        <ActionListItem key={opt} title={opt} value={opt} />
                      ))}
                    </ActionList>
                  </DropdownOverlay>
                </Dropdown>

                <Dropdown selectionType="single">
                  <FilterChipSelectInput
                    label="Mapping type"
                    value={mappingTypeFilter === 'all' ? undefined : mappingTypeFilter}
                    onChange={({ values }) => {
                      setMappingTypeFilter((values[0] as 'all' | V3MappingState) ?? 'all')
                      setSelectedRowIds([])
                    }}
                  />
                  <DropdownOverlay>
                    <ActionList>
                      <ActionListItem title="All mapping types" value="all" />
                      <ActionListItem title="Ray mapped" value="ray" />
                      <ActionListItem title="Edited" value="edited" />
                      <ActionListItem title="Needs input" value="missing" />
                    </ActionList>
                  </DropdownOverlay>
                </Dropdown>
              </FilterChipGroup>

              {hasAmountFilters && (
                <>
                  <Box minWidth="140px">
                    <TextInput
                      label="Min amount"
                      accessibilityLabel="Minimum amount"
                      type="number"
                      value={minAmount}
                      placeholder="0"
                      onChange={({ value }) => {
                        setMinAmount(value ?? '')
                        setSelectedRowIds([])
                      }}
                    />
                  </Box>
                  <Box minWidth="140px">
                    <TextInput
                      label="Max amount"
                      accessibilityLabel="Maximum amount"
                      type="number"
                      value={maxAmount}
                      placeholder="500000"
                      onChange={({ value }) => {
                        setMaxAmount(value ?? '')
                        setSelectedRowIds([])
                      }}
                    />
                  </Box>
                </>
              )}

              {hasDateFilters && (
                <Box minWidth="320px">
                  <DatePicker
                    selectionType="range"
                    label={{ start: 'Accounting date', end: 'To' }}
                    value={dateRange}
                    onChange={(value) => {
                      setDateRange((value as DateRangeValue) ?? [null, null])
                      setSelectedRowIds([])
                    }}
                    onClearButtonClick={() => {
                      setDateRange([null, null])
                      setSelectedRowIds([])
                    }}
                    showClearButton
                    presets={[
                      {
                        label: 'Last 7 days',
                        value: (date) => [
                          new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6),
                          date,
                        ],
                      },
                      {
                        label: 'This month',
                        value: (date) => [new Date(date.getFullYear(), date.getMonth(), 1), date],
                      },
                      {
                        label: 'Last 30 days',
                        value: (date) => [
                          new Date(date.getFullYear(), date.getMonth(), date.getDate() - 29),
                          date,
                        ],
                      },
                    ]}
                  />
                </Box>
              )}
            </Box>
          </ListViewFilters>

          {visibleRows.length === 0 ? (
            <Box {...containerStyles} padding="spacing.6">
              <EmptyState label={REVIEW_TAB_LABELS[activeStatus]} />
            </Box>
          ) : (
            <Box {...containerStyles} padding="spacing.6">
              <Table
                key={`${activeStatus}-${activeFilterCount}`}
                data={tableData}
                selectionType={isInteractiveStatus ? 'multiple' : 'none'}
                onSelectionChange={({ selectedIds }) => setSelectedRowIds(selectedIds.map(String))}
                toolbar={selectedRowIds.length > 0 ? tableToolbar : undefined}
                pagination={<TablePagination defaultPageSize={10} showPageSizePicker />}
              >
                {(data) => (
                  <>
                    <TableHeader>
                      <TableHeaderRow>
                        <TableHeaderCell>{config.sourceColumnLabel}</TableHeaderCell>
                        {config.supportsInventory && (
                          <TableHeaderCell>Track inventory</TableHeaderCell>
                        )}
                        <TableHeaderCell>Mapping</TableHeaderCell>
                        {config.secondaryTargetColumnLabel && (
                          <TableHeaderCell>{config.secondaryTargetColumnLabel}</TableHeaderCell>
                        )}
                        <TableHeaderCell>{config.targetColumnLabel}</TableHeaderCell>
                        {hasAmountFilters && <TableHeaderCell>Accounting date</TableHeaderCell>}
                        {hasAmountFilters && <TableHeaderCell>Amount</TableHeaderCell>}
                        {config.referenceColumnLabel && (
                          <TableHeaderCell>{config.referenceColumnLabel}</TableHeaderCell>
                        )}
                      </TableHeaderRow>
                    </TableHeader>

                    <TableBody>
                      {data.map((row) => (
                        <TableRow
                          key={row.id}
                          item={row}
                          hoverActions={
                            activeStatus === 'needs_review' ? (
                              <Box display="flex" gap="spacing.2">
                                <Button
                                  variant="primary"
                                  size="small"
                                  isDisabled={
                                    !row.targetLabel ||
                                    (config.supportsInventory &&
                                      Boolean(row.trackInventory) &&
                                      !row.secondaryTargetLabel)
                                  }
                                  onClick={() => approveRow(moduleKey, row.id)}
                                >
                                  Ready for sync
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="small"
                                  onClick={() => excludeRow(moduleKey, row.id)}
                                >
                                  Exclude
                                </Button>
                              </Box>
                            ) : undefined
                          }
                        >
                          <TableCell>
                            <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                              {row.sourceLabel}
                            </Text>
                          </TableCell>

                          {config.supportsInventory && (
                            <TableCell>
                              {row.status === 'synced' ? (
                                <Text size="medium" color="surface.text.gray.normal" weight="medium">
                                  {row.trackInventory ? 'On' : 'Off'}
                                </Text>
                              ) : (
                                <Switch
                                  accessibilityLabel="Track inventory"
                                  isChecked={Boolean(row.trackInventory)}
                                  onChange={({ isChecked }) =>
                                    handleTrackInventoryChange(row.id, isChecked)
                                  }
                                  size="small"
                                />
                              )}
                            </TableCell>
                          )}

                          {renderMappingCell(row)}

                          {config.secondaryTargetColumnLabel && (
                            <TableCell>
                              {row.status === 'synced'
                                ? renderStaticLedgerValue(row, row.secondaryTargetLabel ?? '')
                                : renderLedgerSelect(
                                    row,
                                    row.secondaryTargetLabel ?? '',
                                    'Select tally item',
                                    (value) => handleSecondaryTargetChange(row.id, value),
                                    !row.trackInventory,
                                    TALLY_ITEM_OPTIONS,
                                  )}
                            </TableCell>
                          )}

                          <TableCell>
                            {row.status === 'synced'
                              ? renderStaticLedgerValue(row, row.targetLabel)
                              : renderLedgerSelect(
                                  row,
                                  row.targetLabel,
                                  `Select ${config.targetColumnLabel.toLowerCase()}`,
                                  (value) => handleTargetChange(row.id, value),
                                )}
                          </TableCell>

                          {hasAmountFilters && (
                            <TableCell>
                              <Text size="medium" color="surface.text.gray.muted">
                                {row.accountingDate}
                              </Text>
                            </TableCell>
                          )}

                          {hasAmountFilters && (
                            <TableCell>
                              <Amount value={row.amount ?? 0} />
                            </TableCell>
                          )}

                          {config.referenceColumnLabel && (
                            <TableCell>
                              <Text size="medium" color="surface.text.gray.muted">
                                {row.referenceLabel}
                              </Text>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </>
                )}
              </Table>
            </Box>
          )}
        </ListView>
      </Box>

      <SyncBooksModal
        isOpen={isSyncOpen}
        title={`Sync ${config.label.toLowerCase()} entries`}
        description={`This will sync every ${config.label.toLowerCase()} row that Ray has staged as ready for sync.`}
        onClose={() => setIsSyncOpen(false)}
        onComplete={() => syncModule(moduleKey)}
      />
    </>
  )
}

export default AccountingModulePage
