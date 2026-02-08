/**
 * UpcomingEvents - Time-aware schedule showing live and upcoming events.
 *
 * Shows what's happening now and coming up next at the 2026 Milano-Cortina
 * Winter Olympics. Relative times refresh every 60 seconds via a ticking
 * `now` state. Events are grouped into day buckets with day-change headers.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useState, useEffect, useMemo } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getStringField, getNumberField } from '../helpers';

const SCHEDULE_FIELDS = [
  FIELD_IDS.EVENTS.NAME,
  FIELD_IDS.EVENTS.DATE,
  FIELD_IDS.EVENTS.STATUS,
  FIELD_IDS.EVENTS.VENUE,
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.SPORT_ICON,
  FIELD_IDS.EVENTS.SPORT_NAME,
  FIELD_IDS.EVENTS.GOLD_COUNTRY,
  FIELD_IDS.EVENTS.SILVER_COUNTRY,
  FIELD_IDS.EVENTS.BRONZE_COUNTRY,
  FIELD_IDS.EVENTS.GOLD_ATHLETE,
  FIELD_IDS.EVENTS.SILVER_ATHLETE,
  FIELD_IDS.EVENTS.BRONZE_ATHLETE,
];

const MAX_UPCOMING = 8;
const MAX_RECENT_RESULTS = 5;
const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours — typical event duration

/* ─── Time formatting helpers ─── */

function formatRelativeTime(eventDate, now) {
  const diffMs = eventDate.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  // Past: show "Xm ago" for live events
  if (diffMin < 0) {
    const ago = Math.abs(diffMin);
    if (ago > 180) return '';
    if (ago < 60) return `${ago}m ago`;
    const h = Math.floor(ago / 60);
    const m = ago % 60;
    return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
  }

  if (diffMin === 0) return 'now';
  if (diffMin < 60) return `in ${diffMin}m`;

  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h < 24) return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
  return '';
}

function formatEventTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDayLabel(dateStr, now) {
  const d = new Date(dateStr);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(d);
  eventDay.setHours(0, 0, 0, 0);
  const diff = Math.round((eventDay - today) / 86400000);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/* ─── Main component ─── */

export function UpcomingEvents({ onMakeMyPicks, onPickEvent }) {
  const base = useBase();
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const records = useRecords(eventsTable, { fields: SCHEDULE_FIELDS });

  const [now, setNow] = useState(() => new Date());

  // Tick every 60 s so relative times stay fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { recentResults, liveEvents, dayGroups, firstUpcomingId } = useMemo(() => {
    if (!records) return { recentResults: [], liveEvents: [], dayGroups: [], firstUpcomingId: null };

    const nowMs = now.getTime();

    // Map and filter to 2026 events with a date
    const events = records
      .map((r) => ({
        id: r.id,
        name: getStringField(r, FIELD_IDS.EVENTS.NAME),
        date: r.getCellValue(FIELD_IDS.EVENTS.DATE),
        status: r.getCellValue(FIELD_IDS.EVENTS.STATUS) || 'Upcoming',
        venue: getStringField(r, FIELD_IDS.EVENTS.VENUE),
        year: getNumberField(r, FIELD_IDS.EVENTS.YEAR),
        sportIcon: getStringField(r, FIELD_IDS.EVENTS.SPORT_ICON) || '🏅',
        sportName: getStringField(r, FIELD_IDS.EVENTS.SPORT_NAME),
        goldCountry: getStringField(r, FIELD_IDS.EVENTS.GOLD_COUNTRY) || null,
        silverCountry: getStringField(r, FIELD_IDS.EVENTS.SILVER_COUNTRY) || null,
        bronzeCountry: getStringField(r, FIELD_IDS.EVENTS.BRONZE_COUNTRY) || null,
        goldAthlete: getStringField(r, FIELD_IDS.EVENTS.GOLD_ATHLETE) || null,
        silverAthlete: getStringField(r, FIELD_IDS.EVENTS.SILVER_ATHLETE) || null,
        bronzeAthlete: getStringField(r, FIELD_IDS.EVENTS.BRONZE_ATHLETE) || null,
      }))
      .filter((e) => e.year === 2026 && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Recent results: events with medals awarded, most recent first
    const recentResults = events
      .filter((e) => e.goldCountry)
      .reverse()
      .slice(0, MAX_RECENT_RESULTS);

    // Live: started within last 3 h or explicitly marked Live
    const live = events.filter((e) => {
      const ms = new Date(e.date).getTime();
      return (ms <= nowMs && nowMs - ms <= LIVE_WINDOW_MS) || e.status === 'Live';
    });

    // Upcoming: future events, capped at MAX_UPCOMING
    const upcoming = events
      .filter((e) => new Date(e.date).getTime() > nowMs)
      .slice(0, MAX_UPCOMING);

    const firstUpcomingId = upcoming.length > 0 ? upcoming[0].id : null;

    // Group upcoming by calendar day and assign animation indices
    const groups = [];
    let currentDay = null;
    let animIdx = 0;
    for (const event of upcoming) {
      const day = getDayLabel(event.date, now);
      if (day !== currentDay) {
        groups.push({ day, events: [] });
        currentDay = day;
      }
      event.animIndex = animIdx++;
      groups[groups.length - 1].events.push(event);
    }

    return { recentResults, liveEvents: live, dayGroups: groups, firstUpcomingId };
  }, [records, now]);

  /* ─── Edge-case returns ─── */
  if (!eventsTable) return null;
  if (recentResults.length === 0 && liveEvents.length === 0 && dayGroups.length === 0) return null;

  return (
    <section className="py-8 px-4 sm:px-8">
      <div>
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-primary">
              What&apos;s On
            </h2>
            {liveEvents.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-redLight3 dark:bg-red-redDark1/20 text-red-red text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-red animate-pulse" />
                Live
              </span>
            )}
          </div>
          <time className="text-xs font-mono text-muted tabular-nums">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>

        {/* ── Recent results ── */}
        {recentResults.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
                Recent Results
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-gray200 dark:from-gray-gray600 to-transparent" />
            </div>
            <div className="space-y-0.5">
              {recentResults.map((event, i) => (
                <ResultRow key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Live events ── */}
        {liveEvents.map((event) => (
          <LiveEventCard key={event.id} event={event} now={now} />
        ))}

        {/* ── Upcoming events grouped by day ── */}
        {dayGroups.map((group) => (
          <div key={group.day} className="mb-4">
            <div className="flex items-center gap-2 mb-2 mt-3 first:mt-0">
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
                {group.day}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-gray200 dark:from-gray-gray600 to-transparent" />
            </div>
            <div className="space-y-0.5">
              {group.events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  now={now}
                  isNext={liveEvents.length === 0 && event.id === firstUpcomingId}
                  index={event.animIndex}
                  onPick={onPickEvent ? () => onPickEvent(event.name) : null}
                />
              ))}
            </div>
          </div>
        ))}

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-light">
          <button
            className="text-sm text-blue-blue hover:text-blue-blueDark1 font-medium transition-colors"
            onClick={() =>
              document
                .getElementById('events-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            View full schedule →
          </button>
          {onMakeMyPicks && (
            <button
              className="px-5 py-2 bg-blue-blue hover:bg-blue-blueDark1 text-white text-sm font-medium rounded-md shadow-theme-sm transition-colors"
              onClick={onMakeMyPicks}
            >
              Make My Picks
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Live event card ─── */

function LiveEventCard({ event, now }) {
  return (
    <div className="mb-3 p-4 rounded-lg border border-yellow-yellowLight1 dark:border-yellow-yellowDark1/30 bg-gradient-to-r from-yellow-yellowLight3 to-surface dark:from-yellow-yellowDark1/10 dark:to-surface shadow-theme-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-red-red animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-red-red">
          Live Now
        </span>
        <span className="text-xs text-muted ml-auto font-mono tabular-nums">
          {formatRelativeTime(new Date(event.date), now)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{event.sportIcon}</span>
        <div className="min-w-0">
          <p className="font-semibold text-primary truncate">{event.name}</p>
          <p className="text-xs text-tertiary truncate">
            {event.sportName} · {event.venue}
          </p>
        </div>
      </div>
      {event.goldCountry && (
        <div className="mt-2 pt-2 border-t border-yellow-yellowLight2 dark:border-yellow-yellowDark1/20 flex flex-wrap gap-3 text-xs text-tertiary">
          <span>🥇 {event.goldCountry}</span>
          {event.silverCountry && <span>🥈 {event.silverCountry}</span>}
          {event.bronzeCountry && <span>🥉 {event.bronzeCountry}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Upcoming event row ─── */

function EventRow({ event, now, isNext, index, onPick }) {
  const time = formatEventTime(event.date);
  const relative = formatRelativeTime(new Date(event.date), now);

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors schedule-row-enter ${
        isNext
          ? 'bg-blue-blueLight3 dark:bg-blue-blueDark1/10 border-l-2 border-l-blue-blue'
          : 'hover:bg-surface-raised'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="text-xs font-mono text-muted w-12 flex-shrink-0 tabular-nums">
        {time}
      </span>
      <span className="text-lg flex-shrink-0 w-6 text-center">
        {event.sportIcon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">
          {event.name}
        </p>
        <p className="text-xs text-muted truncate hidden sm:block">
          {event.venue}
        </p>
      </div>
      {onPick && !event.goldCountry && (
        <button
          onClick={(e) => { e.stopPropagation(); onPick(); }}
          className="flex-shrink-0 px-3 py-1 text-xs font-medium text-blue-blue hover:text-white hover:bg-blue-blue border border-blue-blue rounded-md transition-colors"
        >
          Pick
        </button>
      )}
      {relative && (
        <span
          className={`text-xs flex-shrink-0 whitespace-nowrap ${
            isNext
              ? 'px-2 py-0.5 rounded-full bg-blue-blueLight2 dark:bg-blue-blueDark1/20 text-blue-blueDark1 dark:text-blue-blueLight1 font-medium'
              : 'text-tertiary'
          }`}
        >
          {relative}
        </span>
      )}
    </div>
  );
}

/* ─── Recent result row ─── */

function ResultRow({ event, index }) {
  const hasAthletes = event.goldAthlete || event.silverAthlete || event.bronzeAthlete;

  return (
    <div
      className="flex items-start gap-3 py-3 px-3 rounded-md hover:bg-surface-raised transition-colors schedule-row-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="text-lg flex-shrink-0 w-6 text-center mt-0.5">
        {event.sportIcon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{event.name}</p>
        <p className="text-xs text-muted truncate">{event.sportName}</p>
      </div>

      {/* Podium — always visible */}
      <div className="flex-shrink-0 text-xs space-y-1">
        <PodiumLine emoji="🥇" country={event.goldCountry} athlete={hasAthletes ? event.goldAthlete : null} />
        <PodiumLine emoji="🥈" country={event.silverCountry} athlete={hasAthletes ? event.silverAthlete : null} />
        <PodiumLine emoji="🥉" country={event.bronzeCountry} athlete={hasAthletes ? event.bronzeAthlete : null} />
      </div>
    </div>
  );
}

function shortenAthlete(name) {
  if (!name) return null;
  // For team events with many athletes, show first name + count
  const parts = name.split(', ');
  if (parts.length <= 2) return name;
  return `${parts[0]} & ${parts.length - 1} more`;
}

function PodiumLine({ emoji, country, athlete }) {
  if (!country) return null;
  const short = shortenAthlete(athlete);
  return (
    <div className="flex items-baseline gap-1.5">
      <span>{emoji}</span>
      <span className="font-medium w-8">{country}</span>
      {short && <span className="text-muted hidden sm:inline">{short}</span>}
    </div>
  );
}
