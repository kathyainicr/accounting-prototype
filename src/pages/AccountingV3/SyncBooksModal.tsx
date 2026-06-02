import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Box,
  Button,
  ProgressBar,
  Text,
  StepGroup,
  StepItem,
  StepItemIcon,
  StepItemIndicator,
  CheckCircleIcon,
  ClockIcon,
} from '@razorpay/blade/components'
import { SYNC_STEP_LABELS } from './data'

type Props = {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onComplete: () => void
}

export const SyncBooksModal = ({ isOpen, title, description, onClose, onComplete }: Props) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  const handleClose = () => {
    setActiveStepIndex(0)
    setHasCompleted(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return

    let currentStep = 0
    const intervalId = window.setInterval(() => {
      currentStep += 1

      if (currentStep >= SYNC_STEP_LABELS.length) {
        window.clearInterval(intervalId)
        setHasCompleted(true)
        onComplete()
        return
      }

      setActiveStepIndex(currentStep)
    }, 700)

    return () => window.clearInterval(intervalId)
  }, [isOpen, onComplete])

  const progressValue = useMemo(() => {
    if (hasCompleted) return 100
    return Math.round(((activeStepIndex + 1) / SYNC_STEP_LABELS.length) * 100)
  }, [activeStepIndex, hasCompleted])

  return (
    <Modal isOpen={isOpen} onDismiss={handleClose} size="medium" accessibilityLabel={title}>
      <ModalHeader title={title} />
      <ModalBody>
        <Box display="flex" flexDirection="column" gap="spacing.6">
          <Box>
            <Text size="medium" color="surface.text.gray.normal" marginBottom="spacing.2">
              {description}
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              Ray is sequencing the approved mappings and verifying the book structure before posting.
            </Text>
          </Box>

          <ProgressBar value={progressValue} variant="progress" />

          <StepGroup orientation="vertical" size="medium">
            {SYNC_STEP_LABELS.map((step, index) => {
              const isComplete = hasCompleted || index < activeStepIndex
              const isCurrent = !hasCompleted && index === activeStepIndex

              return (
                <StepItem
                  key={step}
                  title={step}
                  stepProgress={index < SYNC_STEP_LABELS.length - 1 ? 'full' : 'none'}
                  marker={
                    isComplete ? (
                      <StepItemIcon icon={CheckCircleIcon} color="positive" />
                    ) : isCurrent ? (
                      <StepItemIcon icon={ClockIcon} color="information" />
                    ) : (
                      <StepItemIndicator color="neutral" />
                    )
                  }
                />
              )
            })}
          </StepGroup>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button variant="primary" onClick={handleClose} isDisabled={!hasCompleted}>
            {hasCompleted ? 'Done' : 'Syncing...'}
          </Button>
        </Box>
      </ModalFooter>
    </Modal>
  )
}
