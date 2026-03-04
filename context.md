# RazorpayX — AI Categorisation Layer: Project Context

---

## Product Background

RazorpayX is a business banking platform. Within it, there is an Accounting module that helps businesses manage vendor payments and sync that data with their ERP (primarily Tally, which holds ~60% market share in India along with Zoho).

This document captures the full context for the AI-powered categorisation feature being designed for this module.

---

## User Segments

Three distinct segments, each with different pain profiles:

| Segment | Accounting Method | Primary Pain |
|---|---|---|
| SMEs | Cash Flow (pay first, reconcile later) | Manual categorisation is tedious and error-prone |
| Mid-Market | Mix of both | Volume of transactions + categorisation overhead |
| Mid-Market Plus (MM+) | Accrual (invoice first, then pay) | Too many ledgers to manage; categorisation is a hard blocker |

All three share the same hard constraint: **monthly deadline to file GST and TDS**. Missing this means paying extra to the government.

---

## How Accounting Works (Simplified)

Accounting = matching tables. Every payment a company makes needs to be recorded against the correct ledger in Tally so that books are accurate for government filing.

**Two cash flow workflows:**
- **Cash Flow Method:** Pay the vendor first, then enter and reconcile in Tally later. Common with SMEs.
- **Accrual Method:** Invoice is first created inside Tally, then payment is made. Common with larger, structured companies.

---

## The Core Flow (Where the Problem Lives)

1. A vendor (e.g., Nvidia) sends an invoice to the company (e.g., Claude Inc.)
2. The accounts payable team receives the invoice and enters it into RazorpayX
3. Payment is initiated to the vendor via RazorpayX
4. This payment now needs to be **synced with Tally** — meaning every field in RazorpayX must map correctly to the corresponding ledger in Tally
5. If field names don't match between RazorpayX and Tally, the sync fails
6. The accountant has to manually identify mismatches and correct them before re-syncing

---

## The Four Mapping Fields (Current Scope)

Every bill requires four mappings to successfully sync with Tally:

1. **Vendor Ledger** — Maps the vendor name in RazorpayX to the corresponding ledger in Tally
2. **Item Ledger** — Maps the purchased item to its ledger in Tally (editable only via Item Settings — this is a current product constraint)
3. **GST Ledger** — Maps the GST component (e.g., GST Input Credit)
4. **Cost Center** — Maps the internal cost center (e.g., Sales, Engineering)

Once a mapping is saved, it is applied to **all current and future bills** from that vendor/item. So first-time mapping is the primary effort; repeat vendors are usually already mapped.

---

## The Mapping Mismatch Problem

RazorpayX and Tally store the same real-world entity under different names. Example:
- RazorpayX: "Semiconductors"
- Tally: "Silicon Semiconductors"

This mismatch causes a sync error. The accountant must manually identify the correct Tally ledger name and map it.

**When mismatches occur:**
- New vendor whose name on the invoice doesn't match what's in Tally (e.g., invoice from "Anthropic" but Tally has "Claude Inc.")
- New item on an invoice with no prior mapping history
- Recurring vendor but invoice generated under a slightly different name

---

## How Tally Ledgers Are Synced with RazorpayX

- During **onboarding**: RazorpayX pulls all existing ledger names from Tally via API and makes them available as dropdown options
- **Nightly sync**: Any new ledgers added in Tally are pulled into RazorpayX automatically
- **User-created ledgers**: If a user creates a new ledger inside RazorpayX, it needs to be pushed back to Tally

---

## Current UI Screens (Reference)

1. **Bills Screen** — List of all bills with statuses: Categorise, Review, Synced, Sync Failed, Excluded, Error Found, Pending Tally Sync
2. **Categorise Modal** — Shows the bill details on the left; four mapping fields on the right with status (green = mapped, amber = missing)
3. **Items Tab** — Where item-to-ledger mapping is managed separately (current constraint: can't map from the categorise modal directly)
4. **Vendors Tab** — Where vendor-to-ledger mapping is managed; shows GSTIN and PAN alongside vendor name

---

## Data Available Per Transaction (AI Signal Sources)

| Data Point | Reliability as AI Signal |
|---|---|
| PAN | High — unique identifier |
| GSTIN | High — unique identifier |
| Vendor Name | Medium — subject to naming variation |
| Item Name | Medium — no HSN/unit data confirmed yet |
| Payment Amount | Low-Medium — useful for recurring payment patterns |
| Payment Frequency | Medium — helps identify recurring vendors |
| Historical Mapping Data | High — strongest signal for suggestions |

---

## Key Constraints

- Item ledger mapping cannot be done from the categorise modal — redirects to Item Settings (product constraint, not a design choice)
- Ledger names range from ~10 (small SME) to 2,000-3,000 (large MM+) — AI suggestion quality needs to work across this range
- Tally is the source of truth; RazorpayX must conform to Tally's naming
- No user research / interviews conducted yet on the manual categorisation mental model

---

## Open Questions (To Be Answered via User Research)

- What is the accountant's thought process when manually picking a ledger? Name similarity or expense nature?
- When error is found, how does the user currently debug it — Tally lookup, spreadsheet, memory?
- Item ledger attributes: does an item carry HSN code, GST rate, unit of measure, or just the name?

---

## Design Scope

Building an **AI-powered categorisation experience** on top of the existing Bills, Vendors, and Items tabs within RazorpayX Accounting. The goal is to reduce manual mapping effort so users can sync with Tally faster — especially under the monthly GST/TDS filing deadline.

The specific UX model (AI suggests vs. AI auto-categorises) is to be defined as part of the design process.

---

*Document prepared as project context for the AI Categorisation Layer design workstream.*