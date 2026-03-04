import styled, { keyframes } from 'styled-components'
import { Box, Text, RayIcon } from '@razorpay/blade/components'

const gradientFlow = keyframes`
  from { background-position: 0% center; }
  to   { background-position: 200% center; }
`

const BannerWrapper = styled.div`
  background: #033e3e;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const GradientHeading = styled.p`
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(90deg, #E6E9EF 25%, #8D9BB0 40%, #E6E9EF 75%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientFlow} 3s linear infinite;
`

type Props = {
  heading: string
  description: string
  children: React.ReactNode
}

export const AiBanner = ({ heading, description, children }: Props) => (
  <BannerWrapper>
    <Box display="flex" alignItems="center" gap="spacing.4" flex="1">
      <RayIcon size="large" color="feedback.icon.positive.intense" />
      <Box>
        <GradientHeading>{heading}</GradientHeading>
        <Text size="small" color="surface.text.gray.muted">{description}</Text>
      </Box>
    </Box>
    {children}
  </BannerWrapper>
)
