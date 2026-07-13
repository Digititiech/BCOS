---
name: bcos-architect
description: Provides guidelines and instructions for architecting BCOS modules, API specifications, and service integration topologies.
---

# BCOS Architecture Skill

This skill contains the structural designs, layout conventions, and API architecture specifications for BCOS.

## 1. Modular Separation of Concerns
When designing or implementing a new feature module in BCOS:
*   Ensure that the database tables, API routes, hooks, and UI directories are grouped logically.
*   Keep business logic isolated inside the backend functions/Edge functions, exposing clean inputs to the client application.
*   For frontend features, separate page routing from specific operational components.

## 2. Go High Level Sync Flow
*   Supabase is the single source of truth.
*   Every data modification on entities mapped to GHL (Contacts, Companies, Bookings, Tasks) must write to PostgreSQL first.
*   A trigger or queue listener should capture the insert/update and schedule a webhook worker (via n8n or Supabase Edge Functions) to perform the external call to GHL.
*   Handle GHL API rate limiting (specifically v2 API quotas) by applying exponential backoff retry policies in the syncing queue.

## 3. Dynamic Pricing & Availability Engine Guidelines
*   Keep pricing calculations inside database functions or modular TypeScript helpers that can be run on the client for instant updates and *must* be validated on the backend before completing a booking.
*   Availability conflict detection must use transaction isolation level `SERIALIZABLE` or explicit locks (`SELECT ... FOR UPDATE`) in PostgreSQL to guarantee that two requests cannot check out the same slot simultaneously.
