# TASKS.md

---

## Iteration 1 — Accounting: Bills AI Categorisation ✅

### Foundation
- [x] Install react-router-dom (`--legacy-peer-deps`)
- [x] Dark theme — `colorScheme="dark"` in BladeProvider
- [x] Clean CSS reset (removed Vite default styles)
- [x] Navigation data config (`navItems.ts`)
- [x] Active state utility (`utils.ts` — `isNavItemActive`, `getPageTitle`)
- [x] SideNav with L1 + L2 nested navigation and Counter badges
- [x] TopNav with TabNav product tabs, Search, Avatar
- [x] DashboardLayout shell (TopNav + SideNav + Outlet)
- [x] Home page with stat cards (`/home`)
- [x] Routing setup (BrowserRouter, layout routes, catch-all `*`)

### Accounting context & routing
- [x] `AccountingContext` — shared state: `vendorLedgers` + `costCenters`
- [x] Accounting routes: `/accounting/bills`, `/accounting/bills/categorise/:billId`, `/accounting/vendor`

### Bills page — Overview panel
- [x] Stats row: Book closure countdown, Total Transactions, % Synced
- [x] Segmented progress bar (custom styled-components — Blade has no multi-color ProgressBar)
- [x] Legend with Indicator + counts per segment
- [x] AI panel (dark teal) — 3 states: idle / processing / done (Framer Motion transitions)
  - Idle: "Categorise with AI" + Run Auto Categorise button
  - Processing: Spinner + "Analysing bills..."
  - Done: Bill counts (Ready / Need review) + "Review flagged bills" CTA

### Bills page — FTUX ListView (pre-AI)
- [x] `ListView` + `ListViewFilters` + `QuickFilterGroup`
- [x] QuickFilters: All, Categorise, Synced, Error Found, Excluded
- [x] Generic `BillsTable` (reusable across all tabs)

### Bills page — Post-AI tabs
- [x] `Tabs` (variant="bordered") with 6 tab panels — `isLazy`
- [x] **Needs Review** tab — `NeedsActionTable` with hover actions: "View Details" (primary) + "Categorise" (secondary)
- [x] **Ready to Sync** tab — `ReadyToSyncTable`:
  - `TableToolbar` + `TableToolbarActions` with "Sync to Tally" / "Sync X bills" button (hugs content)
  - Row checkbox selection (`selectionType="multiple"`)
  - Hover actions: "Sync to Tally" (primary) + "View Details" (secondary)
  - Bulk sync moves selected bills → Pending to Sync
- [x] **Pending to Sync** tab — `ListView` with `BillsTable` + Confidence column; bills queued here after sync action
- [x] **Synced** tab — read-only `BillsTable`
- [x] **Excluded** tab — read-only `BillsTable`
- [x] **Error Found** tab — read-only `BillsTable`

### Bill Detail Drawer (`BillDetailDrawer`)
- [x] Confidence badge + AI gradient text for AI-filled fields
- [x] Tally Details section (2-column grid; AI fields with RayIcon + animated gradient)
- [x] Vendor Payment section (badge, dates, invoice details)
- [x] Context-aware footer CTAs:
  - **Ready to Sync**: "Sync to Tally" (primary) + "Review" (secondary) + "Exclude bill" (destructive link)
  - **Needs Review (AI suggestion)**: "Review categorisation" (primary) + "Exclude bill"
  - **Needs Review (no AI)**: "Categorise" (primary) + "Exclude bill"
  - **Error Found**: "Retry Sync" + "Exclude bill"

### Categorise Bill (full-screen modal)
- [x] `Modal size="full"` with left panel (bill details) + right panel (Tally mappings)
- [x] 5 mapping rows: Vendor Ledger, Item Ledger, GST Ledger, Cost Center (dropdown), Posting Date
- [x] AI pre-fill: confidence badge, RayIcon on AI-suggested fields
- [x] Missing mapping alert + count
- [x] Queue flow: `handleSaveAndNext` auto-advances to next Needs Review bill

### Vendor page
- [x] `VendorPage` with `ListView` + QuickFilters (All / Categorise / Synced)
- [x] `VendorDetailDrawer` — vendor details + "Save and sync to Tally" CTA

### Mock data layer
- [x] `billsMockData.ts` — 20 bills, `STATUS_CONFIG`, `BillStatus` types
- [x] `aiMockData.ts` — 18 AI suggestions (High / Medium / Low confidence), `FAFCounts`, `getConfidenceTierMeta`
- [x] `aiStyles.ts` — `AiGradientText`, `getAiIconColor`
- [x] `vendorMockData.ts` — 15 vendors, `VENDOR_STATUS_CONFIG`

---

## Iteration 2 — Map with AI Wizard ✅

### Home page
- [x] 2-column overview layout: `BillsOverviewCard` (bill stats) + `MappingCtaCard` (4 adaptive states)
- [x] `MappingCtaCard` states: Fresh → In-progress → New items badge → All done (sync CTA)
- [x] Bills preview table (first 5 bills — vendor, amount, status badge, date)

### FlowSwitcher + routing
- [x] Flow 2 enabled in `FlowSwitcher.tsx` → `/accounting/map`
- [x] `/accounting/map` route added OUTSIDE `DashboardLayout` in `App.tsx`
- [x] `MappingProvider` wraps `BrowserRouter` (accessible from both routes)

### Data layer
- [x] `src/pages/Mapping/types.ts` — all domain types (MappingStepId, ResolutionStatus, MappingResolution, ConfidenceTier, entity shapes, MappingContextValue)
- [x] `src/pages/Mapping/constants.ts` — STEP_CONFIG (3 steps), confidence bucket labels, Tally option arrays
- [x] `src/pages/Mapping/mappingMockData.ts` — 7 vendors (3H/2M/2U), 4 items (2H/1M/1U), 5 cost centers (2H/2M/1U); bucketing helpers; new-item count helpers
- [x] `src/context/MappingContext.tsx` — resolutions (vendor/item/costCenter), stepMeta (hasSeen), activeStep, stepShowingSuccess, showFinalCompletion, isWizardComplete (derived)

### Wizard shell (Phase 2)
- [x] `MappingPage.tsx` — full-screen layout outside DashboardLayout; renders FinalCompletion overlay when done
- [x] `MappingTopBar.tsx` — ✕ close → /home, centered title, "Your progress is saved" indicator
- [x] `StepSidebar.tsx` — 3 independent steps (free navigation); per-step X/Y progress + mini bar + "N new" badge
- [x] `StepContent.tsx` — dispatches to per-step groups; step completion detection; new-items Alert banner

### Mapping cards (Phase 3)
- [x] `MappingCard.tsx` — 3 visual states (pending/confirmed/skipped); confidence badge; AI suggestion pre-fill; [Skip for now] / [Confirm] / [Edit] / [Reconsider] actions
- [x] `ItemInventoryToggle.tsx` — Blade `Switch`; when ON shows item ledger dropdown
- [x] `ConfidenceGroup.tsx` — section header + count badge + "Approve all" for high bucket; lists MappingCards

### Delight states (Phase 4)
- [x] `StepSuccess.tsx` — Framer Motion entrance; "All [entities] mapped!"; confirmed/skipped stats; Continue/Finish CTA
- [x] `FinalCompletion.tsx` — full-screen overlay; per-step summary rows; "Go to bills" + "Sync all to Tally →"

### Integration (Phase 6)
- [x] Vendor confirms → `setVendorLedger(id, value)` in AccountingContext
- [x] Item confirms → `setItemCategory(id, { purchaseLedger: value, trackInventory: false })` in AccountingContext
- [x] Approve-all bulk action also fires AccountingContext side effects

---

## Backlog 📋

- [ ] Items page (`/accounting/items`)
- [ ] Advances page (`/accounting/advances`)
- [ ] Settings page (`/accounting/settings`)
- [ ] Wire up remaining sidebar routes (Payouts, Account Statement, Contacts, etc.)
- [ ] Mobile responsiveness testing
- [ ] Real API/data layer
