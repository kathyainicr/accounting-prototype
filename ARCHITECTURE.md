# ARCHITECTURE.md

---

## Route Map

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | DashboardLayout | Shell layout; children render in Outlet |
| `/home` | HomePage | Overview: BillsOverviewCard + MappingCtaCard + bills preview |
| `/accounting/bills` | BillsPage | AI categorisation flow (see below) |
| `/accounting/bills/categorise/:billId` | CategorizeBillModal | Full-screen modal — opened via React state, not route navigation |
| `/accounting/vendor` | VendorPage | Vendor list + detail drawer |
| `/accounting/map` | MappingPage | **Flow 2** — Map with AI wizard (OUTSIDE DashboardLayout — own full-screen layout) |
| `/v3/accounting/overview` | AccountingOverviewPage | **Flow 3** — Accounting review dashboard for Ray AI mapping approval |
| `/v3/accounting/items` | AccountingModulePage | V3 review queue — Items |
| `/v3/accounting/vendors` | AccountingModulePage | V3 review queue — Vendors |
| `/v3/accounting/bills` | AccountingModulePage | V3 review queue — Bills |
| `/v3/accounting/expenses` | AccountingModulePage | V3 review queue — Expenses / payouts |
| `/v3/accounting/advances` | AccountingModulePage | V3 review queue — Vendor advances |
| `/v3/accounting/more/cost-centers` | AccountingModulePage | V3 support page under More |
| `/v3/accounting/more/gst` | AccountingModulePage | V3 GST ledger mapping page under More |
| `/v3/accounting/more/tds` | AccountingModulePage | V3 TDS mapping page under More |
| `*` | HomePage | Catch-all so deep links don't 404 |

---

## Component Inventory

### Layouts
- `src/layouts/DashboardLayout.tsx` — Shell: SideNav + PageHeader + `<Outlet />`

### Navigation
- `src/navigation/navItems.ts` — Nav data config (L1/L2 items, badge metadata)
- `src/navigation/utils.ts` — `isNavItemActive()` + `getPageTitle()`
- `src/navigation/SideNavComponent.tsx` — Blade `SideNav` renderer
- `src/navigation/TopNavComponent.tsx` — Blade `TopNav` with `TabNav` + actions

### Context
- `src/context/AccountingContext.tsx` — Shared state: `vendorLedgers` (Record<vendorId, ledgerName>) + `costCenters` (Record<billId, costCenter>) + `itemCategories` (Record<itemId, ItemCategory>)
- `src/context/AccountingV3Context.tsx` — Flow 3 review state: per-module rows, approve/edit/exclude helpers, module/global sync actions, overview counters
- `src/context/MappingContext.tsx` — **Flow 2** wizard state: per-step resolutions, stepMeta (hasSeen), activeStep, showFinalCompletion, `isWizardComplete` (derived)

### Pages

#### Accounting V3 (`src/pages/AccountingV3/`)
| File | Purpose |
|------|---------|
| `AccountingOverviewPage.tsx` | Operational dashboard for review progress, sync readiness, and Ray queue entry point |
| `AccountingModulePage.tsx` | Shared review workspace used by Items, Vendors, Bills, Expenses, Advances, Cost Centers, GST, and TDS; underline tabs only, icon-based mapping state, synced rows are read-only, Bills includes upstream item/vendor blocker summary, tables support real field filters inside `ListViewFilters` and tab-aware bulk actions |
| `SyncBooksModal.tsx` | Animated sync progress modal with operational step feedback |
| `data.ts` | V3 module configs, route labels, options, and initial mock review rows |
| `types.ts` | Flow 3 domain types |

#### Bills (`src/pages/Accounting/Bills/`)
| File | Purpose |
|------|---------|
| `BillsPage.tsx` | Main page: overview panel, FTUX ListView, post-AI Tabs |
| `BillDetailDrawer.tsx` | Right-side drawer: bill details + context-aware footer CTAs |
| `CategorizeBillPage.tsx` | Full-screen modal: Tally mapping form with AI pre-fill |
| `billsMockData.ts` | Types + `STATUS_CONFIG` + 20 mock bills |
| `aiMockData.ts` | AI suggestions, confidence tiers, `FAFCounts`, `getConfidenceTierMeta` |
| `aiStyles.ts` | `AiGradientText`, `getAiIconColor` |

#### Vendor (`src/pages/Accounting/Vendor/`)
| File | Purpose |
|------|---------|
| `VendorPage.tsx` | Vendor list with QuickFilters |
| `VendorDetailDrawer.tsx` | Right-side drawer: vendor details + sync CTA |
| `vendorMockData.ts` | Types + `VENDOR_STATUS_CONFIG` + 15 mock vendors |

#### Home (`src/pages/Home/`)
| File | Purpose |
|------|---------|
| `HomePage.tsx` | 2-col overview (BillsOverviewCard + MappingCtaCard) + bills preview table |
| `BillsOverviewCard.tsx` | Bill stats: Needs review / Ready to sync / Synced / Error found |
| `MappingCtaCard.tsx` | 4 adaptive states driven by MappingContext (Fresh / In-progress / New items / Done) |

#### Mapping wizard (`src/pages/Mapping/`) — Flow 2
| File | Purpose |
|------|---------|
| `MappingPage.tsx` | Full-screen route shell; renders FinalCompletion overlay when complete |
| `types.ts` | Domain types: MappingStepId, ResolutionStatus, MappingResolution, ConfidenceTier, entity shapes |
| `constants.ts` | STEP_CONFIG (3 steps), bucket labels, TALLY_COST_CENTER_OPTIONS, ITEM_LEDGER_OPTIONS |
| `mappingMockData.ts` | 7 vendors / 4 items / 5 cost centers with confidence tiers + bucketing helpers |
| `components/MappingTopBar.tsx` | ✕ close button + title + "progress saved" indicator |
| `components/StepSidebar.tsx` | 3 independent step nav items; mini progress bars + "new" badges |
| `components/StepContent.tsx` | Step dispatcher: renders ConfidenceGroups or StepSuccess; fires AccountingContext side effects on confirm |
| `components/ConfidenceGroup.tsx` | High/medium/unmatched sections with "Approve all" for high bucket |
| `components/MappingCard.tsx` | Per-entity interactive card (pending/confirmed/skipped states) + MappingCardData type |
| `components/ItemInventoryToggle.tsx` | Track inventory Switch + optional item ledger dropdown |
| `components/StepSuccess.tsx` | Step completion delight (Framer Motion entrance) |
| `components/FinalCompletion.tsx` | Full-screen overlay: per-step summary + "Sync all to Tally →" |

---

## Bills Page — State Architecture

```
BillsPage state
├── aiState: 'idle' | 'processing' | 'done'
├── activeTab: TabId
├── counts: FAFCounts              ← tracks all tab counters (source of truth for tab badges)
├── ftuxFilter: string             ← pre-AI QuickFilter selection
│
├── selectedBill: Bill | null      ← controls BillDetailDrawer open/close
├── selectedAiSuggestion           ← passed to drawer for AI field rendering
├── categorizeBill: Bill | null    ← controls CategorizeBillModal open/close
├── categorizeBillSuggestion       ← passed to modal for AI pre-fill
│
├── acceptedBillIds: Set<string>   ← bills categorised from Needs Review → queued to ready
├── excludedBillIds: Set<string>   ← bills excluded from Needs Review
├── syncedFromReadyIds: Set<string>← bills removed from Ready to Sync (includes pending + excluded)
└── pendingToSyncBills: Bill[]     ← bills queued for Tally sync (shown in Pending to Sync tab)
```

### Tab data flow
```
MOCK_BILLS (20 mock bills, static)
    │
    ├── NEEDS_ACTION_BILLS (status='categorise')
    │       filtered by: !acceptedBillIds, !excludedBillIds, confidence !== 'high' (post-AI)
    │       → NeedsActionTable
    │
    ├── HIGH_CONFIDENCE_BILLS (AI suggestions with confidence='high')
    │       deduplicated by bill ID, filtered by: !syncedFromReadyIds
    │       → ReadyToSyncTable
    │
    ├── pendingToSyncBills (runtime state)
    │       → Pending to Sync ListView
    │
    ├── SYNCED_BILLS (status='synced')     → read-only BillsTable
    ├── EXCLUDED_BILLS (status='excluded') → read-only BillsTable
    └── ISSUES_BILLS (status='error_found')→ read-only BillsTable
```

### Bill action flows
- **Categorise** (Needs Review drawer): `handleSaveAndNext` → acceptedBillIds + auto-advances to next bill
- **Exclude** (Needs Review drawer): `handleExclude` → excludedBillIds
- **Sync to Tally** (hover / Ready to Sync drawer): `handleQueueForSync` → syncedFromReadyIds + pendingToSyncBills
- **Bulk Sync** (toolbar): `handleBulkSync` → syncedFromReadyIds + pendingToSyncBills (batch)
- **Exclude from Ready** (Ready to Sync drawer): `handleExcludeFromReady` → syncedFromReadyIds only

---

## Mapping Wizard — State Architecture (Flow 2)

```
MappingContext (src/context/MappingContext.tsx)
├── activeStep: MappingStepId              ← 'vendors' | 'items' | 'costCenters'
├── vendorResolutions: Record<id, Resolution>   ← seeded from MAPPING_VENDORS
├── itemResolutions: Record<id, Resolution>     ← seeded from MAPPING_ITEMS
├── costCenterResolutions: Record<id, Resolution>
├── stepMeta: Record<stepId, { hasSeen: boolean }>  ← dismisses new-items banner
├── showFinalCompletion: boolean            ← set true when last step's "Finish" is clicked
└── isWizardComplete: boolean (derived)    ← all resolutions !== 'pending'
```

### Resolution state machine
```
pending → confirmed (user clicks Confirm or Approve All)
pending → skipped   (user clicks Skip for now)
confirmed/skipped → pending (user clicks Edit/Reconsider)
```

### Step completion flow
```
All items in step resolved →
  StepContent shows StepSuccess (Framer Motion)
  "Continue" → dismissedSteps.add(step) + setActiveStep(next)
  "Finish" (last step) → setShowFinalCompletion(true)
  FinalCompletion overlay renders in MappingPage
```

### AccountingContext cross-wiring
- Vendor confirm → `setVendorLedger(vendorId, ledgerName)` (vendors are now "synced" in VendorPage)
- Item confirm → `setItemCategory(itemId, { purchaseLedger, trackInventory: false })` (items are now "synced" in ItemsPage)

---

## Key Structural Decisions

- **Dark theme**: `colorScheme="dark"` in `BladeProvider` (src/main.tsx) — do not modify unless explicitly asked
- **Flow 3 default**: Accounting nav routes point at `/v3/accounting/*`; FlowSwitcher opens Flow 3 by default for new accounting work
- **Flow 3 review affordances**: Mapping state is conveyed with icons (Ray / edited / needs input), reasons are shown via info tooltip, and Bills nudges users to fix Items and Vendors first
- **Routing**: react-router-dom v6/v7 — layout routes with `<Outlet />` pattern
- **State**: Local state only — `useState`, `useContext`. No Redux.
- **Styling**: Blade components + spacing tokens first; `styled-components` only where Blade has no equivalent (e.g. multi-colour segmented progress bar, hover fade animations)
- **SideNav**: `position="absolute"` inside a `position="relative"` container
- **Content margin**: Uses `SIDE_NAV_EXPANDED_L1_WIDTH_BASE` / `SIDE_NAV_EXPANDED_L1_WIDTH_XL` from Blade
- **Active state**: `isNavItemActive()` uses `matchPath({ path, end: false }, pathname)` — parent routes stay active on child routes
- **npm install**: Always use `--legacy-peer-deps` (Blade has React Native peer dep conflicts)
- **Table grid**: Do NOT set `gridTemplateColumns` on Tables that use both `selectionType` and `hoverActions` — Blade auto-calculates the correct column count
- **ReadyToSyncTable deduplication**: `readyToSyncBills` uses a `seen` Set to prevent duplicate bill IDs when multiple AI suggestions share a vendor

---

## Blade API Patterns (confirmed working)

| Pattern | Implementation |
|---------|---------------|
| Table row selection | `selectionType="multiple"` + `onSelectionChange` on `Table` |
| Table row hover actions | `hoverActions={<Box>...</Box>}` prop on `TableRow` — Blade adds "Actions" column automatically |
| Table bulk action toolbar | `toolbar={<TableToolbar>...<TableToolbarActions>...</TableToolbarActions></TableToolbar>}` on `Table` |
| Toolbar button sizing | Wrap in `<Box flexShrink={0}>` to prevent shrinking in flex toolbar |
| Counter in TabItem | `trailing={<Counter value={n} color="..." />}` on `TabItem` |
| AI gradient text | Custom `styled-components` keyframe animation — no Blade equivalent |
| Drawer footer | `DrawerFooter` always accepts free children; `Drawer` only accepts `DrawerHeader`, `DrawerBody`, `DrawerFooter` |

---

## Dependencies

- `react-router-dom` — installed with `--legacy-peer-deps`
- `framer-motion` — AI panel state transitions
- `styled-components` — segmented progress bar, hover fade, AI gradient text
