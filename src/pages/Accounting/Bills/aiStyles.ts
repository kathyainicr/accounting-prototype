import styled, { keyframes } from 'styled-components'
import type { AIConfidenceTier } from './aiMockData'

const gradientFlow = keyframes`from { background-position: 0% center } to { background-position: 200% center }`

export const AiGradientText = styled.span`
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.8) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientFlow} 3s linear infinite;
`

export const getAiIconColor = (confidence: AIConfidenceTier) => {
  if (confidence === 'high') return 'feedback.icon.positive.intense' as const
  if (confidence === 'medium') return 'feedback.icon.notice.intense' as const
  return 'feedback.icon.negative.intense' as const
}
