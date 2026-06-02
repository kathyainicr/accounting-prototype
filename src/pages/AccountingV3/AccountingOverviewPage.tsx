import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Counter,
  Heading,
  ProgressBar,
  RayIcon,
  Text,
  Badge,
  Divider,
} from '@razorpay/blade/components'
import { useAccountingV3Context } from '../../context/AccountingV3Context'
import { MODULE_CONFIG, REVIEW_ORDER } from './data'
import { SyncBooksModal } from './SyncBooksModal'

const cardStyles = {
  borderWidth: 'thin' as const,
  borderStyle: 'solid' as const,
  borderColor: 'surface.border.gray.muted' as const,
  borderRadius: 'large' as const,
  backgroundColor: 'surface.background.gray.intense' as const,
}

const AccountingOverviewPage = () => {
  const navigate = useNavigate()
  const { getCounts, getOverviewTotals, getNextReviewModule, syncAll } = useAccountingV3Context()
  const [isSyncOpen, setIsSyncOpen] = useState(false)

  const overviewTotals = getOverviewTotals()
  const reviewedCount = overviewTotals.ready_for_sync + overviewTotals.synced + overviewTotals.excluded
  const totalCount =
    overviewTotals.needs_review + overviewTotals.ready_for_sync + overviewTotals.synced + overviewTotals.excluded
  const reviewProgress = totalCount === 0 ? 0 : Math.round((reviewedCount / totalCount) * 100)
  const nextModule = getNextReviewModule()

  const reviewQueueModules = REVIEW_ORDER.map((moduleKey) => ({
    moduleKey,
    config: MODULE_CONFIG[moduleKey],
    counts: getCounts(moduleKey),
  }))

  const readyModuleCount = reviewQueueModules.filter(({ counts }) => counts.ready_for_sync > 0).length

  return (
    <>
      <Box display="flex" flexDirection="column" gap="spacing.7">
        <Box
          {...cardStyles}
          padding={{ base: 'spacing.6', m: 'spacing.8' }}
          display="flex"
          flexDirection={{ base: 'column', m: 'row' }}
          justifyContent="space-between"
          gap="spacing.7"
        >
          <Box maxWidth="680px">
            <Box display="flex" alignItems="center" gap="spacing.3" marginBottom="spacing.4">
              <RayIcon size="large" color="feedback.icon.positive.intense" />
              <Badge color="positive">Ray review workspace</Badge>
            </Box>
            <Heading size="large" color="surface.text.gray.normal" marginBottom="spacing.3">
              Review Ray mappings before books close.
            </Heading>
            <Text size="medium" color="surface.text.gray.muted" marginBottom="spacing.6">
              High-confidence mappings are already staged. Focus on exceptions, clear the review queue, and sync everything into books with confidence.
            </Text>

            <Box display="flex" gap="spacing.4" flexWrap="wrap" marginBottom="spacing.6">
              <Box>
                <Text size="xsmall" color="surface.text.gray.muted" textTransform="uppercase">
                  Needs review
                </Text>
                <Heading size="medium" color="surface.text.gray.normal">
                  {overviewTotals.needs_review}
                </Heading>
              </Box>
              <Box>
                <Text size="xsmall" color="surface.text.gray.muted" textTransform="uppercase">
                  Ready for sync
                </Text>
                <Heading size="medium" color="surface.text.gray.normal">
                  {overviewTotals.ready_for_sync}
                </Heading>
              </Box>
              <Box>
                <Text size="xsmall" color="surface.text.gray.muted" textTransform="uppercase">
                  Synced
                </Text>
                <Heading size="medium" color="surface.text.gray.normal">
                  {overviewTotals.synced}
                </Heading>
              </Box>
            </Box>

            <Box display="flex" gap="spacing.4" flexWrap="wrap">
              <Button variant="primary" onClick={() => navigate(MODULE_CONFIG[nextModule].route)}>
                Continue review
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsSyncOpen(true)}
                isDisabled={overviewTotals.ready_for_sync === 0}
              >
                Sync {overviewTotals.ready_for_sync} entries
              </Button>
            </Box>
          </Box>

          <Box
            {...cardStyles}
            padding="spacing.6"
            minWidth={{ base: '100%', m: '320px' }}
            maxWidth="360px"
            backgroundColor="surface.background.gray.moderate"
          >
            <Text size="small" weight="semibold" color="surface.text.gray.normal" marginBottom="spacing.2">
              Close books progress
            </Text>
            <Heading size="medium" color="surface.text.gray.normal" marginBottom="spacing.2">
              3 days left in this close window
            </Heading>
            <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.5">
              {readyModuleCount} modules are already sync-ready. Ray is holding only exception work back.
            </Text>
            <ProgressBar value={reviewProgress} variant="progress" />
            <Box display="flex" justifyContent="space-between" marginTop="spacing.3">
              <Text size="small" color="surface.text.gray.muted">{reviewProgress}% reviewed</Text>
              <Text size="small" color="surface.text.gray.muted">{overviewTotals.needs_review} blockers left</Text>
            </Box>
          </Box>
        </Box>

        <Box display="grid" gridTemplateColumns={{ base: '1fr', l: '1.6fr 1fr' }} gap="spacing.6">
          <Box {...cardStyles} padding="spacing.6">
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="spacing.5">
              <Box>
                <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.1">
                  Ray review queue
                </Heading>
                <Text size="small" color="surface.text.gray.muted">
                  Work down the queue in the recommended close order.
                </Text>
              </Box>
              <Badge color="notice">Ordered flow</Badge>
            </Box>

            <Box display="flex" flexDirection="column" gap="spacing.4">
              {reviewQueueModules.map(({ moduleKey, config, counts }, index) => {
                const hasBlockers = counts.needs_review > 0
                const isNext = moduleKey === nextModule

                return (
                  <Box
                    key={moduleKey}
                    borderWidth="thin"
                    borderStyle="solid"
                    borderColor={isNext ? 'surface.border.primary.normal' : 'surface.border.gray.muted'}
                    borderRadius="large"
                    padding="spacing.5"
                    backgroundColor={isNext ? 'feedback.background.notice.subtle' : 'surface.background.gray.moderate'}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="spacing.4">
                      <Box>
                        <Text size="xsmall" color="surface.text.gray.muted" marginBottom="spacing.1">
                          Step {index + 1}
                        </Text>
                        <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.1">
                          {config.label}
                        </Heading>
                        <Text size="small" color="surface.text.gray.muted">
                          {config.description}
                        </Text>
                      </Box>
                      <Badge color={hasBlockers ? 'notice' : 'positive'}>
                        {hasBlockers ? 'Needs review' : 'Ready'}
                      </Badge>
                    </Box>

                    <Box display="flex" gap="spacing.5" flexWrap="wrap" marginTop="spacing.4" marginBottom="spacing.4">
                      <Box display="flex" alignItems="center" gap="spacing.2">
                        <Counter value={counts.needs_review} color="notice" />
                        <Text size="small" color="surface.text.gray.muted">Needs review</Text>
                      </Box>
                      <Box display="flex" alignItems="center" gap="spacing.2">
                        <Counter value={counts.ready_for_sync} color="positive" />
                        <Text size="small" color="surface.text.gray.muted">Ready for sync</Text>
                      </Box>
                      <Box display="flex" alignItems="center" gap="spacing.2">
                        <Counter value={counts.synced} color="neutral" />
                        <Text size="small" color="surface.text.gray.muted">Synced</Text>
                      </Box>
                    </Box>

                    <Button variant="secondary" onClick={() => navigate(config.route)}>
                      Open {config.label}
                    </Button>
                  </Box>
                )
              })}
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap="spacing.6">
            <Box {...cardStyles} padding="spacing.6">
              <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.2">
                Sync readiness
              </Heading>
              <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.5">
                This is the final confidence check before entries move into books.
              </Text>

              <Box display="flex" flexDirection="column" gap="spacing.4">
                <Box>
                  <Text size="small" color="surface.text.gray.muted">Ready entries</Text>
                  <Heading size="medium" color="surface.text.gray.normal">{overviewTotals.ready_for_sync}</Heading>
                </Box>
                <Divider />
                <Box>
                  <Text size="small" color="surface.text.gray.muted">Blocked entries</Text>
                  <Heading size="medium" color="surface.text.gray.normal">{overviewTotals.needs_review}</Heading>
                </Box>
                <Divider />
                <Box>
                  <Text size="small" color="surface.text.gray.muted">Excluded from this sync</Text>
                  <Heading size="medium" color="surface.text.gray.normal">{overviewTotals.excluded}</Heading>
                </Box>
              </Box>
            </Box>

            <Box {...cardStyles} padding="spacing.6">
              <Heading size="small" color="surface.text.gray.normal" marginBottom="spacing.2">
                Recent sync activity
              </Heading>
              <Text size="small" color="surface.text.gray.muted" marginBottom="spacing.5">
                Latest operational signals from the accounting workspace.
              </Text>

              <Box display="flex" flexDirection="column" gap="spacing.4">
                {[
                  '39 entries posted to books in the last sync run',
                  'Ray auto-approved 21 ledger matches this afternoon',
                  '2 vendor mappings were manually corrected by finance ops',
                ].map((item) => (
                  <Box key={item} display="flex" gap="spacing.3" alignItems="flex-start">
                    <RayIcon size="medium" color="feedback.icon.positive.intense" />
                    <Text size="small" color="surface.text.gray.normal">{item}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <SyncBooksModal
        isOpen={isSyncOpen}
        title="Sync all approved entries"
        description="This will sync every module that is currently marked ready for sync."
        onClose={() => setIsSyncOpen(false)}
        onComplete={syncAll}
      />
    </>
  )
}

export default AccountingOverviewPage
