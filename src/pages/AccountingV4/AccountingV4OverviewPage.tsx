import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import {
  Box,
  Heading,
  Text,
  Button,
  Divider,
  Popover,
  RayIcon,
  ArrowRightIcon,
} from '@razorpay/blade/components'
import { useAccountingV3Context } from '../../context/AccountingV3Context'
import type { V4EntityKey } from './types'
import type { V3ReviewRow } from '../AccountingV3/types'
import AccountingV4MappingModal from './AccountingV4MappingModal'

// ─── Styled helpers ────────────────────────────────────────────────────────────

const raySpin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const SpinOnce = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  line-height: 0;
  transform-origin: center center;
  animation: ${raySpin} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1 forwards;
`

const CompanyBadge = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
`

const HeroCard = styled.div`
  display: flex;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #0b2e27 0%, #0d2040 55%, #0a1a38 100%);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255,255,255,0.05) inset;
  min-height: 220px;
`

const HeroLeft = styled.div`
  flex: 1;
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const HeroRight = styled.div`
  width: 400px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SuggestPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(0, 208, 132, 0.3);
  border-radius: 999px;
  background: rgba(0, 208, 132, 0.08);
  color: #00d084;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease;
  &:hover { background: rgba(0, 208, 132, 0.15); }
`

const StackedBar = styled.div`
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  background: rgba(255, 255, 255, 0.07);
`

const BarSegment = styled.div<{ color: string; pct: number }>`
  height: 100%;
  width: ${({ pct }) => pct}%;
  background: ${({ color }) => color};
`

const LegendDot = styled.div<{ color: string }>`
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: ${({ color }) => color};
  flex-shrink: 0;
`

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const LegendLabel = styled.span`
  flex: 1;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
`

const LegendCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
`

const ConnectedDot = styled.span`
  position: relative;
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #00d084;
  box-shadow: 0 0 8px rgba(0,208,132,0.6);
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 208, 132, 0.5);
    animation: connected-ping 5s ease-out infinite;
  }

  @keyframes connected-ping {
    0%   { transform: scale(1);   opacity: 0.7; }
    25%  { transform: scale(3);   opacity: 0;   }
    100% { transform: scale(3);   opacity: 0;   }
  }
`

const SyncBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: default;
`

// ─── Review section styles ─────────────────────────────────────────────────────

const ModuleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const EntityCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  gap: 16px;
  transition: border-color 150ms ease, background 150ms ease;
  &:hover {
    border-color: rgba(255,255,255,0.13);
    background: rgba(255,255,255,0.05);
  }
`

const CardIconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
`

// ─── Entity icons ──────────────────────────────────────────────────────────────

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
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const IconPurposes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const IconVendors = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const ENTITY_ICONS: Record<string, () => React.ReactElement> = {
  contacts: IconContacts,
  items: IconItems,
  purposes: IconPurposes,
  vendors: IconVendors,
}

// ─── Static sections data ──────────────────────────────────────────────────────

const OVERVIEW_SECTIONS = [
  {
    module: 'expenses',
    label: 'Expenses',
    autoMapCount: 38,
    actionCount: 3,
    entityActions: [
      {
        entityKey: 'vendors' as V4EntityKey,
        label: 'Contacts',
        reviewCount: 21,
        impactCount: 20,
        impactLabel: 'Payouts made to these contacts',
        icon: 'contacts',
      },
      {
        entityKey: 'costCenters' as V4EntityKey,
        label: 'Payout purposes',
        reviewCount: 5,
        impactCount: 18,
        impactLabel: 'Payouts made with these Payout Purposes',
        icon: 'purposes',
      },
    ],
  },
  {
    module: 'bills',
    label: 'Bills',
    autoMapCount: 10,
    actionCount: 3,
    entityActions: [
      {
        entityKey: 'items' as V4EntityKey,
        label: 'Items',
        reviewCount: 5,
        impactCount: 2,
        impactLabel: 'Bills with these items are automatically mapped',
        icon: 'items',
      },
      {
        entityKey: 'vendors' as V4EntityKey,
        label: 'Vendors',
        reviewCount: 2,
        impactCount: 8,
        impactLabel: 'Bills with these Vendors are automatically mapped',
        icon: 'vendors',
      },
    ],
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountingV4OverviewPage() {
  const v3Context = useAccountingV3Context()
  const navigate = useNavigate()
  const [activeModalKey, setActiveModalKey] = useState<V4EntityKey | null>(null)

  // Stats from v3 transaction rows
  const allV3Rows: V3ReviewRow[] = [
    ...(v3Context.moduleRows.bills ?? []),
    ...(v3Context.moduleRows.expenses ?? []),
    ...(v3Context.moduleRows.advances ?? []),
  ]
  const total = allV3Rows.length || 1
  const synced = allV3Rows.filter((r) => r.status === 'synced').length
  const readyForSync = allV3Rows.filter((r) => r.status === 'ready_for_sync').length
  const needsReview = allV3Rows.filter((r) => r.status === 'needs_review').length

  const pctSynced = Math.round((synced / total) * 100)
  const pctReady = Math.round((readyForSync / total) * 100)
  const pctNeeds = Math.round((needsReview / total) * 100)

  const totalNeedsReview = needsReview

  return (
    <Box paddingTop="spacing.6" paddingBottom="spacing.8" display="flex" flexDirection="column" gap="spacing.8">

      {/* Mapping drawer */}
      {activeModalKey && (
        <AccountingV4MappingModal
          entityKey={activeModalKey}
          onClose={() => setActiveModalKey(null)}
        />
      )}

      {/* ── Context strip ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="spacing.3">
          <CompanyBadge>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 21h18M3 7v14M21 7v14M6 21V7M18 21V7M3 7h18M9 7V3h6v4M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
            </svg>
          </CompanyBadge>
          <Text size="large" color="surface.text.gray.muted">Acme Corp Pvt. Ltd.</Text>
        </Box>
        <Popover
          placement="bottom-end"
          openInteraction="hover"
          content={
            <Box display="flex" flexDirection="column" gap="spacing.4" minWidth="176px">
              <Box display="flex" flexDirection="column" gap="spacing.1">
                <Text size="xsmall" color="surface.text.gray.muted" weight="semibold">Last sync</Text>
                <Text size="small" color="surface.text.gray.normal">Today at 10:34 AM</Text>
                <Text size="xsmall" color="surface.text.gray.muted">47 entries synced</Text>
              </Box>
              <Divider />
              <Box display="flex" flexDirection="column" gap="spacing.1">
                <Text size="xsmall" color="surface.text.gray.muted" weight="semibold">Next sync</Text>
                <Text size="small" color="surface.text.gray.normal">Today at 12:34 PM</Text>
              </Box>
            </Box>
          }
        >
          <SyncBadge>
            <ConnectedDot />
            <Text size="medium" color="feedback.text.positive.intense" weight="semibold">Tally Connected</Text>
          </SyncBadge>
        </Popover>
      </Box>

      {/* ── Ray hero card ── */}
      <HeroCard>
        <HeroLeft>
          <SpinOnce>
            <RayIcon size="large" color="feedback.icon.positive.intense" />
          </SpinOnce>

          <Heading size="large" weight="semibold" color="surface.text.staticWhite.normal">
            Close your books faster than ever before with Ray
          </Heading>

          <Box display="flex" flexWrap="wrap" gap="spacing.3">
            <SuggestPill onClick={() => navigate('/v4/accounting/bills')}>
              <RayIcon size="small" color="feedback.icon.positive.intense" />
              Sync all pending
            </SuggestPill>
            {totalNeedsReview > 0 && (
              <SuggestPill onClick={() => navigate('/v4/accounting/expenses')}>
                <RayIcon size="small" color="feedback.icon.positive.intense" />
                Review &amp; Map with Ray
              </SuggestPill>
            )}
            <SuggestPill onClick={() => navigate('/v4/accounting/rules')}>
              <RayIcon size="small" color="feedback.icon.positive.intense" />
              Automate with rules
            </SuggestPill>
          </Box>
        </HeroLeft>

        {/* Stats panel */}
        <HeroRight>
          <Text size="xsmall" color="surface.text.gray.muted" textAlign="right">Jun '26</Text>

          <Box display="flex" alignItems="baseline" gap="spacing.1">
            <Box paddingRight="spacing.3">
              <Heading size="large" weight="semibold" color="surface.text.staticWhite.normal">
                {pctSynced}%
              </Heading>
            </Box>
            <Text size="small" color="surface.text.gray.muted">synced to Tally</Text>
          </Box>

          <StackedBar>
            <BarSegment color="#00d084" pct={pctSynced} />
            <BarSegment color="#f59e0b" pct={pctNeeds} />
            <BarSegment color="#3b82f6" pct={pctReady} />
          </StackedBar>

          <Box display="flex" flexDirection="column" gap="spacing.2" marginTop="spacing.1">
            {[
              { color: '#00d084', label: 'Synced', count: synced },
              { color: '#f59e0b', label: 'Incomplete mapping', count: needsReview },
              { color: '#3b82f6', label: 'Pending Sync', count: readyForSync },
            ].map(({ color, label, count }) => (
              <LegendRow key={label}>
                <LegendDot color={color} />
                <LegendLabel>{label}</LegendLabel>
                <LegendCount>{count}</LegendCount>
              </LegendRow>
            ))}
          </Box>
        </HeroRight>
      </HeroCard>

      {/* ── Module review sections ── */}
      {OVERVIEW_SECTIONS.map((section) => (
        <ModuleSection key={section.module}>
          {/* Section heading */}
          <Box>
            <Heading size="medium" weight="semibold">
              Auto-Map {section.autoMapCount} {section.label}
            </Heading>
            <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
              Complete these {section.actionCount} actions and your pending {section.label.toLowerCase()} will automatically get mapped
            </Text>
          </Box>

          {/* Entity action cards */}
          <Box display="flex" flexDirection="column" gap="spacing.3">
            {section.entityActions.map(({ entityKey, label, reviewCount, impactCount, impactLabel, icon }, idx) => {
              const IconComponent = ENTITY_ICONS[icon]
              return (
                <EntityCard key={entityKey + label}>
                  <Box display="flex" alignItems="center" gap="spacing.4">
                    <CardIconBox>
                      <IconComponent />
                    </CardIconBox>
                    <Box>
                      <Text weight="semibold" color="surface.text.gray.normal">
                        Review {reviewCount} {label} mapped by Ray
                      </Text>
                      <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
                        This will auto-map {impactCount} {impactLabel}
                      </Text>
                    </Box>
                  </Box>
                  <Button
                    variant={idx === 0 ? 'primary' : 'secondary'}
                    size="small"
                    icon={ArrowRightIcon}
                    iconPosition="right"
                    onClick={() => setActiveModalKey(entityKey)}
                  >
                    Review
                  </Button>
                </EntityCard>
              )
            })}
          </Box>
        </ModuleSection>
      ))}

    </Box>
  )
}
