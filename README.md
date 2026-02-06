# Fantasy Olympics 2026

**Predict the podium. Climb the leaderboard. Or remix the build.**

A community prediction game for the Milano-Cortina 2026 Winter Olympics, built entirely on [Airtable](https://airtable.com). Pick which countries win Gold, Silver, and Bronze across all 116 events — earn points as medals are awarded live. Play along, or sync the data and build something of your own.

---

## Two Ways to Engage

### 1. Make Your Picks

Predict the full podium for every event. As results come in, your picks are automatically scored and the leaderboard updates in real time. No login required — just register with a display name and start picking.

### 2. Remix the Build

All the data is clean, structured, and available via [Airtable Sync](#sync-the-data). Athletes, events, countries, historical results — ready to go. We did the data cleanup so you can focus on creating.

**Build ideas:**
- Slack alerts when your country medals
- Watch party dashboard with live scores
- Country head-to-head comparison tracker
- Prediction accuracy visualizations

---

## How It Works

### The Game

Each player predicts Gold, Silver, and Bronze for all 116 medal events across 16 Winter Olympic sports. Points are awarded after each event is finalized:

| Your Pick | Result | Points |
|-----------|--------|--------|
| Exact position match (e.g., picked Gold, won Gold) | Nailed it | **3 pts** |
| Country on podium, wrong position | Close | **2 pts** |
| Country missed podium | Nope | **0 pts** |

**Maximum possible score:** 1,044 points (116 events x 3 picks x 3 pts each)

### Live Results

Results are powered by Airtable's [Deep Match](https://www.airtable.com/platform/intelligence) AI fields. Every 15 minutes, a scheduled automation checks for completed events. Three independent AI agents search the web for the Gold, Silver, and Bronze medalist country for each event and link directly to the correct record — no scripts, no external APIs.

```
  Scheduled Automation (every 15 min)
    → Finds today's events not yet finalized
    → Triggers Deep Match AI fields

  Three Deep Match Fields (independent web search)
    → Gold Country  → links to Countries table
    → Silver Country → links to Countries table
    → Bronze Country → links to Countries table

  Next automation cycle
    → Detects all 3 countries populated
    → Marks event as "Final"
    → Scoring formulas fire automatically
```

### Scoring Pipeline

Once an event is marked Final, scoring is fully automatic:
1. Each pick's Gold/Silver/Bronze countries are compared against the event's actual results via lookup fields
2. Points are computed by formula (3 for exact position, 2 for right country wrong position)
3. Player total scores are rollups that update in real time
4. The leaderboard re-sorts automatically

No scripts involved in scoring — it's formulas and rollups all the way down.

---

## The Interface

The custom interface is an [Airtable Interface Extension](https://airtable.com/developers/extensions) — a React app that runs natively inside Airtable's Interface environment with direct access to the underlying data.

**What you see:**

- **Countdown Timer** — Live countdown to the Opening Ceremony (Feb 6, 2026, 20:00 CET), switches to "The Games Have Begun!" when it starts
- **Medal Count** — Top 10 countries by 2026 medal count, updated as events finalize
- **Fantasy Leaderboard** — Top 10 players ranked by prediction score, click any player to see their full bracket
- **Olympic News Feed** — AI-generated daily updates with category badges (Results Recap, Athlete Spotlight, Upset Alert, etc.)
- **Events Board** — All 116 events grouped by sport, with status indicators (Upcoming, Live, Final)
- **Beijing 2022 Recap** — Historical medal data for context and scouting
- **Bulk Picks Editor** — Full-screen interface to predict all 116 events at once, grouped by sport
- **Builder Section** — Sync links, repo link, and build inspiration for developers

**Auto-detection:** If you're logged into Airtable, the app matches your email to a registered player — no manual selection needed.

---

## Data Model

The Airtable base contains structured, clean data across these core tables:

| Table | Records | What's In It |
|-------|---------|--------------|
| **Events** | 116+ | Every medal event — sport, date, venue, status, medal results (2026) + full 2022 data |
| **Countries** | 90 | All participating nations with NOC codes |
| **Athletes** | 2,470+ | Competitor bios from Beijing 2022 |
| **Sports** | 16 | Alpine Skiing through Speed Skating, with icons |
| **Players** | — | Fantasy game participants with display names and total scores |
| **Picks** | — | Every player's podium predictions (Gold/Silver/Bronze per event) |
| **Olympic News** | — | AI-generated daily updates, 3x per day during the Games |

### Historical Data

Full Beijing 2022 Winter Olympics data is included:
- 2,470 athletes with biographical data
- 4,744 competition results across all events
- Medal counts verified against official records
- Linked to the same Countries table used for 2026

---

## Sync the Data

One-click sync links to add live Olympic data to your own Airtable base. Data refreshes automatically every 15 minutes — no setup, no maintenance.

| Table | Sync Link |
|-------|-----------|
| Countries | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shr632RQw5PdSJgoY) |
| Athletes | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shraFpEmwrY7LBjh6) |
| Sports | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shrJxONmCYd2i3IAM) |
| Events | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shrAK9nlSAX51L7S2) |
| Results | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shrYpNoFK6wEg2JP6) |
| Players | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shrEwciwYyPOa8oFc) |
| Picks | [Sync to your base](https://airtable.com/appoY3nwpfUnUut4P/shrTXGgyVl0FJ77Sa) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Airtable Interface Extensions](https://airtable.com/developers/extensions) (`@airtable/blocks` SDK) |
| **Frontend** | React 19, Tailwind CSS 3.4 with custom Airtable design tokens |
| **Data** | Airtable (7 tables, no external database) |
| **Live Results** | Deep Match AI fields + scheduled automations |
| **Scoring** | Airtable formulas + rollups (no scripts) |
| **News Feed** | AI text fields with web search, 3x daily generation |
| **Linting** | ESLint 9 with React plugins |

**No server. No external APIs. No authentication flow.** Everything runs inside Airtable.

---

## Development

This is an Airtable Interface Extension — not a standalone web app. There's no `npm start` or dev server. Development and preview happen within the Airtable workspace.

```bash
npm install                  # Install dependencies
npm run lint                 # ESLint across frontend/
```

### Project Structure

```
frontend/
├── index.js                 # Entry point → initializeBlock()
├── components/              # 13 React components
├── constants.js             # All table/field IDs
├── helpers.js               # Record mappers, medal computation
└── style.css                # Tailwind directives
```

### Key Conventions

- **Field/table IDs over names** — All Airtable references use stable IDs (`tbl*`, `fld*`) defined in `constants.js`. Names can be renamed by users; IDs can't.
- **SDK import paths** — Only `@airtable/blocks/interface/ui` and `@airtable/blocks/interface/models`. Other paths will break.
- **No UI library** — All components are custom-built with Tailwind. Airtable Blocks UI components (`Box`, etc.) aren't supported in Interface Extensions.
- **React 19** — Use `--legacy-peer-deps` when adding new packages.

---

## How this was built

This is the first custom Airtable Interface Extension I've built. The data model, automations, scoring pipeline, and a 2,700-line React interface came together over a weekend using two AI tools working at different layers.

**Airtable AI** powers the data side. Three Deep Match fields search the web every 15 minutes for medal results and link them to the correct country record automatically. An AI text field with web search generates a daily Olympic news feed. Scoring is pure formulas and rollups that update the moment results land. No scripts, no external APIs. It matched every result correctly in testing, though I'll be watching it closely during the actual Games.

**[Claude Code](https://claude.ai/code)** built the interface. Every component, style, and SDK call was pair-programmed with Claude Code. I'd never built a custom extension before. The 13 components, live countdown, bulk picks editor, dark mode, leaderboard, and events board all came out of that one sprint.

Airtable handles data, logic, and AI at the platform layer. Claude Code handles UI at the code layer. Between the two, I didn't need a team.

**Key design decisions:**
- Picks-based game over draft-based (simpler, more accessible, no coordination needed)
- Country predictions over athlete predictions (116 events x 3 picks = manageable; athlete-level would be overwhelming)
- Deep Match for live results over script-based web scraping (zero maintenance)
- Client-side medal computation over rollup fields (workaround for UI conversion issues with Airtable rollups)
- Public interface with no login barrier (Airtable handles auth for builders; forms handle it for players)

---

## License

[MIT No Attribution](LICENSE.md) — use it however you want, no attribution required.

---

Built with [Airtable](https://airtable.com) + [Claude Code](https://claude.ai/code)
