# Full Schedule Page — Design

## Overview

Add a dedicated Full Schedule page to the Fantasy Olympics extension. Users navigate from the homepage to browse all 116 medal events in chronological order, with per-event pick buttons that respect event status (upcoming, live, final).

## Navigation — Page Swap

New state in `FantasyOlympicsLanding`: `currentPage` (`'home'` | `'schedule'`).

- `'home'` renders everything as it does today
- `'schedule'` swaps the entire page content to the new `FullSchedulePage` component

Entry points that trigger the swap:
- "Make My Picks" button in LandingHero → schedule page
- "View full schedule" link in UpcomingEvents → schedule page
- "Back to Home" button on schedule page → home

The PicksChoiceModal stays global — renders on top of whichever page is active. Tapping "Pick" on the schedule opens the same form modal. Closing it returns to the schedule.

## Schedule Page Layout

### Header

Compact banner with playful description and back navigation:

> **[← Back to Home]**
>
> **Full Event Schedule**
>
> Think you can call it? Browse all 116 medal events and pick your podium predictions before events go live. Nail the exact position for 3 points, or earn 2 if your country medals in a different spot. Let's see what you've got.

### Day Sections

Events grouped by date. Each day is a collapsible section:

- **Past days** — Collapsed by default. Header: "Saturday, Feb 7 · 8 events · All Final" with muted styling. Expandable on click.
- **Today** — Expanded and visually highlighted. Pulsing accent border or background tint. Header: "Today — Saturday, Feb 14 · 6 events". Auto-scrolls into view on page load.
- **Future days** — Expanded by default for browsing and picking.

### Event Rows

Compact horizontal bar per event:

```
[●] Alpine Skiing — Men's Downhill          10:30 AM    [Pick →]
[●] Biathlon — Mixed Relay                   2:00 PM    [Pick Now!]
[★] Freestyle Skiing — Women's Moguls        4:15 PM    🥇 SUI  🥈 JPN  🥉 USA
```

**By status:**
- **Upcoming** (gray dot) — Normal "Pick" button, opens modal prefilled with event name
- **Live/Today** (blue/yellow pulsing dot) — Urgent "Pick Now!" button with bold styling and glow
- **Final** (green dot) — No pick button. Medal results shown inline (country NOC codes for Gold/Silver/Bronze)

Sport name shown as subtle label on each row.

### Mobile

Event rows stack on small screens:
```
[●] Alpine Skiing — Men's Downhill
    10:30 AM                          [Pick →]
```

### Dark Mode

Follows existing theme system. Day headers use surface-raised background. Today's section uses warm accent border. Event rows have subtle alternating striping. "Pick Now!" uses hero CTA glow effect.

## Not Building (YAGNI)

- No sport filters or search
- No URL routing or browser back button
- No pagination (collapsed past days keeps it manageable)
- No per-player pick status indicators
- No sticky header

## Implementation Plan

### 1. Add page state to FantasyOlympicsLanding (`index.js`)
- New state: `const [currentPage, setCurrentPage] = useState('home')`
- Wrap existing page content in `{currentPage === 'home' && (...)}`
- Add `{currentPage === 'schedule' && <FullSchedulePage />}`
- Pass `onPickEvent`, `onBack` callbacks to FullSchedulePage
- PicksChoiceModal renders outside the page conditional (always available)

### 2. Update entry points
- LandingHero: "Make My Picks" → `setCurrentPage('schedule')`
- UpcomingEvents: "View full schedule" → `setCurrentPage('schedule')`

### 3. Build FullSchedulePage component
- New file: `frontend/components/FullSchedulePage.js`
- Props: `events`, `countries`, `sports`, `onPickEvent`, `onBack`
- Groups events by date, sorts chronologically
- Renders day sections with collapse/expand state
- Auto-scrolls to today's section on mount
- Each event row renders status dot, sport tag, name, time, pick button or results

### 4. Export from components barrel
- Add FullSchedulePage to `frontend/components/index.js`
