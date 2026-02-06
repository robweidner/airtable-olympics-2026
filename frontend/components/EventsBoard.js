/**
 * EventsBoard - 2026 Milano-Cortina medal events grouped by sport
 *
 * Filters to 2026 only (the Events table also contains 2022 Beijing data).
 * Sport cards use an accordion pattern — click to expand and see all events.
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useState, useMemo } from 'react';
import { TABLE_IDS, FIELD_IDS } from '../constants';
import { mapRecordToEvent, mapRecordToSport } from '../helpers';

const SPORT_FIELDS = [
  FIELD_IDS.SPORTS.NAME,
  FIELD_IDS.SPORTS.ICON,
  FIELD_IDS.SPORTS.EVENT_COUNT,
];

const EVENT_FIELDS = [
  FIELD_IDS.EVENTS.NAME,
  FIELD_IDS.EVENTS.SPORT,
  FIELD_IDS.EVENTS.STATUS,
  FIELD_IDS.EVENTS.YEAR,
  FIELD_IDS.EVENTS.GOLD_COUNTRY,
  FIELD_IDS.EVENTS.SILVER_COUNTRY,
  FIELD_IDS.EVENTS.BRONZE_COUNTRY,
];

export function EventsBoard({ onMakeMyPicks }) {
  const base = useBase();

  const sportsTable = base.getTableByIdIfExists(TABLE_IDS.SPORTS);
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);

  const sportsRecords = useRecords(sportsTable, { fields: SPORT_FIELDS });
  const eventsRecords = useRecords(eventsTable, { fields: EVENT_FIELDS });

  const [expandedSportId, setExpandedSportId] = useState(null);

  const handleSportClick = (sportId) => {
    setExpandedSportId(prev => prev === sportId ? null : sportId);
  };

  const { sports, eventsBySport } = useMemo(() => {
    const allEvents = (eventsRecords ?? []).map(mapRecordToEvent);
    const events = allEvents.filter(e => e.year === 2026);

    const eventsBySport = {};
    events.forEach(event => {
      if (!event.sportId) return;
      if (!eventsBySport[event.sportId]) eventsBySport[event.sportId] = [];
      eventsBySport[event.sportId].push(event);
    });

    // Sort events alphabetically within each sport
    Object.values(eventsBySport).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));

    // Only include sports that have 2026 events
    const allSports = (sportsRecords ?? []).map(mapRecordToSport);
    const sports = allSports.filter(s => eventsBySport[s.id]?.length > 0);

    // Sort by filtered 2026 event count (not the all-years rollup)
    sports.sort((a, b) => (eventsBySport[b.id]?.length ?? 0) - (eventsBySport[a.id]?.length ?? 0));

    return { sports, eventsBySport };
  }, [sportsRecords, eventsRecords]);

  if (!sportsTable || !eventsTable) {
    return (
      <section className="py-12 px-4 sm:px-8 bg-surface">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">
            Medal Events
          </h2>
          <p className="text-muted">
            Events and Sports tables not available. Add them to the interface settings.
          </p>
        </div>
      </section>
    );
  }

  const totalEvents = Object.values(eventsBySport).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <section id="events-section" className="py-12 px-4 sm:px-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-primary text-center mb-2">
          {totalEvents} Medal Events
        </h2>
        <p className="text-center text-tertiary mb-6">
          Milano-Cortina 2026 — Pick your podium predictions across {sports.length} sports
        </p>

        {/* Status legend */}
        <div className="flex items-center justify-center gap-4 mb-6 text-xs text-tertiary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-gray300" />
            Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-yellow animate-pulse" />
            Live
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-green" />
            Final
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sports.map(sport => (
            <SportCard
              key={sport.id}
              sport={sport}
              events={eventsBySport[sport.id] ?? []}
              isExpanded={expandedSportId === sport.id}
              onToggle={() => handleSportClick(sport.id)}
              onMakeMyPicks={onMakeMyPicks}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SportCard({ sport, events, isExpanded, onToggle, onMakeMyPicks }) {
  const displayEvents = isExpanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  return (
    <div
      className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
        isExpanded
          ? 'bg-surface border-blue-blue shadow-theme-md col-span-full'
          : 'bg-surface-page border-light hover:border-blue-blueLight1 hover:shadow-theme-sm'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
      }}
      aria-expanded={isExpanded}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{sport.icon || '🏅'}</span>
        <h3 className="font-semibold text-primary truncate">{sport.name}</h3>
        <span className="ml-auto text-xs bg-blue-blueLight2 text-blue-blueDark1 px-2 py-0.5 rounded-full flex-shrink-0">
          {events.length}
        </span>
        <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'text-blue-blue' : 'text-muted'}`}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Event list */}
      <ul className={`space-y-1 text-sm ${isExpanded ? 'columns-1 sm:columns-2 lg:columns-3 gap-x-6' : ''}`}>
        {displayEvents.map(event => (
          <li key={event.id} className="break-inside-avoid">
            <div className="flex items-center gap-2 text-body">
              <StatusDot status={event.status} />
              <span className={isExpanded ? '' : 'truncate'}>{event.name}</span>
            </div>
            {isExpanded && event.goldCountry && (
              <div className="ml-4 mt-0.5 mb-1 text-xs text-tertiary flex flex-wrap gap-x-3">
                <span>🥇 {event.goldCountry}</span>
                {event.silverCountry && <span>🥈 {event.silverCountry}</span>}
                {event.bronzeCountry && <span>🥉 {event.bronzeCountry}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Collapsed: prompt to expand */}
      {!isExpanded && hasMore && (
        <p className="text-blue-blue text-xs pt-2 font-medium hover:text-blue-blueDark1">
          View all {events.length} events ▼
        </p>
      )}

      {/* Expanded: CTA */}
      {isExpanded && onMakeMyPicks && (
        <div className="mt-4 pt-3 border-t border-light">
          <button
            onClick={(e) => { e.stopPropagation(); onMakeMyPicks(); }}
            className="w-full py-2 bg-blue-blue text-white text-sm font-medium rounded-md hover:bg-blue-blueDark1 transition-colors"
          >
            Make My Picks
          </button>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    'Upcoming': 'bg-gray-gray300',
    'Live': 'bg-yellow-yellow animate-pulse',
    'Final': 'bg-green-green',
    'completed': 'bg-green-green',
  };
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || colors.Upcoming}`}
      title={status}
    />
  );
}
