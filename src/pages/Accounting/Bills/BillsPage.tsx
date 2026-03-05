import { useState } from 'react'
import {
  Box,
  Text,
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
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { MOCK_BILLS, STATUS_CONFIG } from './billsMockData'
import type { Bill } from './billsMockData'
import { FAF_GRAND_TOTAL, FAF_DAYS_LEFT, FAF_COUNTS_FRESH } from './aiMockData'
import { BillDetailDrawer } from './BillDetailDrawer'
import { CategorizeBillModal } from './CategorizeBillPage'
import {
  AccountingStatsCard,
  AccountingAiPanel,
} from '../shared/components/AccountingStatsCard'

type IndicatorColor = 'positive' | 'information' | 'notice' | 'primary' | 'negative' | 'neutral'

type Segment = {
  key: keyof typeof FAF_COUNTS_FRESH
  label: string
  barColor: string
  indicatorColor: IndicatorColor
}

const SEGMENTS: Segment[] = [
  { key: 'synced',      label: 'Synced',        barColor: 'rgba(206,213,222,0.18)', indicatorColor: 'neutral' },
  { key: 'readyToSync', label: 'Ready to sync', barColor: '#008743',               indicatorColor: 'positive' },
  { key: 'needsAction', label: 'Categorise',    barColor: '#e9690c',               indicatorColor: 'primary' },
  { key: 'excluded',    label: 'Excluded',      barColor: '#8d9bb0',               indicatorColor: 'neutral' },
  { key: 'issues',      label: 'Error found',   barColor: '#b42318',               indicatorColor: 'negative' },
]

const NEEDS_ACTION_BILLS = MOCK_BILLS.filter(b => b.status === 'categorise')
const SYNCED_BILLS       = MOCK_BILLS.filter(b => b.status === 'synced')
const ISSUES_BILLS       = MOCK_BILLS.filter(b => b.status === 'error_found')
const EXCLUDED_BILLS     = MOCK_BILLS.filter(b => b.status === 'excluded')

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

      <AccountingStatsCard
        daysLeft={FAF_DAYS_LEFT}
        totalLabel="Total Transactions"
        totalCount={FAF_GRAND_TOTAL}
        pctSynced={pctSynced}
        grandTotal={FAF_GRAND_TOTAL}
        segments={SEGMENTS.map(seg => ({
          label: seg.label,
          barColor: seg.barColor,
          indicatorColor: seg.indicatorColor,
          count: counts[seg.key],
        }))}
      >
        <AccountingAiPanel
          title="Categorise with AI"
          description={`Ray AI will analyse ${NEEDS_ACTION_BILLS.length} bills and suggest Tally ledger mappings.`}
          buttonLabel="Run Auto Categorise"
        />
      </AccountingStatsCard>

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
