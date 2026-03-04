import { useState } from 'react'
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
  QuickFilterGroup,
  QuickFilter,
  Badge,
  Text,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { MOCK_VENDORS, VENDOR_STATUS_CONFIG, MOCK_LEDGER_OPTIONS } from './vendorMockData'
import type { Vendor, VendorStatus } from './vendorMockData'
import { LedgerDropdown } from '../../../components/LedgerDropdown'
import { useAccountingContext } from '../../../context/AccountingContext'
import { VendorDetailDrawer } from './VendorDetailDrawer'

type FilterId = 'all' | VendorStatus

const VendorPage = () => {
  const {
    vendorLedgers,
    pendingVendorLedgers,
    setPendingVendorLedger,
    pendingVendorSyncs,
  } = useAccountingContext()

  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const vendorsWithRuntimeStatus = MOCK_VENDORS.map((v) => ({
    ...v,
    status: (
      vendorLedgers[v.id] ? 'synced'
      : pendingVendorSyncs.has(v.id) ? 'pending_tally_sync'
      : v.status
    ) as VendorStatus,
  }))

  const filteredVendors =
    activeFilter === 'all'
      ? vendorsWithRuntimeStatus
      : vendorsWithRuntimeStatus.filter((v) => v.status === activeFilter)

  const tableData: TableData<Vendor> = { nodes: filteredVendors }
  const hasPendingSync = vendorsWithRuntimeStatus.some((v) => v.status === 'pending_tally_sync')

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6">
      <ListView>
        <ListViewFilters
          quickFilters={
            <QuickFilterGroup
              selectionType="single"
              defaultValue="all"
              onChange={({ values }) => setActiveFilter((values[0] as FilterId) ?? 'all')}
            >
              <QuickFilter title="All vendors" value="all" />
              <QuickFilter title="Categorise" value="categorise" />
              {hasPendingSync && <QuickFilter title="Pending sync" value="pending_tally_sync" />}
              <QuickFilter title="Synced" value="synced" />
            </QuickFilterGroup>
          }
        />

        <Table
          data={tableData}
          marginTop="spacing.5"
          gridTemplateColumns="2fr 1fr 1fr 1fr 2fr 1fr"
          pagination={<TablePagination defaultPageSize={25} showPageSizePicker />}
        >
          {(tableData) => (
            <>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell>Vendor</TableHeaderCell>
                  <TableHeaderCell>GSTIN</TableHeaderCell>
                  <TableHeaderCell>PAN</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Vendor Ledger</TableHeaderCell>
                  <TableHeaderCell>Created On</TableHeaderCell>
                </TableHeaderRow>
              </TableHeader>

              <TableBody>
                {tableData.map((vendor) => {
                  const config = VENDOR_STATUS_CONFIG[vendor.status]
                  const isSynced = vendor.status === 'synced'
                  const isPending = vendor.status === 'pending_tally_sync'
                  const syncedLedger = vendorLedgers[vendor.id] ?? vendor.vendorLedger
                  const pendingLedger = pendingVendorLedgers[vendor.id] ?? ''

                  const ledgerVariant = (() => {
                    if (pendingLedger && pendingLedger === vendor.aiSuggestedLedger) return 'ai-approved'
                    if (pendingLedger) return 'manual'
                    if (vendor.aiSuggestedLedger) return 'ai'
                    return 'empty'
                  })()

                  const ledgerValue = pendingLedger || vendor.aiSuggestedLedger || ''

                  return (
                    <TableRow
                      key={vendor.id}
                      item={vendor}
                      onClick={({ item }) => setSelectedVendor(item)}
                    >
                      <TableCell>
                        <Text size="medium" weight="semibold" color="surface.text.gray.normal">
                          {vendor.name}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text size="medium" color="surface.text.gray.muted">
                          {vendor.gstin ?? '--'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text size="medium" color="surface.text.gray.muted">
                          {vendor.pan ?? '--'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Badge color={config.badgeColor} icon={config.badgeIcon} size="medium">
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSynced ? (
                          <Text size="medium" color="surface.text.gray.muted">
                            {syncedLedger ?? '--'}
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
                              options={MOCK_LEDGER_OPTIONS}
                              aiSuggestedValue={vendor.aiSuggestedLedger}
                              onChange={(val) => setPendingVendorLedger(vendor.id, val)}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Text size="medium" color="surface.text.gray.muted">
                          {vendor.createdOn}
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

      <VendorDetailDrawer
        selectedVendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
      />
    </Box>
  )
}

export default VendorPage
