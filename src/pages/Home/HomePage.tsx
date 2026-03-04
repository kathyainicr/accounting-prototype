import { Box, Heading, Text, Badge } from '@razorpay/blade/components'
import { BillsOverviewCard } from './BillsOverviewCard'
import { MappingCtaCard } from './MappingCtaCard'
import { MOCK_BILLS, STATUS_CONFIG } from '../Accounting/Bills/billsMockData'
import type { BillStatus } from '../Accounting/Bills/billsMockData'

// ─── Badge color map (avoids inline type assertions) ─────────────────────────

const BADGE_COLOR: Record<BillStatus, 'positive' | 'notice' | 'information' | 'negative' | 'neutral'> = {
  categorise: 'information',
  pending_tally_sync: 'notice',
  synced: 'positive',
  error_found: 'negative',
  excluded: 'neutral',
}

// ─── Bills preview ────────────────────────────────────────────────────────────

const PREVIEW_BILLS = MOCK_BILLS.slice(0, 5)

const BillsPreview = () => (
  <Box
    borderRadius="medium"
    overflow="hidden"
    borderWidth="thin"
    borderColor="surface.border.gray.subtle"
    borderStyle="solid"
  >
    {/* Header row */}
    <Box
      display="flex"
      paddingX="spacing.5"
      paddingY="spacing.3"
      backgroundColor="surface.background.gray.moderate"
    >
      <Box flex="3">
        <Text size="small" color="surface.text.gray.muted" weight="semibold">Vendor</Text>
      </Box>
      <Box flex="2">
        <Text size="small" color="surface.text.gray.muted" weight="semibold">Amount</Text>
      </Box>
      <Box flex="2">
        <Text size="small" color="surface.text.gray.muted" weight="semibold">Status</Text>
      </Box>
      <Box flex="2">
        <Text size="small" color="surface.text.gray.muted" weight="semibold">Date</Text>
      </Box>
    </Box>

    {/* Data rows */}
    {PREVIEW_BILLS.map((bill, i) => (
      <Box
        key={bill.id}
        display="flex"
        alignItems="center"
        paddingX="spacing.5"
        paddingY="spacing.4"
        borderTopWidth={i > 0 ? 'thin' : undefined}
        borderTopColor="surface.border.gray.subtle"
        borderStyle="solid"
      >
        <Box flex="3">
          <Text size="small" color="surface.text.gray.normal" weight="medium">
            {bill.vendor}
          </Text>
          <Text size="xsmall" color="surface.text.gray.muted">
            {bill.billNumber}
          </Text>
        </Box>
        <Box flex="2">
          <Text size="small" color="surface.text.gray.normal">
            ₹{bill.amount.toLocaleString('en-IN')}
          </Text>
        </Box>
        <Box flex="2">
          <Badge color={BADGE_COLOR[bill.status]} size="small">
            {STATUS_CONFIG[bill.status].label}
          </Badge>
        </Box>
        <Box flex="2">
          <Text size="small" color="surface.text.gray.muted">
            {bill.createdOn}
          </Text>
        </Box>
      </Box>
    ))}
  </Box>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const HomePage = () => (
  <Box display="flex" flexDirection="column" gap="spacing.8">
    {/* Greeting */}
    <Box display="flex" flexDirection="column" gap="spacing.2">
      <Heading as="h1" size="medium" color="surface.text.gray.normal" weight="medium">
        Good morning, Acme Corp
      </Heading>
      <Text size="medium" color="surface.text.gray.muted">
        Here's what's happening with your account today.
      </Text>
    </Box>

    {/* 2-column overview */}
    <Box display="flex" gap="spacing.6" alignItems="stretch">
      <Box flex="4">
        <BillsOverviewCard />
      </Box>
      <Box flex="3">
        <MappingCtaCard />
      </Box>
    </Box>

    {/* Bills preview */}
    <Box>
      <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.4">
        Recent Bills
      </Heading>
      <BillsPreview />
    </Box>
  </Box>
)

export default HomePage
