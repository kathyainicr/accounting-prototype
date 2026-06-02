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
  type?: 'link' | 'divider'
  title: string
  href?: string
  badgeCount?: number
  badgeMax?: number
  children?: L2NavItem[]
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
          { title: 'Overview', href: '/v3/accounting/overview' },
          { title: 'Bills', href: '/v3/accounting/bills', badgeCount: 14, badgeMax: 99 },
          { title: 'Expenses', href: '/v3/accounting/expenses', badgeCount: 9, badgeMax: 99 },
          { title: 'Advances', href: '/v3/accounting/advances', badgeCount: 6, badgeMax: 99 },
          { type: 'divider', title: 'Rules' },
          { title: 'Items', href: '/v3/accounting/items', badgeCount: 11, badgeMax: 99 },
          { title: 'Vendors', href: '/v3/accounting/vendors', badgeCount: 8, badgeMax: 99 },
          {
            title: 'More',
            href: '/v3/accounting/more/gst',
            children: [
              { title: 'Cost Centers', href: '/v3/accounting/more/cost-centers' },
              { title: 'GST', href: '/v3/accounting/more/gst' },
              { title: 'TDS', href: '/v3/accounting/more/tds' },
            ],
          },
        ],
      },
      {
        title: 'Accounting',
        href: '/v4/accounting',
        icon: BookIcon,
        children: [
          { title: 'Overview', href: '/v4/accounting/overview' },
          { title: 'Bills', href: '/v4/accounting/bills', badgeCount: 14, badgeMax: 99 },
          { title: 'Expenses', href: '/v4/accounting/expenses', badgeCount: 9, badgeMax: 99 },
          { title: 'Advances', href: '/v4/accounting/advances', badgeCount: 6, badgeMax: 99 },
          { type: 'divider', title: 'Configure' },
          { title: 'Mappings', href: '/v4/accounting/mappings' },
          { title: 'Smart Rules', href: '/v4/accounting/rules' },
          { title: 'Settings', href: '/v4/accounting/settings' },
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
