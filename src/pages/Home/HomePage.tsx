import { Box, Heading } from '@razorpay/blade/components'


const HomePage = () => (
  <Box display="flex" flexDirection="column" gap="spacing.8">
    <Box display="flex" flexDirection="column" gap="spacing.2">
      <Heading as="h1" size="medium" color="surface.text.gray.normal" weight="medium">
        Good morning, Acme Corp
      </Heading>
    </Box>
  </Box>
)

export default HomePage
