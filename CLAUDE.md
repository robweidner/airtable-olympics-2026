# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An **Airtable Interface Extension** (not a standalone React app) for a Fantasy Olympics game for Milano-Cortina 2026 Winter Olympics. Players predict medal outcomes across 116 events with live scoring and leaderboards. Built on React 19 + Tailwind CSS, running inside Airtable's Interface environment.

## Development Commands

```bash
npm install                  # Install dependencies (use --legacy-peer-deps for new packages)
npm run lint                 # ESLint across frontend/
```

There is no `npm start`, `npm run dev`, or `npm run build`. The app runs inside Airtable's Interface environment — development and preview happen within Airtable, and the SDK's bundler (webpack) outputs to `.tmp/bundle.js`.

## Architecture

**Entry point:** `frontend/index.js` → calls `initializeBlock({ interface: () => <Component /> })`

**Data layer:** All data comes from Airtable via SDK hooks (`useBase`, `useRecords`, `useSession`) — no REST APIs, no fetch calls for data.

**Component structure:**
- `frontend/index.js` — Root `FantasyOlympicsLanding`, manages modal/view state
- `frontend/components/` — 13 React components (PascalCase filenames)
- `frontend/constants.js` — All table/field IDs, opening ceremony date, form URLs
- `frontend/helpers.js` — Record-to-object mappers, medal count computation

**Two view modes:** Landing page (default) and BulkPicksView (full-screen replacement, not a route).

## Critical Patterns

### Import Paths (SDK constraint)
```js
// CORRECT — the ONLY valid import paths:
import { useBase, useRecords, initializeBlock } from '@airtable/blocks/interface/ui';
import { FieldType } from '@airtable/blocks/interface/models';

// WRONG — will break:
import { ... } from '@airtable/blocks/ui';
import { ... } from '@airtable/blocks/models';
```

### Field/Table IDs Over Names
All Airtable references use stable IDs (e.g., `tblGi2GCOESm9ZIoT`, `fldwIM37gcLm15F5K`) defined in `constants.js`. Never use table/field names in code — names can be renamed by users, IDs cannot.

### Medal Count Computation
Medal counts are computed client-side from the Events table (`helpers.js:computeMedalCounts`), NOT read from Countries table rollups. This is intentional — rollup fields had UI conversion issues.

### Data Access Pattern
```js
const base = useBase();
const table = base.getTableByIdIfExists(TABLE_ID);  // not getTableById()
const records = useRecords(table, { fields: [...fieldIds] });
```
Always use `getTableByIdIfExists` / `getFieldIfExists` (returns null) over `getTableById` / `getField` (throws).

### Batch Write Limits
Max 50 records per `createRecordsAsync`/`updateRecordsAsync` call. Rate limited to 15 calls/second. `BulkPicksView` handles this with chunking.

### Events Table Has Both Years
The Events table contains 2022 AND 2026 data. Always filter by `FIELD_IDS.EVENTS.YEAR` when showing current Olympics data.

## Airtable Tables (7)

| Table | ID | Purpose |
|-------|-----|---------|
| Players | `tblGi2GCOESm9ZIoT` | Fantasy participants, scores |
| Countries | `tblj00SBSlV3Nihaz` | 90 nations, NOC codes |
| Events | `tblfcCI7cZqIc06qD` | 116+ medal events (2022 + 2026) |
| Picks | `tblqQv8qrZXulR28g` | Player predictions per event |
| Sports | `tbl9zaGk0SPF4ru5I` | 16 disciplines |
| Olympic News | `tblGjVfL3kPgeeChU` | AI-generated news feed |

## Styling

Tailwind CSS with custom design tokens mapped to Airtable's color system (e.g., `bg-blue-blue`, `text-gray-gray500`). See `tailwind.config.js` for the full token map. No Airtable Blocks UI components (`Box`, etc.) — they are not supported in Interface Extensions.

## No Testing Framework

No test runner is configured. Quality checks are ESLint only.
