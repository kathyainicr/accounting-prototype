/**
 * Bills Page — AI Categorisation
 *
 * Uses Blade UI throughout. Custom styled-components are used ONLY for the
 * segmented progress bar (Blade has no segmented ProgressBar). Everything
 * else — layout, typography, badges, tabs, tables — uses Blade components
 * with proper token-based props so it feels native to the dashboard.
 */

import { useState, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Box,
  Heading,
  Text,
  Button,
  Indicator,
  Counter,
  Spinner,
  Tabs,
  TabList,
  TabItem,
  TabPanel,
  ListView,
  ListViewFilters,
  QuickFilterGroup,
  QuickFilter,
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
  Amount,
  Badge,
  Tooltip,
  TooltipInteractiveWrapper,
  RayIcon,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { MOCK_BILLS, STATUS_CONFIG } from './billsMockData'
import type { Bill } from './billsMockData'
import {
  HIGH_CONFIDENCE_BILLS,
  FAF_COUNTS_FRESH,
  FAF_COUNTS_POST_AI,
  FAF_GRAND_TOTAL,
  FAF_DAYS_LEFT,
  AI_SUGGESTION_BY_VENDOR,
  getConfidenceTierMeta,
  type FAFCounts,
  type AIBillSuggestion,
} from './aiMockData'
import { BillDetailDrawer } from './BillDetailDrawer'
import { CategorizeBillModal } from './CategorizeBillPage'

// ─── Types ────────────────────────────────────────────────────────────────────

type AIState = 'idle' | 'processing' | 'done'
type TabId = 'needsAction' | 'readyToSync' | 'pendingToSync' | 'synced' | 'issues' | 'excluded'

// ─── Segment config ───────────────────────────────────────────────────────────

type IndicatorColor = 'positive' | 'information' | 'notice' | 'primary' | 'negative' | 'neutral'

type Segment = {
  key: keyof FAFCounts
  label: string
  barColor: string
  indicatorColor: IndicatorColor
}

const SEGMENTS: Segment[] = [
  { key: 'synced', label: 'Synced', barColor: 'rgba(206,213,222,0.18)', indicatorColor: 'neutral' },
  { key: 'readyToSync', label: 'Ready to sync', barColor: '#008743', indicatorColor: 'positive' },
  { key: 'needsAction', label: 'Categorise', barColor: '#e9690c', indicatorColor: 'primary' },
  { key: 'excluded', label: 'Excluded', barColor: '#8d9bb0', indicatorColor: 'neutral' },
  { key: 'issues', label: 'Error found', barColor: '#b42318', indicatorColor: 'negative' },
]

// ─── Bill data per tab ────────────────────────────────────────────────────────

const NEEDS_ACTION_BILLS = MOCK_BILLS.filter(b => b.status === 'categorise')
const SYNCED_BILLS = MOCK_BILLS.filter(b => b.status === 'synced')
const ISSUES_BILLS = MOCK_BILLS.filter(b => b.status === 'error_found')
const EXCLUDED_BILLS = MOCK_BILLS.filter(b => b.status === 'excluded')

// ─── Minimal custom CSS — segmented bar only ──────────────────────────────────
// Blade's ProgressBar is single-color; the segmented pattern needs custom CSS.

const grow = keyframes`from { opacity: 0 } to { opacity: 1 }`
const gradientFlow = keyframes`from { background-position: 0% center } to { background-position: 200% center }`

const BarTrack = styled.div`
  height: 8px;
  border-radius: 1px;
  overflow: hidden;
  display: flex;
  gap: 2px;
  background: rgba(206, 213, 222, 0.18);
`

const BarSeg = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color};
  flex-shrink: 0;
  border-radius: 1px;
  animation: ${grow} 0.3s ease both;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
`

const AiPanel = styled.div`
  width: 313px;
  min-height: 210px;
  background: #033e3e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`

const GradientHeading = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  background: linear-gradient(90deg, #48d08c 0%, #ffffff 40%, #48d08c 80%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientFlow} 3s linear infinite;
`

const AiButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.72);
  cursor: pointer;
  height: 36px;
  white-space: nowrap;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  &:active {
    background: rgba(255, 255, 255, 0.8);
  }
`

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 150ms ease;

  tr:hover & {
    opacity: 1;
  }
`

const DateText = styled.span`
  position: absolute;
  left: 0;
  opacity: 1;
  transition: opacity 150ms ease;

  tr:hover & {
    opacity: 0;
  }
`

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Reusable Blade Table for any list of Bills */
const BillsTable = ({
  bills,
  onRowClick,
  showConfidence = false,
  showStatus = false,
}: {
  bills: Bill[]
  onRowClick: (bill: Bill) => void
  showConfidence?: boolean
  showStatus?: boolean
}) => {
  const tableData: TableData<Bill> = { nodes: bills }
  const cols = [
    '2fr', '1fr', '1fr',
    ...(showStatus ? ['190px'] : []),
    ...(showConfidence ? ['120px'] : []),
    '1fr',
  ].join(' ')
  return (
    <Table
      data={tableData}
      marginTop="spacing.5"
      gridTemplateColumns={cols}
      pagination={<TablePagination defaultPageSize={25} showPageSizePicker />}
    >
      {(data) => (
        <>
          <TableHeader>
            <TableHeaderRow>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Bill Number</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              {showStatus && <TableHeaderCell>Status</TableHeaderCell>}
              {showConfidence && <TableHeaderCell>Confidence</TableHeaderCell>}
              <TableHeaderCell>Created On</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {data.map((bill) => {
              const suggestion = showConfidence ? AI_SUGGESTION_BY_VENDOR[bill.vendor] : null
              const meta = suggestion ? getConfidenceTierMeta(suggestion.confidence) : null
              const statusConfig = STATUS_CONFIG[bill.status]
              return (
                <TableRow key={bill.id} item={bill} onClick={({ item }) => onRowClick(item)}>
                  <TableCell>
                    <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                      {bill.vendor}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size="medium" color="surface.text.gray.muted">{bill.billNumber}</Text>
                  </TableCell>
                  <TableCell><Amount value={bill.amount} /></TableCell>
                  {showStatus && (
                    <TableCell>
                      <Badge
                        color={statusConfig.badgeColor === 'primary' ? 'information' : statusConfig.badgeColor}
                        icon={statusConfig.badgeIcon}
                        size="medium"
                      >
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  )}
                  {showConfidence && (
                    <TableCell>
                      {meta && (
                        <Tooltip
                          title={`${suggestion!.confidenceScore}% confidence`}
                          content={suggestion!.signalSource}
                        >
                          <TooltipInteractiveWrapper>
                            <Badge color={meta.color} icon={RayIcon} size="small">{meta.label}</Badge>
                          </TooltipInteractiveWrapper>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Text size="medium" color="surface.text.gray.muted">{bill.createdOn}</Text>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </>
      )}
    </Table>
  )
}

/** Needs Review table — shows Confidence pill + inline hover actions */
const NeedsActionTable = ({
  bills,
  onRowClick,
  onCategorise,
}: {
  bills: Bill[]
  onRowClick: (bill: Bill) => void
  onCategorise: (bill: Bill) => void
}) => {
  const tableData: TableData<Bill> = { nodes: bills }
  return (
    <Table
      data={tableData}
      marginTop="spacing.5"
      gridTemplateColumns="2fr 1fr 1fr 120px 260px"
      pagination={<TablePagination defaultPageSize={25} showPageSizePicker />}
    >
      {(data) => (
        <>
          <TableHeader>
            <TableHeaderRow>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Bill Number</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Confidence</TableHeaderCell>
              <TableHeaderCell>Created On</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {data.map((bill) => {
              const suggestion = AI_SUGGESTION_BY_VENDOR[bill.vendor]
              const meta = suggestion ? getConfidenceTierMeta(suggestion.confidence) : null
              return (
                <TableRow key={bill.id} item={bill} onClick={({ item }) => onRowClick(item)}>
                  <TableCell>
                    <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                      {bill.vendor}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size="medium" color="surface.text.gray.muted">{bill.billNumber}</Text>
                  </TableCell>
                  <TableCell><Amount value={bill.amount} /></TableCell>
                  <TableCell>
                    {meta && (
                      <Tooltip
                        title={`${suggestion!.confidenceScore}% confidence`}
                        content={suggestion!.signalSource}
                      >
                        <TooltipInteractiveWrapper>
                          <Badge color={meta.color} icon={RayIcon} size="small">
                            {meta.label}
                          </Badge>
                        </TooltipInteractiveWrapper>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box position="relative" display="flex" alignItems="center" justifyContent="flex-end">
                      <DateText>
                        <Text size="medium" color="surface.text.gray.muted">{bill.createdOn}</Text>
                      </DateText>
                      <RowActions>
                        <Button
                          size="small"
                          variant="primary"
                          onClick={(event) => { event.stopPropagation(); onRowClick(bill) }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={(event) => { event.stopPropagation(); onCategorise(bill) }}
                        >
                          Categorise
                        </Button>
                      </RowActions>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </>
      )}
    </Table>
  )
}

/** Ready to Sync table — checkbox selection + toolbar bulk sync + row hover actions */
const ReadyToSyncTable = ({
  bills,
  onRowClick,
  onAccept,
  onBulkSync,
}: {
  bills: Bill[]
  onRowClick: (bill: Bill) => void
  onAccept: (bill: Bill) => void
  onBulkSync: (bills: Bill[]) => void
}) => {
  const [selectedBills, setSelectedBills] = useState<Bill[]>([])
  const tableData: TableData<Bill> = { nodes: bills }

  const handleBulkSyncClick = () => {
    onBulkSync(selectedBills)
    setSelectedBills([])
  }

  return (
    <Table
      data={tableData}
      selectionType="multiple"
      onSelectionChange={({ values }) => setSelectedBills(values)}
      marginTop="spacing.5"
      pagination={<TablePagination defaultPageSize={25} showPageSizePicker />}
      toolbar={
        <TableToolbar
          title={`${bills.length} bills ready to sync with Tally`}
          selectedTitle={`${selectedBills.length} bills selected`}
        >
          <TableToolbarActions>
            <Box flexShrink={0}>
              <Button
                variant="primary"
                isDisabled={selectedBills.length === 0}
                onClick={handleBulkSyncClick}
              >
                {selectedBills.length > 0 ? `Sync ${selectedBills.length} bills` : 'Sync to Tally'}
              </Button>
            </Box>
          </TableToolbarActions>
        </TableToolbar>
      }
    >
      {(data) => (
        <>
          <TableHeader>
            <TableHeaderRow>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Bill Number</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Confidence</TableHeaderCell>
              <TableHeaderCell>Created On</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {data.map((bill) => {
              const suggestion = AI_SUGGESTION_BY_VENDOR[bill.vendor]
              const meta = suggestion ? getConfidenceTierMeta(suggestion.confidence) : null
              return (
                <TableRow
                  key={bill.id}
                  item={bill}
                  onClick={({ item }) => onRowClick(item)}
                  hoverActions={
                    <Box display="flex" gap="spacing.2">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={(event) => { event.stopPropagation(); onAccept(bill) }}
                      >
                        Sync to Tally
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={(event) => { event.stopPropagation(); onRowClick(bill) }}
                      >
                        View Details
                      </Button>
                    </Box>
                  }
                >
                  <TableCell>
                    <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                      {bill.vendor}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text size="medium" color="surface.text.gray.muted">{bill.billNumber}</Text>
                  </TableCell>
                  <TableCell><Amount value={bill.amount} /></TableCell>
                  <TableCell>
                    {meta && (
                      <Tooltip
                        title={`${suggestion!.confidenceScore}% confidence`}
                        content={suggestion!.signalSource}
                      >
                        <TooltipInteractiveWrapper>
                          <Badge color={meta.color} icon={RayIcon} size="small">{meta.label}</Badge>
                        </TooltipInteractiveWrapper>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Text size="medium" color="surface.text.gray.muted">{bill.createdOn}</Text>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </>
      )}
    </Table>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const BillsPage = () => {
  const [aiState, setAiState] = useState<AIState>('idle')
  const [activeTab, setActiveTab] = useState<TabId>('needsAction')
  const [counts, setCounts] = useState<FAFCounts>(FAF_COUNTS_FRESH)
  const [ftuxFilter, setFtuxFilter] = useState<string>('all')

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [selectedAiSuggestion, setSelectedAiSuggestion] = useState<AIBillSuggestion | undefined>()
  const [categorizeBill, setCategorizeBill] = useState<Bill | null>(null)
  const [categorizeBillSuggestion, setCategorizeBillSuggestion] = useState<AIBillSuggestion | undefined>()
  const [acceptedBillIds, setAcceptedBillIds] = useState<Set<string>>(new Set())
  const [excludedBillIds, setExcludedBillIds] = useState<Set<string>>(new Set())
  const [syncedFromReadyIds, setSyncedFromReadyIds] = useState<Set<string>>(new Set())
  const [pendingToSyncBills, setPendingToSyncBills] = useState<Bill[]>([])

  const needsActionBills = useMemo(() => {
    const base = NEEDS_ACTION_BILLS.filter(b => !acceptedBillIds.has(b.id) && !excludedBillIds.has(b.id))
    if (aiState !== 'done') return base
    // High-confidence bills move to Ready to Sync; only medium/low remain here
    return base.filter(b => {
      const s = AI_SUGGESTION_BY_VENDOR[b.vendor]
      return !s || s.confidence !== 'high'
    })
  }, [acceptedBillIds, excludedBillIds, aiState])

  const ftuxFilteredBills = useMemo(() => {
    if (ftuxFilter === 'all') return MOCK_BILLS
    return MOCK_BILLS.filter(b => b.status === ftuxFilter)
  }, [ftuxFilter])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAutoCategorise = () => {
    if (aiState !== 'idle') return
    setAiState('processing')
    setTimeout(() => {
      setAiState('done')
      setCounts(FAF_COUNTS_POST_AI)
      setActiveTab('needsAction')
    }, 2000)
  }

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill)
    setSelectedAiSuggestion(
      aiState === 'done' ? AI_SUGGESTION_BY_VENDOR[bill.vendor] : undefined
    )
  }

  const handleSaveAndNext = (bill: Bill) => {
    setAcceptedBillIds(prev => new Set([...prev, bill.id]))
    setCounts(prev => ({
      ...prev,
      needsAction: Math.max(0, prev.needsAction - 1),
      readyToSync: prev.readyToSync + 1,
    }))
    const currentIndex = needsActionBills.findIndex(b => b.id === bill.id)
    const nextBill = needsActionBills[currentIndex + 1] ?? null
    setCategorizeBill(nextBill)
    setCategorizeBillSuggestion(
      nextBill && aiState === 'done' ? AI_SUGGESTION_BY_VENDOR[nextBill.vendor] : undefined
    )
  }

  const handleExclude = (bill: Bill) => {
    setExcludedBillIds(prev => new Set([...prev, bill.id]))
    setCounts(prev => ({
      ...prev,
      needsAction: Math.max(0, prev.needsAction - 1),
      excluded: prev.excluded + 1,
    }))
    setSelectedBill(null)
    setSelectedAiSuggestion(undefined)
  }

  const handleCategorise = (bill: Bill) => {
    setSelectedBill(null)
    setCategorizeBillSuggestion(aiState === 'done' ? AI_SUGGESTION_BY_VENDOR[bill.vendor] : undefined)
    setCategorizeBill(bill)
  }

  const handleExcludeFromReady = (bill: Bill) => {
    setSyncedFromReadyIds(prev => new Set([...prev, bill.id]))
    setCounts(prev => ({
      ...prev,
      readyToSync: Math.max(0, prev.readyToSync - 1),
      excluded: prev.excluded + 1,
    }))
    setSelectedBill(null)
    setSelectedAiSuggestion(undefined)
  }

  // Queues a single bill for Tally sync — moves it from Ready to Sync → Pending to Sync
  const handleQueueForSync = (bill: Bill) => {
    setSyncedFromReadyIds(prev => new Set([...prev, bill.id]))
    setPendingToSyncBills(prev => [...prev, bill])
    setCounts(prev => ({
      ...prev,
      readyToSync: Math.max(0, prev.readyToSync - 1),
      pendingToSync: prev.pendingToSync + 1,
    }))
    setSelectedBill(null)
    setSelectedAiSuggestion(undefined)
  }

  // Queues multiple selected bills — moves them from Ready to Sync → Pending to Sync
  const handleBulkSync = (bills: Bill[]) => {
    const ids = bills.map(b => b.id)
    setSyncedFromReadyIds(prev => new Set([...prev, ...ids]))
    setPendingToSyncBills(prev => [...prev, ...bills])
    setCounts(prev => ({
      ...prev,
      readyToSync: Math.max(0, prev.readyToSync - ids.length),
      pendingToSync: prev.pendingToSync + ids.length,
    }))
  }

  const readyToSyncBills = useMemo(() => {
    const seen = new Set<string>()
    return HIGH_CONFIDENCE_BILLS
      .map(s => MOCK_BILLS.find(b => b.vendor === s.vendor) ?? MOCK_BILLS[0])
      .filter(b => {
        if (seen.has(b.id) || syncedFromReadyIds.has(b.id)) return false
        seen.add(b.id)
        return true
      })
  }, [syncedFromReadyIds])

  const pctSynced = Math.round((counts.synced / FAF_GRAND_TOTAL) * 100)

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6">

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      <Box
        display="flex"
        flexDirection="row"
        borderWidth="thinner"
        borderStyle="solid"
        borderColor="surface.border.gray.subtle"
        borderRadius="medium"
        overflow="hidden"
        backgroundColor="surface.background.gray.intense"
        minHeight="210px"
      >
        {/* Left: stats + progress bar + legend */}
        <Box
          flex="1"
          padding="spacing.5"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap="spacing.5"
        >
          {/* Top: 3 stat columns */}
          <Box display="flex" gap="spacing.8" alignItems="flex-start">
            <Box display="flex" flexDirection="column" gap="spacing.1">
              <Text size="medium" color="surface.text.gray.muted">Book closure in</Text>
              <Heading
                size="large"
                weight="semibold"
                color={FAF_DAYS_LEFT <= 7 ? 'feedback.text.negative.intense' : 'surface.text.gray.subtle'}
              >
                {String(FAF_DAYS_LEFT).padStart(2, '0')} days
              </Heading>
            </Box>

            <Box display="flex" flexDirection="column" gap="spacing.1">
              <Text size="small" color="surface.text.gray.muted">Total Transactions</Text>
              <Heading size="large" weight="semibold" color="surface.text.gray.subtle">
                {FAF_GRAND_TOTAL.toLocaleString('en-IN')}
              </Heading>
            </Box>

            <Box display="flex" flexDirection="column" gap="spacing.1">
              <Text size="small" color="surface.text.gray.muted">Percentage synced</Text>
              <Heading size="large" weight="semibold" color="surface.text.gray.subtle">
                {pctSynced}%
              </Heading>
            </Box>
          </Box>

          {/* Bottom: bar + legend */}
          <Box>
            <BarTrack>
              {SEGMENTS.map(seg => {
                const count = counts[seg.key]
                const pct = (count / FAF_GRAND_TOTAL) * 100
                return pct > 0
                  ? <BarSeg key={seg.key} $pct={pct} $color={seg.barColor} />
                  : null
              })}
            </BarTrack>

            <Box display="flex" gap="spacing.8" marginTop="spacing.4">
              {SEGMENTS.map(seg => {
                const count = counts[seg.key]
                return (
                  <Box key={seg.key} display="flex" gap="spacing.1" alignItems="flex-start">
                    <Box display="flex" alignItems="center" paddingTop="spacing.2">
                      <Indicator color={seg.indicatorColor} size="small" accessibilityLabel={seg.label} />
                    </Box>
                    <Box display="flex" flexDirection="column" gap="spacing.0">
                      <Text size="small" color="surface.text.gray.muted">{seg.label}</Text>
                      <Text size="small" color="surface.text.gray.subtle">{count.toLocaleString('en-IN')}</Text>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* Right: Ray AI action panel */}
        <AiPanel>
          <AnimatePresence mode="wait">
            {aiState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '249px' }}
              >
                {/* Logo + heading + description */}
                <Box display="flex" flexDirection="column" gap="spacing.2" alignItems="center" width="100%">
                  <Box display="flex" alignItems="center" gap="spacing.2" justifyContent="center">
                    <RayIcon size="medium" color="feedback.icon.positive.intense" />
                    <GradientHeading>Categorise with AI</GradientHeading>
                  </Box>
                  <Text size="small" color="surface.text.gray.muted" textAlign="center">
                    Ray AI will analyse {counts.needsAction} bills and suggest Tally ledger mappings.
                  </Text>
                </Box>

                <AiButton onClick={handleAutoCategorise}>
                  <RayIcon size="small" color="interactive.icon.staticBlack.muted" />
                  Run Auto Categorise
                </AiButton>
              </motion.div>
            )}

            {aiState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '249px' }}
              >
                <Box display="flex" alignItems="center" gap="spacing.3">
                  <Spinner size="medium" accessibilityLabel="Ray is categorising your bills" />
                  <Text size="medium" weight="semibold" color="surface.text.staticWhite.normal">
                    Analysing bills...
                  </Text>
                </Box>
                <Text size="small" color="surface.text.gray.muted" textAlign="center">
                  Matching against your Tally ledgers and history.
                </Text>
              </motion.div>
            )}

            {aiState === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '249px' }}
              >
                <Box display="flex" flexDirection="column" gap="spacing.2" alignItems="center" width="100%">
                  <Box display="flex" alignItems="center" gap="spacing.2" justifyContent="center">
                    <RayIcon size="medium" color="feedback.icon.positive.intense" />
                    <GradientHeading>Here you go...</GradientHeading>
                  </Box>
                </Box>

                <Box display="flex" gap="spacing.8" justifyContent="center" width="100%">
                  <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.1">
                    <Heading size="large" weight="semibold" color="feedback.text.positive.intense">
                      {counts.readyToSync}
                    </Heading>
                    <Box display="flex" alignItems="center" gap="spacing.2">
                      <Indicator color="positive" size="small" accessibilityLabel="Ready to sync" />
                      <Text size="small" color="surface.text.staticWhite.subtle">Ready to sync</Text>
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.1">
                    <Heading size="large" weight="semibold" color="feedback.text.notice.intense">
                      {counts.needsAction}
                    </Heading>
                    <Box display="flex" alignItems="center" gap="spacing.2">
                      <Indicator color="notice" size="small" accessibilityLabel="Needs review" />
                      <Text size="small" color="surface.text.staticWhite.subtle">Need review</Text>
                    </Box>
                  </Box>
                </Box>

                <AiButton onClick={() => setActiveTab('needsAction')} style={{ width: '100%', justifyContent: 'center' }}>
                  Review flagged bills
                </AiButton>
              </motion.div>
            )}
          </AnimatePresence>
        </AiPanel>
      </Box>

      {/* ── Bill list: QuickFilter ListView (FTUX) or Tabs (post-AI) ──────── */}
      {aiState !== 'done' ? (
        <ListView>
          <ListViewFilters
            quickFilters={
              <QuickFilterGroup
                selectionType="single"
                defaultValue="all"
                value={ftuxFilter}
                onChange={({ values }) => setFtuxFilter(values[0] ?? 'all')}
              >
                <QuickFilter title="All" value="all" trailing={<Counter value={MOCK_BILLS.length} color="neutral" />} />
                <QuickFilter title="Categorise" value="categorise" trailing={<Counter value={NEEDS_ACTION_BILLS.length} color="notice" />} />
                <QuickFilter title="Synced" value="synced" trailing={<Counter value={SYNCED_BILLS.length} color="positive" />} />
                <QuickFilter title="Error Found" value="error_found" trailing={<Counter value={ISSUES_BILLS.length} color="negative" />} />
                <QuickFilter title="Excluded" value="excluded" trailing={<Counter value={EXCLUDED_BILLS.length} color="neutral" />} />
              </QuickFilterGroup>
            }
          />
          <BillsTable bills={ftuxFilteredBills} onRowClick={handleBillClick} showStatus />
        </ListView>
      ) : (
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as TabId)}
          variant="bordered"
          size="medium"
          isLazy
        >
          <TabList>
            <TabItem value="needsAction" trailing={<Counter value={counts.needsAction} color="notice" />}>
              Needs Review
            </TabItem>
            <TabItem value="readyToSync" trailing={<Counter value={counts.readyToSync} color="positive" />}>
              Ready to sync
            </TabItem>
            <TabItem value="pendingToSync" trailing={<Counter value={counts.pendingToSync} color="information" />}>
              Pending to sync
            </TabItem>
            <TabItem value="synced" trailing={<Counter value={counts.synced} color="positive" />}>
              Synced
            </TabItem>
            <TabItem value="excluded" trailing={<Counter value={counts.excluded} color="neutral" />}>
              Excluded
            </TabItem>
            <TabItem value="issues" trailing={<Counter value={counts.issues} color="negative" />}>
              Error Found
            </TabItem>
          </TabList>

          <TabPanel value="needsAction">
            <NeedsActionTable
              bills={needsActionBills}
              onRowClick={handleBillClick}
              onCategorise={handleCategorise}
            />
          </TabPanel>

          <TabPanel value="readyToSync">
            <ReadyToSyncTable
              bills={readyToSyncBills}
              onRowClick={handleBillClick}
              onAccept={handleQueueForSync}
              onBulkSync={handleBulkSync}
            />
          </TabPanel>

          <TabPanel value="pendingToSync">
            <ListView>
              <ListViewFilters
                quickFilters={
                  <QuickFilterGroup selectionType="single" defaultValue="all">
                    <QuickFilter
                      title="All"
                      value="all"
                      trailing={<Counter value={pendingToSyncBills.length} color="information" />}
                    />
                  </QuickFilterGroup>
                }
              />
              <BillsTable bills={pendingToSyncBills} onRowClick={handleBillClick} showConfidence />
            </ListView>
          </TabPanel>

          <TabPanel value="synced">
            <BillsTable bills={SYNCED_BILLS} onRowClick={handleBillClick} />
          </TabPanel>

          <TabPanel value="issues">
            <BillsTable bills={ISSUES_BILLS} onRowClick={handleBillClick} />
          </TabPanel>

          <TabPanel value="excluded">
            <BillsTable bills={EXCLUDED_BILLS} onRowClick={handleBillClick} />
          </TabPanel>
        </Tabs>
      )}

      {/* Drawers */}
      <BillDetailDrawer
        selectedBill={selectedBill}
        aiSuggestion={selectedAiSuggestion}
        onClose={() => setSelectedBill(null)}
        onCategorise={handleCategorise}
        onExclude={activeTab === 'readyToSync' ? handleExcludeFromReady : handleExclude}
        isReadyToSync={activeTab === 'readyToSync'}
        onAccept={handleQueueForSync}
      />
      <CategorizeBillModal
        bill={categorizeBill}
        isOpen={!!categorizeBill}
        onClose={() => setCategorizeBill(null)}
        onSave={handleSaveAndNext}
        aiSuggestion={categorizeBillSuggestion}
      />
    </Box>
  )
}

export default BillsPage
