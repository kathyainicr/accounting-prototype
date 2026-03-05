import styled, { keyframes } from 'styled-components'
import { Box, Heading, Text, Indicator, RayIcon } from '@razorpay/blade/components'

const grow = keyframes`from { opacity: 0 } to { opacity: 1 }`
const gradientFlow = keyframes`from { background-position: 0% center } to { background-position: 200% center }`

const BarTrack = styled.div`
  height: 8px;
  border-radius: 1px;
  overflow: hidden;
  display: flex;
  gap: 2px;
  background: rgba(206, 213, 222, 0.18);
`

const BarSeg = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color};
  flex-shrink: 0;
  border-radius: 1px;
  animation: ${grow} 0.3s ease both;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
`

const AiPanel = styled.div`
  width: 313px;
  min-height: 210px;
  background: #033e3e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`

export const GradientHeading = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  background: linear-gradient(90deg, #48d08c 0%, #ffffff 40%, #48d08c 80%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientFlow} 3s linear infinite;
`

export const AiButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.72);
  cursor: pointer;
  height: 36px;
  white-space: nowrap;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  &:active {
    background: rgba(255, 255, 255, 0.8);
  }
`

type SegmentConfig = {
  label: string
  barColor: string
  indicatorColor: 'positive' | 'information' | 'notice' | 'primary' | 'negative' | 'neutral'
  count: number
}

type Props = {
  daysLeft: number
  totalLabel: string
  totalCount: number
  pctSynced: number
  grandTotal: number
  segments: SegmentConfig[]
  children: React.ReactNode
}

export const AccountingStatsCard = ({
  daysLeft,
  totalLabel,
  totalCount,
  pctSynced,
  grandTotal,
  segments,
  children,
}: Props) => (
  <Box
    display="flex"
    flexDirection="row"
    borderWidth="thinner"
    borderStyle="solid"
    borderColor="surface.border.gray.subtle"
    borderRadius="medium"
    overflow="hidden"
    backgroundColor="surface.background.gray.intense"
    minHeight="210px"
  >
    <Box
      flex="1"
      padding="spacing.5"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="spacing.5"
    >
      <Box display="flex" gap="spacing.8" alignItems="flex-start">
        <Box display="flex" flexDirection="column" gap="spacing.1">
          <Text size="medium" color="surface.text.gray.muted">Book closure in</Text>
          <Heading
            size="large"
            weight="semibold"
            color={daysLeft <= 7 ? 'feedback.text.negative.intense' : 'surface.text.gray.subtle'}
          >
            {String(daysLeft).padStart(2, '0')} days
          </Heading>
        </Box>

        <Box display="flex" flexDirection="column" gap="spacing.1">
          <Text size="small" color="surface.text.gray.muted">{totalLabel}</Text>
          <Heading size="large" weight="semibold" color="surface.text.gray.subtle">
            {totalCount.toLocaleString('en-IN')}
          </Heading>
        </Box>

        <Box display="flex" flexDirection="column" gap="spacing.1">
          <Text size="small" color="surface.text.gray.muted">Percentage synced</Text>
          <Heading size="large" weight="semibold" color="surface.text.gray.subtle">
            {pctSynced}%
          </Heading>
        </Box>
      </Box>

      <Box>
        <BarTrack>
          {segments.map(seg => {
            const pct = (seg.count / grandTotal) * 100
            return pct > 0
              ? <BarSeg key={seg.label} $pct={pct} $color={seg.barColor} />
              : null
          })}
        </BarTrack>

        <Box display="flex" gap="spacing.8" marginTop="spacing.4">
          {segments.map(seg => (
            <Box key={seg.label} display="flex" gap="spacing.1" alignItems="flex-start">
              <Box display="flex" alignItems="center" paddingTop="spacing.2">
                <Indicator color={seg.indicatorColor} size="small" accessibilityLabel={seg.label} />
              </Box>
              <Box display="flex" flexDirection="column" gap="spacing.0">
                <Text size="small" color="surface.text.gray.muted">{seg.label}</Text>
                <Text size="small" color="surface.text.gray.subtle">
                  {seg.count.toLocaleString('en-IN')}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>

    <AiPanel>
      {children}
    </AiPanel>
  </Box>
)

type AiPanelProps = {
  title: string
  description: string
  buttonLabel: string
  onButtonClick?: () => void
}

export const AccountingAiPanel = ({ title, description, buttonLabel, onButtonClick }: AiPanelProps) => (
  <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.8">
    <Box display="flex" flexDirection="column" gap="spacing.2" alignItems="center" width="100%">
      <Box display="flex" alignItems="center" gap="spacing.2" justifyContent="center">
        <RayIcon size="medium" color="feedback.icon.positive.intense" />
        <GradientHeading>{title}</GradientHeading>
      </Box>
      <Text size="small" color="surface.text.gray.muted" textAlign="center">
        {description}
      </Text>
    </Box>
    <AiButton type="button" onClick={onButtonClick}>
      <RayIcon size="small" color="interactive.icon.staticBlack.muted" />
      {buttonLabel}
    </AiButton>
  </Box>
)
