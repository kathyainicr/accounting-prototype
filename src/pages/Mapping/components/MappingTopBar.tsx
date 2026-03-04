import { useNavigate } from 'react-router-dom'
import { Box, Text, IconButton, Divider } from '@razorpay/blade/components'
import { CloseIcon } from '@razorpay/blade/components'

export const MappingTopBar = () => {
  const navigate = useNavigate()

  return (
    <Box flexShrink={0}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX="spacing.6"
        paddingY="spacing.4"
      >
        <IconButton
          icon={CloseIcon}
          accessibilityLabel="Close mapping wizard"
          onClick={() => navigate('/home')}
        />

        <Text weight="semibold" color="surface.text.gray.normal">
          Categorise with AI
        </Text>

        {/* Spacer keeps title visually centred */}
        <Box width="40px" />
      </Box>

      <Divider />
    </Box>
  )
}
