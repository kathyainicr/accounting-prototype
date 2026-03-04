import { motion } from 'framer-motion'
import { Box, Heading, Text, Button, CheckCircleIcon } from '@razorpay/blade/components'
import type { MappingStepId } from '../types'
import { STEP_CONFIG } from '../constants'

// ─── Easing ───────────────────────────────────────────────────────────────────

const EXPO_OUT = [0.22, 1, 0.36, 1] as const

// ─── Variants ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.35 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EXPO_OUT } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EXPO_OUT } },
}

// ─── Sonar ring ───────────────────────────────────────────────────────────────

const SonarRing = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ scale: 1, opacity: 0.5 }}
    animate={{ scale: 2.8, opacity: 0 }}
    transition={{ duration: 1.6, ease: 'easeOut', delay }}
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      border: '1px solid rgba(74, 222, 128, 0.3)',
      pointerEvents: 'none',
    }}
  />
)

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  stepId: MappingStepId
  confirmedCount: number
  skippedCount: number
  onContinue: () => void
}

export const StepSuccess = ({ stepId, confirmedCount, skippedCount, onContinue }: Props) => {
  const step = STEP_CONFIG.find((s) => s.id === stepId)!
  const isLastStep = step.nextStepLabel === ''

  return (
    <Box flex="1" display="flex" alignItems="center" justifyContent="center" padding="spacing.8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ width: '100%', maxWidth: 480 }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4" textAlign="center">

          {/* Icon with sonar rings */}
          <motion.div variants={iconVariants} style={{ position: 'relative', width: 56, height: 56 }}>
            <SonarRing delay={0.05} />
            <SonarRing delay={0.42} />
            <Box
              width="56px"
              height="56px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backgroundColor="feedback.background.positive.subtle"
              borderRadius="max"
            >
              <CheckCircleIcon color="interactive.icon.positive.normal" size="large" />
            </Box>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants}>
            <Heading size="large" color="surface.text.gray.normal">
              All {step.entityLabel} mapped!
            </Heading>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants}>
            <Text color="surface.text.gray.muted">
              {confirmedCount} confirmed
              {skippedCount > 0 && ` · ${skippedCount} skipped`}
            </Text>
          </motion.div>

          {skippedCount > 0 && (
            <motion.div variants={itemVariants}>
              <Text size="small" color="surface.text.gray.muted">
                Skipped items can be mapped manually from the bills page.
              </Text>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
            <Button onClick={onContinue} size="large">
              {isLastStep ? 'Finish mapping' : `Continue to ${step.nextStepLabel} →`}
            </Button>
          </motion.div>

        </Box>
      </motion.div>
    </Box>
  )
}
