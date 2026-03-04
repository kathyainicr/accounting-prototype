import { useState, useMemo } from 'react'
import styled from 'styled-components'
import {
  Box,
  Text,
  Badge,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownOverlay,
  SelectInput,
  ActionList,
  ActionListItem,
  RayIcon,
  Switch,
} from '@razorpay/blade/components'
import type { TableData } from '@razorpay/blade/components'
import { ResolvedRow, LedgerDropdownWrap } from './MappingCard'
import type { MappingCardData } from './MappingCard'
import type { MappingResolution } from '../types'

// ─── Styled wrapper ────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

// ─── Empty state ──────────────────────────────────────────────────────────────

const AllDoneState = () => (
  <Box
    paddingY="spacing.10"
    display="flex"
    flexDirection="column"
    alignItems="center"
    gap="spacing.2"
  >
    <Text size="medium" weight="semibold" color="surface.text.gray.normal">
      All reviewed
    </Text>
    <Text size="small" color="surface.text.gray.muted">
      Click Next to continue.
    </Text>
  </Box>
)

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  items: MappingCardData[]
  resolutions: Record<string, MappingResolution>
  dropdownLabel: string
  dropdownOptions: string[]
  onReset: (id: string) => void
  showInventoryColumns?: boolean
  itemLedgerOptions?: string[]
}

type MappingTableNode = MappingCardData & { id: string }

// ─── Component ────────────────────────────────────────────────────────────────

export const ConfidenceGroup = ({
  items,
  resolutions,
  dropdownLabel,
  dropdownOptions,
  onReset,
  showInventoryColumns,
  itemLedgerOptions,
}: Props) => {
  const entityLabel = dropdownLabel === 'Tally Ledger'
    ? 'Vendor'
    : dropdownLabel === 'Purchase Ledger'
      ? 'Item'
      : 'Cost Center'

  // Pre-select all items on mount for visual opt-out model
  const [defaultSelectedIds] = useState(() => items.map((i) => i.entityId))

  const [localLedgers, setLocalLedgers] = useState<Record<string, string>>(
    () => Object.fromEntries(items.map((i) => [i.entityId, i.suggestedValue]))
  )
  const [localInventoryToggles, setLocalInventoryToggles] = useState<Record<string, boolean>>(
    () => Object.fromEntries(items.map((i) => [i.entityId, !!i.suggestedItemLedger]))
  )
  const [localItemLedgers, setLocalItemLedgers] = useState<Record<string, string>>(
    () => Object.fromEntries(items.map((i) => [i.entityId, i.suggestedItemLedger ?? '']))
  )

  const pendingItems = useMemo(
    () => items.filter((i) => resolutions[i.entityId]?.status === 'pending'),
    [items, resolutions]
  )
  const resolvedItems = useMemo(
    () => items.filter((i) => resolutions[i.entityId]?.status !== 'pending'),
    [items, resolutions]
  )

  const allResolved = pendingItems.length === 0

  const tableData: TableData<MappingTableNode> = useMemo(() => ({
    nodes: pendingItems.map((i) => ({ ...i, id: i.entityId })),
  }), [pendingItems])

  return (
    <TableWrap>
      <Box flex="1" overflowY="auto">
        {!allResolved && (
          <Table
            data={tableData}
            rowDensity="comfortable"
            selectionType="multiple"
            defaultSelectedIds={defaultSelectedIds}
          >
            {(data) => (
              <>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>{entityLabel}</TableHeaderCell>
                    <TableHeaderCell>Tally Ledger</TableHeaderCell>
                    {showInventoryColumns && <TableHeaderCell>Track inventory</TableHeaderCell>}
                    {showInventoryColumns && <TableHeaderCell>Item ledger</TableHeaderCell>}
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.entityId} item={item}>

                      {/* Entity info */}
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap="spacing.1">
                          <Box display="flex" alignItems="center" gap="spacing.2">
                            <Text size="small" weight="semibold" color="surface.text.gray.normal">
                              {item.entityName}
                            </Text>
                            {item.isNew && <Badge color="notice" size="small">New</Badge>}
                          </Box>
                          {item.billNumber && (
                            <Text size="small" color="surface.text.gray.muted">{item.billNumber}</Text>
                          )}
                          {item.rxName && (
                            <Text size="small" color="surface.text.gray.muted">RazorpayX: {item.rxName}</Text>
                          )}
                        </Box>
                      </TableCell>

                      {/* Tally ledger dropdown */}
                      <TableCell>
                        <LedgerDropdownWrap>
                          <span className="ray-icon">
                            <RayIcon size="small" color="interactive.icon.primary.normal" />
                          </span>
                          <Dropdown selectionType="single">
                            <SelectInput
                              label=""
                              accessibilityLabel={dropdownLabel}
                              placeholder="Search or select..."
                              value={localLedgers[item.entityId] ?? ''}
                              onChange={({ values }) =>
                                setLocalLedgers((prev) => ({ ...prev, [item.entityId]: values[0] ?? '' }))
                              }
                            />
                            <DropdownOverlay>
                              <ActionList>
                                {dropdownOptions.map((opt) => (
                                  <ActionListItem key={opt} title={opt} value={opt} />
                                ))}
                              </ActionList>
                            </DropdownOverlay>
                          </Dropdown>
                        </LedgerDropdownWrap>
                      </TableCell>

                      {/* Inventory toggle — items step only */}
                      {showInventoryColumns && (
                        <TableCell>
                          <Switch
                            accessibilityLabel="Track inventory in Tally"
                            isChecked={localInventoryToggles[item.entityId] ?? false}
                            onChange={({ isChecked }) =>
                              setLocalInventoryToggles((prev) => ({ ...prev, [item.entityId]: isChecked }))
                            }
                            size="small"
                          />
                        </TableCell>
                      )}

                      {/* Item ledger — disabled when inventory off */}
                      {showInventoryColumns && (
                        <TableCell>
                          <LedgerDropdownWrap>
                            <span className="ray-icon">
                              <RayIcon size="small" color="interactive.icon.primary.normal" />
                            </span>
                            <Dropdown selectionType="single">
                              <SelectInput
                                label=""
                                accessibilityLabel="Item ledger"
                                placeholder="Select stock item..."
                                value={localItemLedgers[item.entityId] ?? ''}
                                isDisabled={!localInventoryToggles[item.entityId]}
                                onChange={({ values }) =>
                                  setLocalItemLedgers((prev) => ({ ...prev, [item.entityId]: values[0] ?? '' }))
                                }
                              />
                              <DropdownOverlay>
                                <ActionList>
                                  {(itemLedgerOptions ?? []).map((opt) => (
                                    <ActionListItem key={opt} title={opt} value={opt} />
                                  ))}
                                </ActionList>
                              </DropdownOverlay>
                            </Dropdown>
                          </LedgerDropdownWrap>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        )}

        {/* Resolved rows — only while pending items still exist (for undo context) */}
        {!allResolved && resolvedItems.map((item) => {
          const resolution = resolutions[item.entityId]
          return (
            <ResolvedRow
              key={item.entityId}
              entityName={item.entityName}
              resolution={resolution ?? { entityId: item.entityId, status: 'skipped', mappedTo: '' }}
              onReset={() => onReset(item.entityId)}
            />
          )
        })}

        {allResolved && <AllDoneState />}
      </Box>
    </TableWrap>
  )
}
