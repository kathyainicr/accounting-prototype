import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Box,
  Heading,
  Text,
  Indicator,
  Counter,
  Amount,
  Badge,
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
  RayIcon,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { MOCK_BILLS, STATUS_CONFIG } from './billsMockData'
import type { Bill } from './billsMockData'
import { FAF_GRAND_TOTAL, FAF_DAYS_LEFT, FAF_COUNTS_FRESH } from './aiMockData'
import { BillDetailDrawer } from './BillDetailDrawer'
import { CategorizeBillModal } from './CategorizeBillPage'

type IndicatorColor = 'positive' | 'information' | 'notice' | 'primary' | 'negative' | 'neutral'

type Segment = {
  key: keyof typeof FAF_COUNTS_FRESH
  label: string
  barColor: string
  indicatorColor: IndicatorColor
}

const SEGMENTS: Segment[] = [
  { key: 'synced',       label: 'Synced',        barColor: 'rgba(206,213,222,0.18)', indicatorColor: 'neutral' },
  { key: 'readyToSync',  label: 'Ready to sync', barColor: '#008743',               indicatorColor: 'positive' },
  { key: 'needsAction',  label: 'Categorise',    barColor: '#e9690c',               indicatorColor: 'primary' },
  { key: 'excluded',     label: 'Excluded',      barColor: '#8d9bb0',               indicatorColor: 'neutral' },
  { key: 'issues',       label: 'Error found',   barColor: '#b42318',               indicatorColor: 'negative' },
]

const NEEDS_ACTION_BILLS = MOCK_BILLS.filter(b => b.status === 'categorise')
const SYNCED_BILLS       = MOCK_BILLS.filter(b => b.status === 'synced')
const ISSUES_BILLS       = MOCK_BILLS.filter(b => b.status === 'error_found')
const EXCLUDED_BILLS     = MOCK_BILLS.filter(b => b.status === 'excluded')

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

const BillsTable = ({
  bills,
  onRowClick,
  showStatus = false,
}: {
  bills: Bill[]
  onRowClick: (bill: Bill) => void
  showStatus?: boolean
}) => {
  const tableData: TableData<Bill> = { nodes: bills }
  const cols = ['2fr', '1fr', '1fr', ...(showStatus ? ['190px'] : []), '1fr'].join(' ')

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
              <TableHeaderCell>Created On</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {data.map((bill) => {
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

const BillsPage = () => {
  const [ftuxFilter, setFtuxFilter] = useState('all')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [categorizeBill, setCategorizeBill] = useState<Bill | null>(null)

  const counts = FAF_COUNTS_FRESH
  const pctSynced = Math.round((counts.synced / FAF_GRAND_TOTAL) * 100)

  const ftuxFilteredBills = ftuxFilter === 'all'
    ? MOCK_BILLS
    : MOCK_BILLS.filter(b => b.status === ftuxFilter)

  const handleBillClick = (bill: Bill) => setSelectedBill(bill)

  const handleCategorise = (bill: Bill) => {
    setSelectedBill(null)
    setCategorizeBill(bill)
  }

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6">

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
        <Box
          flex="1"
          padding="spacing.5"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap="spacing.5"
        >
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
              {SEGMENTS.map(seg => (
                <Box key={seg.key} display="flex" gap="spacing.1" alignItems="flex-start">
                  <Box display="flex" alignItems="center" paddingTop="spacing.2">
                    <Indicator color={seg.indicatorColor} size="small" accessibilityLabel={seg.label} />
                  </Box>
                  <Box display="flex" flexDirection="column" gap="spacing.0">
                    <Text size="small" color="surface.text.gray.muted">{seg.label}</Text>
                    <Text size="small" color="surface.text.gray.subtle">
                      {counts[seg.key].toLocaleString('en-IN')}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <AiPanel>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="spacing.8"
          >
            <Box display="flex" flexDirection="column" gap="spacing.2" alignItems="center" width="100%">
              <Box display="flex" alignItems="center" gap="spacing.2" justifyContent="center">
                <RayIcon size="medium" color="feedback.icon.positive.intense" />
                <GradientHeading>Categorise with AI</GradientHeading>
              </Box>
              <Text size="small" color="surface.text.gray.muted" textAlign="center">
                Ray AI will analyse {NEEDS_ACTION_BILLS.length} bills and suggest Tally ledger mappings.
              </Text>
            </Box>
            <AiButton type="button">
              <RayIcon size="small" color="interactive.icon.staticBlack.muted" />
              Run Auto Categorise
            </AiButton>
          </Box>
        </AiPanel>
      </Box>

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

      <BillDetailDrawer
        selectedBill={selectedBill}
        onClose={() => setSelectedBill(null)}
        onCategorise={handleCategorise}
        onExclude={() => setSelectedBill(null)}
      />
      <CategorizeBillModal
        bill={categorizeBill}
        isOpen={!!categorizeBill}
        onClose={() => setCategorizeBill(null)}
        onSave={() => setCategorizeBill(null)}
      />
    </Box>
  )
}

export default BillsPage
