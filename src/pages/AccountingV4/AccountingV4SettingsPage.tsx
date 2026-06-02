import {
  Box,
  Heading,
  Text,
  Switch,
} from '@razorpay/blade/components'
import { useAccountingV4 } from '../../context/AccountingV4Context'
import { V4_ENTITY_CONFIG } from './data'
import type { V4EntityKey } from './types'

const ENTITY_ORDER: V4EntityKey[] = ['items', 'vendors', 'costCenters', 'gst', 'tds']

const ENTITY_DESCRIPTIONS: Record<V4EntityKey, string> = {
  items: 'Map RazorpayX items to Tally purchase accounts',
  vendors: 'Map vendor contacts to Tally ledger accounts',
  costCenters: 'Map cost center allocations to Tally cost centres',
  gst: 'Map GST components to input tax ledgers',
  tds: 'Map TDS deductions to payable ledgers',
}

export default function AccountingV4SettingsPage() {
  const { settings, updateSettings } = useAccountingV4()

  const handleToggle = (key: V4EntityKey, checked: boolean) => {
    updateSettings({
      enabledEntities: {
        ...settings.enabledEntities,
        [key]: checked,
      },
    })
  }

  return (
    <Box paddingTop="spacing.6" paddingBottom="spacing.8" display="flex" flexDirection="column" gap="spacing.8">
      {/* Entity mapping section */}
      <Box display="flex" flexDirection="column" gap="spacing.6">
        <Box>
          <Heading size="medium" weight="semibold">Entity mapping</Heading>
          <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
            Choose which entities Ray maps to your accounting ledgers. Disabling an entity removes
            it from the Mappings page.
          </Text>
        </Box>

        <Box display="flex" flexDirection="column" gap="spacing.2">
          {ENTITY_ORDER.map((key, idx) => {
            const config = V4_ENTITY_CONFIG[key]
            const isEnabled = settings.enabledEntities[key]

            return (
              <Box key={key}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  padding="spacing.5"
                  backgroundColor="surface.background.gray.intense"
                  borderColor="surface.border.gray.muted"
                  borderWidth="thin"
                  borderRadius="medium"
                >
                  <Box>
                    <Text weight="semibold" size="medium">{config.label}</Text>
                    <Text size="small" color="surface.text.gray.muted" marginTop="spacing.1">
                      {ENTITY_DESCRIPTIONS[key]}
                    </Text>
                  </Box>
                  <Switch
                    isChecked={isEnabled}
                    onChange={({ isChecked }) => handleToggle(key, isChecked)}
                    accessibilityLabel={`Enable ${config.label} mapping`}
                  />
                </Box>
                {idx < ENTITY_ORDER.length - 1 && (
                  <Box height="2px" />
                )}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
