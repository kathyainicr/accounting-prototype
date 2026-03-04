import type { IconComponent } from '@razorpay/blade/components'
import {
  HomeIcon,
  ArrowUpRightIcon,
  FileTextIcon,
  UsersIcon,
  TrendingUpIcon,
  VendorPaymentsIcon,
  TaxPaymentsIcon,
  BookIcon,
  PayoutLinkIcon,
  BoxIcon,
  RazorpayxPayrollIcon,
  ReportsIcon,
  SettingsIcon,
} from '@razorpay/blade/components'

export type L2NavItem = {
  title: string
  href: string
  badgeCount?: number
  badgeMax?: number
}

export type L1NavItem = {
  title: string
  href: string
  icon: IconComponent
  children?: L2NavItem[]
}

export type NavSection = {
  title?: string
  items: L1NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    // Section 1 — primary nav (no visible title = renders as plain divider)
    items: [
      {
        title: 'Home',
        href: '/home',
        icon: HomeIcon,
      },
      {
        title: 'Payouts',
        href: '/payouts',
        icon: ArrowUpRightIcon,
        children: [
          { title: 'Bulk Payouts', href: '/payouts/bulk' },
          { title: 'Payout Summary', href: '/payouts/summary' },
          { title: 'Scheduled', href: '/payouts/scheduled' },
        ],
      },
      {
        title: 'Account Statement',
        href: '/account-statement',
        icon: FileTextIcon,
      },
      {
        title: 'Contacts',
        href: '/contacts',
        icon: UsersIcon,
        children: [
          { title: 'All Contacts', href: '/contacts/all' },
          { title: 'Manage Groups', href: '/contacts/groups' },
        ],
      },
    ],
  },
  {
    // Section 2 — secondary nav (no visible title = renders as divider)
    items: [
      {
        title: 'Insights',
        href: '/insights',
        icon: TrendingUpIcon,
      },
      {
        title: 'Vendor Payments',
        href: '/vendor-payments',
        icon: VendorPaymentsIcon,
        children: [
          { title: 'Create', href: '/vendor-payments/create' },
          { title: 'Pending', href: '/vendor-payments/pending' },
          { title: 'History', href: '/vendor-payments/history' },
        ],
      },
      {
        title: 'Tax Payments',
        href: '/tax-payments',
        icon: TaxPaymentsIcon,
        children: [
          { title: 'GST', href: '/tax-payments/gst' },
          { title: 'TDS', href: '/tax-payments/tds' },
          { title: 'Others', href: '/tax-payments/others' },
        ],
      },
      {
        title: 'Accounting',
        href: '/accounting',
        icon: BookIcon,
        children: [
          { title: 'Bills', href: '/v1/accounting/bills', badgeCount: 99, badgeMax: 99 },
          { title: 'Vendor', href: '/v1/accounting/vendor', badgeCount: 99, badgeMax: 99 },
          { title: 'Items', href: '/v1/accounting/items', badgeCount: 57, badgeMax: 99 },
          { title: 'Advances', href: '/accounting/advances', badgeCount: 2, badgeMax: 99 },
          { title: 'Settings', href: '/accounting/settings' },
        ],
      },
      {
        title: 'Payout Links',
        href: '/payout-links',
        icon: PayoutLinkIcon,
      },
      {
        title: 'Cost Centers',
        href: '/cost-centers',
        icon: BoxIcon,
      },
      {
        title: 'Payroll',
        href: '/payroll',
        icon: RazorpayxPayrollIcon,
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: ReportsIcon,
      },
    ],
  },
]

export const FOOTER_NAV_ITEM: L1NavItem = {
  title: 'Settings',
  href: '/settings',
  icon: SettingsIcon,
  children: [
    { title: 'Profile', href: '/settings/profile' },
    { title: 'Team', href: '/settings/team' },
    { title: 'Security', href: '/settings/security' },
    { title: 'Preferences', href: '/settings/preferences' },
  ],
}
