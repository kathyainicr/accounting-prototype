import styled, { keyframes } from 'styled-components'
import { Box, Text, RayIcon } from '@razorpay/blade/components'
import { useThemeContext } from '../../../../context/ThemeContext'

const gradientFlow = keyframes`
  from { background-position: 0% center; }
  to   { background-position: 200% center; }
`

const BannerWrapper = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark ? '#033E3E' : '#033E3E'};
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const GradientHeading = styled.p<{ $isDark: boolean }>`
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Tasa Orbiter', sans-serif;
  background: ${p => p.$isDark ? `linear-gradient(90deg, #EBFAF3 25%, #48D08C 40%, #EBFAF3 75%)` : `linear-gradient(90deg, #EBFAF3 25%, #48D08C 40%, #EBFAF3 75%)`};
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

export const AiBanner = ({ heading, description, children }: Props) => {
  const { colorScheme } = useThemeContext()
  const isDark = colorScheme === 'dark'

  return (
    <BannerWrapper $isDark={isDark}>
      <Box display="flex" alignItems="top" gap="spacing.4" flex="1">
        <Box paddingTop="spacing.1">
          <RayIcon size="large" color="feedback.icon.positive.intense" />
        </Box>
        <Box>
          <GradientHeading $isDark={isDark}>{heading}</GradientHeading>
          <Text size="small" color="surface.text.staticWhite.muted">{description}</Text>
        </Box>
      </Box>
      {children}
    </BannerWrapper>
  )
}
