import { useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import {
  Box,
  Text,
  Button,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Tabs,
  TabList,
  TabItem,
  TabPanel,
  Dropdown,
  DropdownOverlay,
  ActionList,
  ActionListItem,
  SelectInput,
  Switch,
  Tooltip,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '@razorpay/blade/components'
import { useAccountingV4 } from '../../context/AccountingV4Context'
import { useAccountingV3Context } from '../../context/AccountingV3Context'
import { V4_ENTITY_CONFIG } from './data'
import type { V4EntityKey, V4MappingRow } from './types'
import type { V3ReviewRow } from '../AccountingV3/types'

// ─── Width override — Blade Drawer capped at ~480px; force wider ──────────────

const WideDrawerGlobal = createGlobalStyle`
  [class*="AnimatedDrawerContainer"] {
    width: 740px !important;
    max-width: 740px !important;
  }
`

// ─── Styled ────────────────────────────────────────────────────────────────────


const EmptyMsg = styled.div`
  padding: 48px 0;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 13px;
`

const IconInputWrap = styled.div`
  position: relative;
  width: 100%;

  /* Nudge Blade's inner input text right to leave room for the icon */
  [class*="StyledBaseButton"],
  [class*="AnimatedBaseInputWrapper"] {
    padding-left: 28px !important;
  }

  /* Make the Blade select input fill available width */
  [data-blade-component="select-input"],
  [data-blade-component="dropdown"] {
    width: 100%;
  }
`

const InputIconOverlay = styled.div<{ $color: string }>`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
`

// ─── Table block ───────────────────────────────────────────────────────────────

function MappingTableBlock({
  rows,
  entityKey,
  config,
  showTallyItem,
}: {
  rows: V4MappingRow[]
  entityKey: V4EntityKey
  config: typeof V4_ENTITY_CONFIG[V4EntityKey]
  showTallyItem: boolean
}) {
  const { updateEntityMapping } = useAccountingV4()

  if (rows.length === 0) {
    return <EmptyMsg>No items here</EmptyMsg>
  }

  return (
    <Table<V4MappingRow> data={{ nodes: rows }}>
      {(tableData) => (
        <>
          <TableHeader>
            <TableHeaderRow>
              <TableHeaderCell>{config.sourceColumnLabel}</TableHeaderCell>
              <TableHeaderCell>{config.targetColumnLabel}</TableHeaderCell>
              {showTallyItem && config.secondaryTargetOptions && (
                <TableHeaderCell>{config.secondaryTargetColumnLabel}</TableHeaderCell>
              )}
            </TableHeaderRow>
          </TableHeader>

          <TableBody>
            {tableData.map((row) => {
              const handleTargetChange = (value: string) =>
                updateEntityMapping(entityKey, row.id, (r) => ({
                  ...r,
                  targetLabel: value,
                  // mappingState intentionally NOT changed here — rows stay in
                  // "Needs review" until the Save button is clicked
                }))

              const handleSecondaryChange = (value: string) =>
                updateEntityMapping(entityKey, row.id, (r) => ({
                  ...r,
                  secondaryTargetLabel: value,
                }))

              return (
                <TableRow key={row.id} item={row}>
                  {/* Source */}
                  <TableCell>
                    <Text size="small" weight="semibold">{row.sourceLabel}</Text>
                  </TableCell>

                  {/* Target ledger — real dropdown for all states */}
                  <TableCell>

                    {(() => {
                      const prefixIcon = row.mappingState === 'missing' ? (
                        <InputIconOverlay $color="#f59e0b">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </InputIconOverlay>
                      ) : row.mappingState === 'ray' ? (
                        <InputIconOverlay $color="#00d084">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
                          </svg>
                        </InputIconOverlay>
                      ) : null

                      const dropdown = (
                        <Dropdown>
                          <SelectInput
                            label=""
                            placeholder="Select ledger"
                            value={row.targetLabel || undefined}
                            size="small"
                            onChange={({ values }) => handleTargetChange(values[0] ?? '')}
                          />
                          <DropdownOverlay>
                            <ActionList>
                              {config.targetOptions.map((opt) => (
                                <ActionListItem key={opt} title={opt} value={opt} />
                              ))}
                            </ActionList>
                          </DropdownOverlay>
                        </Dropdown>
                      )

                      // Always wrap in IconInputWrap so all cells share the same width
                      const wrappedDropdown = (
                        <IconInputWrap>
                          {prefixIcon}
                          {dropdown}
                        </IconInputWrap>
                      )

                      return row.explanation ? (
                        <Tooltip content={row.explanation} placement="top">
                          <Box>{wrappedDropdown}</Box>
                        </Tooltip>
                      ) : wrappedDropdown
                    })()}
                  </TableCell>

                  {/* Tally Item — only when track inventory is on */}
                  {showTallyItem && config.secondaryTargetOptions && (
                    <TableCell>
                      <Dropdown>
                        <SelectInput
                          label=""
                          placeholder={row.secondaryTargetLabel || 'Select item'}
                          value={row.secondaryTargetLabel || undefined}
                          size="small"
                          onChange={({ values }) => handleSecondaryChange(values[0] ?? '')}
                        />
                        <DropdownOverlay>
                          <ActionList>
                            {config.secondaryTargetOptions.map((opt) => (
                              <ActionListItem key={opt} title={opt} value={opt} />
                            ))}
                          </ActionList>
                        </DropdownOverlay>
                      </Dropdown>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </>
      )}
    </Table>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

type Props = {
  entityKey: V4EntityKey
  onClose: () => void
  /** Fires after Save — receives the entity key + IDs of bills being auto-mapped */
  onSaved?: (key: V4EntityKey, autoMappedIds: string[]) => void
}

export default function AccountingV4MappingModal({ entityKey, onClose, onSaved }: Props) {
  const { entityMappings, saveEntityMappings, discardEntityMappings } = useAccountingV4()
  const { updateRows } = useAccountingV3Context()
  const [isOpen, setIsOpen] = useState(true)
  // Track inventory toggle — off by default
  const [trackInventory, setTrackInventory] = useState(false)

  const config = V4_ENTITY_CONFIG[entityKey]
  const rows = entityMappings[entityKey]

  // Tally Item column shown only when this entity supports inventory AND toggle is on
  const showTallyItem = !!config.supportsInventory && trackInventory

  // Tab partitions
  const needsReviewRows = rows.filter(
    (r) => r.mappingState === 'missing' || r.mappingState === 'ray',
  )
  const mappedRows = rows.filter((r) => r.mappingState === 'edited')

  const close = () => setIsOpen(false)

  const handleSave = () => {
    saveEntityMappings(entityKey)

    let autoMappedIds: string[] = []

    if (entityKey === 'items') {
      // Bills that will be auto-mapped once item mappings are confirmed
      const billAutoMap: Array<{ id: string; ledger: string }> = [
        { id: 'bill_v3_004', ledger: 'Purchases A/C' },           // Omega Consulting
        { id: 'bill_v3_006', ledger: 'Operations Expense A/C' },  // Pinnacle Events
        { id: 'bill_v3_007', ledger: 'Purchases A/C' },           // Cascade Printing
        { id: 'bill_v3_009', ledger: 'Operations Expense A/C' },  // Swift Courier
        { id: 'bill_v3_011', ledger: 'IT Procurement A/C' },      // SkyLink Telecom
        { id: 'bill_v3_012', ledger: 'Purchases A/C' },           // GreenPath
      ]

      autoMappedIds = billAutoMap.map(({ id }) => id)

      // Delay actual row updates — module page shows skeleton loading state first
      setTimeout(() => {
        billAutoMap.forEach(({ id, ledger }) => {
          updateRows('bills', [id], (r: V3ReviewRow) => ({
            ...r,
            targetLabel: ledger,
            mappingState: 'edited' as const,
          }))
        })
      }, 700)
    }

    // Notify module page: which entity was saved + which bill IDs are loading
    onSaved?.(entityKey, autoMappedIds)
    close()
  }

  const handleDiscard = () => {
    discardEntityMappings(entityKey)
    close()
  }

  return (
    <>
    <WideDrawerGlobal />
    <Drawer
      isOpen={isOpen}
      onDismiss={handleDiscard}
      onUnmount={onClose}
      showOverlay
      accessibilityLabel={`${config.label} Mappings`}
    >
      <DrawerHeader title={config.label} />

      <DrawerBody>
        {/* Entity-level inventory toggle — only for entities that support it (items) */}
        {config.supportsInventory && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="spacing.4"
            marginBottom="spacing.5"
            backgroundColor="surface.background.gray.intense"
            borderColor="surface.border.gray.muted"
            borderWidth="thin"
            borderRadius="medium"
          >
            <Box>
              <Text size="small" weight="semibold" color="surface.text.gray.normal">
                Track inventory
              </Text>
              <Text size="xsmall" color="surface.text.gray.muted" marginTop="spacing.1">
                When enabled, map each item to a Tally stock item
              </Text>
            </Box>
            <Switch
              isChecked={trackInventory}
              onChange={({ isChecked }) => setTrackInventory(isChecked)}
              accessibilityLabel="Track inventory for all items"
            />
          </Box>
        )}

        <Tabs defaultValue="needs_review" size="medium">
          <TabList>
            <TabItem value="needs_review">
              Needs review ({needsReviewRows.length})
            </TabItem>
            <TabItem value="mapped">
              Mapped ({mappedRows.length})
            </TabItem>
          </TabList>

          <TabPanel value="needs_review">
            <Box marginTop="spacing.4">
              <MappingTableBlock
                rows={needsReviewRows}
                entityKey={entityKey}
                config={config}
                showTallyItem={showTallyItem}
              />
            </Box>
          </TabPanel>

          <TabPanel value="mapped">
            <Box marginTop="spacing.4">
              <MappingTableBlock
                rows={mappedRows}
                entityKey={entityKey}
                config={config}
                showTallyItem={showTallyItem}
              />
            </Box>
          </TabPanel>
        </Tabs>
      </DrawerBody>

      <DrawerFooter>
        <Box display="flex" flexDirection="row" gap="spacing.3" justifyContent="flex-end">
          <Button variant="secondary" onClick={handleDiscard}>
            Discard changes
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save {config.label}
          </Button>
        </Box>
      </DrawerFooter>
    </Drawer>
    </>
  )
}
