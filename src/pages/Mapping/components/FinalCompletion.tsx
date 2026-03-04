import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Box, Heading, Text, Button, CheckCircleIcon, Divider } from '@razorpay/blade/components'
import { useMappingContext } from '../../../context/MappingContext'
import { STEP_CONFIG } from '../constants'
import type { MappingStepId } from '../types'

const EXPO_OUT = [0.22, 1, 0.36, 1] as const

const rowContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
}

const rowItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: EXPO_OUT } },
}

const SonarRing = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ scale: 1, opacity: 0.5 }}
    animate={{ scale: 3.2, opacity: 0 }}
    transition={{ duration: 2.2, ease: 'easeOut', delay }}
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      border: '1px solid rgba(74, 222, 128, 0.28)',
      pointerEvents: 'none',
    }}
  />
)

const AnimatedStepSummaryRow = ({
  stepId,
  confirmed,
  skipped,
}: {
  stepId: MappingStepId
  confirmed: number
  skipped: number
}) => {
  const step = STEP_CONFIG.find((s) => s.id === stepId)!
  return (
    <motion.div variants={rowItemVariants}>
      <Box display="flex" alignItems="center" gap="spacing.3">
        <CheckCircleIcon color="interactive.icon.positive.normal" size="small" />
        <Text color="surface.text.gray.normal" weight="medium">
          {step.entityLabel.charAt(0).toUpperCase() + step.entityLabel.slice(1)}
        </Text>
        <Text color="surface.text.gray.muted" size="small">
          {confirmed} confirmed{skipped > 0 ? `, ${skipped} skipped` : ''}
        </Text>
      </Box>
    </motion.div>
  )
}

const AnimatedDivider = () => (
  <motion.div variants={rowItemVariants}>
    <Divider />
  </motion.div>
)

const countByStatus = (resolutions: Record<string, { status: string }>, status: string) =>
  Object.values(resolutions).filter((r) => r.status === status).length

export const FinalCompletion = () => {
  const navigate = useNavigate()
  const { vendorResolutions, itemResolutions, costCenterResolutions } = useMappingContext()

  const stats = {
    vendors: {
      confirmed: countByStatus(vendorResolutions, 'confirmed'),
      skipped: countByStatus(vendorResolutions, 'skipped'),
    },
    items: {
      confirmed: countByStatus(itemResolutions, 'confirmed'),
      skipped: countByStatus(itemResolutions, 'skipped'),
    },
    costCenters: {
      confirmed: countByStatus(costCenterResolutions, 'confirmed'),
      skipped: countByStatus(costCenterResolutions, 'skipped'),
    },
  }

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      backgroundColor="surface.background.gray.subtle"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 0.25 }}
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3, 62, 62, 0.38) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EXPO_OUT, delay: 0.06 }}
        style={{ width: '100%', maxWidth: 480, padding: '0 24px', position: 'relative' }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.5">

          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EXPO_OUT, delay: 0.18 }}
            style={{ position: 'relative', width: 64, height: 64 }}
          >
            <SonarRing delay={0.28} />
            <SonarRing delay={0.72} />
            <Box
              width="64px"
              height="64px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backgroundColor="feedback.background.positive.subtle"
              borderRadius="max"
            >
              <CheckCircleIcon color="interactive.icon.positive.normal" size="xlarge" />
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO_OUT, delay: 0.28 }}
            style={{ textAlign: 'center' }}
          >
            <Heading size="xlarge" color="surface.text.gray.normal" marginBottom="spacing.2">
              You're all set!
            </Heading>
            <Text color="surface.text.gray.muted">
              All entities are mapped. Your bills are ready to sync to Tally.
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO_OUT, delay: 0.36 }}
            style={{ width: '100%' }}
          >
            <Box
              width="100%"
              backgroundColor="surface.background.gray.intense"
              padding="spacing.5"
              borderRadius="medium"
              display="flex"
              flexDirection="column"
              gap="spacing.3"
            >
              <motion.div
                variants={rowContainerVariants}
                initial="hidden"
                animate="show"
              >
                <Box display="flex" flexDirection="column" gap="spacing.3">
                  <AnimatedStepSummaryRow stepId="vendors" {...stats.vendors} />
                  <AnimatedDivider />
                  <AnimatedStepSummaryRow stepId="items" {...stats.items} />
                  <AnimatedDivider />
                  <AnimatedStepSummaryRow stepId="costCenters" {...stats.costCenters} />
                </Box>
              </motion.div>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EXPO_OUT, delay: 0.58 }}
            style={{ width: '100%' }}
          >
            <Box display="flex" gap="spacing.4" width="100%">
              <Box flex="1">
                <Button
                  variant="secondary"
                  isFullWidth
                  onClick={() => navigate('/accounting/bills')}
                >
                  Go to bills
                </Button>
              </Box>
              <Box flex="1">
                <Button
                  variant="primary"
                  isFullWidth
                  onClick={() => navigate('/accounting/bills')}
                >
                  Sync all to Tally →
                </Button>
              </Box>
            </Box>
          </motion.div>

        </Box>
      </motion.div>
    </Box>
  )
}
