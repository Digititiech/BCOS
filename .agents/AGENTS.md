# BCOS Workspace Rules & Guidelines

Welcome to the BCOS project workspace. This file establishes strict design, security, development, and integration standards that must be adhered to at all times.

## 1. Technological Foundations
*   **Frontend:** React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, React Hook Form, Zod.
*   **Backend:** Supabase (PostgreSQL, Realtime, Storage, Edge Functions, Row-Level Security).
*   **CRM Integration:** Go High Level (GHL) synced asynchronously. Supabase is the single source of truth.
*   **AI Orchestration:** LangGraph, LiteLLM, Vector Search (`pgvector`).

## 2. Architecture & File Rules
*   **Feature-Based Architecture:** Features must be organized inside `src/features/<feature-name>/`.
    *   Each feature must contain: `components/`, `hooks/`, `services/`, `schemas/`, `types/`, `utils/`.
    *   Never create large shared folders containing unrelated business logic.
*   **React Rules:** Functional components, hooks, composition pattern.
    *   Maximum file target: **300 lines**. Refactor when exceeded.
*   **State Management:**
    *   Server State: TanStack Query
    *   Form State: React Hook Form
    *   Validation: Zod

## 3. Multi-Language & RTL Styling Rules
*   **Tailwind Logical Properties:** Do NOT use directional spacing utilities. Always use logical properties:
    *   Use `ms-*` (margin-start) instead of `ml-*` or `mr-*`.
    *   Use `pe-*` (padding-end) instead of `pl-*` or `pr-*`.
    *   Use `text-start` and `text-end` instead of `text-left` and `text-right`.
    *   Use `start-0` and `end-0` instead of `left-0` and `right-0`.
*   **Bilingual Text:** Always support dynamic translation keys for Arabic (ar) as primary and English (en) as secondary.

## 4. Database & Security Guidelines
*   **Row-Level Security (RLS):** Every database table must have RLS enabled. No exceptions.
*   **Multi-tenancy:** All tenant tables must include `organization_id` and have active RLS policies validating the authenticated user context.
*   **Audit Logging:** Every mutating transaction (insert, update, delete) must trigger database-level auditing.
*   **Required Fields:** Every table must include `id`, `created_at`, `updated_at`, and `organization_id` where applicable.
*   **Secrets:** Never expose Supabase service role keys or store third-party secrets client-side.

## 5. Booking & Payment Engines
*   **Double Booking Prevention:** Booking operations must be transactional, and availability must be verified in SQL before booking creation.
*   **Payment Verification:** Verify payments via backend webhooks only. Never trust frontend payment status updates.

## 6. AI Agent & CRM Sync Integrations
*   **AI Agent Restrictions:** AI cannot write directly to the database or modify payments. It must interact via the tool execution and validation layers. All actions must be logged.
*   **CRM Sync:** Syncing contacts and opportunities to GHL must be handled asynchronously via queues (e.g. Supabase Edge Functions + n8n). Never call GHL APIs directly from client-blocking threads.

## 7. Testing Requirements
*   Every feature requires **Unit Tests** and **Integration Tests**.
*   Critical workflows (Auth, Booking, Payments, Permission Checks) must have 100% test coverage.

## 8. Definition of Done (DoD)
A task is complete only when:
*   Code is implemented and types are verified (Strict typescript, no `any`).
*   All unit and integration tests are passing.
*   Security and RLS policies are validated.
*   Mobile responsive layouts and Arabic RTL compatibility are checked.
*   Documentation is updated.
