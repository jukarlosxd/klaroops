# KlaroOps PRD & Architecture

## Overview
KlaroOps is an internal-first control panel designed to manage multiple clients whose data lives in Google Sheets. It connects predefined Google Sheets templates to ultra-simple dashboards that show key operational metrics at a glance.

## Product Principles
- Internal-first, but production-grade architecture
- Simple over powerful
- Fixed templates over free-form configuration
- AI explains metrics, never calculates them
- Dashboards answer “what should I look at today?”
- No hype features
- No overengineering

## Core Concepts
- **Client**: Represents one real business or operation.
- **Google Sheet**: One sheet per client.
- **Template**: Defines schema, metrics, and dashboard layout.
- **Data Flow**: Google Sheet → normalized events → aggregated metrics → dashboard → AI explanation

## Templates
1.  **Ops Walkthrough** (MVP, fully implemented)
2.  Service Biz (placeholder)
3.  Inventory Lite (placeholder)
4.  Custom Template (future)

### Ops Walkthrough Template
-   **Columns**: `timestamp`, `location`, `area`, `asset_id`, `status` (ok | down | broken), `note` (optional)
-   **Metrics**:
    -   Availability % (today)
    -   Downtime count (down + broken)
    -   Top problem areas (by downtime)
    -   7-day availability trend
    -   MTTR (if detectable, else N/A)

## UI Structure (Next.js App Router)
-   `/clients`: List of clients (Client Islands/Cards).
-   `/clients/new`: Wizard (Template -> Info -> Sheet).
-   `/clients/[clientId]`: Dashboard (Metrics, Charts, Table, AI Chat).
-   `/clients/[clientId]/settings`: Client info, Sheet connection, Sync.

## Dashboard Requirements
-   KPI Cards: Availability, Downtime, Broken, Total Assets.
-   Charts: Downtime by area (Bar), Availability 7-day (Line).
-   Table: Broken assets.
-   **AI Chat**: Explains visible metrics only. No raw data reading.

## Tech Stack
-   Next.js (App Router)
-   SQLite (demo/local) or Postgres-ready
-   Google Sheets API (Service Account)
-   Simple Chart Library (e.g., Recharts, Tremor, or Chart.js)
-   Tailwind CSS (implied by "globals.css")

## Canonical Project Structure
```
src/
 ├─ app/
 │  ├─ layout.tsx
 │  ├─ page.tsx
 │  ├─ clients/
 │  │  ├─ page.tsx
 │  │  ├─ new/page.tsx
 │  │  ├─ [clientId]/page.tsx
 │  │  └─ [clientId]/settings/page.tsx
 │  ├─ api/
 │  │  ├─ sync/route.ts
 │  │  ├─ metrics/route.ts
 │  │  ├─ chat/route.ts
 │  │  └─ clients/route.ts
 │  └─ globals.css
 │
 ├─ lib/
 │  ├─ db.ts
 │  ├─ sheets.ts
 │  ├─ normalize.ts
 │  ├─ metrics.ts
 │  ├─ templates/
 │  │  ├─ ops-walkthrough.ts
 │  │  ├─ service-biz.ts
 │  │  └─ inventory-lite.ts
 │  └─ constants.ts
 │
 ├─ components/
 │  ├─ ClientCard.tsx
 │  ├─ ChatBox.tsx
 │  ├─ Dashboard/
 │  │  ├─ KPICard.tsx
 │  │  ├─ Charts.tsx
 │  │  └─ BrokenTable.tsx
 │  └─ Wizard/
 │     ├─ TemplateStep.tsx
 │     ├─ ClientInfoStep.tsx
 │     └─ SheetStep.tsx
 │
 ├─ types/
 │  ├─ client.ts
 │  ├─ metrics.ts
 │  └─ template.ts
 │
 └─ utils/
    ├─ dates.ts
    └─ format.ts
```

## Current Status & Tasks
-   **Task 1**: Initialize `package.json` (Next.js, Tailwind, Recharts/Tremor, Lucide icons, etc.).
-   **Task 2**: Ensure all files are implemented.
    -   `lib/sheets.ts`: Mock this if no credentials provided, or allow generic Google Sheets API setup.
    -   `lib/db.ts`: Use a simple in-memory or file-based store (like `better-sqlite3` or just a JSON file for MVP) if no DB provided.
    -   `api/chat`: Implement the "Metrics Interpreter" logic (simple prompt engineering).
-   **Task 3**: Verify the app runs.
