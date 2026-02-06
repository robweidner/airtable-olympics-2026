/**
 * EventsBoard - All 116 medal events grouped by 16 sports
 */
import { useBase, useRecords } from '@airtable/blocks/interface/ui';
import { useMemo } from 'react';
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
];

export function EventsBoard() {
  const base = useBase();

  const sportsTable = base.getTableByIdIfExists(TABLE_IDS.SPORTS);
  const eventsTable = base.getTableByIdIfExists(TABLE_IDS.EVENTS);

  const sportsRecords = useRecords(sportsTable, { fields: SPORT_FIELDS });
  const eventsRecords = useRecords(eventsTable, { fields: EVENT_FIELDS });

  const { sports, eventsBySport } = useMemo(() => {
    const sports = (sportsRecords ?? []).map(mapRecordToSport);
    const events = (eventsRecords ?? []).map(mapRecordToEvent);

    const eventsBySport = {};
    events.forEach(event => {
      if (!event.sportId) return;
      if (!eventsBySport[event.sportId]) eventsBySport[event.sportId] = [];
      eventsBySport[event.sportId].push(event);
    });

    // Sort sports by event count descending
    sports.sort((a, b) => b.eventCount - a.eventCount);

    return { sports, eventsBySport };
  }, [sportsRecords, eventsRecords]);

  if (!sportsTable || !eventsTable) {
    return (
      <section className="py-12 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-gray-gray800 mb-4">
            Medal Events
          </h2>
          <p className="text-gray-gray400">
            Events and Sports tables not available. Add them to the interface settings.
          </p>
        </div>
      </section>
    );
  }

  const totalEvents = Object.values(eventsBySport).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <section id="events-section" className="py-12 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-gray-gray800 text-center mb-2">
          {totalEvents} Medal Events
        </h2>
        <p className="text-center text-gray-gray500 mb-8">
          Pick your podium predictions across {sports.length} sports
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sports.map(sport => (
            <SportCard
              key={sport.id}
              sport={sport}
              events={eventsBySport[sport.id] ?? []}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SportCard({ sport, events }) {
  return (
    <div className="bg-gray-gray50 rounded-lg p-4 border border-gray-gray100 hover:border-blue-blueLight1 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{sport.icon || '🏅'}</span>
        <h3 className="font-semibold text-gray-gray800 truncate">{sport.name}</h3>
        <span className="ml-auto text-xs bg-blue-blueLight2 text-blue-blueDark1 px-2 py-0.5 rounded-full flex-shrink-0">
          {events.length}
        </span>
      </div>
      <ul className="space-y-1 text-sm">
        {events.slice(0, 5).map(event => (
          <li key={event.id} className="flex items-center gap-2 text-gray-gray600">
            <StatusDot status={event.status} />
            <span className="truncate">{event.name}</span>
          </li>
        ))}
        {events.length > 5 && (
          <li className="text-gray-gray400 text-xs pt-1">
            +{events.length - 5} more events
          </li>
        )}
      </ul>
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
