import {
  EditComposeIcon,
  ClockIcon,
  SettlementsIcon,
  AlertTriangleIcon,
  TagIcon,
} from '@razorpay/blade/components'
import type { IconComponent } from '@razorpay/blade/components'

export type AccountingEntityStatus =
  | 'categorise'
  | 'pending_tally_sync'
  | 'synced'
  | 'error_found'
  | 'excluded'

export type AccountingStatusConfigEntry = {
  label: string
  badgeColor: 'information' | 'positive' | 'negative' | 'neutral' | 'notice' | 'primary'
  badgeIcon: IconComponent
  indicatorColor: 'information' | 'positive' | 'negative' | 'neutral' | 'notice' | 'primary'
  drawerHeaderColor?: 'positive' | 'information' | 'notice' | 'negative'
}

export const ACCOUNTING_STATUS_CONFIG: Record<AccountingEntityStatus, AccountingStatusConfigEntry> = {
  categorise: {
    label: 'Categorise',
    badgeColor: 'information',
    badgeIcon: EditComposeIcon,
    indicatorColor: 'information',
    drawerHeaderColor: 'information',
  },
  pending_tally_sync: {
    label: 'Pending sync',
    badgeColor: 'primary',
    badgeIcon: ClockIcon,
    indicatorColor: 'primary',
    drawerHeaderColor: 'information',
  },
  synced: {
    label: 'Synced',
    badgeColor: 'positive',
    badgeIcon: SettlementsIcon,
    indicatorColor: 'positive',
    drawerHeaderColor: 'positive',
  },
  error_found: {
    label: 'Error found',
    badgeColor: 'negative',
    badgeIcon: AlertTriangleIcon,
    indicatorColor: 'negative',
    drawerHeaderColor: 'negative',
  },
  excluded: {
    label: 'Excluded',
    badgeColor: 'neutral',
    badgeIcon: TagIcon,
    indicatorColor: 'neutral',
    drawerHeaderColor: undefined,
  },
}
