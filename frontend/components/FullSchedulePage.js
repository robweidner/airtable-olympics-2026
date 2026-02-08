/**
 * FullSchedulePage - Chronological event schedule with per-event pick buttons.
 *
 * Groups all 2026 events by date. Past days are collapsed, today is highlighted
 * and auto-scrolled into view, future days are expanded. Each event row shows
 * status, sport, time, and a pick button (or medal results if Final).
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useState, useMemo, useEffect, useRef } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { getStringField, getNumberField, computeEventStatus, getCellValueSafe } from '../helpers';

/* ─── Helpers ──────────────────────────────────────────────── */

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDayHeader(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getDayKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(dayKey) {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dayKey === todayKey;
}

function isPast(dayKey) {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dayKey < todayKey;
}

/* ─── Status dot ───────────────────────────────────────────── */

function StatusDot({ status }) {
  const colors = {
    'Upcoming': 'bg-gray-gray300',
    'Now': 'bg-blue-blue animate-pulse',
    'Live': 'bg-yellow-yellow animate-pulse',
    'Final': 'bg-green-green',
  };
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || colors.Upcoming}`}
      title={status}
    />
  );
}

/* ─── Event row ────────────────────────────────────────────── */

function ScheduleEventRow({ event, onPickEvent, isToday: isTodaySection }) {
  const isFinal = event.status === 'Final';
  const isLive = event.status === 'Live' || event.status === 'Now';
  const canPick = !isFinal && onPickEvent;

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors ${
        isLive
          ? 'bg-yellow-yellowLight3 dark:bg-yellow-yellowDark1/10 border-l-2 border-l-yellow-yellow'
          : isTodaySection && !isFinal
            ? 'bg-blue-blueLight3/50 dark:bg-blue-blueDark1/5'
            : 'hover:bg-surface-raised'
      }`}
    >
      <StatusDot status={event.status} />

      {/* Sport tag */}
      <span className="text-lg flex-shrink-0 w-6 text-center" title={event.sportName}>
        {event.sportIcon}
      </span>

      {/* Event name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{event.name}</p>
        <p className="text-xs text-muted truncate sm:hidden">{event.sportName}</p>
      </div>

      {/* Sport name (desktop) */}
      <span className="hidden sm:block text-xs text-tertiary flex-shrink-0 w-24 truncate">
        {event.sportName}
      </span>

      {/* Time */}
      {event.date && (
        <span className="text-xs font-mono text-muted flex-shrink-0 tabular-nums w-14 text-right">
          {formatTime(event.date)}
        </span>
      )}

      {/* Pick button or medal results */}
      {isFinal ? (
        <div className="flex-shrink-0 flex items-center gap-2 text-xs">
          {event.goldCountry && <span title="Gold">&#129351; {event.goldCountry}</span>}
          {event.silverCountry && <span title="Silver" className="hidden sm:inline">&#129352; {event.silverCountry}</span>}
          {event.bronzeCountry && <span title="Bronze" className="hidden sm:inline">&#129353; {event.bronzeCountry}</span>}
        </div>
      ) : canPick ? (
        <button
          onClick={() => onPickEvent(event.name)}
          className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            isLive || isTodaySection
              ? 'bg-blue-blue text-white hover:bg-blue-blueDark1 shadow-theme-xs hero-btn-glow'
              : 'text-blue-blue hover:text-white hover:bg-blue-blue border border-blue-blue'
          }`}
        >
          {isLive ? 'Pick Now!' : isTodaySection ? 'Pick Now!' : 'Pick'}
        </button>
      ) : null}
    </div>
  );
}

/* ─── Day section ──────────────────────────────────────────── */

function DaySection({ dayKey, dayLabel, events, defaultExpanded, onPickEvent }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isTodaySection = isToday(dayKey);
  const todayRef = useRef(null);

  const finalCount = events.filter(e => e.status === 'Final').length;
  const allFinal = finalCount === events.length;

  // Auto-scroll today's section into view
  useEffect(() => {
    if (isTodaySection && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isTodaySection]);

  return (
    <div ref={isTodaySection ? todayRef : null} className="mb-4">
      {/* Day header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
          isTodaySection
            ? 'bg-blue-blueLight2 dark:bg-blue-blueDark1/20 border-l-4 border-l-blue-blue'
            : 'bg-surface-raised hover:bg-surface-raised/80'
        }`}
      >
        {isTodaySection && (
          <span className="px-2 py-0.5 rounded-full bg-blue-blue text-white text-xs font-bold uppercase tracking-wider">
            Today
          </span>
        )}
        <span className={`font-semibold ${isTodaySection ? 'text-primary' : 'text-secondary'}`}>
          {dayLabel}
        </span>
        <span className="text-xs text-muted">
          {events.length} event{events.length !== 1 ? 's' : ''}
          {allFinal && isPast(dayKey) ? ' \u00B7 All Final' : ''}
        </span>
        <span className={`ml-auto text-xs transition-transform duration-200 ${expanded ? 'text-blue-blue' : 'text-muted'}`}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </button>

      {/* Event rows */}
      {expanded && (
        <div className="mt-1 space-y-0.5">
          {events.map((event) => (
            <ScheduleEventRow
              key={event.id}
              event={event}
              onPickEvent={onPickEvent}
              isToday={isTodaySection}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────── */

export function FullSchedulePage({ onPickEvent, onBack }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const base = useBase();
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);
  const records = useRecords(eventsTable);

  const dayGroups = useMemo(() => {
    if (!records) return [];

    const events = records
      .map((r) => ({
        id: r.id,
        name: getStringField(r, FIELD_IDS.EVENTS.NAME),
        date: getCellValueSafe(r, FIELD_IDS.EVENTS.DATE),
        year: getNumberField(r, FIELD_IDS.EVENTS.YEAR),
        sportIcon: getStringField(r, FIELD_IDS.EVENTS.SPORT_ICON) || '\uD83C\uDFC5',
        sportName: getStringField(r, FIELD_IDS.EVENTS.SPORT_NAME),
        venue: getStringField(r, FIELD_IDS.EVENTS.VENUE),
        goldCountry: getStringField(r, FIELD_IDS.EVENTS.GOLD_COUNTRY) || null,
        silverCountry: getStringField(r, FIELD_IDS.EVENTS.SILVER_COUNTRY) || null,
        bronzeCountry: getStringField(r, FIELD_IDS.EVENTS.BRONZE_COUNTRY) || null,
        status: computeEventStatus(
          getCellValueSafe(r, FIELD_IDS.EVENTS.DATE),
          getStringField(r, FIELD_IDS.EVENTS.GOLD_COUNTRY)
        ),
      }))
      .filter((e) => e.year === 2026 && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by calendar day
    const groups = [];
    let currentDayKey = null;

    for (const event of events) {
      const dayKey = getDayKey(event.date);
      if (dayKey !== currentDayKey) {
        groups.push({
          dayKey,
          dayLabel: formatDayHeader(event.date),
          events: [],
        });
        currentDayKey = dayKey;
      }
      groups[groups.length - 1].events.push(event);
    }

    return groups;
  }, [records]);

  const totalEvents = dayGroups.reduce((sum, g) => sum + g.events.length, 0);
  const finalEvents = dayGroups.reduce(
    (sum, g) => sum + g.events.filter((e) => e.status === 'Final').length,
    0
  );

  if (!eventsTable) return null;

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Header */}
      <div className="px-4 sm:px-8 pt-6 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-blue-blue hover:text-blue-blueDark1 font-medium transition-colors mb-4"
        >
          <span>&larr;</span> Back to Home
        </button>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary mb-3">
          Full Event Schedule
        </h1>
        <p className="text-base text-secondary max-w-2xl leading-relaxed">
          Think you can call it? Browse all {totalEvents} medal events and pick your podium predictions
          before events go live. Nail the exact position for 3 points, or earn 2 if your country medals
          in a different spot. Let&apos;s see what you&apos;ve got.
        </p>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-4 text-sm text-tertiary">
          <span>{finalEvents} of {totalEvents} events final</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-gray300" /> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-blue animate-pulse" /> Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-yellow animate-pulse" /> Live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-green" /> Final
            </span>
          </div>
        </div>
      </div>

      {/* Day sections */}
      <div className="px-4 sm:px-8 pb-12">
        {dayGroups.map((group) => (
          <DaySection
            key={group.dayKey}
            dayKey={group.dayKey}
            dayLabel={group.dayLabel}
            events={group.events}
            defaultExpanded={!isPast(group.dayKey)}
            onPickEvent={onPickEvent}
          />
        ))}

        {dayGroups.length === 0 && (
          <p className="text-center text-muted py-12">
            No 2026 events found. Add events to the Events table to see the schedule.
          </p>
        )}
      </div>
    </div>
  );
}
