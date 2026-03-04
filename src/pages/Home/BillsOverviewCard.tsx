import { Box, Text, Heading, Card, CardBody, CardHeader, CardHeaderLeading, Indicator } from '@razorpay/blade/components'
import { MOCK_BILLS } from '../Accounting/Bills/billsMockData'
import type { BillStatus } from '../Accounting/Bills/billsMockData'

// ─── Stat config ──────────────────────────────────────────────────────────────

type StatItem = {
  label: string
  status: BillStatus
  indicatorColor: 'positive' | 'notice' | 'information' | 'negative' | 'neutral'
}

const STATS: StatItem[] = [
  { label: 'Needs review', status: 'categorise', indicatorColor: 'information' },
  { label: 'Ready to sync', status: 'pending_tally_sync', indicatorColor: 'notice' },
  { label: 'Synced', status: 'synced', indicatorColor: 'positive' },
  { label: 'Error found', status: 'error_found', indicatorColor: 'negative' },
]

const countByStatus = (status: BillStatus) => MOCK_BILLS.filter((b) => b.status === status).length

// ─── Component ────────────────────────────────────────────────────────────────

export const BillsOverviewCard = () => (
  <Card height="100%">
    <CardHeader>
      <CardHeaderLeading
        title="Bills Overview"
        subtitle={`${MOCK_BILLS.length} total transactions`}
      />
    </CardHeader>
    <CardBody>
      <Box display="flex" flexWrap="wrap" gap="spacing.6">
        {STATS.map((stat) => {
          const count = countByStatus(stat.status)
          return (
            <Box key={stat.status} minWidth="120px">
              <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.1">
                <Indicator color={stat.indicatorColor} />
                <Text size="small" color="surface.text.gray.muted">
                  {stat.label}
                </Text>
              </Box>
              <Heading size="large" color="surface.text.gray.normal">
                {count}
              </Heading>
            </Box>
          )
        })}
      </Box>
    </CardBody>
  </Card>
)
