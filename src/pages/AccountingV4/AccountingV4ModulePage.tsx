import { useState, useMemo, useRef, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Box,
  Text,
  Heading,
  Button,
  SearchInput,
  Dropdown,
  DropdownOverlay,
  ActionList,
  ActionListItem,
  SelectInput,
  Amount,
  ArrowRightIcon,
  Tooltip,
} from '@razorpay/blade/components'
import { useAccountingV3Context } from '../../context/AccountingV3Context'
import type { V3ModuleKey, V3ReviewRow, V3ReviewStatus } from '../AccountingV3/types'
import type { V4EntityKey } from './types'
import AccountingV4MappingModal from './AccountingV4MappingModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type V4ModuleKey = Extract<V3ModuleKey, 'bills' | 'expenses' | 'advances'>

type Props = {
  moduleKey: V4ModuleKey
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
`

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
`

const TabsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
`

const FilterTab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 14px 12px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid ${({ $active }) => ($active ? '#00d084' : 'transparent')};
  color: ${({ $active }) => ($active ? '#e5e7eb' : 'rgba(255,255,255,0.45)')};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-family: inherit;
  transition: color 150ms ease, border-color 150ms ease;
  white-space: nowrap;
  margin-bottom: -1px;
  &:hover { color: rgba(255,255,255,0.8); }
`

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  font-size: 11px;
  font-weight: 600;
  color: inherit;
`

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  background: rgba(0, 208, 132, 0.06);
  border-bottom: 1px solid rgba(0, 208, 132, 0.15);
  flex-shrink: 0;
`

const TableWrap = styled.div`
  flex: 1;
  overflow: auto;
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 2;
  background: #111118;
  border-bottom: 1px solid rgba(255,255,255,0.07);
`

const Th = styled.th`
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  white-space: nowrap;
  user-select: none;

  &:first-child { padding-left: 24px; }
  &:last-child  { padding-right: 24px; }
`

const CheckTh = styled(Th)`
  width: 40px;
  padding-left: 24px;
`

const Tr = styled.tr<{ $selected?: boolean }>`
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: ${({ $selected }) => $selected ? 'rgba(0,208,132,0.05)' : 'transparent'};
  transition: background 120ms ease;

  &:hover { background: rgba(255,255,255,0.025); }
  &:last-child { border-bottom: none; }
`

const Td = styled.td`
  padding: 11px 14px;
  vertical-align: middle;
  color: rgba(255,255,255,0.8);

  &:first-child { padding-left: 24px; }
  &:last-child  { padding-right: 24px; }
`

const SuggestionPill = styled.button<{ $variant: 'orange' | 'blue' | 'green' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;
  border: 1px solid;
  cursor: ${({ $variant }) => $variant === 'neutral' ? 'default' : 'pointer'};

  ${({ $variant }) => {
    switch ($variant) {
      case 'orange': return `background:rgba(245,158,11,0.1);color:#f59e0b;border-color:rgba(245,158,11,0.25);`
      case 'blue':   return `background:rgba(59,130,246,0.1);color:#60a5fa;border-color:rgba(59,130,246,0.25);`
      case 'green':  return `background:rgba(0,208,132,0.08);color:#00d084;border-color:rgba(0,208,132,0.2);`
      default:       return `background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.35);border-color:rgba(255,255,255,0.08);`
    }
  }}

  &:hover:not([disabled]) { filter: brightness(1.15); }
`

const ReceiptChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #f87171;
  &:hover { background: rgba(239,68,68,0.18); }
`

const MonoText = styled.span`
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
`

const LedgerInputWrap = styled.div`
  position: relative;
  width: 100%;

  [class*="StyledBaseButton"],
  [class*="AnimatedBaseInputWrapper"] {
    padding-left: 26px !important;
  }
`

const LedgerIconOverlay = styled.div`
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: #00d084;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
`

const shimmerKf = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`

const LedgerSkeleton = styled.div`
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0.04) 100%
  );
  background-size: 800px 100%;
  animation: ${shimmerKf} 1.3s ease-in-out infinite;
`

const CheckboxInput = styled.input`
  cursor: pointer;
  accent-color: #00d084;
  width: 14px;
  height: 14px;
`

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: rgba(255,255,255,0.45);
  transition: all 120ms ease;
  &:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); }
`

const RowMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
`

const RowMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 50;
  background: #1a1a2a;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  min-width: 140px;
  overflow: hidden;
  animation: menu-in 120ms ease both;
  @keyframes menu-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const RowMenuItem = styled.button<{ $danger?: boolean }>`
  display: block;
  width: 100%;
  padding: 9px 14px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  color: ${({ $danger }) => $danger ? '#f87171' : 'rgba(255,255,255,0.75)'};
  transition: background 100ms ease;
  &:hover { background: rgba(255,255,255,0.06); }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 8px;
  color: rgba(255,255,255,0.35);
`

// ─── Sync animation keyframes ─────────────────────────────────────────────────

const fadeInKf = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`
const popInKf = keyframes`
  from { opacity: 0; transform: scale(0.88) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`
const flowDotKf = keyframes`
  0%   { transform: translateX(0);      opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(196px);  opacity: 0; }
`
const progressFillKf = keyframes`
  0%   { width: 2%;   }
  15%  { width: 22%;  }
  40%  { width: 48%;  }
  65%  { width: 70%;  }
  85%  { width: 88%;  }
  100% { width: 100%; }
`
const ringScaleKf = keyframes`
  0%   { transform: scale(0.4);  opacity: 0; }
  55%  { transform: scale(1.1);  opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
`
const checkDrawKf = keyframes`
  from { stroke-dashoffset: 30; }
  to   { stroke-dashoffset: 0;  }
`
const fadeUpKf = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Sync overlay styled components ──────────────────────────────────────────

const SyncOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(6px);
  animation: ${fadeInKf} 220ms ease both;
`

const SyncCard = styled.div`
  width: 480px;
  background: #0e1117;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.03);
  padding: 44px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  animation: ${popInKf} 360ms cubic-bezier(0.34,1.4,0.64,1) both;
`

const SyncLogoRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
`

const SyncLogoBox = styled.div<{ $color: string; $bg: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${({ $bg }) => $bg};
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 900;
  color: ${({ $color }) => $color};
  letter-spacing: -0.5px;
  flex-shrink: 0;
  user-select: none;
`

const SyncFlowTrack = styled.div`
  position: relative;
  flex: 1;
  max-width: 180px;
  height: 2px;
  background: rgba(255,255,255,0.06);
  margin: 0 12px;
  overflow: hidden;
  border-radius: 1px;
`

const SyncFlowDot = styled.div<{ $delay: number }>`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d084;
  top: 50%;
  left: -8px;
  margin-top: -4px;
  animation: ${flowDotKf} 1.5s ease-in-out ${({ $delay }) => $delay}s infinite;
`

const SyncProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
`

const SyncProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00c47a, #00f5a0);
  border-radius: 3px;
  animation: ${progressFillKf} 2.4s ease-in-out both;
`

const SyncSuccessRing = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(0,208,132,0.08);
  border: 2px solid rgba(0,208,132,0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${ringScaleKf} 450ms cubic-bezier(0.34,1.4,0.64,1) both;
`

const CheckPathEl = styled.path`
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${checkDrawKf} 500ms 200ms ease both;
`

const FadeUpBlock = styled.div<{ $delay?: number }>`
  text-align: center;
  animation: ${fadeUpKf} 350ms ${({ $delay }) => $delay ?? 0}ms ease both;
`

// ─── Ray widget ───────────────────────────────────────────────────────────────

const RayWidgetWrap = styled.div`
  margin: 20px 24px 24px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  flex-shrink: 0;
`

const EntityActionsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`

const EntityActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  flex: 1;
`

const CardIconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.45);
  flex-shrink: 0;
`

// ─── Widget icons (inline SVG) ────────────────────────────────────────────────

const IconContacts = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconItems = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const IconPurposes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconVendors = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const WIDGET_ICONS: Record<string, () => React.ReactElement> = {
  contacts: IconContacts,
  items: IconItems,
  purposes: IconPurposes,
  vendors: IconVendors,
}

// ─── Per-module widget data ────────────────────────────────────────────────────

type EntityAction = {
  entityKey: V4EntityKey
  label: string
  reviewCount: number
  impactCount: number
  impactLabel: string
  icon: string
}

type ModuleWidget = {
  autoMapCount: number
  actionCount: number
  entityActions: EntityAction[]
}

const MODULE_WIDGET: Partial<Record<V4ModuleKey, ModuleWidget>> = {
  bills: {
    autoMapCount: 10,
    actionCount: 3,
    entityActions: [
      { entityKey: 'items',   label: 'Items',   reviewCount: 5, impactCount: 2, impactLabel: 'Bills with these items are automatically mapped',   icon: 'items'   },
      { entityKey: 'vendors', label: 'Vendors', reviewCount: 2, impactCount: 8, impactLabel: 'Bills with these Vendors are automatically mapped', icon: 'vendors' },
    ],
  },
  expenses: {
    autoMapCount: 38,
    actionCount: 3,
    entityActions: [
      { entityKey: 'vendors',     label: 'Contacts',        reviewCount: 21, impactCount: 20, impactLabel: 'Payouts made to these contacts',                  icon: 'contacts' },
      { entityKey: 'costCenters', label: 'Payout purposes', reviewCount: 5,  impactCount: 18, impactLabel: 'Payouts made with these Payout Purposes',         icon: 'purposes' },
    ],
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const RayIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
  </svg>
)
const PDFIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
)
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const DotsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
)

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<V4ModuleKey, string> = {
  bills: 'Bills', expenses: 'Expenses', advances: 'Advances',
}

const TALLY_LEDGER_OPTIONS = [
  'Purchases A/C', 'IT Procurement A/C', 'Vendor Advances A/C',
  'Payout Expense A/C', 'Operations Expense A/C',
]

const STATUS_TABS: { key: V3ReviewStatus; label: string }[] = [
  { key: 'needs_review',   label: 'Needs review'   },
  { key: 'ready_for_sync', label: 'Ready for sync' },
  { key: 'synced',         label: 'Synced'         },
  { key: 'excluded',       label: 'Excluded'       },
]

function getSuggestion(row: V3ReviewRow): { label: string; variant: 'orange' | 'blue' | 'green' | 'neutral' } {
  if (row.status === 'synced')         return { label: 'Synced',     variant: 'green'   }
  if (row.status === 'excluded')       return { label: 'Excluded',   variant: 'neutral' }
  if (row.status === 'ready_for_sync') return { label: 'Ready',      variant: 'blue'    }
  if (row.mappingState === 'missing')  return { label: 'Map ledger', variant: 'orange'  }
  if (row.mappingState === 'ray')      return { label: 'Confirm',    variant: 'blue'    }
  return { label: 'Mark ready', variant: 'green' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountingV4ModulePage({ moduleKey }: Props) {
  const { moduleRows, getCounts, approveRow, excludeRow, updateRow, updateRows } = useAccountingV3Context()
  const rows: V3ReviewRow[] = moduleRows[moduleKey] ?? []
  const counts = getCounts(moduleKey)

  const [activeStatus, setActiveStatus] = useState<V3ReviewStatus>('needs_review')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [activeModalKey, setActiveModalKey] = useState<V4EntityKey | null>(null)
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle')
  const syncCountRef = useRef(0)
  // Entity keys whose mapping modal has been saved — used to hide their widget card
  const [dismissedEntityKeys, setDismissedEntityKeys] = useState<Set<V4EntityKey>>(new Set())
  // Bill IDs currently showing skeleton loading state during auto-mapping
  const [loadingLedgerIds, setLoadingLedgerIds] = useState<string[]>([])

  const widget = MODULE_WIDGET[moduleKey]
  const menuRef = useRef<HTMLDivElement>(null)

  // Close row menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenuId])

  // Syncing → Done after 2.5 s
  useEffect(() => {
    if (syncState !== 'syncing') return
    const t = setTimeout(() => setSyncState('done'), 2500)
    return () => clearTimeout(t)
  }, [syncState])

  const filteredRows = useMemo(() =>
    rows
      .filter((r) => r.status === activeStatus)
      .filter((r) => !search.trim() || r.sourceLabel.toLowerCase().includes(search.toLowerCase())),
    [rows, activeStatus, search],
  )

  const eligibleForReady = filteredRows.filter(
    (r) => r.status === 'needs_review' && r.mappingState !== 'missing',
  )

  const handleMarkAllReady = () => {
    updateRows(moduleKey, eligibleForReady.map((r) => r.id), (r: V3ReviewRow) => ({
      ...r, status: 'ready_for_sync' as const,
    }))
  }

  const handleSyncDismiss = () => {
    const readyIds = rows.filter((r) => r.status === 'ready_for_sync').map((r) => r.id)
    updateRows(moduleKey, readyIds, (r: V3ReviewRow) => ({ ...r, status: 'synced' as const }))
    setSyncState('idle')
    setActiveStatus('synced')
  }

  const handleModalSaved = (key: V4EntityKey, autoMappedIds: string[]) => {
    // Hide that entity's card from the widget
    setDismissedEntityKeys((prev) => new Set([...prev, key]))
    // Show loading skeletons on the auto-mapped bill rows, clear once updates land
    if (autoMappedIds.length > 0) {
      setLoadingLedgerIds(autoMappedIds)
      setTimeout(() => setLoadingLedgerIds([]), 900)
    }
  }

  const toggleId = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.id))
  const toggleAll = () => setSelectedIds(allSelected ? [] : filteredRows.map((r) => r.id))

  const showRef     = moduleKey !== 'advances'
  const showReceipt = moduleKey !== 'advances'

  return (
    <PageWrap>
      {/* Mapping drawer */}
      {activeModalKey && (
        <AccountingV4MappingModal
          entityKey={activeModalKey}
          onClose={() => setActiveModalKey(null)}
          onSaved={handleModalSaved}
        />
      )}

      {/* Sync to Tally animated overlay */}
      {syncState !== 'idle' && (
        <SyncOverlay>
          <SyncCard>
            {syncState === 'syncing' ? (
              <>
                {/* Title */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                    Syncing to Tally…
                  </Heading>
                  <Text size="small" color="surface.text.gray.muted" marginTop="spacing.2">
                    Ray is pushing your approved bills to Tally ERP 9
                  </Text>
                </div>

                {/* Logo flow row */}
                <SyncLogoRow>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <SyncLogoBox $color="#60a5fa" $bg="rgba(59,130,246,0.12)">RX</SyncLogoBox>
                    <Text size="xsmall" color="surface.text.gray.muted">RazorpayX</Text>
                  </div>
                  <SyncFlowTrack style={{ marginTop: -16 }}>
                    {[0, 0.45, 0.9, 1.35].map((d) => (
                      <SyncFlowDot key={d} $delay={d} />
                    ))}
                  </SyncFlowTrack>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <SyncLogoBox $color="#f97316" $bg="rgba(249,115,22,0.12)">T</SyncLogoBox>
                    <Text size="xsmall" color="surface.text.gray.muted">Tally ERP 9</Text>
                  </div>
                </SyncLogoRow>

                {/* Progress bar */}
                <div style={{ width: '100%' }}>
                  <SyncProgressTrack>
                    <SyncProgressFill />
                  </SyncProgressTrack>
                  <Box display="flex" justifyContent="space-between" marginTop="spacing.2">
                    <Text size="xsmall" color="surface.text.gray.muted">
                      Transferring {syncCountRef.current} bills…
                    </Text>
                    <Text size="xsmall" color="surface.text.gray.muted">Vouchers &amp; ledger entries</Text>
                  </Box>
                </div>
              </>
            ) : (
              <>
                {/* Success ring + checkmark */}
                <SyncSuccessRing>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#00d084" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <CheckPathEl d="M5 12l5 5 9-9" />
                  </svg>
                </SyncSuccessRing>

                {/* Success text */}
                <FadeUpBlock $delay={80}>
                  <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                    Sync complete!
                  </Heading>
                  <Text size="small" color="surface.text.gray.muted" marginTop="spacing.2">
                    {syncCountRef.current} bills have been pushed to Tally ERP 9
                  </Text>
                </FadeUpBlock>

                {/* CTA */}
                <FadeUpBlock $delay={200}>
                  <Button variant="primary" size="small" onClick={handleSyncDismiss}>
                    View synced bills
                  </Button>
                </FadeUpBlock>
              </>
            )}
          </SyncCard>
        </SyncOverlay>
      )}

      {/* Ray entity-action widget — hidden once all entity cards are saved */}
      {widget && (() => {
        const visibleActions = widget.entityActions.filter(
          ({ entityKey }) => !dismissedEntityKeys.has(entityKey),
        )
        if (visibleActions.length === 0) return null
        return (
          <RayWidgetWrap>
            <Heading size="small" weight="semibold" color="surface.text.gray.normal">
              Auto-Map {widget.autoMapCount} {MODULE_LABELS[moduleKey]}
            </Heading>
            <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
              Complete these {visibleActions.length} action{visibleActions.length > 1 ? 's' : ''} and your pending {MODULE_LABELS[moduleKey].toLowerCase()} will automatically get mapped
            </Text>

            <EntityActionsRow>
              {visibleActions.map(({ entityKey, label, reviewCount, impactCount, icon }) => {
                const IconComp = WIDGET_ICONS[icon]
                return (
                  <EntityActionCard key={entityKey + label}>
                    <CardIconBox><IconComp /></CardIconBox>
                    <Box flex="1">
                      <Text weight="semibold" color="surface.text.gray.normal">
                        {reviewCount} {label} mapped by Ray
                      </Text>
                      <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
                        Auto-maps {impactCount} {MODULE_LABELS[moduleKey].toLowerCase()}
                      </Text>
                    </Box>
                    <Button
                      variant="secondary"
                      size="small"
                      icon={ArrowRightIcon}
                      iconPosition="right"
                      onClick={() => setActiveModalKey(entityKey)}
                    >
                      Review
                    </Button>
                  </EntityActionCard>
                )
              })}
            </EntityActionsRow>
          </RayWidgetWrap>
        )
      })()}

      {/* Filter tabs + search + primary action in one bar */}
      <FilterBar>
        <TabsGroup>
          {STATUS_TABS.map(({ key, label }) => (
            <FilterTab key={key} $active={activeStatus === key}
              onClick={() => { setActiveStatus(key); setSelectedIds([]) }}
            >
              {label}
              {counts[key] > 0 && <TabCount>{counts[key]}</TabCount>}
            </FilterTab>
          ))}
        </TabsGroup>

        <Box display="flex" alignItems="center" gap="spacing.3" paddingBottom="spacing.2">
          <Box maxWidth="280px">
            <SearchInput
              label=""
              placeholder={`Search ${MODULE_LABELS[moduleKey].toLowerCase()}…`}
              value={search}
              onChange={({ value }) => setSearch(value ?? '')}
            />
          </Box>
          {activeStatus === 'needs_review' && eligibleForReady.length > 0 && (
            <Button variant="primary" size="small" onClick={handleMarkAllReady}>
              Mark {eligibleForReady.length} as ready
            </Button>
          )}
          {activeStatus === 'ready_for_sync' && counts.ready_for_sync > 0 && (
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                syncCountRef.current = counts.ready_for_sync
                setSyncState('syncing')
              }}
            >
              Sync to Tally
            </Button>
          )}
        </Box>
      </FilterBar>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <BulkBar>
          <Text size="small" weight="semibold" color="feedback.text.positive.intense">
            {selectedIds.length} selected
          </Text>
          {activeStatus === 'needs_review' && (
            <Button variant="secondary" size="small" onClick={() => {
              updateRows(moduleKey, selectedIds, (r: V3ReviewRow) => ({ ...r, status: 'ready_for_sync' as const }))
              setSelectedIds([])
            }}>
              Mark ready
            </Button>
          )}
          <Button variant="tertiary" size="small" onClick={() => {
            updateRows(moduleKey, selectedIds, (r: V3ReviewRow) => ({ ...r, status: 'excluded' as const }))
            setSelectedIds([])
          }}>
            Exclude
          </Button>
          <Button variant="tertiary" size="small" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
        </BulkBar>
      )}

      {/* Table */}
      <TableWrap>
        {filteredRows.length === 0 ? (
          <EmptyState>
            <Text color="surface.text.gray.muted" size="large">No entries</Text>
            <Text size="small" color="surface.text.gray.disabled">
              {search ? 'Try clearing your search.' : `Nothing ${activeStatus.replace('_', ' ')} right now.`}
            </Text>
          </EmptyState>
        ) : (
          <StyledTable>
            <Thead>
              <tr>
                <CheckTh><CheckboxInput type="checkbox" checked={allSelected} onChange={toggleAll} /></CheckTh>
                <Th>Vendor / Source</Th>
                <Th>Action</Th>
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Tally Ledger</Th>
                {showRef     && <Th>Reference</Th>}
                {showReceipt && <Th>Receipt</Th>}
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {filteredRows.map((row) => {
                const sug = getSuggestion(row)
                const isSelected = selectedIds.includes(row.id)
                const canApprove = row.status === 'needs_review'

                return (
                  <Tr key={row.id} $selected={isSelected}>
                    {/* Checkbox */}
                    <Td>
                      <CheckboxInput
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleId(row.id)}
                      />
                    </Td>

                    {/* Source / vendor */}
                    <Td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
                        {row.sourceLabel}
                      </div>
                    </Td>

                    {/* Suggestion pill — explanation shown as tooltip on hover */}
                    <Td>
                      {row.explanation ? (
                        <Tooltip content={row.explanation} placement="top">
                          <SuggestionPill
                            $variant={sug.variant}
                            onClick={() => {
                              if (canApprove && sug.label !== 'Map ledger') approveRow(moduleKey, row.id)
                            }}
                          >
                            {canApprove && sug.variant !== 'orange' && <RayIcon />}
                            {sug.label}
                          </SuggestionPill>
                        </Tooltip>
                      ) : (
                        <SuggestionPill
                          $variant={sug.variant}
                          onClick={() => {
                            if (canApprove && sug.label !== 'Map ledger') approveRow(moduleKey, row.id)
                          }}
                        >
                          {canApprove && sug.variant !== 'orange' && <RayIcon />}
                          {sug.label}
                        </SuggestionPill>
                      )}
                    </Td>

                    {/* Date */}
                    <Td>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {row.accountingDate ?? '—'}
                      </span>
                    </Td>

                    {/* Amount */}
                    <Td>
                      {row.amount != null
                        ? <Amount value={row.amount} currency="INR" size="small" weight="semibold" />
                        : <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
                      }
                    </Td>

                    {/* Tally ledger */}
                    <Td style={{ minWidth: 180 }}>
                      {loadingLedgerIds.includes(row.id) ? (
                        /* Shimmer skeleton while auto-mapping is in flight */
                        <LedgerSkeleton />
                      ) : row.status === 'synced' || row.status === 'excluded' ? (
                        <span style={{ fontSize: 13, color: row.targetLabel ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>
                          {row.targetLabel || '—'}
                        </span>
                      ) : (
                        <LedgerInputWrap>
                          {row.mappingState === 'ray' && (
                            <LedgerIconOverlay>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
                              </svg>
                            </LedgerIconOverlay>
                          )}
                          <Dropdown>
                            <SelectInput
                              label=""
                              placeholder="Select ledger"
                              value={row.targetLabel || undefined}
                              size="small"
                              onChange={({ values }) =>
                                updateRow(moduleKey, row.id, (r: V3ReviewRow) => ({
                                  ...r, targetLabel: values[0] ?? '', mappingState: 'edited' as const,
                                }))
                              }
                            />
                            <DropdownOverlay>
                              <ActionList>
                                {TALLY_LEDGER_OPTIONS.map((opt) => (
                                  <ActionListItem key={opt} title={opt} value={opt} />
                                ))}
                              </ActionList>
                            </DropdownOverlay>
                          </Dropdown>
                        </LedgerInputWrap>
                      )}
                    </Td>

                    {/* Reference */}
                    {showRef && (
                      <Td><MonoText>{row.referenceLabel ?? '—'}</MonoText></Td>
                    )}

                    {/* Receipt */}
                    {showReceipt && (
                      <Td>
                        <ReceiptChip title="View receipt">
                          <PDFIcon /> PDF
                        </ReceiptChip>
                      </Td>
                    )}

                    {/* Actions */}
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {canApprove && (
                          <ActionBtn onClick={() => approveRow(moduleKey, row.id)} title="Approve">
                            <CheckIcon />
                          </ActionBtn>
                        )}
                        <RowMenuWrap ref={openMenuId === row.id ? menuRef : undefined}>
                          <ActionBtn
                            title="More"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id) }}
                          >
                            <DotsIcon />
                          </ActionBtn>
                          {openMenuId === row.id && (
                            <RowMenu>
                              {canApprove && (
                                <RowMenuItem onClick={() => { approveRow(moduleKey, row.id); setOpenMenuId(null) }}>
                                  Mark ready
                                </RowMenuItem>
                              )}
                              {row.status !== 'excluded' && (
                                <RowMenuItem $danger onClick={() => { excludeRow(moduleKey, row.id); setOpenMenuId(null) }}>
                                  Exclude
                                </RowMenuItem>
                              )}
                              {row.status === 'excluded' && (
                                <RowMenuItem onClick={() => {
                                  updateRow(moduleKey, row.id, (r: V3ReviewRow) => ({ ...r, status: 'needs_review' as const }))
                                  setOpenMenuId(null)
                                }}>
                                  Restore
                                </RowMenuItem>
                              )}
                            </RowMenu>
                          )}
                        </RowMenuWrap>
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </StyledTable>
        )}
      </TableWrap>
    </PageWrap>
  )
}
