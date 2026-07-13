# Business Center Operating System (BCOS)
## Phase 1: Product Requirements Document (PRD)

---

## 1. Executive Summary & Vision

### 1.1. Introduction
The **Business Center Operating System (BCOS)** is a multi-tenant, enterprise-grade Software-as-a-Service (SaaS) platform designed to orchestrate the entire lifecycle of modern business hubs, shared spaces, training centers, and premium media/podcast environments. 

BCOS is not merely a room-booking calendar. It is a unified digital nervous system combining **Resource Booking**, **CRM & Sales Pipeline Orchestration**, **Contract Lifecycle Management**, **Automated Financial Invoicing**, **Operations & Facility Management**, and **Conversational AI Booking Agents**. 

### 1.2. Strategic Objectives
*   **Unified Operations:** Consolidate isolated legacy applications (calendars, billing tools, CRMs, and messaging apps) into a single system of record.
*   **Dynamic Revenue Optimization:** Maximize resource utilization through real-time availability conflict detection, dynamic pricing, and automated upselling.
*   **Scale and Performance:** Support thousands of global organizations (tenants), millions of active users, and high-frequency real-time events.
*   **Bilingual & Accessible Excellence:** Deliver an Apple-quality visual experience optimized for both Arabic (RTL) and English (LTR), achieving strict WCAG 2.1 AA compliance.
*   **System of Record Integrity:** Establish Supabase/PostgreSQL as the immutable source of truth, with bi-directional CRM syncing to Go High Level (GHL).

---

## 2. Customer Persona & Use Case Matrix

BCOS addresses the complex multi-resource configurations of various business models:

| Target Customer Segment | Core Resource Needs | Primary Operational Pain Point |
| :--- | :--- | :--- |
| **Training & Conference Centers** | Large halls, AV gear, registration desks, catering, certificate generation. | Setup/buffer coordination, catering logistics, attendee onboarding. |
| **Premium Business Centers** | Boardrooms, executive offices, virtual offices, translation desks. | Contract renewals, corporate discounting, mail-handling alerts. |
| **Coworking Spaces** | Hot desks, dedicated desks, meeting pods. | Membership tier tracking, access control, peak utilization hours. |
| **Media & Podcast Studios** | soundproof booths, cameras, video suite, mic packages, tech support. | High-value equipment tracking, technical setup buffers, engineer scheduling. |
| **Gov Training & Services** | Service desks, consultation rooms, public check-in portals. | Regulatory compliance, strict audit logging, citizens' queue management. |

---

## 3. Core System Modules

### 3.1. Dashboard Module
Provides distinct, high-performance dashboards based on user personas:
*   **Super Admin Dashboard:** SaaS metrics (MRR, Churn, LTV, Active Tenants, API utilization, Gateway statuses).
*   **Tenant Admin Dashboard:** Operations overview, daily occupancy heatmaps, billing/invoice statuses, pending maintenance issues, and AI agent performance.
*   **Staff Portal Dashboard:** Shift schedules, assigned cleaning tasks, pending maintenance tickets, and check-in queues.
*   **Customer Portal Dashboard:** Active bookings, payment due notifications, signed contracts, support tickets, and shared document folders.

### 3.2. Booking Engine
The Booking Engine must act as a transactional processor supporting complex booking types:
*   **Hourly Booking:** Minutes-precision bookings with custom buffer constraints.
*   **Half Day / Full Day:** Operational blocks (e.g., 8:00 AM - 1:00 PM, 2:00 PM - 7:00 PM).
*   **Weekly / Monthly / Multi-Day:** Consecutive date ranges with recurring invoice generation.
*   **Recurring Booking:** Patterns (Daily, Weekly on specific days, Monthly) with conflict validation across the entire series.
*   **Corporate Booking:** Bookings assigned to corporate accounts, drawing from pre-purchased credits or billed net-30.
*   **Internal Booking:** Administrative blocks for maintenance, training, or partner usage (zero-rated, bypasses payment gateway).
*   **Multi-Resource / Bundle Booking:** Booking a suite (e.g., Podcast Studio + Video Control Room + Sound Engineer Add-on) as a single cohesive unit.

### 3.3. Availability Engine
Orchestrates real-time state management of resources to prevent overbooking:
*   **Conflict Detection:** Microsecond transaction locks during checkout to prevent double-booking.
*   **Buffer Times:** Custom margins added automatically before/after a booking (e.g., 15-minute setup buffer, 30-minute tech teardown).
*   **Cleaning & Maintenance Blocks:** Automatic scheduling of cleaning staff upon booking completion. Block resource state during active maintenance.
*   **Operating Hours & Holiday Rules:** Dynamic rules defined per organization or specific resource (e.g., Closed on National Holidays).
*   **Resource Locking:** Temporary lock (expiry in 10 minutes) on a resource once a customer adds it to their cart or the AI agent generates a quote.
*   **Automatic Alternative Suggestions:** If a resource is unavailable, suggest the closest matching alternative based on:
    *   Capacity/occupancy rules.
    *   Resource category.
    *   Price proximity (+/- 15%).

### 3.4. Pricing Engine
Calculates dynamically based on a matrix of variables:
*   **Base Rates:** Hourly, Daily, Weekly, and Monthly pricing configurations.
*   **Temporal Rules:** Peak vs. Off-Peak rates, Weekend surcharges, Night/Evening premiums, and Holiday multipliers.
*   **Membership & Tier Discounts:** Customer group-based rules (e.g., "Premium Members get 20% off all meeting rooms").
*   **Volume & Loyalty Incentives:** Sliding scale pricing (e.g., "$50/hr for first 5 hours, $40/hr thereafter").
*   **Promo Codes & Coupons:** Custom codes with rules for:
    *   Usage limits (total vs. per-customer).
    *   Start/End dates.
    *   Specific resource restrictions.
    *   Minimum booking value.
*   **Financial Surcharges:** Automated calculation of regional taxes (e.g., 15% VAT) and custom service fees.

### 3.5. Add-on Services Catalog
Enables seamless cross-selling of auxiliary resources during booking:
*   **Catering:** Coffee breaks, lunches, beverage bundles (requires lead-time notice).
*   **Staff Services:** Translators, photographers, videographers, reception support, registration desks.
*   **Hardware Rentals:** Projectors, laptops, wireless microphones, interactive displays, camera rigs.
*   **Business Services:** Printing allocations, certificate issuance, consulting hours.

---

## 4. CRM & Go High Level (GHL) Sync Architecture

### 4.1. Synced Data Matrix
BCOS maintains Supabase as the system of record. GHL is utilized strictly as the marketing automation and pipeline management engine.

```mermaid
graph TD
    subgraph BCOS (Supabase - Source of Truth)
        ContactsTable[Contacts]
        CompaniesTable[Companies]
        BookingsTable[Bookings]
        InvoicesTable[Invoices]
    end
    subgraph n8n / Supabase Edge Functions
        SyncEngine[Sync & Queue Worker]
    end
    subgraph Go High Level (GHL)
        GHLContacts[GHL Contacts]
        GHLCompanies[GHL Companies]
        GHLPipelines[GHL Opportunities & Pipelines]
        GHLEmailsSMS[GHL Communications]
    end

    ContactsTable -->|Real-time Webhook| SyncEngine
    SyncEngine -->|Upsert API| GHLContacts
    CompaniesTable -->|Real-time Webhook| SyncEngine
    SyncEngine -->|Upsert API| GHLCompanies
    BookingsTable -->|Trigger Pipeline Move| SyncEngine
    SyncEngine -->|Create/Update Opp| GHLPipelines
    GHLEmailsSMS -->|Log Notes/History| SyncEngine
    SyncEngine -->|Write to Audit Log| ContactsTable
```

### 4.2. Synchronized Fields Detail
*   **Contacts & Companies:** Direct bi-directional mapping of standard fields (Name, Email, Phone, Title) and custom fields (e.g., Organization Membership Tier, Booking History, Active Contract ID).
*   **Pipelines & Opportunities:** Moving a booking status in BCOS (e.g., `Quoted` -> `Confirmed` -> `Paid` -> `Completed`) must instantly progress the corresponding Opportunity stage in the GHL Pipeline.
*   **Communication Logging:** All SMS, WhatsApp, and email interactions initiated in GHL must be pushed back to BCOS to populate the customer's interaction timeline.
*   **Notes, Tags & Tasks:** Dynamic syncing of tags (e.g., `high-value-lead`, `frequent-booker`) and operational tasks.

---

## 5. Portals & User Experience (UI/UX)

### 5.1. Customer Portal
*   **Interactive Booking Panel:** Fast room selection, date/time sliders, real-time total price updating, and add-ons selectors.
*   **Financial Console:** View unpaid invoices, download PDF statements, and execute secure one-click payments.
*   **Contract Management:** Electronic signature integration for lease/virtual office agreements.
*   **Support Center:** Direct ticket creation, support chat with historical transcripts, and file repository for corporate documents.

### 5.2. Staff Portal
*   **Visual Dispatch Board:** Calendar view showing all rooms, current occupancy, clean/dirty states, and maintenance blocks.
*   **Operations & Task Manager:** Checklist for room preparations, check-in barcodes, and cleaning logs.
*   **Facility Management:** Quick sub-module to log broken items, attach pictures, and assign maintenance priorities (Low, Medium, High).
*   **Attendance Tracker:** Geofenced check-in/out for space coordinators and cleaning teams.

### 5.3. Administrative Panel
*   **No Hardcoded Settings:** Full UI control over:
    *   Resource configurations (capacity, buffer times, equipment list).
    *   Dynamic pricing matrices.
    *   Tax rules, currencies, and translation strings.
    *   System email/SMS templates.
    *   API keys, GHL webhooks, and Stripe configurations.

---

## 6. AI Reservation Agent (Bilingual Agent)

The AI Agent acts as a primary conversational channel for both customers and staff, operating natively in both **Arabic** and **English**.

### 6.1. Core Capabilities
*   **Natural Conversational Flows:** Interpret unstructured intent (e.g., *"I need a meeting room for 10 people this Thursday around 3 PM with coffee and a projector"*).
*   **Stateful Booking Processing:** Collect necessary booking parameters (date, time, duration, guest count, resources) while maintaining context over the conversation.
*   **Real-time Calculations:** Retrieve current pricing (including dynamic surcharges/discounts) and output accurate quotes.
*   **CRM Interaction:** Automatically create/update customer profiles in Supabase and match existing contacts based on verified emails or phone numbers.
*   **Financial Operations:** Generate official quotations, invoices, and draft Stripe payment links.
*   **Human Handoff:** Trigger human intervention when queries exceed confidence thresholds (e.g., complex disputes, custom enterprise discounts).

### 6.2. System Architecture (AI Engine)
*   **LLM Orchestrator:** LangGraph managing conversation flow, intent routing, and conversational memory.
*   **RAG (Retrieval-Augmented Generation):** PostgreSQL vector search (`pgvector`) query on space policies, pricing documents, and FAQ documentation.
*   **Tool Calling Schema:** Natively mapped to BCOS internal APIs:
    *   `check_availability(resource_type, start_time, end_time)`
    *   `calculate_pricing(resource_id, client_id, start_time, end_time, add_ons)`
    *   `create_booking(client_id, resource_id, start_time, end_time, add_ons)`
    *   `generate_payment_link(booking_id)`

---

## 7. Security, Compliance & System Auditing

### 7.1. Row-Level Security (RLS) & Multi-Tenancy
*   Every table must contain an `organization_id` column.
*   Supabase RLS policies must validate that the authenticated user (`auth.uid()`) belongs to the specific `organization_id` being queried.
*   Role-Based Access Control (RBAC) scopes: `SuperAdmin`, `OrgAdmin`, `Staff`, and `Customer`.

### 7.2. System Audit Logging
*   All mutations (inserts, updates, deletes) must trigger a database-level log.
*   Audit log schema: `timestamp`, `user_id`, `organization_id`, `action_type` (e.g., `BOOKING_CANCELLED`), `ip_address`, `user_agent`, and `payload_diff` (JSON showing before/after state).

### 7.3. Rate Limiting & API Management
*   Throttling rules applied on all public and authenticated endpoints via Supabase API Gateway.
*   Developer API Keys managed through the Admin panel, with restricted scopes and automated expiration dates.

---

## 8. Non-Functional Requirements & Design Systems

### 8.1. UI/UX & Styling Guidelines
*   **Design Paradigm:** A high-contrast, clean visual design language inspired by Apple, Stripe, and Linear.
*   **Accessibility:** Conform to WCAG 2.1 AA guidelines (proper contrast ratios, full keyboard navigability, semantic tags, and aria-labels).
*   **Bi-directional Framework (Arabic First):** Dynamic interface layout shift between LTR (English) and RTL (Arabic) using Tailwind CSS logical properties (e.g., `ms-auto`, `pe-4`, `flex-row-reverse`).

### 8.2. Target Performance SLA
*   **Page Load Time:** First Contentful Paint (FCP) < 0.8s on 3G connections.
*   **Availability Resolution:** Conflict detection engine checks resolved in under 150ms.
*   **Database Query Optimization:** Indexes on all foreign keys, dates, and search-optimized columns.
