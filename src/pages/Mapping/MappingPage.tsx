import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Modal, ModalHeader, ModalBody } from '@razorpay/blade/components'
import { StepSidebar } from './components/StepSidebar'
import { StepContent } from './components/StepContent'
import { FinalCompletion } from './components/FinalCompletion'
import { FlowSwitcher } from '../../components/FlowSwitcher/FlowSwitcher'
import { useMappingContext } from '../../context/MappingContext'
import type { MappingStepId } from './types'

const SLUG_TO_STEP: Record<string, MappingStepId> = {
  vendors: 'vendors',
  items: 'items',
  'cost-centers': 'costCenters',
}

const MappingPage = () => {
  const navigate = useNavigate()
  const { step } = useParams<{ step?: string }>()
  const { showFinalCompletion, setActiveStep } = useMappingContext()

  useEffect(() => {
    const stepId = step ? SLUG_TO_STEP[step] : undefined
    if (stepId) setActiveStep(stepId)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Modal isOpen onDismiss={() => navigate('/home')} size="full">
        <ModalHeader title="Categorise with AI" />

        <ModalBody padding="spacing.0" height="100%">
          {showFinalCompletion ? (
            <FinalCompletion />
          ) : (
            <Box display="flex" height="100%" width="100%">
              <Box
                backgroundColor="surface.background.gray.moderate"
                width="300px"
                flexShrink={0}
                paddingX="spacing.7"
                paddingY="spacing.7"
                overflowY="auto"
              >
                <StepSidebar />
              </Box>

              <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
                <StepContent />
              </Box>
            </Box>
          )}
        </ModalBody>
      </Modal>

      <FlowSwitcher />
    </>
  )
}

export default MappingPage
