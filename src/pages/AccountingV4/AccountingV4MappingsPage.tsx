import { useState, type ReactElement } from 'react'
import styled from 'styled-components'
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
} from '@razorpay/blade/components'
import { useAccountingV4 } from '../../context/AccountingV4Context'
import { V4_ENTITY_CONFIG } from './data'
import type { V4EntityKey } from './types'
import AccountingV4MappingModal from './AccountingV4MappingModal'

// ─── Styled ────────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 200ms ease, background 200ms ease;
  &:hover {
    border-color: rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.05);
  }
`

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0,208,132,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d084;
`

const ProgressBar = styled.div<{ pct: number }>`
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ pct }) => pct}%;
    background: #00d084;
    border-radius: 999px;
    transition: width 400ms ease;
  }
`

// ─── Icons ─────────────────────────────────────────────────────────────────────

const EntityIcon = ({ name }: { name: string }) => {
  const icons: Record<string, ReactElement> = {
    PackageIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    UsersIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    BoxIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    TaxPaymentsIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    FileTextIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  }
  return icons[name] ?? icons['FileTextIcon']
}

// ─── Entity order ─────────────────────────────────────────────────────────────

const ENTITY_ORDER: V4EntityKey[] = ['items', 'vendors', 'costCenters', 'gst', 'tds']

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountingV4MappingsPage() {
  const { getEntityCounts, settings } = useAccountingV4()
  const [activeModal, setActiveModal] = useState<V4EntityKey | null>(null)

  const enabledEntities = ENTITY_ORDER.filter(
    (key) => settings.enabledEntities[key],
  )

  return (
    <Box paddingTop="spacing.6" paddingBottom="spacing.8" display="flex" flexDirection="column" gap="spacing.7">
      {enabledEntities.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="spacing.11"
          gap="spacing.3"
        >
          <Text color="surface.text.gray.muted">No entities are enabled.</Text>
          <Text size="small" color="surface.text.gray.disabled">
            Enable entities in Settings to see them here.
          </Text>
        </Box>
      ) : (
        <Grid>
          {enabledEntities.map((key) => {
            const config = V4_ENTITY_CONFIG[key]
            const counts = getEntityCounts(key)
            const pct = counts.total > 0 ? Math.round((counts.mapped / counts.total) * 100) : 0

            return (
              <Card key={key}>
                {/* Entity icon + label */}
                <Box display="flex" alignItems="center" gap="spacing.3">
                  <IconBox>
                    <EntityIcon name={config.icon} />
                  </IconBox>
                  <Box flex="1">
                    <Heading size="small" weight="semibold">{config.label}</Heading>
                    <Text size="xsmall" color="surface.text.gray.muted">{config.description}</Text>
                  </Box>
                </Box>

                {/* Counts */}
                <Box display="flex" alignItems="center" gap="spacing.3">
                  {counts.unmapped > 0 ? (
                    <Badge color="notice" size="small">{counts.unmapped} unmapped</Badge>
                  ) : (
                    <Badge color="positive" size="small">All mapped</Badge>
                  )}
                  {counts.rayMapped > 0 && (
                    <Badge color="information" size="small">{counts.rayMapped} by Ray</Badge>
                  )}
                </Box>

                {/* Progress bar */}
                <Box>
                  <ProgressBar pct={pct} />
                  <Box display="flex" justifyContent="space-between" marginTop="spacing.1">
                    <Text size="xsmall" color="surface.text.gray.disabled">{pct}% mapped</Text>
                    <Text size="xsmall" color="surface.text.gray.disabled">{counts.mapped}/{counts.total}</Text>
                  </Box>
                </Box>

                {/* CTA */}
                <Button
                  variant="secondary"
                  size="small"
                  isFullWidth
                  onClick={() => setActiveModal(key)}
                >
                  Review {config.label}
                </Button>
              </Card>
            )
          })}
        </Grid>
      )}

      {/* Mapping modal */}
      {activeModal && (
        <AccountingV4MappingModal
          entityKey={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </Box>
  )
}
